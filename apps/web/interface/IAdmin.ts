export type PtApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type AdminFilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type AdminUserRole = 'USER' | 'PT' | 'ADMIN';
export type AdminUserRoleFilter = 'ALL' | 'USER' | 'PT' | 'ADMIN';

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

// ----------------------------------------------------
// Content Library (Exercises & Foods) Interfaces
// ----------------------------------------------------

export interface AdminExerciseItem {
  id: string;
  name: string;
  category?: string;
  equipment?: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  setupImageUrl?: string;
  startImageUrl?: string;
}

export interface AdminFoodItem {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g?: number;
  category?: string;
  imageUrl?: string;
}

export interface ContentLibraryTabNavProps {
  activeTab: 'EXERCISES' | 'FOODS';
  exTotal: number;
  foodTotal: number;
  onTabChange: (tab: 'EXERCISES' | 'FOODS') => void;
  onOpenAddModal: () => void;
}

export interface ExerciseFilterBarProps {
  search: string;
  category: string;
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  onSearchSubmit: () => void;
  onRefresh: () => void;
}

export interface ExerciseTableProps {
  exercises: AdminExerciseItem[];
  loading: boolean;
  onEdit: (exercise: AdminExerciseItem) => void;
  onDelete: (exercise: AdminExerciseItem) => void;
}

export interface ExerciseFormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  submitting: boolean;
  name: string;
  category: string;
  equipment: string;
  primaryMuscles: string;
  instructions: string;
  setupUrl: string;
  startUrl: string;
  onNameChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onEquipmentChange: (v: string) => void;
  onPrimaryMusclesChange: (v: string) => void;
  onInstructionsChange: (v: string) => void;
  onSetupUrlChange: (v: string) => void;
  onStartUrlChange: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export interface ExerciseDeleteModalProps {
  isOpen: boolean;
  exercise: AdminExerciseItem | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export interface FoodFilterBarProps {
  search: string;
  category: string;
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  onSearchSubmit: () => void;
  onRefresh: () => void;
}

export interface FoodTableProps {
  foods: AdminFoodItem[];
  loading: boolean;
  onEdit: (food: AdminFoodItem) => void;
  onDelete: (food: AdminFoodItem) => void;
}

export interface FoodFormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  submitting: boolean;
  name: string;
  category: string;
  calo: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  image: string;
  onNameChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onCaloChange: (v: string) => void;
  onProteinChange: (v: string) => void;
  onCarbsChange: (v: string) => void;
  onFatChange: (v: string) => void;
  onFiberChange: (v: string) => void;
  onImageChange: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export interface FoodDeleteModalProps {
  isOpen: boolean;
  food: AdminFoodItem | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export interface LibraryPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// ----------------------------------------------------
// User Management Interfaces
// ----------------------------------------------------

export interface AdminUserItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: AdminUserRole;
  goal?: string;
  gender?: string;
  createdAt: string;
  coachName?: string;
  activePackage?: {
    title: string;
    remainingSessions: number;
    totalSessions: number;
  };
}

export interface AdminUsersResponse {
  data: AdminUserItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUsersFilterBarProps {
  searchTerm: string;
  roleFilter: AdminUserRoleFilter;
  onSearchChange: (search: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onRoleFilterChange: (role: AdminUserRoleFilter) => void;
  onRefresh: () => void;
}

export interface AdminUsersTableProps {
  users: AdminUserItem[];
  loading: boolean;
  onChangeRole: (user: AdminUserItem) => void;
  onDeleteUser: (user: AdminUserItem) => void;
}

export interface AdminChangeRoleModalProps {
  isOpen: boolean;
  user: AdminUserItem | null;
  targetRole: AdminUserRole;
  submitting: boolean;
  onRoleSelect: (role: AdminUserRole) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export interface AdminDeleteUserModalProps {
  isOpen: boolean;
  user: AdminUserItem | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export interface AdminUsersPaginationProps {
  total: number;
  currentCount: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
