import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getPtApplications(status?: string) {
    const whereCondition =
      status && status !== 'ALL'
        ? { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' }
        : {};

    const applications = await this.prisma.ptApplication.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            role: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return applications.map((app) => ({
      id: app.id,
      userId: app.userId,
      fullName: app.user.fullName,
      email: app.user.email,
      phone: app.user.phone || undefined,
      avatarUrl: app.user.avatarUrl || undefined,
      experienceYears: app.experienceYears,
      specialties: app.specialties,
      certificateUrl: app.certificateUrl || undefined,
      bio: app.bio || undefined,
      status: app.status,
      adminNote: app.adminNote || undefined,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    }));
  }

  async approvePtApplication(id: string, adminNote?: string) {
    const app = await this.prisma.ptApplication.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!app) {
      throw new NotFoundException('Không tìm thấy đơn đăng ký PT');
    }

    const updatedApp = await this.prisma.ptApplication.update({
      where: { id },
      data: {
        status: 'APPROVED',
        adminNote: adminNote || 'Đã phê duyệt hồ sơ HLV PT thành công',
      },
    });

    await this.prisma.user.update({
      where: { id: app.userId },
      data: {
        role: 'PT',
      },
    });

    return {
      success: true,
      applicationId: id,
      userId: app.userId,
      message: `Đã phê duyệt đơn và nâng cấp quyền PT cho tài khoản ${app.user.fullName} thành công!`,
      application: updatedApp,
    };
  }

  async rejectPtApplication(id: string, adminNote?: string) {
    const app = await this.prisma.ptApplication.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!app) {
      throw new NotFoundException('Không tìm thấy đơn đăng ký PT');
    }

    const updatedApp = await this.prisma.ptApplication.update({
      where: { id },
      data: {
        status: 'REJECTED',
        adminNote:
          adminNote || 'Hồ sơ chưa đạt đủ điều kiện chứng chỉ chuyên môn',
      },
    });

    return {
      success: true,
      applicationId: id,
      message: `Đã từ chối đơn đăng ký PT của ứng viên ${app.user.fullName}`,
      application: updatedApp,
    };
  }

  async getAdminStats() {
    const [totalUsers, totalPts, pendingApps, approvedApps, rejectedApps] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { role: 'PT' } }),
        this.prisma.ptApplication.count({ where: { status: 'PENDING' } }),
        this.prisma.ptApplication.count({ where: { status: 'APPROVED' } }),
        this.prisma.ptApplication.count({ where: { status: 'REJECTED' } }),
      ]);

    return {
      totalUsers,
      totalPts,
      pendingApps,
      approvedApps,
      rejectedApps,
    };
  }
}
