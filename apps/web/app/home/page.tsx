"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopBar from "../../components/navigation/TopBar";
import BottomNavBar from "../../components/navigation/BottomNavBar";
import apiClient from "../../api/axios";
import type { UserDataHome, DailyNutritionData } from "../../interface";

export default function Home() {
  const [userData, setUserData] = useState<UserDataHome | null>(null);
  const [dailyData, setDailyData] = useState<DailyNutritionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get<UserDataHome>("/users/me"),
      apiClient.get<DailyNutritionData>("/nutrition/daily")
    ])
      .then(([userRes, dailyRes]) => {
        setUserData(userRes.data);
        setDailyData(dailyRes.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

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
      case 2: return [
        { id: 'BREAKFAST', name: 'Bữa Sáng', icon: 'wb_twilight' },
        { id: 'DINNER', name: 'Bữa Tối', icon: 'dark_mode' },
      ];
      case 3: return [
        { id: 'BREAKFAST', name: 'Bữa Sáng', icon: 'wb_twilight' },
        { id: 'LUNCH', name: 'Bữa Trưa', icon: 'light_mode' },
        { id: 'DINNER', name: 'Bữa Tối', icon: 'dark_mode' },
      ];
      case 5: return [
        { id: 'BREAKFAST', name: 'Bữa Sáng', icon: 'wb_twilight' },
        { id: 'MORNING_SNACK', name: 'Phụ Sáng', icon: 'bakery_dining' },
        { id: 'LUNCH', name: 'Bữa Trưa', icon: 'light_mode' },
        { id: 'AFTERNOON_SNACK', name: 'Phụ Chiều', icon: 'icecream' },
        { id: 'DINNER', name: 'Bữa Tối', icon: 'dark_mode' },
      ];
      case 4:
      default: return [
        { id: 'BREAKFAST', name: 'Bữa Sáng', icon: 'wb_twilight' },
        { id: 'LUNCH', name: 'Bữa Trưa', icon: 'light_mode' },
        { id: 'DINNER', name: 'Bữa Tối', icon: 'dark_mode' },
        { id: 'SNACK', name: 'Bữa Phụ', icon: 'icecream' },
      ];
    }
  };

  const caloPercentage = targetCalo ? Math.min((consumedCalo / targetCalo) * 100, 100) : 0;
  const proteinPercentage = targetProtein ? Math.min((consumedProtein / targetProtein) * 100, 100) : 0;
  const carbsPercentage = targetCarbs ? Math.min((consumedCarbs / targetCarbs) * 100, 100) : 0;
  const fatPercentage = targetFat ? Math.min((consumedFat / targetFat) * 100, 100) : 0;

  const circumference = 816; // From CSS: 2 * Math.PI * 130
  const strokeDashoffset = circumference - (caloPercentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <TopBar userData={userData} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-container-padding md:mt-8 ">
        {/* Horizontal Calendar Strip */}
        <section className="flex overflow-x-auto no-scrollbar gap-3 py-2 -mx-container-padding px-container-padding snap-x">
          <div className=" flex flex-col items-center justify-center p-3 rounded-2xl bento-card w-16 h-20 snap-center opacity-70">
            <span className="font-body-md text-sm text-on-surface-variant">Th 2</span>
            <span className="font-headline-md text-xl font-bold mt-1">17</span>
          </div>
          <div className=" flex flex-col items-center justify-center p-3 rounded-2xl bento-card w-16 h-20 snap-center opacity-70">
            <span className="font-body-md text-sm text-on-surface-variant">Th 3</span>
            <span className="font-headline-md text-xl font-bold mt-1">18</span>
          </div>
          <div className=" flex flex-col items-center justify-center p-3 rounded-2xl bento-card w-16 h-20 snap-center opacity-70">
            <span className="font-body-md text-sm text-on-surface-variant">Th 4</span>
            <span className="font-headline-md text-xl font-bold mt-1">19</span>
          </div>
          <div className=" flex flex-col items-center justify-center p-3 rounded-2xl bg-green-light/20 border border-green-light w-22 h-20 snap-center relative shadow-[0_0_15px_rgba(102,200,28,0.2)]">
            <span className="font-label-lg text-[12px] text-green-light font-bold whitespace-nowrap">Hôm nay</span>
            <span className="font-stats-xl text-3xl font-extrabold text-green-light mt-1">20</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-light rounded-full shadow-[0_0_10px_rgba(102,200,28,0.8)]"></div>
          </div>
          <div className=" flex flex-col items-center justify-center p-3 rounded-2xl bento-card w-16 h-20 snap-center opacity-70">
            <span className="font-body-md text-sm text-on-surface-variant">Th 5</span>
            <span className="font-headline-md text-xl font-bold mt-1">21</span>
          </div>
          <div className=" flex flex-col items-center justify-center p-3 rounded-2xl bento-card w-16 h-20 snap-center opacity-70">
            <span className="font-body-md text-sm text-on-surface-variant">Th 6</span>
            <span className="font-headline-md text-xl font-bold mt-1">22</span>
          </div>
        </section>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Hero Bento Card (Fuel) */}
          <div className="bento-card col-span-1 md:col-span-8 p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-green-light/5 rounded-full blur-[60px] pointer-events-none"></div>
            <div className="w-full flex justify-between items-center mb-6 z-10">
              <h2 className="font-headline-md text-xl md:text-2xl text-on-surface tracking-tight font-bold">NHIÊN LIỆU HÀNG NGÀY</h2>
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
                  <Link href={`/add-meal?type=${meal.id}`} className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-green-light/20 hover:text-green-light hover:border-green-light transition-all">
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
