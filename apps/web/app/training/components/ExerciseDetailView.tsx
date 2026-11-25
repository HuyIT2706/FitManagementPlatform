/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Heart,
  Layers,
  Plus,
  Share2,
  Target,
  Timer,
} from 'lucide-react';
import toast from '../../../utils/toast';
import type { ExerciseItem } from '../../../interface';
import {
  buildExerciseOverview,
  cleanInstructionSteps,
  formatEquipmentLabel,
  formatLevelLabel,
  formatMechanicLabel,
  formatMuscleLabel,
  formatMuscleList,
  getGoalPrescription,
} from '../../../utils/exerciseHelpers';
import {
  WORKOUT_SESSION_UPDATED_EVENT,
  isExerciseInTodaySession,
  isFavoriteExercise,
  toggleExerciseInTodaySession,
  toggleFavoriteExercise,
} from '../../../utils/workoutSession';
import ExerciseMediaPlayer, { type ExerciseMediaMode } from './ExerciseMediaPlayer';
import MuscleAnatomyDiagram from './MuscleAnatomyDiagram';

interface ExerciseDetailViewProps {
  exercise: ExerciseItem;
  similarExercises?: ExerciseItem[];
  userGoal?: string | null;
  assignedSets?: number | null;
  assignedReps?: number | null;
  isModal?: boolean;
  onBack: () => void;
  onSelectSimilar?: (exercise: ExerciseItem) => void;
}

const DEFAULT_THUMBNAIL =
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80';

const MEDIA_MODES: Array<{ id: ExerciseMediaMode; label: string; badge?: string }> = [
  { id: 'video', label: 'Video', badge: 'thêm' },
  { id: 'animation', label: 'Hoạt ảnh' },
  { id: 'frames', label: 'Đầu / Cuối' },
];

const ExerciseDetailView = ({
  exercise,
  similarExercises = [],
  userGoal,
  assignedSets,
  assignedReps,
  isModal = false,
  onBack,
  onSelectSimilar,
}: ExerciseDetailViewProps) => {
  const [mediaMode, setMediaMode] = useState<ExerciseMediaMode>('animation');
  const [isFavorite, setIsFavorite] = useState<boolean>(() =>
    isFavoriteExercise(exercise.id),
  );
  const [inTodaySession, setInTodaySession] = useState<boolean>(() =>
    isExerciseInTodaySession(exercise.id),
  );
  const similarScrollRef = useRef<HTMLDivElement>(null);

  const scrollSimilar = (direction: -1 | 1) => {
    similarScrollRef.current?.scrollBy({
      left: direction * 240,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const syncState = () => {
      setIsFavorite(isFavoriteExercise(exercise.id));
      setInTodaySession(isExerciseInTodaySession(exercise.id));
    };
    window.addEventListener(WORKOUT_SESSION_UPDATED_EVENT, syncState);
    return () => window.removeEventListener(WORKOUT_SESSION_UPDATED_EVENT, syncState);
  }, [exercise.id]);

  const primaryLabel = formatMuscleLabel(exercise.primaryMuscles?.[0] || '');
  const mechanicLabel = formatMechanicLabel(exercise.mechanic);
  const levelLabel = formatLevelLabel(exercise.level);
  const equipmentLabel = formatEquipmentLabel(exercise.equipment);
  const primaryList = formatMuscleList(exercise.primaryMuscles) || 'Toàn thân';
  const secondaryList = formatMuscleList(exercise.secondaryMuscles);
  const overview = useMemo(() => buildExerciseOverview(exercise), [exercise]);
  const prescription = useMemo(
    () => getGoalPrescription(exercise, userGoal, assignedSets, assignedReps),
    [exercise, userGoal, assignedSets, assignedReps],
  );
  const steps = useMemo(
    () => cleanInstructionSteps(exercise.instructions),
    [exercise.instructions],
  );

  const handleToggleFavorite = () => {
    const next = toggleFavoriteExercise(exercise);
    setIsFavorite(next);
    toast.success(next ? 'Đã lưu vào bài tập yêu thích' : 'Đã bỏ khỏi yêu thích');
  };

  const handleToggleSession = () => {
    const { added } = toggleExerciseInTodaySession(exercise);
    setInTodaySession(added);
    toast.success(
      added
        ? `Đã thêm "${exercise.name}" vào buổi tập hôm nay`
        : `Đã gỡ "${exercise.name}" khỏi buổi tập hôm nay`,
    );
  };

  const handleShare = async () => {
    const shareUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/training/${encodeURIComponent(exercise.id)}`
        : '';
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: exercise.name,
          text: `Hướng dẫn bài tập ${exercise.name} trên NutriCore`,
          url: shareUrl,
        });
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard && shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Đã sao chép liên kết bài tập');
        return;
      }
      toast.success('Sẵn sàng chia sẻ bài tập');
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        toast.error('Không thể chia sẻ lúc này');
      }
    }
  };

  return (
    <div className="min-h-full bg-[#f5f7f6] dark:bg-[#090d0b] text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Sticky Navigation Bar */}
      <header
        className={`${
          isModal ? 'sticky top-0' : 'sticky top-0'
        } z-30 bg-white/90 dark:bg-[#0d1410]/90 backdrop-blur-md border-b border-slate-200/70 dark:border-white/10`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Quay lại"
            className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate text-center">
            {exercise.name}
          </p>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              aria-label="Chia sẻ bài tập"
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-xs transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleToggleFavorite}
              aria-label={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
              className={`w-10 h-10 rounded-full border flex items-center justify-center shadow-xs transition-all cursor-pointer ${
                isFavorite
                  ? 'border-rose-200 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/15 text-rose-500'
                  : 'border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-7 pb-28">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
          {/* Left Sticky Media Column */}
          <div className="lg:col-span-6 lg:sticky lg:top-22">
            <ExerciseMediaPlayer
              name={exercise.name}
              setupImageUrl={exercise.setupImageUrl}
              startImageUrl={exercise.startImageUrl}
              mode={mediaMode}
            />
          </div>

          {/* Right Details Column */}
          <div className="lg:col-span-6 space-y-5 mt-5 lg:mt-0">
            {/* Segmented Mode Control */}
            <div className="p-1 rounded-full bg-slate-200/70 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 grid grid-cols-3 gap-1">
              {MEDIA_MODES.map((item) => {
                const active = mediaMode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMediaMode(item.id)}
                    className={`py-2 px-3 rounded-full text-xs sm:text-sm transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      active
                        ? 'bg-white dark:bg-[#1a261f] text-slate-900 dark:text-white font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] opacity-60 font-normal">
                        · {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tag Pills + Title + Description */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                {primaryLabel && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#ecfccb] text-[#3f6212] dark:bg-lime-500/20 dark:text-lime-300">
                    {primaryLabel}
                  </span>
                )}
                {mechanicLabel && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-200/80 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                    {mechanicLabel}
                  </span>
                )}
                {levelLabel && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                    {levelLabel}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {exercise.name}
              </h1>

              <p className="text-sm sm:text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                {overview}
              </p>
            </div>

            {/* 3 Summary Info Cards + Goal Caption */}
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                <div className="bg-white dark:bg-[#121a15] rounded-2xl border border-slate-200/80 dark:border-white/10 p-3 sm:p-4 shadow-2xs">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-2.5">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Dụng cụ
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                    {equipmentLabel}
                  </p>
                </div>

                <div className="bg-white dark:bg-[#121a15] rounded-2xl border border-slate-200/80 dark:border-white/10 p-3 sm:p-4 shadow-2xs">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5">
                    <Layers className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Theo mục tiêu
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                    {prescription.setsReps}
                  </p>
                </div>

                <div className="bg-white dark:bg-[#121a15] rounded-2xl border border-slate-200/80 dark:border-white/10 p-3 sm:p-4 shadow-2xs">
                  <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-2.5">
                    <Timer className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Nghỉ
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                    {prescription.restLabel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pl-0.5">
                <Target className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
                <span>{prescription.goalCaption}</span>
              </div>
            </div>

            {/* Muscle Anatomy Card */}
            <section className="bg-white dark:bg-[#121a15] rounded-3xl border border-slate-200/80 dark:border-white/10 p-4 sm:p-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <MuscleAnatomyDiagram
                  primaryMuscles={exercise.primaryMuscles}
                  secondaryMuscles={exercise.secondaryMuscles}
                />

                <div className="flex-1 min-w-0 space-y-3">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                    Nhóm cơ tác động
                  </h2>

                  <div className="space-y-2.5">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#9fe81e] shrink-0" />
                        <span>Chính</span>
                      </div>
                      <p className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white mt-0.5 pl-4">
                        {primaryList}
                      </p>
                    </div>

                    {secondaryList && (
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#d3f88f] border border-lime-500/30 shrink-0" />
                          <span>Phụ</span>
                        </div>
                        <p className="text-sm sm:text-[15px] font-bold text-slate-800 dark:text-slate-200 mt-0.5 pl-4">
                          {secondaryList}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Step-by-step Instructions Card */}
            <section className="bg-white dark:bg-[#121a15] rounded-3xl border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  Cách thực hiện
                </h2>
                {steps.length > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                    {steps.length} bước
                  </span>
                )}
              </div>

              {steps.length > 0 ? (
                <ol className="space-y-3.5">
                  {steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3.5">
                      <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-lime-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-sm sm:text-[15px] leading-relaxed text-slate-700 dark:text-slate-200">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Thực hiện chậm rãi theo 2 khung hình minh họa Bắt đầu và Kết thúc, giữ ổn định trục thân người.
                </p>
              )}
            </section>

            {/* Similar Exercises Strip */}
            {similarExercises.length > 0 && (
              <section className="space-y-3 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                      Bài tập tương tự
                    </h2>
                    <span className="hidden sm:inline-block text-xs font-medium text-slate-500 dark:text-slate-400">
                      • Cùng nhóm cơ
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => scrollSimilar(-1)}
                      aria-label="Xem bài tập trước"
                      className="w-7 h-7 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollSimilar(1)}
                      aria-label="Xem bài tập tiếp theo"
                      className="w-7 h-7 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div
                  ref={similarScrollRef}
                  className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                  {similarExercises.map((sim) => {
                    const thumb =
                      sim.setupImageUrl || sim.startImageUrl || DEFAULT_THUMBNAIL;
                    const simMuscle = formatMuscleLabel(
                      sim.primaryMuscles?.[0] || sim.category || '',
                    );
                    const simEquip = formatEquipmentLabel(sim.equipment);

                    return (
                      <button
                        key={sim.id}
                        type="button"
                        onClick={() => onSelectSimilar?.(sim)}
                        className="w-44 sm:w-48 shrink-0 snap-start rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#121a15] overflow-hidden hover:border-[#84cc16] dark:hover:border-lime-400/50 transition-all text-left group cursor-pointer shadow-2xs"
                      >
                        <div className="aspect-[4/3] w-full bg-slate-100 dark:bg-black/30 overflow-hidden relative">
                          <img
                            src={thumb}
                            alt={sim.name}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_THUMBNAIL;
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-3 space-y-1">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-lime-700 dark:group-hover:text-lime-300 transition-colors">
                            {sim.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {[simMuscle, simEquip].filter(Boolean).join(' • ')}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Sticky CTA Bar */}
      <div
        className={`${
          isModal ? 'sticky bottom-0' : 'fixed bottom-0 inset-x-0'
        } z-30 bg-white/95 dark:bg-[#0d1410]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-white/10`}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-label={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
            className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              isFavorite
                ? 'border-rose-200 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/15 text-rose-500'
                : 'border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleToggleSession}
            className={`flex-1 h-12 rounded-full font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              inTodaySession
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-[#a3e635] hover:bg-[#93d626] text-slate-950 shadow-lime-500/20'
            }`}
          >
            {inTodaySession ? (
              <>
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>Đã thêm vào buổi tập hôm nay</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span>Thêm vào buổi tập</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetailView;
