import { Module, Global, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppLoggerService } from './logger.service';
import { RequestLoggerMiddleware } from './request-logger.middleware';

/**
 * Logger Module
 *
 * Provides the AppLoggerService globally to all modules.
 * Applies the RequestLoggerMiddleware to all routes for
 * automatic request correlation and structured logging.
 */
@Global()
@Module({
  providers: [AppLoggerService],
  exports: [AppLoggerService],
})
export class LoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
