"use client";

import { useEffect, useState } from "react";
import Header from "../../components/ui/Header";
import BottomNavBar from "../../components/navigation/BottomNavBar";
import apiClient from "../../api/axios";
import type { UserDataHome, DailyNutritionData } from "../../interface";
import {
  formatYYYYMMDD,
  isSameDay,
  formatDisplayDate,
} from "../../utils/date";

export default function HistoryPage() {
  const [userData, setUserData] = useState<UserDataHome | null>(null);
  const [dailyData, setDailyData] = useState<DailyNutritionData | null>(null);

  const [loading, setLoading] = useState(true);
  const [dailyLoading, setDailyLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());

  useEffect(() => {
    const todayStr = formatYYYYMMDD(new Date());
    Promise.all([
      apiClient.get<UserDataHome>("/users/me"),
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
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleGoToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(new Date());
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

  // Generate Month Calendar Grid
  const generateMonthCalendar = (year: number, month: number) => {
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
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
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

  // Streak & Calorie Compliance Stats
  const streakDays = 14;
  const calorieComplianceDays = 18;
  const totalTrackingDays = 20;

  // Mock logged dates for dot indicators (e.g. 3, 5, 6, 11, 13, 17, 18, 20)
  const loggedDayNumbers = [3, 5, 6, 11, 13, 17, 18, 20];

  // Daily Nutrition stats for selected date
  const targetCalo = dailyData?.targets?.calories || userData?.nutritionTargets?.[0]?.targetCalo || 0;
  const targetProtein = dailyData?.targets?.protein || userData?.nutritionTargets?.[0]?.targetProtein || 0;
  const targetCarbs = dailyData?.targets?.carbs || userData?.nutritionTargets?.[0]?.targetCarbs || 0;
  const targetFat = dailyData?.targets?.fat || userData?.nutritionTargets?.[0]?.targetFat || 0;

  const consumedCalo = dailyData?.consumed?.calories || 0;
  const consumedProtein = dailyData?.consumed?.protein || 0;
  const consumedCarbs = dailyData?.consumed?.carbs || 0;
  const consumedFat = dailyData?.consumed?.fat || 0;

  const proteinPercent = dailyData?.progress?.proteinPercent || (targetProtein ? Math.min(100, Math.round((consumedProtein / targetProtein) * 100)) : 0);
  const carbsPercent = dailyData?.progress?.carbsPercent || (targetCarbs ? Math.min(100, Math.round((consumedCarbs / targetCarbs) * 100)) : 0);
  const fatPercent = dailyData?.progress?.fatPercent || (targetFat ? Math.min(100, Math.round((consumedFat / targetFat) * 100)) : 0);
  const totalCaloPercent = targetCalo ? Math.min(100, Math.round((consumedCalo / targetCalo) * 100)) : 0;

  const mealSlots = dailyData?.mealSlots || [
    { id: "BREAKFAST", name: "Bữa Sáng", icon: "wb_twilight" },
    { id: "LUNCH", name: "Bữa Trưa", icon: "light_mode" },
    { id: "DINNER", name: "Bữa Tối", icon: "dark_mode" },
    { id: "SNACK", name: "Bữa Phụ", icon: "icecream" },
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
          <section className="md:col-span-8 bento-card rounded-3xl p-6 md:p-8 relative overflow-hidden border border-outline-variant/30">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-green-light/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xs font-headline-md uppercase tracking-wider text-on-surface-variant mb-1 font-semibold">
                  Chuỗi Kỷ Luật & Tuân Thủ
                </h2>
                <div className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-orange-400 text-4xl animate-pulse"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    local_fire_department
                  </span>
                  <h1
                    className="text-2xl md:text-4xl font-headline-md text-on-surface font-extrabold"
                    style={{ textShadow: "0 0 10px rgba(255, 185, 95, 0.4)" }}
                  >
                    {streakDays} Ngày Liên Tục
                  </h1>
                </div>
                <p className="text-xs md:text-sm text-on-surface-variant mt-2 max-w-md leading-relaxed">
                  Bạn đang giữ chuỗi kỷ luật rất tuyệt vời! Hãy tiếp tục duy trì thói quen ghi nhận dinh dưỡng mỗi ngày.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {/* Calorie Compliance Card */}
              <div className="bg-surface-bright/40 border border-white/5 p-4 rounded-2xl">
                <span className="text-xs text-on-surface-variant block mb-1 font-medium">
                  Tuân thủ Calo
                </span>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-headline-md font-bold text-green-light">
                    {calorieComplianceDays}/{totalTrackingDays}
                  </span>
                  <span className="text-xs text-on-surface-variant mb-1">Ngày đạt chỉ tiêu</span>
                </div>
                <div className="w-full h-1.5 bg-surface-dim rounded-full mt-2">
                  <div
                    className="h-full bg-green-light rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round((calorieComplianceDays / totalTrackingDays) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Conditional PT Check-in Card (Only shown if student has a PT) */}
              {hasPt ? (
                <div className="bg-surface-bright/40 border border-white/5 p-4 rounded-2xl">
                  <span className="text-xs text-on-surface-variant block mb-1 font-medium">
                    Check-in PT
                  </span>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-headline-md font-bold text-blue-400">
                      {checkedInPtSessions}
                    </span>
                    <span className="text-xs text-on-surface-variant mb-1">
                      /{totalPtSessions} Buổi đã check-in
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-dim rounded-full mt-2">
                    <div
                      className="h-full bg-blue-400 rounded-full transition-all duration-500"
                      style={{ width: `${ptAttendancePercent}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="bg-surface-bright/40 border border-white/5 p-4 rounded-2xl">
                  <span className="text-xs text-on-surface-variant block mb-1 font-medium">
                    Tự tập luyện
                  </span>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-headline-md font-bold text-green-light">
                      {streakDays}
                    </span>
                    <span className="text-xs text-on-surface-variant mb-1">Ngày kiên trì</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-dim rounded-full mt-2">
                    <div
                      className="h-full bg-green-light rounded-full"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 2. Round Full Month Calendar Grid (4 columns - exact same circular UI as mockup) */}
          <section className="md:col-span-4 bento-card rounded-3xl p-6 flex flex-col justify-between border border-outline-variant/30">
            <div>
              {/* Month Header Navigation */}
              <div className="flex items-center justify-between mb-5 px-1">
                <h3 className="text-base font-headline-md font-bold text-on-surface">
                  {monthNames[currentMonth.getMonth()]}, {currentMonth.getFullYear()}
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevMonth}
                    aria-label="Tháng trước"
                    className="w-8 h-8 rounded-full bg-surface-bright/30 border border-white/10 text-on-surface hover:bg-surface-bright transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button
                    onClick={handleNextMonth}
                    aria-label="Tháng sau"
                    className="w-8 h-8 rounded-full bg-surface-bright/30 border border-white/10 text-on-surface hover:bg-surface-bright transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>

              {/* Weekday Labels (T2 .. CN) */}
              <div className="grid grid-cols-7 gap-y-3 text-center mb-2">
                {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
                  <span key={day} className="text-[11px] font-bold text-on-surface-variant/50">
                    {day}
                  </span>
                ))}
              </div>

              {/* Round Circular Dates Grid (rounded-full) */}
              <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
                {monthCells.map((cell, idx) => {
                  const isSelected = isSameDay(cell.date, selectedDate);
                  const isToday = isSameDay(cell.date, new Date());
                  const hasLog = cell.isCurrentMonth && loggedDayNumbers.includes(cell.dayNumber);

                  return (
                    <div key={idx} className="flex items-center justify-center">
                      <button
                        onClick={() => handleSelectDate(cell.date)}
                        className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex flex-col items-center justify-center text-xs transition-all duration-200 cursor-pointer relative ${
                          isSelected
                            ? "bg-green-light text-dark-slate font-extrabold shadow-[0_0_15px_rgba(102,200,28,0.4)] scale-105"
                            : isToday
                            ? "border-2 border-green-light text-green-light font-bold"
                            : cell.isCurrentMonth
                            ? "text-on-surface hover:bg-surface-bright/50 font-medium"
                            : "text-on-surface-variant/30 hover:bg-surface-bright/20"
                        }`}
                      >
                        <span>{cell.dayNumber}</span>
                        {hasLog && !isSelected && (
                          <span className="w-1 h-1 bg-green-light rounded-full absolute bottom-0.5"></span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {!isSelectedDateToday && (
              <button
                onClick={handleGoToToday}
                className="mt-4 w-full py-2 rounded-xl bg-green-light/15 text-green-light font-bold text-xs hover:bg-green-light/25 transition-colors border border-green-light/30 flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">today</span>
                Xem Hôm nay
              </button>
            )}
          </section>

          {/* 3. Daily Nutrition Details & Home-style Meal Cards */}
          <section className={`md:col-span-12 bento-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 space-y-6 transition-opacity duration-200 ${dailyLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-bento-border/50">
              <div>
                <h2 className="text-xl font-headline-md font-bold text-on-surface">
                  Nhật ký dinh dưỡng
                </h2>
                <span className="text-xs text-on-surface-variant">
                  {isSelectedDateToday ? "Hôm nay" : formatDisplayDate(selectedDate)}
                </span>
              </div>

              <div className="flex flex-col md:items-end">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-on-surface-variant font-medium">Calo đã nạp:</span>
                  <span className="text-base font-bold text-green-light">
                    {consumedCalo} / {targetCalo} kcal
                  </span>
                </div>
                <div className="w-full md:w-64 h-2 bg-surface-bright rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-light rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(102,200,28,0.5)]"
                    style={{ width: `${totalCaloPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Macro Summary Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-3 bg-surface-bright/30 rounded-2xl border border-white/5">
                <span className="text-xs text-on-surface-variant mb-1 font-medium">Đạm (Protein)</span>
                <span className="text-base md:text-lg font-bold text-[#0086C9]">
                  {consumedProtein} <span className="text-xs font-normal text-on-surface-variant">/{targetProtein}g</span>
                </span>
                <span className="text-[11px] text-[#0086C9] font-semibold mt-0.5">{proteinPercent}%</span>
              </div>

              <div className="flex flex-col items-center p-3 bg-surface-bright/30 rounded-2xl border border-white/5">
                <span className="text-xs text-on-surface-variant mb-1 font-medium">Tinh bột (Carbs)</span>
                <span className="text-base md:text-lg font-bold text-[#EF6820]">
                  {consumedCarbs} <span className="text-xs font-normal text-on-surface-variant">/{targetCarbs}g</span>
                </span>
                <span className="text-[11px] text-[#EF6820] font-semibold mt-0.5">{carbsPercent}%</span>
              </div>

              <div className="flex flex-col items-center p-3 bg-surface-bright/30 rounded-2xl border border-white/5">
                <span className="text-xs text-on-surface-variant mb-1 font-medium">Chất béo (Fat)</span>
                <span className="text-base md:text-lg font-bold text-[#F63D68]">
                  {consumedFat} <span className="text-xs font-normal text-on-surface-variant">/{targetFat}g</span>
                </span>
                <span className="text-[11px] text-[#F63D68] font-semibold mt-0.5">{fatPercent}%</span>
              </div>
            </div>

            {/* 4. Daily Meals List - Exact same design as Home Page */}
            <div className="space-y-4 pt-2">
              <h3 className="text-base font-headline-md font-bold text-on-surface px-1">
                Danh sách bữa ăn
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                {mealSlots.map((mealConfig) => {
                  const mealDetails = getMealDetails(mealConfig.id);
                  const hasItems = mealDetails.items.length > 0;

                  return (
                    <div
                      key={mealConfig.id}
                      className="bento-card p-5 flex flex-col justify-between group hover:bg-surface-bright/30 transition-colors border border-bento-border/50 rounded-2xl"
                    >
                      {/* Header: Icon, Meal Name, Total Calories & Status Check */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-surface-bright/40 border border-white/10 flex items-center justify-center text-on-surface-variant">
                            <span
                              className="material-symbols-outlined"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              {mealConfig.icon}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-headline-md text-base font-bold text-on-surface">
                              {mealConfig.name}
                            </h4>
                            <span className="font-body-md text-xs text-green-light font-bold">
                              {mealDetails.totalCalories} kcal
                            </span>
                          </div>
                        </div>

                        {hasItems && (
                          <span
                            className="material-symbols-outlined text-green-light text-2xl"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check_circle
                          </span>
                        )}
                      </div>

                      {/* Food Items List - exact same style as Home page */}
                      <div className="mt-3 pt-3 border-t border-bento-border/40">
                        {hasItems ? (
                          <div className="flex flex-wrap gap-1.5">
                            {mealDetails.items.map((item, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-surface-bright/20 border border-white/10 text-on-surface-variant px-2.5 py-1 rounded-lg font-medium"
                              >
                                {item.foodName}{" "}
                                <span className="text-on-surface-variant/60">
                                  ({item.weightInGram}g)
                                </span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-on-surface-variant/50 italic">
                            Chưa ghi nhận món ăn nào trong ngày này
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </main>

      <BottomNavBar activeTab="history" />
    </div>
  );
}
