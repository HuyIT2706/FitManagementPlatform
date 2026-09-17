import type React from 'react';
import type {
  PTDashboardData,
  PTPendingStudentRequest,
  AssignedExerciseItem,
  InBodyHistoryPoint,
  FoodItem,
  ExerciseItem,
} from '@repo/types';
import type { UserDataHome } from './IHome';

export interface PtPendingStudentRequestsProps {
  requests?: PTPendingStudentRequest[];
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
}

export interface PtWelcomeHeaderProps {
  coachName: string;
  todaySessionsCount: number;
  totalVipStudents?: number;
  pendingMealCount?: number;
}

export interface PtBentoStatsProps {
  totalVipStudents: number;
  todaySessionsCount: number;
  completedSessionsCount: number;
  totalPackageSessionsCount: number;
  warningsCount: number;
}

export interface PtScheduleListProps {
  sessions?: PTDashboardData['todaySessions'];
  checkedSessions: Record<string, boolean>;
  onCheckInSession: (sessionId: string) => void;
}

export interface PtPendingMealsProps {
  meals?: PTDashboardData['pendingMeals'];
  approvedMeals: Record<string, boolean>;
  feedbackTexts: Record<string, string>;
  onFeedbackTextChange: (mealId: string, text: string) => void;
  onApproveMeal: (mealId: string) => void;
}

export interface PtStudentRosterQuickProps {
  students?: PTDashboardData['students'];
}

export interface StudentListItem {
  id: string;
  name: string;
  pkg: string;
  remaining: number;
  total: number;
  avatar: string;
}

export interface PtStudentCardProps {
  student: StudentListItem;
}

export interface PtInviteModalProps {
  isOpen: boolean;
  studentEmail: string;
  packageName: string;
  totalSessions: number | '';
  sendingInvite: boolean;
  generatedInviteUrl: string | null;
  onClose: () => void;
  onStudentEmailChange: (email: string) => void;
  onPackageNameChange: (pkg: string) => void;
  onTotalSessionsChange: (sessions: number | '') => void;
  onSendInvite: (e: React.FormEvent) => void;
  onCopyInviteUrl: () => void;
}

export interface PtQrCodeCardProps {
  ptCode: string;
  qrUrl: string;
  onCopyPtCode: () => void;
}

export interface PtProfileSettingsListProps {
  onLogout: () => void;
  onOpenEditProfile?: () => void;
}

export interface PtProfileCardProps {
  userData: UserDataHome | null;
  totalStudents: number;
  completedHours: number;
  onProfileUpdated?: () => void;
  isEditOpen?: boolean;
  setIsEditOpen?: (val: boolean) => void;
}

export interface EditPtProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserDataHome | null;
  fullName: string;
  setFullName: (val: string) => void;
  bio: string;
  setBio: (val: string) => void;
  experienceYears: number;
  setExperienceYears: (val: number) => void;
  specialties: string[];
  setSpecialties: (val: string[]) => void;
  availableSpecialties: string[];
  saving: boolean;
  onSave: () => void;
}

export interface StudentHeaderHeroProps {
  fullName: string;
  avatarUrl?: string;
  email: string;
  phone?: string;
  packageName: string;
  remainingSessions: number;
  totalSessions: number;
  onOpenEditSessionModal: () => void;
}

export interface StudentWorkoutTabProps {
  assignedExercises: AssignedExerciseItem[];
  newExName: string;
  newExCategory: string;
  newExSets: number;
  newExReps: number;
  newExDay: string;
  saving: boolean;
  onOpenExerciseModal: () => void;
  onExSetsChange: (val: number) => void;
  onExRepsChange: (val: number) => void;
  onExDayChange: (val: string) => void;
  onAddExercise: () => void;
  onRemoveExercise: (id: string) => void;
  onSaveWorkout: () => void;
}

export interface StudentNutritionTabProps {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  breakfastText: string;
  lunchText: string;
  dinnerText: string;
  snackText: string;
  nutritionNote: string;
  saving: boolean;
  onTargetCaloriesChange: (val: number) => void;
  onTargetProteinChange: (val: number) => void;
  onTargetCarbsChange: (val: number) => void;
  onTargetFatChange: (val: number) => void;
  onBreakfastTextChange: (val: string) => void;
  onLunchTextChange: (val: string) => void;
  onDinnerTextChange: (val: string) => void;
  onSnackTextChange: (val: string) => void;
  onNutritionNoteChange: (val: string) => void;
  onSaveNutrition: () => void;
}

export interface StudentInbodyTabProps {
  studentId: string;
  inbodyWeight: number;
  inbodyHeight: number;
  inbodyFat: number;
  inbodyMuscle: number;
  targetWeight?: number;
  goal?: string;
  chartMetric: 'weight' | 'fat' | 'muscle';
  isEditingInBody: boolean;
  historyPoints: InBodyHistoryPoint[];
  saving: boolean;
  onChartMetricChange: (metric: 'weight' | 'fat' | 'muscle') => void;
  onToggleEditInBody: (editing: boolean) => void;
  onInbodyWeightChange: (val: number) => void;
  onInbodyHeightChange: (val: number) => void;
  onInbodyFatChange: (val: number) => void;
  onInbodyMuscleChange: (val: number) => void;
  onSaveInBody: () => void;
}

export interface EditSessionModalProps {
  isOpen: boolean;
  packageName: string;
  totalSessions: number;
  remainingSessions: number;
  saving: boolean;
  onClose: () => void;
  onPackageNameChange: (val: string) => void;
  onTotalSessionsChange: (val: number) => void;
  onRemainingSessionsChange: (val: number) => void;
  onSaveSessions: () => void;
}

export interface ExerciseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: ExerciseItem) => void;
  currentSelectedName?: string;
}

export interface PtFoodSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMealName: string;
  onAddFoodToMeal: (food: FoodItem, weightInGrams: number, macroText: string) => void;
}

export interface InBodyStockChartProps {
  historyPoints: InBodyHistoryPoint[];
  metric: 'weight' | 'fat' | 'muscle';
  onMetricChange: (metric: 'weight' | 'fat' | 'muscle') => void;
}
