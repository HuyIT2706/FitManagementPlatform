/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import BottomNavBar from "../../components/navigation/BottomNavBar";
import apiClient from "../../api/axios";
import type {
  UserDataHome,
  ExerciseItem,
  ExercisePaginatedResponse,
  MealPlanAssigned,
} from "../../interface";
import Header from "../../components/ui/Header";

const MUSCLE_FILTERS: Array<{ id: string; label: string }> = [
  { id: "ALL", label: "Tất cả" },
  { id: "cơ bụng", label: "Cơ bụng" },
  { id: "cơ ngực", label: "Cơ ngực" },
  { id: "cơ vai", label: "Cơ vai" },
  { id: "cơ lưng", label: "Cơ lưng" },
  { id: "cơ xô", label: "Cơ xô" },
  { id: "cơ đùi trước", label: "Đùi trước" },
  { id: "cơ đùi sau", label: "Đùi sau" },
  { id: "cơ mông", label: "Cơ mông" },
  { id: "cơ tay trước", label: "Tay trước" },
  { id: "cơ tay sau", label: "Tay sau" },
  { id: "bắp chân", label: "Bắp chân" },
];

export default function WorkoutPage() {
  const [userData, setUserData] = useState<UserDataHome | null>(null);
  const [assignedMealPlan, setAssignedMealPlan] = useState<MealPlanAssigned | null>(null);

  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [selectedMuscle, setSelectedMuscle] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalExercises, setTotalExercises] = useState<number>(0);
  const pageSize = 8;

  const [loading, setLoading] = useState(true);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [checkedExercises, setCheckedExercises] = useState<Record<string, boolean>>({});
  
  // Selected exercise for detail modal
  const [activeExercise, setActiveExercise] = useState<ExerciseItem | null>(null);

  // Debounce search query by 400ms to avoid overwhelming the backend API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
    fetchExercises(selectedMuscle, debouncedSearchQuery, currentPage);
  }, [selectedMuscle, debouncedSearchQuery, currentPage]);

  const fetchExercises = (muscle: string, search: string, page: number) => {
    setExerciseLoading(true);
    const muscleQuery = muscle === "ALL" ? "" : `&muscle=${encodeURIComponent(muscle)}`;
    const searchQueryStr = search.trim() === "" ? "" : `&search=${encodeURIComponent(search.trim())}`;
    
    apiClient
      .get<ExercisePaginatedResponse>(`/workout/exercises?page=${page}&limit=${pageSize}${muscleQuery}${searchQueryStr}`)
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

  const handleMuscleSelect = (muscleId: string) => {
    setSelectedMuscle(muscleId);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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
  const ptName = userData?.assignedPt?.fullName || assignedMealPlan?.coachName || "Coach Bùi Văn Huy";
  const activePkg = userData?.activePackage;
  const remainingSessions = activePkg?.remainingSessions ?? 8;
  const totalSessions = activePkg?.totalSessions ?? 12;
  const sessionsPercentage = totalSessions ? Math.min(100, Math.round((remainingSessions / totalSessions) * 100)) : 66;

  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-container-padding mt-4 md:mt-8 space-y-gutter">
        {/* VIP Header Banner */}
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
            {/* Header & Search Bar */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
                <div>
                  <h3 className="font-headline-md font-bold text-xl text-on-surface">
                    Thư viện bài tập
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium">
                    {totalExercises} bài tập khả dụng
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Tìm tên bài tập..."
                    className="w-full bg-surface-bright/60 border border-outline-variant/40 rounded-xl pl-9 pr-4 py-2 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Primary Muscles Filter Chips */}
              <div className="space-y-2">
                <div className="text-xs text-on-surface-variant font-semibold px-1 flex items-center gap-1.5">
                  <span className="text-sm font-bold text-on-surface">Lọc theo nhóm cơ chính:</span>
                </div>
                <div className="flex overflow-x-auto gap-2 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {MUSCLE_FILTERS.map((filter) => {
                    const isActive = selectedMuscle === filter.id;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => handleMuscleSelect(filter.id)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-primary text-dark-slate shadow-[0_0_12px_rgba(102,200,28,0.4)] scale-[1.02]"
                            : "bg-surface-bright/50 text-on-surface-variant border border-outline-variant/30 hover:bg-surface-bright hover:text-on-surface"
                        }`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Exercise Grid (Hover Effect: setupImageUrl -> startImageUrl) */}
            <section className="space-y-4">
              {exerciseLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : exercises.length === 0 ? (
                <div className="bento-card p-12 text-center rounded-2xl">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
                    search_off
                  </span>
                  <p className="text-on-surface-variant text-sm">Không tìm thấy bài tập phù hợp</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {exercises.map((exercise) => {
                    const isChecked = Boolean(checkedExercises[exercise.id]);
                    const setupImg = exercise.setupImageUrl || exercise.startImageUrl || "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80";
                    const startImg = exercise.startImageUrl || exercise.setupImageUrl || "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80";

                    return (
                      <div
                        key={exercise.id}
                        onClick={() => setActiveExercise(exercise)}
                        className={`group relative h-56 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                          isChecked
                            ? "border-2 border-primary shadow-[0_0_16px_rgba(102,200,28,0.35)]"
                            : "border border-white/10 hover:border-primary/50"
                        }`}
                      >
                        {/* Setup Image (Default) */}
                        <img
                          src={setupImg}
                          alt={`${exercise.name} Setup`}
                          className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-0"
                        />

                        {/* Start Image (Hover Effect) */}
                        <img
                          src={startImg}
                          alt={`${exercise.name} Start`}
                          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {exercise.level && (
                              <span className="bg-black/75 backdrop-blur-md text-white/90 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-white/10 capitalize">
                                {exercise.level}
                              </span>
                            )}
                            {exercise.equipment && (
                              <span className="bg-primary/90 text-dark-slate font-bold text-[10px] px-2.5 py-0.5 rounded-full capitalize shadow-[0_0_8px_rgba(102,200,28,0.4)]">
                                {exercise.equipment}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Toggle Completion Checkmark Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExercise(exercise.id);
                          }}
                          aria-label="Toggle completed"
                          className={`absolute bottom-3 right-3 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-md border cursor-pointer ${
                            isChecked
                              ? "bg-primary text-dark-slate border-primary shadow-[0_0_12px_rgba(102,200,28,0.7)] scale-105"
                              : "bg-black/60 border-white/30 text-white hover:border-primary hover:text-primary"
                          }`}
                        >
                          <span
                            className="material-symbols-outlined text-xl"
                            style={isChecked ? { fontVariationSettings: "'FILL' 1" } : {}}
                          >
                            check
                          </span>
                        </button>

                        {/* Card Bottom Solid Overlay Bar */}
                        <div className="absolute bottom-0 inset-x-0 p-3.5 bg-black/85 backdrop-blur-md border-t border-white/10 pointer-events-none pr-14 flex flex-col justify-end">
                          <h4 className="font-bold text-white text-sm leading-snug font-headline-md line-clamp-1">
                            {exercise.name}
                          </h4>

                          {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
                            <div className="flex items-center gap-1 text-[11px] text-primary font-semibold mt-0.5">
                              <span className="line-clamp-1 capitalize">{exercise.primaryMuscles.join(", ")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination Controls */}
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
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
                        .map((pg) => (
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

          {/* Conditional Assigned Meal Plan Section */}
          {hasPt && (
            <div className="lg:col-span-5 space-y-6">
              <section className="space-y-4">
                <h3 className="font-headline-md font-bold text-xl text-on-surface px-1">
                  Thực đơn chỉ định hôm nay
                </h3>

                <div className="bento-card rounded-3xl p-6 space-y-6 border border-bento-border/50">
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

        {/* ULTRA-MODERN EXERCISE DETAIL MODAL */}
        {activeExercise && (
          <div
            onClick={() => setActiveExercise(null)}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#121620] border border-white/15 rounded-[32px] max-w-2xl w-full max-h-[85vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-6 md:p-8 pb-10 md:pb-12 space-y-6 text-white shadow-[0_25px_70px_rgba(0,0,0,0.85)] relative animate-in zoom-in-95 duration-200 cursor-default"
            >
              
              {/* Header Close Button */}
              <button
                onClick={() => setActiveExercise(null)}
                aria-label="Close modal"
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer z-30"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>

              {/* Title & Metadata Badges */}
              <div className="space-y-3 pr-12">
                <h3 className="font-extrabold text-2xl md:text-3xl text-white font-headline-md tracking-tight">
                  {activeExercise.name}
                </h3>
                
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {activeExercise.category && (
                    <span className="bg-primary/20 text-primary font-bold px-3.5 py-1 rounded-full border border-primary/40 capitalize">
                      {activeExercise.category}
                    </span>
                  )}
                  {activeExercise.level && (
                    <span className="bg-white/10 text-white/90 font-medium px-3.5 py-1 rounded-full border border-white/15 capitalize">
                      Cấp độ: {activeExercise.level}
                    </span>
                  )}
                  {activeExercise.equipment && (
                    <span className="bg-white/10 text-white/90 font-medium px-3.5 py-1 rounded-full border border-white/15 capitalize">
                      Dụng cụ: {activeExercise.equipment}
                    </span>
                  )}
                </div>
              </div>

              {/* Side-by-Side Images (Setup & Start Poses) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Setup Image */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-white/70 px-1">
                    <span>Tư thế Chuẩn bị</span>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">SETUP</span>
                  </div>
                  <div className="h-52 rounded-2xl overflow-hidden border border-white/15 bg-black/80 relative shadow-inner">
                    <img
                      src={activeExercise.setupImageUrl || activeExercise.startImageUrl || "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80"}
                      alt="Setup Pose"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Start Image */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-primary px-1">
                    <span>Tư thế Thực hiện</span>
                    <span className="text-[10px] text-primary/60 uppercase tracking-widest font-mono">ACTION</span>
                  </div>
                  <div className="h-52 rounded-2xl overflow-hidden border border-primary/40 bg-black/80 relative shadow-[0_0_20px_rgba(102,200,28,0.15)]">
                    <img
                      src={activeExercise.startImageUrl || activeExercise.setupImageUrl || "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80"}
                      alt="Start Pose"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Bento Specs Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {activeExercise.primaryMuscles && activeExercise.primaryMuscles.length > 0 && (
                  <div className="bg-white/[0.04] border border-white/10 p-4 rounded-2xl space-y-1">
                    <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block">Cơ chính tác động</span>
                    <p className="text-sm font-bold text-primary capitalize">{activeExercise.primaryMuscles.join(", ")}</p>
                  </div>
                )}

                {activeExercise.secondaryMuscles && activeExercise.secondaryMuscles.length > 0 && (
                  <div className="bg-white/[0.04] border border-white/10 p-4 rounded-2xl space-y-1">
                    <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block">Cơ phụ trợ</span>
                    <p className="text-sm font-bold text-white/80 capitalize">{activeExercise.secondaryMuscles.join(", ")}</p>
                  </div>
                )}

                {activeExercise.force && (
                  <div className="bg-white/[0.04] border border-white/10 p-4 rounded-2xl space-y-1">
                    <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block">Lực tác động</span>
                    <p className="text-sm font-bold text-white capitalize">{activeExercise.force}</p>
                  </div>
                )}

                {activeExercise.mechanic && (
                  <div className="bg-white/[0.04] border border-white/10 p-4 rounded-2xl space-y-1">
                    <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block">Cơ chế chuyển động</span>
                    <p className="text-sm font-bold text-white capitalize">{activeExercise.mechanic}</p>
                  </div>
                )}
              </div>

              {/* Step-by-Step Instructions (Filter out redundant generic step 5 like "Lặp lại...") */}
              {activeExercise.instructions &&
                activeExercise.instructions.filter(
                  (step) => !step.toLowerCase().includes("lặp lại số lần")
                ).length > 0 && (
                <div className="space-y-3 pt-2 pb-4">
                  <h4 className="font-bold text-xs text-white/80 uppercase tracking-widest px-1">
                    Hướng dẫn thực hiện từng bước
                  </h4>
                  <div className="space-y-2.5">
                    {activeExercise.instructions
                      .filter((step) => !step.toLowerCase().includes("lặp lại số lần"))
                      .map((step, idx) => (
                        <div
                          key={idx}
                          className="bg-white/[0.03] border border-white/10 p-3.5 rounded-2xl flex items-start gap-3 text-xs leading-relaxed"
                        >
                          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary border border-primary/40 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-white/90 font-normal pt-0.5">{step}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <BottomNavBar activeTab="workout" />
    </div>
  );
}
