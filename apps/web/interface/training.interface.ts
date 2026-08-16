import type { ExerciseItem, MealPlanAssigned } from '@repo/types';
import type { UserDataHome } from './home.interface';

export type {
  ExerciseCategoryType,
  ExerciseItem,
  ExercisePaginatedResponse,
  MealPlanAssigned,
} from '@repo/types';

export interface TrainingVipBannerProps {
  userData: UserDataHome | null;
  assignedMealPlan: MealPlanAssigned | null;
}

export interface ExerciseLibraryGridProps {
  exercises: ExerciseItem[];
  totalExercises: number;
  selectedMuscle: string;
  searchQuery: string;
  exerciseLoading: boolean;
  currentPage: number;
  totalPages: number;
  checkedExercises: Record<string, boolean>;
  onMuscleSelect: (muscleId: string) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  onToggleExercise: (id: string) => void;
  onSelectExercise: (exercise: ExerciseItem) => void;
  onPageChange: (page: number) => void;
}

export interface AssignedMealPlanCardProps {
  assignedMealPlan: MealPlanAssigned | null;
  ptName: string;
}

export interface ExerciseDetailModalProps {
  activeExercise: ExerciseItem | null;
  onClose: () => void;
}
