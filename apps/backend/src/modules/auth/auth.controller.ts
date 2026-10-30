import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService, RegisterDto } from './auth.service';
import type { Response, Request } from 'express';
import { JwtGuard } from './jwt.guard';
import type { RequestWithUser } from '@repo/types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    const isProd =
      process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  private clearRefreshTokenCookie(res: Response) {
    const isProd =
      process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
    });
  }

  // Strict rate limit on registration: 5 attempts / minute
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    this.setRefreshTokenCookie(res, result.refresh_token);
    return {
      access_token: result.access_token,
      isPendingPtApproval: result.isPendingPtApproval,
      message: result.message,
      user: result.user,
    };
  }

  // Strict rate limit on login: 10 attempts / minute per IP
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() signInDto: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, isPendingPtApproval, user } =
      await this.authService.login(signInDto.email, signInDto.password);
    this.setRefreshTokenCookie(res, refresh_token);
    return { access_token, isPendingPtApproval, user };
  }

  // Strict rate limit on Google OAuth: 10 attempts / minute
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('google')
  async googleAuth(
    @Body()
    googleDto: {
      token: string;
      userInfo?: { email?: string; name?: string; picture?: string };
    },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, user, isPendingPtApproval } =
      await this.authService.googleLogin(googleDto.token, googleDto.userInfo);
    this.setRefreshTokenCookie(res, refresh_token);
    return { access_token, user, isPendingPtApproval };
  }

  // Refresh is called automatically by axios interceptor — skip global throttle
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookieRt = (req.cookies as Record<string, string> | undefined)
      ?.refresh_token;
    const bodyRt = (req.body as { refresh_token?: string } | undefined)
      ?.refresh_token;
    const headerRt = req.headers['x-refresh-token'] as string | undefined;
    const refreshToken = cookieRt || bodyRt || headerRt;

    if (!refreshToken || typeof refreshToken !== 'string') {
      res.status(HttpStatus.FORBIDDEN).send({ message: 'Access Denied' });
      return;
    }

    try {
      const parts = refreshToken.split('.');
      if (parts.length < 2 || !parts[1]) {
        res.status(HttpStatus.FORBIDDEN).send({ message: 'Access Denied' });
        return;
      }
      const jwtPayload = JSON.parse(
        Buffer.from(parts[1], 'base64').toString(),
      ) as { sub: string };
      const userId = jwtPayload.sub;

      const tokens = await this.authService.refreshTokens(userId, refreshToken);
      this.setRefreshTokenCookie(res, tokens.refreshToken);
      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      };
    } catch {
      res.status(HttpStatus.FORBIDDEN).send({ message: 'Access Denied' });
      return;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    let userId: string | null = null;

    // 1. Try to extract userId from Bearer token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token && token.includes('.')) {
        try {
          const payload = JSON.parse(
            Buffer.from(token.split('.')[1], 'base64').toString(),
          ) as { sub?: string };
          if (payload?.sub) {
            userId = payload.sub;
          }
        } catch {
          // Ignore parse errors
        }
      }
    }

    // 2. Fallback to extracting userId from refresh_token cookie
    if (!userId) {
      const cookieRt = (req.cookies as Record<string, string> | undefined)
        ?.refresh_token;
      const bodyRt = (req.body as { refresh_token?: string } | undefined)
        ?.refresh_token;
      const headerRt = req.headers['x-refresh-token'] as string | undefined;
      const refreshToken = cookieRt || bodyRt || headerRt;

      if (refreshToken && refreshToken.includes('.')) {
        try {
          const payload = JSON.parse(
            Buffer.from(refreshToken.split('.')[1], 'base64').toString(),
          ) as { sub?: string };
          if (payload?.sub) {
            userId = payload.sub;
          }
        } catch {
          // Ignore parse errors
        }
      }
    }

    // 3. Clear database refresh token hash for this user
    if (userId) {
      await this.authService.logout(userId);
    }

    // 4. Always clear refresh_token cookie from browser
    this.clearRefreshTokenCookie(res);

    return { message: 'Đăng xuất thành công' };
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  async changePassword(
    @Req() req: RequestWithUser,
    @Body() dto: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(
      req.user.sub,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('sync-session')
  async syncSession(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.syncSession(req.user.sub);
    this.setRefreshTokenCookie(res, result.refresh_token);
    return {
      access_token: result.access_token,
      isPendingPtApproval: result.isPendingPtApproval,
      user: result.user,
    };
  }
}
