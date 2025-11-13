import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const userAgent = request.get('user-agent') || '';
    const correlationId = request.headers['x-correlation-id'] as string || uuidv4();

    // Set correlation ID in response headers
    response.set('X-Correlation-Id', correlationId);

    const now = Date.now();
    const { method, url, ip } = request;

    console.log(`${correlationId} - ${ip} - ${method} ${url} - ${userAgent} - ${response.statusCode}`);

    return next
      .handle()
      .pipe(
        tap(() => {
          console.log(`${correlationId} - ${method} ${url} - ${Date.now() - now}ms`);
        }),
      );
  }
}
