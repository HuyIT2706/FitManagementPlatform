import { Request, Response, NextFunction } from 'express';
import { decryptPayload } from '../utils/payload-crypto.util';

interface EncryptedBody {
  _enc?: unknown;
}

interface EncryptedRequest extends Request {
  _isEncryptedPayload?: boolean;
}

export async function decryptionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> {
  try {
    const body = req.body as EncryptedBody | undefined;
    if (body && typeof body === 'object' && typeof body._enc === 'string') {
      const decrypted = await decryptPayload(body._enc);
      req.body = decrypted;
      const encReq = req as EncryptedRequest;
      encReq._isEncryptedPayload = true;
    }
    return next();
  } catch {
    return res.status(400).json({
      statusCode: 400,
      message: 'Invalid or corrupt encrypted payload',
    });
  }
}
