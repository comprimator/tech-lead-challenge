import { NestFactory } from '@nestjs/core';
import { AlertingModule } from './alerting/alerting.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AlertingModule);
  const port = process.env.ALERTING_SERVICE_TCP_PORT ?? 3001;
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      retryAttempts: 5,
      retryDelay: 3000,
      port: Number(port),
    },
  });

  await app.startAllMicroservices();
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
