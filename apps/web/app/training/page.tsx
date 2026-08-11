/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import TopBar from "../../components/navigation/TopBar";
import BottomNavBar from "../../components/navigation/BottomNavBar";
import apiClient from "../../api/axios";
import type {
  UserDataHome,
  ExerciseItem,
  ExercisePaginatedResponse,
  MealPlanAssigned,
  ExerciseCategoryType,
} from "../../interface";

const CATEGORIES: Array<{ id: ExerciseCategoryType; label: string }> = [
  { id: "ALL", label: "Tất cả" },
  { id: "LEGS", label: "Mông & Đùi" },
  { id: "CHEST", label: "Ngực" },
  { id: "SHOULDERS", label: "Vai" },
  { id: "BACK", label: "Lưng" },
  { id: "ARMS", label: "Tay" },
  { id: "ABS", label: "Bụng" },
  { id: "FULL_BODY", label: "Toàn thân" },
];

export default function WorkoutPage() {
  const [userData, setUserData] = useState<UserDataHome | null>(null);
  const [assignedMealPlan, setAssignedMealPlan] = useState<MealPlanAssigned | null>(null);

  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategoryType>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalExercises, setTotalExercises] = useState<number>(0);
  const pageSize = 5;

  const [loading, setLoading] = useState(true);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [checkedExercises, setCheckedExercises] = useState<Record<string, boolean>>({});

  useEffect(() => {
    Promise.all([
      apiClient.get<UserDataHome>("/users/me"),
      apiClient.get<MealPlanAssigned | null>("/workout/assigned-meal-plan"),
    ])
      .then(([userRes, mealPlanRes]) => {
        setUserData(userRes.data);
        setAssignedMealPlan(mealPlanRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchExercises(selectedCategory, currentPage);
  }, [selectedCategory, currentPage]);

  const fetchExercises = (cat: ExerciseCategoryType, page: number) => {
    setExerciseLoading(true);
    const catQuery = cat === "ALL" ? "" : `&category=${cat}`;
    apiClient
      .get<ExercisePaginatedResponse>(`/workout/exercises?page=${page}&limit=${pageSize}${catQuery}`)
      .then((res) => {
        setExercises(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotalExercises(res.data.total);
        setExerciseLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setExerciseLoading(false);
      });
  };

  const handleCategorySelect = (cat: ExerciseCategoryType) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const toggleExercise = (id: string) => {
    setCheckedExercises((prev) => ({ ...prev, [id]: !prev[id] }));
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

  const hasPt = Boolean(userData?.assignedPt || assignedMealPlan);
  const ptName = userData?.assignedPt?.fullName || assignedMealPlan?.coachName || "Coach Bui Van Huy";
  const activePkg = userData?.activePackage;
  const remainingSessions = activePkg?.remainingSessions ?? 8;
  const totalSessions = activePkg?.totalSessions ?? 12;
  const sessionsPercentage = totalSessions ? Math.min(100, Math.round((remainingSessions / totalSessions) * 100)) : 66;

  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <TopBar userData={userData} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-container-padding mt-4 md:mt-8 space-y-gutter">
        {/* VIP Header - Check-in button removed */}
        <section className="bento-card rounded-3xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden border border-outline-variant/30">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span
                  className="bg-green-light/20 text-green-light px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase"
                  style={{
                    boxShadow: "0 0 15px rgba(102, 200, 28, 0.4)",
                    border: "1px solid rgba(102, 200, 28, 0.5)",
                  }}
                >
                  VIP MEMBER
                </span>
                <h1 className="font-headline-md text-xl md:text-2xl text-on-surface font-bold">
                  Xin chào, {userData?.fullName || "Thành viên"}
                </h1>
              </div>

              {/* Chi hien thong tin PT khi hoc vien co PT phu trách */}
              {hasPt && (
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span
                    className="material-symbols-outlined text-primary text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified_user
                  </span>
                  <span className="font-label-lg text-sm">
                    PT Phụ trách: <strong className="text-on-surface">{ptName}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Chi hien thong tin so buoi khi hoc vien co PT / goi tap */}
          {hasPt && (
            <div className="space-y-2 z-10 mt-1">
              <div className="flex justify-between font-label-sm text-sm">
                <span className="text-on-surface-variant">Số buổi tập còn lại</span>
                <span className="text-green-light font-bold">
                  {remainingSessions} / {totalSessions} Buổi
                </span>
              </div>
              <div className="h-2 w-full bg-surface-bright rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-light shadow-[0_0_8px_rgba(102,200,28,0.5)] transition-all duration-500"
                  style={{ width: `${sessionsPercentage}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="absolute -right-10 -top-10 w-48 h-48 bg-green-light/10 blur-[60px] rounded-full pointer-events-none"></div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Main Exercise Library Section */}
          <div className={`${hasPt ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-6`}>
            {/* Category Filter */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-headline-md font-bold text-xl text-on-surface">
                  Khám phá bài tập
                </h3>
                <span className="text-xs text-on-surface-variant font-medium">
                  {totalExercises} bài tập
                </span>
              </div>

              {/* Category Filter Chips */}
              <div className="flex overflow-x-auto gap-2.5 pb-2 no-scrollbar">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-primary text-dark-slate shadow-[0_0_12px_rgba(102,200,28,0.3)] scale-[1.02]"
                          : "bg-surface-bright/50 text-on-surface-variant border border-outline-variant/30 hover:bg-surface-bright hover:text-on-surface"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Exercise List (5 items per page with images) */}
            <section className="space-y-4">
              {exerciseLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : exercises.length === 0 ? (
                <div className="bento-card p-12 text-center rounded-2xl">
                  <p className="text-on-surface-variant">Không tìm thấy bài tập phù hợp</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {exercises.map((exercise) => {
                    const isChecked = Boolean(checkedExercises[exercise.id]);

                    return (
                      <div
                        key={exercise.id}
                        className={`rounded-2xl h-48 overflow-hidden relative transition-all duration-300 ${
                          isChecked
                            ? "border-2 border-green-light shadow-[0_0_15px_rgba(102,200,28,0.3)]"
                            : "border border-white/10 hover:border-white/20"
                        }`}
                        style={{
                          backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.1) 100%), url('${exercise.imageUrl}')`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        <div className="absolute top-3 left-3">
                          <span className="bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-semibold px-3 py-1 rounded-full border border-white/10">
                            {exercise.categoryName}
                          </span>
                        </div>

                        <div className="absolute inset-0 p-5 flex flex-col justify-end z-10">
                          <div className="flex justify-between items-end w-full">
                            <div className="space-y-1 max-w-[80%]">
                              <h4 className="font-bold text-white text-lg font-headline-md leading-tight">
                                {exercise.name}
                              </h4>
                              {exercise.description && (
                                <p className="text-white/70 text-xs line-clamp-1">
                                  {exercise.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-green-light font-semibold pt-1">
                                {exercise.sets && exercise.reps && (
                                  <span>
                                    {exercise.sets} sets • {exercise.reps} reps
                                    {exercise.weightInKg ? ` • ${exercise.weightInKg}kg` : ""}
                                  </span>
                                )}
                                {exercise.caloriesBurn && (
                                  <span className="text-orange-400">
                                    • {exercise.caloriesBurn} kcal
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => toggleExercise(exercise.id)}
                              aria-label="Mark completed"
                              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md ${
                                isChecked
                                  ? "bg-green-light text-dark-slate shadow-[0_0_12px_rgba(102,200,28,0.6)] scale-105"
                                  : "bg-black/50 border-2 border-white/30 text-white/80 hover:border-green-light hover:text-green-light"
                              }`}
                            >
                              <span
                                className="material-symbols-outlined text-2xl"
                                style={isChecked ? { fontVariationSettings: "'FILL' 1" } : {}}
                              >
                                check
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination Controls (5 items per page) */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 px-1">
                  <span className="text-xs text-on-surface-variant font-medium">
                    Trang {currentPage} / {totalPages}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg bg-surface-bright/40 border border-white/10 text-xs font-semibold text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-bright transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                      Trước
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                        <button
                          key={pg}
                          onClick={() => setCurrentPage(pg)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            currentPage === pg
                              ? "bg-primary text-dark-slate shadow-[0_0_8px_rgba(102,200,28,0.4)]"
                              : "bg-surface-bright/30 text-on-surface-variant hover:bg-surface-bright hover:text-on-surface"
                          }`}
                        >
                          {pg}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg bg-surface-bright/40 border border-white/10 text-xs font-semibold text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-bright transition-colors flex items-center gap-1"
                    >
                      Sau
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Conditional Assigned Meal Plan Section (Only shown if student has a PT) */}
          {hasPt && (
            <div className="lg:col-span-5 space-y-6">
              <section className="space-y-4">
                <h3 className="font-headline-md font-bold text-xl text-on-surface px-1">
                  Thực đơn chỉ định hôm nay
                </h3>

                <div className="bento-card rounded-3xl p-6 space-y-6 border border-bento-border/50">
                  {/* PT Advice Note */}
                  <div className="bg-primary/10 border border-primary/30 p-4 rounded-2xl flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/40 shrink-0">
                      {assignedMealPlan?.coachAvatar ? (
                        <img
                          src={assignedMealPlan.coachAvatar}
                          alt="Coach Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-xl">sports_kwonn</span>
                      )}
                    </div>
                    <p className="text-sm text-primary leading-relaxed">
                      <strong className="text-on-surface block mb-1">
                        {assignedMealPlan?.coachName || `Coach ${ptName}`}:
                      </strong>
                      &quot;{assignedMealPlan?.coachAdvice || "Ăn đúng lượng Carbs trước tập 1 tiếng để có sức nâng tạ nhé!"}&quot;
                    </p>
                  </div>

                  {/* Meal Items List */}
                  <div className="grid grid-cols-1 gap-3">
                    {(assignedMealPlan?.meals || [
                      {
                        name: "Bữa Sáng",
                        kcal: 450,
                        description: "3 Trứng ốp la + 100g Yến mạch",
                        icon: "wb_twilight",
                      },
                      {
                        name: "Bữa Trưa",
                        kcal: 650,
                        description: "200g Ức gà + 150g Gạo lứt",
                        icon: "wb_sunny",
                      },
                    ]).map((meal, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 bg-surface-bright/30 p-3.5 rounded-2xl border border-white/5"
                      >
                        <div className="w-11 h-11 rounded-xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center text-orange-400 shrink-0">
                          <span className="material-symbols-outlined">{meal.icon}</span>
                        </div>
                        <div className="grow">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-on-surface text-sm">{meal.name}</h4>
                            <span className="text-green-light font-bold text-xs">
                              {meal.kcal} kcal
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            {meal.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Kcal Goal Progress */}
                  <div className="pt-1">
                    <div className="bg-surface-bright/40 p-4 rounded-2xl border border-white/5 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant font-medium">
                          Tổng Kcal hôm nay
                        </span>
                        <span className="text-on-surface font-bold">
                          {assignedMealPlan?.totalKcal || 1100} / {assignedMealPlan?.targetKcal || 1734} Kcal
                        </span>
                      </div>
                      <div className="h-2 w-full bg-surface-dim rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-light shadow-[0_0_8px_rgba(102,200,28,0.6)]"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(
                                ((assignedMealPlan?.totalKcal || 1100) /
                                  (assignedMealPlan?.targetKcal || 1734)) *
                                  100
                              )
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      <BottomNavBar activeTab="workout" />
    </div>
  );
}
