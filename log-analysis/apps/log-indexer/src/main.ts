import { NestFactory } from '@nestjs/core';
import { StorageModule } from './storage/storage.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as process from 'node:process';

async function bootstrap() {
  const port = Number(process.env.INDEXER_SERVICE_TCP_PORT ?? 3002);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    StorageModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.INDEXER_SERVICE_TCP_HOST ?? 'localhost',
        port: port,
        retryAttempts: 5,
        retryDelay: 3000,
      },
    },
  );

  await app.listen();
}
bootstrap();
