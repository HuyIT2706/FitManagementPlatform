import type { ExerciseItem, MealPlanAssigned } from '@repo/types';
import type { UserDataHome } from './IHome';

export type {
  ExerciseCategoryType,
  ExerciseDetailResponse,
  ExerciseItem,
  ExercisePaginatedResponse,
  MealPlanAssigned,
} from '@repo/types';

export interface TrainingVipBannerProps {
  userData: UserDataHome | null;
  assignedMealPlan: MealPlanAssigned | null;
  assignedWorkoutPlan?: AssignedWorkoutPlanData | null;
}

export interface ExerciseLibraryGridProps {
  exercises: ExerciseItem[];
  totalExercises: number;
  selectedMuscle: string;
  searchQuery: string;
  exerciseLoading: boolean;
  currentPage: number;
  totalPages: number;
  favoriteIds?: Record<string, boolean>;
  todaySessionIds?: Record<string, boolean>;
  checkedExercises?: Record<string, boolean>;
  onMuscleSelect: (muscleId: string) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  onToggleFavorite?: (exercise: ExerciseItem) => void;
  onToggleTodaySession?: (exercise: ExerciseItem) => void;
  onToggleExercise?: (id: string) => void;
  onSelectExercise: (exercise: ExerciseItem) => void;
  onPageChange: (page: number) => void;
}

export interface AssignedMealPlanCardProps {
  assignedMealPlan: MealPlanAssigned | null;
  ptName: string;
  onOpenAiPlanner?: () => void;
}

export interface AssignedWorkoutPlanData {
  coachName: string;
  coachAvatar?: string;
  scheduleTitle: string;
  note: string;
  exercisesCount: number;
  exercises: Array<{
    id: string;
    exerciseLibraryId?: string;
    name: string;
    category?: string | null;
    force?: string | null;
    level?: string | null;
    mechanic?: string | null;
    equipment?: string | null;
    primaryMuscles?: string[];
    secondaryMuscles?: string[];
    sets: number;
    reps: number;
    weightInKg: number;
    instructions?: string[];
    setupImageUrl?: string | null;
    startImageUrl?: string | null;
    imageUrl?: string | null;
  }>;
}

export interface AssignedWorkoutPlanCardProps {
  assignedWorkoutPlan: AssignedWorkoutPlanData | null;
  checkedExercises?: Record<string, boolean>;
  onToggleExerciseCheck?: (id: string) => void;
  onSelectExercise?: (exercise: ExerciseItem) => void;
}

export interface ExerciseDetailModalProps {
  exercise?: ExerciseItem | null;
  activeExercise?: ExerciseItem | null;
  onClose: () => void;
}
