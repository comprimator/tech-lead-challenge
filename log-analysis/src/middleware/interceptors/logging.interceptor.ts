import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;

    const now = Date.now();

    this.logger.verbose(`Incoming Request: ${method} ${url}`);
    this.logger.debug(`Request Body: ${JSON.stringify(body)}`);

    return next
      .handle()
      .pipe(
        tap((data) =>
          this.logger.verbose(
            `Outgoing Response: ${method} ${url} - ${Date.now() - now}ms`,
          ),
        ),
      );
  }
}
