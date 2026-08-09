/* eslint-disable @next/next/no-img-element, @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import TopBar from "../../components/navigation/TopBar";
import BottomNavBar from "../../components/navigation/BottomNavBar";
import apiClient from "../../api/axios";

export default function WorkoutPage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkedExercises, setCheckedExercises] = useState<Record<number, boolean>>({
    0: true,
    1: false,
    2: false,
    3: false
  });

  const toggleExercise = (index: number) => {
    setCheckedExercises(prev => ({ ...prev, [index]: !prev[index] }));
  };

  useEffect(() => {
    apiClient.get("/users/me")
      .then(res => {
        setUserData(res.data);
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
  const targetCalo = target.targetCalo || 2000;

  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <TopBar userData={userData} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-container-padding mt-4 md:mt-8 space-y-gutter">
        {/* VIP Header */}
        <section className="bento-card rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden border border-outline-variant/30">
          <div className="flex flex-col md:flex-row justify-between gap-4 z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="bg-green-light/20 text-green-light px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase" style={{ boxShadow: "0 0 15px rgba(102, 200, 28, 0.4)", border: "1px solid rgba(102, 200, 28, 0.5)" }}>VIP MEMBER</span>
                <h1 className="font-headline-md text-xl md:text-2xl text-on-surface font-bold">Xin chào, {userData?.fullName || 'Thành viên'}</h1>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <span className="font-label-lg text-sm">PT Phụ trách: <strong className="text-on-surface">Coach Bui Van Huy</strong></span>
              </div>
            </div>
            <button className="bg-green-light hover:bg-green-light/80 text-dark-slate px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-light/20">
              <span className="material-symbols-outlined">qr_code_scanner</span>
              <span className="text-sm">Check-in</span>
            </button>
          </div>
          
          <div className="space-y-2 z-10 mt-2">
            <div className="flex justify-between font-label-sm text-sm">
              <span className="text-on-surface-variant">Số buổi tập còn lại</span>
              <span className="text-green-light font-bold">8 / 12 Buổi</span>
            </div>
            <div className="h-2 w-full bg-surface-bright rounded-full overflow-hidden">
              <div className="h-full bg-green-light w-[66%] shadow-[0_0_8px_rgba(102,200,28,0.5)]"></div>
            </div>
          </div>
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-green-light/10 blur-[60px] rounded-full pointer-events-none"></div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          <div className="space-y-gutter">
            {/* Category Filter */}
            <section className="space-y-4 mt-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-headline-md font-bold text-xl text-on-surface">Khám phá thêm</h3>
                <button className="text-primary text-sm font-semibold hover:underline">Xem tất cả</button>
              </div>
              <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                <button className="whitespace-nowrap px-6 py-2 rounded-full bg-primary text-dark-slate font-bold transition-all">Mông & Đùi</button>
                <button className="whitespace-nowrap px-6 py-2 rounded-full bg-surface-bright text-on-surface-variant font-medium border border-outline-variant/30 hover:bg-surface-bright/80 transition-all">Ngực</button>
                <button className="whitespace-nowrap px-6 py-2 rounded-full bg-surface-bright text-on-surface-variant font-medium border border-outline-variant/30 hover:bg-surface-bright/80 transition-all">Vai</button>
                <button className="whitespace-nowrap px-6 py-2 rounded-full bg-surface-bright text-on-surface-variant font-medium border border-outline-variant/30 hover:bg-surface-bright/80 transition-all">Lưng</button>
              </div>
            </section>

            {/* Personalized Meal Plan Snippet */}
            <section className="space-y-4 mt-6">
              <h3 className="font-headline-md font-bold text-xl text-on-surface px-2">Thực đơn chỉ định hôm nay</h3>
              <div className="bento-card rounded-2xl p-6 space-y-6">
                <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl flex gap-3">
                  <img alt="Coach Avatar" className="w-10 h-10 rounded-full object-cover border border-primary/40" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1XRmNcoyKgXasEXbx57gFk4z4yYg1TWQqCYoN5IF0Pnrdcx_BCDPYz_Q7DXtum8Co3zPtbTiRp7oqZKNurhC23lmSeWqR-Mv0nBtacFyGZVFw2qgQ0uRL_OpMu0uqmnX2P57wFCVzBslgQI05V0gmJmCbIjbmmLHR6g4yjUvSggPs7e52O9lta5tvwl6S4MAyIrf5htKNl_9RLJodUzAhkfmjNn5W1Rk44Ij7YLcL5nsi-hzt0ntP" />
                  <p className="text-sm text-primary leading-relaxed">
                    <strong className="text-on-surface block mb-1">Coach Huy:</strong>
                    &quot;Ăn đúng lượng Carbs trước tập 1 tiếng để có sức nâng tạ nhé!&quot;
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-4 bg-surface-bright/40 p-3 rounded-xl border border-white/5">
                    <div className="w-12 h-12 rounded-lg bg-orange-400/10 flex items-center justify-center text-orange-400">
                      <span className="material-symbols-outlined">wb_twilight</span>
                    </div>
                    <div className="grow">
                      <div className="flex justify-between">
                        <h4 className="font-bold text-on-surface text-sm">Bữa Sáng</h4>
                        <span className="text-on-surface-variant text-[11px]">450 kcal</span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">3 Trứng ốp la + 100g Yến mạch</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-surface-bright/40 p-3 rounded-xl border border-white/5">
                    <div className="w-12 h-12 rounded-lg bg-green-light/10 flex items-center justify-center text-green-light">
                      <span className="material-symbols-outlined">wb_sunny</span>
                    </div>
                    <div className="grow">
                      <div className="flex justify-between">
                        <h4 className="font-bold text-on-surface text-sm">Bữa Trưa</h4>
                        <span className="text-on-surface-variant text-[11px]">650 kcal</span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">200g Ức gà + 150g Gạo lứt</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="bg-surface-bright/60 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-on-surface-variant">Tổng Kcal hôm nay</span>
                      <span className="text-on-surface font-bold">1,850 / {targetCalo} Kcal</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-dim rounded-full overflow-hidden">
                      <div className="h-full bg-green-light w-[92%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-gutter">
            {/* Today's Focus Workout */}
            <section className="space-y-4 mt-6">
              <div className="flex items-center justify-between px-2">
                <div className="space-y-0.5">
                  <h2 className="font-headline-md font-bold text-xl text-on-surface uppercase">Lịch tập hôm nay</h2>
                  <p className="text-on-surface-variant text-sm">Mông & Đùi (Legs & Glutes Focus)</p>
                </div>
                <div className="bg-surface-bright px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/5">
                  <span className="material-symbols-outlined text-orange-400 text-sm">timer</span>
                  <span className="text-xs text-on-surface font-bold">60 Phút</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {[
                  { name: "Barbell Squat", desc: "4 sets • 10 reps • 80kg", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDtyg6tKCA1D9ajpiai_6OH_THmAkbOsOu1xy_VPxgZOupl1Zov8cjDgWD8t9HiOG3HhdiO1EROHd25r3uiBRtTYh7HLusnnIiUGCkkmYkNlNOusqV3aiywlJnCxzU93pxl4laRwicA0lX2W02tfy_MlbA0zpyHgQQCTJJkLfJITrqLmBnAcGW_S7FIEA_WEqq3wUXMUMcToIthhRehl_oLHHhzn-IuvquxvwhEinAz5zziGzQPeMKh" },
                  { name: "Romanian Deadlift", desc: "4 sets • 12 reps • 60kg", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPH9chOainC68ehBmXTvUFFluG47WEzOlq-8KcFPX0VLZJDHg1BghKMAXVimngcw9c-2GNo0TXMugcCSNbmwXVi1ojpNJgooNS3guuCbE3SYoITEN8xGgtpFpOBBhKQ2BLssL2YtkQRZmTzSvRV3qPJz1zMCIb0zxmU0qtdX-7uW5Lwh9PJ2JTPrBeZmFfdqd6c8oweWh39G-RuPXfHF2zsC56hXlq5JUPjCUis3j7abaZ8XMUPUdS" },
                  { name: "Hip Thrust", desc: "3 sets • 15 reps • 90kg", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAsWHC2Kcvy2Xi29XyaqYtNYZAHJv07QuluEtqH_q3oHHIwFwzD683-KZ6tlcHVz4Fl0gD1j8ABxwyj9_WMufi4JA9Cz_aw5g8wpslhDduUWa74A_rUN_CqJRq9fFIHOhVWnxpSxcpDy4Gt6ckoUE_8Tp2GxV83kzIDJkpy74F4iLqys-UVKp5QiQmy0hDcVCT1puuD9pbjf6ELZegqHMTd-mdODjXcUoiYyKc5kLizVk9Be_AuMU-k" }
                ].map((exercise, index) => (
                  <div key={index} className={`rounded-2xl h-44 overflow-hidden relative transition-all ${checkedExercises[index] ? 'border-2 border-green-light/40' : 'border border-white/10'}`} 
                       style={{ backgroundImage: `url('${exercise.img}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col justify-end z-10">
                      <div className="flex justify-between items-end w-full">
                        <div>
                          <h4 className="font-bold text-white text-lg font-headline-md leading-tight">{exercise.name}</h4>
                          <p className="text-white/80 text-[10px] uppercase tracking-wider mt-1">{exercise.desc}</p>
                        </div>
                        <button onClick={() => toggleExercise(index)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm ${checkedExercises[index] ? 'bg-green-light text-dark-slate' : 'bg-black/40 border-2 border-white/30 text-white/80 hover:border-green-light'}`}>
                          <span className="material-symbols-outlined text-2xl" style={checkedExercises[index] ? { fontVariationSettings: "'FILL' 1" } : {}}>check</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full py-4 rounded-xl bg-green-light text-dark-slate font-bold font-headline-md flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-green-light/20 mt-4">
                <span className="material-symbols-outlined">play_arrow</span>
                Bắt đầu buổi tập
              </button>
            </section>
          </div>
        </div>
      </main>

      <BottomNavBar activeTab="workout" />
    </div>
  );
}
