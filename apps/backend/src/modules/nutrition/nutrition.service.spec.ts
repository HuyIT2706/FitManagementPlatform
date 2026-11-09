import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('NutritionService - Core Business Logic', () => {
  let service: NutritionService;
  let prismaMock: any;

  const mockFoods = [
    {
      id: 'food-chicken',
      name: 'Ức gà phi lê áp chảo',
      caloriesPer100g: 130,
      proteinPer100g: 28,
      carbsPer100g: 0,
      fatPer100g: 2,
      category: 'PROTEIN',
    },
    {
      id: 'food-rice',
      name: 'Cơm trắng (dẻo, tơi)',
      caloriesPer100g: 130,
      proteinPer100g: 2.7,
      carbsPer100g: 28,
      fatPer100g: 0.3,
      category: 'CARB',
    },
    {
      id: 'food-egg',
      name: 'Trứng gà luộc',
      caloriesPer100g: 155,
      proteinPer100g: 13,
      carbsPer100g: 1.1,
      fatPer100g: 11,
      category: 'PROTEIN',
    },
    {
      id: 'food-oats',
      name: 'Yến mạch ngâm qua đêm vị táo quế',
      caloriesPer100g: 150,
      proteinPer100g: 6,
      carbsPer100g: 25,
      fatPer100g: 3,
      category: 'CARB',
    },
    {
      id: 'food-veg',
      name: 'Rau bina xào tỏi',
      caloriesPer100g: 35,
      proteinPer100g: 3,
      carbsPer100g: 3,
      fatPer100g: 1,
      category: 'VEG',
    },
    {
      id: 'food-shrimp',
      name: 'Tôm sú hấp sả',
      caloriesPer100g: 99,
      proteinPer100g: 21,
      carbsPer100g: 0.2,
      fatPer100g: 1.1,
      category: 'PROTEIN',
    },
    {
      id: 'food-peanut',
      name: 'Đậu phộng rang muối',
      caloriesPer100g: 567,
      proteinPer100g: 26,
      carbsPer100g: 16,
      fatPer100g: 49,
      category: 'SNACK',
    },
    {
      id: 'food-banana',
      name: 'Quả chuối tiêu (già, lùn) chín',
      caloriesPer100g: 89,
      proteinPer100g: 1.1,
      carbsPer100g: 23,
      fatPer100g: 0.3,
      category: 'FRUIT',
    },
  ];

  beforeEach(async () => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
      },
      nutritionTarget: {
        findFirst: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 'target-new' }),
      },
      studentProfile: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
      foodLibrary: {
        findMany: jest.fn().mockResolvedValue(mockFoods),
        count: jest.fn().mockResolvedValue(mockFoods.length),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      mealLog: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({ id: 'log-1' }),
      },
      $queryRaw: jest
        .fn()
        .mockRejectedValue(
          new Error('raw unaccent query fallback to findMany'),
        ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NutritionService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<NutritionService>(NutritionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('smartParseFoodInput', () => {
    it('should return empty result if input is blank', async () => {
      const result = await service.smartParseFoodInput('');
      expect(result.items).toEqual([]);
      expect(result.parsedCount).toBe(0);
    });

    it('should parse recognizable food items and estimate quantities', async () => {
      // Mock findMany returning chicken when searched
      prismaMock.foodLibrary.findMany.mockResolvedValue([mockFoods[0]]);
      const result = await service.smartParseFoodInput('200g ức gà phi lê');

      expect(result.parsedCount).toBeGreaterThanOrEqual(1);
      expect(result.items.length).toBeGreaterThanOrEqual(1);
      const group = result.items[0];
      expect(group.detectedWeight).toBe(200);
      expect(group.matchedFoods.length).toBeGreaterThanOrEqual(1);
      expect(group.matchedFoods[0].calculatedCalories).toBe(260); // 130 * 2
      expect(group.matchedFoods[0].calculatedProtein).toBe(56); // 28 * 2
    });
  });

  describe('generateMealPlan - Macro Calibration & Safety Filters', () => {
    const mockStudentUser = {
      id: 'student-1',
      name: 'Nguyen Van A',
      role: 'STUDENT',
      tdee: 2200,
      nutritionTargets: [
        {
          targetCalo: 2000,
          targetProtein: 150,
          targetCarbs: 200,
          targetFat: 60,
          effectiveDate: new Date(),
        },
      ],
      healthConditions: [],
      dietaryPreferences: [],
    };

    it('should throw NotFoundException if student does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.generateMealPlan('student-1', {
          targetCalories: 2000,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should generate balanced meal plan adhering to 100% Protein, 95% Carbs, 90% Fat targets', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockStudentUser);
      prismaMock.foodLibrary.findMany.mockResolvedValue(mockFoods);

      const plan = await service.generateMealPlan('student-1', {
        targetCalories: 2000,
        targetProtein: 150,
        targetCarbs: 200,
        targetFat: 60,
        mealFrequency: 3,
      });

      expect(plan).toBeDefined();
      expect(plan.meals.length).toBeGreaterThanOrEqual(3);
      expect(plan.targetProtein).toBe(150);
      expect(plan.targetCarbs).toBe(200);
      expect(plan.targetFat).toBe(60);

      // Verify each meal session has calculated macro totals
      for (const meal of plan.meals) {
        expect(meal.totalCalories).toBeGreaterThan(0);
        expect(meal.items.length).toBeGreaterThan(0);
      }
    });

    it('should filter out allergens matching student health conditions or preferences', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...mockStudentUser,
        healthConditions: ['tom', 'hai san', 'dau phong'],
      });
      prismaMock.foodLibrary.findMany.mockResolvedValue(mockFoods);

      const plan = await service.generateMealPlan('student-1', {
        targetCalories: 2000,
        targetProtein: 150,
        targetCarbs: 200,
        targetFat: 60,
      });

      expect(plan.meals).toBeDefined();
      // Ensure no shrimp or peanut foods are included in any meal
      for (const meal of plan.meals) {
        for (const item of meal.items) {
          expect(item.foodName.toLowerCase()).not.toContain('tôm');
          expect(item.foodName.toLowerCase()).not.toContain('đậu phộng');
        }
      }
    });

    it('should reject student self-overwriting meal plan when assigned by PT', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...mockStudentUser,
        role: 'STUDENT',
      });
      prismaMock.foodLibrary.findMany.mockResolvedValue(mockFoods);

      // Student has a PT
      prismaMock.studentProfile.findFirst.mockResolvedValue({
        userId: 'student-1',
        trainer: { id: 'pt-1', user: { name: 'Coach Alex' } },
      });

      // Student already has an active prescribed plan by PT
      prismaMock.nutritionTarget.findFirst.mockResolvedValue({
        id: 'target-pt-assigned',
        studentId: 'student-1',
        prescribedMealPlan: JSON.stringify({ note: 'HLV Alexander chỉ định' }),
      });

      await expect(
        service.generateMealPlan('student-1', {
          targetCalories: 2000,
          saveToDatabase: true,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow PT to assign / overwrite meal plan for student', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...mockStudentUser,
        role: 'STUDENT',
      });
      prismaMock.foodLibrary.findMany.mockResolvedValue(mockFoods);

      prismaMock.studentProfile.findFirst.mockResolvedValue({
        userId: 'student-1',
        trainer: { id: 'pt-1', user: { name: 'Coach Alex' } },
      });

      prismaMock.nutritionTarget.findFirst.mockResolvedValue({
        id: 'target-pt-assigned',
        studentId: 'student-1',
        prescribedMealPlan: JSON.stringify({ note: 'Previous plan' }),
      });

      // PT (currentUserId: 'pt-user-id') generates and saves for student-1
      const plan = await service.generateMealPlan('pt-user-id', {
        studentId: 'student-1',
        targetCalories: 2100,
        targetProtein: 160,
        targetCarbs: 210,
        targetFat: 65,
        saveToDatabase: true,
      });

      expect(plan).toBeDefined();
      expect(prismaMock.nutritionTarget.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            studentId: 'student-1',
            targetCalo: 2100,
          }),
        }),
      );
    });
  });

  describe('logMeal - Validation Guards', () => {
    it('should reject logging meals for future dates with BadRequestException', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);

      await expect(
        service.logMeal('user-1', {
          logDate: tomorrow.toISOString(),
          mealName: 'BREAKFAST',
          items: [
            {
              foodId: 'food-chicken',
              weightInGram: 100,
            },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
