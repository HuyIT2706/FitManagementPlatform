/* eslint-disable @next/next/no-img-element */
'use client';

import { X } from 'lucide-react';
import type { ExerciseDetailModalProps } from '../../../interface';

export default function ExerciseDetailModal({
  activeExercise: propActive,
  exercise,
  onClose,
}: ExerciseDetailModalProps) {
  const activeExercise = propActive || exercise;

  if (!activeExercise) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#121620] border border-white/15 rounded-[32px] max-w-2xl w-full max-h-[85vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-6 md:p-8 pb-10 md:pb-12 space-y-6 text-white shadow-[0_25px_70px_rgba(0,0,0,0.85)] relative animate-in zoom-in-95 duration-200 cursor-default"
      >
        {/* Header Close Button */}
        <button
          onClick={onClose}
          aria-label="Đóng bảng chi tiết"
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer z-30"
        >
          <X size={20} />
        </button>

        {/* Title & Metadata Badges */}
        <div className="space-y-3 pr-12">
          <h3 className="font-extrabold text-2xl md:text-3xl text-white font-headline-md tracking-tight">
            {activeExercise.name}
          </h3>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {activeExercise.category && (
              <span className="bg-primary/20 text-primary font-bold px-3.5 py-1 rounded-full border border-primary/40 capitalize">
                {activeExercise.category}
              </span>
            )}
            {activeExercise.level && (
              <span className="bg-white/10 text-white/90 font-medium px-3.5 py-1 rounded-full border border-white/15 capitalize">
                Cấp độ: {activeExercise.level}
              </span>
            )}
            {activeExercise.equipment && (
              <span className="bg-white/10 text-white/90 font-medium px-3.5 py-1 rounded-full border border-white/15 capitalize">
                Dụng cụ: {activeExercise.equipment}
              </span>
            )}
          </div>
        </div>

        {/* Side-by-Side Images (Setup & Start Poses) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Setup Image */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-white/70 px-1">
              <span>Tư thế Chuẩn bị</span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
                SETUP
              </span>
            </div>
            <div className="h-52 rounded-2xl overflow-hidden border border-white/15 bg-black/80 relative shadow-inner">
              <img
                src={
                  activeExercise.setupImageUrl ||
                  activeExercise.startImageUrl ||
                  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'
                }
                alt="Setup Pose"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Start Image */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-primary px-1">
              <span>Tư thế Thực hiện</span>
              <span className="text-[10px] text-primary/60 uppercase tracking-widest font-mono">
                ACTION
              </span>
            </div>
            <div className="h-52 rounded-2xl overflow-hidden border border-primary/40 bg-black/80 relative shadow-[0_0_20px_rgba(102,200,28,0.15)]">
              <img
                src={
                  activeExercise.startImageUrl ||
                  activeExercise.setupImageUrl ||
                  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'
                }
                alt="Start Pose"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Bento Specs Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {activeExercise.primaryMuscles && activeExercise.primaryMuscles.length > 0 && (
            <div className="bg-white/[0.04] border border-white/10 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block">
                Cơ chính tác động
              </span>
              <p className="text-sm font-bold text-primary capitalize">
                {activeExercise.primaryMuscles.join(', ')}
              </p>
            </div>
          )}

          {activeExercise.secondaryMuscles && activeExercise.secondaryMuscles.length > 0 && (
            <div className="bg-white/[0.04] border border-white/10 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block">
                Cơ phụ trợ
              </span>
              <p className="text-sm font-bold text-white/80 capitalize">
                {activeExercise.secondaryMuscles.join(', ')}
              </p>
            </div>
          )}

          {activeExercise.force && (
            <div className="bg-white/[0.04] border border-white/10 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block">
                Lực tác động
              </span>
              <p className="text-sm font-bold text-white capitalize">{activeExercise.force}</p>
            </div>
          )}

          {activeExercise.mechanic && (
            <div className="bg-white/[0.04] border border-white/10 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block">
                Cơ chế chuyển động
              </span>
              <p className="text-sm font-bold text-white capitalize">{activeExercise.mechanic}</p>
            </div>
          )}
        </div>

        {/* Step-by-Step Instructions */}
        {activeExercise.instructions &&
          activeExercise.instructions.filter(
            (step) => !step.toLowerCase().includes('lặp lại số lần')
          ).length > 0 && (
            <div className="space-y-3 pt-2 pb-4">
              <h4 className="font-bold text-xs text-white/80 uppercase tracking-widest px-1">
                Hướng dẫn thực hiện từng bước
              </h4>
              <div className="space-y-2.5">
                {activeExercise.instructions
                  .filter((step) => !step.toLowerCase().includes('lặp lại số lần'))
                  .map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-white/[0.03] border border-white/10 p-3.5 rounded-2xl flex items-start gap-3 text-xs leading-relaxed"
                    >
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary border border-primary/40 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-white/90 font-normal pt-0.5">{step}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
