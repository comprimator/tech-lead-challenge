import { Module } from '@nestjs/common';
import { AlertingService } from './alerting.service';
import { AlertingController } from './alerting.controller';
import { NotificationModule } from '../notification/notification.module';
import { DatabaseModule } from '@shared/shared-lib/db/db.module';

@Module({
  imports: [NotificationModule, DatabaseModule],
  controllers: [AlertingController],
  providers: [AlertingService],
  exports: [AlertingService],
})
export class AlertingModule {}
