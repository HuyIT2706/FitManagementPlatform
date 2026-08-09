/* eslint-disable @next/next/no-img-element, @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import TopBar from "../../components/navigation/TopBar";
import BottomNavBar from "../../components/navigation/BottomNavBar";
import apiClient from "../../api/axios";

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const bmi = 24.5; // placeholder
  const target = userData?.nutritionTargets?.[0] || {};
  const tdee = target.targetCalo || 2200;
  
  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <TopBar userData={userData} onLogout={handleLogout} />

      <main className="px-4 md:px-10 pt-4 max-w-7xl mx-auto flex flex-col gap-4">
        {/* Profile Header Hero (Bento Cell) */}
        <section className="bento-card rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden border border-outline-variant/30">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-light/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative">
            <img className="w-24 h-24 rounded-full object-cover border-2 border-surface shadow-lg" alt="Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMBVLKNM-lFHkWyFVd6boYL3FvAjGaQRVY6fJsb16I_pK9JZmWel19ylG3ZgbSmRjGZ8CKVPHVBttJ4yMbbjV_JYSNHdG_iYstn4z8izGeMr01q-zIZkUNkOTsPPm3dI_mrQadhL0XrDVX3goldTtgpbCcA9ISvBad9bBmag0kYJgTN7_4aU6x5JbzdSV2gKIHUqciGjxMqn0fSf_WfqlwpKlDRa3fURFhfLkQf-6U1CWTXzvoorie" />
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-light rounded-full border-2 border-surface-bright shadow-[0_0_8px_rgba(102,200,28,0.6)]"></div>
          </div>
          
          <div className="flex flex-col items-center md:items-start flex-1 text-center md:text-left z-10">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-headline-md font-bold">{userData?.fullName || 'Bùi Văn Huy'}</h2>
              <span className="px-2 py-0.5 rounded-full bg-green-light/10 border border-green-light/30 text-green-light text-[10px] font-bold shadow-[0_0_10px_rgba(102,200,28,0.2)] uppercase">VIP MEMBER</span>
            </div>
            <p className="text-sm font-body-md text-on-surface-variant mb-3">{userData?.email || 'huy.bui@example.com'}</p>
            <div className="flex items-center gap-2 text-sm text-on-surface-variant bg-surface-bright/40 px-3 py-2 rounded-lg border border-white/5">
              <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>sports_martial_arts</span>
              <span className="font-semibold">PT Phụ trách: Coach Bùi Văn Huy</span>
            </div>
          </div>
          
          <button className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant text-green-light font-bold text-sm hover:bg-green-light/10 transition-colors z-10">
            <span className="material-symbols-outlined text-lg">edit</span>
            Chỉnh sửa hồ sơ
          </button>
        </section>

        {/* Biometrics Grid (Bento Structure) */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bento-card rounded-2xl p-4 flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold mb-2">
              <span className="material-symbols-outlined text-base">cake</span> Tuổi
            </div>
            <div className="text-3xl font-headline-md font-bold text-on-surface">{userData?.age || 24}</div>
          </div>
          
          <div className="bento-card rounded-2xl p-4 flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold mb-2">
              <span className="material-symbols-outlined text-base">height</span> Chiều cao
            </div>
            <div className="text-3xl font-headline-md font-bold text-on-surface">{userData?.height || 175}<span className="text-sm font-normal text-on-surface-variant ml-1">cm</span></div>
          </div>
          
          <div className="bento-card rounded-2xl p-4 flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold mb-2">
              <span className="material-symbols-outlined text-base">weight</span> Cân nặng
            </div>
            <div className="text-3xl font-headline-md font-bold text-on-surface">{userData?.weight || 80}<span className="text-sm font-normal text-on-surface-variant ml-1">kg</span></div>
          </div>
          
          <div className="bento-card rounded-2xl p-4 flex flex-col justify-between bg-green-light/10 border border-green-light/30">
            <div className="flex items-center gap-2 text-green-light text-xs font-semibold mb-2">
              <span className="material-symbols-outlined text-base">flag</span> Mục tiêu
            </div>
            <div className="text-3xl font-headline-md font-bold text-green-light">{userData?.targetWeight || 70}<span className="text-sm font-normal text-green-light/70 ml-1">kg</span></div>
          </div>
          
          {/* Wide Summary Card */}
          <div className="col-span-2 md:col-span-4 bento-card rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4 border border-outline-variant/30">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5">
                <span className="material-symbols-outlined text-primary text-2xl">monitor_weight</span>
              </div>
              <div>
                <div className="text-sm font-bold text-on-surface-variant">BMI: {bmi}</div>
                <div className="text-base font-bold text-primary">Bình thường</div>
              </div>
            </div>
            <div className="h-px w-full md:h-10 md:w-px bg-white/10"></div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5">
                <span className="material-symbols-outlined text-orange-400 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              </div>
              <div>
                <div className="text-sm font-bold text-on-surface-variant">TDEE: {tdee} kcal/ngày</div>
                <div className="text-base text-on-surface font-semibold">Hoạt động vừa phải</div>
              </div>
            </div>
          </div>
        </section>

        {/* Transformation Journey Slider */}
        <section className="bento-card rounded-2xl p-6 md:p-8 flex flex-col gap-4 relative overflow-hidden border border-outline-variant/30">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-headline-md font-bold">Hành Trình Lột Xác</h3>
              <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-light/10 border border-green-light/30 text-green-light text-[10px] font-bold shadow-[0_0_10px_rgba(102,200,28,0.3)] w-max">
                Giảm 10 kg (80kg -&gt; 70kg)
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-lg">add_a_photo</span>
                Cập nhật ảnh mới
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-bright/40 border border-white/5 text-on-surface-variant text-xs font-semibold hover:bg-surface-bright/80 transition-colors">
                <span className="material-symbols-outlined text-lg">history</span>
                Lịch sử
              </button>
            </div>
          </div>
          
          <div className="relative w-full h-80 md:h-96 rounded-xl overflow-hidden border border-white/10 group">
            {/* After Image */}
            <img alt="After" className="absolute inset-0 w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuClp-D9D2x7NXWr6bYSt49TgoQJqx1ds31iPsPR3ircl7s4yo0lfB7dyt-gdyEQ1srBDwyvzwchGb41mk3BV-njs04hvwVNT8xZu4Q3rQxLaOwot4QFKvjCIp1lj5cD05cx-RfYStz6ytCPIlC5o-6d4r4nTXJ6RFbFmQ1DP2YlU5rZhI2yVGFRNCUI1GKXAMagbLAm6iqhSb8y3FEHrYMkBWpldb2T4twtrmG1UN5XQ9Bs359Q52Tz" />
            <div className="absolute bottom-4 right-4 px-3 py-1 bg-surface-dim/90 backdrop-blur-md border border-green-light rounded-lg text-green-light text-xs font-bold z-20">
              Tuần 8 • 70 kg
            </div>
            
            {/* Before Image (Overlay 50%) */}
            <div className="absolute inset-0 w-1/2 overflow-hidden border-r-2 border-green-light z-10">
              <img alt="Before" className="absolute inset-0 h-full object-cover max-w-none" style={{ width: "200%" }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuDchBLBWHh4yzXXJB_2KB2Ih3Vd_uNLHFQ7xkQpsxWVynJCJrcmlaD8X3y6ScXy4_cuvEhZnyfmoMysnympyqcfasCaUb6ekaoHF26gWYBdnooayit0X3-1nVjm5uFF2o-TVTZsz5TK8_7ZuLLGp56ih-R3JBn52F7scG2sDpto0I_HLgeU9luqn8XdSDblPZZueb-LHBgUEIdvbQASFWU_3GFUD3dVCIkno9KwrtZ3AZ7l0gFq36d7" />
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-surface-dim/90 backdrop-blur-md border border-white/20 rounded-lg text-on-surface text-xs font-bold">
                Tuần 1 • 80 kg
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
              <h3 className="text-xl font-headline-md font-bold mb-1">Mục tiêu Calo & Macro</h3>
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-bright/40 border border-white/5 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                Chỉ định bởi PT
              </div>
            </div>
            <button className="text-primary text-xs font-semibold flex items-center hover:underline">
              Yêu cầu cập nhật <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
          
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-between items-end">
              <span className="text-4xl font-headline-md font-extrabold text-on-surface leading-none">
                {tdee} <span className="text-xl font-body-md text-on-surface-variant font-medium">kcal</span>
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
                <span className="text-on-surface-variant uppercase tracking-wider">Protein (30%)</span>
                <span className="text-on-surface font-bold">160g</span>
              </div>
              <div className="h-2 w-full bg-surface-dim rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: "30%" }}></div>
              </div>
            </div>
            
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface-bright/40 border border-white/5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-on-surface-variant uppercase tracking-wider">Carbs (50%)</span>
                <span className="text-on-surface font-bold">200g</span>
              </div>
              <div className="h-2 w-full bg-surface-dim rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 rounded-full" style={{ width: "50%" }}></div>
              </div>
            </div>
            
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface-bright/40 border border-white/5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-on-surface-variant uppercase tracking-wider">Fats (20%)</span>
                <span className="text-on-surface font-bold">50g</span>
              </div>
              <div className="h-2 w-full bg-surface-dim rounded-full overflow-hidden">
                <div className="h-full bg-red-400 rounded-full" style={{ width: "20%" }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Settings Bento List */}
        <section className="bento-card rounded-2xl flex flex-col p-2 border border-outline-variant/30 mt-4">
          <button className="flex items-center justify-between p-4 hover:bg-surface-bright/40 rounded-xl transition-colors cursor-pointer group text-left">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5 group-hover:bg-green-light/10 transition-colors">
                <span className="material-symbols-outlined text-on-surface group-hover:text-green-light transition-colors">fitness_center</span>
              </div>
              <div>
                <div className="text-sm font-bold text-on-surface">Quản lý Gói tập</div>
                <div className="text-xs font-medium text-on-surface-variant mt-0.5">Gói PT 1:1 - Còn 8/12 buổi</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </button>
          
          <div className="w-full h-px bg-white/5"></div>
          
          <div className="flex items-center justify-between p-4 hover:bg-surface-bright/40 rounded-xl transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5">
                <span className="material-symbols-outlined text-on-surface">contrast</span>
              </div>
              <div className="text-sm font-bold text-on-surface">Giao diện</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-on-surface-variant">Dark</span>
              <div className="w-10 h-6 bg-green-light rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-dark-slate rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="w-full h-px bg-white/5"></div>
          
          <button className="flex items-center justify-between p-4 hover:bg-surface-bright/40 rounded-xl transition-colors cursor-pointer group text-left">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-bright/50 flex items-center justify-center border border-white/5 group-hover:bg-green-light/10 transition-colors">
                <span className="material-symbols-outlined text-on-surface group-hover:text-green-light transition-colors">notifications</span>
              </div>
              <div className="text-sm font-bold text-on-surface">Cài đặt thông báo</div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </button>
          
          <div className="w-full h-px bg-white/5"></div>
          
          <button onClick={handleLogout} className="flex items-center justify-between p-4 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer w-full text-left">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <span className="material-symbols-outlined text-red-400">logout</span>
              </div>
              <div className="text-sm font-bold text-red-400">Đăng xuất</div>
            </div>
          </button>
        </section>
      </main>

      <BottomNavBar activeTab="profile" />
    </div>
  );
}
