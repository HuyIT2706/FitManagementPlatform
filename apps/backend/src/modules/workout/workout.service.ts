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

  private readonly exerciseSeedData: ExerciseItem[] = [
    // LEGS
    {
      id: 'ex-legs-1',
      name: 'Barbell Squat',
      category: 'LEGS',
      categoryName: 'Mông & Đùi',
      imageUrl:
        'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
      description: 'Bài tập gánh tạ đòn phát triển đùi trước và cơ mông mạnh mẽ.',
      sets: 4,
      reps: 10,
      weightInKg: 80,
      durationMinutes: 15,
      caloriesBurn: 120,
    },
    {
      id: 'ex-legs-2',
      name: 'Romanian Deadlift',
      category: 'LEGS',
      categoryName: 'Mông & Đùi',
      imageUrl:
        'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=800&q=80',
      description: 'Tập trung kéo cơ đùi sau (hamstrings) và cơ mông.',
      sets: 4,
      reps: 12,
      weightInKg: 60,
      durationMinutes: 15,
      caloriesBurn: 110,
    },
    {
      id: 'ex-legs-3',
      name: 'Hip Thrust',
      category: 'LEGS',
      categoryName: 'Mông & Đùi',
      imageUrl:
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      description: 'Bài tập cô lập cơ mông hiệu quả nhất với tạ đòn.',
      sets: 3,
      reps: 15,
      weightInKg: 90,
      durationMinutes: 12,
      caloriesBurn: 95,
    },
    {
      id: 'ex-legs-4',
      name: 'Leg Press',
      category: 'LEGS',
      categoryName: 'Mông & Đùi',
      imageUrl:
        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
      description: 'Đạp đùi trên máy giảm áp lực lên cột sống.',
      sets: 4,
      reps: 12,
      weightInKg: 120,
      durationMinutes: 12,
      caloriesBurn: 100,
    },
    {
      id: 'ex-legs-5',
      name: 'Walking Lunges',
      category: 'LEGS',
      categoryName: 'Mông & Đùi',
      imageUrl:
        'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=800&q=80',
      description: 'Bước chùng chân tăng khả năng thăng bằng và đùi mông.',
      sets: 3,
      reps: 12,
      weightInKg: 20,
      durationMinutes: 10,
      caloriesBurn: 85,
    },
    {
      id: 'ex-legs-6',
      name: 'Bulgarian Split Squat',
      category: 'LEGS',
      categoryName: 'Mông & Đùi',
      imageUrl:
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
      description: 'Squat đơn chân trên ghế giúp phát triển mông tối đa.',
      sets: 3,
      reps: 10,
      weightInKg: 24,
      durationMinutes: 10,
      caloriesBurn: 90,
    },

    // CHEST
    {
      id: 'ex-chest-1',
      name: 'Flat Barbell Bench Press',
      category: 'CHEST',
      categoryName: 'Ngực',
      imageUrl:
        'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
      description: 'Đẩy ngực ngang tạ đòn phát triển toàn bộ cơ ngực.',
      sets: 4,
      reps: 10,
      weightInKg: 70,
      durationMinutes: 15,
      caloriesBurn: 105,
    },
    {
      id: 'ex-chest-2',
      name: 'Incline Dumbbell Press',
      category: 'CHEST',
      categoryName: 'Ngực',
      imageUrl:
        'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
      description: 'Đẩy ngực trên với tạ đơn phát triển ngực trên đầy đặn.',
      sets: 4,
      reps: 12,
      weightInKg: 48,
      durationMinutes: 12,
      caloriesBurn: 95,
    },
    {
      id: 'ex-chest-3',
      name: 'Cable Flyes',
      category: 'CHEST',
      categoryName: 'Ngực',
      imageUrl:
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      description: 'Ép ngực dây cáp tạo rãnh ngực sắc nét.',
      sets: 3,
      reps: 15,
      weightInKg: 25,
      durationMinutes: 10,
      caloriesBurn: 75,
    },
    {
      id: 'ex-chest-4',
      name: 'Dips for Chest',
      category: 'CHEST',
      categoryName: 'Ngực',
      imageUrl:
        'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80',
      description: 'Chống xà kép tạo nét cơ ngực dưới.',
      sets: 3,
      reps: 12,
      durationMinutes: 10,
      caloriesBurn: 80,
    },
    {
      id: 'ex-chest-5',
      name: 'Push-Ups (Chống đẩy)',
      category: 'CHEST',
      categoryName: 'Ngực',
      imageUrl:
        'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80',
      description: 'Bài tập trọng lượng cơ thể kinh điển cho ngực và vai.',
      sets: 4,
      reps: 20,
      durationMinutes: 8,
      caloriesBurn: 70,
    },

    // BACK
    {
      id: 'ex-back-1',
      name: 'Barbell Conventional Deadlift',
      category: 'BACK',
      categoryName: 'Lưng',
      imageUrl:
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      description: 'Vua của các bài tập lưng xô và toàn bộ chuỗi cơ sau.',
      sets: 4,
      reps: 8,
      weightInKg: 100,
      durationMinutes: 18,
      caloriesBurn: 150,
    },
    {
      id: 'ex-back-2',
      name: 'Lat Pulldown',
      category: 'BACK',
      categoryName: 'Lưng',
      imageUrl:
        'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80',
      description: 'Kéo cáp cơ xô giúp mở rộng độ rộng của lưng V-taper.',
      sets: 4,
      reps: 12,
      weightInKg: 55,
      durationMinutes: 12,
      caloriesBurn: 90,
    },
    {
      id: 'ex-back-3',
      name: 'Seated Cable Row',
      category: 'BACK',
      categoryName: 'Lưng',
      imageUrl:
        'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
      description: 'Kéo lưng ngồi giúp tăng độ dày cơ lưng trung tâm.',
      sets: 4,
      reps: 12,
      weightInKg: 60,
      durationMinutes: 12,
      caloriesBurn: 95,
    },
    {
      id: 'ex-back-4',
      name: 'Pull-Ups (Hít xà)',
      category: 'BACK',
      categoryName: 'Lưng',
      imageUrl:
        'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80',
      description: 'Bài tập hít xà xô đỉnh cao phát triển sức mạnh xô.',
      sets: 4,
      reps: 10,
      durationMinutes: 10,
      caloriesBurn: 85,
    },

    // SHOULDERS
    {
      id: 'ex-shoulders-1',
      name: 'Overhead Dumbbell Press',
      category: 'SHOULDERS',
      categoryName: 'Vai',
      imageUrl:
        'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
      description: 'Đẩy vai tạ đơn phát triển độ tròn của bờ vai.',
      sets: 4,
      reps: 10,
      weightInKg: 36,
      durationMinutes: 12,
      caloriesBurn: 85,
    },
    {
      id: 'ex-shoulders-2',
      name: 'Dumbbell Lateral Raise',
      category: 'SHOULDERS',
      categoryName: 'Vai',
      imageUrl:
        'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
      description: 'Dang vai tạ đơn cô lập cơ vai giữa giúp vai rộng.',
      sets: 4,
      reps: 15,
      weightInKg: 16,
      durationMinutes: 10,
      caloriesBurn: 70,
    },
    {
      id: 'ex-shoulders-3',
      name: 'Face Pulls',
      category: 'SHOULDERS',
      categoryName: 'Vai',
      imageUrl:
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      description: 'Bài tập cơ vai sau và cải thiện tư thế vai.',
      sets: 4,
      reps: 15,
      weightInKg: 20,
      durationMinutes: 10,
      caloriesBurn: 65,
    },

    // ARMS
    {
      id: 'ex-arms-1',
      name: 'Dumbbell Bicep Curls',
      category: 'ARMS',
      categoryName: 'Tay',
      imageUrl:
        'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
      description: 'Cuốn tay trước tạ đơn tạo đỉnh cơ tay trước.',
      sets: 3,
      reps: 12,
      weightInKg: 24,
      durationMinutes: 10,
      caloriesBurn: 60,
    },
    {
      id: 'ex-arms-2',
      name: 'Tricep Rope Pushdown',
      category: 'ARMS',
      categoryName: 'Tay',
      imageUrl:
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      description: 'Duỗi tay sau với dây cáp làm nét bắp tay sau.',
      sets: 3,
      reps: 15,
      weightInKg: 30,
      durationMinutes: 10,
      caloriesBurn: 65,
    },

    // ABS
    {
      id: 'ex-abs-1',
      name: 'Hanging Leg Raise',
      category: 'ABS',
      categoryName: 'Bụng',
      imageUrl:
        'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80',
      description: 'Treo xà co gối/nâng chân săn chắc cơ bụng dưới.',
      sets: 4,
      reps: 15,
      durationMinutes: 10,
      caloriesBurn: 70,
    },
    {
      id: 'ex-abs-2',
      name: 'Plank Hold',
      category: 'ABS',
      categoryName: 'Bụng',
      imageUrl:
        'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=800&q=80',
      description: 'Giữ plank tăng cường sức mạnh nhóm cơ lõi (core).',
      sets: 3,
      reps: 60,
      durationMinutes: 8,
      caloriesBurn: 50,
    },

    // FULL_BODY
    {
      id: 'ex-full-1',
      name: 'Kettlebell Swings',
      category: 'FULL_BODY',
      categoryName: 'Toàn thân',
      imageUrl:
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      description: 'Vung tạ ấm đốt calo và phát triển sức bật toàn thân.',
      sets: 4,
      reps: 20,
      weightInKg: 20,
      durationMinutes: 12,
      caloriesBurn: 130,
    },
    {
      id: 'ex-full-2',
      name: 'Burpees',
      category: 'FULL_BODY',
      categoryName: 'Toàn thân',
      imageUrl:
        'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=800&q=80',
      description: 'Bài tập cardio toàn thân đốt cháy calo cực nhanh.',
      sets: 4,
      reps: 15,
      durationMinutes: 10,
      caloriesBurn: 140,
    },
  ];

  async getExercises(category?: string, page = 1, limit = 5): Promise<ExercisePaginatedResponse> {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 5);

    let filtered = [...this.exerciseSeedData];

    if (category && category !== 'ALL') {
      filtered = filtered.filter((ex) => ex.category === category);
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedData = filtered.slice(startIndex, startIndex + limitNum);

    return {
      data: paginatedData,
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
      coachAdvice: 'Ăn đúng lượng Carbs trước tập 1 tiếng để có sức nâng tạ nhé!',
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
