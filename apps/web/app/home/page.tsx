"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopBar from "../../components/navigation/TopBar";
import BottomNavBar from "../../components/navigation/BottomNavBar";
import apiClient from "../../api/axios";
import type { UserDataHome, DailyNutritionData } from "../../interface";
import {
  formatYYYYMMDD,
  getMonday,
  isSameDay,
  formatDisplayDate,
  getWeekDays,
} from "../../utils/date";

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
      apiClient.get<UserDataHome>("/users/me"),
      apiClient.get<DailyNutritionData>(`/nutrition/daily?date=${todayStr}`)
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
    localStorage.removeItem("jwt_token");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Generate 7 days for currentMonday
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentMonday);
    d.setDate(currentMonday.getDate() + i);
    return d;
  });

  const dayLabelMap = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"];

  const target = userData?.nutritionTargets?.[0] || {};
  const targetCalo = target.targetCalo || 0;
  const targetProtein = target.targetProtein || 0;
  const targetCarbs = target.targetCarbs || 0;
  const targetFat = target.targetFat || 0;

  const consumedCalo = dailyData?.consumed?.calories || 0;
  const consumedProtein = dailyData?.consumed?.protein || 0;
  const consumedCarbs = dailyData?.consumed?.carbs || 0;
  const consumedFat = dailyData?.consumed?.fat || 0;

  const getMealCalories = (type: string) => {
    if (!dailyData?.meals) return 0;
    const meal = dailyData.meals.find((m) => m.mealName === type);
    return meal ? meal.totalCalories : 0;
  };

  const getMealConfig = (freq: number) => {
    switch (freq) {
      case 2:
        return [
          { id: "BREAKFAST", name: "Bữa Sáng", icon: "wb_twilight" },
          { id: "DINNER", name: "Bữa Tối", icon: "dark_mode" },
        ];
      case 3:
        return [
          { id: "BREAKFAST", name: "Bữa Sáng", icon: "wb_twilight" },
          { id: "LUNCH", name: "Bữa Trưa", icon: "light_mode" },
          { id: "DINNER", name: "Bữa Tối", icon: "dark_mode" },
        ];
      case 5:
        return [
          { id: "BREAKFAST", name: "Bữa Sáng", icon: "wb_twilight" },
          { id: "MORNING_SNACK", name: "Phụ Sáng", icon: "bakery_dining" },
          { id: "LUNCH", name: "Bữa Trưa", icon: "light_mode" },
          { id: "AFTERNOON_SNACK", name: "Phụ Chiều", icon: "icecream" },
          { id: "DINNER", name: "Bữa Tối", icon: "dark_mode" },
        ];
      case 4:
      default:
        return [
          { id: "BREAKFAST", name: "Bữa Sáng", icon: "wb_twilight" },
          { id: "LUNCH", name: "Bữa Trưa", icon: "light_mode" },
          { id: "DINNER", name: "Bữa Tối", icon: "dark_mode" },
          { id: "SNACK", name: "Bữa Phụ", icon: "icecream" },
        ];
    }
  };

  const caloPercentage = targetCalo ? Math.min((consumedCalo / targetCalo) * 100, 100) : 0;
  const proteinPercentage = targetProtein ? Math.min((consumedProtein / targetProtein) * 100, 100) : 0;
  const carbsPercentage = targetCarbs ? Math.min((consumedCarbs / targetCarbs) * 100, 100) : 0;
  const fatPercentage = targetFat ? Math.min((consumedFat / targetFat) * 100, 100) : 0;

  const circumference = 816;
  const strokeDashoffset = circumference - (caloPercentage / 100) * circumference;

  const isSelectedDateToday = isSameDay(selectedDate, new Date());
  const selectedDateFormattedStr = formatYYYYMMDD(selectedDate);

  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <TopBar userData={userData} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-container-padding md:mt-8 space-y-6">
        {/* Horizontal Calendar Strip with Navigation */}
        <section className="bento-card p-4 rounded-3xl border border-bento-border/60">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-3">
              <h2 className="font-headline-md text-base md:text-lg font-bold text-on-surface">
                Tháng {currentMonday.getMonth() + 1}, {currentMonday.getFullYear()}
              </h2>
              {!isSelectedDateToday && (
                <button
                  onClick={handleGoToToday}
                  className="text-xs px-3 py-1 rounded-full bg-green-light/15 text-green-light font-bold hover:bg-green-light/25 transition-colors border border-green-light/30 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">today</span>
                  Về Hôm nay
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevWeek}
                aria-label="Tuần trước"
                className="w-9 h-9 rounded-full bg-surface-bright/30 border border-white/10 text-on-surface hover:bg-surface-bright/60 transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button
                onClick={handleNextWeek}
                aria-label="Tuần sau"
                className="w-9 h-9 rounded-full bg-surface-bright/30 border border-white/10 text-on-surface hover:bg-surface-bright/60 transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 md:gap-3">
            {weekDays.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              const dayName = dayLabelMap[day.getDay()];

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleSelectDate(day)}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer relative ${
                    isSelected
                      ? "bg-green-light/20 border-2 border-green-light text-green-light shadow-[0_0_15px_rgba(102,200,28,0.25)] scale-[1.02]"
                      : "bg-surface-dim/40 border border-white/5 hover:bg-surface-bright/30 opacity-80 hover:opacity-100"
                  }`}
                >
                  <span className="font-label-lg text-[11px] md:text-xs font-semibold">
                    {isToday ? "Hôm nay" : dayName}
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

        {/* Bento Grid Layout */}
        <div className={`grid grid-cols-1 md:grid-cols-12 gap-gutter transition-opacity duration-200 ${dailyLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {/* Hero Bento Card (Fuel) */}
          <div className="bento-card col-span-1 md:col-span-8 p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-green-light/5 rounded-full blur-[60px] pointer-events-none"></div>
            <div className="w-full flex justify-between items-center mb-6 z-10">
              <div>
                <h2 className="font-headline-md text-xl md:text-2xl text-on-surface tracking-tight font-bold">NHIÊN LIỆU HÀNG NGÀY</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {isSelectedDateToday ? 'Hôm nay' : formatDisplayDate(selectedDate)}
                </p>
              </div>
              <span className="material-symbols-outlined text-green-light">local_fire_department</span>
            </div>
            
            <div className="relative w-64 h-64 flex items-center justify-center z-10 my-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 280 280">
                <circle cx="140" cy="140" fill="none" r="130" stroke="#324054" strokeDasharray="612 816" strokeDashoffset="102" strokeLinecap="round" strokeWidth="12"></circle>
                <circle 
                  className="progress-ring__circle" 
                  cx="140" cy="140" fill="none" r="130" 
                  stroke="#66C81C" 
                  strokeDasharray="816 816"
                  strokeDashoffset={strokeDashoffset} 
                  strokeLinecap="round" strokeWidth="12" 
                  style={{ filter: "drop-shadow(0 0 8px rgba(102, 200, 28, 0.4))" }}
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-stats-xl text-4xl font-extrabold text-on-surface tracking-tighter">{consumedCalo}</span>
                <span className="font-label-lg text-sm text-on-surface-variant mt-1">kcal đã nạp</span>
              </div>
            </div>

            <div className="grid grid-cols-3 w-full gap-4 mt-6 z-10 border-t border-bento-border/50 pt-6">
              <div className="flex flex-col items-center">
                <span className="font-headline-md text-xl font-bold text-on-surface">{Math.max(0, targetCalo - consumedCalo)}</span>
                <span className="font-label-lg text-xs text-on-surface-variant uppercase tracking-wider">Còn lại</span>
              </div>
              <div className="flex flex-col items-center border-l border-r border-bento-border/50">
                <span className="font-headline-md text-xl font-bold text-on-surface">{targetCalo}</span>
                <span className="font-label-lg text-xs text-on-surface-variant uppercase tracking-wider">Mục tiêu</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-headline-md text-xl font-bold text-on-surface">0</span>
                <span className="font-label-lg text-xs text-on-surface-variant uppercase tracking-wider">Đốt cháy</span>
              </div>
            </div>
          </div>

          {/* Macros Column */}
          <div className="col-span-1 md:col-span-4 flex flex-col gap-gutter">
            {/* Protein Card */}
            <div className="bento-card p-5 flex items-center gap-4 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-macro-protein"></div>
              <div className="w-12 h-12 rounded-xl bg-macro-protein/10 flex items-center justify-center text-macro-protein">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-label-lg text-sm text-on-surface-variant">Đạm (Protein)</span>
                  <span className="font-headline-md text-lg font-bold text-on-surface">{consumedProtein}<span className="text-on-surface-variant text-sm font-normal">/{targetProtein}g</span></span>
                </div>
                <div className="h-2 w-full bg-surface-bright rounded-full overflow-hidden">
                  <div className="h-full bg-macro-protein rounded-full shadow-[0_0_10px_rgba(0,134,201,0.5)] transition-all duration-500" style={{ width: `${proteinPercentage}%` }}></div>
                </div>
              </div>
            </div>

            {/* Carbs Card */}
            <div className="bento-card p-5 flex items-center gap-4 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-macro-carbs"></div>
              <div className="w-12 h-12 rounded-xl bg-macro-carbs/10 flex items-center justify-center text-macro-carbs">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-label-lg text-sm text-on-surface-variant">Tinh bột (Carbs)</span>
                  <span className="font-headline-md text-lg font-bold text-on-surface">{consumedCarbs}<span className="text-on-surface-variant text-sm font-normal">/{targetCarbs}g</span></span>
                </div>
                <div className="h-2 w-full bg-surface-bright rounded-full overflow-hidden">
                  <div className="h-full bg-macro-carbs rounded-full shadow-[0_0_10px_rgba(239,104,32,0.5)] transition-all duration-500" style={{ width: `${carbsPercentage}%` }}></div>
                </div>
              </div>
            </div>

            {/* Fats Card */}
            <div className="bento-card p-5 flex items-center gap-4 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-macro-fats"></div>
              <div className="w-12 h-12 rounded-xl bg-macro-fats/10 flex items-center justify-center text-macro-fats">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-label-lg text-sm text-on-surface-variant">Chất béo (Fats)</span>
                  <span className="font-headline-md text-lg font-bold text-on-surface">{consumedFat}<span className="text-on-surface-variant text-sm font-normal">/{targetFat}g</span></span>
                </div>
                <div className="h-2 w-full bg-surface-bright rounded-full overflow-hidden">
                  <div className="h-full bg-macro-fats rounded-full shadow-[0_0_10px_rgba(246,61,104,0.5)] transition-all duration-500" style={{ width: `${fatPercentage}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Meals Section */}
          <div className="col-span-1 md:col-span-12 mt-4">
            <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="font-headline-md text-xl font-bold text-on-surface">Bữa ăn hàng ngày</h3>
              <button className="font-label-lg text-sm text-green-light hover:text-primary transition-colors flex items-center font-semibold">
                Lên kế hoạch <span className="material-symbols-outlined text-sm ml-1">chevron_right</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {getMealConfig(userData?.mealFrequency || 4).map((meal) => (
                <div key={meal.id} className="bento-card p-4 flex items-center justify-between group hover:bg-surface-bright/30 transition-colors border border-bento-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-bright flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{meal.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-label-lg text-sm font-semibold text-on-surface">{meal.name}</h4>
                      <span className="font-body-md text-sm text-on-surface-variant">{getMealCalories(meal.id)} kcal</span>
                    </div>
                  </div>
                  <Link 
                    href={`/add-meal?type=${meal.id}&date=${selectedDateFormattedStr}`} 
                    className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-green-light/20 hover:text-green-light hover:border-green-light transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <BottomNavBar activeTab="diary" />
    </div>
  );
}
