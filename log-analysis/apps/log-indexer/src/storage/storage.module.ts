import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@shared/shared-lib/db/db.module';
import { StorageController } from './storage.controller';

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [StorageService],
  controllers: [StorageController],
  exports: [StorageService, StorageModule],
})
export class StorageModule {}
