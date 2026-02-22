import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface ErrorResponse {
    statusCode: number;
    message: string | string[];
    error: string;
    requestId: string;
    timestamp: string;
    path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const requestId = (request.headers['x-request-id'] as string) || uuidv4();

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

            // Log full error details for internal errors
            this.logger.error(
                `Unhandled exception: ${exception instanceof Error ? exception.message : String(exception)}`,
                exception instanceof Error ? exception.stack : undefined,
            );
        }

        const errorResponse: ErrorResponse = {
            statusCode: status,
            message,
            error,
            requestId,
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        // Log the error (non-5xx at warn level, 5xx at error level)
        if (status >= 500) {
            this.logger.error(
                `[${requestId}] ${request.method} ${request.url} → ${status}`,
                JSON.stringify(errorResponse),
            );
        } else {
            this.logger.warn(
                `[${requestId}] ${request.method} ${request.url} → ${status}: ${JSON.stringify(message)}`,
            );
        }

        response.status(status).json(errorResponse);
    }
}
