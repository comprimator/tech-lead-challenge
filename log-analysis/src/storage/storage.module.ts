import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../db/db.module';

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
