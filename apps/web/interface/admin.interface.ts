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
