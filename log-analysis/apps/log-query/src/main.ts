import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AllExceptionsFilter } from '@shared/shared-lib/middleware/filters/exception.filter';
import { LoggingInterceptor } from '@shared/shared-lib/middleware/interceptors/logging.interceptor';
import { QueryModule } from './query/query.module';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';

  const app = await NestFactory.create(QueryModule, {
    logger: isProduction
      ? ['error', 'warn']
      : ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(process.env.QUERY_SERVICE_TCP_PORT ?? 3004);
}
bootstrap();
