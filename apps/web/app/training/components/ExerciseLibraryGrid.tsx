/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useMemo, useRef } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Flame,
  Heart,
  Plus,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import type { ExerciseItem, ExerciseLibraryGridProps } from '../../../interface';
import {
  formatEquipmentLabel,
  formatLevelLabel,
  formatMechanicLabel,
  formatMuscleLabel,
} from '../../../utils/exerciseHelpers';

const MUSCLE_FILTERS: Array<{ id: string; label: string }> = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'TODAY', label: 'Buổi tập' },
  { id: 'FAVORITES', label: 'Yêu thích' },
  { id: 'cơ ngực', label: 'Ngực' },
  { id: 'cơ vai', label: 'Vai' },
  { id: 'cơ lưng', label: 'Lưng' },
  { id: 'cơ xô', label: 'Xô' },
  { id: 'cơ đùi trước', label: 'Đùi trước' },
  { id: 'cơ đùi sau', label: 'Đùi sau' },
  { id: 'cơ mông', label: 'Mông' },
  { id: 'cơ tay trước', label: 'Tay trước' },
  { id: 'cơ tay sau', label: 'Tay sau' },
  { id: 'cơ bụng', label: 'Bụng' },
  { id: 'bắp chân', label: 'Bắp chân' },
];

const DEFAULT_EXERCISE_IMG =
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80';

function countActiveIds(map?: Record<string, boolean>): number {
  if (!map) return 0;
  return Object.values(map).filter(Boolean).length;
}

const ExerciseLibraryGrid = ({
  exercises,
  selectedMuscle,
  searchQuery,
  exerciseLoading,
  currentPage,
  totalPages,
  totalExercises,
  checkedExercises,
  favoriteIds,
  todaySessionIds,
  onMuscleSelect,
  onSearchChange,
  onClearSearch,
  onToggleExercise,
  onSelectExercise,
  onPageChange,
  onToggleFavorite,
  onToggleTodaySession,
}: ExerciseLibraryGridProps) => {
  const filterScrollRef = useRef<HTMLDivElement>(null);

  const todayCount = useMemo(
    () => countActiveIds(todaySessionIds),
    [todaySessionIds],
  );
  const favoritesCount = useMemo(
    () => countActiveIds(favoriteIds),
    [favoriteIds],
  );

  const scrollFilters = (direction: -1 | 1) => {
    filterScrollRef.current?.scrollBy({
      left: direction * 240,
      behavior: 'smooth',
    });
  };

  return (
    <section className="space-y-4 sm:space-y-5">
      {/* Header + Search */}
      <div className="bg-white dark:bg-[#121a15] rounded-3xl border border-slate-200/80 dark:border-white/10 p-4 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-lime-700 dark:text-lime-400 bg-lime-100 dark:bg-lime-500/15 px-2.5 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Thư viện động tác chuẩn</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Khám phá bài tập ({totalExercises})
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Chạm vào bài tập để xem hoạt ảnh 2 khung hình, bản đồ cơ và hướng dẫn chi tiết.
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Tìm tên bài tập, dụng cụ, nhóm cơ..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#a3e635]/60 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={onClearSearch}
                aria-label="Xóa tìm kiếm"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200/80 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-white/20 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Muscle & Local Filter Pills */}
        <div className="relative flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scrollFilters(-1)}
            aria-label="Cuộn bộ lọc sang trái"
            className="hidden sm:flex w-8 h-8 rounded-full border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-200/70 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 items-center justify-center shrink-0 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={filterScrollRef}
            className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {MUSCLE_FILTERS.map((filter) => {
              const isActive = selectedMuscle === filter.id;
              const badgeCount =
                filter.id === 'TODAY'
                  ? todayCount
                  : filter.id === 'FAVORITES'
                    ? favoritesCount
                    : null;

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => onMuscleSelect(filter.id)}
                  className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isActive
                      ? 'bg-[#a3e635] text-slate-950 border-[#84cc16] font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200/70 dark:border-white/10 hover:bg-slate-200/70 dark:hover:bg-white/10'
                  }`}
                >
                  {filter.id === 'TODAY' && <Flame className="w-3.5 h-3.5" />}
                  {filter.id === 'FAVORITES' && (
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isActive ? 'fill-slate-950' : 'text-rose-500'
                      }`}
                    />
                  )}
                  <span>{filter.label}</span>
                  {badgeCount !== null && badgeCount > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-slate-950/15 text-slate-950'
                          : 'bg-white dark:bg-white/10 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollFilters(1)}
            aria-label="Cuộn bộ lọc sang phải"
            className="hidden sm:flex w-8 h-8 rounded-full border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-200/70 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 items-center justify-center shrink-0 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {exerciseLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121a15] overflow-hidden animate-pulse"
            >
              <div className="aspect-[4/3] bg-slate-200/70 dark:bg-white/5" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 rounded-full bg-slate-200/80 dark:bg-white/10" />
                <div className="h-3 w-1/2 rounded-full bg-slate-200/60 dark:bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121a15] p-8 sm:p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
            <Dumbbell className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
            {selectedMuscle === 'TODAY'
              ? 'Chưa có bài tập nào trong buổi tập hôm nay'
              : selectedMuscle === 'FAVORITES'
                ? 'Bạn chưa lưu bài tập yêu thích nào'
                : 'Không tìm thấy bài tập phù hợp'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {selectedMuscle === 'TODAY' || selectedMuscle === 'FAVORITES'
              ? 'Chọn từ danh sách Tất cả để thêm bài tập vào buổi tập hoặc đánh dấu yêu thích.'
              : 'Thử từ khóa ngắn gọn hơn hoặc chuyển sang nhóm cơ khác.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.map((exercise: ExerciseItem) => {
              const primaryThumb =
                exercise.setupImageUrl ||
                exercise.startImageUrl ||
                DEFAULT_EXERCISE_IMG;
              const secondaryThumb =
                exercise.startImageUrl ||
                exercise.setupImageUrl ||
                primaryThumb;
              const hasSwap = secondaryThumb !== primaryThumb;

              const primaryMuscle = formatMuscleLabel(
                exercise.primaryMuscles?.[0] || '',
              );
              const mechanicLabel = formatMechanicLabel(exercise.mechanic);
              const levelLabel = formatLevelLabel(exercise.level);
              const equipmentLabel = formatEquipmentLabel(exercise.equipment);

              const isFavorite = Boolean(favoriteIds?.[exercise.id]);
              const isInSession = Boolean(todaySessionIds?.[exercise.id]);
              const isChecked = Boolean(checkedExercises?.[exercise.id]);

              return (
                <article
                  key={exercise.id}
                  onClick={() => onSelectExercise(exercise)}
                  className="group rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121a15] overflow-hidden shadow-2xs hover:shadow-md hover:border-[#84cc16] dark:hover:border-lime-400/50 transition-all cursor-pointer flex flex-col"
                >
                  {/* Image Stage with 2-frame hover transition */}
                  <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-black/40 overflow-hidden">
                    <img
                      src={primaryThumb}
                      alt={exercise.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_EXERCISE_IMG;
                      }}
                      className={`w-full h-full object-cover transition-opacity duration-500 ${
                        hasSwap ? 'group-hover:opacity-0' : 'group-hover:scale-105'
                      }`}
                    />
                    {hasSwap && (
                      <img
                        src={secondaryThumb}
                        alt={`${exercise.name} - thực hiện`}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = primaryThumb;
                        }}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      />
                    )}

                    {/* Top-left Primary Muscle Pill */}
                    {primaryMuscle && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 dark:bg-[#0d1410]/85 text-slate-900 dark:text-lime-300 backdrop-blur-sm shadow-2xs">
                        {primaryMuscle}
                      </span>
                    )}

                    {/* Top-right Favorite Toggle */}
                    {onToggleFavorite && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(exercise);
                        }}
                        aria-label={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
                        className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all cursor-pointer ${
                          isFavorite
                            ? 'bg-rose-50/95 dark:bg-rose-500/20 border-rose-200 dark:border-rose-500/40 text-rose-500'
                            : 'bg-white/90 dark:bg-[#0d1410]/80 border-slate-200/70 dark:border-white/15 text-slate-600 dark:text-slate-200 hover:scale-105'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`}
                        />
                      </button>
                    )}

                    {/* 2-frame indicator */}
                    {hasSwap && (
                      <span className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/55 text-white backdrop-blur-xs">
                        2 khung hình
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {mechanicLabel && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                            {mechanicLabel}
                          </span>
                        )}
                        {levelLabel && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100/80 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300">
                            {levelLabel}
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-lime-700 dark:group-hover:text-lime-300 transition-colors">
                        {exercise.name}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                        <Dumbbell className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{equipmentLabel}</span>
                      </p>
                    </div>

                    {/* Card Footer CTA */}
                    <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleTodaySession) {
                            onToggleTodaySession(exercise);
                          } else {
                            onToggleExercise?.(exercise.id);
                          }
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isInSession || isChecked
                            ? 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-100 dark:bg-white/5 hover:bg-[#a3e635] hover:text-slate-950 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {isInSession || isChecked ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Trong buổi tập</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Thêm buổi tập</span>
                          </>
                        )}
                      </button>

                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white flex items-center gap-0.5 pl-1 transition-colors">
                        Chi tiết
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="w-9 h-9 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121a15] text-slate-700 dark:text-slate-200 disabled:opacity-40 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-white dark:bg-[#121a15] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200">
                Trang {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="w-9 h-9 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121a15] text-slate-700 dark:text-slate-200 disabled:opacity-40 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default ExerciseLibraryGrid;
