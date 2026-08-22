'use client';

import { useState, useEffect } from 'react';
import {
  Clock,
  Dumbbell,
  User,
  PlusCircle,
  X,
  ChevronDown,
  Check,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { PTStudentSummary, PTSessionItem } from '@repo/types';
import { toast } from '../../../../utils/toast';
import { formatYYYYMMDD, formatDisplayDate, getCalendarMonthInfo } from '../../../../utils/date';

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: PTStudentSummary[];
  onAddSession: (newSession: PTSessionItem) => void;
  defaultStartTime?: string;
  defaultDate?: Date;
}

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
    .toString()
    .padStart(2, '0');
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour}:${minute}`;
});

export default function AddScheduleModal({
  isOpen,
  onClose,
  students,
  onAddSession,
  defaultStartTime = '08:00',
  defaultDate = new Date(),
}: AddScheduleModalProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || ''
  );
  const [sessionDate, setSessionDate] = useState<string>(() =>
    formatYYYYMMDD(defaultDate)
  );
  const [startTime, setStartTime] = useState<string>(defaultStartTime);
  const [endTime, setEndTime] = useState<string>('09:00');
  const [workoutName, setWorkoutName] = useState<string>(
    'Tập Lưng & Bụng Cá Nhân Hóa'
  );

  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [isStartDropdownOpen, setIsStartDropdownOpen] = useState(false);
  const [isEndDropdownOpen, setIsEndDropdownOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Calendar navigation state
  const [viewDate, setViewDate] = useState<Date>(() => defaultDate || new Date());

  // Sync initial startTime and sessionDate when opening modal
  useEffect(() => {
    if (isOpen) {
      const initDate = defaultDate || new Date();
      setSessionDate(formatYYYYMMDD(initDate));
      setViewDate(initDate);
      setStartTime(defaultStartTime);
      const startHour = parseInt(defaultStartTime.split(':')[0] || '8', 10);
      const endHourStr = (startHour + 1).toString().padStart(2, '0');
      setEndTime(`${endHourStr}:00`);
    }
  }, [isOpen, defaultStartTime, defaultDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const studentObj = students.find((s) => s.id === selectedStudentId) ||
      students[0] || {
        id: `st-${Date.now()}`,
        fullName: 'Học viên chọn',
        avatarUrl:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        packageName: 'Gói PT 1:1 VIP',
        remainingSessions: 10,
        totalSessions: 12,
      };

    const newSession: PTSessionItem = {
      id: `session-custom-${Date.now()}`,
      timeSlot: `${startTime} - ${endTime}`,
      studentId: studentObj.id,
      studentName: studentObj.fullName,
      studentAvatar: studentObj.avatarUrl,
      workoutName: workoutName || 'Giáo Án Tập Luyện 1:1',
      status: 'PENDING',
      remainingSessions: studentObj.remainingSessions || 10,
      totalSessions: studentObj.totalSessions || 12,
      scheduledDate: sessionDate,
    };

    onAddSession(newSession);
    toast.success(`Đã thêm ca dạy ngày ${sessionDate} cho ${studentObj.fullName}!`);
    onClose();
  };

  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) || students[0];

  // Calendar calculations from utils/date
  const {
    year,
    month,
    startDayOfWeek,
    daysInMonth,
    daysInPrevMonth,
    monthName,
  } = getCalendarMonthInfo(viewDate);

  const displayDateStr = sessionDate
    ? formatDisplayDate(new Date(sessionDate + 'T00:00:00'))
    : 'Chọn ngày';

  const todayISO = formatYYYYMMDD(new Date());

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (d: number) => {
    const selectedMonth = (month + 1).toString().padStart(2, '0');
    const selectedDay = d.toString().padStart(2, '0');
    setSessionDate(`${year}-${selectedMonth}-${selectedDay}`);
    setIsDatePickerOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    const iso = formatYYYYMMDD(today);
    setSessionDate(iso);
    setViewDate(today);
    setIsDatePickerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#12161f] border border-outline-variant/30 w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.9)] relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30">
              <PlusCircle size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Thêm Ca Dạy Mới</h3>
              <p className="text-xs text-on-surface-variant">
                Tùy chọn thời gian & xếp lịch dạy học viên
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Custom Date Picker */}
          <div className="relative space-y-1.5">
            <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <Calendar size={14} className="text-primary" />
              Chọn Ngày Dạy
            </label>

            <button
              type="button"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="w-full bg-surface-bright/50 border border-white/10 hover:border-primary/50 rounded-xl px-3.5 py-2.5 text-sm font-extrabold text-primary flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>{displayDateStr}</span>
              <ChevronDown
                size={16}
                className={`text-on-surface-variant transition-transform duration-200 ${
                  isDatePickerOpen ? 'rotate-180 text-primary' : ''
                }`}
              />
            </button>

            {isDatePickerOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDatePickerOpen(false)}
                ></div>

                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#181d26] border border-primary/30 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.9)] p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-extrabold text-white">
                      {monthName}, {year}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-white transition-colors cursor-pointer"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-white transition-colors cursor-pointer"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Days Grid */}
                  <div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                      {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((dayName) => (
                        <span key={dayName} className="text-[11px] font-extrabold text-primary/70">
                          {dayName}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                      {/* Prev Month Padding */}
                      {Array.from({ length: startDayOfWeek }).map((_, i) => {
                        const dayNum = daysInPrevMonth - startDayOfWeek + i + 1;
                        return (
                          <span
                            key={`prev-${i}`}
                            className="py-1.5 text-xs text-white/20 font-medium select-none"
                          >
                            {dayNum}
                          </span>
                        );
                      })}

                      {/* Current Month Days */}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const d = i + 1;
                        const monthStr = (month + 1).toString().padStart(2, '0');
                        const dayStr = d.toString().padStart(2, '0');
                        const cellISO = `${year}-${monthStr}-${dayStr}`;

                        const isSelected = cellISO === sessionDate;
                        const isToday = cellISO === todayISO;

                        return (
                          <button
                            key={`day-${d}`}
                            type="button"
                            onClick={() => handleSelectDay(d)}
                            className={`py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-primary text-dark-slate font-extrabold shadow-[0_0_10px_rgba(102,200,28,0.4)]'
                                : isToday
                                  ? 'border border-primary text-primary font-bold bg-primary/10'
                                  : 'text-white font-semibold hover:bg-white/10'
                            }`}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Today Quick Action */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleToday}
                      className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      Hôm nay
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Custom Select Student */}
          <div className="relative space-y-1.5">
            <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <User size={14} className="text-primary" />
              Chọn Học Viên
            </label>

            {students.length > 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                  className="w-full bg-surface-bright/50 border border-white/10 hover:border-primary/50 rounded-xl px-3.5 py-2.5 text-sm font-bold text-on-surface flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-extrabold text-white truncate">
                      {selectedStudent ? selectedStudent.fullName : 'Học viên'}
                    </span>
                    {selectedStudent && (
                      <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 shrink-0">
                        Còn {selectedStudent.remainingSessions}/{selectedStudent.totalSessions} buổi
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-on-surface-variant transition-transform duration-200 shrink-0 ${
                      isStudentDropdownOpen ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>

                {isStudentDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsStudentDropdownOpen(false)}
                    ></div>

                    <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#181d26] border border-primary/30 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.9)] max-h-56 overflow-y-auto p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                      {students.map((st) => {
                        const isSelected = st.id === (selectedStudentId || students[0]?.id);
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => {
                              setSelectedStudentId(st.id);
                              setIsStudentDropdownOpen(false);
                            }}
                            className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-primary text-dark-slate shadow-[0_0_12px_rgba(102,200,28,0.4)]'
                                : 'text-on-surface hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="font-extrabold">{st.fullName}</span>
                              <span
                                className={`text-[10px] opacity-80 ${
                                  isSelected ? 'text-dark-slate font-extrabold' : 'text-primary'
                                }`}
                              >
                                ({st.packageName})
                              </span>
                            </div>

                            <span className="text-[10px] font-extrabold shrink-0">
                              {st.remainingSessions}/{st.totalSessions} buổi
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400 font-medium">
                Chưa có danh sách học viên liên kết. Bạn vẫn có thể nhập thông tin bên dưới.
              </div>
            )}
          </div>

          {/* Time Picker Row with Custom Dark Dropdowns */}
          <div className="grid grid-cols-2 gap-3">
            {/* Giờ bắt đầu */}
            <div className="relative space-y-1.5">
              <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <Clock size={14} className="text-primary" />
                Giờ bắt đầu
              </label>

              <button
                type="button"
                onClick={() => setIsStartDropdownOpen(!isStartDropdownOpen)}
                className="w-full bg-surface-bright/50 border border-white/10 hover:border-primary/50 rounded-xl px-3.5 py-2.5 text-sm font-extrabold text-primary flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>{startTime}</span>
                <ChevronDown
                  size={16}
                  className={`text-on-surface-variant transition-transform duration-200 ${
                    isStartDropdownOpen ? 'rotate-180 text-primary' : ''
                  }`}
                />
              </button>

              {isStartDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsStartDropdownOpen(false)}
                  ></div>

                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#181d26] border border-primary/30 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.9)] max-h-52 overflow-y-auto p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                    {TIME_OPTIONS.map((time) => {
                      const isSelected = time === startTime;
                      return (
                        <button
                          key={`start-${time}`}
                          type="button"
                          onClick={() => {
                            setStartTime(time);
                            setIsStartDropdownOpen(false);
                          }}
                          className={`w-full px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-primary text-dark-slate shadow-[0_0_12px_rgba(102,200,28,0.4)]'
                              : 'text-on-surface hover:bg-white/10 hover:text-primary'
                          }`}
                        >
                          <span>{time}</span>
                          {isSelected && <Check size={14} className="stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Giờ kết thúc */}
            <div className="relative space-y-1.5">
              <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <Clock size={14} className="text-primary" />
                Giờ kết thúc
              </label>

              <button
                type="button"
                onClick={() => setIsEndDropdownOpen(!isEndDropdownOpen)}
                className="w-full bg-surface-bright/50 border border-white/10 hover:border-primary/50 rounded-xl px-3.5 py-2.5 text-sm font-extrabold text-primary flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>{endTime}</span>
                <ChevronDown
                  size={16}
                  className={`text-on-surface-variant transition-transform duration-200 ${
                    isEndDropdownOpen ? 'rotate-180 text-primary' : ''
                  }`}
                />
              </button>

              {isEndDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsEndDropdownOpen(false)}
                  ></div>

                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#181d26] border border-primary/30 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.9)] max-h-52 overflow-y-auto p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                    {TIME_OPTIONS.map((time) => {
                      const isSelected = time === endTime;
                      return (
                        <button
                          key={`end-${time}`}
                          type="button"
                          onClick={() => {
                            setEndTime(time);
                            setIsEndDropdownOpen(false);
                          }}
                          className={`w-full px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-primary text-dark-slate shadow-[0_0_12px_rgba(102,200,28,0.4)]'
                              : 'text-on-surface hover:bg-white/10 hover:text-primary'
                          }`}
                        >
                          <span>{time}</span>
                          {isSelected && <Check size={14} className="stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Workout Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <Dumbbell size={14} className="text-primary" />
              Tên giáo án / Nội dung tập
            </label>
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="Ví dụ: Tập Lưng & Bụng Cá Nhân Hóa"
              className="w-full bg-surface-bright/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-bold text-on-surface placeholder:text-white/30 focus:border-primary outline-none transition-colors"
              required
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-on-surface-variant hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary text-dark-slate font-extrabold text-xs shadow-[0_0_15px_rgba(102,200,28,0.4)] hover:bg-primary/90 transition-all cursor-pointer"
            >
              Xác Nhận Thêm Ca Dạy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
