import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
  Logger,
} from '@nestjs/common';
import { MongoClient, Collection, ObjectId } from 'mongodb';
import * as path from 'path';
import { ModuleWhitelist } from './module-whitelist';
import { IIngestor, IngestorConfig } from './ingestor.interface';
import { ClientProxy } from '@nestjs/microservices';
import { DB_NAME } from '@shared/shared-lib/db/db.const';

@Injectable()
export class IngestorService implements OnModuleInit, OnModuleDestroy {
  private ingestors: Map<string, IIngestor> = new Map();
  private ingestorCollection: Collection<IngestorConfig>;
  private logger = new Logger(this.constructor.name);

  constructor(
    @Inject('DATABASE_CONNECTION') private readonly dbClient: MongoClient,
    @Inject('PROCESSOR_SERVICE') private readonly processorClient: ClientProxy,
  ) {}

  async onModuleInit() {
    const db = this.dbClient.db(DB_NAME);
    this.ingestorCollection = db.collection<IngestorConfig>('ingestors');
    await this.startAll();
  }

  async onModuleDestroy() {
    await this.stopAll();
    await this.dbClient.close();
  }

  async getAll({ enabled = true }: { enabled?: boolean } = {}) {
    return await this.ingestorCollection.find({ enabled }).toArray();
  }

  async getOne(id: string) {
    return await this.ingestorCollection.findOne({ _id: new ObjectId(id) });
  }

  async createAndStart(ingestor: IngestorConfig) {
    const result = await this.ingestorCollection.insertOne(ingestor);
    await this.addOrUpdateIngestor({ ...ingestor, _id: result.insertedId });
    return { ...ingestor, _id: result.insertedId };
  }

  async updateAndRestart(id: string, ingestorConfig: IngestorConfig) {
    await this.ingestorCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: ingestorConfig },
    );
    await this.addOrUpdateIngestor({
      ...ingestorConfig,
      _id: new ObjectId(id),
    });
  }

  async deleteAndStop(id: string) {
    await this.ingestorCollection.deleteOne({ _id: new ObjectId(id) });
    await this.stopIngester(id);
  }

  async startIngestor(config: IngestorConfig) {
    const modulePath = ModuleWhitelist[config.type];
    if (!modulePath) {
      this.logger.error(`Ingestor type ${config.type} is not allowed`);
      return;
    }

    const fullModulePath = path.join(__dirname, 'impl', modulePath);
    const { [config.type]: IngestorClass } = await import(fullModulePath);

    const ingestor: IIngestor = new IngestorClass(config.options || {});

    try {
      await ingestor.initialize();
    } catch (error) {
      this.logger.error(`Error initializing ingestor ${config.name}:`, error);
      return;
    }

    ingestor.on('log', (logData) => {
      this.logger.verbose(`Received log from ${config.name}: ${logData}`);
      this.processorClient.emit('process_log_entry', {
        logData,
        source: config.name,
      });
      this.logger.debug(`Sent log to processor`);
    });

    await ingestor.start();

    return ingestor;
  }

  private async addOrUpdateIngestor(config: IngestorConfig) {
    const ingestorKey = config._id.toString();
    const existingIngestor = this.ingestors.get(ingestorKey);

    if (existingIngestor) {
      await existingIngestor.stop();
      this.ingestors.delete(ingestorKey);
    }

    if (config.enabled) {
      const ingestor = await this.startIngestor(config);
      this.ingestors.set(ingestorKey, ingestor);
    }
  }

  async stopIngester(id: string) {
    const ingestor = this.ingestors.get(id);
    if (ingestor) {
      await ingestor.stop();
      this.ingestors.delete(id);
    }
  }

  async startAll() {
    const configs = await this.getAll({ enabled: true });

    for (const config of configs) {
      await this.addOrUpdateIngestor(config);
    }
  }

  async stopAll() {
    for (const ingestor of this.ingestors.values()) {
      await ingestor.stop();
    }
    this.ingestors.clear();
  }
}
