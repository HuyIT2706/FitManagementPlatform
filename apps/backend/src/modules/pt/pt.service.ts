import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { PTDashboardData, PTSessionItem } from '@repo/types';

@Injectable()
export class PtService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardData(ptUserId: string): Promise<PTDashboardData> {
    const ptUser = await this.prisma.user.findUnique({
      where: { id: ptUserId },
      include: {
        trainerProfiles: {
          include: {
            student: true,
          },
        },
      },
    });

    const coachName = ptUser ? `Coach ${ptUser.fullName}` : 'Coach Bùi Văn Huy';
    const coachAvatar = ptUser?.avatarUrl || undefined;

    const todaySessions: PTSessionItem[] = [
      {
        id: 'session-1',
        timeSlot: '08:00 - 09:00',
        studentId: 'std-1',
        studentName: 'Bùi Văn Huy',
        studentAvatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        workoutName: 'Legs & Glutes Power',
        status: 'PENDING',
        remainingSessions: 8,
        totalSessions: 12,
      },
      {
        id: 'session-2',
        timeSlot: '10:00 - 11:00',
        studentId: 'std-2',
        studentName: 'Nguyễn Văn A',
        studentAvatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        workoutName: 'Chest & Triceps',
        status: 'PENDING',
        remainingSessions: 5,
        totalSessions: 10,
      },
      {
        id: 'session-3',
        timeSlot: '14:00 - 15:00',
        studentId: 'std-3',
        studentName: 'Trần Thị B',
        studentAvatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        workoutName: 'Full Body HIIT',
        status: 'PENDING',
        remainingSessions: 12,
        totalSessions: 36,
      },
      {
        id: 'session-4',
        timeSlot: '16:30 - 17:30',
        studentId: 'std-4',
        studentName: 'Lê Văn C',
        studentAvatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        workoutName: 'Back & Core Hypertrophy',
        status: 'PENDING',
        remainingSessions: 2,
        totalSessions: 12,
      },
    ];

    return {
      coachName,
      coachAvatar,
      totalVipStudents: 10,
      todaySessionsCount: todaySessions.length,
      completedSessionsCount: 18,
      totalPackageSessionsCount: 24,
      warningsCount: 2,
      pendingMealCount: 2,
      todaySessions,
      pendingMeals: [
        {
          id: 'meal-rev-1',
          studentId: 'std-1',
          studentName: 'Bùi Văn Huy',
          studentAvatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          mealName: 'Bữa Trưa',
          calories: 650,
          imageUrl:
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
          foodDescription: 'Ức gà + Cơm gạo lứt + Bông cải xanh',
          proteinGrams: 45,
          carbsGrams: 60,
          fatGrams: 15,
          loggedAt: new Date().toISOString(),
        },
        {
          id: 'meal-rev-2',
          studentId: 'std-3',
          studentName: 'Trần Thị B',
          studentAvatar:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          mealName: 'Bữa Sáng',
          calories: 420,
          imageUrl:
            'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
          foodDescription: '3 Trứng ốp la + Bánh mì nguyên cám + Bơ quả',
          proteinGrams: 28,
          carbsGrams: 35,
          fatGrams: 18,
          loggedAt: new Date().toISOString(),
        },
      ],
      students: [
        {
          id: 'std-3',
          fullName: 'Trần Thị B',
          avatarUrl:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          packageName: 'VIP Package',
          remainingSessions: 12,
          totalSessions: 36,
          lastWorkoutDate: 'Hôm qua',
        },
        {
          id: 'std-4',
          fullName: 'Lê Văn C',
          avatarUrl:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
          packageName: 'Standard Package',
          remainingSessions: 2,
          totalSessions: 12,
          lastWorkoutDate: '3 ngày trước',
        },
      ],
    };
  }

  async checkInSession(sessionId: string) {
    return {
      success: true,
      sessionId,
      message: 'Check-in trừ buổi học viên thành công!',
    };
  }

  async approveMeal(mealId: string, note?: string) {
    return {
      success: true,
      mealId,
      note,
      message: 'Đã duyệt bữa ăn cho học viên!',
    };
  }
}
