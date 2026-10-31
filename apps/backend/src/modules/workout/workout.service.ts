import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { ExercisePaginatedResponse, MealPlanAssigned } from '@repo/types';

@Injectable()
export class WorkoutService implements OnModuleInit {
  private readonly logger = new Logger(WorkoutService.name);
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    // Ensure column compatibility between snake_case (Supabase import) and camelCase (Prisma)
    await this.ensureColumnCompatibility().catch(() => {});
  }

  private async ensureColumnCompatibility(): Promise<void> {
    try {
      await this.prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercise_libraries' AND column_name='setup_image_url') 
             AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercise_libraries' AND column_name='setupImageUrl') THEN
            ALTER TABLE exercise_libraries ADD COLUMN "setupImageUrl" TEXT;
            UPDATE exercise_libraries SET "setupImageUrl" = setup_image_url WHERE "setupImageUrl" IS NULL;
          END IF;

          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercise_libraries' AND column_name='start_image_url') 
             AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercise_libraries' AND column_name='startImageUrl') THEN
            ALTER TABLE exercise_libraries ADD COLUMN "startImageUrl" TEXT;
            UPDATE exercise_libraries SET "startImageUrl" = start_image_url WHERE "startImageUrl" IS NULL;
          END IF;

          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercise_libraries' AND column_name='primary_muscles') 
             AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercise_libraries' AND column_name='primaryMuscles') THEN
            ALTER TABLE exercise_libraries ADD COLUMN "primaryMuscles" TEXT[];
            UPDATE exercise_libraries SET "primaryMuscles" = primary_muscles WHERE "primaryMuscles" IS NULL;
          END IF;

          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercise_libraries' AND column_name='secondary_muscles') 
             AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercise_libraries' AND column_name='secondaryMuscles') THEN
            ALTER TABLE exercise_libraries ADD COLUMN "secondaryMuscles" TEXT[];
            UPDATE exercise_libraries SET "secondaryMuscles" = secondary_muscles WHERE "secondaryMuscles" IS NULL;
          END IF;
        END $$;
      `);
    } catch {
      // Safe fallback if restricted
    }
  }

  private normalizeExerciseRow(
    row: Record<string, unknown>,
  ): Record<string, unknown> {
    const parseArray = (val: unknown): string[] => {
      if (Array.isArray(val)) {
        return val.map((item) =>
          typeof item === 'string' ? item : String(item),
        );
      }
      if (typeof val === 'string') {
        try {
          const parsed: unknown = JSON.parse(val);
          return Array.isArray(parsed)
            ? parsed.map((item) =>
                typeof item === 'string' ? item : String(item),
              )
            : [val];
        } catch {
          return val ? [val] : [];
        }
      }
      return [];
    };

    const toStrOrNull = (val: unknown): string | null => {
      if (val === null || val === undefined) return null;
      if (typeof val === 'string') return val;
      if (typeof val === 'number' || typeof val === 'boolean')
        return String(val);
      return null;
    };

    const toStr = (val: unknown): string => {
      if (val === null || val === undefined) return '';
      if (typeof val === 'string') return val;
      if (typeof val === 'number' || typeof val === 'boolean')
        return String(val);
      return '';
    };

    return {
      id: toStr(row.id),
      name: toStr(row.name),
      category: toStrOrNull(row.category),
      force: toStrOrNull(row.force),
      level: toStrOrNull(row.level),
      mechanic: toStrOrNull(row.mechanic),
      equipment: toStrOrNull(row.equipment),
      primaryMuscles: parseArray(
        row.primaryMuscles ?? row.primary_muscles ?? row.primarymuscles,
      ),
      secondaryMuscles: parseArray(
        row.secondaryMuscles ?? row.secondary_muscles ?? row.secondarymuscles,
      ),
      instructions: parseArray(row.instructions ?? row.instruction),
      setupImageUrl: toStrOrNull(
        row.setupImageUrl ?? row.setup_image_url ?? row.setupimageurl,
      ),
      startImageUrl: toStrOrNull(
        row.startImageUrl ?? row.start_image_url ?? row.startimageurl,
      ),
    };
  }

  async getExercises(
    category?: string,
    muscle?: string,
    search?: string,
    page = 1,
    limit = 10,
  ): Promise<ExercisePaginatedResponse> {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 10);

    // 1. Try standard Prisma query first (when columns match schema)
    try {
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

      if (total > 0 && exercises.length > 0) {
        const totalPages = Math.ceil(total / limitNum) || 1;
        return {
          data: exercises,
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
        };
      }
    } catch (err) {
      this.logger.warn(
        'Prisma exercise library query failed, running resilient SQL query:',
        err,
      );
    }

    // 2. Resilient raw SQL query directly against Supabase exercise_libraries table
    try {
      const whereConditions: string[] = [];

      if (search && search.trim() !== '') {
        const s = search.trim().replace(/'/g, "''");
        whereConditions.push(`name ILIKE '%${s}%'`);
      }

      if (category && category !== 'ALL') {
        const c = category.trim().replace(/'/g, "''");
        whereConditions.push(`category ILIKE '%${c}%'`);
      }

      if (muscle && muscle !== 'ALL') {
        const lower = muscle.toLowerCase().trim();
        let targets = [lower];
        if (lower.includes('lưng') || lower.includes('xô')) {
          targets = ['lưng', 'xô', 'cầu vai'];
        } else if (lower.includes('đùi') || lower.includes('mông')) {
          targets = ['đùi', 'mông', 'khép', 'bắp chân'];
        } else if (lower.includes('tay')) {
          targets = ['tay trước', 'tay sau', 'cẳng tay', 'tay'];
        } else if (lower.includes('ngực')) {
          targets = ['ngực'];
        } else if (lower.includes('vai')) {
          targets = ['vai'];
        } else if (lower.includes('bụng') || lower.includes('core')) {
          targets = ['bụng', 'core'];
        }

        const muscleFilters = targets.map(
          (t) => `to_jsonb(exercise_libraries)::text ILIKE '%${t}%'`,
        );
        whereConditions.push(`(${muscleFilters.join(' OR ')})`);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(' AND ')}`
          : '';

      const countResult = await this.prisma.$queryRawUnsafe<
        Array<{ count: number | bigint | string }>
      >(`SELECT COUNT(*)::int as count FROM exercise_libraries ${whereClause}`);
      const rawTotal = Number(countResult[0]?.count) || 0;

      const rawRows = await this.prisma.$queryRawUnsafe<
        Array<Record<string, unknown>>
      >(`
        SELECT * FROM exercise_libraries 
        ${whereClause} 
        ORDER BY name ASC 
        LIMIT ${limitNum} OFFSET ${(pageNum - 1) * limitNum}
      `);

      if (rawRows && rawRows.length > 0) {
        const normalizedList = rawRows.map((r) => this.normalizeExerciseRow(r));
        return {
          data: normalizedList as unknown as ExercisePaginatedResponse['data'],
          total: rawTotal || normalizedList.length,
          page: pageNum,
          limit: limitNum,
          totalPages:
            Math.ceil((rawTotal || normalizedList.length) / limitNum) || 1,
        };
      }
    } catch (rawErr) {
      this.logger.error('Resilient raw SQL query failed:', rawErr);
    }

    return {
      data: [],
      total: 0,
      page: pageNum,
      limit: limitNum,
      totalPages: 1,
    };
  }

  async getAssignedMealPlan(userId: string): Promise<MealPlanAssigned | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfiles: {
          include: {
            trainer: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
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
      : 'Hệ Thống NutriCore';
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
            trainer: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
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

    let trainer = user?.studentProfiles?.[0]?.trainer;
    let targetSchedule:
      NonNullable<typeof user>['workoutSchedules'][0] | null | undefined =
      user?.workoutSchedules?.find(
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

    if (!targetSchedule && user) {
      targetSchedule = await this.prisma.workoutSchedule.findFirst({
        where: {
          OR: [
            { studentId: userId },
            { student: { email: { equals: user.email, mode: 'insensitive' } } },
            {
              student: {
                fullName: { contains: user.fullName, mode: 'insensitive' },
              },
            },
          ],
        },
        orderBy: { scheduledDate: 'desc' },
        include: {
          exercises: {
            include: {
              exercise: true,
            },
          },
        },
      });
    }

    if (!targetSchedule) {
      return null;
    }

    if (!trainer) {
      const activePt = await this.prisma.user.findFirst({
        where: { role: 'PT' },
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      });
      if (activePt) {
        trainer = activePt;
        if (user) {
          try {
            await this.prisma.studentProfile.upsert({
              where: {
                trainerId_studentId: {
                  trainerId: activePt.id,
                  studentId: user.id,
                },
              },
              create: {
                trainerId: activePt.id,
                studentId: user.id,
                status: 'APPROVED',
              },
              update: {
                status: 'APPROVED',
              },
            });
          } catch {
            // Safe fallback
          }
        }
      }
    }

    const coachName = trainer
      ? `Coach ${trainer.fullName}`
      : 'Hệ Thống NutriCore';
    const coachAvatar = trainer?.avatarUrl || undefined;

    let exercises: Array<{
      id: string;
      name: string;
      category?: string;
      force?: string | null;
      level?: string | null;
      mechanic?: string | null;
      equipment?: string | null;
      primaryMuscles?: string[];
      secondaryMuscles?: string[];
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
          force?: string;
          level?: string;
          mechanic?: string;
          equipment?: string;
          primaryMuscles?: string[];
          secondaryMuscles?: string[];
          instructions?: string[];
          setupImageUrl?: string;
          startImageUrl?: string;
        } | null;

        return {
          id: se.id,
          name: ex?.name || 'Bài tập 1:1',
          category: ex?.category || 'FULL_BODY',
          force: ex?.force,
          level: ex?.level,
          mechanic: ex?.mechanic,
          equipment: ex?.equipment,
          primaryMuscles: ex?.primaryMuscles || [],
          secondaryMuscles: ex?.secondaryMuscles || [],
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
