'use client';

import { useEffect, useState } from 'react';
import { Calendar, RotateCcw } from 'lucide-react';
import Header from '../../../components/ui/Header';
import PTBottomNavBar from '../../../components/navigation/PTBottomNavBar';
import apiClient from '../../../api/axios';
import type { UserDataHome, PTDashboardData } from '../../../interface';
import { getMonday, isSameDay } from '../../../utils/date';
import { toast } from '../../../utils/toast';

import PtScheduleWeekStrip from './components/PtScheduleWeekStrip';
import PtScheduleSlotCard, { type ScheduleSlot } from './components/PtScheduleSlotCard';

export default function PTSchedulePage() {
  const [userData, setUserData] = useState<UserDataHome | null>(null);
  const [ptData, setPtData] = useState<PTDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMonday(new Date()));
  const [checkedSessions, setCheckedSessions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    Promise.all([
      apiClient.get<UserDataHome>('/users/me'),
      apiClient.get<PTDashboardData>('/pt/dashboard'),
    ])
      .then(([userRes, ptRes]) => {
        setUserData(userRes.data);
        setPtData(ptRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isSelectedToday = isSameDay(selectedDate, new Date());

  const liveSessions = ptData?.todaySessions || [];

  // Timeline Schedule Data Slots (07:00 -> 20:00)
  const timelineSlots: ScheduleSlot[] = [
    {
      id: 'slot-0700',
      startTime: '07:00',
      endTime: '08:00',
      isBusy: false,
    },
    {
      id: liveSessions[0]?.id || 'slot-0800',
      startTime: liveSessions[0]?.timeSlot?.split(' - ')?.[0] || '08:00',
      endTime: liveSessions[0]?.timeSlot?.split(' - ')?.[1] || '09:30',
      studentName: liveSessions[0]?.studentName || 'Bùi Văn Huy',
      studentAvatar:
        liveSessions[0]?.studentAvatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      packageName: 'Gói PT VIP 1-1',
      sessionNumber: `Buổi ${liveSessions[0]?.remainingSessions ?? 8} / ${liveSessions[0]?.totalSessions ?? 12}`,
      workoutName: liveSessions[0]?.workoutName || 'Legs & Glutes Power (Đùi & Mông)',
      exercisesCount: 5,
      status: 'ONGOING',
      isBusy: true,
    },
    {
      id: 'slot-0930',
      startTime: '09:30',
      endTime: '10:00',
      isBusy: false,
    },
    {
      id: liveSessions[1]?.id || 'slot-1000',
      startTime: liveSessions[1]?.timeSlot?.split(' - ')?.[0] || '10:00',
      endTime: liveSessions[1]?.timeSlot?.split(' - ')?.[1] || '11:30',
      studentName: liveSessions[1]?.studentName || 'Nguyễn Văn A',
      studentAvatar:
        liveSessions[1]?.studentAvatar ||
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      packageName: 'Gói PT Chuẩn',
      sessionNumber: `Buổi ${liveSessions[1]?.remainingSessions ?? 5} / ${liveSessions[1]?.totalSessions ?? 10}`,
      workoutName: liveSessions[1]?.workoutName || 'Chest & Triceps (Ngực & Tay sau)',
      exercisesCount: 4,
      status: 'UPCOMING',
      isBusy: true,
    },
    {
      id: 'slot-1130',
      startTime: '11:30',
      endTime: '14:00',
      isBusy: false,
    },
    {
      id: liveSessions[2]?.id || 'slot-1400',
      startTime: liveSessions[2]?.timeSlot?.split(' - ')?.[0] || '14:00',
      endTime: liveSessions[2]?.timeSlot?.split(' - ')?.[1] || '15:30',
      studentName: liveSessions[2]?.studentName || 'Trần Thị B',
      studentAvatar:
        liveSessions[2]?.studentAvatar ||
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      packageName: 'Gói PT VIP 1-1',
      sessionNumber: `Buổi ${liveSessions[2]?.remainingSessions ?? 12} / ${liveSessions[2]?.totalSessions ?? 36}`,
      workoutName: liveSessions[2]?.workoutName || 'Full Body HIIT & Core (Toàn thân)',
      exercisesCount: 6,
      status: 'UPCOMING',
      isBusy: true,
    },
    {
      id: 'slot-1530',
      startTime: '15:30',
      endTime: '17:00',
      isBusy: false,
    },
    {
      id: liveSessions[3]?.id || 'slot-1700',
      startTime: liveSessions[3]?.timeSlot?.split(' - ')?.[0] || '17:00',
      endTime: liveSessions[3]?.timeSlot?.split(' - ')?.[1] || '18:30',
      studentName: liveSessions[3]?.studentName || 'Lê Văn C',
      studentAvatar:
        liveSessions[3]?.studentAvatar ||
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      packageName: 'Gói PT Chuẩn',
      sessionNumber: `Buổi ${liveSessions[3]?.remainingSessions ?? 2} / ${liveSessions[3]?.totalSessions ?? 12}`,
      workoutName: liveSessions[3]?.workoutName || 'Back & Core Hypertrophy (Lưng xô)',
      exercisesCount: 5,
      status: 'UPCOMING',
      isBusy: true,
    },
    {
      id: 'slot-1830',
      startTime: '18:30',
      endTime: '20:00',
      isBusy: false,
    },
  ];

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
                Theo dõi mốc thời gian các ca dạy, điểm danh trừ buổi và xếp lịch trống.
              </p>
            </div>

            {!isSelectedToday && (
              <button
                type="button"
                onClick={handleGoToToday}
                className="px-4 py-2 rounded-xl bg-primary/15 text-primary font-bold text-xs hover:bg-primary/25 transition-colors border border-primary/30 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <RotateCcw size={15} />
                Về Hôm nay
              </button>
            )}
          </div>

          <div className="absolute -right-12 -top-12 w-44 h-44 bg-primary/10 blur-[60px] rounded-full pointer-events-none"></div>
        </section>

        {/* Interactive Weekday Strip */}
        <PtScheduleWeekStrip
          currentMonday={currentMonday}
          selectedDate={selectedDate}
          onSelectDate={(d) => setSelectedDate(d)}
        />

        {/* Timeline Schedule Axis (07:00 -> 20:00) */}
        <section className="space-y-6 pt-2">
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
        </section>
      </main>

      <PTBottomNavBar activeTab="schedule" />
    </div>
  );
}
