import { Module } from '@nestjs/common';
import { QueryService } from './query.service';
import { QueryController } from './query.controller';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@shared/shared-lib/db/db.module';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule],
  controllers: [QueryController],
  providers: [QueryService, QueryController],
  exports: [QueryService, QueryController],
})
export class QueryModule {}
