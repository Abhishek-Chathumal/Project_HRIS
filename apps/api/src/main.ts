import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AppLoggerService } from './common/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // ── Pino Logger ─────────────────────────────
  const logger = app.get(AppLoggerService);
  app.useLogger(logger);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('API_PORT', 3001);
  const appUrl = configService.get<string>('APP_URL', 'http://localhost:3000');

  // ── Security ────────────────────────────────
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  app.enableCors({
    origin: [appUrl],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  });

  // ── API Versioning ──────────────────────────
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  // ── Global Pipes ────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ── Swagger / OpenAPI ───────────────────────
  // (Interceptors & Filters are DI-registered in AppModule)
  if (configService.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Project HRIS API')
      .setDescription('Industrial-Level Human Resource Information System API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication & Authorization')
      .addTag('employees', 'Employee Management')
      .addTag('attendance', 'Attendance & Time Tracking')
      .addTag('leave', 'Leave Management')
      .addTag('payroll', 'Payroll Processing')
      .addTag('recruitment', 'Recruitment & Onboarding')
      .addTag('performance', 'Performance Management')
      .addTag('training', 'Training & Development')
      .addTag('policies', 'Policy Management')
      .addTag('health', 'System Health & Diagnostics')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  // ── Graceful Shutdown ───────────────────────
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`🚀 HRIS API running on http://localhost:${port}`, 'Bootstrap');
  logger.log(`📚 Swagger docs at http://localhost:${port}/api/docs`, 'Bootstrap');
}

bootstrap();
