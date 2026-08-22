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
    // Find official approved students assigned to this PT
    const approvedProfiles = await this.prisma.studentProfile.findMany({
      where: { trainerId: ptUserId, status: 'APPROVED' },
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

    const totalVipStudents = approvedProfiles.length;

    // Calculate session counts from member packages
    let totalPackageSessionsCount = 0;
    let remainingSessionsSum = 0;

    const students = approvedProfiles.map((sp) => {
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

    // Check attendance history from DB for all PT students
    const studentIds = approvedProfiles.map((sp) => sp.studentId);
    const attendanceLogs = await this.prisma.attendanceHistory.findMany({
      where: {
        studentId: { in: studentIds },
        status: 'CHECKED_IN',
      },
      include: {
        student: true,
        memberPackage: true,
      },
      orderBy: { checkInTime: 'desc' },
    });

    const checkedInStudentIds = new Set(attendanceLogs.map((a) => a.studentId));

    // Build today's sessions list from real student profiles
    const timeSlots = [
      '08:00 - 09:00',
      '10:00 - 11:00',
      '14:00 - 15:00',
      '16:30 - 17:30',
    ];
    const todaySessions: PTSessionItem[] = approvedProfiles
      .slice(0, 4)
      .map((sp, idx) => {
        const student = sp.student;
        const pkg = student.userPackages?.[0];
        const isCheckedIn = checkedInStudentIds.has(student.id);

        return {
          id: `session-${sp.id}`,
          timeSlot: timeSlots[idx % timeSlots.length],
          studentId: student.id,
          studentName: student.fullName,
          studentAvatar:
            student.avatarUrl ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          workoutName: 'Tập Lưng & Bụng Cá Nhân Hóa',
          status: isCheckedIn ? 'CHECKED_IN' : 'PENDING',
          remainingSessions: pkg?.remainingSessions ?? 0,
          totalSessions: pkg?.totalSessions ?? 0,
        };
      });

    // Extract pending meals awaiting PT review
    const pendingMeals: PTDashboardData['pendingMeals'] = [];
    for (const sp of approvedProfiles) {
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

    // Extract pending student bind requests awaiting PT approval
    const pendingProfiles = await this.prisma.studentProfile.findMany({
      where: {
        trainerId: ptUserId,
        status: 'PENDING',
      },
      include: {
        student: true,
      },
      orderBy: { assignedAt: 'desc' },
    });

    const pendingStudentRequests = pendingProfiles.map((sp) => {
      const spObj = sp as unknown as { status?: string };
      return {
        id: sp.id,
        studentId: sp.studentId,
        studentName: sp.student.fullName,
        studentEmail: sp.student.email,
        studentPhone: sp.student.phone || undefined,
        studentAvatar:
          sp.student.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        requestedAt: sp.assignedAt.toISOString(),
        status: (spObj.status || 'PENDING') as
          'PENDING' | 'APPROVED' | 'REJECTED',
      };
    });

    return {
      coachName,
      coachAvatar,
      totalVipStudents,
      todaySessionsCount: todaySessions.length,
      completedSessionsCount,
      totalPackageSessionsCount,
      warningsCount: 0,
      pendingMealCount: pendingMeals.length,
      pendingStudentRequestsCount: pendingStudentRequests.length,
      pendingStudentRequests,
      todaySessions,
      pendingMeals,
      students,
    };
  }

  async getPendingStudentRequests(ptUserId: string) {
    const pendingProfiles = await this.prisma.studentProfile.findMany({
      where: {
        trainerId: ptUserId,
        status: 'PENDING',
      },
      include: {
        student: true,
      },
      orderBy: { assignedAt: 'desc' },
    });

    return pendingProfiles.map((sp) => {
      const spObj = sp as unknown as { status?: string };
      return {
        id: sp.id,
        studentId: sp.studentId,
        studentName: sp.student.fullName,
        studentEmail: sp.student.email,
        studentPhone: sp.student.phone || undefined,
        studentAvatar:
          sp.student.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        requestedAt: sp.assignedAt.toISOString(),
        status: (spObj.status || 'PENDING') as
          'PENDING' | 'APPROVED' | 'REJECTED',
      };
    });
  }

  async approveStudentRequest(ptUserId: string, requestId: string) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { id: requestId },
      include: { student: true },
    });

    if (!profile || profile.trainerId !== ptUserId) {
      throw new NotFoundException('Không tìm thấy yêu cầu liên kết học viên');
    }

    await this.prisma.studentProfile.update({
      where: { id: requestId },
      data: { status: 'APPROVED' },
    });

    const existingPkg = await this.prisma.memberPackage.findFirst({
      where: { userId: profile.studentId, isActive: true },
    });

    if (!existingPkg) {
      let gymPkg = await this.prisma.gymPackage.findFirst();

      if (!gymPkg) {
        gymPkg = await this.prisma.gymPackage.create({
          data: {
            title: 'Gói PT VIP 1-1 (12 Buổi)',
            description: 'Gói tập huấn luyện viên 1:1 cá nhân hóa',
            price: 3600000,
            durationDays: 90,
            totalSessions: 12,
          },
        });
      }

      await this.prisma.memberPackage.create({
        data: {
          userId: profile.studentId,
          packageId: gymPkg.id,
          totalSessions: 12,
          remainingSessions: 12,
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
      });
    }

    return {
      success: true,
      requestId,
      studentName: profile.student.fullName,
      message: `Đã phê duyệt chấp nhận học viên ${profile.student.fullName} vào danh sách 1-1 thành công!`,
    };
  }

  async rejectStudentRequest(ptUserId: string, requestId: string) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { id: requestId },
      include: { student: true },
    });

    if (!profile || profile.trainerId !== ptUserId) {
      throw new NotFoundException('Không tìm thấy yêu cầu liên kết học viên');
    }

    await this.prisma.studentProfile.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });

    return {
      success: true,
      requestId,
      studentName: profile.student.fullName,
      message: `Đã từ chối yêu cầu liên kết của học viên ${profile.student.fullName}`,
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
      remainingSessions: pkg?.remainingSessions ?? 0,
      totalSessions: pkg?.totalSessions ?? 0,
      inBody: {
        weightKg: latestMetric?.weight ?? student.targetWeight ?? 0,
        heightCm: student.height ?? 0,
        bodyFatPercent: latestMetric?.bodyFat ?? 0,
        muscleMassKg: latestMetric?.muscleMass ?? 0,
        updatedAt: latestMetric?.recordedAt
          ? latestMetric.recordedAt.toLocaleDateString('vi-VN')
          : 'Chưa có',
      },
      bodyMetrics: {
        weightKg: latestMetric?.weight ?? student.targetWeight ?? 0,
        heightCm: student.height ?? 0,
        bodyFatPercent: latestMetric?.bodyFat ?? 0,
        muscleMassKg: latestMetric?.muscleMass ?? 0,
        updatedAt: latestMetric?.recordedAt
          ? latestMetric.recordedAt.toLocaleDateString('vi-VN')
          : 'Chưa có',
      },
      bodyMetricsHistory: student.bodyMetrics.map((bm) => ({
        date: bm.recordedAt.toLocaleDateString('vi-VN'),
        weightKg: bm.weight,
        bodyFatPercent: bm.bodyFat ?? 0,
        muscleMassKg: bm.muscleMass ?? 0,
      })),
      beforeAfterPhotos: {
        beforeUrl: beforePhoto?.photoUrl || undefined,
        afterUrl: afterPhoto?.photoUrl || undefined,
        beforeWeight: beforePhoto ? (student.targetWeight ?? 0) : 0,
        afterWeight: afterPhoto ? (latestMetric?.weight ?? 0) : 0,
      },
      nutritionTarget: {
        targetCalories: latestTarget?.targetCalo ?? 0,
        proteinGrams: latestTarget?.targetProtein ?? 0,
        carbsGrams: latestTarget?.targetCarbs ?? 0,
        fatGrams: latestTarget?.targetFat ?? 0,
      },
      prescribedMealPlan: latestTarget?.prescribedMealPlan
        ? (JSON.parse(latestTarget.prescribedMealPlan) as {
            breakfast?: string;
            lunch?: string;
            dinner?: string;
            snack?: string;
          })
        : undefined,
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
      message: 'Đã giao bài tập 1:1 thành công!',
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

      const prescribedMealPlan = dto.prescribedMealPlan
        ? JSON.stringify(dto.prescribedMealPlan)
        : undefined;

      await this.prisma.nutritionTarget.create({
        data: {
          studentId: dto.studentId,
          targetCalo: targetCalories,
          targetProtein,
          targetCarbs,
          targetFat,
          prescribedMealPlan,
        },
      });
    }

    return {
      success: true,
      studentId: dto.studentId,
      targetCalories: dto.targetCalories,
      prescribedMealPlan: dto.prescribedMealPlan,
      message:
        'Đã lưu mục tiêu dinh dưỡng & thực đơn 4 bữa vào CSDL thành công!',
    };
  }

  async updateInBody(dto: UpdateInBodyDto) {
    if (dto.studentId) {
      await this.prisma.bodyMetric.create({
        data: {
          userId: dto.studentId,
          weight: dto.weightKg,
          bodyFat: dto.bodyFatPercent,
          muscleMass: dto.muscleMassKg,
        },
      });

      if (dto.heightCm) {
        await this.prisma.user.update({
          where: { id: dto.studentId },
          data: { height: dto.heightCm },
        });
      }
    }

    return {
      success: true,
      studentId: dto.studentId,
      inBody: dto,
      message: 'Đã cập nhật chỉ số InBody học viên thành công!',
    };
  }

  async checkInSession(sessionId: string) {
    const rawId = sessionId.replace('session-', '').trim();
    let studentId = rawId;

    const profile = await this.prisma.studentProfile.findFirst({
      where: {
        OR: [{ id: rawId }, { studentId: rawId }],
      },
    });

    if (profile) {
      studentId = profile.studentId;
    }

    const activePkg = await this.prisma.memberPackage.findFirst({
      where: {
        userId: studentId,
        isActive: true,
      },
    });

    if (activePkg && activePkg.remainingSessions > 0) {
      const updatedPkg = await this.prisma.memberPackage.update({
        where: { id: activePkg.id },
        data: {
          remainingSessions: activePkg.remainingSessions - 1,
        },
      });

      await this.prisma.attendanceHistory.create({
        data: {
          memberPackageId: activePkg.id,
          studentId: activePkg.userId,
          status: 'CHECKED_IN',
          note: 'PT Check-in hoàn thành ca tập 1:1',
        },
      });

      return {
        success: true,
        sessionId,
        remainingSessions: updatedPkg.remainingSessions,
        totalSessions: activePkg.totalSessions,
        message: `Đã check-in điểm danh thành công! Số buổi còn lại: ${updatedPkg.remainingSessions}/${activePkg.totalSessions}`,
      };
    }

    return {
      success: true,
      sessionId,
      status: 'CHECKED_IN',
      message: 'Đã ghi nhận hoàn thành ca tập!',
    };
  }

  async approveMeal(mealId: string, ptUserId: string, note?: string) {
    await this.prisma.mealReview.create({
      data: {
        mealLogId: mealId,
        ptId: ptUserId,
        comment: note || 'PT đã duyệt bữa ăn - Đạt chuẩn dinh dưỡng!',
      },
    });

    return {
      success: true,
      mealId,
      status: 'APPROVED',
      note: note || 'PT đã duyệt bữa ăn - Đạt chuẩn dinh dưỡng!',
      message: 'Đã phê duyệt bữa ăn của học viên thành công!',
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

  async sendStudentInvite(ptUserId: string, dto: SendInviteDto) {
    const inviteCode = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const inviteUrl = `https://fitmanagement.app/invite?code=${inviteCode}&pt=${ptUserId}`;

    const studentUser = await this.prisma.user.findFirst({
      where: { email: dto.studentEmail },
    });

    if (studentUser) {
      await this.prisma.studentProfile
        .upsert({
          where: {
            trainerId_studentId: {
              trainerId: ptUserId,
              studentId: studentUser.id,
            },
          },
          create: {
            trainerId: ptUserId,
            studentId: studentUser.id,
          },
          update: {},
        })
        .catch(() => null);

      let gymPkg = await this.prisma.gymPackage.findFirst();

      if (!gymPkg) {
        gymPkg = await this.prisma.gymPackage.create({
          data: {
            title: dto.packageName || 'Gói PT VIP 1-1',
            description: 'Gói tập huấn luyện viên 1:1 cá nhân hóa',
            price: 3600000,
            durationDays: 90,
            totalSessions: dto.totalSessions || 12,
          },
        });
      }

      await this.prisma.memberPackage
        .create({
          data: {
            userId: studentUser.id,
            packageId: gymPkg.id,
            totalSessions: dto.totalSessions || 12,
            remainingSessions:
              dto.remainingSessions ?? (dto.totalSessions || 12),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          },
        })
        .catch(() => null);
    }

    return {
      success: true,
      inviteCode,
      inviteUrl,
      studentEmail: dto.studentEmail,
      packageName: dto.packageName,
      totalSessions: dto.totalSessions,
      message: studentUser
        ? `Đã liên kết học viên ${studentUser.fullName} (${dto.studentEmail}) vào danh sách HLV phụ trách!`
        : `Đã tạo link mời học viên qua Gmail (${dto.studentEmail}) thành công!`,
    };
  }

  async bindPtByStudent(studentUserId: string, dto: BindPtDto) {
    const rawCode = (dto.ptCodeOrInviteCode || '').trim();

    // 1. Find PT user by exact ID, email, or phone
    let ptUser = await this.prisma.user.findFirst({
      where: {
        role: 'PT',
        OR: [{ id: rawCode }, { email: rawCode }, { phone: rawCode }],
      },
    });

    // 2. If code starts with PT- or custom string (e.g. PT-ADMIN or PT-HUY), match PT name or default to first PT
    if (!ptUser) {
      const allPts = await this.prisma.user.findMany({
        where: { role: 'PT' },
      });

      if (allPts.length > 0) {
        const cleanCode = rawCode.toUpperCase().replace('PT-', '');
        ptUser =
          allPts.find(
            (p) =>
              p.fullName.toUpperCase().includes(cleanCode) ||
              p.id.toUpperCase().includes(cleanCode) ||
              p.email.toUpperCase().includes(cleanCode),
          ) || allPts[0];
      }
    }

    if (ptUser) {
      const trainerId = ptUser.id;

      // Upsert StudentProfile relation in DB
      await this.prisma.studentProfile.upsert({
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
      });

      // Ensure student has a MemberPackage in DB
      const existingPkg = await this.prisma.memberPackage.findFirst({
        where: { userId: studentUserId, isActive: true },
      });

      if (!existingPkg) {
        let gymPkg = await this.prisma.gymPackage.findFirst();

        if (!gymPkg) {
          gymPkg = await this.prisma.gymPackage.create({
            data: {
              title: 'Gói PT VIP 1-1 (12 Buổi)',
              description: 'Gói tập huấn luyện viên 1:1 cá nhân hóa',
              price: 3600000,
              durationDays: 90,
              totalSessions: 12,
            },
          });
        }

        await this.prisma.memberPackage.create({
          data: {
            userId: studentUserId,
            packageId: gymPkg.id,
            totalSessions: 12,
            remainingSessions: 12,
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }

    return {
      success: true,
      studentUserId,
      ptCode: dto.ptCodeOrInviteCode,
      coachName: ptUser ? `Coach ${ptUser.fullName}` : undefined,
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

    let gymPkg = await this.prisma.gymPackage.findFirst();

    if (!gymPkg) {
      gymPkg = await this.prisma.gymPackage.create({
        data: {
          title: dto.packageName || 'Gói PT VIP 1-1',
          description: 'Gói tập huấn luyện viên 1:1 cá nhân hóa',
          price: 3600000,
          durationDays: 90,
          totalSessions: dto.totalSessions || 12,
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

  async getPtProfile(ptUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: ptUserId },
      include: {
        ptApplication: true,
        studentProfiles: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin PT');
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || undefined,
      avatarUrl: user.avatarUrl || undefined,
      bio: user.ptApplication?.bio || 'HLV Cá Nhân Chuyên Nghiệp 1:1',
      experienceYears: user.ptApplication?.experienceYears || 3,
      specialties: user.ptApplication?.specialties?.length
        ? user.ptApplication.specialties
        : ['Tăng cơ giảm mỡ', 'Phục hồi chấn thương', 'Tập luyện 1:1'],
      certificateUrl: user.ptApplication?.certificateUrl || undefined,
      rating: 4.9,
      totalStudents: user.studentProfiles.length,
      monthlySessions: 48,
    };
  }

  async updatePtProfile(
    ptUserId: string,
    dto: {
      fullName?: string;
      phone?: string;
      bio?: string;
      experienceYears?: number;
      specialties?: string[];
      certificateUrl?: string;
    },
  ) {
    if (dto.fullName || dto.phone) {
      await this.prisma.user.update({
        where: { id: ptUserId },
        data: {
          ...(dto.fullName && { fullName: dto.fullName }),
          ...(dto.phone && { phone: dto.phone }),
        },
      });
    }

    await this.prisma.ptApplication.upsert({
      where: { userId: ptUserId },
      create: {
        userId: ptUserId,
        bio: dto.bio || 'HLV Cá Nhân Chuyên Nghiệp 1:1',
        experienceYears: dto.experienceYears || 3,
        specialties: dto.specialties || ['Tăng cơ giảm mỡ'],
        certificateUrl: dto.certificateUrl,
      },
      update: {
        ...(dto.bio && { bio: dto.bio }),
        ...(dto.experienceYears && { experienceYears: dto.experienceYears }),
        ...(dto.specialties && { specialties: dto.specialties }),
        ...(dto.certificateUrl !== undefined && {
          certificateUrl: dto.certificateUrl,
        }),
      },
    });

    return {
      success: true,
      ptUserId,
      message: 'Cập nhật hồ sơ cá nhân HLV thành công!',
    };
  }
}
