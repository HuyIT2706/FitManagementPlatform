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
          take: 5,
        },
      },
    });

    const trainer = user?.studentProfiles?.[0]?.trainer;
    const latestTarget = user?.nutritionTargets?.[0];
    const targetWithPrescribed = user?.nutritionTargets?.find(
      (t) => t.prescribedMealPlan && t.prescribedMealPlan.trim() !== '',
    );

    const mealPlanJson =
      latestTarget?.prescribedMealPlan ||
      targetWithPrescribed?.prescribedMealPlan;

    if (!mealPlanJson) {
      return null;
    }

    let prescribed: {
      breakfast?: string;
      lunch?: string;
      dinner?: string;
      snack?: string;
      note?: string;
    } | null = null;

    try {
      prescribed = JSON.parse(mealPlanJson) as {
        breakfast?: string;
        lunch?: string;
        dinner?: string;
        snack?: string;
        note?: string;
      };
    } catch {
      return null;
    }

    if (!prescribed) {
      return null;
    }

    const coachName = trainer
      ? `Coach ${trainer.fullName}`
      : 'Coach Bùi Văn Huy';
    const coachAvatar = trainer?.avatarUrl || undefined;

    // Use DB target calories or fallback to user TDEE/default
    const targetKcal = Math.round(
      latestTarget?.targetCalo || user?.tdee || 2000,
    );

    // Calculate calories per meal based on targets
    const breakfastKcal = Math.round(targetKcal * 0.25);
    const lunchKcal = Math.round(targetKcal * 0.35);
    const dinnerKcal = Math.round(targetKcal * 0.3);
    const snackKcal = Math.round(targetKcal * 0.1);

    const extractKcal = (text: string, defaultKcal: number): number => {
      if (!text) return defaultKcal;
      const matches = [...text.matchAll(/(\d+(?:\.\d+)?)\s*kcal/gi)];
      if (matches.length > 0) {
        const sum = matches.reduce(
          (acc, m) => acc + Math.round(Number(m[1])),
          0,
        );
        if (sum > 0) return sum;
      }
      return defaultKcal;
    };

    const meals: Array<{
      name: string;
      kcal: number;
      description: string;
      icon: string;
    }> = [];

    if (prescribed.breakfast && prescribed.breakfast.trim() !== '') {
      meals.push({
        name: 'Bữa Sáng',
        kcal: extractKcal(prescribed.breakfast, breakfastKcal),
        description: prescribed.breakfast.trim(),
        icon: 'wb_twilight',
      });
    }

    if (prescribed.lunch && prescribed.lunch.trim() !== '') {
      meals.push({
        name: 'Bữa Trưa',
        kcal: extractKcal(prescribed.lunch, lunchKcal),
        description: prescribed.lunch.trim(),
        icon: 'wb_sunny',
      });
    }

    if (prescribed.dinner && prescribed.dinner.trim() !== '') {
      meals.push({
        name: 'Bữa Tối',
        kcal: extractKcal(prescribed.dinner, dinnerKcal),
        description: prescribed.dinner.trim(),
        icon: 'nights_stay',
      });
    }

    if (prescribed.snack && prescribed.snack.trim() !== '') {
      meals.push({
        name: 'Bữa Phụ',
        kcal: extractKcal(prescribed.snack, snackKcal),
        description: prescribed.snack.trim(),
        icon: 'local_cafe',
      });
    }

    if (meals.length === 0) {
      return null;
    }

    const defaultAdvice = ``;
    const totalPrescribedKcal = meals.reduce((acc, m) => acc + m.kcal, 0);

    return {
      coachName,
      coachAvatar,
      coachAdvice:
        prescribed.note && prescribed.note.trim() !== ''
          ? prescribed.note.trim()
          : defaultAdvice,
      meals,
      totalKcal: totalPrescribedKcal,
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
          take: 5,
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
    let targetSchedule = user?.workoutSchedules?.find(
      (s) =>
        (s.exercises && s.exercises.length > 0) ||
        (s.note && s.note.startsWith('[')),
    );

    if (
      !targetSchedule &&
      user?.workoutSchedules &&
      user.workoutSchedules.length > 0
    ) {
      targetSchedule = user.workoutSchedules[0];
    }

    if (!targetSchedule) {
      return null;
    }

    const coachName = trainer
      ? `Coach ${trainer.fullName}`
      : 'Coach Bùi Văn Huy';
    const coachAvatar = trainer?.avatarUrl || undefined;

    let exercises: Array<{
      id: string;
      name: string;
      category: string;
      sets: number;
      reps: number;
      weightInKg: number;
      instructions?: string[];
      setupImageUrl?: string;
      startImageUrl?: string;
      dayOfWeek?: string;
    }> = [];

    if (targetSchedule.exercises && targetSchedule.exercises.length > 0) {
      exercises = targetSchedule.exercises.map((se) => {
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
          dayOfWeek: 'Thứ 2 - 4 - 6',
        };
      });
    } else if (targetSchedule.note) {
      try {
        const parsed: unknown = JSON.parse(targetSchedule.note);
        if (Array.isArray(parsed)) {
          exercises = parsed.map((item: Record<string, unknown>) => ({
            id: typeof item.id === 'string' ? item.id : `ex-${Date.now()}`,
            name: typeof item.name === 'string' ? item.name : 'Bài tập 1:1',
            category:
              typeof item.category === 'string' ? item.category : 'FULL_BODY',
            sets: Number(item.sets) || 3,
            reps: Number(item.reps) || 12,
            weightInKg: Number(item.weightInKg) || 0,
            instructions: [],
            setupImageUrl:
              typeof item.setupImageUrl === 'string'
                ? item.setupImageUrl
                : typeof item.imageUrl === 'string'
                  ? item.imageUrl
                  : undefined,
            startImageUrl:
              typeof item.startImageUrl === 'string'
                ? item.startImageUrl
                : undefined,
            dayOfWeek:
              typeof item.dayOfWeek === 'string' ? item.dayOfWeek : undefined,
          }));
        }
      } catch {
        // note is regular string
      }
    }

    if (exercises.length === 0) {
      return null;
    }

    return {
      coachName,
      coachAvatar,
      scheduleTitle: targetSchedule.title || 'Lịch Tập 1:1 Cá Nhân Hóa',
      note:
        targetSchedule.note && !targetSchedule.note.startsWith('[')
          ? targetSchedule.note
          : '',
      exercisesCount: exercises.length,
      exercises,
    };
  }
}
