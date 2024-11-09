import { Module } from '@nestjs/common';
import { IngestorModule } from './ingestors/ingestor.module';
import { IngestorController } from './ingestors/ingestor.controller';
import { ConfigModule } from '@nestjs/config';
import { QueryController } from './query/query.controller';
import { QueryModule } from './query/query.module';

@Module({
  imports: [ConfigModule.forRoot(), IngestorModule, QueryModule],
  controllers: [IngestorController, QueryController],
  providers: [],
})
export class AppModule {}
