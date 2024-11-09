import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { StorageService } from './storage.service';

@Controller('indexer')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @EventPattern('index_log')
  async storeLog(logEntry: any): Promise<void> {
    await this.storageService.storeLog(logEntry);
  }
}
