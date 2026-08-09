import type { Request } from 'express';
import type { JwtPayloadUser } from '@repo/types';

export type { JwtPayloadUser };

export interface RequestWithUser extends Request {
  user: JwtPayloadUser;
}
