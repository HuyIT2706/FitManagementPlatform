/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OnboardingDto } from './dto/onboarding.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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

    return {
      ...user,
      assignedPt,
      activePackage,
    };
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

    return {
      bmr: Math.round(bmr),
      tdee,
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
          onboardingCompleted: true,
        },
      });
    });
  }
}
