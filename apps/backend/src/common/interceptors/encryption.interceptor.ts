import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { encryptPayload } from '../utils/payload-crypto.util';

interface EncryptedRequest extends Request {
  _isEncryptedPayload?: boolean;
}

@Injectable()
export class EncryptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<EncryptedRequest>();
    const res = http.getResponse<Response>();

    const shouldEncrypt =
      req.headers['x-encrypted-payload'] === '1' ||
      req.headers['x-encrypt-payload'] === '1' ||
      Boolean(req._isEncryptedPayload);

    return next.handle().pipe(
      switchMap(async (data: unknown): Promise<unknown> => {
        if (!shouldEncrypt) {
          return data;
        }

        // Do not alter empty responses, streams or binary buffers
        if (data === undefined || Buffer.isBuffer(data)) {
          return data;
        }

        try {
          const encrypted = await encryptPayload(data);
          res.setHeader('X-Encrypted-Response', '1');
          return { _enc: encrypted };
        } catch {
          return data;
        }
      }),
    );
  }
}
