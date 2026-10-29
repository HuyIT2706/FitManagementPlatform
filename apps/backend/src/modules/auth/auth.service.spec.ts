import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from '../notifications/notifications.service';
import {
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: any;
  let jwtServiceMock: any;
  let notificationsServiceMock: any;

  beforeEach(async () => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      ptApplication: {
        create: jest.fn(),
      },
      $transaction: jest.fn((cb: (tx: unknown) => unknown) =>
        Promise.resolve(cb(prismaMock)),
      ),
    };

    jwtServiceMock = {
      signAsync: jest.fn().mockResolvedValue('mock_jwt_token'),
    };

    notificationsServiceMock = {
      sendNotification: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: NotificationsService, useValue: notificationsServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('getTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const tokens = await service.getTokens('u1', 'user@nutricore.vn', 'USER');
      expect(tokens).toEqual({
        accessToken: 'mock_jwt_token',
        refreshToken: 'mock_jwt_token',
      });
      expect(jwtServiceMock.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('register', () => {
    it('should throw ConflictException if email is already taken', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'existing_id',
        email: 'test@nutricore.vn',
      });

      await expect(
        service.register({
          email: 'test@nutricore.vn',
          password: 'Password123!',
          fullName: 'Test User',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should successfully register a standard user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'new_user_id',
        email: 'new@nutricore.vn',
        fullName: 'New User',
        role: 'USER',
        avatarUrl: null,
        onboardingCompleted: false,
      });
      prismaMock.user.update.mockResolvedValue({});

      const result = await service.register({
        email: 'new@nutricore.vn',
        password: 'Password123!',
        fullName: 'New User',
      });

      expect(result.access_token).toBe('mock_jwt_token');
      expect(result.refresh_token).toBe('mock_jwt_token');
      expect(result.isPendingPtApproval).toBe(false);
      expect(result.user.email).toBe('new@nutricore.vn');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if credentials are empty', async () => {
      await expect(service.login('', '')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login('notfound@nutricore.vn', 'pass'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPass', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user_id',
        email: 'user@nutricore.vn',
        passwordHash: hashedPassword,
        role: 'USER',
      });

      await expect(
        service.login('user@nutricore.vn', 'WrongPass'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens on valid credentials', async () => {
      const rawPassword = 'ValidPassword123';
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user_123',
        email: 'user@nutricore.vn',
        fullName: 'Valid User',
        passwordHash: hashedPassword,
        role: 'USER',
        onboardingCompleted: true,
      });
      prismaMock.user.update.mockResolvedValue({});

      const result = await service.login('user@nutricore.vn', rawPassword);

      expect(result.access_token).toBe('mock_jwt_token');
      expect(result.refresh_token).toBe('mock_jwt_token');
      expect(result.user.email).toBe('user@nutricore.vn');
    });
  });

  describe('logout', () => {
    it('should clear refresh token hash in db', async () => {
      prismaMock.user.updateMany.mockResolvedValue({ count: 1 });
      await service.logout('user_123');
      expect(prismaMock.user.updateMany).toHaveBeenCalledWith({
        where: { id: 'user_123', refreshTokenHash: { not: null } },
        data: { refreshTokenHash: null },
      });
    });
  });

  describe('refreshTokens', () => {
    it('should throw ForbiddenException if user or refreshTokenHash does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(service.refreshTokens('user_123', 'token')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException if refresh token does not match hash', async () => {
      const validHash = await bcrypt.hash('other_token', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user_123',
        refreshTokenHash: validHash,
      });

      await expect(
        service.refreshTokens('user_123', 'wrong_token'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should issue new tokens if refresh token is valid', async () => {
      const validToken = 'my_refresh_token';
      const validHash = await bcrypt.hash(validToken, 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user_123',
        email: 'user@nutricore.vn',
        role: 'USER',
        refreshTokenHash: validHash,
      });
      prismaMock.user.update.mockResolvedValue({});

      const result = await service.refreshTokens('user_123', validToken);
      expect(result.accessToken).toBe('mock_jwt_token');
      expect(result.refreshToken).toBe('mock_jwt_token');
    });
  });
});
