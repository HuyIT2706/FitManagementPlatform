/* eslint-disable @next/next/no-img-element */
'use client';

import { Dumbbell, CheckCircle2, UserCheck, Flame } from 'lucide-react';
import type { AssignedWorkoutPlanCardProps } from '../../../interface';

export default function AssignedWorkoutPlanCard({
  assignedWorkoutPlan,
  checkedExercises,
  onToggleExerciseCheck,
}: AssignedWorkoutPlanCardProps) {
  if (!assignedWorkoutPlan || assignedWorkoutPlan.exercises.length === 0) {
    return null;
  }

  const { coachName, coachAvatar, scheduleTitle, note, exercises } = assignedWorkoutPlan;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-headline-md font-bold text-xl text-on-surface">
          Lịch tập 1:1 do Coach giao
        </h3>
        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/30 flex items-center gap-1.5">
          <Flame size={14} />
          {exercises.length} Bài Tập
        </span>
      </div>

      <div className="bento-card rounded-3xl p-6 space-y-5 border border-primary/30 bg-primary/5">
        {/* PT Coach Banner */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border border-primary/40 shrink-0 bg-primary/20 flex items-center justify-center text-primary font-extrabold">
              {coachAvatar ? (
                <img src={coachAvatar} alt={coachName} className="w-full h-full object-cover" />
              ) : (
                <UserCheck size={20} />
              )}
            </div>
            <div>
              <h4 className="font-bold text-on-surface text-base">{scheduleTitle}</h4>
              <p className="text-xs text-primary font-medium">{coachName}</p>
            </div>
          </div>
        </div>

        {note && (
          <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-bright/40 p-3 rounded-xl border border-white/5 italic">
            &quot;{note}&quot;
          </p>
        )}

        {/* Exercises List */}
        <div className="space-y-3">
          {exercises.map((ex) => {
            const isDone = Boolean(checkedExercises[ex.id]);

            return (
              <div
                key={ex.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-green-light/10 border-green-light/30 text-green-light'
                    : 'bg-surface-bright/30 border-white/5 text-on-surface hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-surface-bright border border-white/10 flex items-center justify-center shrink-0">
                    <Dumbbell size={18} className="text-primary" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm">{ex.name}</h5>
                    <span className="text-xs text-on-surface-variant font-medium">
                      {ex.sets} Set × {ex.reps} Reps {ex.weightInKg > 0 ? `• ${ex.weightInKg}kg` : ''}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleExerciseCheck(ex.id)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
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
}
