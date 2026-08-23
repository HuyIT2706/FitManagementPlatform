'use client';

import { useEffect, useState } from 'react';
import Header from '../../components/ui/Header';
import BottomNavBar from '../../components/navigation/BottomNavBar';
import AppLoading from '../../components/ui/AppLoading';
import apiClient from '../../api/axios';
import type { UserDataHome, DailyNutritionData, MealSlotConfig } from '../../interface';
import {
  formatYYYYMMDD,
  getMonday,
  isSameDay,
  formatDisplayDate,
  getWeekDays,
} from '../../utils/date';

import { guardRoleAccess } from '../../utils/authRedirect';

import CalendarStrip from './components/CalendarStrip';
import DailyFuelHeroCard from './components/DailyFuelHeroCard';
import MacroCards from './components/MacroCards';
import DailyMealGrid from './components/DailyMealGrid';

export default function Home() {
  const [userData, setUserData] = useState<UserDataHome | null>(null);
  const [dailyData, setDailyData] = useState<DailyNutritionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyLoading, setDailyLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMonday(new Date()));

  useEffect(() => {
    const todayStr = formatYYYYMMDD(new Date());
    Promise.all([
      apiClient.get<UserDataHome>('/users/me'),
      apiClient.get<DailyNutritionData>(`/nutrition/daily?date=${todayStr}`),
    ])
      .then(([userRes, dailyRes]) => {
        if (!guardRoleAccess(userRes.data, ['USER'])) {
          return;
        }
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

  const handlePrevWeek = () => {
    const prevMon = new Date(currentMonday);
    prevMon.setDate(prevMon.getDate() - 7);
    setCurrentMonday(prevMon);
  };

  const handleNextWeek = () => {
    const nextMon = new Date(currentMonday);
    nextMon.setDate(nextMon.getDate() + 7);
    setCurrentMonday(nextMon);
  };

  const handleGoToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonday(getMonday(today));
    fetchDailyDataForDate(today);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    window.location.href = '/login';
  };

  if (loading) {
    return <AppLoading fullScreen size="lg" message="Đang nạp dữ liệu dinh dưỡng hôm nay..." />;
  }

  const weekDays = getWeekDays(currentMonday);
  const dayLabelMap = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'];

  const targetCalo = dailyData?.targets?.calories || userData?.nutritionTargets?.[0]?.targetCalo || 0;
  const targetProtein = dailyData?.targets?.protein || userData?.nutritionTargets?.[0]?.targetProtein || 0;
  const targetCarbs = dailyData?.targets?.carbs || userData?.nutritionTargets?.[0]?.targetCarbs || 0;
  const targetFat = dailyData?.targets?.fat || userData?.nutritionTargets?.[0]?.targetFat || 0;

  const consumedCalo = dailyData?.consumed?.calories || 0;
  const consumedProtein = dailyData?.consumed?.protein || 0;
  const consumedCarbs = dailyData?.consumed?.carbs || 0;
  const consumedFat = dailyData?.consumed?.fat || 0;

  const proteinPercentage = dailyData?.progress?.proteinPercent || 0;
  const carbsPercentage = dailyData?.progress?.carbsPercent || 0;
  const fatPercentage = dailyData?.progress?.fatPercent || 0;
  const strokeDashoffset = dailyData?.progress?.strokeDashoffset ?? 816;
  const remainingCalories = dailyData?.progress?.remainingCalories ?? Math.max(0, targetCalo - consumedCalo);

  const mealSlots: MealSlotConfig[] = dailyData?.mealSlots || [
    { id: 'BREAKFAST', name: 'Bữa Sáng', icon: 'wb_twilight' },
    { id: 'LUNCH', name: 'Bữa Trưa', icon: 'light_mode' },
    { id: 'DINNER', name: 'Bữa Tối', icon: 'dark_mode' },
    { id: 'SNACK', name: 'Bữa Phụ', icon: 'icecream' },
  ];

  const getMealDetails = (type: string) => {
    const summary = dailyData?.mealSummary?.[type];
    return {
      totalCalories: summary?.totalCalories || 0,
      items: summary?.items || [],
    };
  };

  const isSelectedDateToday = isSameDay(selectedDate, new Date());
  const selectedDateFormattedStr = formatYYYYMMDD(selectedDate);
  const selectedDateFormattedDisplay = formatDisplayDate(selectedDate);

  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-container-padding md:mt-8 space-y-6">
        {/* Horizontal Calendar Strip */}
        <CalendarStrip
          currentMonday={currentMonday}
          selectedDate={selectedDate}
          weekDays={weekDays}
          dayLabelMap={dayLabelMap}
          isSelectedDateToday={isSelectedDateToday}
          onSelectDate={handleSelectDate}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onGoToToday={handleGoToToday}
          isSameDay={isSameDay}
        />

        {/* Bento Grid Layout */}
        <div
          className={`grid grid-cols-1 md:grid-cols-12 gap-gutter transition-opacity duration-200 ${
            dailyLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* Hero Fuel Card */}
          <DailyFuelHeroCard
            consumedCalo={consumedCalo}
            targetCalo={targetCalo}
            remainingCalories={remainingCalories}
            strokeDashoffset={strokeDashoffset}
            isSelectedDateToday={isSelectedDateToday}
            selectedDateFormatted={selectedDateFormattedDisplay}
          />

          {/* Macros Column */}
          <MacroCards
            consumedProtein={consumedProtein}
            targetProtein={targetProtein}
            proteinPercentage={proteinPercentage}
            consumedCarbs={consumedCarbs}
            targetCarbs={targetCarbs}
            carbsPercentage={carbsPercentage}
            consumedFat={consumedFat}
            targetFat={targetFat}
            fatPercentage={fatPercentage}
          />

          {/* Daily Meal Grid */}
          <DailyMealGrid
            mealSlots={mealSlots}
            getMealDetails={getMealDetails}
            selectedDateFormattedStr={selectedDateFormattedStr}
          />
        </div>
      </main>

      <BottomNavBar activeTab="diary" />
    </div>
  );
}
