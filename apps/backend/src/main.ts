import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import compression from 'compression';
import helmet from 'helmet';
import * as dns from 'dns';
import { httpLoggerMiddleware } from './common/middleware/http-logger.middleware';
import { decryptionMiddleware } from './common/middleware/decryption.middleware';
import { EncryptionInterceptor } from './common/interceptors/encryption.interceptor';
import { EncryptionExceptionFilter } from './common/filters/encryption-exception.filter';

dns.setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalInterceptors(new EncryptionInterceptor());
  app.useGlobalFilters(new EncryptionExceptionFilter());

  // ── Security Headers (Helmet) ────────────────────────────────────
  app.use(
    helmet({
      // Allow cross-origin requests from the frontend (CORS handles this)
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      // Disable COOP on API to avoid interfering with OAuth popups (Google Sign-In)
      crossOriginOpenerPolicy: false,
      // HSTS: enforce HTTPS for 1 year, include subdomains
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    }),
  );

  const defaultOrigins: (string | RegExp)[] = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/,
  ];
  const allowedOrigins: (string | RegExp)[] = [...defaultOrigins];

  if (process.env.CLIENT_URL) {
    process.env.CLIENT_URL.split(',').forEach((url) => {
      const trimmed = url.trim().replace(/\/$/, '');
      if (trimmed && !allowedOrigins.includes(trimmed)) {
        allowedOrigins.push(trimmed);
      }
    });
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Encrypted-Payload',
      'X-Encrypt-Payload',
      'X-Response-Encrypted',
    ],
    exposedHeaders: ['X-Encrypted-Response'],
  });
  app.use(compression());
  app.use(cookieParser());
  app.use(httpLoggerMiddleware);
  // Keep payload limit small to prevent DoS — only image-upload routes need higher limits
  // and those should use multipart/form-data with dedicated middleware, not JSON base64
  app.use(json({ limit: '2mb' }));
  app.use(urlencoded({ limit: '2mb', extended: true }));
  app.use(decryptionMiddleware);
  const port = process.env.PORT ?? 3100;
  await app.listen(port);
  logger.log(
    `🚀 NutriCore API running on port ${port} [${process.env.NODE_ENV ?? 'development'}]`,
  );
}
void bootstrap();
