'use client';

import { Dumbbell, CheckCircle2 } from 'lucide-react';
import type { PTSessionItem } from '@repo/types';
import type { PtScheduleListProps } from '../../../../interface';

const PtScheduleList = ({
  sessions,
  checkedSessions,
  onCheckInSession,
}: PtScheduleListProps) => {
  const sessionList = sessions || [];
  const now = new Date();

  return (
    <section className="space-y-4">
      <h3 className="font-headline-md font-bold text-xl text-on-surface px-1">Lịch dạy hôm nay</h3>

      <div className="space-y-3">
        {sessionList.map((session: PTSessionItem) => {
          const isChecked =
            Boolean(checkedSessions[session.id]) ||
            session.status === 'CHECKED_IN';

          // Check if slot time has passed
          const times = session.timeSlot ? session.timeSlot.split(' - ') : ['08:00', '09:00'];
          const endTimeStr = times[1]?.trim() || '09:00';
          const [endHour, endMin] = endTimeStr.split(':').map(Number);
          const slotEnd = new Date(now);
          slotEnd.setHours(endHour ?? 9, endMin ?? 0, 0, 0);
          const isOverdue = now > slotEnd && !isChecked;

          return (
            <div
              key={session.id}
              className={`bento-card rounded-2xl p-5 border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isChecked
                  ? 'border-green-light/40 bg-green-light/10'
                  : isOverdue
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : 'border-outline-variant/30 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="bg-surface-bright rounded-xl p-3 flex flex-col items-center justify-center min-w-[80px] border border-white/10 text-center">
                  <span className={`text-xs font-bold ${isOverdue ? 'text-amber-400' : 'text-primary'}`}>{session.timeSlot}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-on-surface text-base">{session.studentName}</h4>
                    {isOverdue && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                        Quá giờ
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1.5 font-medium">
                    <Dumbbell size={14} className="text-primary shrink-0" />
                    {session.workoutName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onCheckInSession(session.id)}
                disabled={isChecked}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isChecked
                    ? 'bg-surface-bright text-green-light border border-green-light/40 cursor-default'
                    : 'bg-primary text-dark-slate hover:bg-primary/90 shadow-[0_0_12px_rgba(102,200,28,0.3)] active:scale-95'
                }`}
              >
                <CheckCircle2 size={16} className={isChecked ? 'stroke-[2.5]' : ''} />
                {isChecked ? 'Đã Check-in' : 'Check-in Trừ Buổi'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PtScheduleList;
