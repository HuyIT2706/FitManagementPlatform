import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  ExerciseItem,
  ExercisePaginatedResponse,
  MealPlanAssigned,
} from '@repo/types';

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

    const where: any = {};
    if (category && category !== 'ALL') {
      where.category = {
        contains: category,
        mode: 'insensitive',
      };
    }

    if (muscle && muscle !== 'ALL') {
      where.primaryMuscles = {
        has: muscle,
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
    if (!trainer) {
      return null;
    }

    const targetCalo = user.nutritionTargets?.[0]?.targetCalo || 1734;

    return {
      coachName: `Coach ${trainer.fullName}`,
      coachAvatar: trainer.avatarUrl || undefined,
      coachAdvice:
        'Ăn đúng lượng Carbs trước tập 1 tiếng để có sức nâng tạ nhé!',
      meals: [
        {
          name: 'Bữa Sáng',
          kcal: 450,
          description: '3 Trứng ốp la + 100g Yến mạch',
          icon: 'wb_twilight',
        },
        {
          name: 'Bữa Trưa',
          kcal: 650,
          description: '200g Ức gà + 150g Gạo lứt',
          icon: 'wb_sunny',
        },
      ],
      totalKcal: 1100,
      targetKcal: Math.round(targetCalo),
    };
  }
}
