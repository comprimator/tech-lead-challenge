import { Inject, Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { INDEX_PREFIX } from '../db/db.const';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @Inject('ELASTIC_CONNECTION')
    private readonly esClient: ElasticsearchService,
  ) {}

  async storeLog(logEntry: any): Promise<void> {
    try {
      await this.esClient.index({
        index: `${INDEX_PREFIX}-${new Date().toISOString().split('T')[0]}`,
        document: logEntry,
      });
      this.logger.log('Log stored successfully', JSON.stringify(logEntry));
    } catch (error) {
      this.logger.error('Error storing log:', error);
      // TODO Handle the error appropriately
    }
  }
}
