import {
  BadRequestException,
  Injectable,
  NotFoundException,
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

@Injectable()
export class PtService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardData(ptUserId: string): Promise<PTDashboardData> {
    const ptUser = await this.prisma.user.findUnique({
      where: { id: ptUserId },
      select: { fullName: true, avatarUrl: true },
    });

    const coachName = ptUser ? `Coach ${ptUser.fullName}` : 'Coach PT';
    const coachAvatar = ptUser?.avatarUrl || undefined;

    // Find official approved students assigned to this PT
    const approvedProfiles = await this.prisma.studentProfile.findMany({
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
    });

    const totalVipStudents = approvedProfiles.length;

    // Calculate session counts from member packages
    let totalPackageSessionsCount = 0;
    let remainingSessionsSum = 0;

    const students = approvedProfiles.map((sp) => {
      const student = sp.student;
      const pkg = student.userPackages?.[0];
      const totalSessions = pkg?.totalSessions ?? 0;
      const remainingSessions = pkg?.remainingSessions ?? 0;

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

    // Check attendance history from DB for all PT students (ONLY for today's sessions)
    const studentIds = approvedProfiles.map((sp) => sp.studentId);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

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
    ];

    const todaySessions: PTSessionItem[] = todaySchedules.map((ws, idx) => {
      const student = ws.student;
      const pkg = student?.userPackages?.[0];
      const isCheckedIn = Boolean(ws.isCompleted);

      return {
        id: ws.id,
        timeSlot: timeSlots[idx % timeSlots.length] || '08:00 - 09:00',
        studentId: ws.studentId,
        studentName: student?.fullName || 'Học viên',
        studentAvatar:
          student?.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        workoutName: ws.title || 'Giáo Án Tập Luyện 1:1',
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

    const beforePhoto = student.progressPhotos.find((p) => p.tag === 'BEFORE');
    const afterPhoto = student.progressPhotos.find(
      (p) => p.tag === 'AFTER' || p.tag === 'FRONT',
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

    return {
      id: student.id,
      fullName: student.fullName,
      avatarUrl:
        student.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      email: student.email,
      phone: student.phone || undefined,
      gender: student.gender || 'MALE',
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

  async assignWorkoutToStudent(dto: AssignWorkoutDto) {
    if (dto.studentId) {
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
    let studentId: string | null = null;
    let workoutScheduleTitle = 'Ca tập 1:1';

    // 1. Kiểm tra xem sessionId có phải là WorkoutSchedule ID không
    const schedule = await this.prisma.workoutSchedule.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        studentId: true,
        title: true,
      },
    });

    if (schedule) {
      studentId = schedule.studentId;
      workoutScheduleTitle = schedule.title;
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

      const removeVietnameseTones = (str: string): string => {
        return str
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/Đ/g, 'D')
          .replace(/[^a-zA-Z0-9]/g, '')
          .toUpperCase();
      };

      if (allPts.length > 0) {
        const cleanCode = removeVietnameseTones(rawCode.replace(/PT-/i, ''));
        ptUser =
          allPts.find(
            (p) =>
              removeVietnameseTones(p.fullName).includes(cleanCode) ||
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
        studentAvatar:
          student?.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
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
      studentAvatar:
        schedule.student?.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      workoutName: schedule.title,
      status: 'PENDING' as const,
      remainingSessions: pkg?.remainingSessions ?? 0,
      totalSessions: pkg?.totalSessions ?? 0,
      scheduledDate: scheduledDateFormatted,
    };
  }
}
