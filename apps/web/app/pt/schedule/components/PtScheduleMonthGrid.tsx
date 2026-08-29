'use client';

import React from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import type { PTSessionItem } from '@repo/types';
import {
  formatYYYYMMDD,
  isSameDay,
  getCalendarMonthInfo,
  WEEKDAY_NAMES_VI,
} from '../../../../utils/date';
import type { PtScheduleMonthGridProps } from '../../../../interface';

// Aesthetic pastel badge theme colors for different session cards
const PILL_COLOR_THEMES = [
  {
    bg: 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border-purple-500/30',
    dot: 'bg-purple-400',
  },
  {
    bg: 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  {
    bg: 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-400',
  },
  {
    bg: 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border-blue-500/30',
    dot: 'bg-blue-400',
  },
  {
    bg: 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/30',
    dot: 'bg-rose-400',
  },
];

export const PtScheduleMonthGrid: React.FC<PtScheduleMonthGridProps> = ({
  viewDate,
  selectedDate,
  onSelectDate,
  schedules,
  checkedSessions,
  onOpenAddModal,
  onOpenDayDetails,
  filterStudentId,
}) => {
  const today = new Date();
  const monthInfo = getCalendarMonthInfo(viewDate);

  // Group schedules by YYYY-MM-DD
  const scheduleMap = React.useMemo(() => {
    const map: Record<string, PTSessionItem[]> = {};
    schedules.forEach((s) => {
      if (filterStudentId && s.studentId !== filterStudentId) return;
      if (s.scheduledDate) {
        const existing = map[s.scheduledDate] || [];
        existing.push(s);
        map[s.scheduledDate] = existing;
      }
    });
    // Sort each day's sessions by start time
    Object.keys(map).forEach((dateKey) => {
      const list = map[dateKey];
      if (list) {
        list.sort((a, b) => (a.timeSlot || '').localeCompare(b.timeSlot || ''));
      }
    });
    return map;
  }, [schedules, filterStudentId]);

  // Build grid calendar cells (42 cells: 6 weeks * 7 days)
  const calendarCells = React.useMemo(() => {
    const cells: Array<{
      date: Date;
      dayNumber: number;
      isCurrentMonth: boolean;
      dateStr: string;
    }> = [];

    const { year, month, startDayOfWeek, daysInMonth, daysInPrevMonth } = monthInfo;

    // 1. Trailing days from previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const d = new Date(year, month - 1, dayNum);
      cells.push({
        date: d,
        dayNumber: dayNum,
        isCurrentMonth: false,
        dateStr: formatYYYYMMDD(d),
      });
    }

    // 2. Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const currentDate = new Date(year, month, d);
      cells.push({
        date: currentDate,
        dayNumber: d,
        isCurrentMonth: true,
        dateStr: formatYYYYMMDD(currentDate),
      });
    }

    // 3. Leading days of next month to fill full grid (typically 35 or 42 cells)
    const remaining = (7 - (cells.length % 7)) % 7;
    const totalNeeded = cells.length + remaining < 35 ? 35 : cells.length + remaining;
    const neededNext = totalNeeded - cells.length;

    for (let d = 1; d <= neededNext; d++) {
      const nextDate = new Date(year, month + 1, d);
      cells.push({
        date: nextDate,
        dayNumber: d,
        isCurrentMonth: false,
        dateStr: formatYYYYMMDD(nextDate),
      });
    }

    return cells;
  }, [monthInfo]);

  return (
    <section className="bento-card rounded-3xl p-4 md:p-6 border border-white/10 shadow-2xl space-y-4 overflow-hidden">
      {/* Weekday Column Headers */}
      <div className="grid grid-cols-7 gap-1.5 md:gap-2 text-center">
        {WEEKDAY_NAMES_VI.map((name, idx) => (
          <div
            key={name}
            className={`py-2 text-xs md:text-sm font-bold uppercase tracking-wider ${
              idx >= 5 ? 'text-amber-400/80' : 'text-white/60'
            }`}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Monthly Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 md:gap-2">
        {calendarCells.map((cell) => {
          const isToday = isSameDay(cell.date, today);
          const isSelected = isSameDay(cell.date, selectedDate);
          const daySessions = scheduleMap[cell.dateStr] || [];
          const maxVisible = 3;
          const visibleSessions = daySessions.slice(0, maxVisible);
          const extraCount = daySessions.length - maxVisible;

          return (
            <div
              key={cell.dateStr}
              onClick={() => {
                onSelectDate(cell.date);
                if (daySessions.length > 0 && onOpenDayDetails) {
                  onOpenDayDetails(cell.date);
                }
              }}
              className={`min-h-[100px] md:min-h-[125px] p-2 md:p-2.5 rounded-2xl md:rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group relative ${
                isSelected
                  ? 'bg-primary/[0.08] border-primary shadow-[0_0_15px_rgba(102,200,28,0.25)] ring-1 ring-primary/40'
                  : cell.isCurrentMonth
                    ? 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-white/20'
                    : 'bg-black/30 border-white/5 opacity-40 hover:opacity-70'
              } ${isToday && !isSelected ? 'border-primary/50 ring-1 ring-primary/30' : ''}`}
            >
              {/* Day Header: Day Number + Quick Add Button on hover */}
              <div className="flex items-center justify-between">
                <span
                  className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-xs md:text-sm font-extrabold transition-all ${
                    isToday
                      ? 'bg-primary text-dark-slate shadow-[0_0_10px_rgba(102,200,28,0.5)] scale-105'
                      : isSelected
                        ? 'text-primary font-black scale-110'
                        : cell.isCurrentMonth
                          ? 'text-white'
                          : 'text-white/40'
                  }`}
                >
                  {cell.dayNumber}
                </span>

                {/* Quick Add icon on hover for current month */}
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDate(cell.date);
                    onOpenAddModal(cell.date);
                  }}
                  title={`Thêm ca dạy ngày ${cell.dayNumber}`}
                  aria-label={`Thêm ca dạy ngày ${cell.dayNumber}`}
                  className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full bg-white/10 hover:bg-primary hover:text-black text-white/70 flex items-center justify-center transition-all cursor-pointer"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Session Pill Cards inside cell */}
              <div className="space-y-1 my-1 flex-1 overflow-hidden">
                {visibleSessions.map((session, idx) => {
                  const isCheckedIn =
                    session.status === 'CHECKED_IN' || Boolean(checkedSessions[session.id]);
                  const theme = PILL_COLOR_THEMES[idx % PILL_COLOR_THEMES.length] || PILL_COLOR_THEMES[0];
                  const startTime = session.timeSlot
                    ? session.timeSlot.split(' - ')[0]?.trim() || '08:00'
                    : '08:00';

                  return (
                    <div
                      key={session.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDate(cell.date);
                        if (onOpenDayDetails) onOpenDayDetails(cell.date);
                      }}
                      title={`${session.timeSlot} • ${session.studentName} (${session.workoutName})`}
                      className={`px-1.5 py-0.5 md:py-1 rounded-lg md:rounded-xl border text-[10px] md:text-[11px] font-semibold flex items-center gap-1 truncate transition-all shadow-sm ${
                        isCheckedIn
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 line-through opacity-80'
                          : theme?.bg || 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                      }`}
                    >
                      {isCheckedIn ? (
                        <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                      ) : (
                        <span className={`w-1.5 h-1.5 rounded-full ${theme?.dot || 'bg-purple-400'} shrink-0`} />
                      )}
                      <span className="font-bold shrink-0">{startTime}</span>
                      <span className="truncate">{session.studentName || 'Học viên'}</span>
                    </div>
                  );
                })}

                {/* Extra sessions indicator (+N ca nữa) */}
                {extraCount > 0 && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDate(cell.date);
                      if (onOpenDayDetails) onOpenDayDetails(cell.date);
                    }}
                    className="text-[9px] md:text-[10px] font-bold text-primary/90 px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-center truncate hover:bg-primary/20 transition-colors"
                  >
                    +{extraCount} ca nữa
                  </div>
                )}
              </div>

              {/* Bottom active indicator bar if has sessions */}
              {daySessions.length > 0 && (
                <div className="flex items-center gap-1 justify-center pt-0.5">
                  <span className="text-[9px] font-bold text-white/40">
                    {daySessions.length} ca
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend / Status Note below calendar */}
      <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(102,200,28,0.6)]"></span>
            <span>Hôm nay</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
            <span>Ca dạy đã xếp</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>Đã điểm danh</span>
          </div>
        </div>

        <span className="text-[11px] font-medium text-white/40">
          * Nhấp vào ngày bất kỳ để xem chi tiết và điểm danh trừ buổi
        </span>
      </div>
    </section>
  );
};

export default PtScheduleMonthGrid;
