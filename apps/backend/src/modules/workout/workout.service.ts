import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { PrismaService } from '../../prisma/prisma.service';
import type { ExercisePaginatedResponse, MealPlanAssigned } from '@repo/types';

@Injectable()
export class WorkoutService {
  constructor(private readonly prisma: PrismaService) {}

  async getExercises(
    category?: string,
    muscle?: string,
    search?: string,
    page = 1,
    limit = 10,
  ): Promise<ExercisePaginatedResponse> {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 10);

    const where: Prisma.ExerciseLibraryWhereInput = {};
    if (category && category !== 'ALL') {
      where.category = {
        contains: category,
        mode: 'insensitive',
      };
    }

    if (muscle && muscle !== 'ALL') {
      const lower = muscle.toLowerCase().trim();
      let matchedMuscles: string[] = [muscle];

      if (lower.includes('lưng') || lower.includes('xô')) {
        matchedMuscles = [
          'cơ lưng giữa',
          'cơ lưng dưới',
          'cơ xô',
          'cơ cầu vai',
          'cơ lưng',
        ];
      } else if (lower.includes('đùi') || lower.includes('mông')) {
        matchedMuscles = [
          'cơ đùi trước',
          'cơ đùi sau',
          'cơ mông',
          'cơ khép (đùi trong)',
          'bắp chân',
          'cơ đùi',
        ];
      } else if (lower.includes('tay')) {
        matchedMuscles = ['cơ tay trước', 'cơ tay sau', 'cẳng tay', 'cơ tay'];
      } else if (lower.includes('ngực')) {
        matchedMuscles = ['cơ ngực'];
      } else if (lower.includes('vai')) {
        matchedMuscles = ['cơ vai', 'cơ cầu vai'];
      } else if (lower.includes('bụng') || lower.includes('core')) {
        matchedMuscles = ['cơ bụng'];
      }

      where.primaryMuscles = {
        hasSome: matchedMuscles,
      };
    }

    if (search && search.trim() !== '') {
      where.name = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    const [total, exercises] = await Promise.all([
      this.prisma.exerciseLibrary.count({ where }),
      this.prisma.exerciseLibrary.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      data: exercises,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }

  async getAssignedMealPlan(userId: string): Promise<MealPlanAssigned | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfiles: {
          include: {
            trainer: true,
          },
        },
        nutritionTargets: {
          orderBy: { effectiveDate: 'desc' },
          take: 1,
        },
      },
    });

    const trainer = user?.studentProfiles?.[0]?.trainer;
    const latestTarget = user?.nutritionTargets?.[0];

    const coachName = trainer
      ? `Coach ${trainer.fullName}`
      : 'Coach Bùi Văn Huy';
    const coachAvatar = trainer?.avatarUrl || undefined;

    // Use DB target calories or fallback to user TDEE/default
    const targetKcal = Math.round(
      latestTarget?.targetCalo || user?.tdee || 2000,
    );
    const targetProtein = Math.round(latestTarget?.targetProtein || 150);
    const targetCarbs = Math.round(latestTarget?.targetCarbs || 200);
    const targetFat = Math.round(latestTarget?.targetFat || 60);

    // Calculate calories per meal based on targets
    const breakfastKcal = Math.round(targetKcal * 0.25);
    const lunchKcal = Math.round(targetKcal * 0.35);
    const dinnerKcal = Math.round(targetKcal * 0.3);
    const snackKcal = Math.round(targetKcal * 0.1);

    return {
      coachName,
      coachAvatar,
      coachAdvice: `Mục tiêu hằng ngày: ${targetKcal} kcal (Protein: ${targetProtein}g, Carb: ${targetCarbs}g, Fat: ${targetFat}g). Nhớ ăn đúng khẩu phần và uống đủ 2.5L nước!`,
      meals: [
        {
          name: 'Bữa Sáng',
          kcal: breakfastKcal,
          description: `Bữa sáng dinh dưỡng (~${breakfastKcal} kcal) • Protein: ${Math.round(targetProtein * 0.25)}g`,
          icon: 'wb_twilight',
        },
        {
          name: 'Bữa Trưa',
          kcal: lunchKcal,
          description: `Bữa trưa chính năng lượng (~${lunchKcal} kcal) • Carb & Protein hợp lý`,
          icon: 'wb_sunny',
        },
        {
          name: 'Bữa Tối',
          kcal: dinnerKcal,
          description: `Bữa tối nhẹ nhàng phục hồi cơ (~${dinnerKcal} kcal) • Tăng cường chất xơ`,
          icon: 'nights_stay',
        },
        {
          name: 'Bữa Phụ',
          kcal: snackKcal,
          description: `Bữa phụ bổ sung Whey/Trái cây (~${snackKcal} kcal)`,
          icon: 'local_cafe',
        },
      ],
      totalKcal: targetKcal,
      targetKcal,
    };
  }

  async getAssignedWorkoutPlan(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfiles: {
          include: {
            trainer: true,
          },
        },
        workoutSchedules: {
          orderBy: { scheduledDate: 'desc' },
          take: 1,
          include: {
            exercises: {
              include: {
                exercise: true,
              },
            },
          },
        },
      },
    });

    const trainer = user?.studentProfiles?.[0]?.trainer;
    const latestSchedule = user?.workoutSchedules?.[0];

    const coachName = trainer
      ? `Coach ${trainer.fullName}`
      : 'Coach Bùi Văn Huy';
    const coachAvatar = trainer?.avatarUrl || undefined;

    const exercises = (latestSchedule?.exercises || []).map((se) => {
      const ex = se.exercise as {
        name?: string;
        category?: string;
        instructions?: string[];
        setupImageUrl?: string;
        startImageUrl?: string;
      } | null;

      return {
        id: se.id,
        name: ex?.name || 'Bài tập 1:1',
        category: ex?.category || 'FULL_BODY',
        sets: se.sets,
        reps: se.reps,
        weightInKg: se.weight || 0,
        instructions: ex?.instructions || [],
        setupImageUrl: ex?.setupImageUrl || undefined,
        startImageUrl: ex?.startImageUrl || undefined,
      };
    });

    return {
      coachName,
      coachAvatar,
      scheduleTitle: latestSchedule?.title || 'Lịch Tập 1:1 Cá Nhân Hóa',
      note:
        latestSchedule?.note ||
        'Tập trung chuẩn phom dáng và đẩy tạ đúng biên độ.',
      exercisesCount: exercises.length,
      exercises,
    };
  }
}
