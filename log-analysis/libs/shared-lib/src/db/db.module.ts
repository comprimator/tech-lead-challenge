import { Module, Global } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  ElasticsearchModule,
  ElasticsearchService,
} from '@nestjs/elasticsearch';
import { DB_NAME } from '@shared/shared-lib/db/db.const';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get('ELASTICSEARCH_NODE'),
        auth: {
          username: configService.get('ELASTICSEARCH_USERNAME'),
          password: configService.get('ELASTICSEARCH_PASSWORD'),
        },
        tls: {
          rejectUnauthorized: false,
        },
      }),
    }),
  ],
  providers: [
    {
      provide: 'DB_NAME',
      useValue: DB_NAME,
    },
    {
      provide: 'ELASTIC_CONNECTION',
      useExisting: ElasticsearchService,
    },
    {
      provide: 'DATABASE_CONNECTION',
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const uri = config.get<string>('MONGO_URI');
        const client = new MongoClient(uri, {
          auth: {
            username: config.get<string>('MONGO_USERNAME'),
            password: config.get<string>('MONGO_PASSWORD'),
          },
          authSource: 'admin',
        });
        await client.connect();
        return client;
      },
    },
  ],
  exports: ['DATABASE_CONNECTION', 'ELASTIC_CONNECTION', 'DB_NAME'],
})
export class DatabaseModule {}
