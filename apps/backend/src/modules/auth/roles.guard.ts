import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

interface AuthenticatedRequest {
  user?: {
    sub?: string;
    email?: string;
    role?: Role;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    if (!user || !user.sub) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập tài nguyên này',
      );
    }

    // Real-time Role Verification from Supabase Database:
    // When role is updated directly in Supabase (PostgreSQL), this ensures
    // the new role is respected IMMEDIATELY without waiting for JWT token expiration!
    let liveRole = user.role;
    try {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.sub },
        select: { role: true },
      });
      if (dbUser?.role) {
        liveRole = dbUser.role;
        user.role = dbUser.role; // sync back to request object
      }
    } catch {
      // Fallback to token payload role if DB lookup encounters issues
    }

    if (!liveRole) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập tài nguyên này',
      );
    }

    const hasRole = requiredRoles.includes(liveRole);
    if (!hasRole) {
      throw new ForbiddenException(
        `Yêu cầu quyền ${requiredRoles.join(' hoặc ')} để thực hiện hành động này`,
      );
    }

    return true;
  }
}
