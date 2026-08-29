'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Calendar,
  RotateCcw,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  Check,
} from 'lucide-react';
import Header from '../../../components/ui/Header';
import PTBottomNavBar from '../../../components/navigation/PTBottomNavBar';
import AppLoading from '../../../components/ui/AppLoading';
import apiClient from '../../../api/axios';
import type { PTSessionItem } from '@repo/types';
import {
  formatYYYYMMDD,
  isSameDay,
  MONTH_NAMES_VI,
} from '../../../utils/date';
import { toast } from '../../../utils/toast';

import dynamic from 'next/dynamic';
import AccessDenied from '../../../components/ui/AccessDenied';
import PtPendingApproval from '../../../components/ui/PtPendingApproval';
import PtScheduleMonthGrid from './components/PtScheduleMonthGrid';
import type { ScheduleSlot } from '../../../interface';

import { useCurrentUser, usePtDashboard, usePtSchedule } from '../../../hooks/swr';

const AddScheduleModal = dynamic(() => import('./components/AddScheduleModal'), {
  ssr: false,
});
const DaySessionsModal = dynamic(() => import('./components/DaySessionsModal'), {
  ssr: false,
});

const PTSchedulePage = () => {
  const { data: userData, isLoading: userLoading } = useCurrentUser();
  const { data: ptData, isLoading: ptLoading, mutate: mutatePt } = usePtDashboard();

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [viewMonthDate, setViewMonthDate] = useState<Date>(() => new Date());
  const [checkedSessions, setCheckedSessions] = useState<Record<string, boolean>>({});
  const [filterStudentId, setFilterStudentId] = useState<string>('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [addModalDefaultDate, setAddModalDefaultDate] = useState<Date>(new Date());

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStudentDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate schedule query range for Month view (with margin to cover adjacent calendar days)
  const { startQueryStr, endQueryStr } = useMemo(() => {
    const year = viewMonthDate.getFullYear();
    const month = viewMonthDate.getMonth();
    const start = new Date(year, month - 1, 20);
    const end = new Date(year, month + 1, 15);
    return {
      startQueryStr: formatYYYYMMDD(start),
      endQueryStr: formatYYYYMMDD(end),
    };
  }, [viewMonthDate]);

  const { data: dbSchedules, mutate: mutateSchedule } = usePtSchedule(
    startQueryStr,
    endQueryStr
  );

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    window.location.href = '/login';
  };

  const handleCheckIn = (sessionId: string) => {
    setCheckedSessions((prev) => ({ ...prev, [sessionId]: true }));
    apiClient
      .post<{ message?: string }>(`/pt/check-in/${sessionId}`)
      .then((res) => {
        toast.success(res.data.message || 'Đã điểm danh học viên & trừ số buổi thành công!');
        mutateSchedule();
        mutatePt();
      })
      .catch((err) => {
        console.error(err);
        toast.error('Không thể điểm danh học viên!');
      });
  };

  const handlePrevMonth = () => {
    setViewMonthDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setViewMonthDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const handleGoToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setViewMonthDate(today);
  };

  const handleOpenAddModalForDate = (date?: Date) => {
    const target = date || selectedDate;
    setAddModalDefaultDate(target);
    setIsAddModalOpen(true);
  };

  const handleOpenDayDetails = (date: Date) => {
    setSelectedDate(date);
    setIsDayModalOpen(true);
  };

  const handleAddCustomSession = async (newSession: PTSessionItem) => {
    if (!newSession.studentId) return;
    try {
      await apiClient.post('/pt/schedule', {
        studentId: newSession.studentId,
        title: newSession.workoutName || 'Giáo Án Tập Luyện 1:1',
        scheduledDate: newSession.scheduledDate || formatYYYYMMDD(addModalDefaultDate),
        timeSlot: newSession.timeSlot || '08:00 - 09:00',
      });
      toast.success('Đã tạo ca dạy mới thành công!');
      mutateSchedule();
      mutatePt();
    } catch (err) {
      console.error('Lỗi khi lưu ca dạy:', err);
      toast.error('Không thể lưu ca dạy vào hệ thống!');
    }
  };

  const loading =
    userLoading ||
    (userData?.role === 'PT' &&
      userData?.isApprovedPt !== false &&
      ptLoading &&
      !ptData);

  if (loading) {
    return <AppLoading fullScreen size="lg" message="Đang nạp lịch dạy PT..." />;
  }

  if (userData && userData.role !== 'PT') {
    return (
      <AccessDenied
        requiredRole="PT"
        currentUser={userData}
        onLogout={handleLogout}
        title="Không Có Quyền Huấn Luyện Viên"
        message="Khu vực này dành riêng cho Huấn luyện viên (PT) quản lý học viên và giáo án. Tài khoản của bạn không có quyền truy cập."
      />
    );
  }

  if (userData && userData.role === 'PT' && userData.isApprovedPt === false) {
    return <PtPendingApproval currentUser={userData} onLogout={handleLogout} />;
  }

  const now = new Date();
  const selectedDateStr = formatYYYYMMDD(selectedDate);
  const isSelectedToday = isSameDay(selectedDate, now);
  const isSelectedPast = selectedDate < now && !isSelectedToday;
  const isSelectedFuture = selectedDate > now && !isSelectedToday;

  const allSchedulesList: PTSessionItem[] = dbSchedules || [];

  // Filter schedules for the selected date
  const selectedDateSessions = allSchedulesList.filter((s) => {
    if (filterStudentId && s.studentId !== filterStudentId) return false;
    return s.scheduledDate === selectedDateStr;
  });

  const timelineSlots: ScheduleSlot[] = selectedDateSessions
    .map((session) => {
      const times = session.timeSlot ? session.timeSlot.split(' - ') : ['08:00', '09:00'];
      const startTimeStr = times[0]?.trim() || '08:00';
      const endTimeStr = times[1]?.trim() || '09:00';
      const isCheckedIn =
        session.status === 'CHECKED_IN' || Boolean(checkedSessions[session.id]);

      let statusVal: 'COMPLETED' | 'ONGOING' | 'UPCOMING' | 'OVERDUE' = 'UPCOMING';

      if (isCheckedIn) {
        statusVal = 'COMPLETED';
      } else if (isSelectedPast) {
        statusVal = 'OVERDUE';
      } else if (isSelectedFuture) {
        statusVal = 'UPCOMING';
      } else {
        const [startHour, startMin] = startTimeStr.split(':').map(Number);
        const [endHour, endMin] = endTimeStr.split(':').map(Number);

        const slotStart = new Date(now);
        slotStart.setHours(startHour ?? 8, startMin ?? 0, 0, 0);

        const slotEnd = new Date(now);
        slotEnd.setHours(endHour ?? 9, endMin ?? 0, 0, 0);

        if (now < slotStart) {
          statusVal = 'UPCOMING';
        } else if (now >= slotStart && now <= slotEnd) {
          statusVal = 'ONGOING';
        } else {
          statusVal = 'OVERDUE';
        }
      }

      return {
        id: session.id,
        startTime: startTimeStr,
        endTime: endTimeStr,
        studentName: session.studentName,
        studentAvatar: session.studentAvatar,
        packageName: 'Gói PT 1:1 VIP',
        sessionNumber: `Buổi ${session.remainingSessions} / ${session.totalSessions}`,
        workoutName: session.workoutName || 'Giáo Án Tập Luyện 1:1',
        exercisesCount: 5,
        status: statusVal,
        isCheckedIn,
        isBusy: true,
      };
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const monthYearLabel = `${MONTH_NAMES_VI[viewMonthDate.getMonth()]}, ${viewMonthDate.getFullYear()}`;
  const studentsList = ptData?.students || [];
  const selectedStudentObj = studentsList.find((s) => s.id === filterStudentId);

  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="max-w-6xl mx-auto px-container-padding mt-4 md:mt-8 space-y-6">
        {/* Top Hero Banner & Toolbar Controls */}
        <section className="bento-card rounded-3xl p-5 md:p-7 border border-outline-variant/30 relative overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Title & Description */}
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1.5 border border-primary/30">
                <Calendar size={15} />
                Lịch Học & Dạy PT
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold font-headline-md text-on-surface">
                Timeline Lịch Dạy
              </h1>
              <p className="text-xs md:text-sm text-on-surface-variant font-medium">
                Toàn bộ ca dạy, lịch học của các học viên trong trung tâm.
              </p>
            </div>

            {/* Action Button: Thêm ca dạy */}
            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => handleOpenAddModalForDate(selectedDate)}
                className="px-5 py-3 rounded-2xl bg-primary text-dark-slate font-extrabold text-xs shadow-[0_0_15px_rgba(102,200,28,0.4)] hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <PlusCircle size={16} />
                Thêm Ca Dạy Mới
              </button>
            </div>
          </div>

          {/* Sub Toolbar: Month Navigation + Custom Glassmorphism Filter Dropdown */}
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 flex-wrap">
            {/* Month / Period Navigation Controls */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-2xl p-1">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={handlePrevMonth}
                  title="Tháng trước"
                  aria-label="Tháng trước"
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="px-3 text-sm font-extrabold text-white whitespace-nowrap min-w-[130px] text-center">
                  {monthYearLabel}
                </span>

                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={handleNextMonth}
                  title="Tháng sau"
                  aria-label="Tháng sau"
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {!isSelectedToday && (
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={handleGoToToday}
                  className="px-3.5 py-2 rounded-2xl bg-surface-bright text-on-surface border border-white/10 font-bold text-xs hover:border-primary/40 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <RotateCcw size={14} />
                  Hôm nay
                </button>
              )}
            </div>

            {/* Right Filters: Custom Glassmorphism Student Dropdown */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <div ref={dropdownRef} className="relative w-full sm:w-auto">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setIsStudentDropdownOpen((prev) => !prev)}
                  className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/15 hover:border-primary/40 rounded-2xl px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Filter size={14} className="text-primary shrink-0" />
                    <span className="max-w-[160px] truncate">
                      {selectedStudentObj
                        ? selectedStudentObj.fullName
                        : `Tất cả học viên (${studentsList.length})`}
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-white/60 transition-transform duration-200 shrink-0 ${
                      isStudentDropdownOpen ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>

                {/* Custom Popover Dropdown Menu */}
                {isStudentDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-[#121620]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1 max-h-60 overflow-y-auto [&&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                    {/* Option All Students */}
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() => {
                        setFilterStudentId('');
                        setIsStudentDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                        !filterStudentId
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Filter size={13} className={!filterStudentId ? 'text-primary' : 'text-white/40'} />
                        <span>Tất cả học viên ({studentsList.length})</span>
                      </div>
                      {!filterStudentId && <Check size={14} className="text-primary" />}
                    </button>

                    {/* Option List Individual Students */}
                    {studentsList.map((st) => {
                      const isSelected = filterStudentId === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          suppressHydrationWarning
                          onClick={() => {
                            setFilterStudentId(st.id);
                            setIsStudentDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                            isSelected
                              ? 'bg-primary/20 text-primary border border-primary/30'
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-black flex items-center justify-center shrink-0 border border-primary/30">
                              {st.fullName ? st.fullName.charAt(0) : 'H'}
                            </span>
                            <span className="truncate">{st.fullName}</span>
                          </div>
                          {isSelected && <Check size={14} className="text-primary shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="absolute -right-12 -top-12 w-44 h-44 bg-primary/10 blur-[60px] rounded-full pointer-events-none"></div>
        </section>

        {/* Main Monthly Calendar Grid */}
        <PtScheduleMonthGrid
          viewDate={viewMonthDate}
          selectedDate={selectedDate}
          onSelectDate={(d) => setSelectedDate(d)}
          schedules={allSchedulesList}
          checkedSessions={checkedSessions}
          onOpenAddModal={handleOpenAddModalForDate}
          onOpenDayDetails={handleOpenDayDetails}
          filterStudentId={filterStudentId}
        />
      </main>

      {/* Modal Thêm Ca Dạy Thủ Công */}
      <AddScheduleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        students={studentsList}
        onAddSession={handleAddCustomSession}
        defaultDate={addModalDefaultDate}
      />

      {/* Modal Xem Chi Tiết Ca Dạy Theo Ngày (khi nhấp vào lịch tháng) */}
      <DaySessionsModal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        selectedDate={selectedDate}
        slots={timelineSlots}
        checkedSessions={checkedSessions}
        onCheckIn={handleCheckIn}
        onOpenAddModal={handleOpenAddModalForDate}
      />

      <PTBottomNavBar activeTab="schedule" />
    </div>
  );
};

export default PTSchedulePage;
