import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import * as bcrypt from 'bcryptjs';

export class RegisterDto {
  email!: string;
  password!: string;
  fullName!: string;
  avatarUrl?: string;
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
    private notificationsService: NotificationsService,
  ) {}

  async getTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '30d',
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
          avatarUrl: dto.avatarUrl || undefined,
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

    if (isPtRegister) {
      try {
        const admins = await this.prisma.user.findMany({
          where: { role: 'ADMIN' },
          select: { id: true },
        });

        const ptName = user.fullName || user.email;
        for (const admin of admins) {
          await this.notificationsService.sendNotification({
            userId: admin.id,
            title: 'Đơn Đăng Ký HLV Mới',
            message: `HLV ${ptName} vừa gửi hồ sơ ứng tuyển, vui lòng vào duyệt.`,
            type: 'PT_APPLICATION',
            linkUrl: '/admin/CoachReview',
          });
        }
      } catch (err) {
        console.error('Failed to notify admins of new PT application:', err);
      }
    }

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
        avatarUrl: user.avatarUrl,
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

  async googleLogin(
    token: string,
    clientUserInfo?: { email?: string; name?: string; picture?: string },
  ) {
    if (!token) {
      throw new UnauthorizedException('Google access token is required');
    }
    try {
      let payload: {
        email?: string;
        name?: string;
        picture?: string;
      } | null = null;

      try {
        const googleResponse = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (googleResponse.ok) {
          payload = (await googleResponse.json()) as {
            email?: string;
            name?: string;
            picture?: string;
          };
        }
      } catch (fetchErr) {
        console.warn('Backend fetch to Google userinfo failed:', fetchErr);
      }

      // STRICT SECURITY: Never trust unverified clientUserInfo for email/identity
      if (!payload || !payload.email) {
        throw new UnauthorizedException(
          'Xác thực Google thất bại: Token không hợp lệ hoặc đã hết hạn',
        );
      }

      const email = payload.email.toLowerCase().trim();
      let user = await this.prisma.user.findUnique({
        where: { email },
        include: { ptApplication: true },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email: email,
            fullName: payload.name || clientUserInfo?.name || 'Google User',
            passwordHash: '',
            avatarUrl: payload.picture || clientUserInfo?.picture,
          },
          include: { ptApplication: true },
        });
      }

      const isPendingPt =
        user.role === 'PT' && user.ptApplication?.status === 'PENDING';
      const isApprovedPt =
        user.role === 'PT' ? user.ptApplication?.status === 'APPROVED' : true;

      const tokens = await this.getTokens(user.id, user.email, user.role);
      await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        isPendingPtApproval: isPendingPt,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          name: user.fullName,
          avatar: user.avatarUrl,
          role: user.role,
          isApprovedPt,
          isPendingPtApproval: isPendingPt,
          onboardingCompleted: user.onboardingCompleted,
        },
      };
    } catch (e) {
      console.error('Google authentication error:', e);
      throw new UnauthorizedException(
        e instanceof Error ? e.message : 'Google authentication failed',
      );
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

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại!');
    }

    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
      if (!isMatch) {
        throw new BadRequestException('Mật khẩu hiện tại không chính xác!');
      }
    }

    const hashedPassword = await bcrypt.hash(newPass, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    return {
      message: user.passwordHash
        ? 'Đổi mật khẩu thành công!'
        : 'Thiết lập mật khẩu mới thành công!',
    };
  }
}
