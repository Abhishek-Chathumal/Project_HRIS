import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';
import { AppLoggerService, sanitize } from '../logger';

/**
 * Logging Interceptor
 *
 * Uses Pino structured logging via AppLoggerService.
 * Logs request bodies (sanitized) in debug mode, response timing,
 * and error details. Works with the per-request child logger
 * attached by RequestLoggerMiddleware.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger;

  constructor(private readonly appLogger: AppLoggerService) {
    this.logger = this.appLogger.child('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const { method, url, body } = request;
    const handler = context.getHandler().name;
    const controller = context.getClass().name;
    const startTime = Date.now();

    // Use the per-request logger if available, otherwise fall back
    const reqLog = (request as any).log || this.logger;

    // Log request body in debug mode (sanitized)
    if (body && Object.keys(body).length > 0) {
      reqLog.debug(
        { phase: 'request-body', controller, handler, body: sanitize(body) },
        `Request body for ${method} ${url}`,
      );
    }

    return next.handle().pipe(
      tap((responseData) => {
        const duration = Date.now() - startTime;

        reqLog.info(
          {
            phase: 'handler-complete',
            controller,
            handler,
            duration,
          },
          `${controller}.${handler}() → ${duration}ms`,
        );

        // Log response shape (not full payload) in debug
        if (responseData !== undefined) {
          const responseShape = Array.isArray(responseData)
            ? { type: 'array', count: responseData.length }
            : typeof responseData === 'object' && responseData !== null
              ? { type: 'object', keys: Object.keys(responseData).slice(0, 10) }
              : { type: typeof responseData };

          reqLog.debug(
            { phase: 'response-shape', responseShape },
            `Response shape: ${JSON.stringify(responseShape)}`,
          );
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        reqLog.error(
          {
            phase: 'handler-error',
            controller,
            handler,
            duration,
            error: {
              name: error.name,
              message: error.message,
              status: error.status || error.statusCode,
            },
          },
          `${controller}.${handler}() ERROR after ${duration}ms: ${error.message}`,
        );
        throw error;
      }),
    );
  }
}
