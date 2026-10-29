import { Request, Response, NextFunction } from 'express';
import { decryptPayload } from '../utils/payload-crypto.util';

export async function decryptionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (
      req.body &&
      typeof req.body === 'object' &&
      typeof req.body._enc === 'string'
    ) {
      const decrypted = await decryptPayload(req.body._enc);
      req.body = decrypted;
      (req as any)._isEncryptedPayload = true;
    }
    next();
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: 'Invalid or corrupt encrypted payload',
    });
  }
}

