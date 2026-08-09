/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unused-vars */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

// const client = new OAuth2Client(
//   process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
// );

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    if (!email || !pass) {
      throw new UnauthorizedException('Email and password required');
    }
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        onboardingCompleted: user.onboardingCompleted,
      },
    };
  }

  async googleLogin(token: string) {
    if (!token) throw new UnauthorizedException('Token required');
    try {
      const googleResponse = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const payload = await googleResponse.json();
      if (!googleResponse.ok || !payload || !payload.email)
        throw new UnauthorizedException('Invalid Google Token');

      const email = payload.email;
      let user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        // Create new user for Google login
        user = await this.prisma.user.create({
          data: {
            email: email,
            fullName: payload.name || 'Google User',
            passwordHash: '',
            avatarUrl: payload.picture,
          },
        });
      }

      const jwtPayload = { sub: user.id, email: user.email, role: user.role };
      return {
        access_token: await this.jwtService.signAsync(jwtPayload),
        user: {
          id: user.id,
          email: user.email,
          name: user.fullName,
          avatar: user.avatarUrl,
          onboardingCompleted: user.onboardingCompleted,
        },
      };
    } catch (e) {
      console.error(e);
      throw new UnauthorizedException('Google authentication failed');
    }
  }
}
