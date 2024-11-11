import { Inject, Injectable, Logger } from '@nestjs/common';
import { ProcessedLogEntry, RawLogEntry } from './processor.interface';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ProcessorService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @Inject('ALERTING_SERVICE') private readonly alertingClient: ClientProxy,
    @Inject('INDEXER_SERVICE') private readonly indexerClient: ClientProxy,
  ) {}

  async process(logData: string, source: string): Promise<void> {
    try {
      const rawLog: RawLogEntry = this.parseRawLog(logData);
      const processedLog: ProcessedLogEntry = this.enrichLog(rawLog, source);
      this.logger.verbose(`Processed log`, processedLog);

      this.indexerClient.emit('index_log', processedLog);
      this.logger.debug(`Emitted log to indexer`);

      this.alertingClient.emit('log_item_received', processedLog);
      this.logger.debug(`Emitted log to alerting service`);
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
