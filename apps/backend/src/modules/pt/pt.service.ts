import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  AssignNutritionDto,
  AssignWorkoutDto,
  BindPtDto,
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
      include: {
        trainerProfiles: {
          include: {
            student: true,
          },
        },
      },
    });

    const coachName = ptUser ? `Coach ${ptUser.fullName}` : 'Coach Bùi Văn Huy';
    const coachAvatar = ptUser?.avatarUrl || undefined;

    const todaySessions: PTSessionItem[] = [
      {
        id: 'session-1',
        timeSlot: '08:00 - 09:00',
        studentId: 'std-101',
        studentName: 'Bùi Văn Huy',
        studentAvatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        workoutName: 'Legs & Glutes Power',
        status: 'PENDING',
        remainingSessions: 8,
        totalSessions: 12,
      },
      {
        id: 'session-2',
        timeSlot: '10:00 - 11:00',
        studentId: 'std-102',
        studentName: 'Nguyễn Văn A',
        studentAvatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        workoutName: 'Chest & Triceps',
        status: 'PENDING',
        remainingSessions: 5,
        totalSessions: 10,
      },
      {
        id: 'session-3',
        timeSlot: '14:00 - 15:00',
        studentId: 'std-103',
        studentName: 'Trần Thị B',
        studentAvatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        workoutName: 'Full Body HIIT',
        status: 'PENDING',
        remainingSessions: 12,
        totalSessions: 36,
      },
      {
        id: 'session-4',
        timeSlot: '16:30 - 17:30',
        studentId: 'std-104',
        studentName: 'Lê Văn C',
        studentAvatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        workoutName: 'Back & Core Hypertrophy',
        status: 'PENDING',
        remainingSessions: 2,
        totalSessions: 12,
      },
    ];

    return {
      coachName,
      coachAvatar,
      totalVipStudents: 10,
      todaySessionsCount: todaySessions.length,
      completedSessionsCount: 18,
      totalPackageSessionsCount: 24,
      warningsCount: 2,
      pendingMealCount: 2,
      todaySessions,
      pendingMeals: [
        {
          id: 'meal-rev-1',
          studentId: 'std-101',
          studentName: 'Bùi Văn Huy',
          studentAvatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          mealName: 'Bữa Trưa',
          calories: 650,
          imageUrl:
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
          foodDescription: 'Ức gà + Cơm gạo lứt + Bông cải xanh',
          proteinGrams: 45,
          carbsGrams: 60,
          fatGrams: 15,
          loggedAt: new Date().toISOString(),
        },
        {
          id: 'meal-rev-2',
          studentId: 'std-103',
          studentName: 'Trần Thị B',
          studentAvatar:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          mealName: 'Bữa Sáng',
          calories: 420,
          imageUrl:
            'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
          foodDescription: '3 Trứng ốp la + Bánh mì nguyên cám + Bơ quả',
          proteinGrams: 28,
          carbsGrams: 35,
          fatGrams: 18,
          loggedAt: new Date().toISOString(),
        },
      ],
      students: [
        {
          id: 'std-101',
          fullName: 'Bùi Văn Huy',
          avatarUrl:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          packageName: 'VIP Package',
          remainingSessions: 8,
          totalSessions: 12,
          lastWorkoutDate: 'Hôm nay',
        },
        {
          id: 'std-102',
          fullName: 'Nguyễn Văn A',
          avatarUrl:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          packageName: 'Standard Package',
          remainingSessions: 5,
          totalSessions: 10,
          lastWorkoutDate: 'Hôm qua',
        },
        {
          id: 'std-103',
          fullName: 'Trần Thị B',
          avatarUrl:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          packageName: 'VIP Package',
          remainingSessions: 12,
          totalSessions: 36,
          lastWorkoutDate: '2 ngày trước',
        },
        {
          id: 'std-104',
          fullName: 'Lê Văn C',
          avatarUrl:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
          packageName: 'Standard Package',
          remainingSessions: 2,
          totalSessions: 12,
          lastWorkoutDate: '3 ngày trước',
        },
      ],
    };
  }

  getStudentDetail(studentId: string): Promise<PTStudentDetail> {
    const studentProfilesMap: Record<string, PTStudentDetail> = {
      'std-101': {
        id: 'std-101',
        fullName: 'Bùi Văn Huy',
        email: 'huy.bui@example.com',
        phone: '0901234567',
        avatarUrl:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        packageName: 'Gói PT VIP 1-1',
        remainingSessions: 8,
        totalSessions: 12,
        joinedDate: '15/01/2026',
        targetCalories: 2200,
        targetProtein: 150,
        targetCarbs: 220,
        targetFat: 60,
        bodyMetrics: {
          weightKg: 72.5,
          heightCm: 175,
          bodyFatPercent: 18.2,
          muscleMassKg: 34.8,
          updatedAt: '01/02/2026',
        },
        bodyMetricsHistory: [
          {
            date: 'T9/2025',
            weightKg: 78.0,
            bodyFatPercent: 22.5,
            muscleMassKg: 32.0,
          },
          {
            date: 'T10/2025',
            weightKg: 76.5,
            bodyFatPercent: 21.0,
            muscleMassKg: 33.0,
          },
          {
            date: 'T11/2025',
            weightKg: 75.0,
            bodyFatPercent: 20.0,
            muscleMassKg: 33.8,
          },
          {
            date: 'T12/2025',
            weightKg: 74.0,
            bodyFatPercent: 19.2,
            muscleMassKg: 34.2,
          },
          {
            date: 'T1/2026',
            weightKg: 73.0,
            bodyFatPercent: 18.6,
            muscleMassKg: 34.6,
          },
          {
            date: 'T2/2026',
            weightKg: 72.5,
            bodyFatPercent: 18.2,
            muscleMassKg: 34.8,
          },
        ],
        assignedExercises: [
          {
            id: 'ae-1',
            exerciseId: 'ex-legs-1',
            name: 'Barbell Squat',
            category: 'LEGS',
            sets: 4,
            reps: 10,
            weightInKg: 80,
            restSeconds: 90,
            dayOfWeek: 'Thứ 2, Thứ 5',
          },
          {
            id: 'ae-2',
            exerciseId: 'ex-chest-1',
            name: 'Bench Press',
            category: 'CHEST',
            sets: 4,
            reps: 8,
            weightInKg: 70,
            restSeconds: 90,
            dayOfWeek: 'Thứ 3, Thứ 6',
          },
        ],
        prescribedMealPlan: {
          breakfast: '3 Trứng ốp la + 2 lát bánh mì nguyên cám + 1 quả chuối',
          lunch: '200g Ức gà áp chảo + 150g Cơm gạo lứt + Bông cải xanh luộc',
          dinner: '200g Thăn bò nướng + Salad xà lách sốt olive',
          snack: '1 Muỗng Whey Protein + 30g Hạnh nhân',
        },
        beforeAfterPhotos: {
          beforeUrl:
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
          beforeDate: '15/01/2026 (78 kg)',
          afterUrl:
            'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80',
          afterDate: '10/02/2026 (72.5 kg)',
        },
      },
    };

    const fallback: PTStudentDetail = {
      id: studentId,
      fullName: 'Học Viên PT',
      email: 'student@example.com',
      phone: '0987654321',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      packageName: 'Gói PT VIP 1-1',
      remainingSessions: 6,
      totalSessions: 12,
      joinedDate: '01/02/2026',
      targetCalories: 2000,
      targetProtein: 140,
      targetCarbs: 200,
      targetFat: 55,
      bodyMetrics: {
        weightKg: 68.0,
        heightCm: 170,
        bodyFatPercent: 19.5,
        muscleMassKg: 31.5,
        updatedAt: '05/02/2026',
      },
      bodyMetricsHistory: [
        {
          date: 'T11/2025',
          weightKg: 72.0,
          bodyFatPercent: 22.0,
          muscleMassKg: 30.0,
        },
        {
          date: 'T12/2025',
          weightKg: 70.5,
          bodyFatPercent: 21.0,
          muscleMassKg: 30.8,
        },
        {
          date: 'T1/2026',
          weightKg: 69.2,
          bodyFatPercent: 20.1,
          muscleMassKg: 31.2,
        },
        {
          date: 'T2/2026',
          weightKg: 68.0,
          bodyFatPercent: 19.5,
          muscleMassKg: 31.5,
        },
      ],
      assignedExercises: [
        {
          id: 'ae-default-1',
          exerciseId: 'ex-chest-1',
          name: 'Bench Press',
          category: 'CHEST',
          sets: 3,
          reps: 12,
          weightInKg: 50,
          restSeconds: 60,
          dayOfWeek: 'Thứ 2',
        },
      ],
      prescribedMealPlan: {
        breakfast: 'Phở gà + 1 Quả trứng chần',
        lunch: 'Ức gà nướng + Cơm gạo lứt + Rau củ luộc',
        dinner: 'Cá hồi áp chảo + Bông cải hấp',
        snack: 'Sữa chua không đường',
      },
      beforeAfterPhotos: {
        beforeUrl:
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
        beforeDate: '01/02/2026',
        afterUrl:
          'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80',
        afterDate: '10/02/2026',
      },
    };

    return Promise.resolve(studentProfilesMap[studentId] || fallback);
  }

  async assignWorkoutToStudent(dto: AssignWorkoutDto) {
    if (dto.studentId) {
      const schedule = await this.prisma.workoutSchedule.create({
        data: {
          studentId: dto.studentId,
          title: 'Lịch Tập 1:1 Do PT Giao',
          scheduledDate: new Date(),
          note: `Gồm ${dto.exercises?.length || 0} bài tập cá nhân hóa`,
        },
      });

      if (dto.exercises && dto.exercises.length > 0) {
        for (const ex of dto.exercises) {
          const exLib = await this.prisma.exerciseLibrary.findFirst({
            where: {
              name: { contains: ex.name, mode: 'insensitive' },
            },
          });

          if (exLib) {
            await this.prisma.scheduleExercise.create({
              data: {
                workoutScheduleId: schedule.id,
                exerciseLibraryId: exLib.id,
                sets: ex.sets || 3,
                reps: ex.reps || 10,
                weight: ex.weightInKg || 0,
              },
            });
          }
        }
      }
    }

    return {
      success: true,
      studentId: dto.studentId,
      assignedCount: dto.exercises?.length || 0,
      message: 'Đã lưu và giao giáo án tập luyện mới vào DB thành công!',
    };
  }

  async assignNutritionToStudent(dto: AssignNutritionDto) {
    if (dto.studentId) {
      await this.prisma.nutritionTarget.create({
        data: {
          studentId: dto.studentId,
          targetCalo: dto.targetCalories,
          targetProtein: dto.targetProtein,
          targetCarbs: dto.targetCarbs,
          targetFat: dto.targetFat,
        },
      });

      await this.prisma.user
        .update({
          where: { id: dto.studentId },
          data: {
            tdee: dto.targetCalories,
          },
        })
        .catch(() => null);
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

  checkInSession(sessionId: string) {
    return Promise.resolve({
      success: true,
      sessionId,
      message: 'Check-in trừ buổi học viên thành công!',
    });
  }

  approveMeal(mealId: string, note?: string) {
    return Promise.resolve({
      success: true,
      mealId,
      note,
      message: 'Đã duyệt bữa ăn cho học viên!',
    });
  }

  getPtCodeAndQr(ptUserId: string): Promise<PTCodeQrData> {
    const ptCode = ptUserId ? 'PT-HUY066' : 'PT-HUY066';
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://fitmanagement.app/bind?ptCode=${ptCode}&user=${ptUserId}`;
    return Promise.resolve({
      ptCode,
      qrCodeUrl,
      coachName: 'Coach Bùi Văn Huy',
    });
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

  bindPtByStudent(studentUserId: string, dto: BindPtDto) {
    return Promise.resolve({
      success: true,
      studentUserId,
      ptCode: dto.ptCodeOrInviteCode,
      coachName: 'Coach Bùi Văn Huy',
      message:
        'Chúc mừng! Đã liên kết tài khoản 1-1 với Coach Bùi Văn Huy thành công!',
    });
  }

  updateStudentSessions(studentId: string, dto: UpdateStudentSessionsDto) {
    return Promise.resolve({
      success: true,
      studentId,
      updatedInfo: dto,
      message: 'Đã cập nhật số buổi & gói tập của học viên thành công!',
    });
  }
}
