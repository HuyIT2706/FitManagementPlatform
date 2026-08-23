'use client';

import { getWeekDays, isSameDay } from '../../../../utils/date';

interface PtScheduleWeekStripProps {
  currentMonday: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  activeSessionsCount?: number;
}

const PtScheduleWeekStrip = ({
  currentMonday,
  selectedDate,
  onSelectDate,
  activeSessionsCount = 0,
}: PtScheduleWeekStripProps) => {
  const weekDays = getWeekDays(currentMonday);
  const dayNamesMap = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const selectedDayName = dayNamesMap[selectedDate.getDay()];

  return (
    <section className="bento-card rounded-3xl p-4 md:p-6 border border-outline-variant/30 space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base font-bold text-on-surface">
          {selectedDayName}, Ngày {selectedDate.getDate()}/{selectedDate.getMonth() + 1}/
          {selectedDate.getFullYear()}
        </h3>
        <span className="text-xs font-semibold text-primary">
          {activeSessionsCount > 0 ? `${activeSessionsCount} ca dạy đã đăng ký` : 'Chưa có ca dạy'}
        </span>
      </div>

      {/* Weekday Chips */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const label = (dayNamesMap[day.getDay()] || '')
            .replace('Thứ ', 'T')
            .replace('Chủ Nhật', 'CN');

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDate(day)}
              className={`flex flex-col items-center justify-center py-3 rounded-2xl transition-all cursor-pointer ${
                isSelected
                  ? 'bg-primary text-dark-slate font-extrabold shadow-[0_0_12px_rgba(102,200,28,0.4)] scale-105'
                  : isToday
                    ? 'border-2 border-primary text-primary font-bold bg-primary/10'
                    : 'bg-surface-bright/30 border border-white/5 text-on-surface-variant hover:bg-surface-bright hover:text-on-surface font-medium'
              }`}
            >
              <span className="text-[11px] font-semibold">{label}</span>
              <span className="text-sm font-extrabold mt-0.5">{day.getDate()}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default PtScheduleWeekStrip;
