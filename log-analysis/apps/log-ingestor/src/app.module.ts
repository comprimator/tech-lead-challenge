import { Module } from '@nestjs/common';
import { IngestorModule } from './ingestors/ingestor.module';
import { IngestorController } from './ingestors/ingestor.controller';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), IngestorModule],
  controllers: [IngestorController],
  providers: [ClientsModule],
  exports: [ClientsModule],
})
export class AppModule {}
