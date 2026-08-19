export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface UserData {
  id?: string;
  fullName?: string;
  avatarUrl?: string | null;
  email?: string;
  role?: string;
}

export interface OnboardingData {
  age: number | null;
  gender: string | null;
  weight: number | null;
  targetWeight: number | null;
  height: number | null;
  activityLevel: string | null;
  caloriesOffset?: number | null;
  mealFrequency: number | null;
  dietaryPreferences: string[];
  healthConditions: string[];
  pushNotifications: boolean;
}

export interface NutritionTarget {
  id?: string;
  studentId?: string;
  bmr?: number;
  tdee?: number;
  caloriesOffset?: number;
  targetCalo?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
  effectiveDate?: Date | string;
}

export interface UserDataHome extends UserData {
  age?: number;
  height?: number;
  weight?: number;
  targetWeight?: number;
  dateOfBirth?: Date | string;
  gender?: string;
  activityLevel?: string;
  bmr?: number;
  tdee?: number;
  bmi?: number;
  goal?: 'LOSE_WEIGHT' | 'GAIN_WEIGHT' | 'MAINTAIN';
  suggestedOffset?: number;
  mealFrequency?: number;
  nutritionTargets?: NutritionTarget[];
  bodyMetrics?: Array<{
    id?: string;
    weight?: number;
    height?: number;
    bodyFat?: number | null;
    muscleMass?: number | null;
    recordedAt?: Date | string;
  }>;
  assignedPt?: {
    id?: string;
    fullName?: string;
    avatarUrl?: string | null;
    phone?: string | null;
    email?: string;
  } | null;
  activePackage?: {
    id?: string;
    totalSessions?: number;
    remainingSessions?: number;
    startDate?: Date | string;
    endDate?: Date | string;
    gymPackage?: {
      title?: string;
    };
  } | null;
}

export interface ProgressPhotoItem {
  id: string;
  userId: string;
  photoUrl: string;
  tag?: string | null;
  takenAt: Date | string;
  weightAtTime?: number | null;
}

export interface CreateProgressPhotoDto {
  photoUrl: string;
  tag?: string; // BEFORE, AFTER, FRONT, SIDE, BACK
  weightAtTime?: number;
  takenAt?: string;
}

export interface CreateBodyMetricDto {
  weight: number;
  height?: number;
  bodyFat?: number;
  muscleMass?: number;
}

export interface ParQAnswers {
  heartCondition: boolean;
  chestPainExercise: boolean;
  chestPainNoExercise: boolean;
  dizzinessLossBalance: boolean;
  boneJointProblem: boolean;
  bloodPressureMedicine: boolean;
  otherReason: boolean;
  notes?: string;
}

