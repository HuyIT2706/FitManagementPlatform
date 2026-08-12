export interface PTSessionItem {
  id: string;
  timeSlot: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  workoutName: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  remainingSessions: number;
  totalSessions: number;
}

export interface PTPendingMeal {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  mealName: string;
  calories: number;
  imageUrl?: string;
  foodDescription: string;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  loggedAt: Date | string;
}

export interface PTStudentSummary {
  id: string;
  fullName: string;
  avatarUrl?: string;
  packageName: string;
  remainingSessions: number;
  totalSessions: number;
  lastWorkoutDate?: string;
}

export interface PTDashboardData {
  coachName: string;
  coachAvatar?: string;
  totalVipStudents: number;
  todaySessionsCount: number;
  completedSessionsCount: number;
  totalPackageSessionsCount: number;
  warningsCount: number;
  pendingMealCount: number;
  todaySessions: PTSessionItem[];
  pendingMeals: PTPendingMeal[];
  students: PTStudentSummary[];
}
