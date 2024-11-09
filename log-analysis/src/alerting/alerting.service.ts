import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Subject } from 'rxjs';
import { NotificationService } from '../notification/notification.service';
import { AlertRule } from './alerting.interface';
import { NotificationChannel } from '../notification/notification.interface';
import { Collection, MongoClient, ObjectId } from 'mongodb';

@Injectable()
export class AlertingService implements OnModuleInit, OnModuleDestroy {
  private alertRules: Map<string, AlertRule> = new Map();
  private logSubject = new Subject<any>();
  private readonly logger = new Logger(this.constructor.name);
  private alertRulesCollection: Collection<AlertRule>;

  constructor(
    @Inject('DATABASE_CONNECTION') private readonly dbClient: MongoClient,
    private readonly notificationService: NotificationService,
  ) {
    this.logSubject.subscribe((log) => this.evaluateLog(log));
  }

  async onModuleInit() {
    const db = this.dbClient.db('log_analysis');
    this.alertRulesCollection = db.collection<AlertRule>('alertRules');
    const allAlertRules = await this.alertRulesCollection.find().toArray();
    allAlertRules.forEach((alertRule) => {
      this.addAlertRule(alertRule);
    });
  }

  async onModuleDestroy() {
    await this.dbClient.close();
  }

  async findAll() {
    return await this.alertRulesCollection.find().toArray();
  }

  async create(alertRule: AlertRule) {
    const result = await this.alertRulesCollection.insertOne(alertRule);
    this.addAlertRule({ ...alertRule, _id: result.insertedId });
    return result;
  }

  async update(id: string, alertRule: AlertRule) {
    await this.alertRulesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: alertRule },
    );

    const updatedAlertRule = await this.alertRulesCollection.findOne({
      _id: new ObjectId(id),
    });
    this.updateAlertRule(updatedAlertRule);
  }

  addAlertRule(alertRule: AlertRule) {
    this.alertRules.set(alertRule._id.toString(), alertRule);
    this.logger.debug(`Added alert rule: ${alertRule.name}`);
  }

  async delete(id: string) {
    await this.alertRulesCollection.deleteOne({ _id: new ObjectId(id) });
    this.removeAlertRule(id);
  }

  removeAlertRule(alertRuleId: string) {
    this.alertRules.delete(alertRuleId);
    this.logger.debug(`Removed alert rule: ${alertRuleId}`);
  }

  updateAlertRule(alertRule: AlertRule) {
    this.alertRules.set(alertRule._id.toString(), alertRule);
    this.logger.debug(`Updated alert rule: ${alertRule.name}`);
  }

  handleLog(log: any) {
    this.logSubject.next(log);
  }

  private async evaluateLog(log: any) {
    for (const alertRule of this.alertRules.values()) {
      if (!alertRule.enabled) continue;

      if (this.matchConditions(log, alertRule.conditions)) {
        await this.triggerAlert(log, alertRule);
        this.logger.debug(
          `Triggered alert for rule: ${alertRule.name}, conditions: ${JSON.stringify(alertRule.conditions)}`,
        );
      }
    }
  }

  private matchConditions(log: any, conditions: any[]): boolean {
    return conditions.every((condition) => {
      const fieldValue = log[condition.field];
      if (fieldValue === undefined) return false;

      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'contains':
          return fieldValue.includes(condition.value);
        case 'matches':
          return new RegExp(condition.value).test(fieldValue);
        case 'greaterThan':
          return fieldValue > condition.value;
        case 'lessThan':
          return fieldValue < condition.value;
        default:
          return false;
      }
    });
  }

  private async triggerAlert(log: any, alertRule: AlertRule) {
    this.logger.debug(`Triggering alert for rule: ${alertRule.name}`);
    this.logger.verbose(`Log: ${JSON.stringify(log)}`);
    for (const channel of alertRule.notificationChannels) {
      await this.notificationService.sendNotification(
        channel as NotificationChannel,
        `Alert triggered for rule: ${alertRule.name}, log: ${JSON.stringify(log)}`,
      );
    }
  }
}
