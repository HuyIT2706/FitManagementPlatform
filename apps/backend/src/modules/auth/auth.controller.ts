import { Body, Controller, Post, HttpCode, HttpStatus, Res, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import { JwtGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() signInDto: Record<string, any>,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, user } = await this.authService.login(signInDto.email, signInDto.password);
    this.setRefreshTokenCookie(res, refresh_token);
    return { access_token, user };
  }

  @HttpCode(HttpStatus.OK)
  @Post('google')
  async googleAuth(
    @Body() googleDto: { token: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, user } = await this.authService.googleLogin(googleDto.token);
    this.setRefreshTokenCookie(res, refresh_token);
    return { access_token, user };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      res.status(HttpStatus.FORBIDDEN).send({ message: 'Access Denied' });
      return;
    }

    // Attempt to parse sub from the JWT directly or pass it to service
    // Actually, we need userId. We can decode the token to get userId, or require client to send it.
    // It's better to decode the token. Let's let the JwtService handle it, but wait, the JwtGuard is not applied.
    // I will extract the userId from the payload inside the controller.
    const jwtPayload = JSON.parse(Buffer.from(refreshToken.split('.')[1], 'base64').toString());
    const userId = jwtPayload.sub;

    const tokens = await this.authService.refreshTokens(userId, refreshToken);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    return { access_token: tokens.accessToken };
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user.sub;
    await this.authService.logout(userId);
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }
}
