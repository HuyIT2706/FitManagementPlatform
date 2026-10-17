import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { FoodItem, FoodPaginatedResponse } from '@repo/types';
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
      { includeKeywords: string[]; excludeKeywords: string[]; startsWithKeywords: string[] }
    > = {
      VEG: {
        includeKeywords: [
          'rau', 'cải', 'muống', 'xà lách', 'súp lơ', 'cà rốt', 'bí đỏ', 'bí đao', 'bí xanh',
          'cà chua', 'bắp cải', 'cải thìa', 'cải ngọt', 'mồng tơi', 'rau ngót', 'su hào',
          'su su', 'đậu bắp', 'dưa chuột', 'dưa leo', 'măng', 'nấm', 'cần tây', 'bông cải',
          'ớt chuông', 'củ dền', 'củ cải', 'mướp', 'bầu', 'hoa chuối', 'giá đỗ', 'ngó sen',
        ],
        excludeKeywords: ['bánh', 'kẹo', 'chè', 'snack', 'nem rán', 'chả giò', 'bún', 'phở', 'miến'],
        startsWithKeywords: ['rau', 'cải', 'củ', 'xà lách', 'súp lơ', 'bông cải', 'cà chua', 'dưa chuột', 'bí'],
      },
      MEAT: {
        includeKeywords: [
          'thịt', 'cá', 'gà', 'bò', 'heo', 'lợn', 'tôm', 'cua', 'mực', 'lươn', 'vịt', 'ngan',
          'cừu', 'ức gà', 'cá hồi', 'cá thu', 'cá basa', 'cá lóc', 'cá rô', 'cá ngừ', 'bê',
          'chả lụa', 'giò lụa', 'hải sản',
        ],
        excludeKeywords: ['bánh bao', 'bánh mì', 'bánh canh', 'bánh quy', 'kẹo', 'snack'],
        startsWithKeywords: ['thịt', 'ức gà', 'cá', 'gà', 'bò', 'tôm', 'mực', 'lươn', 'chả lụa'],
      },
      EGG: {
        includeKeywords: [
          'trứng', 'sữa', 'phô mai', 'pho mát', 'cheese', 'sữa chua', 'yogurt', 'whey', 'váng sữa',
        ],
        excludeKeywords: ['bánh', 'kẹo', 'chè', 'trà sữa'],
        startsWithKeywords: ['trứng', 'sữa', 'sữa chua', 'phô mai', 'whey'],
      },
      RICE: {
        includeKeywords: [
          'cơm', 'gạo', 'yến mạch', 'khoai lang', 'khoai tây', 'bánh mì', 'bún', 'phở', 'miến',
          'ngô', 'bắp', 'nui', 'mì ý', 'spaghetti', 'bánh canh',
        ],
        excludeKeywords: ['bánh ngọt', 'kẹo', 'snack', 'bánh quy'],
        startsWithKeywords: ['cơm', 'gạo', 'yến mạch', 'khoai', 'bún', 'phở'],
      },
      FRUIT: {
        includeKeywords: [
          'chuối', 'táo', 'cam', 'quýt', 'xoài', 'dưa hấu', 'ổi', 'nho', 'dứa', 'thơm', 'khóm',
          'bơ', 'lê', 'thanh long', 'đu đủ', 'dâu', 'bưởi', 'đào', 'mận', 'kiwi', 'chôm chôm',
          'sầu riêng', 'vải', 'nhãn', 'măng cụt', 'lựu', 'mãng cầu', 'chanh leo', 'quả', 'trái',
        ],
        excludeKeywords: ['bánh', 'kẹo', 'nước ngọt', 'mứt', 'chè'],
        startsWithKeywords: ['chuối', 'táo', 'cam', 'xoài', 'dưa hấu', 'ổi', 'nho', 'bơ', 'thanh long'],
      },
    };

    const activeCatRule = SMART_CATEGORY_FILTERS[catKey] || null;

    if (!trimmed && !activeCatRule) {
      const [data, total] = await Promise.all([
        this.prisma.foodLibrary.findMany({
          skip,
          take: limitNum,
          orderBy: { name: 'asc' },
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
    normalized = normalized.replace(/(?:không|khong|k|ko)\s+da(?=\s|$)/gi, 'bỏ da');
    normalized = normalized.replace(
      /(?:không|khong|k|ko)\s+đường(?=\s|$)/gi,
      'không đường',
    );

    const words = normalized.split(/\s+/).filter(Boolean);

    try {
      const allConditions: Prisma.Sql[] = [];

      if (words.length > 0) {
        const queryConds = words.map(
          (w) => Prisma.sql`unaccent(name) ILIKE unaccent(${'%' + w + '%'})`,
        );
        allConditions.push(Prisma.sql`(${Prisma.join(queryConds, ' AND ')})`);
      }

      if (activeCatRule) {
        const incConds = activeCatRule.includeKeywords.map(
          (k) => Prisma.sql`unaccent(name) ILIKE unaccent(${'%' + k + '%'})`,
        );
        const excConds = activeCatRule.excludeKeywords.map(
          (k) => Prisma.sql`unaccent(name) NOT ILIKE unaccent(${'%' + k + '%'})`,
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
            WHEN unaccent(name) ILIKE unaccent(${normalized + '%'}) THEN 0
            WHEN unaccent(name) ILIKE unaccent(${'%' + normalized + '%'}) THEN 1
            ELSE 2
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
      summary.totalCalories = Math.round(summary.totalCalories * 10) / 10;
      summary.totalProtein = Math.round(summary.totalProtein * 10) / 10;
      summary.totalCarbs = Math.round(summary.totalCarbs * 10) / 10;
      summary.totalFat = Math.round(summary.totalFat * 10) / 10;
    });

    const target = user?.nutritionTargets?.[0];
    const targetCalo = target?.targetCalo || 2000;
    const targetProtein = target?.targetProtein || 150;
    const targetCarbs = target?.targetCarbs || 200;
    const targetFat = target?.targetFat || 65;

    const consumedCaloRound = Math.round(totalCalories * 10) / 10;
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
    const remainingCalories = Math.max(0, targetCalo - consumedCaloRound);

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
    const mealLogs = await this.prisma.mealLog.findMany({
      where: {
        userId,
        totalCalories: { gt: 0 },
      },
      select: {
        logDate: true,
      },
      orderBy: {
        logDate: 'desc',
      },
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
}
