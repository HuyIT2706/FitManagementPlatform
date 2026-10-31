import { Test, TestingModule } from '@nestjs/testing';
import { PtService } from './pt.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BadRequestException } from '@nestjs/common';

describe('PtService - Student Invitation & Binding Guards', () => {
  let service: PtService;
  let prismaMock: any;
  let notificationsServiceMock: any;

  beforeEach(async () => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      studentProfile: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn().mockResolvedValue({ id: 'sp-1' }),
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest.fn(),
      },
      memberPackage: {
        findFirst: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 'mp-1' }),
      },
      gymPackage: {
        findFirst: jest.fn().mockResolvedValue({ id: 'gp-1' }),
        create: jest.fn(),
      },
      workoutSchedule: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      attendanceHistory: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    notificationsServiceMock = {
      sendNotification: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PtService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: NotificationsService, useValue: notificationsServiceMock },
      ],
    }).compile();

    service = module.get<PtService>(PtService);
  });

  describe('sendStudentInvite', () => {
    const ptId = 'pt-123';

    it('should throw BadRequestException if PT tries to invite themselves', async () => {
      prismaMock.user.findFirst.mockResolvedValue({
        id: ptId,
        email: 'pt@test.com',
        fullName: 'Coach Huy',
        role: 'PT',
      });

      await expect(
        service.sendStudentInvite(ptId, {
          studentEmail: 'pt@test.com',
          packageName: 'Gói VIP',
          totalSessions: 12,
          remainingSessions: 12,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if user is a PT or ADMIN', async () => {
      prismaMock.user.findFirst.mockResolvedValue({
        id: 'other-user',
        email: 'admin@test.com',
        fullName: 'Admin User',
        role: 'ADMIN',
      });

      await expect(
        service.sendStudentInvite(ptId, {
          studentEmail: 'admin@test.com',
          packageName: 'Gói VIP',
          totalSessions: 12,
          remainingSessions: 12,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if user already has an APPROVED PT', async () => {
      prismaMock.user.findFirst.mockResolvedValue({
        id: 'student-1',
        email: 'student@test.com',
        fullName: 'Nguyen Van A',
        role: 'USER',
      });

      prismaMock.studentProfile.findFirst.mockResolvedValue({
        id: 'sp-active',
        studentId: 'student-1',
        trainerId: 'other-pt',
        status: 'APPROVED',
        trainer: {
          id: 'other-pt',
          fullName: 'Coach Nam',
          email: 'nam@test.com',
        },
      });

      await expect(
        service.sendStudentInvite(ptId, {
          studentEmail: 'student@test.com',
          packageName: 'Gói VIP',
          totalSessions: 12,
          remainingSessions: 12,
        }),
      ).rejects.toThrow(/hiện đã có Huấn luyện viên phụ trách/);
    });

    it('should throw BadRequestException if user already has an active package with remaining sessions', async () => {
      prismaMock.user.findFirst.mockResolvedValue({
        id: 'student-1',
        email: 'student@test.com',
        fullName: 'Nguyen Van A',
        role: 'USER',
      });

      prismaMock.studentProfile.findFirst.mockResolvedValue(null);
      prismaMock.memberPackage.findFirst.mockResolvedValue({
        id: 'mp-1',
        userId: 'student-1',
        isActive: true,
        remainingSessions: 5,
        endDate: new Date(Date.now() + 10000000),
        gymPackage: { title: 'Gói Platinum' },
      });

      await expect(
        service.sendStudentInvite(ptId, {
          studentEmail: 'student@test.com',
          packageName: 'Gói VIP',
          totalSessions: 12,
          remainingSessions: 12,
        }),
      ).rejects.toThrow(/hiện đang có gói tập còn hiệu lực/);
    });

    it('should succeed and link student if user exists with no PT and no active package', async () => {
      prismaMock.user.findFirst.mockResolvedValue({
        id: 'student-1',
        email: 'student@test.com',
        fullName: 'Nguyen Van A',
        role: 'USER',
      });

      prismaMock.studentProfile.findFirst.mockResolvedValue(null);
      prismaMock.memberPackage.findFirst.mockResolvedValue(null);

      const res = await service.sendStudentInvite(ptId, {
        studentEmail: 'student@test.com',
        packageName: 'Gói VIP 1:1',
        totalSessions: 12,
        remainingSessions: 12,
      });

      expect(res.success).toBe(true);
      expect(res.inviteCode).toMatch(/^INV-/);
      expect(prismaMock.studentProfile.upsert).toHaveBeenCalled();
      expect(prismaMock.memberPackage.create).toHaveBeenCalled();
    });

    it('should create invite link if user does not exist in DB yet', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);

      const res = await service.sendStudentInvite(ptId, {
        studentEmail: 'unregistered@test.com',
        packageName: 'Gói VIP 1:1',
        totalSessions: 12,
        remainingSessions: 12,
      });

      expect(res.success).toBe(true);
      expect(res.inviteCode).toMatch(/^INV-/);
      expect(prismaMock.studentProfile.upsert).not.toHaveBeenCalled();
    });
  });

  describe('bindPtByStudent', () => {
    const studentId = 'student-1';
    const ptId = 'pt-123';

    it('should throw BadRequestException if student already has another APPROVED PT', async () => {
      prismaMock.user.findFirst.mockResolvedValue({
        id: ptId,
        fullName: 'Coach Nam',
        role: 'PT',
      });

      prismaMock.studentProfile.findUnique.mockResolvedValue(null); // not with this PT
      prismaMock.studentProfile.findFirst.mockResolvedValue({
        id: 'sp-other',
        studentId,
        status: 'APPROVED',
        trainerId: 'pt-other',
        trainer: { fullName: 'Coach Dung' },
      });

      await expect(
        service.bindPtByStudent(studentId, {
          ptCodeOrInviteCode: 'PT-NAM123',
        }),
      ).rejects.toThrow(/hiện đang có Huấn Luyện Viên phụ trách/);
    });

    it('should throw BadRequestException if student already has an active package with remaining sessions', async () => {
      prismaMock.user.findFirst.mockResolvedValue({
        id: ptId,
        fullName: 'Coach Nam',
        role: 'PT',
      });

      prismaMock.studentProfile.findUnique.mockResolvedValue(null);
      prismaMock.studentProfile.findFirst.mockResolvedValue(null);
      prismaMock.memberPackage.findFirst.mockResolvedValue({
        id: 'mp-active',
        isActive: true,
        remainingSessions: 8,
        gymPackage: { title: 'Gói Gold' },
      });

      await expect(
        service.bindPtByStudent(studentId, {
          ptCodeOrInviteCode: 'PT-NAM123',
        }),
      ).rejects.toThrow(/đang có gói tập còn hiệu lực/);
    });
  });
});
