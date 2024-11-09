import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { ProcessedLogEntry, RawLogEntry } from './processor.interface';
import { AlertingService } from '../alerting/alerting.service';

@Injectable()
export class ProcessorService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly alertingService: AlertingService,
  ) {}

  async process(logData: string, source: string): Promise<void> {
    try {
      const rawLog: RawLogEntry = this.parseRawLog(logData);
      const processedLog: ProcessedLogEntry = this.enrichLog(rawLog, source);
      this.logger.debug(`Processed log: ${JSON.stringify(processedLog)}`);
      await this.storageService.storeLog(processedLog);
      this.alertingService.handleLog(processedLog);
    } catch (error) {
      this.logger.error('Error processing log:', error);
      // TODO: Handle error appropriately
    }
  }

  private parseRawLog(logData: string): RawLogEntry {
    try {
      return JSON.parse(logData);
    } catch (error: unknown) {
      if (error instanceof SyntaxError) {
        return { message: logData };
      } else {
        this.logger.warn('Cannot parse log:', logData, error);
      }
    }
  }

  private enrichLog(rawLog: RawLogEntry, source: string): ProcessedLogEntry {
    return {
      ...rawLog,
      source,
      timestamp: rawLog.timestamp || new Date().toISOString(),
      // TODO: Add additional fields
    };
  }
}
