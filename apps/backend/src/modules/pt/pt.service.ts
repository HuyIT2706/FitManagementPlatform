import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
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

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PtService {
  private readonly logger = new Logger(PtService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Enforce IDOR protection: Verify that this PT is assigned to and approved for the student
   */
  async verifyPtOwnsStudent(ptId: string, studentId: string): Promise<void> {
    const relation = await this.prisma.studentProfile.findFirst({
      where: {
        trainerId: ptId,
        studentId,
        status: 'APPROVED',
      },
    });
    if (!relation) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập hoặc thao tác trên dữ liệu học viên này',
      );
    }
  }

  async getDashboardData(ptUserId: string): Promise<PTDashboardData> {
    try {
      const [ptUser, approvedProfiles] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: ptUserId },
          select: { fullName: true, avatarUrl: true },
        }),
        this.prisma.studentProfile.findMany({
          where: { trainerId: ptUserId, status: 'APPROVED' },
          select: {
            id: true,
            studentId: true,
            student: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                userPackages: {
                  where: { isActive: true },
                  take: 1,
                  select: {
                    totalSessions: true,
                    remainingSessions: true,
                  },
                },
                mealLogs: {
                  take: 5,
                  orderBy: { logDate: 'desc' },
                  select: {
                    id: true,
                    mealName: true,
                    logDate: true,
                    totalCalories: true,
                    totalProtein: true,
                    totalCarbs: true,
                    totalFat: true,
                    reviews: {
                      select: { id: true, ptId: true, comment: true },
                    },
                    items: {
                      select: {
                        id: true,
                        foodName: true,
                        weightInGram: true,
                        calories: true,
                      },
                    },
                  },
                },
                bodyMetrics: {
                  take: 1,
                  orderBy: { recordedAt: 'desc' },
                  select: { weight: true, recordedAt: true },
                },
              },
            },
          },
        }),
      ]);

      const coachName = ptUser ? `Coach ${ptUser.fullName}` : 'Coach PT';
      const coachAvatar = ptUser?.avatarUrl || undefined;

      const validApprovedProfiles = (approvedProfiles || []).filter((sp) =>
        Boolean(sp && sp.student),
      );

      const totalVipStudents = validApprovedProfiles.length;

      // Calculate session counts from member packages
      let totalPackageSessionsCount = 0;
      let remainingSessionsSum = 0;

      const students = validApprovedProfiles.map((sp) => {
        const student = sp.student;
        const pkg = student?.userPackages?.[0];
        const totalSessions = pkg?.totalSessions ?? 0;
        const remainingSessions = pkg?.remainingSessions ?? 0;

        totalPackageSessionsCount += totalSessions;
        remainingSessionsSum += remainingSessions;

        return {
          id: student.id,
          fullName: student.fullName || 'Học viên',
          avatarUrl: student.avatarUrl || '/default-avatar.svg',
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

      // Check attendance history from DB for all PT students (ONLY for today's sessions)
      const studentIds = validApprovedProfiles.map((sp) => sp.studentId);
      const now = new Date();
      // Calculate Vietnam timezone window (UTC+7)
      const vnDate = new Date(now.getTime() + 7 * 60 * 60 * 1000);
      const y = vnDate.getUTCFullYear();
      const m = vnDate.getUTCMonth();
      const d = vnDate.getUTCDate();
      const startOfToday = new Date(
        Date.UTC(y, m, d, 0, 0, 0) - 7 * 60 * 60 * 1000,
      );
      const endOfToday = new Date(
        Date.UTC(y, m, d, 23, 59, 59, 999) - 7 * 60 * 60 * 1000,
      );

      // Query actual workout schedules created for today
      const todaySchedules = await this.prisma.workoutSchedule.findMany({
        where: {
          studentId: { in: studentIds },
          scheduledDate: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
        select: {
          id: true,
          title: true,
          note: true,
          scheduledDate: true,
          studentId: true,
          isCompleted: true,
          student: {
            select: {
              fullName: true,
              avatarUrl: true,
              userPackages: {
                where: { isActive: true },
                take: 1,
                select: {
                  totalSessions: true,
                  remainingSessions: true,
                },
              },
            },
          },
        },
        orderBy: { scheduledDate: 'asc' },
      });

      const timeSlots = [
        '08:00 - 09:00',
        '10:00 - 11:00',
        '14:00 - 15:00',
        '16:30 - 17:30',
        '18:00 - 19:00',
        '19:30 - 20:30',
      ];

      const todaySessions: PTSessionItem[] = (todaySchedules || []).map(
        (ws, idx) => {
          const student = ws.student;
          const pkg = student?.userPackages?.[0];
          const isCheckedIn = Boolean(ws.isCompleted);

          let timeSlot = timeSlots[idx % timeSlots.length] || '08:00 - 09:00';
          if (ws.note && ws.note.includes(' - ')) {
            const match = ws.note.match(/\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}/);
            if (match) timeSlot = match[0];
          }

          const dateObj = new Date(ws.scheduledDate);
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          const scheduledDateFormatted = `${year}-${month}-${day}`;

          return {
            id: ws.id,
            timeSlot,
            studentId: ws.studentId,
            studentName: student?.fullName || 'Học viên',
            studentAvatar: student?.avatarUrl || '/default-avatar.svg',
            workoutName: ws.title || 'Giáo Án Tập Luyện 1:1',
            status: isCheckedIn ? 'CHECKED_IN' : 'PENDING',
            remainingSessions: pkg?.remainingSessions ?? 0,
            totalSessions: pkg?.totalSessions ?? 0,
            scheduledDate: scheduledDateFormatted,
          };
        },
      );

      // Extract pending meals awaiting PT review
      const pendingMeals: PTDashboardData['pendingMeals'] = [];
      for (const sp of validApprovedProfiles) {
        if (!sp.student?.mealLogs || !Array.isArray(sp.student.mealLogs))
          continue;
        for (const log of sp.student.mealLogs) {
          if (Array.isArray(log.reviews) && log.reviews.length === 0) {
            const desc =
              log.items?.map((i) => i.foodName).join(' + ') || log.mealName;
            pendingMeals.push({
              id: log.id,
              studentId: sp.student.id,
              studentName: sp.student.fullName || 'Học viên',
              studentAvatar: sp.student.avatarUrl || '/default-avatar.svg',
              mealName: log.mealName,
              calories: Math.round(log.totalCalories || 0),
              imageUrl:
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
              foodDescription: desc,
              proteinGrams: Math.round(log.totalProtein || 0),
              carbsGrams: Math.round(log.totalCarbs || 0),
              fatGrams: Math.round(log.totalFat || 0),
              loggedAt: log.logDate
                ? log.logDate instanceof Date
                  ? log.logDate.toISOString()
                  : new Date(log.logDate).toISOString()
                : new Date().toISOString(),
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

      const pendingStudentRequests = (pendingProfiles || []).map((sp) => {
        const spObj = sp as unknown as { status?: string };
        const student = sp.student as
          | {
              fullName?: string;
              email?: string;
              phone?: string | null;
              avatarUrl?: string | null;
            }
          | null
          | undefined;

        let requestedAtStr = new Date().toISOString();
        if (sp.assignedAt) {
          try {
            requestedAtStr =
              sp.assignedAt instanceof Date
                ? sp.assignedAt.toISOString()
                : new Date(sp.assignedAt).toISOString();
          } catch {
            // ignore
          }
        }

        return {
          id: sp.id,
          studentId: sp.studentId,
          studentName: student?.fullName || 'Học viên',
          studentEmail: student?.email || 'N/A',
          studentPhone: student?.phone || undefined,
          studentAvatar: student?.avatarUrl || '/default-avatar.svg',
          requestedAt: requestedAtStr,
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
    } catch (error) {
      this.logger.error(
        `Failed to get PT dashboard data for user ${ptUserId}:`,
        error,
      );
      return {
        coachName: 'Coach PT',
        coachAvatar: undefined,
        totalVipStudents: 0,
        todaySessionsCount: 0,
        completedSessionsCount: 0,
        totalPackageSessionsCount: 0,
        warningsCount: 0,
        pendingMealCount: 0,
        pendingStudentRequestsCount: 0,
        pendingStudentRequests: [],
        todaySessions: [],
        pendingMeals: [],
        students: [],
      };
    }
  }

  async getPendingStudentRequests(ptUserId: string) {
    const pendingProfiles = await this.prisma.studentProfile.findMany({
      where: {
        trainerId: ptUserId,
        status: 'PENDING',
      },
      select: {
        id: true,
        studentId: true,
        assignedAt: true,
        status: true,
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
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
        studentAvatar: sp.student.avatarUrl || '/default-avatar.svg',
        requestedAt: sp.assignedAt.toISOString(),
        status: (spObj.status || 'PENDING') as
          'PENDING' | 'APPROVED' | 'REJECTED',
      };
    });
  }

  async approveStudentRequest(ptUserId: string, requestId: string) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        studentId: true,
        trainerId: true,
        student: {
          select: { fullName: true },
        },
      },
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
            title: 'Gói PT 1-1 (12 Buổi)',
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

    try {
      const ptUser = await this.prisma.user.findUnique({
        where: { id: ptUserId },
        select: { fullName: true },
      });
      const ptDisplayName = ptUser?.fullName || 'Huấn luyện viên';

      await this.notificationsService.sendNotification({
        userId: profile.studentId,
        title: 'Huấn Luyện Viên Đã Phê Duyệt!',
        message: `Coach ${ptDisplayName} đã chấp nhận yêu cầu ghép lớp 1:1. Chào mừng bạn tham gia huấn luyện!`,
        type: 'PT_ACCEPTED',
        linkUrl: '/training',
      });
    } catch {
      // Notification send is non-blocking
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
      select: {
        id: true,
        studentId: true,
        trainerId: true,
        student: {
          select: { fullName: true },
        },
      },
    });

    if (!profile || profile.trainerId !== ptUserId) {
      throw new NotFoundException('Không tìm thấy yêu cầu liên kết học viên');
    }

    await this.prisma.studentProfile.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });

    try {
      await this.notificationsService.sendNotification({
        userId: profile.studentId,
        title: 'Yêu Cầu Ghép PT Chưa Được Chấp Nhận',
        message: `Huấn luyện viên chưa thể nhận học viên vào lúc này. Bạn có thể kết nối với Coach khác.`,
        type: 'PT_REJECTED',
        linkUrl: '/profile',
      });
    } catch {
      // Notification send is non-blocking
    }

    return {
      success: true,
      requestId,
      studentName: profile.student.fullName,
      message: `Đã từ chối yêu cầu liên kết của học viên ${profile.student.fullName}`,
    };
  }

  async getStudentDetail(
    studentId: string,
    ptId?: string,
  ): Promise<PTStudentDetail> {
    if (ptId) {
      await this.verifyPtOwnsStudent(ptId, studentId);
    }
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        phone: true,
        gender: true,
        height: true,
        dateOfBirth: true,
        activityLevel: true,
        goal: true,
        targetWeight: true,
        bodyMetrics: {
          orderBy: { recordedAt: 'desc' },
          take: 10,
          select: {
            weight: true,
            height: true,
            bodyFat: true,
            muscleMass: true,
            recordedAt: true,
          },
        },
        progressPhotos: {
          orderBy: { takenAt: 'desc' },
          take: 10,
          select: {
            id: true,
            photoUrl: true,
            tag: true,
            takenAt: true,
          },
        },
        nutritionTargets: {
          orderBy: { effectiveDate: 'desc' },
          take: 5,
          select: {
            id: true,
            targetCalo: true,
            targetProtein: true,
            targetCarbs: true,
            targetFat: true,
            prescribedMealPlan: true,
            effectiveDate: true,
          },
        },
        userPackages: {
          where: { isActive: true },
          take: 1,
          select: {
            id: true,
            totalSessions: true,
            remainingSessions: true,
            startDate: true,
            endDate: true,
            gymPackage: {
              select: {
                id: true,
                title: true,
                price: true,
              },
            },
          },
        },
        workoutSchedules: {
          orderBy: { scheduledDate: 'desc' },
          take: 10,
          select: {
            id: true,
            title: true,
            note: true,
            scheduledDate: true,
            exercises: {
              select: {
                id: true,
                exerciseLibraryId: true,
                sets: true,
                reps: true,
                weight: true,
                exercise: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                    setupImageUrl: true,
                    startImageUrl: true,
                  },
                },
              },
            },
          },
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
    const targetWithPrescribed = student.nutritionTargets?.find(
      (t) => t.prescribedMealPlan && t.prescribedMealPlan.trim() !== '',
    );
    const mealPlanJson =
      latestTarget?.prescribedMealPlan ||
      targetWithPrescribed?.prescribedMealPlan;
    const pkg = student.userPackages?.[0];
    const latestSchedule =
      student.workoutSchedules?.find(
        (s) =>
          (s.exercises && s.exercises.length > 0) ||
          (s.note && s.note.trim().startsWith('[')),
      ) || student.workoutSchedules?.[0];

    const beforePhoto = student.progressPhotos.find(
      (p) => p.tag === 'BEFORE' || p.tag?.startsWith('BEFORE|'),
    );
    const afterPhoto = student.progressPhotos.find(
      (p) =>
        p.tag === 'AFTER' || p.tag?.startsWith('AFTER|') || p.tag === 'FRONT',
    );

    let assignedExercises: Array<{
      id: string;
      exerciseId?: string;
      name: string;
      category: string;
      sets: number;
      reps: number;
      weightInKg: number;
      dayOfWeek?: string;
      imageUrl?: string;
      setupImageUrl?: string;
      startImageUrl?: string;
    }> = [];

    if (latestSchedule?.exercises && latestSchedule.exercises.length > 0) {
      assignedExercises = latestSchedule.exercises.map((se) => ({
        id: se.id,
        exerciseId: se.exerciseLibraryId,
        name: se.exercise?.name || 'Bài tập',
        category: se.exercise?.category || 'FULL_BODY',
        sets: se.sets,
        reps: se.reps,
        weightInKg: se.weight || 0,
        dayOfWeek: 'Thứ 2 - 4 - 6',
        imageUrl:
          se.exercise?.setupImageUrl || se.exercise?.startImageUrl || undefined,
        setupImageUrl: se.exercise?.setupImageUrl || undefined,
        startImageUrl: se.exercise?.startImageUrl || undefined,
      }));
    } else if (latestSchedule?.note) {
      try {
        const parsed: unknown = JSON.parse(latestSchedule.note);
        if (Array.isArray(parsed)) {
          assignedExercises = parsed.map((item: Record<string, unknown>) => ({
            id: typeof item.id === 'string' ? item.id : `ae-${Date.now()}`,
            exerciseId:
              typeof item.exerciseId === 'string' ? item.exerciseId : undefined,
            name: typeof item.name === 'string' ? item.name : 'Bài tập',
            category:
              typeof item.category === 'string' ? item.category : 'FULL_BODY',
            sets: Number(item.sets) || 3,
            reps: Number(item.reps) || 12,
            weightInKg: Number(item.weightInKg) || 0,
            dayOfWeek:
              typeof item.dayOfWeek === 'string'
                ? item.dayOfWeek
                : 'Thứ 2 - 4 - 6',
            imageUrl:
              typeof item.imageUrl === 'string'
                ? item.imageUrl
                : typeof item.setupImageUrl === 'string'
                  ? item.setupImageUrl
                  : undefined,
            setupImageUrl:
              typeof item.setupImageUrl === 'string'
                ? item.setupImageUrl
                : undefined,
            startImageUrl:
              typeof item.startImageUrl === 'string'
                ? item.startImageUrl
                : undefined,
          }));
        }
      } catch {
        // regular note
      }
    }

    const earliestMetric = await this.prisma.bodyMetric.findFirst({
      where: { userId: studentId },
      orderBy: { recordedAt: 'asc' },
      select: { weight: true },
    });
    const initialWeight =
      earliestMetric?.weight ??
      student.targetWeight ??
      latestMetric?.weight ??
      0;

    let beforeWeight = initialWeight;
    let afterWeight = latestMetric?.weight ?? 0;

    if (beforePhoto) {
      if (beforePhoto.tag && beforePhoto.tag.includes('|')) {
        const parsed = parseFloat(beforePhoto.tag.split('|')[1]);
        beforeWeight = !isNaN(parsed) ? parsed : initialWeight;
      } else {
        beforeWeight = initialWeight;
      }
    }

    if (afterPhoto) {
      if (afterPhoto.tag && afterPhoto.tag.includes('|')) {
        const parsed = parseFloat(afterPhoto.tag.split('|')[1]);
        afterWeight = !isNaN(parsed) ? parsed : afterWeight;
      }
    }

    const currentWeight = latestMetric?.weight ?? student.targetWeight ?? 0;
    let targetWeight = student.targetWeight ?? undefined;
    if (targetWeight && currentWeight > 0) {
      const isGain =
        student.goal === 'GAIN_WEIGHT' ||
        student.goal === 'GAIN_MUSCLE' ||
        Boolean(initialWeight > 0 && targetWeight > initialWeight);
      const isLoss =
        student.goal === 'LOSE_WEIGHT' ||
        Boolean(initialWeight > 0 && targetWeight < initialWeight);

      if (isGain && currentWeight > targetWeight) {
        targetWeight = currentWeight;
      } else if (isLoss && currentWeight < targetWeight) {
        targetWeight = currentWeight;
      }
    }

    return {
      id: student.id,
      fullName: student.fullName,
      avatarUrl: student.avatarUrl || '/default-avatar.svg',
      email: student.email,
      phone: student.phone || undefined,
      gender: student.gender || 'MALE',
      goal: student.goal || undefined,
      targetWeight,
      initialWeight,
      packageName: pkg ? 'Gói PT 1:1' : 'Gói Tiêu chuẩn',
      remainingSessions: pkg?.remainingSessions ?? 0,
      totalSessions: pkg?.totalSessions ?? 0,
      assignedExercises,
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
      bodyMetricsHistory: [...student.bodyMetrics]
        .sort(
          (a, b) =>
            new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
        )
        .map((bm) => ({
          date: bm.recordedAt.toISOString(),
          displayDate: bm.recordedAt.toLocaleDateString('vi-VN'),
          weightKg: bm.weight,
          bodyFatPercent: bm.bodyFat ?? 0,
          muscleMassKg: bm.muscleMass ?? 0,
        })),
      beforeAfterPhotos: {
        beforeUrl: beforePhoto?.photoUrl || undefined,
        afterUrl: afterPhoto?.photoUrl || undefined,
        beforeWeight,
        afterWeight,
      },
      targetCalories: latestTarget?.targetCalo ?? 0,
      targetProtein: latestTarget?.targetProtein ?? 0,
      targetCarbs: latestTarget?.targetCarbs ?? 0,
      targetFat: latestTarget?.targetFat ?? 0,
      nutritionTarget: {
        targetCalories: latestTarget?.targetCalo ?? 0,
        proteinGrams: latestTarget?.targetProtein ?? 0,
        carbsGrams: latestTarget?.targetCarbs ?? 0,
        fatGrams: latestTarget?.targetFat ?? 0,
      },
      prescribedMealPlan: mealPlanJson
        ? (JSON.parse(mealPlanJson) as {
            breakfast?: string;
            lunch?: string;
            dinner?: string;
            snack?: string;
            note?: string;
          })
        : undefined,
      currentWorkoutTitle:
        latestSchedule?.title || 'Lịch Tập Tăng Cơ Cá Nhân Hóa',
    };
  }

  async getStudentPhotos(studentId: string, ptId?: string) {
    if (ptId) {
      await this.verifyPtOwnsStudent(ptId, studentId);
    }
    const [photos, bodyMetrics] = await Promise.all([
      this.prisma.progressPhoto.findMany({
        where: { userId: studentId },
        orderBy: { takenAt: 'desc' },
      }),
      this.prisma.bodyMetric.findMany({
        where: { userId: studentId },
        orderBy: { recordedAt: 'asc' },
        select: { weight: true, recordedAt: true },
      }),
    ]);

    const earliestWeight =
      bodyMetrics.length > 0 ? bodyMetrics[0].weight : null;
    const latestWeight =
      bodyMetrics.length > 0
        ? bodyMetrics[bodyMetrics.length - 1].weight
        : null;

    return photos.map((p) => {
      let cleanTag = p.tag || 'AFTER';
      let weightAtTime: number | null = null;

      if (cleanTag.includes('|')) {
        const parts = cleanTag.split('|');
        cleanTag = parts[0];
        const parsed = parseFloat(parts[1]);
        if (!isNaN(parsed)) {
          weightAtTime = parsed;
        }
      }

      if (weightAtTime === null) {
        if (cleanTag === 'BEFORE') {
          weightAtTime = earliestWeight;
        } else if (cleanTag === 'AFTER') {
          weightAtTime = latestWeight;
        }
      }

      return {
        ...p,
        tag: cleanTag,
        weightAtTime,
      };
    });
  }

  async addStudentPhoto(
    studentId: string,
    dto: CreateProgressPhotoDto,
    ptId?: string,
  ) {
    if (ptId) {
      await this.verifyPtOwnsStudent(ptId, studentId);
    }
    if (dto.weightAtTime && dto.weightAtTime > 0) {
      await this.prisma.bodyMetric.create({
        data: {
          userId: studentId,
          weight: dto.weightAtTime,
          recordedAt: dto.takenAt ? new Date(dto.takenAt) : new Date(),
        },
      });
    }

    const tagToSave =
      dto.weightAtTime && dto.weightAtTime > 0
        ? `${dto.tag || 'AFTER'}|${dto.weightAtTime}`
        : dto.tag || 'AFTER';

    const created = await this.prisma.progressPhoto.create({
      data: {
        userId: studentId,
        photoUrl: dto.photoUrl,
        tag: tagToSave,
        takenAt: dto.takenAt ? new Date(dto.takenAt) : new Date(),
      },
    });

    return {
      ...created,
      tag: dto.tag || 'AFTER',
      weightAtTime: dto.weightAtTime || null,
    };
  }

  async deleteStudentPhoto(studentId: string, photoId: string, ptId?: string) {
    if (ptId) {
      await this.verifyPtOwnsStudent(ptId, studentId);
    }
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

  async getStudentMeals(studentId: string, ptId?: string) {
    if (ptId) {
      await this.verifyPtOwnsStudent(ptId, studentId);
    }
    return this.prisma.mealLog.findMany({
      where: { userId: studentId },
      orderBy: { logDate: 'desc' },
      select: {
        id: true,
        mealName: true,
        logDate: true,
        totalCalories: true,
        totalProtein: true,
        totalCarbs: true,
        totalFat: true,
        items: {
          select: {
            id: true,
            foodName: true,
            weightInGram: true,
            calories: true,
            protein: true,
            carbs: true,
            fat: true,
          },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            comment: true,
            createdAt: true,
            pt: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async assignWorkoutToStudent(dto: AssignWorkoutDto, ptId?: string) {
    if (dto.studentId) {
      if (ptId) {
        await this.verifyPtOwnsStudent(ptId, dto.studentId);
      }
      const schedule = await this.prisma.workoutSchedule.create({
        data: {
          studentId: dto.studentId,
          title: dto.title ? String(dto.title) : 'Giáo Án Tập Luyện 1:1',
          scheduledDate: dto.scheduledDate
            ? new Date(dto.scheduledDate)
            : new Date(),
          note:
            dto.exercises && dto.exercises.length > 0
              ? JSON.stringify(dto.exercises)
              : dto.note
                ? String(dto.note)
                : 'Tập đúng phom dáng và đảm bảo đủ số reps.',
        },
      });

      if (Array.isArray(dto.exercises) && dto.exercises.length > 0) {
        for (const rawItem of dto.exercises) {
          const item = rawItem as {
            exerciseId?: string;
            name?: string;
            setupImageUrl?: string;
            imageUrl?: string;
            sets?: number;
            reps?: number;
            weightInKg?: number;
          };

          let exLib = await this.prisma.exerciseLibrary.findFirst({
            where: {
              OR: [
                ...(item.exerciseId ? [{ id: item.exerciseId }] : []),
                ...(item.name ? [{ name: item.name }] : []),
              ],
            },
            select: { id: true },
          });

          if (!exLib && item.name) {
            const img = item.setupImageUrl || item.imageUrl || undefined;
            const exId =
              item.exerciseId ||
              `ex-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            exLib = await this.prisma.exerciseLibrary.create({
              data: {
                id: exId,
                name: item.name,
                category: 'FULL_BODY',
                setupImageUrl: img,
                startImageUrl: img,
              },
              select: { id: true },
            });
          }

          if (exLib) {
            await this.prisma.scheduleExercise.create({
              data: {
                workoutScheduleId: schedule.id,
                exerciseLibraryId: exLib.id,
                sets: Number(item.sets) || 3,
                reps: Number(item.reps) || 12,
                weight: Number(item.weightInKg) || 0,
              },
            });
          }
        }
      }
    }

    if (dto.studentId) {
      try {
        await this.notificationsService.sendNotification({
          userId: dto.studentId,
          title: 'Kế Hoạch Tập Luyện Mới',
          message: `HLV vừa giao giáo án tập luyện mới: ${dto.title || 'Lịch tập 1:1'}`,
          type: 'WORKOUT_ASSIGNED',
          linkUrl: '/training',
        });
      } catch (err) {
        console.error('Failed to notify student of workout plan:', err);
      }
    }

    return {
      success: true,
      studentId: dto.studentId,
      workoutPlanTitle: dto.title ? String(dto.title) : undefined,
      message: 'Đã giao bài tập 1:1 thành công!',
    };
  }

  async assignNutritionToStudent(dto: AssignNutritionDto, ptId?: string) {
    if (dto.studentId) {
      if (ptId) {
        await this.verifyPtOwnsStudent(ptId, dto.studentId);
      }
      const targetCalories = Number(dto.targetCalories ?? 2200);
      const targetProtein = Number(
        dto.targetProtein ??
          dto.proteinGrams ??
          Math.round((targetCalories * 0.3) / 4),
      );
      const targetCarbs = Number(
        dto.targetCarbs ??
          dto.carbsGrams ??
          Math.round((targetCalories * 0.4) / 4),
      );
      const targetFat = Number(
        dto.targetFat ?? dto.fatGrams ?? Math.round((targetCalories * 0.3) / 9),
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

    if (dto.studentId) {
      try {
        const targetCalories = Number(dto.targetCalories ?? 2200);
        await this.notificationsService.sendNotification({
          userId: dto.studentId,
          title: 'Thực Đơn & Dinh Dưỡng Mới',
          message: `HLV vừa cập nhật mục tiêu dinh dưỡng (${targetCalories} kcal) & thực đơn mới cho bạn.`,
          type: 'NUTRITION_ASSIGNED',
          linkUrl: '/nutrition',
        });
      } catch (err) {
        console.error('Failed to notify student of nutrition plan:', err);
      }
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

  async updateInBody(dto: UpdateInBodyDto, ptId?: string) {
    if (dto.studentId) {
      if (ptId) {
        await this.verifyPtOwnsStudent(ptId, dto.studentId);
      }
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

      if (dto.weightKg && dto.weightKg > 0) {
        const student = await this.prisma.user.findUnique({
          where: { id: dto.studentId },
          select: { targetWeight: true, goal: true },
        });

        if (student?.targetWeight) {
          const isGain =
            student.goal === 'GAIN_WEIGHT' || student.goal === 'GAIN_MUSCLE';
          const isLoss = student.goal === 'LOSE_WEIGHT';

          if (
            (isGain && dto.weightKg > student.targetWeight) ||
            (isLoss && dto.weightKg < student.targetWeight) ||
            (!student.goal && dto.weightKg > student.targetWeight)
          ) {
            await this.prisma.user.update({
              where: { id: dto.studentId },
              data: { targetWeight: dto.weightKg },
            });
          }
        }
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
    let studentId: string | null = null;
    let workoutScheduleTitle = 'Ca tập 1:1';

    // 1. Kiểm tra xem sessionId có phải là WorkoutSchedule ID không
    const schedule = await this.prisma.workoutSchedule.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        studentId: true,
        title: true,
        isCompleted: true,
      },
    });

    if (schedule) {
      studentId = schedule.studentId;
      workoutScheduleTitle = schedule.title;

      // IDEMPOTENT GUARD: Nếu ca dạy đã hoàn thành/điểm danh rồi -> không trừ thêm buổi!
      if (schedule.isCompleted) {
        const activePkg = await this.prisma.memberPackage.findFirst({
          where: {
            userId: studentId,
            isActive: true,
          },
          orderBy: { startDate: 'desc' },
        });

        const studentUser = await this.prisma.user.findUnique({
          where: { id: studentId },
          select: { fullName: true },
        });

        return {
          success: true,
          sessionId,
          alreadyCheckedIn: true,
          studentName: studentUser?.fullName || 'Học viên',
          remainingSessions: activePkg?.remainingSessions ?? 0,
          totalSessions: activePkg?.totalSessions ?? 0,
          message: 'Ca dạy này đã được điểm danh trước đó rồi!',
        };
      }

      // Đánh dấu ca tập đã hoàn thành
      await this.prisma.workoutSchedule.update({
        where: { id: schedule.id },
        data: { isCompleted: true },
      });
    } else {
      // 2. Fallback nếu sessionId là dạng 'session-custom-...' hoặc Profile/User ID
      const cleanId = sessionId.replace(/^session-(custom-)?/, '').trim();
      const profile = await this.prisma.studentProfile.findFirst({
        where: {
          OR: [
            { id: cleanId },
            { studentId: cleanId },
            { id: sessionId },
            { studentId: sessionId },
          ],
        },
      });

      if (profile) {
        studentId = profile.studentId;
      } else {
        const user = await this.prisma.user.findFirst({
          where: { OR: [{ id: cleanId }, { id: sessionId }] },
        });
        if (user) {
          studentId = user.id;
        }
      }
    }

    if (!studentId) {
      // Tìm học viên đầu tiên nếu không thể parse ID
      const firstStudent = await this.prisma.studentProfile.findFirst({
        where: { status: 'APPROVED' },
      });
      if (firstStudent) {
        studentId = firstStudent.studentId;
      } else {
        throw new NotFoundException(
          'Không tìm thấy học viên hoặc ca dạy để điểm danh',
        );
      }
    }

    // 2.5. Deduplication check: Kiểm tra lịch sử điểm danh gần đây (trong vòng 15 phút)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentAttendance = await this.prisma.attendanceHistory.findFirst({
      where: {
        studentId: studentId,
        checkInTime: { gte: fifteenMinutesAgo },
      },
    });

    if (recentAttendance) {
      const activePkg = await this.prisma.memberPackage.findFirst({
        where: { userId: studentId, isActive: true },
        orderBy: { startDate: 'desc' },
      });

      const studentUser = await this.prisma.user.findUnique({
        where: { id: studentId },
        select: { fullName: true },
      });

      return {
        success: true,
        sessionId,
        alreadyCheckedIn: true,
        studentName: studentUser?.fullName || 'Học viên',
        remainingSessions: activePkg?.remainingSessions ?? 0,
        totalSessions: activePkg?.totalSessions ?? 0,
        message: 'Học viên vừa được điểm danh gần đây, không trừ thêm buổi!',
      };
    }

    // 3. Tìm hoặc tạo gói tập active của học viên
    let activePkg = await this.prisma.memberPackage.findFirst({
      where: {
        userId: studentId,
        isActive: true,
      },
      orderBy: { startDate: 'desc' },
    });

    if (!activePkg) {
      let gymPkg = await this.prisma.gymPackage.findFirst();
      if (!gymPkg) {
        gymPkg = await this.prisma.gymPackage.create({
          data: {
            title: 'Gói PT 1-1 (12 Buổi)',
            description: 'Gói tập huấn luyện viên 1:1 cá nhân hóa',
            price: 3600000,
            durationDays: 90,
            totalSessions: 12,
          },
        });
      }

      activePkg = await this.prisma.memberPackage.create({
        data: {
          userId: studentId,
          packageId: gymPkg.id,
          totalSessions: 12,
          remainingSessions: 12,
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // 4. Trừ 1 buổi và ghi vào cơ sở dữ liệu
    const newRemainingSessions = Math.max(0, activePkg.remainingSessions - 1);
    const updatedPkg = await this.prisma.memberPackage.update({
      where: { id: activePkg.id },
      data: {
        remainingSessions: newRemainingSessions,
      },
    });

    // 5. Tạo lịch sử điểm danh trong attendance_histories
    await this.prisma.attendanceHistory.create({
      data: {
        memberPackageId: activePkg.id,
        studentId: studentId,
        checkInTime: new Date(),
        status: 'CHECKED_IN',
        note: `Điểm danh thành công: ${workoutScheduleTitle}`,
      },
    });

    const studentUser = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { fullName: true },
    });

    try {
      const studentProfile = await this.prisma.studentProfile.findFirst({
        where: { studentId: studentId, status: 'APPROVED' },
        include: { trainer: { select: { fullName: true } } },
      });
      const ptName = studentProfile?.trainer?.fullName || 'HLV cá nhân';

      await this.notificationsService.sendNotification({
        userId: studentId,
        title: 'Điểm Danh & Trừ Buổi Tập',
        message: `HLV ${ptName} đã điểm danh (Trừ 1 buổi). Số buổi còn lại: ${updatedPkg.remainingSessions}/${activePkg.totalSessions} buổi.`,
        type: 'SESSION_DEDUCT',
        linkUrl: '/training',
      });
    } catch (pushError) {
      console.error(
        'Failed to dispatch session deduction notification:',
        pushError,
      );
    }

    return {
      success: true,
      sessionId,
      studentName: studentUser?.fullName || 'Học viên',
      remainingSessions: updatedPkg.remainingSessions,
      totalSessions: activePkg.totalSessions,
      message: `Đã điểm danh & trừ 1 buổi thành công! Còn lại: ${updatedPkg.remainingSessions}/${activePkg.totalSessions} buổi.`,
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

    try {
      const meal = await this.prisma.mealLog.findUnique({
        where: { id: mealId },
        select: { userId: true },
      });
      if (meal?.userId) {
        await this.notificationsService.sendNotification({
          userId: meal.userId,
          title: '🍽️ Bữa Ăn Đã Được HLV Đánh Giá',
          message:
            note || 'HLV đã duyệt bữa ăn của bạn - Đạt chuẩn dinh dưỡng!',
          type: 'MEAL_REVIEW',
          linkUrl: '/nutrition',
        });
      }
    } catch (err) {
      console.error('Failed to notify student of meal review:', err);
    }

    return {
      success: true,
      mealId,
      status: 'APPROVED',
      note: note || 'PT đã duyệt bữa ăn - Đạt chuẩn dinh dưỡng!',
      message: 'Đã phê duyệt bữa ăn của học viên thành công!',
    };
  }

  async getPtCodeAndQr(
    ptUserId: string,
    origin?: string,
  ): Promise<PTCodeQrData> {
    const ptUser = await this.prisma.user.findUnique({
      where: { id: ptUserId },
    });

    const removeVietnameseTones = (str: string): string => {
      return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase();
    };

    let ptCode = 'PT-HUY066';
    if (ptUser) {
      const nameParts = ptUser.fullName.trim().split(/\s+/);
      const lastName = nameParts[nameParts.length - 1] || 'PT';
      const cleanName =
        removeVietnameseTones(lastName).slice(0, 4) ||
        removeVietnameseTones(ptUser.fullName).slice(0, 4) ||
        'COACH';
      const idPart = ptUser.id
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 3)
        .toUpperCase();
      ptCode = `PT-${cleanName}${idPart}`;
    }

    const baseUrl = (
      origin ||
      process.env.FRONTEND_URL ||
      'https://nutricore-olive.vercel.app'
    ).replace(/\/+$/, '');
    const qrTargetUrl = `${baseUrl}/invite?code=${ptCode}&pt=${ptUserId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrTargetUrl)}`;

    return {
      ptCode,
      qrCodeUrl,
      coachName: ptUser ? `Coach ${ptUser.fullName}` : 'Hệ Thống NutriCore',
    };
  }

  async sendStudentInvite(
    ptUserId: string,
    dto: SendInviteDto,
    origin?: string,
  ) {
    const inviteCode = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const baseUrl = (
      dto.clientBaseUrl ||
      origin ||
      process.env.FRONTEND_URL ||
      'https://nutricore-olive.vercel.app'
    ).replace(/\/+$/, '');
    const inviteUrl = `${baseUrl}/invite?code=${inviteCode}&pt=${ptUserId}`;

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
            title: dto.packageName || 'Gói PT 1-1',
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
    if (!rawCode) {
      throw new BadRequestException('Vui lòng nhập Mã PT hoặc Mã mời!');
    }

    const removeVietnameseTones = (str: string): string => {
      return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase();
    };

    // 1. Find PT user by exact ID, email, or phone
    let ptUser = await this.prisma.user.findFirst({
      where: {
        role: 'PT',
        OR: [
          { id: rawCode },
          { email: { equals: rawCode, mode: 'insensitive' } },
          { phone: rawCode },
        ],
      },
    });

    // 2. If not found by exact ID/email/phone, match generated PT code or name
    if (!ptUser) {
      const allPts = await this.prisma.user.findMany({
        where: { role: 'PT' },
      });

      const cleanCode = removeVietnameseTones(rawCode.replace(/^PT-?/i, ''));

      if (allPts.length > 0 && cleanCode) {
        ptUser =
          allPts.find((p) => {
            const nameParts = p.fullName.trim().split(/\s+/);
            const lastName = nameParts[nameParts.length - 1] || 'PT';
            const cleanName =
              removeVietnameseTones(lastName).slice(0, 4) ||
              removeVietnameseTones(p.fullName).slice(0, 4) ||
              'COACH';
            const idPart = p.id
              .replace(/[^a-zA-Z0-9]/g, '')
              .slice(0, 3)
              .toUpperCase();
            const expectedCode = `PT-${cleanName}${idPart}`.toUpperCase();
            const rawUpper = rawCode.toUpperCase();

            return (
              expectedCode === rawUpper ||
              expectedCode.includes(cleanCode) ||
              removeVietnameseTones(p.fullName).includes(cleanCode) ||
              p.id.toUpperCase().startsWith(cleanCode) ||
              p.email.toUpperCase().includes(cleanCode)
            );
          }) || null;
      }
    }

    if (!ptUser) {
      throw new NotFoundException(
        'Không tìm thấy Huấn Luyện Viên với mã PT này. Vui lòng kiểm tra lại!',
      );
    }

    const trainerId = ptUser.id;

    // Check if already approved with this PT
    const existingProfile = await this.prisma.studentProfile.findUnique({
      where: {
        trainerId_studentId: {
          trainerId,
          studentId: studentUserId,
        },
      },
    });

    if (existingProfile && existingProfile.status === 'APPROVED') {
      return {
        success: true,
        message: `Bạn đã được liên kết với Coach ${ptUser.fullName}!`,
        coachName: ptUser.fullName,
      };
    }

    // Remove any previous pending requests for this student with other PTs
    await this.prisma.studentProfile.deleteMany({
      where: {
        studentId: studentUserId,
        trainerId: { not: trainerId },
        status: 'PENDING',
      },
    });

    // Upsert StudentProfile relation in DB with status PENDING
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
        status: 'PENDING',
      },
      update: {
        status: 'PENDING',
        assignedAt: new Date(),
      },
    });

    try {
      const student = await this.prisma.user.findUnique({
        where: { id: studentUserId },
        select: { fullName: true, email: true },
      });
      const studentName = student?.fullName || student?.email || 'Học viên';

      await this.notificationsService.sendNotification({
        userId: trainerId,
        title: 'Yêu Cầu Ghép Lớp 1:1 Mới',
        message: `${studentName} vừa gửi yêu cầu ghép lớp với bạn. Vui lòng kiểm tra và duyệt yêu cầu.`,
        type: 'STUDENT_REQUEST',
        linkUrl: '/pt',
      });
    } catch (err) {
      console.error('Failed to notify PT of new bind request:', err);
    }

    return {
      success: true,
      studentUserId,
      ptCode: dto.ptCodeOrInviteCode,
      coachName: `Coach ${ptUser.fullName}`,
      message: `Đã gửi lời mời kết nối tới Coach ${ptUser.fullName}! Đang chờ HLV phê duyệt.`,
    };
  }

  async cancelBindRequest(studentUserId: string) {
    const deleted = await this.prisma.studentProfile.deleteMany({
      where: {
        studentId: studentUserId,
        status: 'PENDING',
      },
    });
    return {
      success: true,
      message:
        deleted.count > 0
          ? 'Đã hủy yêu cầu liên kết PT thành công!'
          : 'Không có yêu cầu chờ duyệt nào!',
    };
  }

  async updateStudentSessions(
    studentId: string,
    dto: UpdateStudentSessionsDto,
    ptId?: string,
  ) {
    if (ptId) {
      await this.verifyPtOwnsStudent(ptId, studentId);
    }
    if (
      dto.totalSessions !== undefined &&
      dto.remainingSessions !== undefined &&
      dto.remainingSessions > dto.totalSessions
    ) {
      throw new BadRequestException(
        'Số buổi còn lại không được lớn hơn tổng số buổi',
      );
    }

    if (
      (dto.totalSessions !== undefined && dto.totalSessions < 0) ||
      (dto.remainingSessions !== undefined && dto.remainingSessions < 0)
    ) {
      throw new BadRequestException('Số buổi không được nhỏ hơn 0!');
    }

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
          title: dto.packageName || 'Gói PT 1-1',
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
          totalSessions: dto.totalSessions ?? 0,
          remainingSessions: dto.remainingSessions ?? dto.totalSessions ?? 0,
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
      });
    }

    const remaining = dto.remainingSessions ?? 0;
    const total = dto.totalSessions ?? 0;

    if (
      dto.remainingSessions !== undefined ||
      dto.totalSessions !== undefined
    ) {
      try {
        await this.notificationsService.sendNotification({
          userId: studentId,
          title: 'Cập Nhật Gói Tập & Số Buổi',
          message: `Huấn luyện viên đã cập nhật số buổi tập của bạn: ${remaining}/${total} buổi.`,
          type: 'PACKAGE_UPDATE',
          linkUrl: '/training',
        });
      } catch (err) {
        console.error('Failed to notify student of session update:', err);
      }
    }

    return {
      success: true,
      studentId,
      updatedInfo: dto,
      message: `Đã cập nhật gói tập ${dto.packageName || 'PT 1:1'} (${remaining}/${total} buổi)`,
    };
  }

  async getPtProfile(ptUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: ptUserId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        ptApplication: {
          select: {
            bio: true,
            experienceYears: true,
            specialties: true,
            certificateUrl: true,
          },
        },
        studentProfiles: {
          select: { id: true },
        },
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
      avatarUrl?: string;
      bio?: string;
      experienceYears?: number;
      specialties?: string[];
      certificateUrl?: string;
    },
  ) {
    if (dto.fullName || dto.phone || dto.avatarUrl) {
      await this.prisma.user.update({
        where: { id: ptUserId },
        data: {
          ...(dto.fullName && { fullName: dto.fullName }),
          ...(dto.phone && { phone: dto.phone }),
          ...(dto.avatarUrl && { avatarUrl: dto.avatarUrl }),
        },
      });
    }

    const existingApp = await this.prisma.ptApplication.findUnique({
      where: { userId: ptUserId },
    });

    const shouldResetToPending = existingApp?.status === 'REJECTED';

    await this.prisma.ptApplication.upsert({
      where: { userId: ptUserId },
      create: {
        userId: ptUserId,
        bio: dto.bio || 'HLV Cá Nhân Chuyên Nghiệp 1:1',
        experienceYears: dto.experienceYears || 3,
        specialties: dto.specialties || ['Tăng cơ giảm mỡ'],
        certificateUrl: dto.certificateUrl,
        status: 'PENDING',
      },
      update: {
        ...(dto.bio && { bio: dto.bio }),
        ...(dto.experienceYears && { experienceYears: dto.experienceYears }),
        ...(dto.specialties && { specialties: dto.specialties }),
        ...(dto.certificateUrl !== undefined && {
          certificateUrl: dto.certificateUrl,
        }),
        ...(shouldResetToPending && {
          status: 'PENDING',
          adminNote: null,
        }),
      },
    });

    if (!existingApp || shouldResetToPending) {
      try {
        const admins = await this.prisma.user.findMany({
          where: { role: 'ADMIN' },
          select: { id: true },
        });

        const ptUser = await this.prisma.user.findUnique({
          where: { id: ptUserId },
          select: { fullName: true, email: true },
        });
        const ptName = ptUser?.fullName || ptUser?.email || 'Huấn luyện viên';

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
        console.error('Failed to notify admins of PT application update:', err);
      }
    }

    return {
      success: true,
      ptUserId,
      message: 'Cập nhật hồ sơ cá nhân HLV thành công!',
    };
  }

  async getPtScheduleRange(
    ptUserId: string,
    startDateStr?: string,
    endDateStr?: string,
  ): Promise<PTSessionItem[]> {
    const approvedProfiles = await this.prisma.studentProfile.findMany({
      where: { trainerId: ptUserId, status: 'APPROVED' },
      select: { studentId: true },
    });

    const studentIds = approvedProfiles.map((sp) => sp.studentId);
    if (studentIds.length === 0) return [];

    let startDate: Date;
    let endDate: Date;

    if (startDateStr) {
      startDate = new Date(startDateStr);
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    }

    if (endDateStr) {
      endDate = new Date(endDateStr);
      endDate.setHours(23, 59, 59, 999);
    } else {
      endDate = new Date();
      endDate.setDate(endDate.getDate() + 14);
      endDate.setHours(23, 59, 59, 999);
    }

    const schedules = await this.prisma.workoutSchedule.findMany({
      where: {
        studentId: { in: studentIds },
        scheduledDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        title: true,
        note: true,
        scheduledDate: true,
        studentId: true,
        isCompleted: true,
        student: {
          select: {
            fullName: true,
            avatarUrl: true,
            userPackages: {
              where: { isActive: true },
              take: 1,
              select: {
                totalSessions: true,
                remainingSessions: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    const timeSlots = [
      '08:00 - 09:00',
      '10:00 - 11:00',
      '14:00 - 15:00',
      '16:30 - 17:30',
      '18:00 - 19:00',
      '19:30 - 20:30',
    ];

    return schedules.map((ws, idx) => {
      const student = ws.student;
      const pkg = student?.userPackages?.[0];
      const isCheckedIn = Boolean(ws.isCompleted);

      let timeSlot = timeSlots[idx % timeSlots.length] || '08:00 - 09:00';
      if (ws.note && ws.note.includes(' - ')) {
        const match = ws.note.match(/\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}/);
        if (match) timeSlot = match[0];
      }

      const dateObj = new Date(ws.scheduledDate);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const scheduledDateFormatted = `${year}-${month}-${day}`;

      return {
        id: ws.id,
        timeSlot,
        studentId: ws.studentId,
        studentName: student?.fullName || 'Học viên',
        studentAvatar: student?.avatarUrl || '/default-avatar.svg',
        workoutName: ws.title || 'Giáo Án Tập Luyện 1:1',
        status: isCheckedIn ? 'CHECKED_IN' : 'PENDING',
        remainingSessions: pkg?.remainingSessions ?? 0,
        totalSessions: pkg?.totalSessions ?? 0,
        scheduledDate: scheduledDateFormatted,
      };
    });
  }

  async createPtScheduleSession(
    ptUserId: string,
    dto: {
      studentId: string;
      title: string;
      scheduledDate: string;
      timeSlot?: string;
      note?: string;
    },
  ) {
    if (!dto.studentId) {
      throw new BadRequestException('Vui lòng chọn học viên');
    }

    const scheduledDate = dto.scheduledDate
      ? new Date(
          dto.scheduledDate +
            (dto.scheduledDate.includes('T') ? '' : 'T08:00:00'),
        )
      : new Date();

    if (dto.timeSlot) {
      const match = dto.timeSlot.match(
        /^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/,
      );
      if (match) {
        const [startH, startM] = match[1].split(':').map(Number);
        const [endH, endM] = match[2].split(':').map(Number);
        const startMins = startH * 60 + startM;
        const endMins = endH * 60 + endM;
        if (endMins <= startMins) {
          throw new BadRequestException(
            'Giờ kết thúc ca tập phải sau giờ bắt đầu',
          );
        }
      }
    }

    const note = dto.timeSlot
      ? `Khung giờ: ${dto.timeSlot}${dto.note ? ` | ${dto.note}` : ''}`
      : dto.note || 'Lịch tập được xếp bởi HLV';

    const schedule = await this.prisma.workoutSchedule.create({
      data: {
        studentId: dto.studentId,
        title: dto.title || 'Giáo Án Tập Luyện 1:1',
        scheduledDate,
        note,
      },
      select: {
        id: true,
        title: true,
        scheduledDate: true,
        studentId: true,
        student: {
          select: {
            fullName: true,
            avatarUrl: true,
            userPackages: {
              where: { isActive: true },
              take: 1,
              select: {
                totalSessions: true,
                remainingSessions: true,
              },
            },
          },
        },
      },
    });

    const dateObj = new Date(schedule.scheduledDate);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const scheduledDateFormatted = `${year}-${month}-${day}`;

    const pkg = schedule.student?.userPackages?.[0];

    return {
      id: schedule.id,
      timeSlot: dto.timeSlot || '08:00 - 09:00',
      studentId: schedule.studentId,
      studentName: schedule.student?.fullName || 'Học viên',
      studentAvatar: schedule.student?.avatarUrl || '/default-avatar.svg',
      workoutName: schedule.title,
      status: 'PENDING' as const,
      remainingSessions: pkg?.remainingSessions ?? 0,
      totalSessions: pkg?.totalSessions ?? 0,
      scheduledDate: scheduledDateFormatted,
    };
  }

  async createPtScheduleBatch(
    ptUserId: string,
    dto: {
      studentId: string;
      title: string;
      timeSlot?: string;
      dates: string[];
    },
  ) {
    if (!dto.studentId) {
      throw new BadRequestException('Vui lòng chọn học viên');
    }
    if (!dto.dates || dto.dates.length === 0) {
      throw new BadRequestException(
        'Vui lòng chọn ít nhất một ngày để xếp lịch',
      );
    }

    if (dto.timeSlot) {
      const match = dto.timeSlot.match(
        /^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/,
      );
      if (match) {
        const [startH, startM] = match[1].split(':').map(Number);
        const [endH, endM] = match[2].split(':').map(Number);
        const startMins = startH * 60 + startM;
        const endMins = endH * 60 + endM;
        if (endMins <= startMins) {
          throw new BadRequestException(
            'Giờ kết thúc ca tập phải sau giờ bắt đầu',
          );
        }
      }
    }

    const note = dto.timeSlot
      ? `Khung giờ: ${dto.timeSlot} | Tự động xếp lịch`
      : 'Tự động xếp lịch HLV';

    const createPromises = dto.dates.map((dateStr) => {
      const scheduledDate = new Date(
        dateStr + (dateStr.includes('T') ? '' : 'T08:00:00'),
      );
      return this.prisma.workoutSchedule.create({
        data: {
          studentId: dto.studentId,
          title: dto.title || 'Giáo Án Tập Luyện 1:1',
          scheduledDate,
          note,
        },
      });
    });

    const results = await Promise.all(createPromises);
    return {
      message: `Đã tự động xếp thành công ${results.length} buổi tập!`,
      count: results.length,
    };
  }
}
