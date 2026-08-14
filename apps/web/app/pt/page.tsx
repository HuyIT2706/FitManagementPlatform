/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../../components/ui/Header";
import PTBottomNavBar from "../../components/navigation/PTBottomNavBar";
import apiClient from "../../api/axios";
import type { UserDataHome, PTDashboardData } from "../../interface";

export default function PTPage() {
  const [userData, setUserData] = useState<UserDataHome | null>(null);
  const [ptData, setPtData] = useState<PTDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [feedbackTexts, setFeedbackTexts] = useState<Record<string, string>>({});
  const [checkedSessions, setCheckedSessions] = useState<Record<string, boolean>>({});
  const [approvedMeals, setApprovedMeals] = useState<Record<string, boolean>>({});

  useEffect(() => {
    Promise.all([
      apiClient.get<UserDataHome>("/users/me"),
      apiClient.get<PTDashboardData>("/pt/dashboard"),
    ])
      .then(([userRes, ptRes]) => {
        setUserData(userRes.data);
        setPtData(ptRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleCheckInSession = (sessionId: string) => {
    setCheckedSessions((prev) => ({ ...prev, [sessionId]: true }));
    apiClient.post(`/pt/check-in/${sessionId}`).catch(console.error);
  };

  const handleApproveMeal = (mealId: string) => {
    setApprovedMeals((prev) => ({ ...prev, [mealId]: true }));
    apiClient
      .post(`/pt/approve-meal/${mealId}`, { note: feedbackTexts[mealId] || "" })
      .catch(console.error);
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

  const coachName = ptData?.coachName || userData?.fullName || "Coach Bùi Văn Huy";

  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-container-padding mt-4 md:mt-8 space-y-gutter">
        {/* Section 1: Welcome Header */}
        <section className="bento-card rounded-3xl p-6 md:p-8 flex flex-col gap-3 relative overflow-hidden border border-outline-variant/30">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3.5 py-1 rounded-full w-max border border-primary/30">
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              sports_martial_arts
            </span>
            <span className="font-label-sm text-xs font-bold uppercase tracking-wider">
              Coach / Personal Trainer
            </span>
          </div>

          <h1 className="font-headline-md text-2xl md:text-3xl font-extrabold text-on-surface">
            Chào {coachName}!
          </h1>
          <p className="text-on-surface-variant text-xs md:text-sm font-medium">
            Hôm nay bạn có{" "}
            <strong className="text-primary font-bold">
              {ptData?.todaySessionsCount || 4} ca dạy PT
            </strong>{" "}
            &amp;{" "}
            <strong className="text-orange-400 font-bold">
              {ptData?.pendingMealCount || 2} bữa ăn cần duyệt
            </strong>
          </p>

          <div className="absolute -right-10 -top-10 w-48 h-48 bg-primary/10 blur-[60px] rounded-full pointer-events-none"></div>
        </section>

        {/* Section 2: Bento Stats Bar */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          <div className="bento-card rounded-2xl p-5 border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant text-xs font-semibold">Học viên VIP</span>
              <span className="material-symbols-outlined text-primary text-xl">star</span>
            </div>
            <div className="font-stat-lg text-2xl md:text-3xl font-bold text-on-surface mt-2">
              {ptData?.totalVipStudents || 10}
            </div>
          </div>

          <div className="bento-card rounded-2xl p-5 border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant text-xs font-semibold">Ca dạy hôm nay</span>
              <span className="material-symbols-outlined text-primary text-xl">fitness_center</span>
            </div>
            <div className="font-stat-lg text-2xl md:text-3xl font-bold text-on-surface mt-2">
              {ptData?.todaySessionsCount || 4}
            </div>
          </div>

          <div className="bento-card rounded-2xl p-5 border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant text-xs font-semibold">Đã dạy</span>
              <span className="material-symbols-outlined text-primary text-xl">event_available</span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="font-stat-lg text-2xl md:text-3xl font-bold text-on-surface">
                {ptData?.completedSessionsCount || 18}
              </span>
              <span className="text-on-surface-variant text-xs font-medium">
                /{ptData?.totalPackageSessionsCount || 24} Buổi
              </span>
            </div>
          </div>

          <div className="bento-card rounded-2xl p-5 border border-orange-500/30 bg-orange-500/10 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-orange-400 text-xs font-semibold">Cảnh báo</span>
              <span className="material-symbols-outlined text-orange-400 text-xl">warning</span>
            </div>
            <div className="font-stat-lg text-2xl md:text-3xl font-bold text-orange-400 mt-2">
              {ptData?.warningsCount || 2}
            </div>
          </div>
        </section>

        {/* Main Content Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left Column: Schedule & Nutrition Review */}
          <div className="lg:col-span-8 space-y-gutter">
            {/* Section 3: Today's PT Schedule */}
            <section className="space-y-4">
              <h3 className="font-headline-md font-bold text-xl text-on-surface px-1">
                Lịch dạy hôm nay
              </h3>

              <div className="space-y-3">
                {(ptData?.todaySessions || []).map((session) => {
                  const isChecked = Boolean(checkedSessions[session.id]);

                  return (
                    <div
                      key={session.id}
                      className={`bento-card rounded-2xl p-5 border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isChecked
                          ? "border-green-light/40 bg-green-light/10"
                          : "border-outline-variant/30 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-surface-bright rounded-xl p-3 flex flex-col items-center justify-center min-w-[80px] border border-white/10 text-center">
                          <span className="text-xs font-bold text-primary">
                            {session.timeSlot}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-on-surface text-base">
                            {session.studentName}
                          </h4>
                          <p className="text-xs text-on-surface-variant flex items-center gap-1.5 font-medium">
                            <span className="material-symbols-outlined text-[16px] text-primary">
                              fitness_center
                            </span>
                            {session.workoutName}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCheckInSession(session.id)}
                        disabled={isChecked}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          isChecked
                            ? "bg-surface-bright text-green-light border border-green-light/40 cursor-default"
                            : "bg-primary text-dark-slate hover:bg-primary/90 shadow-[0_0_12px_rgba(102,200,28,0.3)] active:scale-95"
                        }`}
                      >
                        <span
                          className="material-symbols-outlined text-[18px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                        {isChecked ? "Đã Check-in" : "Check-in Trừ Buổi"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Section 4: Nutrition Review Pending */}
            <section className="space-y-4">
              <h3 className="font-headline-md font-bold text-xl text-on-surface px-1">
                Nhật ký dinh dưỡng chờ duyệt
              </h3>

              <div className="space-y-4">
                {(ptData?.pendingMeals || []).map((meal) => {
                  const isApproved = Boolean(approvedMeals[meal.id]);

                  return (
                    <div
                      key={meal.id}
                      className="bento-card rounded-3xl p-6 border border-outline-variant/30 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                            <img
                              src={
                                meal.studentAvatar ||
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                              }
                              alt={meal.studentName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-on-surface text-base">
                              {meal.studentName}
                            </h4>
                            <span className="text-xs text-on-surface-variant font-medium">
                              {meal.mealName}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-primary">
                          {meal.calories} kcal
                        </span>
                      </div>

                      <div className="bg-surface-bright/40 rounded-2xl p-4 border border-white/5 flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="w-full md:w-36 h-28 rounded-xl overflow-hidden shrink-0 border border-white/10">
                          <img
                            src={
                              meal.imageUrl ||
                              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
                            }
                            alt="Meal photo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-2 grow">
                          <p className="text-sm text-on-surface font-semibold">
                            {meal.foodDescription}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="bg-surface-bright text-xs text-[#0086C9] font-bold px-2.5 py-1 rounded-lg border border-[#0086C9]/20">
                              P: {meal.proteinGrams}g
                            </span>
                            <span className="bg-surface-bright text-xs text-[#EF6820] font-bold px-2.5 py-1 rounded-lg border border-[#EF6820]/20">
                              C: {meal.carbsGrams}g
                            </span>
                            <span className="bg-surface-bright text-xs text-[#F63D68] font-bold px-2.5 py-1 rounded-lg border border-[#F63D68]/20">
                              F: {meal.fatGrams}g
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Coach Feedback Input & Actions */}
                      {!isApproved ? (
                        <div className="space-y-3 pt-1">
                          <input
                            type="text"
                            value={feedbackTexts[meal.id] || ""}
                            onChange={(e) =>
                              setFeedbackTexts((prev) => ({ ...prev, [meal.id]: e.target.value }))
                            }
                            placeholder="Gửi lời nhắn cho học viên..."
                            className="w-full bg-surface-bright/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary outline-none"
                          />

                          <div className="flex gap-3">
                            <button
                              onClick={() => handleApproveMeal(meal.id)}
                              className="flex-1 bg-primary text-dark-slate font-bold text-xs py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-[0_0_10px_rgba(102,200,28,0.3)] cursor-pointer"
                            >
                              Duyệt Bữa Ăn
                            </button>
                            <button
                              onClick={() => handleApproveMeal(meal.id)}
                              className="flex-1 bg-surface-bright/40 text-on-surface font-bold text-xs py-3 rounded-xl border border-white/10 hover:bg-surface-bright transition-colors cursor-pointer"
                            >
                              Nhắc Nhở Sửa Bữa
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-green-light/10 border border-green-light/30 rounded-xl flex items-center gap-2 text-green-light text-xs font-bold">
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          Đã duyệt bữa ăn và gửi lời nhắn cho học viên!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Column: Students Quick Roster */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-headline-md font-bold text-xl text-on-surface">
                Danh sách học viên
              </h3>
              <Link href="/pt/students" className="text-xs text-primary font-bold hover:underline">
                Xem tất cả
              </Link>
            </div>

            <div className="space-y-3">
              {(ptData?.students || []).map((student) => (
                <div
                  key={student.id}
                  className="bento-card rounded-2xl p-4 border border-outline-variant/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full overflow-hidden border border-white/10">
                        <img
                          src={
                            student.avatarUrl ||
                            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80"
                          }
                          alt={student.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface text-sm">
                          {student.fullName}
                        </h4>
                        <span className="text-xs text-on-surface-variant font-medium">
                          {student.packageName}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-sm text-primary block">
                        {student.remainingSessions}/{student.totalSessions}
                      </span>
                      <span className="text-[10px] text-on-surface-variant">Buổi còn lại</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex justify-around">
                    <button className="text-primary text-xs font-semibold flex items-center gap-1 hover:underline cursor-pointer">
                      <span className="material-symbols-outlined text-[16px]">compare</span>
                      Before/After
                    </button>
                    <button className="text-primary text-xs font-semibold flex items-center gap-1 hover:underline cursor-pointer">
                      <span className="material-symbols-outlined text-[16px]">monitor_weight</span>
                      InBody
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <PTBottomNavBar activeTab="home" />
    </div>
  );
}
