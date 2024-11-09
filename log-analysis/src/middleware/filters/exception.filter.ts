import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(this.constructor.name);
  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.error('An error occurred:', exception);
    super.catch(exception, host);
  }
}
