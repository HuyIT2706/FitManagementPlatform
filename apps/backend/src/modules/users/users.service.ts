import { Injectable } from '@nestjs/common';
import type { Gender, ActivityLevel } from '@repo/db';
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        nutritionTargets: {
          orderBy: { effectiveDate: 'desc' },
          take: 1,
        },
        bodyMetrics: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
        studentProfiles: {
          include: {
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
          include: { gymPackage: true },
          take: 1,
        },
      },
    });

    if (!user) return null;

    const assignedPt = user.studentProfiles?.[0]?.trainer || null;
    const activePackage = user.userPackages?.[0] || null;

    // Calculate BMR, TDEE, and BMI on Backend
    const weight = user.bodyMetrics?.[0]?.weight ?? 70;
    const height = user.height ?? 170;
    const gender = user.gender || 'MALE';

    let age = 25;
    if (user.dateOfBirth) {
      const dob = new Date(user.dateOfBirth);
      const diffMs = Date.now() - dob.getTime();
      const ageDt = new Date(diffMs);
      age = Math.abs(ageDt.getUTCFullYear() - 1970);
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
    const tdee = Math.round(bmr * multiplier);

    const heightM = height / 100;
    const bmi =
      heightM > 0 ? Math.round((weight / (heightM * heightM)) * 10) / 10 : 24.5;
    const bmiInfo = this.getBMICategory(bmi);

    const isLosing = (weight || 70) > (user.targetWeight || 70);
    const suggestedOffset = isLosing ? -400 : 300;

    return {
      ...user,
      bmr: Math.round(bmr),
      tdee,
      bmi,
      bmiCategory: bmiInfo.category,
      bmiColor: bmiInfo.color,
      bmiDescription: bmiInfo.description,
      suggestedOffset,
      assignedPt,
      activePackage,
    };
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
    const w = dto.weight || 70;
    const h = dto.height || 170;
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
      dto.goal ||
        (w > (dto.targetWeight || 70) ? 'LOSE_WEIGHT' : 'GAIN_WEIGHT'),
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
    const updateData: Record<string, unknown> = {};

    if (dto.fullName) updateData.fullName = dto.fullName;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.avatarUrl !== undefined) updateData.avatarUrl = dto.avatarUrl;
    if (dto.gender) updateData.gender = dto.gender;
    if (dto.height) updateData.height = Number(dto.height);
    if (dto.targetWeight) updateData.targetWeight = Number(dto.targetWeight);
    if (dto.activityLevel) updateData.activityLevel = dto.activityLevel;
    if (dto.goal) updateData.goal = dto.goal;

    return this.prisma.$transaction(async (tx) => {
      if (dto.weight || dto.bodyFat || dto.muscleMass) {
        const user = await tx.user.findUnique({ where: { id: userId } });
        await tx.bodyMetric.create({
          data: {
            userId,
            weight: dto.weight ? Number(dto.weight) : user?.targetWeight || 70,
            height: dto.height ? Number(dto.height) : user?.height || undefined,
            bodyFat: dto.bodyFat ? Number(dto.bodyFat) : undefined,
            muscleMass: dto.muscleMass ? Number(dto.muscleMass) : undefined,
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
