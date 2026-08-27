'use client';

import { useState } from 'react';
import { Calendar, RotateCcw, PlusCircle, CalendarX } from 'lucide-react';
import Header from '../../../components/ui/Header';
import PTBottomNavBar from '../../../components/navigation/PTBottomNavBar';
import AppLoading from '../../../components/ui/AppLoading';
import apiClient from '../../../api/axios';
import type { PTSessionItem } from '@repo/types';
import { formatYYYYMMDD, getMonday, isSameDay } from '../../../utils/date';
import { toast } from '../../../utils/toast';

import dynamic from 'next/dynamic';
import AccessDenied from '../../../components/ui/AccessDenied';
import PtPendingApproval from '../../../components/ui/PtPendingApproval';
import PtScheduleWeekStrip from './components/PtScheduleWeekStrip';
import PtScheduleSlotCard, { type ScheduleSlot } from './components/PtScheduleSlotCard';

import { useCurrentUser, usePtDashboard, usePtSchedule } from '../../../hooks/swr';

const AddScheduleModal = dynamic(() => import('./components/AddScheduleModal'), {
  ssr: false,
});

const PTSchedulePage = () => {
  const { data: userData, isLoading: userLoading } = useCurrentUser();
  const { data: ptData, isLoading: ptLoading, mutate: mutatePt } = usePtDashboard();

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMonday(new Date()));
  const [checkedSessions, setCheckedSessions] = useState<Record<string, boolean>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const currentSunday = new Date(currentMonday);
  currentSunday.setDate(currentSunday.getDate() + 6);
  const weekStartStr = formatYYYYMMDD(currentMonday);
  const weekEndStr = formatYYYYMMDD(currentSunday);

  const { data: dbWeekSchedules, mutate: mutateSchedule } = usePtSchedule(
    weekStartStr,
    weekEndStr,
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

  const handleGoToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonday(getMonday(today));
  };

  const handleAddCustomSession = async (newSession: PTSessionItem) => {
    if (!newSession.studentId) return;
    try {
      await apiClient.post('/pt/schedule', {
        studentId: newSession.studentId,
        title: newSession.workoutName || 'Giáo Án Tập Luyện 1:1',
        scheduledDate: newSession.scheduledDate || formatYYYYMMDD(selectedDate),
        timeSlot: newSession.timeSlot || '08:00 - 09:00',
      });
      mutateSchedule();
      mutatePt();
    } catch (err) {
      console.error('Lỗi khi lưu ca dạy:', err);
      toast.error('Không thể lưu ca dạy vào hệ thống!');
    }
  };

  const loading = userLoading || (userData?.role === 'PT' && userData?.isApprovedPt !== false && ptLoading && !ptData);

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

  // Lấy các ca dạy khớp đúng ngày được chọn từ PostgreSQL
  const allActiveSessions: PTSessionItem[] = (dbWeekSchedules || []).filter(
    (s) => s.scheduledDate === selectedDateStr,
  );

  // Map đếm số lượng ca dạy cho từng ngày trong tuần
  const sessionDatesMap: Record<string, number> = {};
  (dbWeekSchedules || []).forEach((s) => {
    if (s.scheduledDate) {
      sessionDatesMap[s.scheduledDate] = (sessionDatesMap[s.scheduledDate] || 0) + 1;
    }
  });

  const timelineSlots: ScheduleSlot[] = allActiveSessions
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
        // Hôm nay: So sánh giờ thực tế hiện tại
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
          // Quá giờ ca dạy nhưng chưa ấn check-in -> OVERDUE (Dạy trễ)
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

  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="max-w-5xl mx-auto px-container-padding mt-4 md:mt-8 space-y-gutter">
        {/* Header Summary */}
        <section className="bento-card rounded-3xl p-6 md:p-8 space-y-4 border border-outline-variant/30 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-primary/30">
                <Calendar size={16} />
                Timeline Huấn Luyện
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold font-headline-md text-on-surface">
                Lịch dạy học viên PT
              </h1>
              <p className="text-xs md:text-sm text-on-surface-variant mt-1 font-medium">
                Quản lý các ca dạy thực tế, lưu lịch sử ca dạy đã qua và điểm danh trừ buổi cho học viên.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-primary text-dark-slate font-extrabold text-xs shadow-[0_0_15px_rgba(102,200,28,0.4)] hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Thêm Ca Dạy Mới
              </button>

              {!isSelectedToday && (
                <button
                  type="button"
                  onClick={handleGoToToday}
                  className="px-3.5 py-2.5 rounded-xl bg-surface-bright text-on-surface border border-white/10 font-bold text-xs hover:border-primary/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={15} />
                  Hôm nay
                </button>
              )}
            </div>
          </div>

          <div className="absolute -right-12 -top-12 w-44 h-44 bg-primary/10 blur-[60px] rounded-full pointer-events-none"></div>
        </section>

        {/* Interactive Weekday Strip */}
        <PtScheduleWeekStrip
          currentMonday={currentMonday}
          selectedDate={selectedDate}
          onSelectDate={(d) => setSelectedDate(d)}
          activeSessionsCount={timelineSlots.length}
          sessionDatesMap={sessionDatesMap}
        />

        {/* Schedule Timeline Axis */}
        <section className="space-y-6 pt-2">
          {timelineSlots.length > 0 ? (
            <div className="relative pl-6 md:pl-8 border-l-2 border-outline-variant/30 space-y-6">
              {timelineSlots.map((slot) => (
                <PtScheduleSlotCard
                  key={slot.id}
                  slot={slot}
                  isChecked={Boolean(checkedSessions[slot.id])}
                  onCheckIn={handleCheckIn}
                />
              ))}
            </div>
          ) : (
            <div className="bento-card rounded-3xl p-8 text-center space-y-4 border border-outline-variant/30 flex flex-col items-center justify-center min-h-[220px]">
              <div className="w-14 h-14 rounded-2xl bg-surface-bright border border-white/10 flex items-center justify-center text-on-surface-variant">
                <CalendarX size={28} />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="font-bold text-on-surface text-base">
                  Chưa có ca dạy nào cho ngày này
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Hiện chưa có lịch xếp ca dạy cho học viên. Bạn có thể tự chọn khung giờ & xếp ca dạy mới ngay bên dưới.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-primary text-dark-slate font-extrabold text-xs shadow-[0_0_15px_rgba(102,200,28,0.3)] hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <PlusCircle size={16} />
                Thêm Ca Dạy Cho Học Viên
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Modal Thêm Ca Dạy Tùy Chỉnh Giờ & Chọn Học Viên */}
      <AddScheduleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        students={ptData?.students || []}
        onAddSession={handleAddCustomSession}
        defaultDate={selectedDate}
      />

      <PTBottomNavBar activeTab="schedule" />
    </div>
  );
};

export default PTSchedulePage;
