import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common';

const logger = new Logger('HTTP');

export function httpLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { method, originalUrl, ip } = req;
  const start = Date.now();

  res.on('finish', () => {
    const { statusCode } = res;
    const duration = Date.now() - start;
    const message = `${method} ${originalUrl} ${statusCode} +${duration}ms [${ip || '::1'}]`;

    if (statusCode >= 500) {
      logger.error(message);
    } else if (statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.log(message);
    }
  });

  next();
}
