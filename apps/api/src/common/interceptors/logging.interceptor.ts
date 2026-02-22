import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();
        const { method, url, ip } = request;
        const userAgent = request.get('user-agent') || '';
        const startTime = Date.now();

        return next.handle().pipe(
            tap(() => {
                const { statusCode } = response;
                const duration = Date.now() - startTime;
                const contentLength = response.get('content-length') || 0;

                this.logger.log(
                    `${method} ${url} ${statusCode} ${duration}ms ${contentLength}B — ${ip} "${userAgent}"`,
                );

                // Slow request warning (> 3 seconds)
                if (duration > 3000) {
                    this.logger.warn(
                        `⚠️ Slow request: ${method} ${url} took ${duration}ms`,
                    );
                }
            }),
        );
    }
}
