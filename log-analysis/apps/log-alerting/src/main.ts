import { NestFactory } from '@nestjs/core';
import { AlertingModule } from './alerting/alerting.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AlertingModule);

  const config = new DocumentBuilder().setTitle('Log Alerting').build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const listPort = process.env.ALERTING_SERVICE_LISTEN_PORT ?? 3006;
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      retryAttempts: 5,
      retryDelay: 3000,
      host: process.env.ALERTING_SERVICE_TCP_HOST ?? 'localhost',
      port: Number(process.env.ALERTING_SERVICE_TCP_PORT ?? 3002),
    },
  });

  await app.startAllMicroservices();
  await app.listen(listPort);
}
bootstrap();
