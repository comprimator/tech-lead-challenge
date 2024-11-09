import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as process from 'node:process';
import { ProcessorModule } from './processors/processor.module';

async function bootstrap() {
  const port = Number(process.env.PROCESSOR_SERVICE_TCP_PORT ?? 3001);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ProcessorModule,
    {
      transport: Transport.TCP,
      options: {
        port: port,
        retryAttempts: 5,
        retryDelay: 3000,
      },
    },
  );

  await app.listen();
}
bootstrap();
