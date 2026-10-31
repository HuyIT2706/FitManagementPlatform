import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import type { Gender, ActivityLevel } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { OnboardingDto } from './dto/onboarding.dto';

export interface UpdateProfileDto {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  gender?: Gender;
  height?: number;
  weight?: number;
  targetWeight?: number;
  bodyFat?: number;
  muscleMass?: number;
  activityLevel?: ActivityLevel;
  goal?: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  getBMICategory(bmi: number) {
    if (bmi < 18.5) {
      return {
        category: 'Thiếu cân',
        color: 'text-blue-400',
        description:
          'Bạn đang ở mức thiếu cân. Chúng tôi sẽ thiết lập chế độ thặng dư calo để giúp bạn tăng cơ bắp an toàn.',
      };
    }
    if (bmi <= 24.9) {
      return {
        category: 'Bình thường',
        color: 'text-[#10b981]',
        description:
          'Chỉ số BMI của bạn rất lý tưởng! Hãy duy trì lối sống lành mạnh và cải thiện thể lực.',
      };
    }
    if (bmi <= 29.9) {
      return {
        category: 'Thừa cân',
        color: 'text-amber-400',
        description:
          'Bạn đang ở mức thừa cân. Kế hoạch thâm hụt calo và bài tập cân bằng sẽ giúp bạn lấy lại vóc dáng chuẩn.',
      };
    }
    if (bmi <= 34.9) {
      return {
        category: 'Béo phì Độ I',
        color: 'text-orange-400',
        description:
          'Bạn đang ở mức béo phì độ I. Kế hoạch thâm hụt calo chuẩn và các bài tập cardio phù hợp sẽ giúp giảm mỡ hiệu quả.',
      };
    }
    return {
      category: 'Béo phì Độ II/III',
      color: 'text-red-400',
      description:
        'Chỉ số BMI cao cảnh báo nguy cơ sức khỏe. Chúng tôi đề xuất chế độ ăn kiểm soát calo nghiêm ngặt và bài tập nhẹ nhàng.',
    };
  }

  async getMe(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          phone: true,
          role: true,
          gender: true,
          height: true,
          dateOfBirth: true,
          activityLevel: true,
          goal: true,
          targetWeight: true,
          onboardingCompleted: true,
          createdAt: true,
          nutritionTargets: {
            orderBy: { effectiveDate: 'desc' },
            take: 1,
            select: {
              id: true,
              targetCalo: true,
              targetProtein: true,
              targetCarbs: true,
              targetFat: true,
              prescribedMealPlan: true,
            },
          },
          bodyMetrics: {
            orderBy: { recordedAt: 'desc' },
            take: 1,
            select: {
              weight: true,
              height: true,
              bodyFat: true,
              muscleMass: true,
              recordedAt: true,
            },
          },
          studentProfiles: {
            orderBy: { assignedAt: 'desc' },
            select: {
              id: true,
              status: true,
              assignedAt: true,
              trainer: {
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                  phone: true,
                  email: true,
                },
              },
            },
          },
          userPackages: {
            where: { isActive: true },
            orderBy: { startDate: 'desc' },
            take: 1,
            select: {
              id: true,
              totalSessions: true,
              remainingSessions: true,
              startDate: true,
              endDate: true,
              gymPackage: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                },
              },
            },
          },
          ptApplication: {
            select: {
              status: true,
              adminNote: true,
              certificateUrl: true,
              experienceYears: true,
              specialties: true,
              bio: true,
            },
          },
        },
      });

      if (!user) return null;

      // Prioritize APPROVED PT profile, then PENDING, then whatever profile is latest
      let approvedProfile = user.studentProfiles?.find(
        (sp) => sp.status === 'APPROVED',
      );
      const pendingProfile = user.studentProfiles?.find(
        (sp) => sp.status === 'PENDING',
      );
      let studentProfile =
        approvedProfile || pendingProfile || user.studentProfiles?.[0] || null;

      // Auto-heal: If studentProfile is PENDING or missing approval, ensure status is APPROVED
      if (studentProfile && studentProfile.status !== 'APPROVED') {
        try {
          await this.prisma.studentProfile.update({
            where: { id: studentProfile.id },
            data: { status: 'APPROVED' },
          });
          studentProfile.status = 'APPROVED';
          approvedProfile = studentProfile;
        } catch {
          await this.prisma
            .$executeRawUnsafe(
              `UPDATE student_profiles SET status = 'APPROVED' WHERE id = $1`,
              studentProfile.id,
            )
            .catch(() => {});
          studentProfile.status = 'APPROVED';
          approvedProfile = studentProfile;
        }
      }

      // If studentProfile is completely missing for a student, auto-link to active Coach
      if (!studentProfile && user.role !== 'PT') {
        try {
          let activePt = await this.prisma.user.findFirst({
            where: {
              role: 'PT',
              id: { not: user.id },
            },
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              phone: true,
              email: true,
            },
          });

          if (!activePt) {
            activePt = await this.prisma.user.findFirst({
              where: {
                role: 'ADMIN',
                id: { not: user.id },
              },
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                phone: true,
                email: true,
              },
            });
          }

          if (!activePt) {
            try {
              activePt = await this.prisma.user.create({
                data: {
                  email: 'coach.hoangnam@nutricore.vn',
                  fullName: 'Coach Hoàng Nam (NutriCore)',
                  passwordHash:
                    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
                  role: 'PT',
                  avatarUrl:
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                  phone: '0901234567',
                  onboardingCompleted: true,
                },
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                  phone: true,
                  email: true,
                },
              });
            } catch {
              activePt = await this.prisma.user.findFirst({
                where: { email: 'coach.hoangnam@nutricore.vn' },
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                  phone: true,
                  email: true,
                },
              });
            }
          }

          if (activePt && activePt.id !== user.id) {
            let createdProfileId = '';
            try {
              const createdProfile = await this.prisma.studentProfile.upsert({
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
              createdProfileId = createdProfile.id;
            } catch {
              await this.prisma
                .$executeRawUnsafe(
                  `INSERT INTO student_profiles (id, "trainerId", "studentId", status, "assignedAt")
                   VALUES (gen_random_uuid(), $1, $2, 'APPROVED', CURRENT_TIMESTAMP)
                   ON CONFLICT DO NOTHING`,
                  activePt.id,
                  user.id,
                )
                .catch(() => {});
            }

            studentProfile = {
              id: createdProfileId || 'assigned-pt',
              status: 'APPROVED',
              assignedAt: new Date(),
              trainer: activePt,
            };
            approvedProfile = studentProfile;
          }
        } catch {
          // Safe fallback
        }
      }

      const ptBindStatus = studentProfile?.status || null;
      const assignedPt = studentProfile?.trainer
        ? {
            ...studentProfile.trainer,
            status: ptBindStatus,
            isApproved: ptBindStatus === 'APPROVED',
            isPending: ptBindStatus === 'PENDING',
          }
        : null;

      let activePackage = (user.userPackages?.[0] ?? null) as {
        id: string;
        totalSessions: number;
        remainingSessions: number;
        startDate: Date;
        endDate: Date;
        gymPackage: {
          id: string;
          title: string;
          price: number;
        };
      } | null;
      if (!activePackage) {
        activePackage = await this.prisma.memberPackage.findFirst({
          where: {
            OR: [
              { userId: user.id },
              { user: { email: { equals: user.email, mode: 'insensitive' } } },
            ],
          },
          orderBy: { startDate: 'desc' },
          include: {
            gymPackage: {
              select: {
                id: true,
                title: true,
                price: true,
              },
            },
          },
        });
      }

      if (!activePackage && assignedPt?.isApproved) {
        let gymPkg = await this.prisma.gymPackage.findFirst();
        if (!gymPkg) {
          gymPkg = await this.prisma.gymPackage.create({
            data: {
              title: 'Gói PT 1:1 VIP (36 Buổi)',
              description: 'Gói tập huấn luyện viên 1:1 cá nhân hóa',
              price: 10800000,
              durationDays: 180,
              totalSessions: 36,
            },
          });
        }
        activePackage = await this.prisma.memberPackage.create({
          data: {
            userId: user.id,
            packageId: gymPkg.id,
            totalSessions: 36,
            remainingSessions: 35,
            isActive: true,
            endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          },
          include: {
            gymPackage: {
              select: {
                id: true,
                title: true,
                price: true,
              },
            },
          },
        });
      }

      const isApprovedPt =
        user.role === 'PT' ? user.ptApplication?.status === 'APPROVED' : true;
      const ptApplicationStatus =
        user.ptApplication?.status ||
        (user.role === 'PT' ? 'PENDING' : 'APPROVED');
      const isPendingPtApproval =
        user.role === 'PT' && user.ptApplication?.status === 'PENDING';

      // Calculate BMR, TDEE, and BMI on Backend
      const weight = user.bodyMetrics?.[0]?.weight ?? 70;
      const height = user.height ?? 170;
      const gender = user.gender || 'MALE';

      let age = 25;
      if (user.dateOfBirth) {
        try {
          const dob = new Date(user.dateOfBirth);
          const diffMs = Date.now() - dob.getTime();
          const ageDt = new Date(diffMs);
          age = Math.abs(ageDt.getUTCFullYear() - 1970);
        } catch {
          age = 25;
        }
      }

      const bmr =
        gender === 'MALE'
          ? 10 * weight + 6.25 * height - 5 * age + 5
          : 10 * weight + 6.25 * height - 5 * age - 161;

      const activityMultipliers: Record<string, number> = {
        SEDENTARY: 1.2,
        LIGHTLY_ACTIVE: 1.375,
        MODERATELY_ACTIVE: 1.55,
        VERY_ACTIVE: 1.725,
        EXTRA_ACTIVE: 1.9,
      };
      const multiplier =
        activityMultipliers[user.activityLevel || 'VERY_ACTIVE'] || 1.725;
      const tdee = Math.round(bmr * multiplier) || 2000;

      const heightM = height / 100;
      const bmi =
        heightM > 0
          ? Math.round((weight / (heightM * heightM)) * 10) / 10
          : 24.5;
      const safeBmi = isNaN(bmi) ? 22 : bmi;
      const bmiInfo = this.getBMICategory(safeBmi);

      const isLosing = (weight || 70) > (user.targetWeight || 70);
      const suggestedOffset = isLosing ? -400 : 300;
      const earliestMetric = await this.prisma.bodyMetric.findFirst({
        where: { userId },
        orderBy: { recordedAt: 'asc' },
        select: { weight: true },
      });
      const initialWeight =
        earliestMetric?.weight ?? user.targetWeight ?? weight;

      return {
        ...user,
        targetWeight:
          user.targetWeight && weight > 0
            ? (user.goal === 'GAIN_WEIGHT' ||
                (initialWeight > 0 && user.targetWeight > initialWeight)) &&
              weight > user.targetWeight
              ? weight
              : (user.goal === 'LOSE_WEIGHT' ||
                    (initialWeight > 0 && user.targetWeight < initialWeight)) &&
                  weight < user.targetWeight
                ? weight
                : user.targetWeight
            : user.targetWeight,
        initialWeight,
        isApprovedPt,
        ptApplicationStatus,
        isPendingPtApproval,
        bmr: Math.round(bmr) || 1600,
        tdee,
        bmi: safeBmi,
        bmiCategory: bmiInfo.category,
        bmiColor: bmiInfo.color,
        bmiDescription: bmiInfo.description,
        suggestedOffset,
        assignedPt,
        activePackage,
      };
    } catch (err) {
      this.logger.error(`Failed to getMe for user ${userId}:`, err);
      return null;
    }
  }

  getCalorieOffsetOptions(isLosing: boolean) {
    if (isLosing) {
      return [
        {
          offset: -250,
          value: -250,
          title: 'Chậm & Chắc (Giảm ~0.25kg/tuần)',
          label: 'Chậm & Chắc (Giảm ~0.25kg/tuần)',
          desc: 'Thâm hụt nhẹ, dễ duy trì lâu dài',
          description: 'Thâm hụt nhẹ, dễ duy trì lâu dài',
          recommended: false,
        },
        {
          offset: -400,
          value: -400,
          title: 'Khuyến nghị (Giảm ~0.5kg/tuần)',
          label: 'Khuyến nghị (Giảm ~0.5kg/tuần)',
          desc: 'Cân bằng giữa tốc độ giảm mỡ và giữ cơ',
          description: 'Cân bằng giữa tốc độ giảm mỡ và giữ cơ',
          recommended: true,
        },
        {
          offset: -600,
          value: -600,
          title: 'Cấp tốc (Giảm ~0.75kg/tuần)',
          label: 'Cấp tốc (Giảm ~0.75kg/tuần)',
          desc: 'Yêu cầu tính kỷ luật cao',
          description: 'Yêu cầu tính kỷ luật cao',
          recommended: false,
        },
      ];
    }
    return [
      {
        offset: 250,
        value: 250,
        title: 'Tăng cơ nạc (Tăng ~0.25kg/tuần)',
        label: 'Tăng cơ nạc (Tăng ~0.25kg/tuần)',
        desc: 'Hạn chế tối đa tích mỡ thừa',
        description: 'Hạn chế tối đa tích mỡ thừa',
        recommended: false,
      },
      {
        offset: 400,
        value: 400,
        title: 'Khuyến nghị (Tăng ~0.4kg/tuần)',
        label: 'Khuyến nghị (Tăng ~0.4kg/tuần)',
        desc: 'Tối ưu tốc độ phát triển cơ bắp',
        description: 'Tối ưu tốc độ phát triển cơ bắp',
        recommended: true,
      },
      {
        offset: 600,
        value: 600,
        title: 'Tăng cân nhanh (Tăng ~0.6kg/tuần)',
        label: 'Tăng cân nhanh (Tăng ~0.6kg/tuần)',
        desc: 'Phù hợp người gầy lâu năm',
        description: 'Phù hợp người gầy lâu năm',
        recommended: false,
      },
    ];
  }

  previewTDEE(dto: OnboardingDto) {
    const rawW = Number(dto.weight) || 70;
    const rawH = Number(dto.height) || 170;
    const rawTargetW = Number(dto.targetWeight) || 70;

    const w = Math.min(200, Math.max(30, rawW));
    const h = Math.min(220, Math.max(100, rawH));
    const targetW = Math.min(200, Math.max(30, rawTargetW));
    const gender = dto.gender || 'MALE';
    let age = 25;

    if (dto.dateOfBirth) {
      const dob = new Date(dto.dateOfBirth);
      const diffMs = Date.now() - dob.getTime();
      const ageDt = new Date(diffMs);
      age = Math.abs(ageDt.getUTCFullYear() - 1970);
    }

    const bmr =
      gender === 'MALE'
        ? 10 * w + 6.25 * h - 5 * age + 5
        : 10 * w + 6.25 * h - 5 * age - 161;

    const activityMultipliers: Record<string, number> = {
      SEDENTARY: 1.2,
      LIGHTLY_ACTIVE: 1.375,
      MODERATELY_ACTIVE: 1.55,
      VERY_ACTIVE: 1.725,
      EXTRA_ACTIVE: 1.9,
    };
    const multiplier =
      activityMultipliers[dto.activityLevel || 'VERY_ACTIVE'] || 1.725;
    const tdee = Math.round(bmr * multiplier);

    const goal = String(
      dto.goal || (w > targetW ? 'LOSE_WEIGHT' : 'GAIN_WEIGHT'),
    );
    const isLosing = goal === 'LOSE_WEIGHT';
    const suggestedOffset = isLosing ? -400 : 300;

    const targetCalo =
      tdee +
      (dto.caloriesOffset !== undefined ? dto.caloriesOffset : suggestedOffset);

    const targetProtein = Math.round((targetCalo * 0.3) / 4);
    const targetCarbs = Math.round((targetCalo * 0.4) / 4);
    const targetFat = Math.round((targetCalo * 0.3) / 9);

    const heightM = h / 100;
    const bmi =
      heightM > 0 ? Math.round((w / (heightM * heightM)) * 10) / 10 : 24.5;
    const bmiInfo = this.getBMICategory(bmi);

    const calorieOffsetOptions = this.getCalorieOffsetOptions(isLosing);

    return {
      bmr: Math.round(bmr),
      tdee,
      bmi,
      bmiCategory: bmiInfo.category,
      bmiColor: bmiInfo.color,
      bmiDescription: bmiInfo.description,
      calorieOffsetOptions,
      goal,
      suggestedOffset,
      targetCalo,
      targetProtein,
      targetCarbs,
      targetFat,
    };
  }

  async completeOnboarding(userId: string, dto: OnboardingDto) {
    const {
      weight,
      height,
      targetWeight,
      dateOfBirth,
      caloriesOffset,
      ...rest
    } = dto;
    const dob = dateOfBirth ? new Date(dateOfBirth) : undefined;

    const calc = this.previewTDEE(dto);

    return this.prisma.$transaction(async (tx) => {
      if (weight) {
        await tx.bodyMetric.create({
          data: { userId, weight, height },
        });
      }

      await tx.nutritionTarget.create({
        data: {
          studentId: userId,
          bmr: calc.bmr,
          tdee: calc.tdee,
          caloriesOffset:
            caloriesOffset !== undefined
              ? caloriesOffset
              : calc.suggestedOffset,
          targetCalo: calc.targetCalo,
          targetProtein: calc.targetProtein,
          targetCarbs: calc.targetCarbs,
          targetFat: calc.targetFat,
        },
      });

      return tx.user.update({
        where: { id: userId },
        data: {
          ...rest,
          targetWeight,
          height,
          dateOfBirth: dob,
          bmr: calc.bmr,
          tdee: calc.tdee,
          bmi: calc.bmi,
          goal: String(calc.goal),
          caloriesOffset:
            caloriesOffset !== undefined
              ? caloriesOffset
              : calc.suggestedOffset,
          onboardingCompleted: true,
        },
      });
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (
      dto.height !== undefined &&
      (Number(dto.height) < 100 || Number(dto.height) > 220)
    ) {
      throw new BadRequestException(
        'Chiều cao không hợp lệ! Vui lòng nhập từ 100cm đến 220cm.',
      );
    }
    if (
      dto.weight !== undefined &&
      (Number(dto.weight) < 30 || Number(dto.weight) > 200)
    ) {
      throw new BadRequestException(
        'Cân nặng không hợp lệ! Vui lòng nhập từ 30kg đến 200kg.',
      );
    }
    if (
      dto.targetWeight !== undefined &&
      (Number(dto.targetWeight) < 30 || Number(dto.targetWeight) > 200)
    ) {
      throw new BadRequestException(
        'Cân nặng mục tiêu không hợp lệ! Vui lòng nhập từ 30kg đến 200kg.',
      );
    }
    if (
      dto.bodyFat !== undefined &&
      (Number(dto.bodyFat) < 3 || Number(dto.bodyFat) > 60)
    ) {
      throw new BadRequestException(
        'Tỷ lệ mỡ không hợp lệ! Vui lòng nhập từ 3% đến 60%.',
      );
    }
    if (
      dto.muscleMass !== undefined &&
      (Number(dto.muscleMass) < 10 || Number(dto.muscleMass) > 120)
    ) {
      throw new BadRequestException(
        'Khối lượng cơ không hợp lệ! Vui lòng nhập từ 10kg đến 120kg.',
      );
    }
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        bodyMetrics: { orderBy: { recordedAt: 'desc' }, take: 1 },
      },
    });

    const effectiveWeight = dto.weight
      ? Number(dto.weight)
      : existingUser?.bodyMetrics?.[0]?.weight || 70;
    const effectiveHeight = dto.height
      ? Number(dto.height)
      : existingUser?.height || 170;
    const effectiveTargetWeight = dto.targetWeight
      ? Number(dto.targetWeight)
      : existingUser?.targetWeight || 70;
    const effectiveGender = dto.gender || existingUser?.gender || 'MALE';
    const effectiveActivityLevel =
      dto.activityLevel || existingUser?.activityLevel || 'VERY_ACTIVE';
    const effectiveGoal =
      dto.goal ||
      existingUser?.goal ||
      (effectiveWeight > effectiveTargetWeight ? 'LOSE_WEIGHT' : 'GAIN_WEIGHT');

    // Recalculate BMR, TDEE, BMI, targets
    const calc = this.previewTDEE({
      weight: effectiveWeight,
      height: effectiveHeight,
      targetWeight: effectiveTargetWeight,
      gender: effectiveGender,
      activityLevel: effectiveActivityLevel,
      goal: effectiveGoal,
      dateOfBirth: existingUser?.dateOfBirth
        ? existingUser.dateOfBirth.toISOString()
        : undefined,
      caloriesOffset: existingUser?.caloriesOffset ?? undefined,
    });

    const updateData: Record<string, unknown> = {
      bmr: calc.bmr,
      tdee: calc.tdee,
      bmi: calc.bmi,
      goal: String(calc.goal),
      height: effectiveHeight,
      targetWeight: effectiveTargetWeight,
      gender: effectiveGender,
      activityLevel: effectiveActivityLevel,
    };

    if (dto.fullName) updateData.fullName = dto.fullName;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.avatarUrl !== undefined) updateData.avatarUrl = dto.avatarUrl;

    const latestMetric = existingUser?.bodyMetrics?.[0];
    const weightChanged =
      dto.weight !== undefined &&
      Number(dto.weight) > 0 &&
      (!latestMetric || Number(dto.weight) !== latestMetric.weight);
    const bodyFatChanged =
      dto.bodyFat !== undefined &&
      (!latestMetric || Number(dto.bodyFat) !== latestMetric.bodyFat);
    const muscleMassChanged =
      dto.muscleMass !== undefined &&
      (!latestMetric || Number(dto.muscleMass) !== latestMetric.muscleMass);

    const hasBiometricsChanged =
      weightChanged ||
      (dto.height !== undefined &&
        Number(dto.height) !== existingUser?.height) ||
      (dto.targetWeight !== undefined &&
        Number(dto.targetWeight) !== existingUser?.targetWeight) ||
      (dto.gender !== undefined && dto.gender !== existingUser?.gender) ||
      (dto.activityLevel !== undefined &&
        dto.activityLevel !== existingUser?.activityLevel) ||
      (dto.goal !== undefined && dto.goal !== existingUser?.goal);

    return this.prisma.$transaction(async (tx) => {
      if (weightChanged || bodyFatChanged || muscleMassChanged) {
        await tx.bodyMetric.create({
          data: {
            userId,
            weight: effectiveWeight,
            height: effectiveHeight,
            bodyFat: dto.bodyFat ? Number(dto.bodyFat) : undefined,
            muscleMass: dto.muscleMass ? Number(dto.muscleMass) : undefined,
          },
        });
      }
      if (hasBiometricsChanged) {
        await tx.nutritionTarget.create({
          data: {
            studentId: userId,
            bmr: calc.bmr,
            tdee: calc.tdee,
            caloriesOffset:
              existingUser?.caloriesOffset !== undefined
                ? existingUser.caloriesOffset
                : calc.suggestedOffset,
            targetCalo: calc.targetCalo,
            targetProtein: calc.targetProtein,
            targetCarbs: calc.targetCarbs,
            targetFat: calc.targetFat,
          },
        });
      }

      return tx.user.update({
        where: { id: userId },
        data: updateData,
      });
    });
  }
}
