'use client';

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import toast from '../../../utils/toast';
import { type CalendarStripProps } from '../../../interface';

export default function CalendarStrip({
  currentMonday,
  selectedDate,
  weekDays,
  dayLabelMap,
  isSelectedDateToday,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
  onGoToToday,
  isSameDay,
}: CalendarStripProps) {
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const handleDateClick = (day: Date) => {
    if (day > todayEnd) {
      toast.error('Không thể ghi nhận bữa ăn cho các ngày ở tương lai!');
      return;
    }
    onSelectDate(day);
  };

  const handleNextWeekClick = () => {
    const nextMon = new Date(currentMonday);
    nextMon.setDate(nextMon.getDate() + 7);
    if (nextMon > todayEnd) {
      toast.error('Không thể chuyển tới tuần ở tương lai!');
      return;
    }
    onNextWeek();
  };

  return (
    <section className="bento-card p-4 rounded-3xl border border-bento-border/60">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <h2 className="font-headline-md text-base md:text-lg font-bold text-on-surface">
            Tháng {currentMonday.getMonth() + 1}, {currentMonday.getFullYear()}
          </h2>
          {!isSelectedDateToday && (
            <button
              onClick={onGoToToday}
              className="text-xs px-3 py-1 rounded-full bg-green-light/15 text-green-light font-bold hover:bg-green-light/25 transition-colors border border-green-light/30 flex items-center gap-1.5 cursor-pointer"
            >
              <CalendarIcon size={14} />
              Về Hôm nay
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrevWeek}
            aria-label="Tuần trước"
            className="w-9 h-9 rounded-full bg-surface-bright/30 border border-white/10 text-on-surface hover:bg-surface-bright/60 transition-colors flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleNextWeekClick}
            aria-label="Tuần sau"
            className="w-9 h-9 rounded-full bg-surface-bright/30 border border-white/10 text-on-surface hover:bg-surface-bright/60 transition-colors flex items-center justify-center cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 md:gap-3">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const isFuture = day > todayEnd;
          const dayName = dayLabelMap[day.getDay()];

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDateClick(day)}
              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer relative ${
                isFuture
                  ? 'opacity-30 cursor-not-allowed bg-surface-dim/20 border border-white/5'
                  : isSelected
                  ? 'bg-green-light/20 border-2 border-green-light text-green-light shadow-[0_0_15px_rgba(102,200,28,0.25)] scale-[1.02]'
                  : 'bg-surface-dim/40 border border-white/5 hover:bg-surface-bright/30 opacity-80 hover:opacity-100 text-on-surface'
              }`}
            >
              <span className="font-label-lg text-[11px] md:text-xs font-semibold">
                {isToday ? 'Hôm nay' : dayName}
              </span>
              <span className="font-stats-xl text-lg md:text-2xl font-extrabold mt-0.5">
                {day.getDate()}
              </span>
              {isToday && !isSelected && (
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-light rounded-full shadow-[0_0_8px_rgba(102,200,28,0.8)]"></div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
