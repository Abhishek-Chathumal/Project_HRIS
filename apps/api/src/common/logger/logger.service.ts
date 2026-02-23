import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import pino, { Logger } from 'pino';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// ──────────────────────────────────────────────────
// Sensitive field masking for request/response bodies
// ──────────────────────────────────────────────────
const SENSITIVE_FIELDS = new Set([
  'password',
  'passwordConfirm',
  'currentPassword',
  'newPassword',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'authorization',
  'cookie',
  'ssn',
  'nationalId',
  'bankAccount',
  'creditCard',
  'cvv',
  'pin',
  'bindPassword',
]);

export function sanitize(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
      result[key] = '***REDACTED***';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitize(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ──────────────────────────────────────────────────
// Pino Logger Service — NestJS compatible
// ──────────────────────────────────────────────────
@Injectable()
export class AppLoggerService implements NestLoggerService {
  private readonly pino: Logger;

  constructor() {
    const isProd = process.env.NODE_ENV === 'production';
    const logDir = join(process.cwd(), 'logs');

    // Ensure log directory exists
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }

    const targets: pino.TransportTargetOptions[] = [];

    if (isProd) {
      // Production: JSON to stdout (for container log aggregators)
      targets.push({
        target: 'pino/file',
        options: { destination: 1 }, // stdout
        level: 'info',
      });
      // Production: file transport for persistent logs
      targets.push({
        target: 'pino/file',
        options: { destination: join(logDir, 'app.log') },
        level: 'info',
      });
      // Error-only file
      targets.push({
        target: 'pino/file',
        options: { destination: join(logDir, 'error.log') },
        level: 'error',
      });
    } else {
      // Development: pretty-print to stdout
      targets.push({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss.l',
          ignore: 'pid,hostname',
          singleLine: false,
        },
        level: 'debug',
      });
    }

    this.pino = pino(
      {
        level: isProd ? 'info' : 'debug',
        timestamp: pino.stdTimeFunctions.isoTime,
        serializers: {
          err: pino.stdSerializers.err,
          req: (req) => ({
            method: req.method,
            url: req.url,
            remoteAddress: req.remoteAddress,
          }),
          res: (res) => ({
            statusCode: res.statusCode,
          }),
        },
        base: {
          service: 'hris-api',
          version: process.env.npm_package_version || '0.1.0',
        },
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            '*.password',
            '*.token',
            '*.secret',
          ],
          censor: '***REDACTED***',
        },
      },
      pino.transport({ targets }),
    );
  }

  /** Get the raw Pino instance for advanced usage */
  get instance(): Logger {
    return this.pino;
  }

  /** Create a child logger scoped to a specific module/context */
  child(context: string): Logger {
    return this.pino.child({ context });
  }

  // ── NestJS LoggerService Interface ──────────
  log(message: string, context?: string): void {
    this.pino.info({ context }, message);
  }

  error(message: string, trace?: string, context?: string): void {
    this.pino.error({ context, trace }, message);
  }

  warn(message: string, context?: string): void {
    this.pino.warn({ context }, message);
  }

  debug(message: string, context?: string): void {
    this.pino.debug({ context }, message);
  }

  verbose(message: string, context?: string): void {
    this.pino.trace({ context }, message);
  }

  fatal(message: string, context?: string): void {
    this.pino.fatal({ context }, message);
  }
}
