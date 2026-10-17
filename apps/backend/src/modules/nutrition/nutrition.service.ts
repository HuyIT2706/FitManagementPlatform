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

  parseSmartFoodText(rawText: string): Array<{ query: string; weight: number }> {
    if (!rawText || typeof rawText !== 'string') return [];

    let text = rawText.trim().toLowerCase();

    // 1. Normalize voice-to-text artifacts:
    text = text.replace(/(\d+)[.,]000(?!\d)/g, '$1g');
    text = text.replace(/(\d+)\s*k\b/gi, '$1g');
    text = text.replace(/(\d+)\s*(?:gam|gram|gr)\b/gi, '$1g');

    text = text.replace(/(\d+(?:[.,]\d+)?)\s*(?:kg|kí|ký)\b/gi, (_, p1) => {
      const val = parseFloat(p1.replace(',', '.'));
      return `${Math.round(val * 1000)}g`;
    });

    text = text.replace(/(\d+)\s*(?:lạng|lang)\b/gi, (_, p1) => `${Number(p1) * 100}g `);
    text = text.replace(/(?:^|\s+)nửa lạng(?=\s+|$)/gi, ' 50g ');

    text = text.replace(/(\d+)\s*(?:bát|chén)\b/gi, (_, p1) => `${Number(p1) * 150}g `);
    text = text.replace(/(?:^|\s+)nửa (?:bát|chén)(?=\s+|$)/gi, ' 75g ');

    text = text.replace(/(\d+)\s*(?:quả|hột|trái)\b/gi, (_, p1) => `${Number(p1) * 50}g `);
    text = text.replace(/(\d+)\s*đĩa\b/gi, (_, p1) => `${Number(p1) * 200}g `);
    text = text.replace(/(\d+)\s*tô\b/gi, (_, p1) => `${Number(p1) * 350}g `);
    text = text.replace(/(\d+)\s*(?:ly|cốc|hộp)\b/gi, (_, p1) => `${Number(p1) * 200}g `);

    // Normalize connectives & punctuation to delimiter '|'
    text = text.replace(/[,;+&\n]/g, ' | ');
    text = text.replace(/(?:^|\s+)(?:và|kèm|với|cùng)(?=\s+|$)/gi, ' | ');

    // Split by explicit delimiters first
    const subPhrases = text.split('|').map((s) => s.trim()).filter(Boolean);

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
      const foodList = searchRes.data || [];

      const calculatedFoods: SmartParsedFoodItem[] = foodList.map((f: FoodItem) => {
        const cal = Math.round((f.caloriesPer100g * item.weight) / 100);
        const pro = Math.round(((f.proteinPer100g * item.weight) / 100) * 10) / 10;
        const carbs = Math.round(((f.carbsPer100g * item.weight) / 100) * 10) / 10;
        const fat = Math.round(((f.fatPer100g * item.weight) / 100) * 10) / 10;
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
      });

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
}
