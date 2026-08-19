/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

export class RegisterDto {
  email!: string;
  password!: string;
  fullName!: string;
  role?: 'USER' | 'PT';
  experienceYears?: number;
  specialties?: string[];
  certificateUrl?: string;
  bio?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }

  async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hash },
    });
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email này đã được sử dụng!');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const isPtRegister = dto.role === 'PT';

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          fullName: dto.fullName,
          passwordHash,
          role: isPtRegister ? 'PT' : 'USER',
        },
      });

      if (isPtRegister) {
        await tx.ptApplication.create({
          data: {
            userId: newUser.id,
            experienceYears: dto.experienceYears
              ? Number(dto.experienceYears)
              : 1,
            specialties: dto.specialties || ['Fitness', 'Tăng cơ'],
            certificateUrl: dto.certificateUrl || undefined,
            bio: dto.bio || undefined,
            status: 'PENDING',
          },
        });
      }

      return newUser;
    });

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      isPendingPtApproval: isPtRegister,
      message: isPtRegister
        ? 'Tài khoản Huấn luyện viên PT đã được đăng ký và đang chờ Admin phê duyệt trước khi truy cập hệ thống!'
        : 'Đăng ký tài khoản thành công!',
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
      },
    };
  }

  async login(email: string, pass: string) {
    if (!email || !pass) {
      throw new UnauthorizedException('Vui lòng nhập Email và Mật khẩu');
    }
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { ptApplication: true },
    });
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }
    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const isPendingPt =
      user.role === 'PT' && user.ptApplication?.status === 'PENDING';

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      isPendingPtApproval: isPendingPt,
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role,
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
        user = await this.prisma.user.create({
          data: {
            email: email,
            fullName: payload.name || 'Google User',
            passwordHash: '',
            avatarUrl: payload.picture,
          },
        });
      }

      const tokens = await this.getTokens(user.id, user.email, user.role);
      await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.fullName,
          avatar: user.avatarUrl,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
        },
      };
    } catch (e) {
      console.error(e);
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  async logout(userId: string) {
    await this.prisma.user.updateMany({
      where: { id: userId, refreshTokenHash: { not: null } },
      data: { refreshTokenHash: null },
    });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.refreshTokenHash) {
      throw new ForbiddenException('Access Denied');
    }

    const rtMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!rtMatches) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);
    return tokens;
  }
}
