import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { logger } from '../logger/seq.logger';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;
    const start = Date.now();
    const userId = (req as any).user?.id || (req as any).user?.sub || null;
    const logContext = (req as any).logContext || {};

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const ms = Date.now() - start;
        const statusCode = response?.statusCode;
        logger.info({ method, url, ms, statusCode, userId, ...logContext }, 'HTTP Request');
      }),
    );
  }
}


