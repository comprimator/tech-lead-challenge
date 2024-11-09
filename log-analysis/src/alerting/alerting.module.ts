import { Module } from '@nestjs/common';
import { AlertingService } from './alerting.service';
import { AlertingController } from './alerting.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [AlertingController],
  providers: [AlertingService],
  exports: [AlertingService],
})
export class AlertingModule {}
