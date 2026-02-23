import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AppLoggerService } from './logger.service';

/**
 * Request Correlation Middleware
 *
 * Assigns a unique request ID to every incoming request and creates
 * a child Pino logger with the request context. The logger is attached
 * to `req.log` for use by downstream handlers, interceptors, and guards.
 *
 * Also logs the request start and completion with timing.
 */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger;

  constructor(private readonly appLogger: AppLoggerService) {
    this.logger = this.appLogger.child('RequestLogger');
  }

  use(req: Request, res: Response, next: NextFunction): void {
    // Use existing X-Request-Id or generate a new one
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();
    const startTime = Date.now();

    // Attach request ID to headers (for downstream services)
    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);

    // Create a child logger with request context
    const reqLogger = this.appLogger.instance.child({
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent')?.substring(0, 100) || 'unknown',
    });

    // Attach logger to request for downstream access
    (req as any).log = reqLogger;
    (req as any).requestId = requestId;
    (req as any).startTime = startTime;

    // Log request start
    reqLogger.info({ phase: 'request-start' }, `→ ${req.method} ${req.originalUrl || req.url}`);

    // Log response on finish
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      const logData = {
        phase: 'request-end',
        statusCode,
        duration,
        contentLength: res.get('content-length') || 0,
      };

      if (statusCode >= 500) {
        reqLogger.error(
          logData,
          `← ${statusCode} ${req.method} ${req.originalUrl} [${duration}ms]`,
        );
      } else if (statusCode >= 400) {
        reqLogger.warn(logData, `← ${statusCode} ${req.method} ${req.originalUrl} [${duration}ms]`);
      } else {
        reqLogger.info(logData, `← ${statusCode} ${req.method} ${req.originalUrl} [${duration}ms]`);
      }

      // Slow request alert (> 3s)
      if (duration > 3000) {
        reqLogger.warn(
          { phase: 'slow-request', duration, threshold: 3000 },
          `⚠️ Slow request: ${req.method} ${req.originalUrl} took ${duration}ms`,
        );
      }
    });

    next();
  }
}
