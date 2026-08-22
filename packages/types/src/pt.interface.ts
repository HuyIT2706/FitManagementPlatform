export interface PTSessionItem {
  id: string;
  timeSlot: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  workoutName: string;
  status: "PENDING" | "CHECKED_IN" | "COMPLETED" | "CANCELLED";
  remainingSessions: number;
  totalSessions: number;
  scheduledDate?: string;
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

export interface PTPendingStudentRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  studentAvatar?: string;
  requestedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
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
  pendingStudentRequestsCount?: number;
  pendingStudentRequests?: PTPendingStudentRequest[];
  todaySessions: PTSessionItem[];
  pendingMeals: PTPendingMeal[];
  students: PTStudentSummary[];
}

export interface AssignedExerciseItem {
  id: string;
  exerciseId?: string;
  name: string;
  category: string;
  sets: number;
  reps: number;
  weightInKg: number;
  restSeconds?: number;
  dayOfWeek?: string;
  imageUrl?: string;
  setupImageUrl?: string;
  startImageUrl?: string;
}

export interface InBodyHistoryPoint {
  date: string;
  weightKg: number;
  bodyFatPercent: number;
  muscleMassKg: number;
}

export interface PTStudentDetail {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  gender?: string;
  packageName: string;
  remainingSessions: number;
  totalSessions: number;
  assignedExercises?: AssignedExerciseItem[];
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
  bodyMetrics?: {
    weightKg?: number;
    heightCm?: number;
    bodyFatPercent?: number;
    muscleMassKg?: number;
    updatedAt?: string;
  };
  bodyMetricsHistory?: InBodyHistoryPoint[];
  prescribedMealPlan?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    snack?: string;
    note?: string;
  };
  beforeAfterPhotos?: {
    beforeUrl?: string;
    afterUrl?: string;
    beforeWeight?: number;
    afterWeight?: number;
    beforeDate?: string;
    afterDate?: string;
  };
  inBody?: {
    weightKg: number;
    heightCm: number;
    bodyFatPercent: number;
    muscleMassKg: number;
    updatedAt: string;
  };
  nutritionTarget?: {
    targetCalories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  };
  currentWorkoutTitle?: string;
}

export interface AssignWorkoutDto {
  studentId: string;
  title?: string;
  note?: string;
  exercises?: {
    id?: string;
    exerciseId?: string;
    name: string;
    category?: string;
    sets: number;
    reps: number;
    weightInKg: number;
    restSeconds?: number;
    dayOfWeek?: string;
  }[];
}

export interface AssignNutritionDto {
  studentId: string;
  targetCalories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
  prescribedMealPlan?: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snack?: string;
    note?: string;
  };
}

export interface UpdateInBodyDto {
  studentId: string;
  weightKg: number;
  heightCm: number;
  bodyFatPercent: number;
  muscleMassKg: number;
  date?: string;
}

export interface SendInviteDto {
  studentEmail: string;
  packageName: string;
  totalSessions: number;
  remainingSessions: number;
  note?: string;
}

export interface BindPtDto {
  ptCodeOrInviteCode: string;
}

export interface UpdateStudentSessionsDto {
  studentId: string;
  fullName?: string;
  phone?: string;
  packageName?: string;
  totalSessions?: number;
  remainingSessions?: number;
}

export interface PTCodeQrData {
  ptCode: string;
  qrCodeUrl: string;
  coachName: string;
}
