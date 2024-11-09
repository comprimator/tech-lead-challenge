import { Module } from '@nestjs/common';
import { IngestorService } from './ingestor.service';
import { DatabaseModule } from '../db/db.module';
import { IngestorController } from './ingestor.controller';
import { ProcessorModule } from '../processors/processor.module';

@Module({
  imports: [DatabaseModule, ProcessorModule],
  providers: [IngestorService, IngestorController],
  exports: [IngestorController, IngestorService],
})
export class IngestorModule {}
