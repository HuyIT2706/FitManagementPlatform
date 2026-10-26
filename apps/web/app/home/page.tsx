'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/ui/Header';
import BottomNavBar from '../../components/navigation/BottomNavBar';
import AppLoading from '../../components/ui/AppLoading';
import AccessDenied from '../../components/ui/AccessDenied';
import { Loader2 } from 'lucide-react';
import type { MealSlotConfig } from '../../interface';
import {
  formatYYYYMMDD,
  getMonday,
  isSameDay,
  formatDisplayDate,
  getWeekDays,
} from '../../utils/date';

import { useCurrentUser, useDailyNutrition } from '../../hooks/swr';
import { performLogout } from '../../utils/logout';
import { subscribeSync } from '../../utils/realtimeSync';
import CalendarStrip from './components/CalendarStrip';
import DailyFuelHeroCard from './components/DailyFuelHeroCard';
import MacroCards from './components/MacroCards';
import DailyMealGrid from './components/DailyMealGrid';
import HomeLoading from './loading';

const HomeContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateQuery = searchParams.get('date');
  const isSavingQuery = searchParams.get('saving') === 'true';

  const { data: userData, isLoading: userLoading } = useCurrentUser();
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMonday(new Date()));
  const [isSavingMeal, setIsSavingMeal] = useState(isSavingQuery);

  // Sync date from URL if user is redirected after saving meal
  useEffect(() => {
    if (dateQuery) {
      const parts = dateQuery.split('-');
      const p0 = parts[0];
      const p1 = parts[1];
      const p2 = parts[2];
      if (parts.length === 3 && p0 && p1 && p2) {
        const y = parseInt(p0, 10);
        const m = parseInt(p1, 10) - 1;
        const d = parseInt(p2, 10);
        const target = new Date(y, m, d);
        if (!isNaN(target.getTime())) {
          setSelectedDate(target);
          setCurrentMonday(getMonday(target));
        }
      }
    }
  }, [dateQuery]);

  useEffect(() => {
    if (isSavingQuery) {
      setIsSavingMeal(true);
    }
  }, [isSavingQuery]);

  const selectedDateStr = formatYYYYMMDD(selectedDate);
  const { data: dailyData, isLoading: dailyLoading, mutate: mutateDaily } = useDailyNutrition(selectedDateStr);

  // Automatically dismiss saving banner once fresh daily data is hydrated
  useEffect(() => {
    if (isSavingMeal) {
      const timer = setTimeout(() => {
        setIsSavingMeal(false);
        router.replace(`/home?date=${selectedDateStr}`, { scroll: false });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSavingMeal, dailyData, router, selectedDateStr]);

  useEffect(() => {
    const unsubscribe = subscribeSync((type) => {
      if (
        type === 'MEAL_PLAN_UPDATED' ||
        type === 'PROFILE_UPDATED' ||
        type === 'PT_BIND_UPDATED'
      ) {
        mutateDaily();
      }
    });
    return () => unsubscribe();
  }, [mutateDaily]);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      router.replace('/login');
      return;
    }
    if (userData && userData.role === 'USER' && userData.onboardingCompleted === false) {
      router.replace('/onboarding');
    }
  }, [userData, router]);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
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
  };

  const handleLogout = () => {
    performLogout();
  };

  // ---------------------------------------------------------------------------
  // Memoised derived values — MUST be called unconditionally before early returns!
  // ---------------------------------------------------------------------------
  const nutritionStats = useMemo(() => {
    const targetCalo = dailyData?.targets?.calories || userData?.nutritionTargets?.[0]?.targetCalo || 0;
    const targetProtein = dailyData?.targets?.protein || userData?.nutritionTargets?.[0]?.targetProtein || 0;
    const targetCarbs = dailyData?.targets?.carbs || userData?.nutritionTargets?.[0]?.targetCarbs || 0;
    const targetFat = dailyData?.targets?.fat || userData?.nutritionTargets?.[0]?.targetFat || 0;

    const consumedCalo = Math.round(dailyData?.consumed?.calories || 0);
    const consumedProtein = Math.round((dailyData?.consumed?.protein || 0) * 10) / 10;
    const consumedCarbs = Math.round((dailyData?.consumed?.carbs || 0) * 10) / 10;
    const consumedFat = Math.round((dailyData?.consumed?.fat || 0) * 10) / 10;

    const proteinPercentage = Math.round((dailyData?.progress?.proteinPercent || 0) * 10) / 10;
    const carbsPercentage = Math.round((dailyData?.progress?.carbsPercent || 0) * 10) / 10;
    const fatPercentage = Math.round((dailyData?.progress?.fatPercent || 0) * 10) / 10;
    const strokeDashoffset = dailyData?.progress?.strokeDashoffset ?? 816;
    const remainingCalories = Math.round(
      dailyData?.progress?.remainingCalories ?? Math.max(0, targetCalo - consumedCalo)
    );

    return {
      targetCalo, targetProtein, targetCarbs, targetFat,
      consumedCalo, consumedProtein, consumedCarbs, consumedFat,
      proteinPercentage, carbsPercentage, fatPercentage,
      strokeDashoffset, remainingCalories,
    };
  }, [dailyData, userData]);

  const {
    targetCalo, targetProtein, targetCarbs, targetFat,
    consumedCalo, consumedProtein, consumedCarbs, consumedFat,
    proteinPercentage, carbsPercentage, fatPercentage,
    strokeDashoffset, remainingCalories,
  } = nutritionStats;

  if (userLoading && !userData) {
    return <AppLoading fullScreen size="lg" message="Đang nạp dữ liệu dinh dưỡng hôm nay..." />;
  }

  if (userData && userData.role !== 'USER') {
    return (
      <AccessDenied
        requiredRole="USER"
        currentUser={userData}
        onLogout={handleLogout}
        title="Không Phải Tài Khoản Học Viên"
        message="Khu vực này dành riêng cho Học viên theo dõi chế độ dinh dưỡng & tập luyện cá nhân. Huấn luyện viên vui lòng sử dụng Không gian PT."
      />
    );
  }

  const weekDays = getWeekDays(currentMonday);
  const dayLabelMap = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'];

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
    <div className="min-h-screen bg-background pb-32 text-on-surface">
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

        {/* Live Saving Feedback Banner */}
        {isSavingMeal && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs sm:text-sm font-semibold shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-pulse">
            <div className="flex items-center gap-2.5">
              <Loader2 size={17} className="animate-spin text-[#10b981] shrink-0" />
              <span>Đang lưu và nạp số liệu bữa ăn vào nhật ký hôm nay...</span>
            </div>
            <span className="text-[11px] text-emerald-300/80 font-bold hidden sm:inline-block">Đang đồng bộ</span>
          </div>
        )}

        {/* Bento Grid Layout */}
        <div
          className={`grid grid-cols-1 md:grid-cols-12 gap-gutter transition-all duration-300 ${
            dailyLoading || isSavingMeal ? 'opacity-80' : 'opacity-100'
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
};

const Home = () => {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
};

export default Home;
