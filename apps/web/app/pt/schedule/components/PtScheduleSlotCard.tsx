/* eslint-disable @next/next/no-img-element */
'use client';

import { Clock, Dumbbell, CheckCircle2, PlusCircle } from 'lucide-react';

export interface ScheduleSlot {
  id: string;
  startTime: string;
  endTime: string;
  studentName?: string;
  studentAvatar?: string;
  packageName?: string;
  sessionNumber?: string;
  workoutName?: string;
  exercisesCount?: number;
  status?: 'ONGOING' | 'UPCOMING' | 'COMPLETED';
  isBusy: boolean;
}

interface PtScheduleSlotCardProps {
  slot: ScheduleSlot;
  isChecked: boolean;
  onCheckIn: (slotId: string) => void;
}

export default function PtScheduleSlotCard({
  slot,
  isChecked,
  onCheckIn,
}: PtScheduleSlotCardProps) {
  const avatar =
    slot.studentAvatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="relative group">
      {/* Timeline Glowing Bullet Dot */}
      <div
        className={`absolute -left-[31px] md:-left-[39px] top-4 w-4 h-4 rounded-full border-2 transition-all ${
          slot.isBusy
            ? 'border-primary bg-primary shadow-[0_0_10px_rgba(102,200,28,0.8)]'
            : 'border-outline-variant bg-background'
        }`}
      ></div>

      {/* Slot Content */}
      {slot.isBusy ? (
        /* Busy Class Session Card */
        <div
          className={`bento-card rounded-2xl p-5 md:p-6 border-l-4 transition-all duration-300 space-y-4 ${
            isChecked
              ? 'border-l-green-light border-green-light/40 bg-green-light/10'
              : slot.status === 'ONGOING'
                ? 'border-l-primary border-primary/50 bg-primary/10 shadow-[0_0_20px_rgba(102,200,28,0.15)]'
                : 'border-l-blue-400 border-white/10 bg-surface-bright/30'
          }`}
        >
          {/* Top Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden border border-white/10 shrink-0">
                <img src={avatar} alt={slot.studentName} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-on-surface text-base">{slot.studentName}</h4>
                  <span className="text-[11px] font-semibold text-primary/90 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    {slot.packageName}
                  </span>
                </div>
                <span className="text-xs text-on-surface-variant font-medium">
                  {slot.sessionNumber}
                </span>
              </div>
            </div>

            {/* Status Tag */}
            <div className="flex items-center gap-2">
              {slot.status === 'ONGOING' && (
                <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/40 flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Đang diễn ra
                </span>
              )}
              {slot.status === 'UPCOMING' && (
                <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/40 flex items-center gap-1.5">
                  <Clock size={14} />
                  Sắp diễn ra
                </span>
              )}
            </div>
          </div>

          {/* Workout Class Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-surface-bright/40 p-3 rounded-xl border border-white/5 flex items-center gap-2.5">
              <Clock size={18} className="text-primary shrink-0" />
              <div>
                <span className="text-on-surface-variant block text-[10px]">Thang thời gian ca</span>
                <strong className="text-on-surface text-sm">
                  {slot.startTime} - {slot.endTime}
                </strong>
              </div>
            </div>

            <div className="bg-surface-bright/40 p-3 rounded-xl border border-white/5 flex items-center gap-2.5">
              <Dumbbell size={18} className="text-primary shrink-0" />
              <div>
                <span className="text-on-surface-variant block text-[10px]">Giáo án tập luyện</span>
                <strong className="text-on-surface text-sm">{slot.workoutName}</strong>
              </div>
            </div>
          </div>

          {/* Card Action Footer */}
          <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-on-surface-variant font-medium">
              Giao án bao gồm <strong>{slot.exercisesCount} bài tập</strong>
            </span>

            <button
              type="button"
              onClick={() => onCheckIn(slot.id)}
              disabled={isChecked}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isChecked
                  ? 'bg-surface-bright text-green-light border border-green-light/40 cursor-default'
                  : 'bg-primary text-dark-slate hover:bg-primary/90 shadow-[0_0_12px_rgba(102,200,28,0.3)] active:scale-95'
              }`}
            >
              <CheckCircle2 size={16} className={isChecked ? 'stroke-[2.5]' : ''} />
              {isChecked ? 'Đã điểm danh trừ buổi' : 'Check-in Trừ Buổi'}
            </button>
          </div>
        </div>
      ) : (
        /* Free / Empty Slot Dashed Card */
        <div className="border border-dashed border-white/10 bg-surface-bright/10 p-3.5 rounded-xl flex items-center justify-between text-on-surface-variant/60 hover:border-primary/50 hover:text-primary transition-all cursor-pointer group/slot">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-on-surface-variant/80 min-w-[90px]">
              {slot.startTime} - {slot.endTime}
            </span>
            <span className="text-xs font-medium italic">
              Ca trống — Chưa có lịch dạy học viên
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold group-hover/slot:text-primary">
            <PlusCircle size={16} />
            Thêm ca dạy
          </div>
        </div>
      )}
    </div>
  );
}
