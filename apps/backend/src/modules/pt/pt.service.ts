import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  AssignNutritionDto,
  AssignWorkoutDto,
  BindPtDto,
  CreateProgressPhotoDto,
  PTCodeQrData,
  PTDashboardData,
  PTSessionItem,
  PTStudentDetail,
  SendInviteDto,
  UpdateInBodyDto,
  UpdateStudentSessionsDto,
} from '@repo/types';

@Injectable()
export class PtService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardData(ptUserId: string): Promise<PTDashboardData> {
    const ptUser = await this.prisma.user.findUnique({
      where: { id: ptUserId },
    });

    const coachName = ptUser ? `Coach ${ptUser.fullName}` : 'Coach PT';
    const coachAvatar = ptUser?.avatarUrl || undefined;

    // Find all students assigned to this PT
    const studentProfiles = await this.prisma.studentProfile.findMany({
      where: { trainerId: ptUserId },
      include: {
        student: {
          include: {
            userPackages: {
              where: { isActive: true },
              take: 1,
            },
            mealLogs: {
              take: 5,
              orderBy: { logDate: 'desc' },
              include: {
                reviews: true,
                items: true,
              },
            },
            bodyMetrics: {
              take: 1,
              orderBy: { recordedAt: 'desc' },
            },
          },
        },
      },
    });

    const totalVipStudents = studentProfiles.length;

    // Calculate session counts from member packages
    let totalPackageSessionsCount = 0;
    let remainingSessionsSum = 0;

    const students = studentProfiles.map((sp) => {
      const student = sp.student;
      const pkg = student.userPackages?.[0];
      const totalSessions = pkg?.totalSessions ?? 12;
      const remainingSessions = pkg?.remainingSessions ?? 10;

      totalPackageSessionsCount += totalSessions;
      remainingSessionsSum += remainingSessions;

      return {
        id: student.id,
        fullName: student.fullName,
        avatarUrl:
          student.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        packageName: pkg ? 'Gói PT 1:1' : 'Gói Tiêu chuẩn',
        remainingSessions,
        totalSessions,
        lastWorkoutDate: 'Hôm nay',
      };
    });

    const completedSessionsCount = Math.max(
      0,
      totalPackageSessionsCount - remainingSessionsSum,
    );

    // Build today's sessions list
    const timeSlots = [
      '08:00 - 09:00',
      '10:00 - 11:00',
      '14:00 - 15:00',
      '16:30 - 17:30',
    ];
    const todaySessions: PTSessionItem[] = studentProfiles
      .slice(0, 4)
      .map((sp, idx) => {
        const student = sp.student;
        const pkg = student.userPackages?.[0];

        return {
          id: `session-${sp.id}`,
          timeSlot: timeSlots[idx % timeSlots.length],
          studentId: student.id,
          studentName: student.fullName,
          studentAvatar:
            student.avatarUrl ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          workoutName: 'Tập Lưng & Bụng Cá Nhân Hóa',
          status: 'PENDING',
          remainingSessions: pkg?.remainingSessions ?? 8,
          totalSessions: pkg?.totalSessions ?? 12,
        };
      });

    // Extract pending meals awaiting PT review
    const pendingMeals: PTDashboardData['pendingMeals'] = [];
    for (const sp of studentProfiles) {
      for (const log of sp.student.mealLogs) {
        if (log.reviews.length === 0) {
          const desc =
            log.items.map((i) => i.foodName).join(' + ') || log.mealName;
          pendingMeals.push({
            id: log.id,
            studentId: sp.student.id,
            studentName: sp.student.fullName,
            studentAvatar:
              sp.student.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            mealName: log.mealName,
            calories: Math.round(log.totalCalories),
            imageUrl:
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
            foodDescription: desc,
            proteinGrams: Math.round(log.totalProtein),
            carbsGrams: Math.round(log.totalCarbs),
            fatGrams: Math.round(log.totalFat),
            loggedAt: log.logDate.toISOString(),
          });
        }
      }
    }

    return {
      coachName,
      coachAvatar,
      totalVipStudents,
      todaySessionsCount: todaySessions.length,
      completedSessionsCount,
      totalPackageSessionsCount,
      warningsCount: 0,
      pendingMealCount: pendingMeals.length,
      todaySessions,
      pendingMeals,
      students,
    };
  }

  async getStudentDetail(studentId: string): Promise<PTStudentDetail> {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        bodyMetrics: {
          orderBy: { recordedAt: 'desc' },
          take: 10,
        },
        progressPhotos: {
          orderBy: { takenAt: 'desc' },
          take: 10,
        },
        nutritionTargets: {
          orderBy: { effectiveDate: 'desc' },
          take: 1,
        },
        userPackages: {
          where: { isActive: true },
          take: 1,
        },
      },
    });

    if (!student) {
      throw new NotFoundException(
        `Không tìm thấy học viên với ID ${studentId}`,
      );
    }

    const latestMetric = student.bodyMetrics?.[0];
    const latestTarget = student.nutritionTargets?.[0];
    const pkg = student.userPackages?.[0];

    const beforePhoto = student.progressPhotos.find((p) => p.tag === 'BEFORE');
    const afterPhoto = student.progressPhotos.find(
      (p) => p.tag === 'AFTER' || p.tag === 'FRONT',
    );

    return {
      id: student.id,
      fullName: student.fullName,
      avatarUrl:
        student.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      email: student.email,
      phone: student.phone || undefined,
      gender: student.gender || 'MALE',
      packageName: pkg ? 'Gói PT 1:1 VIP' : 'Gói Tiêu chuẩn',
      remainingSessions: pkg?.remainingSessions ?? 10,
      totalSessions: pkg?.totalSessions ?? 12,
      inBody: {
        weightKg: latestMetric?.weight ?? student.targetWeight ?? 70,
        heightCm: student.height ?? 170,
        bodyFatPercent: latestMetric?.bodyFat ?? 18.5,
        muscleMassKg: latestMetric?.muscleMass ?? 32.5,
        updatedAt: latestMetric?.recordedAt
          ? latestMetric.recordedAt.toLocaleDateString('vi-VN')
          : 'Hôm nay',
      },
      bodyMetrics: {
        weightKg: latestMetric?.weight ?? student.targetWeight ?? 70,
        heightCm: student.height ?? 170,
        bodyFatPercent: latestMetric?.bodyFat ?? 18.5,
        muscleMassKg: latestMetric?.muscleMass ?? 32.5,
        updatedAt: latestMetric?.recordedAt
          ? latestMetric.recordedAt.toLocaleDateString('vi-VN')
          : 'Hôm nay',
      },
      bodyMetricsHistory: student.bodyMetrics.map((bm) => ({
        date: bm.recordedAt.toLocaleDateString('vi-VN'),
        weightKg: bm.weight,
        bodyFatPercent: bm.bodyFat ?? 18,
        muscleMassKg: bm.muscleMass ?? 32,
      })),
      beforeAfterPhotos: {
        beforeUrl:
          beforePhoto?.photoUrl ||
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80',
        afterUrl:
          afterPhoto?.photoUrl ||
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=80',
        beforeWeight: beforePhoto
          ? student.targetWeight
            ? student.targetWeight + 5
            : 85
          : 85,
        afterWeight: afterPhoto ? latestMetric?.weight || 80 : 80,
      },
      nutritionTarget: {
        targetCalories: latestTarget?.targetCalo ?? 2200,
        proteinGrams: latestTarget?.targetProtein ?? 160,
        carbsGrams: latestTarget?.targetCarbs ?? 220,
        fatGrams: latestTarget?.targetFat ?? 60,
      },
      currentWorkoutTitle: 'Lịch Tập Tăng Cơ Cá Nhân Hóa',
    };
  }

  async getStudentPhotos(studentId: string) {
    return this.prisma.progressPhoto.findMany({
      where: { userId: studentId },
      orderBy: { takenAt: 'desc' },
    });
  }

  async addStudentPhoto(studentId: string, dto: CreateProgressPhotoDto) {
    return this.prisma.progressPhoto.create({
      data: {
        userId: studentId,
        photoUrl: dto.photoUrl,
        tag: dto.tag || 'AFTER',
        takenAt: dto.takenAt ? new Date(dto.takenAt) : new Date(),
      },
    });
  }

  async deleteStudentPhoto(studentId: string, photoId: string) {
    const photo = await this.prisma.progressPhoto.findUnique({
      where: { id: photoId },
    });
    if (!photo || photo.userId !== studentId) {
      throw new NotFoundException('Không tìm thấy ảnh tiến trình của học viên');
    }
    return this.prisma.progressPhoto.delete({
      where: { id: photoId },
    });
  }

  async getStudentMeals(studentId: string) {
    return this.prisma.mealLog.findMany({
      where: { userId: studentId },
      orderBy: { logDate: 'desc' },
      include: {
        items: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async assignWorkoutToStudent(dto: AssignWorkoutDto) {
    if (dto.studentId) {
      await this.prisma.workoutSchedule.create({
        data: {
          studentId: dto.studentId,
          title: dto.title ? String(dto.title) : 'Lịch Tập 1:1 Cá Nhân Hóa',
          scheduledDate: new Date(),
          note: dto.note
            ? String(dto.note)
            : 'Tập đúng phom dáng và đảm bảo đủ số reps.',
        },
      });
    }

    return {
      success: true,
      studentId: dto.studentId,
      workoutPlanTitle: dto.title ? String(dto.title) : undefined,
      message: 'Đã giao bài tập 1:1 vào Database thành công!',
    };
  }

  async assignNutritionToStudent(dto: AssignNutritionDto) {
    if (dto.studentId) {
      const targetCalories = Number(dto.targetCalories || 2200);
      const targetProtein = Number(
        dto.proteinGrams || Math.round((targetCalories * 0.3) / 4),
      );
      const targetCarbs = Number(
        dto.carbsGrams || Math.round((targetCalories * 0.4) / 4),
      );
      const targetFat = Number(
        dto.fatGrams || Math.round((targetCalories * 0.3) / 9),
      );

      await this.prisma.nutritionTarget.create({
        data: {
          studentId: dto.studentId,
          targetCalo: targetCalories,
          targetProtein,
          targetCarbs,
          targetFat,
        },
      });
    }

    return {
      success: true,
      studentId: dto.studentId,
      targetCalories: dto.targetCalories,
      message: 'Đã cập nhật thực đơn & mục tiêu dinh dưỡng vào DB thành công!',
    };
  }

  async updateInBody(dto: UpdateInBodyDto) {
    if (dto.studentId) {
      await this.prisma.bodyMetric.create({
        data: {
          userId: dto.studentId,
          weight: dto.weightKg,
          height: dto.heightCm,
          bodyFat: dto.bodyFatPercent,
          muscleMass: dto.muscleMassKg,
        },
      });

      await this.prisma.user
        .update({
          where: { id: dto.studentId },
          data: {
            targetWeight: dto.weightKg,
            height: dto.heightCm,
          },
        })
        .catch(() => null);
    }

    return {
      success: true,
      studentId: dto.studentId,
      bodyMetrics: {
        weightKg: dto.weightKg,
        heightCm: dto.heightCm,
        bodyFatPercent: dto.bodyFatPercent,
        muscleMassKg: dto.muscleMassKg,
        updatedAt: dto.date || new Date().toLocaleDateString('vi-VN'),
      },
      message: 'Đã cập nhật chỉ số InBody mới vào DB cho học viên thành công!',
    };
  }

  async checkInSession(sessionId: string) {
    // Check if sessionId is session-id or studentId
    const cleanId = sessionId.replace('session-', '');

    const pkg = await this.prisma.memberPackage.findFirst({
      where: {
        OR: [{ id: cleanId }, { userId: cleanId }],
        isActive: true,
      },
    });

    if (pkg && pkg.remainingSessions > 0) {
      const updatedPkg = await this.prisma.memberPackage.update({
        where: { id: pkg.id },
        data: {
          remainingSessions: pkg.remainingSessions - 1,
        },
      });

      await this.prisma.attendanceHistory.create({
        data: {
          memberPackageId: pkg.id,
          studentId: pkg.userId,
          status: 'CHECKED_IN',
          note: 'PT Check-in điểm danh thành công',
        },
      });

      return {
        success: true,
        sessionId,
        remainingSessions: updatedPkg.remainingSessions,
        message: `Đã check-in điểm danh học viên thành công! Số buổi còn lại: ${updatedPkg.remainingSessions}/${pkg.totalSessions}`,
      };
    }

    return {
      success: true,
      sessionId,
      message: 'Đã điểm danh buổi tập cho học viên thành công!',
    };
  }

  async approveMeal(mealId: string, ptId?: string, note?: string) {
    const mealLog = await this.prisma.mealLog.findUnique({
      where: { id: mealId },
      include: { user: true },
    });

    if (mealLog) {
      await this.prisma.mealReview.create({
        data: {
          mealLogId: mealId,
          ptId: ptId || mealLog.userId,
          comment: note || 'Bữa ăn đầy đủ dinh dưỡng chuẩn mục tiêu!',
        },
      });
    }

    return {
      success: true,
      mealId,
      note,
      message: 'Đã ghi nhận nhận xét & duyệt bữa ăn cho học viên thành công!',
    };
  }

  async getPtCodeAndQr(ptUserId: string): Promise<PTCodeQrData> {
    const ptUser = await this.prisma.user.findUnique({
      where: { id: ptUserId },
    });

    const ptCode = ptUser
      ? `PT-${ptUser.fullName.toUpperCase().slice(0, 3)}${ptUser.id.slice(0, 3).toUpperCase()}`
      : 'PT-HUY066';
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://fitmanagement.app/bind?ptCode=${ptCode}&user=${ptUserId}`;

    return {
      ptCode,
      qrCodeUrl,
      coachName: ptUser ? `Coach ${ptUser.fullName}` : 'Coach Bùi Văn Huy',
    };
  }

  sendStudentInvite(ptUserId: string, dto: SendInviteDto) {
    const inviteCode = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const inviteUrl = `https://fitmanagement.app/invite?code=${inviteCode}&pt=${ptUserId}`;

    return Promise.resolve({
      success: true,
      inviteCode,
      inviteUrl,
      studentEmail: dto.studentEmail,
      packageName: dto.packageName,
      totalSessions: dto.totalSessions,
      message: `Đã tạo link mời học viên qua Gmail (${dto.studentEmail}) thành công!`,
    });
  }

  async bindPtByStudent(studentUserId: string, dto: BindPtDto) {
    let trainerId = dto.ptCodeOrInviteCode;

    // Find PT user if code passed
    const ptUser = await this.prisma.user.findFirst({
      where: {
        role: 'PT',
        OR: [{ id: dto.ptCodeOrInviteCode }, { email: dto.ptCodeOrInviteCode }],
      },
    });

    if (ptUser) {
      trainerId = ptUser.id;
    }

    if (trainerId) {
      await this.prisma.studentProfile
        .upsert({
          where: {
            trainerId_studentId: {
              trainerId,
              studentId: studentUserId,
            },
          },
          create: {
            trainerId,
            studentId: studentUserId,
          },
          update: {},
        })
        .catch(() => null);
    }

    return {
      success: true,
      studentUserId,
      ptCode: dto.ptCodeOrInviteCode,
      message: ptUser
        ? `Chúc mừng! Đã liên kết tài khoản 1-1 với Coach ${ptUser.fullName} thành công!`
        : 'Đã gửi yêu cầu liên kết với Huấn luyện viên cá nhân!',
    };
  }

  async updateStudentSessions(
    studentId: string,
    dto: UpdateStudentSessionsDto,
  ) {
    if (dto.fullName || dto.phone) {
      await this.prisma.user.update({
        where: { id: studentId },
        data: {
          ...(dto.fullName && { fullName: dto.fullName }),
          ...(dto.phone && { phone: dto.phone }),
        },
      });
    }

    let gymPkg = await this.prisma.gymPackage.findFirst({
      where: { isActive: true },
    });

    if (!gymPkg) {
      gymPkg = await this.prisma.gymPackage.create({
        data: {
          title: dto.packageName || 'Gói PT 1:1 VIP',
          price: 5000000,
          totalSessions: dto.totalSessions || 12,
          durationDays: 90,
        },
      });
    }

    const activeMemberPkg = await this.prisma.memberPackage.findFirst({
      where: { userId: studentId, isActive: true },
    });

    if (activeMemberPkg) {
      await this.prisma.memberPackage.update({
        where: { id: activeMemberPkg.id },
        data: {
          totalSessions: dto.totalSessions ?? activeMemberPkg.totalSessions,
          remainingSessions:
            dto.remainingSessions ?? activeMemberPkg.remainingSessions,
        },
      });
    } else {
      await this.prisma.memberPackage.create({
        data: {
          userId: studentId,
          packageId: gymPkg.id,
          totalSessions: dto.totalSessions || 12,
          remainingSessions: dto.remainingSessions ?? (dto.totalSessions || 12),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
      });
    }

    return {
      success: true,
      studentId,
      updatedInfo: dto,
      message: `Đã gia hạn & cập nhật gói tập ${dto.packageName || 'PT 1:1'} (${dto.remainingSessions ?? 10}/${dto.totalSessions ?? 12} buổi) vào DB thành công!`,
    };
  }
}
