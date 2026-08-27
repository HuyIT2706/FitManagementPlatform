'use client';

import { useEffect, useState } from 'react';
import Header from '../../components/ui/Header';
import BottomNavBar from '../../components/navigation/BottomNavBar';
import AppLoading from '../../components/ui/AppLoading';
import type { ExerciseItem } from '../../interface';
import {
  useCurrentUser,
  useAssignedMealPlan,
  useAssignedWorkoutPlan,
  useExerciseLibrary,
} from '../../hooks/swr';

import TrainingVipBanner from './components/TrainingVipBanner';
import ExerciseLibraryGrid from './components/ExerciseLibraryGrid';
import AssignedMealPlanCard from './components/AssignedMealPlanCard';
import AssignedWorkoutPlanCard from './components/AssignedWorkoutPlanCard';
import ExerciseDetailModal from './components/ExerciseDetailModal';

const WorkoutPage = () => {
  const { data: userData, isLoading: userLoading } = useCurrentUser();
  const { data: assignedMealPlan } = useAssignedMealPlan();
  const { data: assignedWorkoutPlan } = useAssignedWorkoutPlan();

  const [selectedMuscle, setSelectedMuscle] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  const [checkedExercises, setCheckedExercises] = useState<Record<string, boolean>>({});
  const [activeExercise, setActiveExercise] = useState<ExerciseItem | null>(null);

  // Debounce search query by 300ms to avoid overwhelming the backend API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: exerciseData, isLoading: exerciseLoading } = useExerciseLibrary(
    currentPage,
    pageSize,
    selectedMuscle,
    debouncedSearchQuery
  );

  const exercises = exerciseData?.data || [];
  const totalPages = exerciseData?.totalPages || 1;
  const totalExercises = exerciseData?.total || 0;

  const handleMuscleSelect = (muscleId: string) => {
    setSelectedMuscle(muscleId);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleToggleExerciseCheck = (exerciseId: string) => {
    setCheckedExercises((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    window.location.href = '/login';
  };

  if (userLoading && !userData) {
    return <AppLoading fullScreen size="lg" message="Đang nạp dữ liệu tập luyện..." />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface pb-32 pt-2 md:pt-0 dark">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-container-padding mt-4 md:mt-8 space-y-gutter">
        <TrainingVipBanner userData={userData || null} assignedMealPlan={assignedMealPlan || null} />

        {/* Assigned 1:1 Workout Plan Section from Backend */}
        <AssignedWorkoutPlanCard
          assignedWorkoutPlan={assignedWorkoutPlan || null}
          checkedExercises={checkedExercises}
          onToggleExerciseCheck={handleToggleExerciseCheck}
        />

        {/* Assigned 1:1 Meal Plan Section from Backend */}
        <AssignedMealPlanCard
          assignedMealPlan={assignedMealPlan || null}
          ptName={userData?.assignedPt?.fullName || ''}
        />

        {/* Exercise Library Grid with Muscle Filters & Search */}
        <ExerciseLibraryGrid
          exercises={exercises}
          selectedMuscle={selectedMuscle}
          searchQuery={searchQuery}
          exerciseLoading={exerciseLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalExercises={totalExercises}
          checkedExercises={checkedExercises}
          onMuscleSelect={handleMuscleSelect}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
          onToggleExercise={handleToggleExerciseCheck}
          onSelectExercise={(ex) => setActiveExercise(ex)}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </main>

      <ExerciseDetailModal
        activeExercise={activeExercise}
        exercise={activeExercise}
        onClose={() => setActiveExercise(null)}
      />

      <BottomNavBar activeTab="workout" />
    </div>
  );
};

export default WorkoutPage;
