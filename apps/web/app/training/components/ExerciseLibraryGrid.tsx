/* eslint-disable @next/next/no-img-element */
'use client';

import { Search, X, Check, ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import type { ExerciseLibraryGridProps } from '../../../interface';
import AppLoading from '../../../components/ui/AppLoading';

const MUSCLE_FILTERS: Array<{ id: string; label: string }> = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'cơ bụng', label: 'Cơ bụng' },
  { id: 'cơ ngực', label: 'Cơ ngực' },
  { id: 'cơ vai', label: 'Cơ vai' },
  { id: 'cơ lưng', label: 'Cơ lưng' },
  { id: 'cơ xô', label: 'Cơ xô' },
  { id: 'cơ đùi trước', label: 'Đùi trước' },
  { id: 'cơ đùi sau', label: 'Đùi sau' },
  { id: 'cơ mông', label: 'Cơ mông' },
  { id: 'cơ tay trước', label: 'Tay trước' },
  { id: 'cơ tay sau', label: 'Tay sau' },
  { id: 'bắp chân', label: 'Bắp chân' },
];

export default function ExerciseLibraryGrid({
  exercises,
  totalExercises,
  selectedMuscle,
  searchQuery,
  exerciseLoading,
  currentPage,
  totalPages,
  checkedExercises,
  onMuscleSelect,
  onSearchChange,
  onClearSearch,
  onToggleExercise,
  onSelectExercise,
  onPageChange,
}: ExerciseLibraryGridProps) {
  return (
    <div className="space-y-6">
      {/* Header & Search Bar */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
          <div>
            <h3 className="font-headline-md font-bold text-xl text-on-surface">
              Thư viện bài tập
            </h3>
            <p className="text-sm text-on-surface-variant font-medium mt-0.5">
              {totalExercises} bài tập khả dụng
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Tìm tên bài tập..."
              className="w-full bg-surface-bright/60 border border-outline-variant/40 rounded-xl pl-9 pr-8 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={onClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer"
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Primary Muscles Filter Chips */}
        <div className="space-y-2">
          <div className="text-sm text-on-surface-variant font-semibold px-1 flex items-center gap-1.5">
            <span className="font-bold text-on-surface">Lọc theo nhóm cơ chính:</span>
          </div>
          <div className="flex overflow-x-auto gap-2 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {MUSCLE_FILTERS.map((filter) => {
              const isActive = selectedMuscle === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => onMuscleSelect(filter.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-primary text-dark-slate shadow-[0_0_12px_rgba(102,200,28,0.4)] scale-[1.02]'
                      : 'bg-surface-bright/50 text-on-surface-variant border border-outline-variant/30 hover:bg-surface-bright hover:text-on-surface'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Exercise Grid (Hover Effect: setupImageUrl -> startImageUrl) */}
      <section className="space-y-4">
        {exerciseLoading ? (
          <AppLoading size="md" message="Đang tải thư viện bài tập..." />
        ) : exercises.length === 0 ? (
          <div className="bento-card p-12 text-center rounded-2xl flex flex-col items-center justify-center">
            <SearchX size={44} className="text-on-surface-variant mb-2 opacity-60" />
            <p className="text-on-surface-variant text-base">Không tìm thấy bài tập phù hợp</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {exercises.map((exercise) => {
              const isChecked = Boolean(checkedExercises?.[exercise.id]);
              const setupImg =
                exercise.setupImageUrl ||
                exercise.startImageUrl ||
                'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80';
              const startImg =
                exercise.startImageUrl ||
                exercise.setupImageUrl ||
                'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80';

              return (
                <div
                  key={exercise.id}
                  onClick={() => onSelectExercise(exercise)}
                  className={`group relative h-56 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    isChecked
                      ? 'border-2 border-primary shadow-[0_0_16px_rgba(102,200,28,0.35)]'
                      : 'border border-white/10 hover:border-primary/50'
                  }`}
                >
                  {/* Setup Image (Default) */}
                  <img
                    src={setupImg}
                    alt={`${exercise.name} Setup`}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-0"
                  />

                  {/* Start Image (Hover Effect) */}
                  <img
                    src={startImg}
                    alt={`${exercise.name} Start`}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {exercise.level && (
                        <span className="bg-black/75 backdrop-blur-md text-white/90 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-white/10 capitalize">
                          {exercise.level}
                        </span>
                      )}
                      {exercise.equipment && (
                        <span className="bg-primary/90 text-dark-slate font-bold text-[10px] px-2.5 py-0.5 rounded-full capitalize shadow-[0_0_8px_rgba(102,200,28,0.4)]">
                          {exercise.equipment}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Toggle Completion Checkmark Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleExercise?.(exercise.id);
                    }}
                    aria-label="Đánh dấu hoàn thành"
                    className={`absolute bottom-3 right-3 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-md border cursor-pointer ${
                      isChecked
                        ? 'bg-primary text-dark-slate border-primary shadow-[0_0_12px_rgba(102,200,28,0.7)] scale-105'
                        : 'bg-black/60 border-white/30 text-white hover:border-primary hover:text-primary'
                    }`}
                  >
                    <Check size={20} className={isChecked ? 'stroke-[3]' : ''} />
                  </button>

                  {/* Card Bottom Solid Overlay Bar */}
                  <div className="absolute bottom-0 inset-x-0 p-3.5 bg-black/85 backdrop-blur-md border-t border-white/10 pointer-events-none pr-14 flex flex-col justify-end">
                    <h4 className="font-bold text-white text-base leading-snug font-headline-md line-clamp-1">
                      {exercise.name}
                    </h4>

                    {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-primary font-semibold mt-0.5">
                        <span className="line-clamp-1 capitalize">
                          {exercise.primaryMuscles.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 px-1">
            <span className="text-xs text-on-surface-variant font-medium">
              Trang {currentPage} / {totalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-surface-bright/40 border border-white/10 text-xs font-semibold text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-bright transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={16} />
                Trước
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
                  .map((pg) => (
                    <button
                      key={pg}
                      onClick={() => onPageChange(pg)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currentPage === pg
                          ? 'bg-primary text-dark-slate shadow-[0_0_8px_rgba(102,200,28,0.4)]'
                          : 'bg-surface-bright/30 text-on-surface-variant hover:bg-surface-bright hover:text-on-surface'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
              </div>

              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg bg-surface-bright/40 border border-white/10 text-xs font-semibold text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-bright transition-colors flex items-center gap-1 cursor-pointer"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
