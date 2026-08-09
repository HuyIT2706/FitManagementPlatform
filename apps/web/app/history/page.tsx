"use client";

import { useEffect, useState } from "react";
import TopBar from "../../components/navigation/TopBar";
import BottomNavBar from "../../components/navigation/BottomNavBar";

export default function HistoryPage() {
  const [userData, setUserData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch("http://localhost:3100/users/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    })
    .then(data => {
      setUserData(data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      localStorage.removeItem("jwt_token");
      window.location.href = "/login";
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

  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <TopBar userData={userData} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-container-padding mt-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* 1. Streak Hero Card (Bento Grid 8 columns) */}
          <section className="md:col-span-8 bento-card rounded-2xl p-6 md:p-8 relative overflow-hidden border border-outline-variant/30">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-green-light/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-sm font-headline-md text-on-surface-variant mb-1">Chuỗi Kỷ Luật</h2>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-orange-400 text-4xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                  <h1 className="text-3xl md:text-4xl font-headline-md text-on-surface font-extrabold" style={{ textShadow: "0 0 10px rgba(255, 185, 95, 0.4)" }}>
                    14 Ngày Liên Tục
                  </h1>
                </div>
                <p className="text-sm text-on-surface-variant mt-2 max-w-md">
                  Bạn đang giữ kỷ luật rất tốt! Hãy tiếp tục duy trì.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-surface-bright/40 border border-white/5 p-4 rounded-xl">
                <span className="text-xs text-on-surface-variant block mb-1">Tuân thủ Calo</span>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-headline-md font-bold text-green-light">18/20</span>
                  <span className="text-xs text-on-surface-variant mb-1.5">Ngày</span>
                </div>
                <div className="w-full h-1.5 bg-surface-dim rounded-full mt-2">
                  <div className="h-full bg-green-light rounded-full" style={{ width: "90%" }}></div>
                </div>
              </div>
              
              <div className="bg-surface-bright/40 border border-white/5 p-4 rounded-xl">
                <span className="text-xs text-on-surface-variant block mb-1">Check-in PT</span>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-headline-md font-bold text-blue-400">8</span>
                  <span className="text-xs text-on-surface-variant mb-1.5">Buổi đã tập</span>
                </div>
                <div className="w-full h-1.5 bg-surface-dim rounded-full mt-2">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: "65%" }}></div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Calendar Card (Bento Grid 4 columns) */}
          <section className="md:col-span-4 bento-card rounded-[30px] p-6 md:p-8 flex flex-col h-full border border-outline-variant/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-headline-md font-bold text-on-surface">Tháng 8, 2026</h3>
              <div className="flex gap-2">
                <button className="material-symbols-outlined text-on-surface-variant hover:text-green-light transition-colors">chevron_left</button>
                <button className="material-symbols-outlined text-on-surface-variant hover:text-green-light transition-colors">chevron_right</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-y-3 gap-x-1 flex-grow text-center h-full">
              {/* Weekdays */}
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
                <span key={day} className="text-[10px] font-bold text-on-surface-variant/50">{day}</span>
              ))}
              
              {/* Days Grid */}
              <div className="relative py-1 text-xs text-on-surface-variant/40">27</div>
              <div className="relative py-1 text-xs text-on-surface-variant/40">28</div>
              <div className="relative py-1 text-xs text-on-surface-variant/40">29</div>
              <div className="relative py-1 text-xs text-on-surface-variant/40">30</div>
              <div className="relative py-1 text-xs text-on-surface-variant/40">31</div>
              
              {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(day => (
                <div key={day} className="relative py-1 text-xs font-semibold text-on-surface">
                  {day}
                  {[3,5,6,11,13,17].includes(day) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-light rounded-full"></span>
                  )}
                </div>
              ))}
              
              <div className="relative w-8 h-8 flex items-center justify-center mx-auto text-xs text-dark-slate font-bold border border-green-light bg-green-light rounded-full shadow-[0_0_15px_rgba(102,200,28,0.4)]">
                18
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-dark-slate rounded-full border border-green-light"></span>
              </div>
              
              {[19,20,21,22,23].map(day => (
                <div key={day} className="relative py-1 text-xs font-semibold text-on-surface">{day}</div>
              ))}
            </div>
          </section>

          {/* 3. Daily Log Detail (Main Column) */}
          <section className="md:col-span-12 bento-card rounded-2xl p-6 md:p-8 border border-outline-variant/30 mt-4 md:mt-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-xl font-headline-md font-bold text-on-surface">Nhật ký dinh dưỡng</h2>
                <span className="text-sm text-on-surface-variant">Ngày 18/08/2026</span>
              </div>
              <div className="flex flex-col md:items-end">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-sm font-bold text-green-light">1,920 / 2,100 kcal</span>
                </div>
                <div className="w-full md:w-64 h-2 bg-surface-bright rounded-full overflow-hidden">
                  <div className="h-full bg-green-light rounded-full" style={{ width: "91%" }}></div>
                </div>
              </div>
            </div>

            {/* Macro Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter mb-8">
              <div className="flex flex-col items-center p-4 bg-surface-bright/30 rounded-xl border border-white/5">
                <div className="relative w-20 h-20 mb-3">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" fill="transparent" r="34" stroke="#2f3632" strokeWidth="6"></circle>
                    <circle cx="40" cy="40" fill="transparent" r="34" stroke="#0086C9" strokeDasharray="213.6" strokeDashoffset="21.36" strokeWidth="6" strokeLinecap="round"></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-on-surface">90%</span>
                  </div>
                </div>
                <span className="text-xs text-on-surface-variant mb-1 font-semibold uppercase tracking-wider">Protein</span>
                <span className="text-lg font-headline-md font-bold" style={{ color: "#0086C9" }}>135/150g</span>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-surface-bright/30 rounded-xl border border-white/5">
                <div className="relative w-20 h-20 mb-3">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" fill="transparent" r="34" stroke="#2f3632" strokeWidth="6"></circle>
                    <circle cx="40" cy="40" fill="transparent" r="34" stroke="#EF6820" strokeDasharray="213.6" strokeDashoffset="10.68" strokeWidth="6" strokeLinecap="round"></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-on-surface">95%</span>
                  </div>
                </div>
                <span className="text-xs text-on-surface-variant mb-1 font-semibold uppercase tracking-wider">Carbs</span>
                <span className="text-lg font-headline-md font-bold" style={{ color: "#EF6820" }}>190/200g</span>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-surface-bright/30 rounded-xl border border-white/5">
                <div className="relative w-20 h-20 mb-3">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" fill="transparent" r="34" stroke="#2f3632" strokeWidth="6"></circle>
                    <circle cx="40" cy="40" fill="transparent" r="34" stroke="#F63D68" strokeDasharray="213.6" strokeDashoffset="42.72" strokeWidth="6" strokeLinecap="round"></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-on-surface">80%</span>
                  </div>
                </div>
                <span className="text-xs text-on-surface-variant mb-1 font-semibold uppercase tracking-wider">Fats</span>
                <span className="text-lg font-headline-md font-bold" style={{ color: "#F63D68" }}>48/60g</span>
              </div>
            </div>

            {/* 4. Meal List */}
            <div className="space-y-4">
              <h3 className="text-sm font-headline-md font-bold text-on-surface-variant px-1 uppercase tracking-wider">Danh sách bữa ăn</h3>
              
              <div className="group flex items-center justify-between p-4 bg-surface-bright/30 backdrop-blur-md rounded-2xl border border-white/5 hover:border-green-light/30 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-light/10 flex items-center justify-center text-green-light border border-green-light/20">
                    <span className="material-symbols-outlined text-2xl">wb_twilight</span>
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-on-surface block">Bữa Sáng</span>
                    <span className="text-xs text-on-surface-variant">450 kcal • 07:30 AM</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-green-light text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
              </div>
              
              <div className="group p-4 bg-surface-bright/30 backdrop-blur-md rounded-2xl border-l-4 border-l-green-light shadow-lg shadow-green-light/5 border-t border-r border-b border-white/5 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-light/10 flex items-center justify-center text-green-light border border-green-light/20">
                      <span className="material-symbols-outlined text-2xl">wb_sunny</span>
                    </div>
                    <div>
                      <span className="text-sm font-extrabold text-on-surface block">Bữa Trưa</span>
                      <span className="text-xs text-on-surface-variant">680 kcal • 12:30 PM</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-green-light text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                </div>
                <div className="ml-16 bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-blue-400 text-lg">chat_bubble</span>
                  <p className="text-xs text-blue-300 italic leading-relaxed">Note từ PT: &quot;Bữa trưa ăn chuẩn! Tiếp tục duy trì lượng đạm này nhé.&quot;</p>
                </div>
              </div>
              
              <div className="group flex items-center justify-between p-4 bg-surface-bright/30 backdrop-blur-md rounded-2xl border border-white/5 hover:border-green-light/30 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-light/10 flex items-center justify-center text-green-light border border-green-light/20">
                    <span className="material-symbols-outlined text-2xl">bedtime</span>
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-on-surface block">Bữa Tối</span>
                    <span className="text-xs text-on-surface-variant">550 kcal • 07:00 PM</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-green-light text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <BottomNavBar activeTab="history" />
    </div>
  );
}
