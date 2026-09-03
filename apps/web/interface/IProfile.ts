import type { UserDataHome } from './IHome';

export interface ProfileHeaderCardProps {
  userData: UserDataHome | null;
  onEditProfile?: () => void;
}

export interface PtCoachBindCardProps {
  assignedPt?: {
    id?: string;
    fullName?: string;
    avatarUrl?: string | null;
    phone?: string | null;
    email?: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    isApproved?: boolean;
    isPending?: boolean;
  } | null;
  onBindSuccess?: () => void;
}

export interface ProfileBiometricsGridProps {
  ageYears: number;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  bmi: number;
  bmr: number;
  tdee: number;
  activityLabel?: string;
}

export interface TransformationJourneyProps {
  goal: string;
  weightKg: number;
  targetWeightKg: number;
  goalTextMap: Record<string, string>;
  studentId?: string;
  isPtView?: boolean;
}

export interface DailyMacroTargetMasterProps {
  targetCalo: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  suggestedOffset: number;
}

export interface ProfileSettingsListProps {
  onLogout: () => void;
  onEditProfile?: () => void;
}
