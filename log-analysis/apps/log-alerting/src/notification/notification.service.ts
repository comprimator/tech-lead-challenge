import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel } from './notification.interface';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(this.constructor.name);

  constructor() {}

  async sendNotification(channel: NotificationChannel, message: string) {
    switch (channel.type) {
      case 'email':
        this.logger.log(
          `Sending email notification to ${channel?.config.to}. Message: ${message}`,
        );
        // TODO: Implement email notification
        break;
      case 'slack':
        this.logger.log(
          `Sending Slack notification to ${channel?.config?.url}. Message: ${message}`,
        );
        //TODO: Implement Slack notification
        break;
      case 'webhook':
        this.logger.log(
          `Sending webhook notification to ${channel?.config?.url}. Message: ${message}`,
        );
        // TODO: Implement webhook notification
        break;
      default:
        // TODO Handle unsupported notification channel type
        this.logger.error(
          `Unsupported notification channel type: ${channel.type}`,
        );
    }
  }
}
