import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import compression from 'compression';
import * as dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  app.use(compression());
  app.use(cookieParser());
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  await app.listen(process.env.PORT ?? 3100);
}
void bootstrap();
