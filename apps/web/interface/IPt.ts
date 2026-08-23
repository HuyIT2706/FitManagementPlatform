import type { PTDashboardData } from '@repo/types';

export interface PtWelcomeHeaderProps {
  coachName: string;
  todaySessionsCount: number;
  pendingMealCount: number;
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
