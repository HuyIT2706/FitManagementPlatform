import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { encryptPayload } from '../utils/payload-crypto.util';

interface EncryptedRequest extends Request {
  _isEncryptedPayload?: boolean;
}

@Catch()
export class EncryptionExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(EncryptionExceptionFilter.name);

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<EncryptedRequest>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse: unknown =
      exception instanceof HttpException
        ? exception.getResponse()
        : {
            statusCode: status,
            message:
              exception instanceof Error
                ? exception.message
                : 'Internal server error',
          };

    const errorBody: unknown =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? exceptionResponse
        : { statusCode: status, message: String(exceptionResponse) };

    if (status >= 500) {
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const shouldEncrypt =
      request.headers['x-encrypted-payload'] === '1' ||
      request.headers['x-encrypt-payload'] === '1' ||
      Boolean(request._isEncryptedPayload);

    if (shouldEncrypt) {
      try {
        const encrypted = await encryptPayload(errorBody);
        response.setHeader('X-Encrypted-Response', '1');
        return response.status(status).json({ _enc: encrypted });
      } catch (err) {
        this.logger.error('Failed to encrypt error response body', err);
        return response.status(status).json(errorBody);
      }
    }

    return response.status(status).json(errorBody);
  }
}
