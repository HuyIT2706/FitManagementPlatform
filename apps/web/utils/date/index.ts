// Formats Date as YYYY-MM-DD
export const formatYYYYMMDD = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Gets the Monday of the current week
export const getMonday = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

// Checks if two dates are on the same calendar day
export const isSameDay = (d1: Date, d2: Date): boolean => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

// Formats display date in Vietnamese
export const formatDisplayDate = (d: Date): string => {
  return `Ngày ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

// Gets array of 7 dates starting from given Monday
export const getWeekDays = (monday: Date): Date[] => {
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return day;
  });
};

export const WEEKDAY_NAMES_VI = [
  'Thứ 2',
  'Thứ 3',
  'Thứ 4',
  'Thứ 5',
  'Thứ 6',
  'Thứ 7',
  'Chủ nhật',
];

export const WEEKDAY_SHORT_NAMES_VI = [
  'T2',
  'T3',
  'T4',
  'T5',
  'T6',
  'T7',
  'CN',
];

export const MONTH_NAMES_VI = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];

export interface CalendarMonthInfo {
  year: number;
  month: number;
  startDayOfWeek: number;
  daysInMonth: number;
  daysInPrevMonth: number;
  monthName: string;
}

export const getCalendarMonthInfo = (viewDate: Date): CalendarMonthInfo => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const monthName = MONTH_NAMES_VI[month] || `Tháng ${month + 1}`;

  return {
    year,
    month,
    startDayOfWeek,
    daysInMonth,
    daysInPrevMonth,
    monthName,
  };
};
