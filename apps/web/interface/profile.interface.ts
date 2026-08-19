import type { UserDataHome } from './home.interface';

export interface ProfileHeaderCardProps {
  userData: UserDataHome | null;
  onEditProfile?: () => void;
}

export interface PtCoachBindCardProps {
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
  activityLabel: string;
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
