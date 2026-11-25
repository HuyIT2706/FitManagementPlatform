'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, Flame, Trash2 } from 'lucide-react';
import Header from '../../components/ui/Header';
import BottomNavBar from '../../components/navigation/BottomNavBar';
import AppLoading from '../../components/ui/AppLoading';
import type { ExerciseItem } from '../../interface';
import {
  useAssignedMealPlan,
  useAssignedWorkoutPlan,
  useCurrentUser,
  useExerciseLibrary,
} from '../../hooks/swr';
import { performLogout } from '../../utils/logout';
import toast from '../../utils/toast';
import { formatMuscleLabel } from '../../utils/exerciseHelpers';
import {
  WORKOUT_SESSION_UPDATED_EVENT,
  getFavoriteExercisesMap,
  getTodayWorkoutSession,
  toggleExerciseCheckedInSession,
  toggleExerciseInTodaySession,
  toggleFavoriteExercise,
  type TodayWorkoutSession,
} from '../../utils/workoutSession';
import TrainingVipBanner from './components/TrainingVipBanner';
import ExerciseLibraryGrid from './components/ExerciseLibraryGrid';
import AssignedMealPlanCard from './components/AssignedMealPlanCard';
import AssignedWorkoutPlanCard from './components/AssignedWorkoutPlanCard';
import SmartMealPlannerModal from '../../components/nutrition/SmartMealPlannerModal';

type ExerciseWithPlan = ExerciseItem & {
  assignedSets?: number;
  assignedReps?: number;
};

export default function TrainingPage() {
  const router = useRouter();
  const { data: userData, isLoading: userLoading } = useCurrentUser();
  const { data: assignedMealPlan, mutate: mutateAssignedMealPlan } =
    useAssignedMealPlan();
  const { data: assignedWorkoutPlan } = useAssignedWorkoutPlan();

  const [selectedMuscle, setSelectedMuscle] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 9;

  const [checkedExercises, setCheckedExercises] = useState<
    Record<string, boolean>
  >({});
  const [favoritesMap, setFavoritesMap] = useState<
    Record<string, ExerciseItem>
  >({});
  const [todaySession, setTodaySession] = useState<TodayWorkoutSession>({
    date: '',
    exercises: [],
    checkedIds: {},
  });
  const [isAiMealModalOpen, setIsAiMealModalOpen] = useState(false);

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    const syncLocalWorkoutState = () => {
      setFavoritesMap(getFavoriteExercisesMap());
      setTodaySession(getTodayWorkoutSession());
    };
    const timer = window.setTimeout(syncLocalWorkoutState, 0);
    window.addEventListener(WORKOUT_SESSION_UPDATED_EVENT, syncLocalWorkoutState);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(
        WORKOUT_SESSION_UPDATED_EVENT,
        syncLocalWorkoutState,
      );
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isLocalTab =
    selectedMuscle === 'TODAY' || selectedMuscle === 'FAVORITES';

  const {
    data: exerciseData,
    isLoading: exerciseLoading,
    isValidating: exerciseValidating,
  } = useExerciseLibrary(
    isLocalTab ? 1 : currentPage,
    isLocalTab ? 1 : pageSize,
    isLocalTab ? 'ALL' : selectedMuscle,
    isLocalTab ? '' : debouncedSearchQuery,
  );

  const favoriteIds = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const id of Object.keys(favoritesMap)) {
      map[id] = true;
    }
    return map;
  }, [favoritesMap]);

  const todaySessionIds = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const item of todaySession.exercises) {
      map[item.id] = true;
    }
    return map;
  }, [todaySession.exercises]);

  const mergedCheckedIds = useMemo(
    () => ({ ...checkedExercises, ...todaySession.checkedIds }),
    [checkedExercises, todaySession.checkedIds],
  );

  const localFilterResult = useMemo(() => {
    if (!isLocalTab) return null;
    const sourceList =
      selectedMuscle === 'TODAY'
        ? todaySession.exercises
        : Object.values(favoritesMap);
    const q = debouncedSearchQuery.trim().toLowerCase();
    const filtered = q
      ? sourceList.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            (item.equipment || '').toLowerCase().includes(q) ||
            (item.primaryMuscles || []).some((m) => m.toLowerCase().includes(q)),
        )
      : sourceList;

    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(currentPage, pages);
    const start = (safePage - 1) * pageSize;

    return {
      exercises: filtered.slice(start, start + pageSize),
      totalExercises: total,
      totalPages: pages,
    };
  }, [
    isLocalTab,
    selectedMuscle,
    todaySession.exercises,
    favoritesMap,
    debouncedSearchQuery,
    currentPage,
  ]);

  const exercises = localFilterResult
    ? localFilterResult.exercises
    : exerciseData?.data || [];
  const totalExercises = localFilterResult
    ? localFilterResult.totalExercises
    : exerciseData?.total || 0;
  const totalPages = localFilterResult
    ? localFilterResult.totalPages
    : exerciseData?.totalPages || 1;
  const isExerciseSearching = !isLocalTab && (exerciseLoading || exerciseValidating);

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

  const handleToggleFavorite = (ex: ExerciseItem) => {
    const added = toggleFavoriteExercise(ex);
    toast.success(
      added ? `Đã lưu "${ex.name}" vào yêu thích` : `Đã bỏ "${ex.name}" khỏi yêu thích`,
    );
  };

  const handleToggleTodaySession = (ex: ExerciseItem) => {
    const { added } = toggleExerciseInTodaySession(ex);
    toast.success(
      added
        ? `Đã thêm "${ex.name}" vào buổi tập hôm nay`
        : `Đã gỡ "${ex.name}" khỏi buổi tập hôm nay`,
    );
  };

  const handleOpenExerciseDetail = (ex: ExerciseWithPlan) => {
    const params = new URLSearchParams();
    if (ex.assignedSets && ex.assignedSets > 0) {
      params.set('sets', String(ex.assignedSets));
    }
    if (ex.assignedReps && ex.assignedReps > 0) {
      params.set('reps', String(ex.assignedReps));
    }
    const query = params.toString();
    router.push(
      `/training/${encodeURIComponent(ex.id)}${query ? `?${query}` : ''}`,
    );
  };

  const handleLogout = () => {
    performLogout();
  };

  if (userLoading && !userData) {
    return <AppLoading fullScreen message="Đang tải dữ liệu tập luyện..." />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface pb-32">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-container-padding mt-4 md:mt-8 space-y-6">
        <TrainingVipBanner
          userData={userData ?? null}
          assignedMealPlan={assignedMealPlan ?? null}
          assignedWorkoutPlan={assignedWorkoutPlan}
        />

        {/* Today's Personal Workout Session Strip */}
        {todaySession.exercises.length > 0 && (
          <section className="bg-white dark:bg-[#121a15] rounded-3xl border border-slate-200/80 dark:border-white/10 p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#ecfccb] dark:bg-lime-500/20 text-[#3f6212] dark:text-lime-300 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    Buổi tập cá nhân hôm nay
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                    {
                      todaySession.exercises.filter(
                        (e) => todaySession.checkedIds[e.id],
                      ).length
                    }
                    /{todaySession.exercises.length} bài tập đã hoàn thành
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleMuscleSelect('TODAY')}
                className="text-xs font-bold text-lime-700 dark:text-lime-300 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {todaySession.exercises.map((item) => {
                const done = Boolean(todaySession.checkedIds[item.id]);
                const muscle = formatMuscleLabel(item.primaryMuscles?.[0] || '');
                return (
                  <div
                    key={item.id}
                    onClick={() => handleOpenExerciseDetail(item)}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 cursor-pointer transition-all ${
                      done
                        ? 'bg-emerald-50/70 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
                        : 'bg-slate-50 dark:bg-white/5 border-slate-200/70 dark:border-white/10 hover:border-[#84cc16]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExerciseCheckedInSession(item.id);
                        }}
                        aria-label={`Đánh dấu hoàn thành ${item.name}`}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                          done
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-white/25 hover:border-lime-500'
                        }`}
                      >
                        {done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <div className="min-w-0">
                        <p
                          className={`text-xs sm:text-sm font-bold truncate ${
                            done
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {item.name}
                        </p>
                        {muscle && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {muscle}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleTodaySession(item);
                      }}
                      aria-label={`Gỡ ${item.name} khỏi buổi tập`}
                      className="w-7 h-7 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Assigned 1:1 Workout Plan Section from Backend */}
        <AssignedWorkoutPlanCard
          assignedWorkoutPlan={assignedWorkoutPlan || null}
          checkedExercises={checkedExercises}
          onToggleExerciseCheck={handleToggleExerciseCheck}
          onSelectExercise={handleOpenExerciseDetail}
        />

        {/* Assigned 1:1 Meal Plan Section from Backend */}
        <AssignedMealPlanCard
          assignedMealPlan={assignedMealPlan || null}
          ptName={userData?.assignedPt?.fullName || ''}
          onOpenAiPlanner={() => setIsAiMealModalOpen(true)}
        />

        {/* AI Meal Planner Modal */}
        <SmartMealPlannerModal
          isOpen={isAiMealModalOpen}
          onClose={() => setIsAiMealModalOpen(false)}
          onApplied={() => mutateAssignedMealPlan()}
        />

        {/* Exercise Library Grid with Muscle Filters & Search */}
        <ExerciseLibraryGrid
          exercises={exercises}
          selectedMuscle={selectedMuscle}
          searchQuery={searchQuery}
          exerciseLoading={isExerciseSearching}
          currentPage={currentPage}
          totalPages={totalPages}
          totalExercises={totalExercises}
          checkedExercises={mergedCheckedIds}
          favoriteIds={favoriteIds}
          todaySessionIds={todaySessionIds}
          onMuscleSelect={handleMuscleSelect}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
          onToggleExercise={handleToggleExerciseCheck}
          onSelectExercise={handleOpenExerciseDetail}
          onPageChange={(p) => setCurrentPage(p)}
          onToggleFavorite={handleToggleFavorite}
          onToggleTodaySession={handleToggleTodaySession}
        />
      </main>

      <BottomNavBar activeTab="workout" />
    </div>
  );
}
