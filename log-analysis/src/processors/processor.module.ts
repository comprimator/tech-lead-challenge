import { Module } from '@nestjs/common';
import { ProcessorService } from './processor.service';
import { StorageModule } from '../storage/storage.module';
import { AlertingModule } from '../alerting/alerting.module';

@Module({
  imports: [StorageModule, AlertingModule],
  providers: [ProcessorService],
  exports: [ProcessorService],
})
export class ProcessorModule {}
