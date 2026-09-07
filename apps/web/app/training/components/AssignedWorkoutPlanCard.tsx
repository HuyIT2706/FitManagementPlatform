/* eslint-disable @next/next/no-img-element */
'use client';

import { Dumbbell, CheckCircle2, UserCheck, Flame } from 'lucide-react';
import type { AssignedWorkoutPlanCardProps } from '../../../interface';

const AssignedWorkoutPlanCard = ({
  assignedWorkoutPlan,
  checkedExercises,
  onToggleExerciseCheck,
}: AssignedWorkoutPlanCardProps) => {
  if (!assignedWorkoutPlan || assignedWorkoutPlan.exercises.length === 0) {
    return null;
  }

  const { coachName, coachAvatar, scheduleTitle, note, exercises } = assignedWorkoutPlan;

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-headline-md font-bold text-lg sm:text-xl text-on-surface">
          Lịch tập 1:1 do Coach giao
        </h3>
        <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 sm:px-3 py-1 rounded-full border border-primary/30 flex items-center gap-1.5">
          <Flame size={14} />
          {exercises.length} Bài Tập
        </span>
      </div>

      <div className="bento-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-5 border border-primary/30 bg-primary/5">
        {/* PT Coach Banner */}
        <div className="flex items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-primary/40 shrink-0 bg-primary/20 flex items-center justify-center text-primary font-extrabold">
              {coachAvatar ? (
                <img src={coachAvatar} alt={coachName} className="w-full h-full object-cover" />
              ) : (
                <UserCheck size={18} className="sm:w-5 sm:h-5" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-on-surface text-sm sm:text-base">{scheduleTitle}</h4>
              <p className="text-xs text-primary font-medium">{coachName}</p>
            </div>
          </div>
        </div>

        {note && (
          <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-bright/40 p-2.5 sm:p-3 rounded-xl border border-white/5 italic">
            &quot;{note}&quot;
          </p>
        )}

        {/* Exercises List */}
        <div className="space-y-2.5 sm:space-y-3">
          {exercises.map((ex) => {
            const isDone = Boolean(checkedExercises[ex.id]);
            const imageSrc = ex.setupImageUrl || ex.startImageUrl || (ex as { imageUrl?: string }).imageUrl;

            return (
              <div
                key={ex.id}
                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-green-light/10 border-green-light/30 text-green-light'
                    : 'bg-surface-bright/30 border-white/5 text-on-surface hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden border border-white/15 shrink-0 bg-surface-bright/80 flex items-center justify-center">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={ex.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Dumbbell size={18} className="text-primary sm:w-5 sm:h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-xs sm:text-sm text-on-surface truncate">{ex.name}</h5>
                    <span className="text-[11px] sm:text-xs text-on-surface-variant font-medium">
                      {ex.sets} Set × {ex.reps} Reps
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleExerciseCheck(ex.id)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    isDone
                      ? 'bg-green-light text-dark-slate font-bold shadow-[0_0_10px_rgba(102,200,28,0.5)]'
                      : 'bg-surface-bright border border-white/10 text-on-surface-variant hover:text-white'
                  }`}
                >
                  <CheckCircle2 size={18} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AssignedWorkoutPlanCard;
