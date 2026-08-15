import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OnboardingDto } from './dto/onboarding.dto';

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

    // Mifflin-St Jeor BMR Formula
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    if (gender === 'FEMALE') {
      bmr -= 161;
    } else {
      bmr += 5;
    }

    let activityMultiplier = 1.2;
    switch (user.activityLevel) {
      case 'LIGHTLY_ACTIVE':
        activityMultiplier = 1.375;
        break;
      case 'MODERATELY_ACTIVE':
        activityMultiplier = 1.55;
        break;
      case 'VERY_ACTIVE':
        activityMultiplier = 1.725;
        break;
      case 'EXTRA_ACTIVE':
        activityMultiplier = 1.9;
        break;
    }

    const calculatedTdee = Math.round(bmr * activityMultiplier);
    const heightM = height / 100;
    const calculatedBmi =
      heightM > 0 ? Math.round((weight / (heightM * heightM)) * 10) / 10 : 24.5;
    const userRecord = user as unknown as {
      bmr?: number | null;
      tdee?: number | null;
      bmi?: number | null;
      goal?: string | null;
      caloriesOffset?: number | null;
    };

    const calculatedGoal =
      user.targetWeight !== null && user.targetWeight !== undefined
        ? user.targetWeight < weight
          ? 'LOSE_WEIGHT'
          : user.targetWeight > weight
            ? 'GAIN_WEIGHT'
            : 'MAINTAIN'
        : 'MAINTAIN';

    const calculatedOffset =
      userRecord.caloriesOffset && userRecord.caloriesOffset !== 0
        ? userRecord.caloriesOffset
        : calculatedGoal === 'LOSE_WEIGHT'
          ? -400
          : calculatedGoal === 'GAIN_WEIGHT'
            ? 400
            : 0;

    const finalBmr = userRecord.bmr ?? Math.round(bmr);
    const finalTdee = userRecord.tdee ?? calculatedTdee;
    const finalBmi = userRecord.bmi ?? calculatedBmi;
    const finalGoal = userRecord.goal ?? calculatedGoal;
    const finalOffset = calculatedOffset;

    // Auto-update Postgres DB if null
    if (
      userRecord.bmr === null ||
      userRecord.tdee === null ||
      userRecord.bmi === null ||
      userRecord.goal === null
    ) {
      this.prisma.user
        .update({
          where: { id: userId },
          data: {
            bmr: finalBmr,
            tdee: finalTdee,
            bmi: finalBmi,
            goal: finalGoal,
            caloriesOffset: finalOffset,
          },
        })
        .catch((err: unknown) => {
          console.error('Error backfilling user metrics DB:', err);
        });
    }

    const bmiInfo = this.getBMICategory(finalBmi);

    return {
      ...user,
      bmr: finalBmr,
      tdee: finalTdee,
      bmi: finalBmi,
      bmiCategory: bmiInfo.category,
      bmiColor: bmiInfo.color,
      bmiDescription: bmiInfo.description,
      goal: finalGoal,
      caloriesOffset: finalOffset,
      suggestedOffset: finalOffset,
      assignedPt,
      activePackage,
    };
  }

  getCalorieOffsetOptions(isLosing: boolean) {
    if (isLosing) {
      return [
        {
          offset: -400,
          title: 'Thâm hụt Chuẩn (-400 kcal/ngày)',
          recommended: true,
          desc: 'Tốc độ giảm cân bền vững & an toàn (~0.4kg/tuần). Dễ duy trì lâu dài.',
        },
        {
          offset: -250,
          title: 'Thâm hụt Nhẹ (-250 kcal/ngày)',
          recommended: false,
          desc: 'Giảm chậm rãi, phù hợp với người mới bắt đầu không muốn nhịn ăn.',
        },
        {
          offset: -550,
          title: 'Thâm hụt Mạnh (-550 kcal/ngày)',
          recommended: false,
          desc: 'Tốc độ giảm cân nhanh hơn (~0.5 - 0.6kg/tuần), cần kỷ luật cao.',
        },
      ];
    }
    return [
      {
        offset: 400,
        title: 'Thặng dư Chuẩn (+400 kcal/ngày)',
        recommended: true,
        desc: 'Tăng cơ bắp tối ưu, hạn chế tích tụ mỡ thừa.',
      },
      {
        offset: 250,
        title: 'Thặng dư Nhẹ (+250 kcal/ngày)',
        recommended: false,
        desc: 'Tăng cân chậm, săn chắc, giữ cơ thể nhẹ nhàng.',
      },
      {
        offset: 500,
        title: 'Thặng dư Mạnh (+500 kcal/ngày)',
        recommended: false,
        desc: 'Tăng cân & thể tích cơ nhanh hơn, dành cho người gầy lâu năm.',
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
      const diff_ms = Date.now() - dob.getTime();
      const age_dt = new Date(diff_ms);
      age = Math.abs(age_dt.getUTCFullYear() - 1970);
    }

    let bmr = 10 * w + 6.25 * h - 5 * age;
    if (gender === 'FEMALE') {
      bmr -= 161;
    } else {
      bmr += 5;
    }

    let activityMultiplier = 1.2;
    switch (dto.activityLevel) {
      case 'LIGHTLY_ACTIVE':
        activityMultiplier = 1.375;
        break;
      case 'MODERATELY_ACTIVE':
        activityMultiplier = 1.55;
        break;
      case 'VERY_ACTIVE':
        activityMultiplier = 1.725;
        break;
      case 'EXTRA_ACTIVE':
        activityMultiplier = 1.9;
        break;
    }

    const tdee = Math.round(bmr * activityMultiplier);

    let goal = 'MAINTAIN';
    let suggestedOffset = 0;

    if (dto.targetWeight !== undefined && dto.weight !== undefined) {
      if (dto.targetWeight < dto.weight) {
        goal = 'LOSE_WEIGHT';
        suggestedOffset = -400;
      } else if (dto.targetWeight > dto.weight) {
        goal = 'GAIN_WEIGHT';
        suggestedOffset = 400;
      }
    }

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

    const isLosing = (dto.weight || 70) > (dto.targetWeight || 70);
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
          goal: calc.goal,
          caloriesOffset:
            caloriesOffset !== undefined
              ? caloriesOffset
              : calc.suggestedOffset,
          onboardingCompleted: true,
        },
      });
    });
  }
}
