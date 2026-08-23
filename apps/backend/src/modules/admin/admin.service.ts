import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // 1. PT APPLICATIONS
  // ==========================================
  async getPtApplications(status?: string) {
    const whereCondition =
      status && status !== 'ALL'
        ? { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' }
        : {};

    const applications = await this.prisma.ptApplication.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            role: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return applications.map((app) => ({
      id: app.id,
      userId: app.userId,
      fullName: app.user.fullName,
      email: app.user.email,
      phone: app.user.phone || undefined,
      avatarUrl: app.user.avatarUrl || undefined,
      experienceYears: app.experienceYears,
      specialties: app.specialties,
      certificateUrl: app.certificateUrl || undefined,
      bio: app.bio || undefined,
      status: app.status,
      adminNote: app.adminNote || undefined,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    }));
  }

  async approvePtApplication(id: string, adminNote?: string) {
    const app = await this.prisma.ptApplication.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!app) {
      throw new NotFoundException('Không tìm thấy đơn đăng ký PT');
    }

    const updatedApp = await this.prisma.ptApplication.update({
      where: { id },
      data: {
        status: 'APPROVED',
        adminNote: adminNote || 'Đã phê duyệt hồ sơ HLV PT thành công',
      },
    });

    await this.prisma.user.update({
      where: { id: app.userId },
      data: {
        role: 'PT',
      },
    });

    return {
      success: true,
      applicationId: id,
      userId: app.userId,
      message: `Đã phê duyệt đơn và nâng cấp quyền PT cho tài khoản ${app.user.fullName} thành công!`,
      application: updatedApp,
    };
  }

  async rejectPtApplication(id: string, adminNote?: string) {
    const app = await this.prisma.ptApplication.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!app) {
      throw new NotFoundException('Không tìm thấy đơn đăng ký PT');
    }

    const updatedApp = await this.prisma.ptApplication.update({
      where: { id },
      data: {
        status: 'REJECTED',
        adminNote:
          adminNote || 'Hồ sơ chưa đạt đủ điều kiện chứng chỉ chuyên môn',
      },
    });

    return {
      success: true,
      applicationId: id,
      message: `Đã từ chối đơn đăng ký PT của ứng viên ${app.user.fullName}`,
      application: updatedApp,
    };
  }

  async getAdminStats() {
    const [
      totalUsers,
      totalPts,
      totalAdmins,
      pendingApps,
      approvedApps,
      rejectedApps,
      totalExercises,
      totalFoods,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'PT' } }),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.ptApplication.count({ where: { status: 'PENDING' } }),
      this.prisma.ptApplication.count({ where: { status: 'APPROVED' } }),
      this.prisma.ptApplication.count({ where: { status: 'REJECTED' } }),
      this.prisma.exerciseLibrary.count(),
      this.prisma.foodLibrary.count(),
    ]);

    return {
      totalUsers,
      totalPts,
      totalAdmins,
      pendingApps,
      approvedApps,
      rejectedApps,
      totalExercises,
      totalFoods,
    };
  }

  // ==========================================
  // 2. USER MANAGEMENT & ROLE ASSIGNMENT
  // ==========================================
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }) {
    const page = Math.max(1, Number(params?.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(params?.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (params?.role && params.role !== 'ALL') {
      where.role = params.role;
    }

    if (params?.search && params.search.trim()) {
      const search = params.search.trim();
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatarUrl: true,
          role: true,
          goal: true,
          gender: true,
          createdAt: true,
          userPackages: {
            where: { isActive: true },
            select: {
              id: true,
              totalSessions: true,
              remainingSessions: true,
              gymPackage: {
                select: { title: true },
              },
            },
          },
          studentProfiles: {
            select: {
              trainer: {
                select: { fullName: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone || undefined,
        avatarUrl: u.avatarUrl || undefined,
        role: u.role,
        goal: u.goal || undefined,
        gender: u.gender || undefined,
        createdAt: u.createdAt.toISOString(),
        coachName: u.studentProfiles?.[0]?.trainer?.fullName || undefined,
        activePackage: u.userPackages?.[0]
          ? {
              title: u.userPackages[0].gymPackage.title,
              remainingSessions: u.userPackages[0].remainingSessions,
              totalSessions: u.userPackages[0].totalSessions,
            }
          : undefined,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUserRole(id: string, newRole: Role) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { role: newRole },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
    });

    return {
      success: true,
      message: `Đã thay đổi phân quyền của ${updatedUser.fullName} thành [${newRole}] thành công!`,
      user: updatedUser,
    };
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    await this.prisma.user.delete({ where: { id } });

    return {
      success: true,
      message: `Đã xóa tài khoản ${user.fullName} (${user.email}) khỏi hệ thống!`,
    };
  }

  // ==========================================
  // 3. EXERCISE LIBRARY MANAGEMENT (CRUD)
  // ==========================================
  async getExercises(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }) {
    const page = Math.max(1, Number(params?.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(params?.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (params?.category && params.category !== 'ALL') {
      where.category = params.category;
    }

    if (params?.search && params.search.trim()) {
      const search = params.search.trim();
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { equipment: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [exercises, total] = await Promise.all([
      this.prisma.exerciseLibrary.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.exerciseLibrary.count({ where }),
    ]);

    return {
      data: exercises,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createExercise(data: {
    id?: string;
    name: string;
    category?: string;
    equipment?: string;
    primaryMuscles?: string[];
    secondaryMuscles?: string[];
    instructions?: string[];
    setupImageUrl?: string;
    startImageUrl?: string;
  }) {
    if (!data.name || !data.name.trim()) {
      throw new BadRequestException('Tên bài tập không được để trống');
    }

    const id =
      data.id?.trim() ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + `-${Date.now()}`;

    const newExercise = await this.prisma.exerciseLibrary.create({
      data: {
        id,
        name: data.name.trim(),
        category: data.category || 'FULL_BODY',
        equipment: data.equipment || 'Bodyweight',
        primaryMuscles: data.primaryMuscles || [],
        secondaryMuscles: data.secondaryMuscles || [],
        instructions: data.instructions || [],
        setupImageUrl: data.setupImageUrl || undefined,
        startImageUrl: data.startImageUrl || undefined,
      },
    });

    return {
      success: true,
      message: `Đã thêm bài tập "${newExercise.name}" vào thư viện thành công!`,
      exercise: newExercise,
    };
  }

  async updateExercise(
    id: string,
    data: {
      name?: string;
      category?: string;
      equipment?: string;
      primaryMuscles?: string[];
      secondaryMuscles?: string[];
      instructions?: string[];
      setupImageUrl?: string;
      startImageUrl?: string;
    },
  ) {
    const existing = await this.prisma.exerciseLibrary.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy bài tập để cập nhật');
    }

    const updated = await this.prisma.exerciseLibrary.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.category ? { category: data.category } : {}),
        ...(data.equipment ? { equipment: data.equipment } : {}),
        ...(data.primaryMuscles ? { primaryMuscles: data.primaryMuscles } : {}),
        ...(data.secondaryMuscles
          ? { secondaryMuscles: data.secondaryMuscles }
          : {}),
        ...(data.instructions ? { instructions: data.instructions } : {}),
        setupImageUrl: data.setupImageUrl ?? existing.setupImageUrl,
        startImageUrl: data.startImageUrl ?? existing.startImageUrl,
      },
    });

    return {
      success: true,
      message: `Đã cập nhật bài tập "${updated.name}" thành công!`,
      exercise: updated,
    };
  }

  async deleteExercise(id: string) {
    const existing = await this.prisma.exerciseLibrary.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy bài tập để xóa');
    }

    await this.prisma.exerciseLibrary.delete({ where: { id } });

    return {
      success: true,
      message: `Đã xóa bài tập "${existing.name}" khỏi thư viện!`,
    };
  }

  // ==========================================
  // 4. FOOD LIBRARY MANAGEMENT (CRUD)
  // ==========================================
  async getFoods(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }) {
    const page = Math.max(1, Number(params?.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(params?.limit) || 10));
    const skip = (page - 1) * limit;
    const category = params?.category;
    const search = params?.search?.trim();

    let whereClause = 'WHERE 1=1';
    const queryParams: (string | number)[] = [];
    let paramIdx = 1;

    if (category && category !== 'ALL') {
      whereClause += ` AND category = $${paramIdx++}`;
      queryParams.push(category);
    }

    if (search) {
      whereClause += ` AND unaccent(name) ILIKE unaccent($${paramIdx++})`;
      queryParams.push(`%${search}%`);
    }

    const countParams = [...queryParams];

    const dataSql = `
      SELECT 
        id, 
        name, 
        "caloriesPer100g", 
        "proteinPer100g", 
        "carbsPer100g", 
        "fatPer100g", 
        "fiberPer100g", 
        category, 
        "imageUrl", 
        "createdAt"
      FROM food_libraries
      ${whereClause}
      ORDER BY name ASC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}
    `;
    queryParams.push(limit, skip);

    const countSql = `
      SELECT count(*)::int as total
      FROM food_libraries
      ${whereClause}
    `;

    const [foods, countRes] = await Promise.all([
      this.prisma.$queryRawUnsafe<any[]>(dataSql, ...queryParams),
      this.prisma.$queryRawUnsafe<{ total: number }[]>(
        countSql,
        ...countParams,
      ),
    ]);

    const total = Number(countRes[0]?.total || 0);

    return {
      data: foods,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
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

    const newFood = await this.prisma.foodLibrary.create({
      data: {
        name: data.name.trim(),
        caloriesPer100g: Number(data.caloriesPer100g) || 0,
        proteinPer100g: Number(data.proteinPer100g) || 0,
        carbsPer100g: Number(data.carbsPer100g) || 0,
        fatPer100g: Number(data.fatPer100g) || 0,
        fiberPer100g: data.fiberPer100g ? Number(data.fiberPer100g) : undefined,
        category: data.category || 'Món ăn Việt',
        imageUrl: data.imageUrl || undefined,
      },
    });

    return {
      success: true,
      message: `Đã thêm món "${newFood.name}" vào thư viện thực phẩm thành công!`,
      food: newFood,
    };
  }

  async updateFood(
    id: string,
    data: {
      name?: string;
      caloriesPer100g?: number;
      proteinPer100g?: number;
      carbsPer100g?: number;
      fatPer100g?: number;
      fiberPer100g?: number;
      category?: string;
      imageUrl?: string;
    },
  ) {
    const existing = await this.prisma.foodLibrary.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy món ăn để cập nhật');
    }

    const updated = await this.prisma.foodLibrary.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.caloriesPer100g !== undefined
          ? { caloriesPer100g: Number(data.caloriesPer100g) }
          : {}),
        ...(data.proteinPer100g !== undefined
          ? { proteinPer100g: Number(data.proteinPer100g) }
          : {}),
        ...(data.carbsPer100g !== undefined
          ? { carbsPer100g: Number(data.carbsPer100g) }
          : {}),
        ...(data.fatPer100g !== undefined
          ? { fatPer100g: Number(data.fatPer100g) }
          : {}),
        ...(data.fiberPer100g !== undefined
          ? { fiberPer100g: Number(data.fiberPer100g) }
          : {}),
        ...(data.category ? { category: data.category } : {}),
        imageUrl: data.imageUrl ?? existing.imageUrl,
      },
    });

    return {
      success: true,
      message: `Đã cập nhật thông tin món "${updated.name}" thành công!`,
      food: updated,
    };
  }

  async deleteFood(id: string) {
    const existing = await this.prisma.foodLibrary.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy món ăn để xóa');
    }

    await this.prisma.foodLibrary.delete({ where: { id } });

    return {
      success: true,
      message: `Đã xóa món "${existing.name}" khỏi thư viện thực phẩm!`,
    };
  }

  // ==========================================
  // 5. ANALYTICS & SYSTEM ACTIVITY REPORT
  // ==========================================
  async getAnalyticsOverview() {
    const [
      totalUsers,
      totalPts,
      totalAdmins,
      totalExercises,
      totalFoods,
      totalMealLogs,
      totalWorkouts,
      recentUsers,
      recentApplications,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'USER' } }),
      this.prisma.user.count({ where: { role: 'PT' } }),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.exerciseLibrary.count(),
      this.prisma.foodLibrary.count(),
      this.prisma.mealLog.count(),
      this.prisma.workoutSchedule.count(),
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
        },
      }),
      this.prisma.ptApplication.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      }),
    ]);

    // Calculate goal distribution among users
    const usersWithGoals = await this.prisma.user.groupBy({
      by: ['goal'],
      _count: { id: true },
      where: { goal: { not: null } },
    });

    const goalDistribution = usersWithGoals.map((g) => ({
      goal: g.goal || 'Khác',
      count: g._count.id,
    }));

    return {
      overview: {
        totalUsers,
        totalPts,
        totalAdmins,
        totalAccounts: totalUsers + totalPts + totalAdmins,
        totalExercises,
        totalFoods,
        totalMealLogs,
        totalWorkouts,
      },
      goalDistribution,
      recentUsers: recentUsers.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      })),
      recentApplications: recentApplications.map((a) => ({
        id: a.id,
        fullName: a.user.fullName,
        email: a.user.email,
        status: a.status,
        createdAt: a.createdAt.toISOString(),
      })),
    };
  }
}
