export type PtApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type AdminFilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AdminPtApplication {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  experienceYears: number;
  specialties: string[];
  certificateUrl?: string;
  bio?: string;
  status: PtApplicationStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalPts: number;
  totalAdmins?: number;
  pendingApps: number;
  approvedApps: number;
  rejectedApps: number;
}

export interface CoachReviewHeroStatsProps {
  stats: AdminStats | null;
}

export interface CoachReviewFilterBarProps {
  filterStatus: AdminFilterStatus;
  pendingCount: number;
  searchTerm: string;
  onFilterChange: (status: AdminFilterStatus) => void;
  onSearchChange: (search: string) => void;
}

export interface CoachReviewCardProps {
  application: AdminPtApplication;
  onApprove: (app: AdminPtApplication) => void;
  onReject: (app: AdminPtApplication) => void;
}

export interface CoachReviewListProps {
  applications: AdminPtApplication[];
  loading: boolean;
  onApprove: (app: AdminPtApplication) => void;
  onReject: (app: AdminPtApplication) => void;
}

export interface CoachReviewActionModalProps {
  isOpen: boolean;
  application: AdminPtApplication | null;
  action: 'APPROVE' | 'REJECT' | null;
  actionNote: string;
  submitting: boolean;
  onNoteChange: (note: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

// ----------------------------------------------------
// Dashboard & Analytics Interfaces
// ----------------------------------------------------

export interface AnalyticsOverviewData {
  totalUsers: number;
  totalPts: number;
  totalAdmins: number;
  totalAccounts: number;
  totalExercises: number;
  totalFoods: number;
  totalMealLogs: number;
  totalWorkouts: number;
}

export interface AnalyticsGoalDistributionItem {
  goal: string;
  count: number;
}

export interface AnalyticsRecentUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AnalyticsRecentApplication {
  id: string;
  fullName: string;
  email: string;
  status: string;
  createdAt: string;
}

export interface AdminAnalyticsData {
  overview: AnalyticsOverviewData;
  goalDistribution: AnalyticsGoalDistributionItem[];
  recentUsers: AnalyticsRecentUser[];
  recentApplications: AnalyticsRecentApplication[];
}

export interface AdminAnalyticsHeaderProps {
  onRefresh: () => void;
}

export interface AdminAnalyticsHeroMetricsProps {
  overview: AnalyticsOverviewData;
}

export interface AdminGoalDistributionCardProps {
  goalDistribution: AnalyticsGoalDistributionItem[];
}

export interface AdminRecentUsersCardProps {
  recentUsers: AnalyticsRecentUser[];
}

export interface AdminRecentApplicationsCardProps {
  recentApplications: AnalyticsRecentApplication[];
}
