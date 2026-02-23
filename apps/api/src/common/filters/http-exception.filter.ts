import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AppLoggerService } from '../logger';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  requestId: string;
  timestamp: string;
  path: string;
}

/**
 * Global Exception Filter
 *
 * Catches all exceptions and returns a standardized error response.
 * Uses Pino structured logging for error diagnostics with request
 * correlation via the per-request child logger.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger;

  constructor(private readonly appLogger: AppLoggerService) {
    this.logger = this.appLogger.child('ExceptionFilter');
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId =
      (request as any).requestId || (request.headers['x-request-id'] as string) || uuidv4();

    // Use per-request logger if available
    const reqLog = (request as any).log || this.logger;

    let status: number;
    let message: string | string[];
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const res = exceptionResponse as Record<string, unknown>;
        message = (res.message as string | string[]) || exception.message;
        error = (res.error as string) || HttpStatus[status] || 'Error';
      } else {
        message = exception.message;
        error = HttpStatus[status] || 'Error';
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred';
      error = 'Internal Server Error';
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error,
      requestId,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Structured error logging with appropriate severity
    const logPayload = {
      phase: 'exception',
      requestId,
      statusCode: status,
      error,
      path: request.url,
      method: request.method,
      ...(exception instanceof Error && {
        errorName: exception.name,
        errorMessage: exception.message,
      }),
    };

    if (status >= 500) {
      reqLog.error(
        {
          ...logPayload,
          stack: exception instanceof Error ? exception.stack : undefined,
        },
        `[${requestId}] ${request.method} ${request.url} → ${status} ${error}`,
      );
    } else if (status >= 400) {
      reqLog.warn(
        logPayload,
        `[${requestId}] ${request.method} ${request.url} → ${status}: ${JSON.stringify(message)}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
