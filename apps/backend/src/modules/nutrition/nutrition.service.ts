import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type {
  FoodItem,
  FoodPaginatedResponse,
  SmartParsedFoodItem,
  SmartParsedGroup,
  SmartParseResponse,
  GenerateMealPlanDto,
  GeneratedMealPlanResponse,
  GeneratedMealSession,
  GeneratedMealPlanItem,
} from '@repo/types';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { LogMealDto } from './dto/log-meal.dto';

@Injectable()
export class NutritionService {
  constructor(private prisma: PrismaService) {}

  async searchFoods(
    query?: string,
    page: number = 1,
    limit: number = 8,
    category?: string,
  ): Promise<FoodPaginatedResponse> {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 8);
    const skip = (pageNum - 1) * limitNum;

    const trimmed = (query || '').trim();
    const catKey = (category || '').trim().toUpperCase();

    const SMART_CATEGORY_FILTERS: Record<
      string,
      {
        includeKeywords: string[];
        excludeKeywords: string[];
        startsWithKeywords: string[];
      }
    > = {
      VEG: {
        includeKeywords: [
          'rau',
          'cải',
          'muống',
          'xà lách',
          'súp lơ',
          'cà rốt',
          'bí đỏ',
          'bí đao',
          'bí xanh',
          'cà chua',
          'bắp cải',
          'cải thìa',
          'cải ngọt',
          'mồng tơi',
          'rau ngót',
          'su hào',
          'su su',
          'đậu bắp',
          'dưa chuột',
          'dưa leo',
          'măng',
          'nấm',
          'cần tây',
          'bông cải',
          'ớt chuông',
          'củ dền',
          'củ cải',
          'mướp',
          'bầu',
          'hoa chuối',
          'giá đỗ',
          'ngó sen',
        ],
        excludeKeywords: [
          'bánh',
          'kẹo',
          'chè',
          'snack',
          'nem rán',
          'chả giò',
          'bún',
          'phở',
          'miến',
        ],
        startsWithKeywords: [
          'rau',
          'cải',
          'củ',
          'xà lách',
          'súp lơ',
          'bông cải',
          'cà chua',
          'dưa chuột',
          'bí',
        ],
      },
      MEAT: {
        includeKeywords: [
          'thịt',
          'cá',
          'gà',
          'bò',
          'heo',
          'lợn',
          'tôm',
          'cua',
          'mực',
          'lươn',
          'vịt',
          'ngan',
          'cừu',
          'ức gà',
          'cá hồi',
          'cá thu',
          'cá basa',
          'cá lóc',
          'cá rô',
          'cá ngừ',
          'bê',
          'chả lụa',
          'giò lụa',
          'hải sản',
        ],
        excludeKeywords: [
          'bánh bao',
          'bánh mì',
          'bánh canh',
          'bánh quy',
          'kẹo',
          'snack',
        ],
        startsWithKeywords: [
          'thịt',
          'ức gà',
          'cá',
          'gà',
          'bò',
          'tôm',
          'mực',
          'lươn',
          'chả lụa',
        ],
      },
      EGG: {
        includeKeywords: [
          'trứng',
          'sữa',
          'phô mai',
          'pho mát',
          'cheese',
          'sữa chua',
          'yogurt',
          'whey',
          'váng sữa',
        ],
        excludeKeywords: ['bánh', 'kẹo', 'chè', 'trà sữa'],
        startsWithKeywords: ['trứng', 'sữa', 'sữa chua', 'phô mai', 'whey'],
      },
      RICE: {
        includeKeywords: [
          'cơm',
          'gạo',
          'yến mạch',
          'khoai lang',
          'khoai tây',
          'bánh mì',
          'bún',
          'phở',
          'miến',
          'ngô',
          'bắp',
          'nui',
          'mì ý',
          'spaghetti',
          'bánh canh',
        ],
        excludeKeywords: ['bánh ngọt', 'kẹo', 'snack', 'bánh quy'],
        startsWithKeywords: ['cơm', 'gạo', 'yến mạch', 'khoai', 'bún', 'phở'],
      },
      FRUIT: {
        includeKeywords: [
          'chuối',
          'táo',
          'cam',
          'quýt',
          'xoài',
          'dưa hấu',
          'ổi',
          'nho',
          'dứa',
          'thơm',
          'khóm',
          'bơ',
          'lê',
          'thanh long',
          'đu đủ',
          'dâu',
          'bưởi',
          'đào',
          'mận',
          'kiwi',
          'chôm chôm',
          'sầu riêng',
          'vải',
          'nhãn',
          'măng cụt',
          'lựu',
          'mãng cầu',
          'chanh leo',
          'quả',
          'trái',
        ],
        excludeKeywords: ['bánh', 'kẹo', 'nước ngọt', 'mứt', 'chè'],
        startsWithKeywords: [
          'chuối',
          'táo',
          'cam',
          'xoài',
          'dưa hấu',
          'ổi',
          'nho',
          'bơ',
          'thanh long',
        ],
      },
    };

    const activeCatRule = SMART_CATEGORY_FILTERS[catKey] || null;

    if (!trimmed && !activeCatRule) {
      const [data, total] = await Promise.all([
        this.prisma.foodLibrary.findMany({
          skip,
          take: limitNum,
          orderBy: [{ createdAt: 'desc' }, { name: 'asc' }],
        }),
        this.prisma.foodLibrary.count(),
      ]);

      return {
        data,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      };
    }

    // Smart Vietnamese Food Search:
    // Normalize typos and common synonyms
    let normalized = trimmed.toLowerCase();
    normalized = normalized.replace(/(^|\s+)ứ\s*gà(?=\s|$)/gi, '$1ức gà');
    normalized = normalized.replace(
      /(?:không|khong|k|ko)\s+da(?=\s|$)/gi,
      'bỏ da',
    );
    normalized = normalized.replace(
      /(?:không|khong|k|ko)\s+đường(?=\s|$)/gi,
      'không đường',
    );

    const words = normalized.split(/\s+/).filter(Boolean);

    try {
      const allConditions: Prisma.Sql[] = [];

      if (words.length > 0) {
        const queryConds = words.map((w) => {
          if (w.length <= 3) {
            return Prisma.sql`(name ~* ${'(^|[^a-zA-Z0-9à-ỹ])' + w + '([^a-zA-Z0-9à-ỹ]|$)'} OR unaccent(name) ~* ${'(^|[^a-zA-Z0-9])' + w + '([^a-zA-Z0-9]|$)'})`;
          }
          return Prisma.sql`unaccent(name) ILIKE unaccent(${'%' + w + '%'})`;
        });
        allConditions.push(Prisma.sql`(${Prisma.join(queryConds, ' AND ')})`);
      }

      if (activeCatRule) {
        const incConds = activeCatRule.includeKeywords.map(
          (k) => Prisma.sql`unaccent(name) ILIKE unaccent(${'%' + k + '%'})`,
        );
        const excConds = activeCatRule.excludeKeywords.map(
          (k) =>
            Prisma.sql`unaccent(name) NOT ILIKE unaccent(${'%' + k + '%'})`,
        );
        allConditions.push(
          Prisma.sql`(${Prisma.join(incConds, ' OR ')}) AND (${Prisma.join(excConds, ' AND ')})`,
        );
      }

      const whereClause = Prisma.join(allConditions, ' AND ');

      let orderClause = Prisma.sql`name ASC`;
      if (normalized) {
        orderClause = Prisma.sql`
          CASE
            WHEN name ILIKE ${normalized + '%'} THEN 0
            WHEN name ~* ${'(^|[^a-zA-Z0-9à-ỹ])' + normalized + '([^a-zA-Z0-9à-ỹ]|$)'} THEN 1
            WHEN unaccent(name) ILIKE unaccent(${normalized + '%'}) THEN 2
            WHEN unaccent(name) ILIKE unaccent(${'%' + normalized + '%'}) THEN 3
            ELSE 4
          END,
          name ASC
        `;
      } else if (activeCatRule) {
        const startsConds = activeCatRule.startsWithKeywords.map(
          (k) => Prisma.sql`unaccent(name) ILIKE unaccent(${k + '%'})`,
        );
        orderClause = Prisma.sql`
          CASE
            WHEN ${Prisma.join(startsConds, ' OR ')} THEN 0
            ELSE 1
          END,
          name ASC
        `;
      }

      const [data, totalResult] = await Promise.all([
        this.prisma.$queryRaw<FoodItem[]>(
          Prisma.sql`
            SELECT id, name, "caloriesPer100g", "proteinPer100g", "carbsPer100g", "fatPer100g", "fiberPer100g", "category", "imageUrl"
            FROM food_libraries
            WHERE ${whereClause}
            ORDER BY ${orderClause}
            LIMIT ${limitNum} OFFSET ${skip}
          `,
        ),
        this.prisma.$queryRaw<Array<{ count: number }>>(
          Prisma.sql`
            SELECT COUNT(*)::int as count
            FROM food_libraries
            WHERE ${whereClause}
          `,
        ),
      ]);

      const total = Number(totalResult[0]?.count || 0);

      return {
        data,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      };
    } catch (err) {
      console.warn('Smart unaccent search fallback to Prisma findMany:', err);
      const where: Prisma.FoodLibraryWhereInput = {};
      const andConditions: Prisma.FoodLibraryWhereInput[] = [];

      if (normalized) {
        andConditions.push({
          name: {
            contains: normalized,
            mode: 'insensitive',
          },
        });
      }

      if (activeCatRule) {
        andConditions.push({
          OR: activeCatRule.includeKeywords.map((k) => ({
            name: { contains: k, mode: 'insensitive' as const },
          })),
        });
        activeCatRule.excludeKeywords.forEach((k) => {
          andConditions.push({
            name: { not: { contains: k } },
          });
        });
      }

      if (andConditions.length > 0) {
        where.AND = andConditions;
      }

      const [data, total] = await Promise.all([
        this.prisma.foodLibrary.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { name: 'asc' },
        }),
        this.prisma.foodLibrary.count({ where }),
      ]);

      return {
        data,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      };
    }
  }

  async getUserRecentFoods(
    userId: string,
    page: number = 1,
    limit: number = 8,
  ): Promise<FoodPaginatedResponse> {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 8);

    // 1. Lấy danh sách các món ăn gần đây từ lịch sử nhật ký của user
    const recentItems = await this.prisma.mealItem.findMany({
      where: {
        mealLog: { userId },
        foodLibraryId: { not: null },
      },
      orderBy: {
        mealLog: { logDate: 'desc' },
      },
      take: 100,
      include: {
        food: true,
      },
    });

    const uniqueFoodsMap = new Map<string, FoodItem>();
    for (const item of recentItems) {
      if (item.food && !uniqueFoodsMap.has(item.food.id)) {
        uniqueFoodsMap.set(item.food.id, {
          ...item.food,
          isRecent: true,
        });
      }
    }

    const userFoods: FoodItem[] = Array.from(uniqueFoodsMap.values());

    const total = userFoods.length;
    const skip = (pageNum - 1) * limitNum;
    const paginatedData = userFoods.slice(skip, skip + limitNum);

    return {
      data: paginatedData,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    };
  }

  async logMeal(userId: string, dto: LogMealDto) {
    const targetLogDate = dto.logDate ? new Date(dto.logDate) : new Date();
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    if (targetLogDate > todayEnd) {
      throw new BadRequestException(
        'Không thể ghi nhận bữa ăn cho các ngày trước hiện tại!',
      );
    }

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const itemsData: Array<{
      foodLibraryId: string;
      foodName: string;
      weightInGram: number;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }> = [];

    for (const item of dto.items) {
      const food = await this.prisma.foodLibrary.findUnique({
        where: { id: item.foodId },
      });

      if (!food) {
        throw new NotFoundException(
          `Không tìm thấy thực phẩm với ID: ${item.foodId}`,
        );
      }

      // Công thức: (Macro / 100) * Trọng lượng
      const multiplier = item.weightInGram / 100;
      const calories = food.caloriesPer100g * multiplier;
      const protein = food.proteinPer100g * multiplier;
      const carbs = food.carbsPer100g * multiplier;
      const fat = food.fatPer100g * multiplier;

      totalCalories += calories;
      totalProtein += protein;
      totalCarbs += carbs;
      totalFat += fat;

      itemsData.push({
        foodLibraryId: food.id,
        foodName: food.name,
        weightInGram: item.weightInGram,
        calories: Math.round(calories * 10) / 10,
        protein: Math.round(protein * 10) / 10,
        carbs: Math.round(carbs * 10) / 10,
        fat: Math.round(fat * 10) / 10,
      });
    }

    // Tạo MealLog
    return this.prisma.mealLog.create({
      data: {
        userId,
        mealName: dto.mealName,
        logDate: dto.logDate ? new Date(dto.logDate) : new Date(),
        totalCalories: Math.round(totalCalories * 10) / 10,
        totalProtein: Math.round(totalProtein * 10) / 10,
        totalCarbs: Math.round(totalCarbs * 10) / 10,
        totalFat: Math.round(totalFat * 10) / 10,
        items: {
          create: itemsData,
        },
      },
      include: {
        items: true,
      },
    });
  }

  async getDailyNutrition(userId: string, date: Date) {
    // Tạo start of day và end of day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [meals, user, streak] = await Promise.all([
      this.prisma.mealLog.findMany({
        where: {
          userId,
          logDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          items: true,
        },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          nutritionTargets: {
            orderBy: { effectiveDate: 'desc' },
            take: 1,
          },
        },
      }),
      this.getStreakData(userId),
    ]);

    // Tổng kết toàn ngày & Nhóm theo bữa ăn (mealName)
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const mealSummaryMap: Record<
      string,
      {
        mealName: string;
        totalCalories: number;
        totalProtein: number;
        totalCarbs: number;
        totalFat: number;
        items: Array<{
          foodName: string;
          weightInGram: number;
          calories: number;
        }>;
      }
    > = {};

    meals.forEach((meal) => {
      totalCalories += meal.totalCalories;
      totalProtein += meal.totalProtein;
      totalCarbs += meal.totalCarbs;
      totalFat += meal.totalFat;

      const type = meal.mealName;
      if (!mealSummaryMap[type]) {
        mealSummaryMap[type] = {
          mealName: type,
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          items: [],
        };
      }

      mealSummaryMap[type].totalCalories += meal.totalCalories;
      mealSummaryMap[type].totalProtein += meal.totalProtein;
      mealSummaryMap[type].totalCarbs += meal.totalCarbs;
      mealSummaryMap[type].totalFat += meal.totalFat;

      if (meal.items) {
        meal.items.forEach((item) => {
          mealSummaryMap[type].items.push({
            foodName: item.foodName,
            weightInGram: item.weightInGram,
            calories: item.calories,
          });
        });
      }
    });

    // Làm tròn số liệu cho từng bữa ăn
    Object.values(mealSummaryMap).forEach((summary) => {
      summary.totalCalories = Math.round(summary.totalCalories);
      summary.totalProtein = Math.round(summary.totalProtein * 10) / 10;
      summary.totalCarbs = Math.round(summary.totalCarbs * 10) / 10;
      summary.totalFat = Math.round(summary.totalFat * 10) / 10;
    });

    const target = user?.nutritionTargets?.[0];
    const targetCalo = target?.targetCalo || 2000;
    const targetProtein = target?.targetProtein || 150;
    const targetCarbs = target?.targetCarbs || 200;
    const targetFat = target?.targetFat || 65;

    const consumedCaloRound = Math.round(totalCalories);
    const consumedProteinRound = Math.round(totalProtein * 10) / 10;
    const consumedCarbsRound = Math.round(totalCarbs * 10) / 10;
    const consumedFatRound = Math.round(totalFat * 10) / 10;

    const caloPercentage = targetCalo
      ? Math.min((consumedCaloRound / targetCalo) * 100, 100)
      : 0;
    const proteinPercentage = targetProtein
      ? Math.min((consumedProteinRound / targetProtein) * 100, 100)
      : 0;
    const carbsPercentage = targetCarbs
      ? Math.min((consumedCarbsRound / targetCarbs) * 100, 100)
      : 0;
    const fatPercentage = targetFat
      ? Math.min((consumedFatRound / targetFat) * 100, 100)
      : 0;

    const circumference = 816;
    const strokeDashoffset = Math.round(
      circumference - (caloPercentage / 100) * circumference,
    );
    const remainingCalories = Math.round(
      Math.max(0, targetCalo - consumedCaloRound),
    );

    const mealSlots = this.getMealSlotsByFrequency(user?.mealFrequency);

    return {
      date: startOfDay.toISOString(),
      targets: {
        calories: targetCalo,
        protein: targetProtein,
        carbs: targetCarbs,
        fat: targetFat,
      },
      consumed: {
        calories: consumedCaloRound,
        protein: consumedProteinRound,
        carbs: consumedCarbsRound,
        fat: consumedFatRound,
      },
      progress: {
        caloriesPercent: Math.round(caloPercentage * 10) / 10,
        proteinPercent: Math.round(proteinPercentage * 10) / 10,
        carbsPercent: Math.round(carbsPercentage * 10) / 10,
        fatPercent: Math.round(fatPercentage * 10) / 10,
        strokeDashoffset,
        remainingCalories,
      },
      streak,
      mealSlots,
      meals,
      mealSummary: mealSummaryMap,
    };
  }

  async getStreakData(userId: string) {
    // Bound to the last 90 days to utilize @@index([userId, logDate]) and prevent unbound table scan
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    ninetyDaysAgo.setHours(0, 0, 0, 0);

    const mealLogs = await this.prisma.mealLog.findMany({
      where: {
        userId,
        totalCalories: { gt: 0 },
        logDate: { gte: ninetyDaysAgo },
      },
      select: {
        logDate: true,
      },
      orderBy: {
        logDate: 'desc',
      },
      take: 500,
    });

    const loggedDatesSet = new Set<string>();
    mealLogs.forEach((log) => {
      const d = new Date(log.logDate);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      loggedDatesSet.add(`${yyyy}-${mm}-${dd}`);
    });

    const loggedDates = Array.from(loggedDatesSet);
    const totalLoggedDays = loggedDates.length;

    let currentStreak = 0;
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const checkDate = new Date(now);
    if (!loggedDatesSet.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const yyyy = checkDate.getFullYear();
      const mm = String(checkDate.getMonth() + 1).padStart(2, '0');
      const dd = String(checkDate.getDate()).padStart(2, '0');
      const dateKey = `${yyyy}-${mm}-${dd}`;

      if (loggedDatesSet.has(dateKey)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      currentStreak,
      totalLoggedDays,
      loggedDates,
    };
  }

  private getMealSlotsByFrequency(freq?: number | null) {
    switch (freq) {
      case 2:
        return [
          { id: 'BREAKFAST', name: 'Bữa Sáng', icon: 'wb_twilight' },
          { id: 'DINNER', name: 'Bữa Tối', icon: 'dark_mode' },
        ];
      case 3:
        return [
          { id: 'BREAKFAST', name: 'Bữa Sáng', icon: 'wb_twilight' },
          { id: 'LUNCH', name: 'Bữa Trưa', icon: 'light_mode' },
          { id: 'DINNER', name: 'Bữa Tối', icon: 'dark_mode' },
        ];
      case 5:
        return [
          { id: 'BREAKFAST', name: 'Bữa Sáng', icon: 'wb_twilight' },
          { id: 'MORNING_SNACK', name: 'Phụ Sáng', icon: 'bakery_dining' },
          { id: 'LUNCH', name: 'Bữa Trưa', icon: 'light_mode' },
          { id: 'AFTERNOON_SNACK', name: 'Phụ Chiều', icon: 'icecream' },
          { id: 'DINNER', name: 'Bữa Tối', icon: 'dark_mode' },
        ];
      case 4:
      default:
        return [
          { id: 'BREAKFAST', name: 'Bữa Sáng', icon: 'wb_twilight' },
          { id: 'LUNCH', name: 'Bữa Trưa', icon: 'light_mode' },
          { id: 'DINNER', name: 'Bữa Tối', icon: 'dark_mode' },
          { id: 'SNACK', name: 'Bữa Phụ', icon: 'icecream' },
        ];
    }
  }

  parseSmartFoodText(
    rawText: string,
  ): Array<{ query: string; weight: number }> {
    if (!rawText || typeof rawText !== 'string') return [];

    let text = rawText.trim().toLowerCase();

    // 1. Normalize voice-to-text artifacts:
    text = text.replace(/(\d+)[.,]000(?!\d)/g, '$1g');
    text = text.replace(/(\d+)\s*k\b/gi, '$1g');
    text = text.replace(/(\d+)\s*(?:gam|gram|gr)\b/gi, '$1g');

    text = text.replace(
      /(\d+(?:[.,]\d+)?)\s*(?:kg|kí|ký)\b/gi,
      (_, p1: string) => {
        const val = parseFloat(p1.replace(',', '.'));
        return `${Math.round(val * 1000)}g`;
      },
    );

    text = text.replace(
      /(\d+)\s*(?:lạng|lang)\b/gi,
      (_, p1: string) => `${Number(p1) * 100}g `,
    );
    text = text.replace(/(?:^|\s+)nửa lạng(?=\s+|$)/gi, ' 50g ');

    text = text.replace(
      /(\d+)\s*(?:bát|chén)\b/gi,
      (_, p1) => `${Number(p1) * 150}g `,
    );
    text = text.replace(/(?:^|\s+)nửa (?:bát|chén)(?=\s+|$)/gi, ' 75g ');

    text = text.replace(
      /(\d+)\s*(?:quả|hột|trái)\b/gi,
      (_, p1) => `${Number(p1) * 50}g `,
    );
    text = text.replace(/(\d+)\s*đĩa\b/gi, (_, p1) => `${Number(p1) * 200}g `);
    text = text.replace(/(\d+)\s*tô\b/gi, (_, p1) => `${Number(p1) * 350}g `);
    text = text.replace(
      /(\d+)\s*(?:ly|cốc|hộp)\b/gi,
      (_, p1) => `${Number(p1) * 200}g `,
    );

    // Normalize connectives & punctuation to delimiter '|'
    text = text.replace(/[,;+&\n]/g, ' | ');
    text = text.replace(/(?:^|\s+)(?:và|kèm|với|cùng)(?=\s+|$)/gi, ' | ');

    // Split by explicit delimiters first
    const subPhrases = text
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean);

    const cleanName = (s: string) =>
      s
        .replace(/^(?:\||\s|và|kèm|với)+|(?:\||\s|và|kèm|với)+$/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

    const results: Array<{ query: string; weight: number }> = [];

    for (const phrase of subPhrases) {
      // Case 1: Prefix format: e.g. "200g cơm trắng 100g ức gà sống"
      if (/^\d+\s*g\b/i.test(phrase)) {
        const regex = /(\d+)\s*g\s*([^0-9]+)/gi;
        let match: RegExpExecArray | null;
        let matchedAny = false;
        while ((match = regex.exec(phrase)) !== null) {
          matchedAny = true;
          const w = parseInt(match[1] || '100', 10);
          const name = cleanName(match[2] || '');
          if (name) {
            results.push({ query: name, weight: w });
          }
        }
        if (!matchedAny) {
          const name = cleanName(phrase);
          if (name) results.push({ query: name, weight: 100 });
        }
      }
      // Case 2: Suffix format: e.g. "cơm trắng 180g ức gà sống 180g"
      else if (/\d+\s*g\b/i.test(phrase)) {
        const regex = /([^0-9]+?)\s*(\d+)\s*g/gi;
        let match: RegExpExecArray | null;
        let matchedAny = false;
        while ((match = regex.exec(phrase)) !== null) {
          matchedAny = true;
          const name = cleanName(match[1] || '');
          const w = parseInt(match[2] || '100', 10);
          if (name) {
            results.push({ query: name, weight: w });
          }
        }
        if (!matchedAny) {
          const name = cleanName(phrase);
          if (name) results.push({ query: name, weight: 100 });
        }
      }
      // Case 3: Food name without specific weight: e.g. "cá", "cơm trắng"
      else {
        const name = cleanName(phrase);
        if (name && isNaN(Number(name))) {
          results.push({ query: name, weight: 100 });
        }
      }
    }

    return results;
  }

  async smartParseFoodInput(rawText: string): Promise<SmartParseResponse> {
    const parsedItems = this.parseSmartFoodText(rawText);
    if (parsedItems.length === 0) {
      return { parsedCount: 0, items: [], allFoods: [] };
    }

    const itemsResult: SmartParsedGroup[] = [];
    const allFoodsMap = new Map<string, SmartParsedFoodItem>();

    for (const item of parsedItems) {
      const searchRes = await this.searchFoods(item.query, 1, 6);
      let foodList = searchRes.data || [];

      if (foodList.length === 0 && item.query.includes(' ')) {
        const subTokens = item.query.split(/\s+/).filter(Boolean);
        if (subTokens.length >= 2) {
          const fallbackRes = await this.searchFoods(
            subTokens.slice(0, 2).join(' '),
            1,
            4,
          );
          if (fallbackRes.data && fallbackRes.data.length > 0) {
            foodList = fallbackRes.data;
          }
        }
      }

      const calculatedFoods: SmartParsedFoodItem[] = foodList.map(
        (f: FoodItem) => {
          const cal = Math.round((f.caloriesPer100g * item.weight) / 100);
          const pro =
            Math.round(((f.proteinPer100g * item.weight) / 100) * 10) / 10;
          const carbs =
            Math.round(((f.carbsPer100g * item.weight) / 100) * 10) / 10;
          const fat =
            Math.round(((f.fatPer100g * item.weight) / 100) * 10) / 10;
          const enriched: SmartParsedFoodItem = {
            ...f,
            suggestedWeight: item.weight,
            calculatedCalories: cal,
            calculatedProtein: pro,
            calculatedCarbs: carbs,
            calculatedFat: fat,
          };
          if (!allFoodsMap.has(f.id)) {
            allFoodsMap.set(f.id, enriched);
          }
          return enriched;
        },
      );

      itemsResult.push({
        query: item.query,
        detectedWeight: item.weight,
        matchedFoods: calculatedFoods,
      });
    }

    return {
      parsedCount: parsedItems.length,
      items: itemsResult,
      allFoods: Array.from(allFoodsMap.values()),
    };
  }

  async smartParseFoodImage(imageBase64: string): Promise<SmartParseResponse> {
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      throw new BadRequestException('Vui lòng cung cấp hình ảnh bữa ăn.');
    }

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey) {
      throw new BadRequestException(
        'Hệ thống chưa được cấu hình GEMINI_API_KEY trong file .env',
      );
    }

    let mimeType = 'image/jpeg';
    let base64Data = imageBase64.trim();
    if (base64Data.startsWith('data:')) {
      const matches = base64Data.match(
        /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/,
      );
      if (matches && matches[1] && matches[2]) {
        mimeType = matches[1];
        base64Data = matches[2];
      }
    }

    const prompt = `Bạn là một chuyên gia dinh dưỡng và phân tích ẩm thực Việt Nam. 
                    Nhiệm vụ của bạn là nhìn vào bức ảnh bữa ăn được cung cấp, nhận diện tất cả các món ăn có trong ảnh và ước lượng khối lượng (gram) của từng món dựa trên kích thước khẩu phần thực tế.
                      
                    QUY TẮC BẮT BUỘC:
                    1. Không giải thích, không viết lời mở đầu hay kết luận.
                    2. Chỉ trả về một chuỗi văn bản duy nhất liệt kê danh sách các món ăn theo đúng định dạng: "[khối lượng tính bằng gram]g [tên món ăn]".
                    3. Các món ăn cách nhau bằng dấu phẩy (,).
                    4. Tên món ăn phải rõ ràng bằng tiếng Việt (ví dụ: cơm trắng, ức gà áp chảo, bông cải xanh luộc, phở bò, thịt kho tàu...).
                      
                    Ví dụ định dạng đầu ra mong muốn:
                    200g cơm trắng, 150g ức gà áp chảo, 100g bông cải xanh luộc`;

    const candidateModels = [
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-2.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
    ];
    let detectedText = '';
    let lastError = '';

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  { inline_data: { mime_type: mimeType, data: base64Data } },
                ],
              },
            ],
          }),
        });
        clearTimeout(timeoutId);

        type GeminiApiResponse = {
          candidates?: Array<{
            content?: {
              parts?: Array<{
                text?: string;
              }>;
            };
          }>;
          error?: {
            code?: number;
            message?: string;
            status?: string;
          };
        };

        const data = (await response.json()) as GeminiApiResponse;
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          detectedText = candidateText.trim();
          break;
        } else if (data.error?.message) {
          lastError = data.error.message;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        lastError = message;
      }
    }

    if (!detectedText) {
      const isHighDemand = lastError.toLowerCase().includes('high demand');
      throw new BadRequestException(
        isHighDemand
          ? 'Hệ thống đang quá tải tạm thời, vui lòng thử lại sau vài giây hoặc tìm món thủ công.'
          : lastError
            ? `Không thể phân tích ảnh: ${lastError}`
            : 'Không thể nhận diện món ăn từ hình ảnh. Vui lòng chụp rõ hơn hoặc nhập thủ công.',
      );
    }

    const lower = detectedText.toLowerCase();
    if (
      lower.includes('không thể nhận diện') ||
      lower.includes('không có món') ||
      lower.includes('không tìm thấy')
    ) {
      return {
        rawDetectedText: detectedText,
        parsedCount: 0,
        items: [],
        allFoods: [],
      };
    }

    const parsed = await this.smartParseFoodInput(detectedText);
    return {
      rawDetectedText: detectedText,
      ...parsed,
    };
  }

  async createFood(data: {
    name: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    fiberPer100g?: number;
    category?: string;
    imageUrl?: string;
  }) {
    if (!data.name || !data.name.trim()) {
      throw new BadRequestException('Tên món ăn không được để trống');
    }

    return this.prisma.foodLibrary.create({
      data: {
        name: data.name.trim(),
        caloriesPer100g: Math.max(0, Number(data.caloriesPer100g) || 0),
        proteinPer100g: Math.max(0, Number(data.proteinPer100g) || 0),
        carbsPer100g: Math.max(0, Number(data.carbsPer100g) || 0),
        fatPer100g: Math.max(0, Number(data.fatPer100g) || 0),
        fiberPer100g: data.fiberPer100g ? Number(data.fiberPer100g) : undefined,
        category: data.category || 'Món ăn tự tạo',
        imageUrl: data.imageUrl || undefined,
      },
    });
  }

  // ==========================================
  // AI MEAL PLANNER - GỢI Ý THỰC ĐƠN THÔNG MINH
  // ==========================================
  async generateMealPlan(
    currentUserId: string,
    dto: GenerateMealPlanDto,
  ): Promise<GeneratedMealPlanResponse> {
    const targetUserId =
      dto.studentId && dto.studentId.trim() !== ''
        ? dto.studentId.trim()
        : currentUserId;

    // 1. Truy vấn thông tin cá nhân (User Profiling)
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        nutritionTargets: {
          orderBy: { effectiveDate: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new NotFoundException(
        'Không tìm thấy thông tin người dùng / học viên.',
      );
    }

    const latestTarget = user.nutritionTargets?.[0] || null;

    // Co giãn mục tiêu theo DTO override hoặc lấy trực tiếp từ bảng nutrition_targets
    const targetCalories = Math.max(
      1000,
      Number(
        dto.targetCalories || latestTarget?.targetCalo || user.tdee || 2000,
      ),
    );

    const targetProtein = Math.max(
      40,
      Number(
        dto.targetProtein ||
          latestTarget?.targetProtein ||
          Math.round((targetCalories * 0.3) / 4),
      ),
    );

    const targetCarbs = Math.max(
      50,
      Number(
        dto.targetCarbs ||
          latestTarget?.targetCarbs ||
          Math.round((targetCalories * 0.4) / 4),
      ),
    );

    const targetFat = Math.max(
      20,
      Number(
        dto.targetFat ||
          latestTarget?.targetFat ||
          Math.round((targetCalories * 0.3) / 9),
      ),
    );

    // Danh sách dị ứng & bệnh lý: Hợp nhất cả healthConditions và dietaryPreferences (vì Onboarding lưu lựa chọn dị ứng vào dietaryPreferences)
    const rawAllergies = [
      ...(Array.isArray(dto.healthConditions) && dto.healthConditions.length > 0
        ? dto.healthConditions
        : user.healthConditions || []),
      ...(Array.isArray(dto.dietaryPreferences) &&
      dto.dietaryPreferences.length > 0
        ? dto.dietaryPreferences
        : user.dietaryPreferences || []),
    ];

    // Sở thích ăn uống
    const preferences =
      Array.isArray(dto.dietaryPreferences) && dto.dietaryPreferences.length > 0
        ? dto.dietaryPreferences
        : user.dietaryPreferences || [];

    // Helper chuẩn hóa tiếng Việt không dấu
    const removeTones = (str: string): string => {
      return (str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();
    };

    // Xác định mục tiêu thể hình (Goal): Giảm cân / Tăng cân / Duy trì
    const rawGoal = dto.goal || user.goal || '';
    const normGoal = removeTones(rawGoal).toUpperCase();

    // Điều kiện tăng cân: Goal rõ ràng là GAIN_WEIGHT / Tăng cân / Bulk, hoặc thặng dư calo lớn
    const isGainingWeight =
      normGoal.includes('GAIN') ||
      normGoal.includes('TANG') ||
      normGoal.includes('BULK') ||
      (typeof user.caloriesOffset === 'number' && user.caloriesOffset > 150) ||
      (Boolean(user.tdee) && targetCalories > (user.tdee || 2000) + 200);

    // Mặc định hoặc khi có mục tiêu giảm cân / thâm hụt calo: Không bao giờ cho ăn thịt có da
    const isLosingWeight =
      !isGainingWeight ||
      normGoal.includes('LOSE') ||
      normGoal.includes('GIAM') ||
      normGoal.includes('CUT') ||
      (typeof user.caloriesOffset === 'number' && user.caloriesOffset < 0) ||
      (Boolean(user.tdee) && targetCalories < (user.tdee || 2000));

    // Helper kiểm tra thực phẩm có da (da gà, da vịt, da heo...)
    const hasSkin = (name: string): boolean => {
      const n = removeTones(name);
      return (
        n.includes('co da') ||
        n.includes('da ga') ||
        n.includes('da heo') ||
        n.includes('da vit') ||
        n.includes('nguyen da') ||
        n.includes('kem da') ||
        n.includes('bi heo') ||
        n.includes('bi lon')
      );
    };

    type MealKey =
      | 'breakfast'
      | 'morningSnack'
      | 'lunch'
      | 'afternoonSnack'
      | 'dinner'
      | 'snack';

    // Lấy đúng số bữa mà học viên đã chọn trong hồ sơ Onboarding (user.mealFrequency)
    const effectiveFrequency =
      dto.mealFrequency ||
      user.mealFrequency ||
      (dto.selectedMeals?.length ? undefined : 3);

    let activeMeals: MealKey[];
    if (
      dto.selectedMeals &&
      Array.isArray(dto.selectedMeals) &&
      dto.selectedMeals.length >= 1
    ) {
      activeMeals = dto.selectedMeals as MealKey[];
    } else {
      switch (effectiveFrequency) {
        case 2:
          activeMeals = ['breakfast', 'dinner'];
          break;
        case 3:
          activeMeals = ['breakfast', 'lunch', 'dinner'];
          break;
        case 5:
          activeMeals = [
            'breakfast',
            'morningSnack',
            'lunch',
            'afternoonSnack',
            'dinner',
          ];
          break;
        case 4:
        default:
          activeMeals = ['breakfast', 'lunch', 'dinner', 'snack'];
          break;
      }
    }

    const isFewMeals = activeMeals.length <= 2;

    // 2. Thuật toán lọc an toàn (Safety / Allergy Filter)
    const ALLERGY_SYNONYMS: Record<string, string[]> = {
      // Dị ứng Đậu phộng / Các loại hạt (Hỗ trợ cả mã Onboarding PEANUT, tiếng Việt và tất cả các loại hạt)
      peanut: [
        'lac',
        'dau phong',
        'dau phung',
        'bo dau phong',
        'dau lac',
        'hat lac',
        'dau dau phong',
        'hanh nhan',
        'hat dieu',
        'oc cho',
        'mac ca',
        'hat de',
        'cac loai hat',
        'hat dinh duong',
      ],
      'dau phong': [
        'lac',
        'dau phong',
        'dau phung',
        'bo dau phong',
        'dau lac',
        'hat lac',
        'dau dau phong',
        'hanh nhan',
        'hat dieu',
        'oc cho',
        'mac ca',
        'hat de',
        'cac loai hat',
        'hat dinh duong',
      ],
      lac: [
        'lac',
        'dau phong',
        'dau phung',
        'bo dau phong',
        'dau lac',
        'hat lac',
        'dau dau phong',
        'hanh nhan',
        'hat dieu',
        'oc cho',
        'mac ca',
        'hat de',
        'cac loai hat',
        'hat dinh duong',
      ],
      hat: [
        'lac',
        'dau phong',
        'dau phung',
        'bo dau phong',
        'dau lac',
        'hat lac',
        'dau dau phong',
        'hanh nhan',
        'hat dieu',
        'oc cho',
        'mac ca',
        'hat de',
        'cac loai hat',
        'hat dinh duong',
      ],
      nuts: [
        'lac',
        'dau phong',
        'dau phung',
        'bo dau phong',
        'dau lac',
        'hat lac',
        'dau dau phong',
        'hanh nhan',
        'hat dieu',
        'oc cho',
        'mac ca',
        'hat de',
        'cac loai hat',
        'hat dinh duong',
      ],

      // Dị ứng Hải sản (SEAFOOD)
      seafood: [
        'tom',
        'cua',
        'ca',
        'muc',
        'ngheu',
        'so',
        'oc',
        'hau',
        'bach tuoc',
        'basa',
        'hoi',
        'thu',
        'loc',
        'ro',
        'ngu',
        'luon',
        'hai san',
        'tep',
        'ghe',
      ],
      'hai san': [
        'tom',
        'cua',
        'ca',
        'muc',
        'ngheu',
        'so',
        'oc',
        'hau',
        'bach tuoc',
        'basa',
        'hoi',
        'thu',
        'loc',
        'ro',
        'ngu',
        'luon',
        'hai san',
        'tep',
        'ghe',
      ],
      tom: ['tom', 'tep'],
      cua: ['cua', 'ghe'],
      ca: ['ca', 'basa', 'hoi', 'thu', 'loc', 'ro', 'ngu', 'luon'],
      muc: ['muc', 'bach tuoc'],

      // Dị ứng Sữa & Lactose (MILK)
      milk: [
        'sua',
        'pho mai',
        'pho mat',
        'cheese',
        'sua chua',
        'vang sua',
        'whey',
        'lactose',
      ],
      sua: [
        'sua',
        'pho mai',
        'pho mat',
        'cheese',
        'sua chua',
        'vang sua',
        'whey',
        'lactose',
      ],

      // Dị ứng Trứng (EGG)
      egg: ['trung', 'hot ga', 'hot vit'],
      trung: ['trung', 'hot ga', 'hot vit'],

      // Dị ứng Đậu nành
      'dau nanh': ['dau nanh', 'dau phu', 'dau hu', 'tau hu', 'soy'],
      soy: ['dau nanh', 'dau phu', 'dau hu', 'tau hu', 'soy'],

      // Bệnh lý Gout: Kiêng nội tạng, thịt đỏ giàu purine
      gout: [
        'long',
        'gan',
        'tim',
        'cat',
        'noi tang',
        'thit bo',
        'nam bo',
        'than bo',
        'bap bo',
      ],
      'thit bo': ['bo', 'be', 'nam bo', 'than bo', 'bap bo'],
      'thit heo': [
        'heo',
        'lon',
        'ba chi',
        'suon non',
        'gio heo',
        'cha lua',
        'gio lua',
      ],

      // Bệnh lý Tiểu đường (DIABETES): Kiêng đồ ngọt, đường tinh luyện, nước ngọt, siro
      diabetes: [
        'duong',
        'ngot',
        'che',
        'banh',
        'keo',
        'sua dac',
        'nuoc ngot',
        'sting',
        'coca',
        'pepsi',
        'siro',
        'kem',
      ],
      'tieu duong': [
        'duong',
        'ngot',
        'che',
        'banh',
        'keo',
        'sua dac',
        'nuoc ngot',
        'sting',
        'coca',
        'pepsi',
        'siro',
        'kem',
      ],

      // Bệnh lý Huyết áp cao (BLOOD_PRESSURE): Kiêng đồ muối mặn, thực phẩm chế biến sẵn nhiều sodium
      blood_pressure: [
        'ca muoi',
        'dua muoi',
        'mam',
        'kho quet',
        'xuc xich',
        'thit xong khoi',
        'do hop',
      ],
      'huyet ap': [
        'ca muoi',
        'dua muoi',
        'mam',
        'kho quet',
        'xuc xich',
        'thit xong khoi',
        'do hop',
      ],

      // Bệnh lý Dạ dày (STOMACH): Kiêng cay nóng, chua, cà phê, chất kích thích
      stomach: ['ot', 'tieu', 'cay', 'giam', 'chanh', 'ca phe', 'ruou', 'bia'],
      'da day': ['ot', 'tieu', 'cay', 'giam', 'chanh', 'ca phe', 'ruou', 'bia'],
    };

    const bannedKeywords = new Set<string>();

    for (const item of rawAllergies) {
      const norm = removeTones(item);
      if (
        !norm ||
        norm === 'none' ||
        norm === 'healthy' ||
        norm === 'parq_attention'
      )
        continue;
      let matchedSynonym = false;
      for (const [key, syns] of Object.entries(ALLERGY_SYNONYMS)) {
        if (norm.includes(key) || key.includes(norm)) {
          syns.forEach((s) => bannedKeywords.add(s));
          matchedSynonym = true;
        }
      }
      if (!matchedSynonym) {
        bannedKeywords.add(norm);
      }
    }

    const isVegan = preferences.some((p) => {
      const np = removeTones(p);
      return (
        np.includes('chay') || np.includes('vegan') || np.includes('vegetarian')
      );
    });

    const isNoPork = preferences.some((p) => {
      const np = removeTones(p);
      return (
        np.includes('khong an thit heo') ||
        np.includes('no_pork') ||
        np.includes('halal')
      );
    });

    const isNoBeef = preferences.some((p) => {
      const np = removeTones(p);
      return np.includes('khong an thit bo') || np.includes('no_beef');
    });

    if (isVegan) {
      [
        'thit',
        'ga',
        'bo',
        'heo',
        'lon',
        'vit',
        'tom',
        'cua',
        'ca',
        'muc',
        'cha lua',
        'gio lua',
        'hai san',
      ].forEach((s) => bannedKeywords.add(s));
    }
    if (isNoPork) {
      [
        'heo',
        'lon',
        'ba chi',
        'suon non',
        'gio heo',
        'cha lua',
        'gio lua',
      ].forEach((s) => bannedKeywords.add(s));
    }
    if (isNoBeef) {
      ['bo', 'be', 'nam bo', 'than bo', 'bap bo'].forEach((s) =>
        bannedKeywords.add(s),
      );
    }

    const allFoods = await this.prisma.foodLibrary.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const bannedArr = Array.from(bannedKeywords);

    // ========================================================
    // THUẬT TOÁN PHÂN RỔ DINH DƯỠNG TRỰC TIẾP TỪ CSDL (DATABASE-DRIVEN)
    // - Truy vấn trực tiếp từ bảng foodLibrary (> 6.400 món trong DB)
    // - Lọc theo các tiêu chuẩn thể hình (Gym & Eat Clean):
    //   + Bữa sáng: Protein nhẹ (Trứng, Sữa chua), Bánh mì đen/yến mạch/ngô
    //   + Bữa trưa: Cơm trắng/lứt, bún tươi (KHÔNG KHOAI) + Thịt nạc/hải sản thật (BỎ ĐẬU PHỤ)
    //   + Bữa tối: Cơm lứt/trắng/khoai lang (tối đa 200g) + Thịt nạc luân phiên khác bữa trưa
    //   + Bữa phụ: Trái cây tươi + Sữa chua + Hạt dinh dưỡng nguyên chất
    // ========================================================

    const isSafe = (item: { name: string }) => {
      const n = removeTones(item.name);
      return !bannedArr.some((b) => n.includes(b));
    };

    interface PoolFoodItem {
      id: string;
      name: string;
      caloriesPer100g: number;
      proteinPer100g: number;
      carbsPer100g: number;
      fatPer100g: number;
      category?: string | null;
      imageUrl?: string | null;
      minGrams?: number;
      maxGrams?: number;
      fixedGrams?: number;
    }

    // Dự phòng các rổ thực phẩm an toàn nếu người dùng có nhiều dị ứng / bệnh lý nghiêm ngặt
    const safeProteinFallback: PoolFoodItem[] = allFoods
      .filter((f) => f.proteinPer100g >= 12 && isSafe(f))
      .map((f) => ({ ...f, minGrams: 100, maxGrams: 250 }));

    const safeCarbFallback: PoolFoodItem[] = allFoods
      .filter((f) => f.carbsPer100g >= 20 && isSafe(f))
      .map((f) => ({ ...f, minGrams: 100, maxGrams: 300 }));

    const safeVegFallback: PoolFoodItem[] = allFoods
      .filter((f) => f.caloriesPer100g < 50 && f.carbsPer100g < 10 && isSafe(f))
      .map((f) => ({ ...f, fixedGrams: 150 }));

    const safeFruitFallback: PoolFoodItem[] = allFoods
      .filter(
        (f) => f.caloriesPer100g < 100 && f.carbsPer100g > 10 && isSafe(f),
      )
      .map((f) => ({ ...f, fixedGrams: 100 }));

    // 1. Đạm Bữa Sáng (Từ CSDL): Protein nhẹ (Trứng gà luộc, ốp la, sữa chua Hy Lạp)
    const bProtPool = allFoods
      .filter((f) => {
        const n = removeTones(f.name);
        if (f.proteinPer100g < 10) return false;
        if (
          n.includes('trung ga ta luoc') ||
          n.includes('trung ga chien/ran') ||
          n.includes('trung ga op la') ||
          n.includes('sua chua hy lap')
        ) {
          return !n.includes('kem') && !n.includes('pho mai') && isSafe(f);
        }
        return false;
      })
      .map((f) => ({
        ...f,
        minGrams: 50,
        maxGrams: 150,
      }));

    // 2. Tinh Bột Bữa Sáng (Từ CSDL): Bánh mì đen, yến mạch, khoai lang hấp, bắp ngọt
    const bCarbPool = allFoods
      .filter((f) => {
        const n = removeTones(f.name);
        if (
          n.includes('banh mi den') ||
          n.includes('banh mi sandwich') ||
          (n.includes('yen mach') && n.includes('ngam')) ||
          n.includes('bap ngot luoc') ||
          n.includes('ngo ngot luoc') ||
          (n.includes('khoai lang') &&
            (n.includes('hap') || n.includes('luoc')) &&
            !n.includes('banh'))
        ) {
          return (
            !n.includes('kem') &&
            !n.includes('starbucks') &&
            !n.includes('chien') &&
            isSafe(f)
          );
        }
        return false;
      })
      .map((f) => ({
        ...f,
        minGrams: 50,
        maxGrams: 150,
      }));

    // 3. Tinh Bột Bữa Trưa (Từ CSDL): Cơm trắng, cơm gạo lứt, bún tươi (TUYỆT ĐỐI KHÔNG DÙNG KHOAI)
    const lCarbPool = allFoods
      .filter((f) => {
        const n = removeTones(f.name);
        if (
          (n.includes('com trang') &&
            (n.includes('no') || n.includes('deo') || n.includes('dinh'))) ||
          (n.includes('com gao lut') &&
            !n.includes('nhao') &&
            !n.includes('kho')) ||
          (n.includes('bun tuoi') && !n.includes('kho'))
        ) {
          return (
            !n.includes('nam') &&
            !n.includes('chay') &&
            !n.includes('sot') &&
            isSafe(f)
          );
        }
        return false;
      })
      .map((f) => ({
        ...f,
        minGrams: 100,
        maxGrams: 300,
      }));

    // 4. Tinh Bột Bữa Tối (Từ CSDL): Cơm gạo lứt, cơm trắng, khoai lang hấp (tối đa 200g)
    const dCarbPool = allFoods
      .filter((f) => {
        const n = removeTones(f.name);
        if (
          (n.includes('com gao lut') && !n.includes('nhao')) ||
          (n.includes('com trang') &&
            (n.includes('no') || n.includes('deo') || n.includes('dinh'))) ||
          (n.includes('khoai lang') &&
            (n.includes('hap') || n.includes('luoc')) &&
            !n.includes('banh'))
        ) {
          return !n.includes('chay') && !n.includes('sot') && isSafe(f);
        }
        return false;
      })
      .map((f) => ({
        ...f,
        minGrams: 100,
        maxGrams: f.name.toLowerCase().includes('khoai') ? 200 : 300,
      }));

    // 5. Đạm Bữa Chính (Trưa & Tối) từ CSDL: Thịt nạc, hải sản thật (ức gà, bắp bò, thăn heo, tôm, cá hồi)
    const mProtPool = allFoods
      .filter((f) => {
        const n = removeTones(f.name);
        if (isVegan && (n.includes('dau phu') || n.includes('dau hu'))) {
          return !n.includes('chien') && !n.includes('ran') && isSafe(f);
        }
        if (f.proteinPer100g < 18) return false;

        // Bỏ da khi giảm cân / duy trì (trừ khi mục tiêu tăng cân rõ ràng)
        if (!isGainingWeight && hasSkin(f.name)) return false;

        if (
          n.includes('uc ga song bo da') ||
          (isGainingWeight && n.includes('uc ga song co da')) ||
          n.includes('uc ga xao') ||
          n.includes('uc ga luoc') ||
          (n.includes('bap bo') &&
            (n.includes('luoc') || n.includes('song'))) ||
          (n.includes('thit bo mong') && n.includes('nac')) ||
          (n.includes('than heo') && n.includes('nac')) ||
          (n.includes('tom') &&
            (n.includes('xao') || n.includes('luoc') || n.includes('hap'))) ||
          (n.includes('ca hoi') &&
            f.caloriesPer100g < 250 &&
            !n.includes('com nam'))
        ) {
          if (!isGainingWeight && hasSkin(f.name)) return false;
          return (
            !n.includes('muoi') &&
            !n.includes('nuoc dung') &&
            !n.includes('lau') &&
            !n.includes('nem') &&
            !n.includes('kfc') &&
            !n.includes('tam bot') &&
            !n.includes('chien gion') &&
            isSafe(f)
          );
        }
        return false;
      })
      .map((f) => ({
        ...f,
        minGrams: 100, // Đặt mức tối thiểu 100g (thay vì 150g) để kiểm soát chính xác lượng protein, không bị vượt target khi tăng cân
        maxGrams: isFewMeals ? 350 : 300,
      }));

    // 6. Rau Củ (Từ CSDL): Súp lơ xanh/trắng, bắp cải, rau cải thìa, rau muống luộc
    const vegPool = allFoods.filter((f) => {
      const n = removeTones(f.name);
      if (
        (n.includes('sup lo') && n.includes('luoc')) ||
        (n.includes('bong cai') && n.includes('luoc')) ||
        n.includes('bap cai luoc') ||
        n.includes('rau cai thia') ||
        n.includes('rau muong luoc') ||
        (n.includes('dua chuot') && n.includes('tuoi')) ||
        n.includes('bi dao luoc')
      ) {
        return (
          !n.includes('thit') &&
          !n.includes('xao') &&
          f.caloriesPer100g < 50 &&
          isSafe(f)
        );
      }
      return false;
    });

    // 7. Hoa Quả Bữa Phụ (Từ CSDL): Táo đỏ, táo xanh, chuối tiêu chín, ổi, dưa hấu
    const sFruitPool = allFoods
      .filter((f) => {
        const n = removeTones(f.name);
        if (
          (n.includes('qua tao do') && n.includes('tuoi')) ||
          (n.includes('qua tao xanh') && n.includes('tuoi')) ||
          (n.includes('chuoi tieu') &&
            n.includes('chin') &&
            !n.includes('banh') &&
            !n.includes('chien')) ||
          (n.includes('qua oi') && n.includes('tuoi')) ||
          (n.includes('dua hau') && n.includes('tuoi'))
        ) {
          return (
            !n.includes('sua chua') &&
            !n.includes('nuoc ep') &&
            !n.includes('kem') &&
            isSafe(f)
          );
        }
        return false;
      })
      .map((f) => ({ ...f, fixedGrams: 100 }));

    // 8. Sữa Chua Bữa Phụ (Từ CSDL): Sữa chua không đường, ít đường
    const sDairyPool = allFoods
      .filter((f) => {
        const n = removeTones(f.name);
        if (
          n.includes('sua chua khong duong') ||
          n.includes('sua chua it duong')
        ) {
          return !n.includes('nuoc uong') && !n.includes('dam da') && isSafe(f);
        }
        return false;
      })
      .map((f) => ({ ...f, fixedGrams: 100 }));

    // 9. Dầu Ăn & Chất Béo Lành Mạnh (Từ CSDL): Tuyệt đối an toàn theo bộ lọc dị ứng
    const oliveOilFood = allFoods.find((f) => {
      const n = removeTones(f.name);
      return (
        (n.includes('oliu') || n.includes('olive') || n.includes('o liu')) &&
        f.caloriesPer100g > 800 &&
        isSafe(f)
      );
    });

    const safeOils = allFoods.filter(
      (f) =>
        removeTones(f.name).includes('dau') &&
        f.caloriesPer100g > 700 &&
        isSafe(f),
    );

    const dbHealthyOil: PoolFoodItem = oliveOilFood ||
      safeOils[0] || {
        id: 'safe-olive-oil',
        name: 'Dầu ô liu (Olive oil)',
        caloriesPer100g: 884,
        proteinPer100g: 0,
        carbsPer100g: 0,
        fatPer100g: 100,
        category: 'HEALTHY_FAT',
      };

    const dbDinnerOil: PoolFoodItem = oliveOilFood || dbHealthyOil;

    // 10. Hạt & Bữa Phụ: Hạnh nhân, Hạt điều, Hạt lạc (loại trừ sạch khi dị ứng hạt / đậu phộng)
    const sNutPool = allFoods
      .filter((f) => {
        const n = removeTones(f.name);
        if (f.caloriesPer100g < 250) return false;
        if (
          (n.includes('hanh nhan') ||
            n.includes('hat dieu') ||
            n.includes('dau phong') ||
            n.includes('hat lac')) &&
          (n.includes('kho') ||
            n.includes('rang') ||
            n.includes('nguyen') ||
            n.includes('luoc') ||
            n.includes('tuoi'))
        ) {
          return (
            !n.includes('socola') &&
            !n.includes('chocolate') &&
            !n.includes('tiramisu') &&
            !n.includes('sua') &&
            !n.includes('banh') &&
            !n.includes('luong kho') &&
            !n.includes('phindi') &&
            !n.includes('highlands') &&
            !n.includes('starbucks') &&
            !n.includes('ca phe') &&
            !n.includes('tra ') &&
            !n.includes('keo') &&
            !n.includes('xoi') &&
            !n.includes('che') &&
            !n.includes('kem') &&
            isSafe(f)
          );
        }
        return false;
      })
      .map((f) => ({ ...f, fixedGrams: 25 }));

    // Thiết lập rổ thực phẩm hiệu lực (Effective Pools with Fallback)
    const effectiveMProtPool =
      mProtPool.length > 0 ? mProtPool : safeProteinFallback;
    const effectiveBProtPool =
      bProtPool.length > 0 ? bProtPool : effectiveMProtPool;
    const effectiveLCarbPool =
      lCarbPool.length > 0 ? lCarbPool : safeCarbFallback;
    const effectiveDCarbPool =
      dCarbPool.length > 0 ? dCarbPool : effectiveLCarbPool;
    const effectiveBCarbPool =
      bCarbPool.length > 0 ? bCarbPool : effectiveLCarbPool;
    const effectiveVegPool = vegPool.length > 0 ? vegPool : safeVegFallback;
    const effectiveFruitPool =
      sFruitPool.length > 0 ? sFruitPool : safeFruitFallback;

    const usedFoodIds = new Set<string>();

    const pickFood = (
      pool: PoolFoodItem[],
      excludedIds: Set<string> = new Set(),
      preferredKeyword: string | null = null,
      fallbackPool: PoolFoodItem[] = [],
    ): PoolFoodItem => {
      let candidates = pool.filter((p) => !excludedIds.has(p.id));
      if (
        preferredKeyword &&
        candidates.some((c) => removeTones(c.name).includes(preferredKeyword))
      ) {
        candidates = candidates.filter((c) =>
          removeTones(c.name).includes(preferredKeyword),
        );
      }
      if (candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)];
      }
      if (pool.length > 0) {
        return pool[Math.floor(Math.random() * pool.length)];
      }
      if (fallbackPool && fallbackPool.length > 0) {
        const fallbackCandidates = fallbackPool.filter(
          (p) => !excludedIds.has(p.id),
        );
        return (
          fallbackCandidates[
            Math.floor(Math.random() * fallbackCandidates.length)
          ] || fallbackPool[0]
        );
      }
      return {
        id: 'safe-fallback-item',
        name: 'Thực phẩm dinh dưỡng tiêu chuẩn',
        caloriesPer100g: 120,
        proteinPer100g: 10,
        carbsPer100g: 15,
        fatPer100g: 2,
        category: 'FITNESS_STAPLE',
      };
    };

    const createPlanItem = (
      food: PoolFoodItem,
      weightGrams: number,
    ): GeneratedMealPlanItem => {
      const w = Math.round(weightGrams);
      const cal = Math.round((food.caloriesPer100g * w) / 100);
      const p = Math.round(((food.proteinPer100g * w) / 100) * 10) / 10;
      const c = Math.round(((food.carbsPer100g * w) / 100) * 10) / 10;
      const f = Math.round(((food.fatPer100g * w) / 100) * 10) / 10;

      return {
        foodId: food.id,
        foodName: food.name,
        weightInGrams: w,
        calories: cal,
        protein: p,
        carbs: c,
        fat: f,
        category: food.category || 'FITNESS_STAPLE',
        imageUrl: food.imageUrl,
      };
    };

    const calWeights: Record<MealKey, number> = {
      breakfast: 0.85,
      morningSnack: 0.35,
      lunch: 1.35,
      afternoonSnack: 0.35,
      dinner: 1.15,
      snack: 0.35,
    };

    const protWeights: Record<MealKey, number> = {
      breakfast: 0.75,
      morningSnack: 0.25,
      lunch: 1.4,
      afternoonSnack: 0.25,
      dinner: 1.25,
      snack: 0.2,
    };

    const carbWeights: Record<MealKey, number> = {
      breakfast: 0.85,
      morningSnack: 0.35,
      lunch: 1.35,
      afternoonSnack: 0.35,
      dinner: 1.15,
      snack: 0.35,
    };

    const fatWeights: Record<MealKey, number> = {
      breakfast: 0.85,
      morningSnack: 0.25,
      lunch: 1.35,
      afternoonSnack: 0.45,
      dinner: 1.25,
      snack: 0.35,
    };

    const totalCalW = activeMeals.reduce(
      (acc, m) => acc + (calWeights[m] || 1),
      0,
    );
    const totalProtW = activeMeals.reduce(
      (acc, m) => acc + (protWeights[m] || 1),
      0,
    );
    const totalCarbW = activeMeals.reduce(
      (acc, m) => acc + (carbWeights[m] || 1),
      0,
    );
    const totalFatW = activeMeals.reduce(
      (acc, m) => acc + (fatWeights[m] || 1),
      0,
    );

    const mealCalTarget = (m: MealKey) =>
      (targetCalories * (calWeights[m] || 1)) / totalCalW;
    const mealProtTarget = (m: MealKey) =>
      (targetProtein * (protWeights[m] || 1)) / totalProtW;
    const mealCarbTarget = (m: MealKey) =>
      (targetCarbs * (carbWeights[m] || 1)) / totalCarbW;
    // Cố định định mức chất béo ở mức an toàn 70% - 80% (khoảng 75%) của targetFat để tuyệt đối không bị vượt ngưỡng Fat
    const effectiveTargetFat = targetFat * 0.75;
    const mealFatTarget = (m: MealKey) =>
      (effectiveTargetFat * (fatWeights[m] || 1)) / totalFatW;

    // Tính toán lượng dầu ăn tốt (dầu oliu/lạc) linh hoạt, tối đa 10g (1 muỗng canh) để giữ Fat luôn đạt 70% - 80% mục tiêu
    const calcHealthyOilGrams = (
      targetMealFat: number,
      baseFatEstimate: number,
    ): number => {
      const needed = targetMealFat - baseFatEstimate;
      if (needed <= 4) return 5;
      return 10;
    };

    // ========================================================
    // THUẬT TOÁN ĐA MỤC TIÊU CÂN BẰNG (MULTI-OBJECTIVE BALANCED SOLVER)
    // Cân bằng đồng thời Calo + Đạm (Protein) + Tinh bột (Carbs)
    // Tự động kiểm soát lượng Carb và Protein không bị vượt quá định mức (tránh protein/carb overshoot khi tăng cân)
    // ========================================================
    const solveDiscreteMeal = (
      targetCal: number,
      targetProt: number,
      targetCarb: number,
      protFood: PoolFoodItem,
      carbFood: PoolFoodItem,
      extraItems: GeneratedMealPlanItem[] = [],
    ): GeneratedMealPlanItem[] => {
      let bestP = protFood.minGrams || 100;
      let bestC = carbFood.minGrams || 100;
      let minError = Infinity;

      const extraCal = extraItems.reduce((acc, it) => acc + it.calories, 0);
      const extraProt = extraItems.reduce((acc, it) => acc + it.protein, 0);
      const extraCarb = extraItems.reduce((acc, it) => acc + it.carbs, 0);

      const minP = protFood.minGrams || 100;
      const maxP = isFewMeals
        ? Math.max(protFood.maxGrams || 250, 300)
        : protFood.maxGrams || 250;
      const minC = carbFood.minGrams || 50;
      const maxC =
        isFewMeals || isGainingWeight
          ? Math.max(carbFood.maxGrams || 300, 450)
          : carbFood.maxGrams || 300;

      // Bước nhảy 25g giúp cân bằng macro chính xác, tránh protein bị nhảy vọt
      for (let pG = minP; pG <= maxP; pG += 25) {
        for (let cG = minC; cG <= maxC; cG += 25) {
          const pCal = (protFood.caloriesPer100g * pG) / 100;
          const cCal = (carbFood.caloriesPer100g * cG) / 100;
          const totalCal = extraCal + pCal + cCal;

          const pProt = (protFood.proteinPer100g * pG) / 100;
          const cProt = (carbFood.proteinPer100g * cG) / 100;
          const totalProt = extraProt + pProt + cProt;

          const pCarb = (protFood.carbsPer100g * pG) / 100;
          const cCarb = (carbFood.carbsPer100g * cG) / 100;
          const totalCarb = extraCarb + pCarb + cCarb;

          const calErr = Math.abs(totalCal - targetCal);
          const protErr = Math.abs(totalProt - targetProt) * 6;
          const carbErr = Math.abs(totalCarb - targetCarb) * 2;

          // Phạt nếu Protein vượt quá định mức bữa > 1.5g (ngăn chặn protein overshoot khi tăng cân, đồng thời bám sát target)
          const protOverPenalty =
            totalProt > targetProt + 1.5
              ? (totalProt - (targetProt + 1.5)) * 12
              : 0;

          // Phạt nếu Carb vượt quá định mức bữa > 5g
          const carbOverPenalty =
            totalCarb > targetCarb + 5 ? (totalCarb - targetCarb) * 6 : 0;

          const combinedScore =
            calErr * 1.0 +
            protErr +
            carbErr +
            protOverPenalty +
            carbOverPenalty;

          if (combinedScore < minError) {
            minError = combinedScore;
            bestP = pG;
            bestC = cG;
          }
        }
      }

      return [
        createPlanItem(protFood, bestP),
        createPlanItem(carbFood, bestC),
        ...extraItems,
      ];
    };

    // 4.1 BỮA SÁNG (Protein nhẹ Trứng / Sữa chua Hy Lạp / Thịt nạc từ CSDL)
    let breakfastItems: GeneratedMealPlanItem[] = [];
    if (activeMeals.includes('breakfast')) {
      const bProtFood = pickFood(
        effectiveBProtPool,
        usedFoodIds,
        'trung ga ta luoc',
        effectiveMProtPool,
      );
      usedFoodIds.add(bProtFood.id);
      const bCarbFood = pickFood(
        effectiveBCarbPool,
        usedFoodIds,
        'banh mi den',
        effectiveLCarbPool,
      );
      usedFoodIds.add(bCarbFood.id);
      const bFruitFood = pickFood(
        effectiveFruitPool,
        usedFoodIds,
        'chuoi tieu',
      );
      usedFoodIds.add(bFruitFood.id);
      const bFruitItem = createPlanItem(bFruitFood, 100);

      breakfastItems = solveDiscreteMeal(
        mealCalTarget('breakfast'),
        mealProtTarget('breakfast'),
        mealCarbTarget('breakfast'),
        bProtFood,
        bCarbFood,
        [bFruitItem],
      );
    }

    // 4.2 BỮA TRƯA (Cơm trắng/gạo lứt, Thịt nạc, Rau luộc, Dầu ăn từ CSDL)
    let lunchItems: GeneratedMealPlanItem[] = [];
    if (activeMeals.includes('lunch')) {
      const lProtFood = pickFood(effectiveMProtPool, usedFoodIds, 'uc ga');
      usedFoodIds.add(lProtFood.id);
      const lCarbFood = pickFood(effectiveLCarbPool, usedFoodIds, 'com trang');
      usedFoodIds.add(lCarbFood.id);
      const lVegFood = pickFood(effectiveVegPool, usedFoodIds, 'sup lo');
      usedFoodIds.add(lVegFood.id);

      const lVegItem = createPlanItem(lVegFood, 150);
      const lOilGrams = calcHealthyOilGrams(mealFatTarget('lunch'), 5);
      const lOilItem = createPlanItem(dbHealthyOil, lOilGrams);

      lunchItems = solveDiscreteMeal(
        mealCalTarget('lunch'),
        mealProtTarget('lunch'),
        mealCarbTarget('lunch'),
        lProtFood,
        lCarbFood,
        [lVegItem, lOilItem],
      );
    }

    // 4.3 BỮA TỐI (Thịt luân phiên khác trưa, Cơm gạo lứt/Khoai lang <= 200g từ CSDL)
    let dinnerItems: GeneratedMealPlanItem[] = [];
    if (activeMeals.includes('dinner')) {
      const isLunchChicken = lunchItems.some((it) =>
        removeTones(it.foodName).includes('ga'),
      );
      const dProtCandidates = effectiveMProtPool.filter(
        (p) =>
          !usedFoodIds.has(p.id) &&
          (isLunchChicken ? !removeTones(p.name).includes('ga') : true),
      );
      const dProtFood =
        dProtCandidates[0] || pickFood(effectiveMProtPool, usedFoodIds, 'bo');
      usedFoodIds.add(dProtFood.id);

      const dCarbFood = pickFood(effectiveDCarbPool, usedFoodIds, 'gao lut');
      usedFoodIds.add(dCarbFood.id);
      const dVegFood = pickFood(effectiveVegPool, usedFoodIds, 'cai');
      usedFoodIds.add(dVegFood.id);

      const dVegItem = createPlanItem(dVegFood, 150);
      const dOilGrams = calcHealthyOilGrams(mealFatTarget('dinner'), 8);
      const dOilItem = createPlanItem(dbDinnerOil, dOilGrams);

      dinnerItems = solveDiscreteMeal(
        mealCalTarget('dinner'),
        mealProtTarget('dinner'),
        mealCarbTarget('dinner'),
        dProtFood,
        dCarbFood,
        [dVegItem, dOilItem],
      );
    }

    // 4.4 BỮA PHỤ SÁNG (Dành cho chế độ 5 bữa)
    let morningSnackItems: GeneratedMealPlanItem[] = [];
    if (activeMeals.includes('morningSnack')) {
      const msFruitFood = pickFood(effectiveFruitPool, usedFoodIds, 'chuoi');
      usedFoodIds.add(msFruitFood.id);

      if (sDairyPool.length > 0) {
        const msDairyFood = pickFood(sDairyPool, usedFoodIds, 'hy lap');
        usedFoodIds.add(msDairyFood.id);
        morningSnackItems = [
          createPlanItem(msFruitFood, 100),
          createPlanItem(msDairyFood, 100),
        ];
      } else if (sNutPool.length > 0) {
        const msNutFood = pickFood(sNutPool, usedFoodIds);
        usedFoodIds.add(msNutFood.id);
        morningSnackItems = [
          createPlanItem(msFruitFood, 100),
          createPlanItem(msNutFood, 25),
        ];
      } else {
        const msExtraCarb = pickFood(
          effectiveBCarbPool,
          usedFoodIds,
          'khoai lang',
        );
        usedFoodIds.add(msExtraCarb.id);
        morningSnackItems = [
          createPlanItem(msFruitFood, 100),
          createPlanItem(msExtraCarb, 100),
        ];
      }
    }

    // 4.5 BỮA PHỤ CHIỀU (Dành cho chế độ 5 bữa)
    let afternoonSnackItems: GeneratedMealPlanItem[] = [];
    if (activeMeals.includes('afternoonSnack')) {
      const asFruitFood = pickFood(effectiveFruitPool, usedFoodIds, 'tao');
      usedFoodIds.add(asFruitFood.id);

      if (sNutPool.length > 0) {
        const asNutFood = pickFood(sNutPool, usedFoodIds, 'hanh nhan');
        usedFoodIds.add(asNutFood.id);
        afternoonSnackItems = [
          createPlanItem(asFruitFood, 100),
          createPlanItem(asNutFood, 25),
        ];
      } else if (sDairyPool.length > 0) {
        const asDairyFood = pickFood(sDairyPool, usedFoodIds);
        usedFoodIds.add(asDairyFood.id);
        afternoonSnackItems = [
          createPlanItem(asFruitFood, 100),
          createPlanItem(asDairyFood, 100),
        ];
      } else {
        const asExtraCarb = pickFood(effectiveBCarbPool, usedFoodIds, 'bap');
        usedFoodIds.add(asExtraCarb.id);
        afternoonSnackItems = [
          createPlanItem(asFruitFood, 100),
          createPlanItem(asExtraCarb, 100),
        ];
      }
    }

    // 4.6 BỮA PHỤ (Dành cho chế độ 4 bữa)
    let snackItems: GeneratedMealPlanItem[] = [];
    if (activeMeals.includes('snack')) {
      const sFruitFood = pickFood(effectiveFruitPool, usedFoodIds, 'tao');
      usedFoodIds.add(sFruitFood.id);

      if (sDairyPool.length > 0) {
        const sDairyFood = pickFood(sDairyPool, usedFoodIds, 'khong duong');
        usedFoodIds.add(sDairyFood.id);
        snackItems = [
          createPlanItem(sFruitFood, 100),
          createPlanItem(sDairyFood, 100),
        ];
      } else if (sNutPool.length > 0) {
        const sNutFood = pickFood(sNutPool, usedFoodIds);
        usedFoodIds.add(sNutFood.id);
        snackItems = [
          createPlanItem(sFruitFood, 100),
          createPlanItem(sNutFood, 25),
        ];
      } else {
        const sExtraCarb = pickFood(
          effectiveBCarbPool,
          usedFoodIds,
          'khoai lang',
        );
        usedFoodIds.add(sExtraCarb.id);
        snackItems = [
          createPlanItem(sFruitFood, 100),
          createPlanItem(sExtraCarb, 100),
        ];
      }

      if (
        (targetCalories >= 2000 || mealCalTarget('snack') > 250) &&
        sDairyPool.length > 0 &&
        sNutPool.length > 0
      ) {
        const sNutFood = pickFood(sNutPool, usedFoodIds);
        usedFoodIds.add(sNutFood.id);
        snackItems.push(createPlanItem(sNutFood, 25));
      }
    }

    // Định dạng chuỗi hiển thị chuẩn: "(+) 150g Ức gà (165 kcal, 31g P, 0g C, 3.6g F)"
    const formatItemsToText = (items: GeneratedMealPlanItem[]): string => {
      return items
        .map(
          (it) =>
            `(+) ${it.weightInGrams}g ${it.foodName} (${it.calories} kcal, ${it.protein}g P, ${it.carbs}g C, ${it.fat}g F)`,
        )
        .join('\n');
    };

    const buildSession = (
      mealKey: MealKey,
      mealName: string,
      items: GeneratedMealPlanItem[],
    ): GeneratedMealSession => {
      const totalCalories = items.reduce((acc, it) => acc + it.calories, 0);
      const totalProtein =
        Math.round(items.reduce((acc, it) => acc + it.protein, 0) * 10) / 10;
      const totalCarbs =
        Math.round(items.reduce((acc, it) => acc + it.carbs, 0) * 10) / 10;
      const totalFat =
        Math.round(items.reduce((acc, it) => acc + it.fat, 0) * 10) / 10;

      return {
        mealKey,
        mealName,
        formattedText: formatItemsToText(items),
        items,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
      };
    };

    const meals: GeneratedMealSession[] = [];
    if (activeMeals.includes('breakfast') && breakfastItems.length > 0) {
      meals.push(buildSession('breakfast', 'Bữa Sáng', breakfastItems));
    }
    if (activeMeals.includes('morningSnack') && morningSnackItems.length > 0) {
      meals.push(buildSession('morningSnack', 'Phụ Sáng', morningSnackItems));
    }
    if (activeMeals.includes('lunch') && lunchItems.length > 0) {
      meals.push(buildSession('lunch', 'Bữa Trưa', lunchItems));
    }
    if (
      activeMeals.includes('afternoonSnack') &&
      afternoonSnackItems.length > 0
    ) {
      meals.push(
        buildSession('afternoonSnack', 'Phụ Chiều', afternoonSnackItems),
      );
    }
    if (activeMeals.includes('dinner') && dinnerItems.length > 0) {
      meals.push(buildSession('dinner', 'Bữa Tối', dinnerItems));
    }
    if (activeMeals.includes('snack') && snackItems.length > 0) {
      meals.push(buildSession('snack', 'Bữa Phụ', snackItems));
    }

    const calculatedCalories = meals.reduce(
      (acc, m) => acc + m.totalCalories,
      0,
    );
    const calculatedProtein =
      Math.round(meals.reduce((acc, m) => acc + m.totalProtein, 0) * 10) / 10;
    const calculatedCarbs =
      Math.round(meals.reduce((acc, m) => acc + m.totalCarbs, 0) * 10) / 10;
    const calculatedFat =
      Math.round(meals.reduce((acc, m) => acc + m.totalFat, 0) * 10) / 10;

    const skinAdvice = isLosingWeight
      ? ' Đã tự động lọc sạch các loại thịt có da (da gà, da heo...) để cắt giảm chất béo bão hòa, hỗ trợ thâm hụt calo giảm mỡ tối ưu.'
      : isGainingWeight
        ? ' Chế độ tăng cân/tăng cơ: Cho phép đạm tự nhiên có da hợp lý để hỗ trợ thặng dư calo.'
        : '';

    const mealCountDesc =
      activeMeals.length === 2
        ? 'Phân bổ năng lượng tối ưu cho chế độ 2 bữa/ngày (Intermittent Fasting 16/8).'
        : activeMeals.length === 3
          ? 'Phân bổ cân bằng theo chế độ 3 bữa chính truyền thống (Sáng, Trưa, Tối).'
          : activeMeals.length === 5
            ? 'Phân bổ đều theo chế độ 5 bữa chuẩn Fitness (3 bữa chính + 2 bữa phụ nhẹ sáng & chiều) giúp tối ưu hấp thụ và duy trì năng lượng liên tục.'
            : 'Phân bổ đều theo chế độ 4 bữa (3 bữa chính + 1 bữa phụ dinh dưỡng).';

    const findSessionText = (key: MealKey) =>
      meals.find((m) => m.mealKey === key)?.formattedText || '';

    const formattedPlan = {
      breakfast: findSessionText('breakfast'),
      morningSnack: findSessionText('morningSnack'),
      lunch: findSessionText('lunch'),
      afternoonSnack: findSessionText('afternoonSnack'),
      dinner: findSessionText('dinner'),
      snack:
        findSessionText('snack') ||
        findSessionText('afternoonSnack') ||
        findSessionText('morningSnack'),
      note: isLosingWeight
        ? 'Mục tiêu Giảm Cân / Giảm Mỡ: Ưu tiên thịt nạc bỏ da, chế biến luộc/hấp/áp chảo ít dầu. Uống đủ 2 - 2.5L nước/ngày. Ăn rau xanh trước tinh bột để ổn định đường huyết.'
        : 'Uống đủ 2 - 2.5L nước/ngày. Ưu tiên chế biến luộc, hấp hoặc áp chảo ít dầu. Ăn rau xanh trước tinh bột để ổn định đường huyết.',
    };

    const coachAdvice = `Thực đơn Eat Clean chuẩn theo mục tiêu ${targetCalories} kcal (P: ${targetProtein}g, C: ${targetCarbs}g, F: ${targetFat}g) chia làm ${activeMeals.length} bữa. ${mealCountDesc}${skinAdvice} Đã tự động loại bỏ các món ngọt, đồ sống và thực phẩm dị ứng.`;

    // 5. Lưu vào CSDL nếu có yêu cầu (saveToDatabase)
    if (dto.saveToDatabase) {
      const mealPlanJsonString = JSON.stringify(formattedPlan);
      await this.prisma.nutritionTarget.create({
        data: {
          studentId: targetUserId,
          targetCalo: targetCalories,
          targetProtein,
          targetCarbs,
          targetFat,
          prescribedMealPlan: mealPlanJsonString,
        },
      });
    }

    return {
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      calculatedCalories,
      calculatedProtein,
      calculatedCarbs,
      calculatedFat,
      allergiesFiltered: bannedArr,
      dietaryPreferencesApplied: preferences,
      meals,
      formattedPlan,
      coachAdvice,
    };
  }
}
