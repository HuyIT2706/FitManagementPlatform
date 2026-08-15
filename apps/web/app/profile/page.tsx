/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Header from "../../components/ui/Header";
import BottomNavBar from "../../components/navigation/BottomNavBar";
import apiClient from "../../api/axios";
import { toast } from "../../utils/toast";
import type { UserDataHome } from "../../interface";

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserDataHome | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<UserDataHome>("/users/me")
      .then((res) => {
        setUserData(res.data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error("Error fetching user profile data:", err);
        setLoading(false);
      });
  }, []);

  const handleLogout = (): void => {
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

  // Pure View: Display metrics directly from Backend response
  const heightCm: number = userData?.height ?? 175;
  const weightKg: number = userData?.bodyMetrics?.[0]?.weight ?? userData?.weight ?? 80;
  const targetWeightKg: number = userData?.targetWeight ?? 70;
  
  const ageYears: number = userData?.dateOfBirth
    ? new Date().getFullYear() - new Date(userData.dateOfBirth).getFullYear()
    : (userData?.age ?? 24);

  // Values calculated directly on Backend (/users/me)
  const bmr = userData?.bmr ?? 1790;
  const tdee = userData?.tdee ?? 3088;
  const bmi = userData?.bmi ?? 24.5;
  const goal = userData?.goal ?? "LOSE_WEIGHT";
  const suggestedOffset = userData?.suggestedOffset ?? -400;

  // Target Intake Calories (From PT / NutritionTarget DB or deficit fallback)
  const target = userData?.nutritionTargets?.[0];
  const targetCalo = target?.targetCalo ?? (tdee + suggestedOffset);
  const targetProtein = target?.targetProtein ?? Math.round((targetCalo * 0.3) / 4);
  const targetCarbs = target?.targetCarbs ?? Math.round((targetCalo * 0.4) / 4);
  const targetFat = target?.targetFat ?? Math.round((targetCalo * 0.3) / 9);

  // Activity level formatting
  const activityLevelLabelMap: Record<string, string> = {
    SEDENTARY: "Ít vận động",
    LIGHTLY_ACTIVE: "Vận động nhẹ",
    MODERATELY_ACTIVE: "Vận động vừa phải",
    VERY_ACTIVE: "Vận động cao (TDEE x1.725)",
    EXTRA_ACTIVE: "Vận động rất cao",
  };
  const activityLabel = userData?.activityLevel
    ? (activityLevelLabelMap[userData.activityLevel] || userData.activityLevel)
    : "Vận động cao (TDEE x1.725)";

  const goalTextMap: Record<string, string> = {
    LOSE_WEIGHT: "Mục tiêu Giảm cân (Thâm hụt Calo)",
    GAIN_WEIGHT: "Mục tiêu Tăng cân (Thặng dư Calo)",
    MAINTAIN: "Mục tiêu Giữ cân (Cân bằng Calo)",
  };

  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="px-4 md:px-10 pt-4 max-w-7xl mx-auto flex flex-col gap-4">
        {/* Profile Header Hero (Bento Cell) */}
        <section className="bento-card rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden border border-outline-variant/30">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-light/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative">
            {userData?.avatarUrl ? (
              <img className="w-24 h-24 rounded-full object-cover border-2 border-surface shadow-lg" alt="Profile" src={userData.avatarUrl} />
            ) : (
              <div className="w-24 h-24 rounded-full bg-green-light text-dark-slate flex items-center justify-center text-3xl font-extrabold shadow-lg">
                {userData?.fullName?.charAt(0) || "U"}
              </div>
            )}
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-light rounded-full border-2 border-surface-bright shadow-[0_0_8px_rgba(102,200,28,0.6)]"></div>
          </div>
          
          <div className="flex flex-col items-center md:items-start flex-1 text-center md:text-left z-10">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-headline-md font-bold">{userData?.fullName || 'Học Viên VIP'}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-green-light/10 border border-green-light/30 text-green-light text-[10px] font-bold shadow-[0_0_10px_rgba(102,200,28,0.2)] uppercase">VIP MEMBER</span>
            </div>
            <p className="text-sm font-body-md text-on-surface-variant mb-3">{userData?.email || 'user@example.com'}</p>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant bg-surface-bright/40 px-3 py-2 rounded-lg border border-white/5">
              <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>sports_martial_arts</span>
              <span className="font-semibold">
                {userData?.assignedPt ? `PT Phụ trách: Coach ${userData.assignedPt.fullName}` : "PT Phụ trách: Coach Bùi Văn Huy"}
              </span>
            </div>
          </div>
          
          <button 
            type="button"
            suppressHydrationWarning
            className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant text-green-light font-bold text-xs hover:bg-green-light/10 transition-colors z-10 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">edit</span>
            Chỉnh sửa hồ sơ
          </button>
        </section>

        {/* PT Coach Code & QR Binding Card */}
        <section className="bento-card rounded-2xl p-5 md:p-6 border border-primary/30 bg-primary/5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">qr_code_scanner</span>
            <h3 className="font-bold text-on-surface text-base">Liên kết với Huấn Luyện Viên PT</h3>
          </div>
          <p className="text-xs text-on-surface-variant font-medium">
            Nhập Mã PT duy nhất của Coach (ví dụ: <strong className="text-primary font-mono">PT-HUY066</strong>) hoặc Mã Mời từ Gmail để kết nối 1-1.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const input = (form.elements.namedItem("ptCode") as HTMLInputElement).value;
              if (!input) {
                toast.error("Vui lòng nhập Mã PT!");
                return;
              }
              apiClient
                .post<{ message?: string }>("/pt/students/bind", { ptCodeOrInviteCode: input })
                .then((res) => {
                  toast.success(res.data.message || "Đã liên kết 1-1 với Coach thành công!");
                })
                .catch(() => {
                  toast.error("Không thể kết nối với PT Code này!");
                });
            }}
            className="flex flex-col sm:flex-row items-center gap-3 pt-1"
          >
            <input
              type="text"
              name="ptCode"
              suppressHydrationWarning
              placeholder="Gõ Mã PT (ví dụ: PT-HUY066 / INV-9921)"
              className="w-full sm:flex-1 bg-surface-bright border border-white/10 rounded-xl px-4 py-2.5 text-xs text-on-surface font-extrabold focus:border-primary outline-none tracking-wider uppercase font-mono"
            />
            <button
              type="submit"
              suppressHydrationWarning
              className="w-full sm:w-auto px-6 py-2.5 bg-primary text-dark-slate font-extrabold text-xs rounded-xl shadow-[0_0_12px_rgba(102,200,28,0.4)] hover:bg-primary/90 transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">link</span>
              Kết nối PT Coach
            </button>
          </form>
        </section>

        {/* Biometrics Grid (Bento Structure) */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bento-card rounded-2xl p-4 flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold mb-2">
              <span className="material-symbols-outlined text-base">cake</span> Tuổi
            </div>
            <div className="text-3xl font-headline-md font-bold text-on-surface">{ageYears}</div>
          </div>
          
          <div className="bento-card rounded-2xl p-4 flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold mb-2">
              <span className="material-symbols-outlined text-base">height</span> Chiều cao
            </div>
            <div className="text-3xl font-headline-md font-bold text-on-surface">{heightCm}<span className="text-sm font-normal text-on-surface-variant ml-1">cm</span></div>
          </div>
          
          <div className="bento-card rounded-2xl p-4 flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold mb-2">
              <span className="material-symbols-outlined text-base">weight</span> Cân nặng
            </div>
            <div className="text-3xl font-headline-md font-bold text-on-surface">{weightKg}<span className="text-sm font-normal text-on-surface-variant ml-1">kg</span></div>
          </div>
          
          <div className="bento-card rounded-2xl p-4 flex flex-col justify-between bg-green-light/10 border border-green-light/30">
            <div className="flex items-center gap-2 text-green-light text-xs font-semibold mb-2">
              <span className="material-symbols-outlined text-base">flag</span> Mục tiêu
            </div>
            <div className="text-3xl font-headline-md font-bold text-green-light">{targetWeightKg}<span className="text-sm font-normal text-green-light/70 ml-1">kg</span></div>
          </div>
          
          {/* Wide Summary Card: BMR, TDEE, BMI calculated directly from Backend */}
          <div className="col-span-2 md:col-span-4 bento-card rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 border border-outline-variant/30 items-center">
            {/* BMI */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5 shrink-0">
                <span className="material-symbols-outlined text-primary text-2xl">monitor_weight</span>
              </div>
              <div>
                <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">BMI (Tính từ Backend)</div>
                <div className="text-xl font-bold text-primary">{bmi} • {bmi < 18.5 ? "Thiếu cân" : bmi < 24.9 ? "Bình thường" : "Thừa cân"}</div>
              </div>
            </div>

            {/* BMR */}
            <div className="flex items-center gap-4 md:border-l border-white/10 md:pl-6">
              <div className="w-12 h-12 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5 shrink-0">
                <span className="material-symbols-outlined text-blue-400 text-2xl">bolt</span>
              </div>
              <div>
                <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">BMR (Năng lượng cơ bản)</div>
                <div className="text-xl font-bold text-blue-400">{bmr} <span className="text-xs font-normal text-white/70">kcal/ngày</span></div>
              </div>
            </div>

            {/* TDEE */}
            <div className="flex items-center gap-4 md:border-l border-white/10 md:pl-6">
              <div className="w-12 h-12 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5 shrink-0">
                <span className="material-symbols-outlined text-orange-400 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              </div>
              <div>
                <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">TDEE (Backend Tính Toán)</div>
                <div className="text-xl font-bold text-orange-400">{tdee} <span className="text-xs font-normal text-white/70">kcal/ngày</span></div>
                <div className="text-[11px] text-on-surface-variant font-medium">{activityLabel}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Transformation Journey Slider */}
        <section className="bento-card rounded-2xl p-6 md:p-8 flex flex-col gap-4 relative overflow-hidden border border-outline-variant/30">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-headline-md font-bold">Hành Trình Lột Xác</h3>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-light/10 border border-green-light/30 text-green-light text-[10px] font-bold shadow-[0_0_10px_rgba(102,200,28,0.3)] w-max">
                {goalTextMap[goal] || "Mục tiêu tập luyện"} ({weightKg}kg -&gt; {targetWeightKg}kg)
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                type="button"
                suppressHydrationWarning
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add_a_photo</span>
                Cập nhật ảnh mới
              </button>
              <button 
                type="button"
                suppressHydrationWarning
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-bright/40 border border-white/5 text-on-surface-variant text-xs font-semibold hover:bg-surface-bright/80 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">history</span>
                Lịch sử
              </button>
            </div>
          </div>
          
          <div className="relative w-full h-80 md:h-96 rounded-xl overflow-hidden border border-white/10 group">
            {/* After Image */}
            <img alt="After" className="absolute inset-0 w-full h-full object-cover" src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=80" />
            <div className="absolute bottom-4 right-4 px-3 py-1 bg-surface-dim/90 backdrop-blur-md border border-green-light rounded-lg text-green-light text-xs font-bold z-20">
              Hiện tại • {weightKg} kg
            </div>
            
            {/* Before Image (Overlay 50%) */}
            <div className="absolute inset-0 w-1/2 overflow-hidden border-r-2 border-green-light z-10">
              <img alt="Before" className="absolute inset-0 h-full object-cover max-w-none" style={{ width: "200%" }} src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80" />
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-surface-dim/90 backdrop-blur-md border border-white/20 rounded-lg text-on-surface text-xs font-bold">
                Bắt đầu • {weightKg + 5} kg
              </div>
            </div>
            
            <div className="absolute top-0 bottom-0 left-1/2 -ml-5 flex items-center justify-center z-30 pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-green-light shadow-[0_0_15px_rgba(102,200,28,0.6)] flex items-center justify-center text-dark-slate">
                <span className="material-symbols-outlined font-bold">unfold_more</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-on-surface-variant opacity-80">
            <span className="material-symbols-outlined text-base">lock</span>
            <p>Ảnh của bạn được bảo mật riêng tư chỉ bạn và PT phụ trách có quyền xem.</p>
          </div>
        </section>

        {/* Daily Macro Target Master Card */}
        <section className="bento-card rounded-2xl p-6 md:p-8 flex flex-col gap-6 border border-outline-variant/30">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-headline-md font-bold mb-1">Mục tiêu Calo & Macro Nạp Vào</h3>
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-bright/40 border border-white/5 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                Chỉ định bởi PT (Calo Nạp vào = TDEE {suggestedOffset >= 0 ? `+ ${suggestedOffset}` : `- ${Math.abs(suggestedOffset)}`})
              </div>
            </div>
            <button 
              type="button"
              suppressHydrationWarning
              className="text-primary text-xs font-semibold flex items-center hover:underline cursor-pointer"
            >
              Yêu cầu cập nhật <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
          
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-between items-end">
              <span className="text-4xl font-headline-md font-extrabold text-on-surface leading-none">
                {targetCalo} <span className="text-xl font-body-md text-on-surface-variant font-medium">kcal</span>
              </span>
              <span className="text-sm font-semibold text-on-surface-variant">Mục tiêu hàng ngày</span>
            </div>
            <div className="h-3 w-full bg-surface-dim rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-green-light rounded-full shadow-[0_0_10px_rgba(102,200,28,0.5)]" style={{ width: "100%" }}></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface-bright/40 border border-white/5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-on-surface-variant uppercase tracking-wider">Protein</span>
                <span className="text-on-surface font-bold">{targetProtein}g</span>
              </div>
              <div className="h-2 w-full bg-surface-dim rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: "30%" }}></div>
              </div>
            </div>
            
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface-bright/40 border border-white/5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-on-surface-variant uppercase tracking-wider">Carbs</span>
                <span className="text-on-surface font-bold">{targetCarbs}g</span>
              </div>
              <div className="h-2 w-full bg-surface-dim rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 rounded-full" style={{ width: "50%" }}></div>
              </div>
            </div>
            
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface-bright/40 border border-white/5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-on-surface-variant uppercase tracking-wider">Fats</span>
                <span className="text-on-surface font-bold">{targetFat}g</span>
              </div>
              <div className="h-2 w-full bg-surface-dim rounded-full overflow-hidden">
                <div className="h-full bg-red-400 rounded-full" style={{ width: "20%" }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Settings Bento List */}
        <section className="bento-card rounded-2xl flex flex-col p-2 border border-outline-variant/30 mt-4">
          <button 
            type="button"
            suppressHydrationWarning
            className="flex items-center justify-between p-4 hover:bg-surface-bright/40 rounded-xl transition-colors cursor-pointer group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5 group-hover:bg-green-light/10 transition-colors shrink-0">
                <span className="material-symbols-outlined text-on-surface group-hover:text-green-light transition-colors">fitness_center</span>
              </div>
              <div>
                <div className="text-sm font-bold text-on-surface">Quản lý Gói tập</div>
                <div className="text-xs font-medium text-on-surface-variant mt-0.5">Gói PT 1:1 - Đã kích hoạt</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </button>
          
          <div className="w-full h-px bg-white/5"></div>
          
          <button 
            type="button"
            suppressHydrationWarning
            className="flex items-center justify-between p-4 hover:bg-surface-bright/40 rounded-xl transition-colors cursor-pointer group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5 group-hover:bg-green-light/10 transition-colors shrink-0">
                <span className="material-symbols-outlined text-on-surface group-hover:text-green-light transition-colors">notifications</span>
              </div>
              <div className="text-sm font-bold text-on-surface">Cài đặt thông báo</div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </button>
          
          <div className="w-full h-px bg-white/5"></div>
          
          <button 
            type="button"
            suppressHydrationWarning
            onClick={handleLogout} 
            className="flex items-center justify-between p-4 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer w-full text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
                <span className="material-symbols-outlined text-red-400">logout</span>
              </div>
              <div className="text-sm font-bold text-red-400">Đăng xuất</div>
            </div>
            <span className="material-symbols-outlined text-red-400">chevron_right</span>
          </button>
        </section>
      </main>

      <BottomNavBar activeTab="profile" />
    </div>
  );
}
