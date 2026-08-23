'use client';

import { useEffect, useState } from 'react';
import Header from '../../components/ui/Header';
import BottomNavBar from '../../components/navigation/BottomNavBar';
import AppLoading from '../../components/ui/AppLoading';
import apiClient from '../../api/axios';
import type {
  UserDataHome,
  ExerciseItem,
  ExercisePaginatedResponse,
  MealPlanAssigned,
  AssignedWorkoutPlanData,
} from '../../interface';

import TrainingVipBanner from './components/TrainingVipBanner';
import ExerciseLibraryGrid from './components/ExerciseLibraryGrid';
import AssignedMealPlanCard from './components/AssignedMealPlanCard';
import AssignedWorkoutPlanCard from './components/AssignedWorkoutPlanCard';
import ExerciseDetailModal from './components/ExerciseDetailModal';

export default function WorkoutPage() {
  const [userData, setUserData] = useState<UserDataHome | null>(null);
  const [assignedMealPlan, setAssignedMealPlan] = useState<MealPlanAssigned | null>(null);
  const [assignedWorkoutPlan, setAssignedWorkoutPlan] = useState<AssignedWorkoutPlanData | null>(
    null
  );

  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [selectedMuscle, setSelectedMuscle] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalExercises, setTotalExercises] = useState<number>(0);
  const pageSize = 8;

  const [loading, setLoading] = useState(true);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [checkedExercises, setCheckedExercises] = useState<Record<string, boolean>>({});

  // Selected exercise for detail modal
  const [activeExercise, setActiveExercise] = useState<ExerciseItem | null>(null);

  // Debounce search query by 400ms to avoid overwhelming the backend API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    Promise.all([
      apiClient.get<UserDataHome>('/users/me'),
      apiClient.get<MealPlanAssigned | null>('/workout/assigned-meal-plan'),
      apiClient.get<AssignedWorkoutPlanData | null>('/workout/assigned-workout-plan'),
    ])
      .then(([userRes, mealPlanRes, workoutPlanRes]) => {
        setUserData(userRes.data);
        setAssignedMealPlan(mealPlanRes.data);
        setAssignedWorkoutPlan(workoutPlanRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchExercises(selectedMuscle, debouncedSearchQuery, currentPage);
  }, [selectedMuscle, debouncedSearchQuery, currentPage]);

  const fetchExercises = (muscle: string, search: string, page: number) => {
    setExerciseLoading(true);
    const muscleQuery = muscle === 'ALL' ? '' : `&muscle=${encodeURIComponent(muscle)}`;
    const searchQueryStr =
      search.trim() === '' ? '' : `&search=${encodeURIComponent(search.trim())}`;

    apiClient
      .get<ExercisePaginatedResponse>(
        `/workout/exercises?page=${page}&limit=${pageSize}${muscleQuery}${searchQueryStr}`
      )
      .then((res) => {
        setExercises(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotalExercises(res.data.total);
        setExerciseLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setExerciseLoading(false);
      });
  };

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

  if (loading) {
    return <AppLoading fullScreen size="lg" message="Đang nạp dữ liệu tập luyện..." />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface pb-32 pt-2 md:pt-0 dark">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-container-padding mt-4 md:mt-8 space-y-gutter">
        <TrainingVipBanner userData={userData} assignedMealPlan={assignedMealPlan} />

        {/* Assigned 1:1 Workout Plan Section from Backend */}
        <AssignedWorkoutPlanCard
          assignedWorkoutPlan={assignedWorkoutPlan}
          checkedExercises={checkedExercises}
          onToggleExerciseCheck={handleToggleExerciseCheck}
        />

        {/* Assigned 1:1 Meal Plan Section from Backend */}
        <AssignedMealPlanCard
          assignedMealPlan={assignedMealPlan}
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
}
