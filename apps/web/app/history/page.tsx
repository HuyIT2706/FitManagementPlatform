'use client';

import { useEffect, useState } from 'react';
import Header from '../../components/ui/Header';
import BottomNavBar from '../../components/navigation/BottomNavBar';
import AppLoading from '../../components/ui/AppLoading';
import apiClient from '../../api/axios';
import type { UserDataHome, DailyNutritionData, MonthCell } from '../../interface';
import { formatYYYYMMDD, isSameDay } from '../../utils/date';

import HistoryStreakHeroCard from './components/HistoryStreakHeroCard';
import HistoryMonthCalendar from './components/HistoryMonthCalendar';
import HistoryNutritionDetails from './components/HistoryNutritionDetails';

const HistoryPage = () => {
  const [userData, setUserData] = useState<UserDataHome | null>(null);
  const [dailyData, setDailyData] = useState<DailyNutritionData | null>(null);

  const [loading, setLoading] = useState(true);
  const [dailyLoading, setDailyLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());

  useEffect(() => {
    const todayStr = formatYYYYMMDD(new Date());
    Promise.all([
      apiClient.get<UserDataHome>('/users/me'),
      apiClient.get<DailyNutritionData>(`/nutrition/daily?date=${todayStr}`),
    ])
      .then(([userRes, dailyRes]) => {
        setUserData(userRes.data);
        setDailyData(dailyRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const fetchDailyDataForDate = (targetDate: Date) => {
    setDailyLoading(true);
    const dateStr = formatYYYYMMDD(targetDate);
    apiClient
      .get<DailyNutritionData>(`/nutrition/daily?date=${dateStr}`)
      .then((res) => {
        setDailyData(res.data);
        setDailyLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setDailyLoading(false);
      });
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    fetchDailyDataForDate(date);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleGoToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(new Date());
    fetchDailyDataForDate(today);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    window.location.href = '/login';
  };

  if (loading) {
    return <AppLoading fullScreen size="lg" message="Đang tải lịch sử & báo cáo..." />;
  }

  // Generate Month Calendar Grid
  const generateMonthCalendar = (year: number, month: number): MonthCell[] => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const prevMonthCells = Array.from({ length: startOffset }, (_, i) => {
      const day = daysInPrevMonth - startOffset + i + 1;
      return {
        date: new Date(year, month - 1, day),
        dayNumber: day,
        isCurrentMonth: false,
      };
    });

    const currentMonthCells = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return {
        date: new Date(year, month, day),
        dayNumber: day,
        isCurrentMonth: true,
      };
    });

    const totalCellsSoFar = prevMonthCells.length + currentMonthCells.length;
    const trailingCount = (7 - (totalCellsSoFar % 7)) % 7;

    const nextMonthCells = Array.from({ length: trailingCount }, (_, i) => {
      const day = i + 1;
      return {
        date: new Date(year, month + 1, day),
        dayNumber: day,
        isCurrentMonth: false,
      };
    });

    return [...prevMonthCells, ...currentMonthCells, ...nextMonthCells];
  };

  const monthCells = generateMonthCalendar(
    currentMonth.getFullYear(),
    currentMonth.getMonth()
  );

  const monthNames = [
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

  // PT Package info
  const hasPt = Boolean(userData?.assignedPt);
  const activePkg = userData?.activePackage;
  const remainingPtSessions = activePkg?.remainingSessions ?? 8;
  const totalPtSessions = activePkg?.totalSessions ?? 12;
  const checkedInPtSessions = Math.max(0, totalPtSessions - remainingPtSessions);
  const ptAttendancePercent = totalPtSessions
    ? Math.min(100, Math.round((checkedInPtSessions / totalPtSessions) * 100))
    : 66;

  // Dynamic Streak & Calorie Compliance Stats from Backend
  const streakDays = dailyData?.streak?.currentStreak ?? 0;
  const totalTrackingDays = dailyData?.streak?.totalLoggedDays ?? 0;
  const calorieComplianceDays = totalTrackingDays;
  const loggedDates = dailyData?.streak?.loggedDates || [];

  // Daily Nutrition stats for selected date
  const targetCalo =
    dailyData?.targets?.calories || userData?.nutritionTargets?.[0]?.targetCalo || 0;
  const targetProtein =
    dailyData?.targets?.protein || userData?.nutritionTargets?.[0]?.targetProtein || 0;
  const targetCarbs =
    dailyData?.targets?.carbs || userData?.nutritionTargets?.[0]?.targetCarbs || 0;
  const targetFat =
    dailyData?.targets?.fat || userData?.nutritionTargets?.[0]?.targetFat || 0;

  const consumedCalo = dailyData?.consumed?.calories || 0;
  const consumedProtein = dailyData?.consumed?.protein || 0;
  const consumedCarbs = dailyData?.consumed?.carbs || 0;
  const consumedFat = dailyData?.consumed?.fat || 0;

  const proteinPercent =
    dailyData?.progress?.proteinPercent ||
    (targetProtein ? Math.min(100, Math.round((consumedProtein / targetProtein) * 100)) : 0);
  const carbsPercent =
    dailyData?.progress?.carbsPercent ||
    (targetCarbs ? Math.min(100, Math.round((consumedCarbs / targetCarbs) * 100)) : 0);
  const fatPercent =
    dailyData?.progress?.fatPercent ||
    (targetFat ? Math.min(100, Math.round((consumedFat / targetFat) * 100)) : 0);
  const totalCaloPercent = targetCalo
    ? Math.min(100, Math.round((consumedCalo / targetCalo) * 100))
    : 0;

  const mealSlots = dailyData?.mealSlots || [
    { id: 'BREAKFAST', name: 'Bữa Sáng' },
    { id: 'LUNCH', name: 'Bữa Trưa' },
    { id: 'DINNER', name: 'Bữa Tối' },
    { id: 'SNACK', name: 'Bữa Phụ' },
  ];

  const getMealDetails = (type: string) => {
    const summary = dailyData?.mealSummary?.[type];
    return {
      totalCalories: summary?.totalCalories || 0,
      items: summary?.items || [],
    };
  };

  const isSelectedDateToday = isSameDay(selectedDate, new Date());

  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-container-padding mt-4 md:mt-8 space-y-gutter">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* 1. Streak Hero Card (8 columns) */}
          <HistoryStreakHeroCard
            streakDays={streakDays}
            calorieComplianceDays={calorieComplianceDays}
            totalTrackingDays={totalTrackingDays}
            hasPt={hasPt}
            checkedInPtSessions={checkedInPtSessions}
            totalPtSessions={totalPtSessions}
            ptAttendancePercent={ptAttendancePercent}
          />

          {/* 2. Round Full Month Calendar Grid (4 columns) */}
          <HistoryMonthCalendar
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            monthCells={monthCells}
            loggedDates={loggedDates}
            monthNames={monthNames}
            isSelectedDateToday={isSelectedDateToday}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onSelectDate={handleSelectDate}
            onGoToToday={handleGoToToday}
            isSameDay={isSameDay}
          />

          {/* 3. Daily Nutrition Details & Home-style Meal Cards */}
          <HistoryNutritionDetails
            selectedDate={selectedDate}
            isSelectedDateToday={isSelectedDateToday}
            consumedCalo={consumedCalo}
            targetCalo={targetCalo}
            totalCaloPercent={totalCaloPercent}
            consumedProtein={consumedProtein}
            targetProtein={targetProtein}
            proteinPercent={proteinPercent}
            consumedCarbs={consumedCarbs}
            targetCarbs={targetCarbs}
            carbsPercent={carbsPercent}
            consumedFat={consumedFat}
            targetFat={targetFat}
            fatPercent={fatPercent}
            mealSlots={mealSlots}
            getMealDetails={getMealDetails}
            dailyLoading={dailyLoading}
          />
        </div>
      </main>

      <BottomNavBar activeTab="history" />
    </div>
  );
};

export default HistoryPage;
