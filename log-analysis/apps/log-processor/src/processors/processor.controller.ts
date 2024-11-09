import { Controller } from '@nestjs/common';
import { ProcessorService } from './processor.service';
import { EventPattern } from '@nestjs/microservices';

@Controller('processor')
export class ProcessorController {
  constructor(private readonly processorService: ProcessorService) {}

  @EventPattern('process_log_entry')
  async processLogEntry(logEntry: { logData: any; source: string }) {
    const { logData, source } = logEntry;
    await this.processorService.process(logData, source);
  }
}
