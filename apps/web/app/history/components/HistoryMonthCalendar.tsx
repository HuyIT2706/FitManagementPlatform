'use client';

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import type { HistoryMonthCalendarProps } from '../../../interface';

export default function HistoryMonthCalendar({
  currentMonth,
  selectedDate,
  monthCells,
  loggedDates,
  monthNames,
  isSelectedDateToday,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  onGoToToday,
  isSameDay,
}: HistoryMonthCalendarProps) {
  const isLoggedDate = (cellDate: Date) => {
    const yyyy = cellDate.getFullYear();
    const mm = String(cellDate.getMonth() + 1).padStart(2, '0');
    const dd = String(cellDate.getDate()).padStart(2, '0');
    const key = `${yyyy}-${mm}-${dd}`;
    return loggedDates.includes(key);
  };

  return (
    <section className="md:col-span-4 bento-card rounded-3xl p-6 flex flex-col justify-between border border-outline-variant/30">
      <div>
        {/* Month Header Navigation */}
        <div className="flex items-center justify-between mb-5 px-1">
          <h3 className="text-base font-headline-md font-bold text-on-surface">
            {monthNames[currentMonth.getMonth()]}, {currentMonth.getFullYear()}
          </h3>

          <div className="flex items-center gap-1">
            <button
              onClick={onPrevMonth}
              aria-label="Tháng trước"
              className="w-8 h-8 rounded-full bg-surface-bright/30 border border-white/10 text-on-surface hover:bg-surface-bright transition-colors flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={onNextMonth}
              aria-label="Tháng sau"
              className="w-8 h-8 rounded-full bg-surface-bright/30 border border-white/10 text-on-surface hover:bg-surface-bright transition-colors flex items-center justify-center cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Weekday Labels (T2 .. CN) */}
        <div className="grid grid-cols-7 gap-y-3 text-center mb-2">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
            <span key={day} className="text-[11px] font-bold text-on-surface-variant/50">
              {day}
            </span>
          ))}
        </div>

        {/* Round Circular Dates Grid (rounded-full) */}
        <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
          {monthCells.map((cell, idx) => {
            const isSelected = isSameDay(cell.date, selectedDate);
            const isToday = isSameDay(cell.date, new Date());
            const hasLog = cell.isCurrentMonth && isLoggedDate(cell.date);

            return (
              <div key={idx} className="flex items-center justify-center">
                <button
                  onClick={() => onSelectDate(cell.date)}
                  className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex flex-col items-center justify-center text-xs transition-all duration-200 cursor-pointer relative ${
                    isSelected
                      ? 'bg-green-light text-dark-slate font-extrabold shadow-[0_0_15px_rgba(102,200,28,0.4)] scale-105'
                      : isToday
                      ? 'border-2 border-green-light text-green-light font-bold'
                      : cell.isCurrentMonth
                      ? 'text-on-surface hover:bg-surface-bright/50 font-medium'
                      : 'text-on-surface-variant/30 hover:bg-surface-bright/20'
                  }`}
                >
                  <span>{cell.dayNumber}</span>
                  {hasLog && !isSelected && (
                    <span className="w-1 h-1 bg-green-light rounded-full absolute bottom-0.5 shadow-[0_0_4px_rgba(102,200,28,0.8)]"></span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {!isSelectedDateToday && (
        <button
          onClick={onGoToToday}
          className="mt-4 w-full py-2 rounded-xl bg-green-light/15 text-green-light font-bold text-xs hover:bg-green-light/25 transition-colors border border-green-light/30 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <CalendarIcon size={14} />
          Xem Hôm nay
        </button>
      )}
    </section>
  );
}
