'use client';

import Image from 'next/image';
import { Dumbbell, UserCheck, Flame } from 'lucide-react';
import type { AssignedWorkoutPlanCardProps, ExerciseItem } from '../../../interface';

const AssignedWorkoutPlanCard = ({
  assignedWorkoutPlan,
  onSelectExercise,
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
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-primary/40 shrink-0 bg-primary/20 flex items-center justify-center text-primary font-extrabold relative">
              {coachAvatar ? (
                <Image
                  src={coachAvatar}
                  alt={coachName}
                  width={44}
                  height={44}
                  className="w-full h-full object-cover"
                  unoptimized={coachAvatar.startsWith('data:')}
                />
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
            const imageSrc = ex.setupImageUrl || ex.startImageUrl || (ex as { imageUrl?: string }).imageUrl;

            return (
              <div
                key={ex.id}
                onClick={() => onSelectExercise?.(ex as unknown as ExerciseItem)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between gap-3 bg-surface-bright/30 border-white/5 text-on-surface hover:border-primary/40 hover:bg-surface-bright/50 cursor-pointer group"
              >
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden border border-white/15 shrink-0 bg-surface-bright/80 flex items-center justify-center group-hover:border-primary/40 transition-colors relative">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={ex.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized={imageSrc.startsWith('data:')}
                      />
                    ) : (
                      <Dumbbell size={18} className="text-primary sm:w-5 sm:h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-xs sm:text-sm text-on-surface truncate group-hover:text-primary transition-colors">
                      {ex.name}
                    </h5>
                    <span className="text-[11px] sm:text-xs text-on-surface-variant font-medium">
                      {ex.sets} Set × {ex.reps} Reps
                    </span>
                  </div>
                </div>

                {/* YouTube Icon Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectExercise?.(ex as unknown as ExerciseItem);
                  }}
                  aria-label={`Xem video bài tập ${ex.name}`}
                  title="Xem video & hướng dẫn bài tập"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-600/10 hover:bg-red-600/20 active:scale-95 border border-red-500/20 hover:border-red-500/50 flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 shadow-xs hover:shadow-[0_0_12px_rgba(255,0,0,0.4)] group/yt"
                >
                  <svg
                    viewBox="0 0 28 20"
                    className="w-5 sm:w-6 h-auto group-hover/yt:scale-110 transition-transform drop-shadow-[0_2px_6px_rgba(255,0,0,0.4)]"
                  >
                    <path
                      d="M27.4 3.1c-.3-1.2-1.2-2.1-2.4-2.4C22.9.2 14 .2 14 .2s-8.9 0-11 .5C1.8.9.9 1.9.6 3.1 0 5.2 0 10 0 10s0 4.8.6 6.9c.3 1.2 1.2 2.1 2.4 2.4 2.1.5 11 .5 11 .5s8.9 0 11-.5c1.2-.3 2.1-1.2 2.4-2.4.6-2.1.6-6.9.6-6.9s0-4.8-.6-6.9z"
                      fill="#FF0000"
                    />
                    <polygon points="11.2,14.3 18.5,10 11.2,5.7" fill="#FFFFFF" />
                  </svg>
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
