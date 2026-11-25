/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, Dumbbell, Flame, Trash2 } from 'lucide-react';
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
import {
  formatEquipmentLabel,
  formatMuscleLabel,
  getGoalPrescription,
} from '../../utils/exerciseHelpers';
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
        {todaySession.exercises.length > 0 && (() => {
          const doneCount = todaySession.exercises.filter(
            (e) => todaySession.checkedIds[e.id],
          ).length;
          const totalCount = todaySession.exercises.length;
          const progressPct = Math.round((doneCount / totalCount) * 100);

          return (
            <section className="bg-white dark:bg-[#121a15] rounded-3xl border border-slate-200/80 dark:border-white/10 p-4 sm:p-6 shadow-2xs space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-[#ecfccb] dark:bg-lime-500/15 border border-lime-500/20 text-[#3f6212] dark:text-lime-300 flex items-center justify-center shrink-0">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                          Buổi tập cá nhân hôm nay
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            doneCount === totalCount
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'
                          }`}
                        >
                          {doneCount}/{totalCount} đã xong
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {doneCount === totalCount
                          ? 'Tuyệt vời! Bạn đã hoàn tất toàn bộ bài tập tự chọn hôm nay.'
                          : 'Chạm vòng tròn để đánh dấu hoàn thành hoặc bấm vào bài để xem hướng dẫn.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleMuscleSelect('TODAY')}
                    className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200/70 dark:hover:bg-white/10 border border-slate-200/70 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-lime-300 flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                  >
                    <span>Xem tất cả</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#a3e635] to-emerald-500 transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <div
                className={`grid gap-3 ${
                  totalCount === 1
                    ? 'grid-cols-1'
                    : 'grid-cols-1 md:grid-cols-2'
                }`}
              >
                {todaySession.exercises.map((item) => {
                  const done = Boolean(todaySession.checkedIds[item.id]);
                  const muscle = formatMuscleLabel(
                    item.primaryMuscles?.[0] || '',
                  );
                  const equip = formatEquipmentLabel(item.equipment);
                  const prescription = getGoalPrescription(item, userData?.goal);
                  const thumb = item.setupImageUrl || item.startImageUrl;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleOpenExerciseDetail(item)}
                      className={`p-3 sm:p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all group ${
                        done
                          ? 'bg-emerald-50/70 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
                          : 'bg-slate-50/80 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/10 hover:border-[#84cc16]/70 dark:hover:border-lime-400/50 hover:bg-white dark:hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
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
                              : 'border-slate-300 dark:border-white/25 hover:border-lime-500 bg-white dark:bg-transparent'
                          }`}
                        >
                          {done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-slate-200/70 dark:bg-black/40 border border-slate-200/80 dark:border-white/10 shrink-0 flex items-center justify-center">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={item.name}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <Dumbbell className="w-5 h-5 text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <p
                            className={`text-sm sm:text-[15px] font-extrabold truncate transition-colors ${
                              done
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-white group-hover:text-lime-700 dark:group-hover:text-lime-300'
                            }`}
                          >
                            {item.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                            {muscle && (
                              <span className="px-2 py-0.5 rounded-full font-bold bg-[#ecfccb] text-[#3f6212] dark:bg-lime-500/15 dark:text-lime-300">
                                {muscle}
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-full font-semibold bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                              {prescription.setsReps}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 truncate hidden sm:inline">
                              • {equip}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="hidden sm:inline-flex items-center gap-0.5 text-xs font-semibold text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white px-2 transition-colors">
                          Chi tiết
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleTodaySession(item);
                          }}
                          aria-label={`Gỡ ${item.name} khỏi buổi tập`}
                          title="Gỡ khỏi buổi tập hôm nay"
                          className="w-8 h-8 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })()}

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
