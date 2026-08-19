/* eslint-disable @next/next/no-img-element */
"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Header from "../../../../components/ui/Header";
import PTBottomNavBar from "../../../../components/navigation/PTBottomNavBar";
import apiClient from "../../../../api/axios";
import type { UserDataHome } from "../../../../interface";
import type {
  AssignedExerciseItem,
  InBodyHistoryPoint,
  PTStudentDetail,
} from "@repo/types";
import { toast } from "../../../../utils/toast";

export default function PTStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;

  const [userData, setUserData] = useState<UserDataHome | null>(null);
  const [studentDetail, setStudentDetail] = useState<PTStudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"workout" | "nutrition" | "inbody">("workout");

  // Workout assignment local state
  const [assignedExercises, setAssignedExercises] = useState<AssignedExerciseItem[]>([]);
  const [newExName, setNewExName] = useState("Barbell Squat");
  const [newExCategory, setNewExCategory] = useState("LEGS");
  const [newExSets, setNewExSets] = useState(4);
  const [newExReps, setNewExReps] = useState(10);
  const [newExWeight, setNewExWeight] = useState(60);
  const [newExDay, setNewExDay] = useState("Thứ 2, Thứ 5");

  // Nutrition assignment local state
  const [targetCalories, setTargetCalories] = useState(2200);
  const [targetProtein, setTargetProtein] = useState(150);
  const [targetCarbs, setTargetCarbs] = useState(220);
  const [targetFat, setTargetFat] = useState(60);
  const [breakfastText, setBreakfastText] = useState("");
  const [lunchText, setLunchText] = useState("");
  const [dinnerText, setDinnerText] = useState("");
  const [snackText, setSnackText] = useState("");

  // InBody Edit local state
  const [isEditingInBody, setIsEditingInBody] = useState(false);
  const [inbodyWeight, setInbodyWeight] = useState(72.5);
  const [inbodyHeight, setInbodyHeight] = useState(175);
  const [inbodyFat, setInbodyFat] = useState(18.2);
  const [inbodyMuscle, setInbodyMuscle] = useState(34.8);
  const [chartMetric, setChartMetric] = useState<"weight" | "fat" | "muscle">("weight");

  // Session Edit local state
  const [isEditSessionModalOpen, setIsEditSessionModalOpen] = useState(false);
  const [editTotalSessions, setEditTotalSessions] = useState(12);
  const [editRemainingSessions, setEditRemainingSessions] = useState(8);
  const [editPackageName, setEditPackageName] = useState("Gói PT VIP 1-1");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      apiClient.get<UserDataHome>("/users/me"),
      apiClient.get<PTStudentDetail>(`/pt/students/${studentId}`),
    ])
      .then(([userRes, studentRes]) => {
        setUserData(userRes.data);
        setStudentDetail(studentRes.data);
        setAssignedExercises(studentRes.data.assignedExercises || []);
        setTargetCalories(studentRes.data.targetCalories || 2200);
        setTargetProtein(studentRes.data.targetProtein || 150);
        setTargetCarbs(studentRes.data.targetCarbs || 220);
        setTargetFat(studentRes.data.targetFat || 60);

        setEditTotalSessions(studentRes.data.totalSessions || 12);
        setEditRemainingSessions(studentRes.data.remainingSessions || 8);
        setEditPackageName(studentRes.data.packageName || "Gói PT VIP 1-1");

        if (studentRes.data.bodyMetrics) {
          setInbodyWeight(studentRes.data.bodyMetrics.weightKg || 72.5);
          setInbodyHeight(studentRes.data.bodyMetrics.heightCm || 175);
          setInbodyFat(studentRes.data.bodyMetrics.bodyFatPercent || 18.2);
          setInbodyMuscle(studentRes.data.bodyMetrics.muscleMassKg || 34.8);
        }

        if (studentRes.data.prescribedMealPlan) {
          setBreakfastText(studentRes.data.prescribedMealPlan.breakfast || "");
          setLunchText(studentRes.data.prescribedMealPlan.lunch || "");
          setDinnerText(studentRes.data.prescribedMealPlan.dinner || "");
          setSnackText(studentRes.data.prescribedMealPlan.snack || "");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [studentId]);

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    window.location.href = "/login";
  };

  const handleAddExerciseToPlan = () => {
    if (!newExName) return;
    const newItem: AssignedExerciseItem = {
      id: `ae-${Date.now()}`,
      exerciseId: `ex-${Date.now()}`,
      name: newExName,
      category: newExCategory,
      sets: newExSets,
      reps: newExReps,
      weightInKg: newExWeight,
      dayOfWeek: newExDay,
    };
    setAssignedExercises((prev) => [...prev, newItem]);
    toast.info("Đã thêm bài tập vào danh sách giao!");
  };

  const handleRemoveExerciseFromPlan = (id: string) => {
    setAssignedExercises((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveWorkoutAssignment = () => {
    setSaving(true);
    apiClient
      .post(`/pt/students/${studentId}/assign-workout`, {
        studentId,
        exercises: assignedExercises,
      })
      .then(() => {
        setSaving(false);
        toast.success("Lưu & Giao giáo án tập luyện thành công!");
      })
      .catch((err) => {
        console.error(err);
        setSaving(false);
        toast.error("Không thể giao giáo án tập luyện!");
      });
  };

  const handleSaveNutritionAssignment = () => {
    setSaving(true);
    apiClient
      .post(`/pt/students/${studentId}/assign-nutrition`, {
        studentId,
        targetCalories,
        targetProtein,
        targetCarbs,
        targetFat,
        prescribedMealPlan: {
          breakfast: breakfastText,
          lunch: lunchText,
          dinner: dinnerText,
          snack: snackText,
        },
      })
      .then(() => {
        setSaving(false);
        toast.success("Lưu thực đơn & mục tiêu dinh dưỡng thành công!");
      })
      .catch((err) => {
        console.error(err);
        setSaving(false);
        toast.error("Không thể lưu mục tiêu dinh dưỡng!");
      });
  };

  const handleSaveInBody = () => {
    setSaving(true);
    const updatedDate = new Date().toLocaleDateString("vi-VN");

    apiClient
      .post(`/pt/students/${studentId}/inbody`, {
        studentId,
        weightKg: inbodyWeight,
        heightCm: inbodyHeight,
        bodyFatPercent: inbodyFat,
        muscleMassKg: inbodyMuscle,
        date: updatedDate,
      })
      .then(() => {
        setSaving(false);
        setIsEditingInBody(false);
        if (studentDetail) {
          const newHistoryPoint: InBodyHistoryPoint = {
            date: `T${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
            weightKg: inbodyWeight,
            bodyFatPercent: inbodyFat,
            muscleMassKg: inbodyMuscle,
          };
          const updatedHistory = [...(studentDetail.bodyMetricsHistory || []), newHistoryPoint];

          setStudentDetail({
            ...studentDetail,
            bodyMetrics: {
              weightKg: inbodyWeight,
              heightCm: inbodyHeight,
              bodyFatPercent: inbodyFat,
              muscleMassKg: inbodyMuscle,
              updatedAt: updatedDate,
            },
            bodyMetricsHistory: updatedHistory,
          });
        }
        toast.success("Đã cập nhật chỉ số InBody mới thành công!");
      })
      .catch((err) => {
        console.error(err);
        setSaving(false);
        toast.error("Không thể cập nhật chỉ số InBody!");
      });
  };

  const handleSaveStudentSessions = () => {
    setSaving(true);
    apiClient
      .patch(`/pt/students/${studentId}`, {
        totalSessions: editTotalSessions,
        remainingSessions: editRemainingSessions,
        packageName: editPackageName,
      })
      .then(() => {
        setSaving(false);
        setIsEditSessionModalOpen(false);
        if (studentDetail) {
          setStudentDetail({
            ...studentDetail,
            totalSessions: editTotalSessions,
            remainingSessions: editRemainingSessions,
            packageName: editPackageName,
          });
        }
        toast.success("Đã cập nhật số buổi & gói tập cho học viên thành công!");
      })
      .catch((err) => {
        console.error(err);
        setSaving(false);
        toast.error("Không thể cập nhật số buổi học viên!");
      });
  };

  if (loading || !studentDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const sessionPercentage = Math.min(
    100,
    Math.round((studentDetail.remainingSessions / studentDetail.totalSessions) * 100)
  );

  const historyPoints = studentDetail.bodyMetricsHistory || [
    { date: "T9/2025", weightKg: 78.0, bodyFatPercent: 22.5, muscleMassKg: 32.0 },
    { date: "T10/2025", weightKg: 76.5, bodyFatPercent: 21.0, muscleMassKg: 33.0 },
    { date: "T11/2025", weightKg: 75.0, bodyFatPercent: 20.0, muscleMassKg: 33.8 },
    { date: "T12/2025", weightKg: 74.0, bodyFatPercent: 19.2, muscleMassKg: 34.2 },
    { date: "T1/2026", weightKg: 73.0, bodyFatPercent: 18.6, muscleMassKg: 34.6 },
    { date: "T2/2026", weightKg: inbodyWeight, bodyFatPercent: inbodyFat, muscleMassKg: inbodyMuscle },
  ];

  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="max-w-6xl mx-auto px-container-padding mt-4 md:mt-8 space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/pt/students"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Quay lại Danh sách Học viên
          </Link>
        </div>

        {/* Student Profile Hero Header */}
        <section className="bento-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary shadow-[0_0_20px_rgba(102,200,28,0.3)] shrink-0">
            <img
              src={
                studentDetail.avatarUrl ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
              }
              alt={studentDetail.fullName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold font-headline-md text-on-surface">
                  {studentDetail.fullName}
                </h1>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                  {studentDetail.email} {studentDetail.phone ? `• ${studentDetail.phone}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-2 self-center md:self-start">
                <span className="px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider">
                  {studentDetail.packageName}
                </span>

                <button
                  onClick={() => setIsEditSessionModalOpen(true)}
                  className="p-1.5 rounded-xl bg-surface-bright text-on-surface-variant hover:text-primary hover:bg-surface-bright/80 transition-colors cursor-pointer border border-white/10"
                  title="Sửa số buổi & gói tập"
                >
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                </button>
              </div>
            </div>

            {/* Session Progress */}
            <div className="pt-2 max-w-md space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-on-surface">Tiến độ gói tập</span>
                <span className="text-primary">
                  {studentDetail.remainingSessions} / {studentDetail.totalSessions} Buổi còn lại
                </span>
              </div>
              <div className="w-full h-2.5 bg-surface-bright rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(102,200,28,0.5)]"
                  style={{ width: `${sessionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        {/* Sub-Tabs Switcher */}
        <section className="flex items-center gap-2 p-1.5 bg-surface-bright/40 rounded-2xl border border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("workout")}
            className={`flex-1 min-w-[130px] py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubTab === "workout"
                ? "bg-primary text-dark-slate shadow-[0_0_15px_rgba(102,200,28,0.4)]"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/50"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">fitness_center</span>
            Giao Bài Tập
          </button>

          <button
            onClick={() => setActiveSubTab("nutrition")}
            className={`flex-1 min-w-[130px] py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubTab === "nutrition"
                ? "bg-primary text-dark-slate shadow-[0_0_15px_rgba(102,200,28,0.4)]"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/50"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">restaurant</span>
            Giao Thực Đơn & Targets
          </button>

          <button
            onClick={() => setActiveSubTab("inbody")}
            className={`flex-1 min-w-[130px] py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubTab === "inbody"
                ? "bg-primary text-dark-slate shadow-[0_0_15px_rgba(102,200,28,0.4)]"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-bright/50"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">monitor_weight</span>
            InBody & Biểu Đồ Tiến Độ
          </button>
        </section>

        {/* Tab 1: Giao Bài Tập (Workout Assignment) */}
        {activeSubTab === "workout" && (
          <section className="space-y-6">
            {/* Add Exercise Form Card */}
            <div className="bento-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 space-y-4">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_task</span>
                Thêm bài tập mới vào giáo án
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-on-surface-variant font-medium mb-1">
                    Tên bài tập
                  </label>
                  <select
                    value={newExName}
                    onChange={(e) => {
                      setNewExName(e.target.value);
                      if (e.target.value.includes("Squat") || e.target.value.includes("Leg")) {
                        setNewExCategory("LEGS");
                      } else if (e.target.value.includes("Bench") || e.target.value.includes("Push")) {
                        setNewExCategory("CHEST");
                      } else {
                        setNewExCategory("BACK");
                      }
                    }}
                    className="w-full bg-surface-bright border border-white/10 rounded-xl px-3 py-2.5 text-on-surface font-semibold focus:border-primary outline-none"
                  >
                    <option value="Barbell Squat">Barbell Squat (Gánh đùi)</option>
                    <option value="Bench Press">Bench Press (Đẩy ngực ngang)</option>
                    <option value="Incline Dumbbell Press">Incline Press (Đẩy ngực dốc)</option>
                    <option value="Deadlift">Deadlift (Kéo lưng đùi)</option>
                    <option value="Lat Pulldown">Lat Pulldown (Kéo xô)</option>
                    <option value="Dumbbell Shoulder Press">Shoulder Press (Đẩy vai)</option>
                    <option value="Leg Press">Leg Press (Đạp đùi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-on-surface-variant font-medium mb-1">
                    Số hiệp (Sets)
                  </label>
                  <input
                    type="number"
                    value={newExSets}
                    onChange={(e) => setNewExSets(Number(e.target.value))}
                    className="w-full bg-surface-bright border border-white/10 rounded-xl px-3 py-2.5 text-on-surface font-semibold focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-on-surface-variant font-medium mb-1">
                    Số lần / Hiệp (Reps)
                  </label>
                  <input
                    type="number"
                    value={newExReps}
                    onChange={(e) => setNewExReps(Number(e.target.value))}
                    className="w-full bg-surface-bright border border-white/10 rounded-xl px-3 py-2.5 text-on-surface font-semibold focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-on-surface-variant font-medium mb-1">
                    Mức tạ mục tiêu (Kg)
                  </label>
                  <input
                    type="number"
                    value={newExWeight}
                    onChange={(e) => setNewExWeight(Number(e.target.value))}
                    className="w-full bg-surface-bright border border-white/10 rounded-xl px-3 py-2.5 text-on-surface font-semibold focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-on-surface-variant font-medium mb-1">
                    Lịch tập trong tuần
                  </label>
                  <input
                    type="text"
                    value={newExDay}
                    onChange={(e) => setNewExDay(e.target.value)}
                    placeholder="Ví dụ: Thứ 2, Thứ 5"
                    className="w-full bg-surface-bright border border-white/10 rounded-xl px-3 py-2.5 text-on-surface font-semibold focus:border-primary outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleAddExerciseToPlan}
                    className="w-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Thêm Bài Tập
                  </button>
                </div>
              </div>
            </div>

            {/* Currently Assigned Exercises List */}
            <div className="bento-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">format_list_bulleted</span>
                  Danh sách Giáo án Bài tập đã chỉ định ({assignedExercises.length})
                </h3>

                <button
                  onClick={handleSaveWorkoutAssignment}
                  disabled={saving}
                  className="px-5 py-2.5 bg-primary text-dark-slate rounded-xl font-extrabold text-xs shadow-[0_0_15px_rgba(102,200,28,0.4)] hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  {saving ? "Đang lưu..." : "Lưu & Giao Giáo Án Tập"}
                </button>
              </div>

              {assignedExercises.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic py-4 text-center">
                  Chưa có bài tập nào trong giáo án. Hãy dùng form trên để thêm bài tập!
                </p>
              ) : (
                <div className="space-y-3">
                  {assignedExercises.map((ex) => (
                    <div
                      key={ex.id}
                      className="bg-surface-bright/40 rounded-2xl p-4 border border-white/10 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined">fitness_center</span>
                        </div>

                        <div>
                          <h4 className="font-bold text-on-surface text-sm">{ex.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5 font-medium">
                            <span className="text-primary font-bold">{ex.sets} Hiệp</span> ×{" "}
                            <span className="text-primary font-bold">{ex.reps} Lần</span> •{" "}
                            <span>Mức tạ: {ex.weightInKg} kg</span>
                            {ex.dayOfWeek && (
                              <span className="bg-surface-bright px-2 py-0.5 rounded text-[10px]">
                                {ex.dayOfWeek}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveExerciseFromPlan(ex.id)}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Xóa khỏi giáo án"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tab 2: Giao Thực Đơn & Target Calo (Nutrition Assignment) */}
        {activeSubTab === "nutrition" && (
          <section className="bento-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">local_fire_department</span>
                  Thiết lập Mục tiêu Dinh dưỡng & Thực đơn
                </h3>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                  Đặt mức Calo, Macros đạm/tinh bột/chất béo và mẫu thực đơn theo ngày cho học viên.
                </p>
              </div>

              <button
                onClick={handleSaveNutritionAssignment}
                disabled={saving}
                className="px-5 py-2.5 bg-primary text-dark-slate rounded-xl font-extrabold text-xs shadow-[0_0_15px_rgba(102,200,28,0.4)] hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                {saving ? "Đang lưu..." : "Lưu Targets & Thực Đơn"}
              </button>
            </div>

            {/* Daily Macro Targets Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-surface-bright/30 p-4 rounded-2xl border border-white/5 space-y-1">
                <label className="block text-on-surface-variant font-semibold">Target Calo (Kcal)</label>
                <input
                  type="number"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(Number(e.target.value))}
                  className="w-full bg-surface-bright border border-white/10 rounded-xl px-3 py-2 text-on-surface font-extrabold text-lg text-primary focus:border-primary outline-none"
                />
              </div>

              <div className="bg-surface-bright/30 p-4 rounded-2xl border border-white/5 space-y-1">
                <label className="block text-on-surface-variant font-semibold">Protein (Grams)</label>
                <input
                  type="number"
                  value={targetProtein}
                  onChange={(e) => setTargetProtein(Number(e.target.value))}
                  className="w-full bg-surface-bright border border-white/10 rounded-xl px-3 py-2 text-on-surface font-bold text-base focus:border-primary outline-none"
                />
              </div>

              <div className="bg-surface-bright/30 p-4 rounded-2xl border border-white/5 space-y-1">
                <label className="block text-on-surface-variant font-semibold">Carbs (Grams)</label>
                <input
                  type="number"
                  value={targetCarbs}
                  onChange={(e) => setTargetCarbs(Number(e.target.value))}
                  className="w-full bg-surface-bright border border-white/10 rounded-xl px-3 py-2 text-on-surface font-bold text-base focus:border-primary outline-none"
                />
              </div>

              <div className="bg-surface-bright/30 p-4 rounded-2xl border border-white/5 space-y-1">
                <label className="block text-on-surface-variant font-semibold">Fat (Grams)</label>
                <input
                  type="number"
                  value={targetFat}
                  onChange={(e) => setTargetFat(Number(e.target.value))}
                  className="w-full bg-surface-bright border border-white/10 rounded-xl px-3 py-2 text-on-surface font-bold text-base focus:border-primary outline-none"
                />
              </div>
            </div>

            {/* Prescribed Daily Meal Templates */}
            <div className="space-y-4 pt-2">
              <h4 className="font-bold text-on-surface text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">menu_book</span>
                Mẫu thực đơn các bữa trong ngày
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="block font-semibold text-on-surface-variant">Bữa Sáng</label>
                  <textarea
                    rows={3}
                    value={breakfastText}
                    onChange={(e) => setBreakfastText(e.target.value)}
                    placeholder="Gợi ý: 3 Trứng ốp la + 2 lát bánh mì nguyên cám + 1 quả chuối"
                    className="w-full bg-surface-bright border border-white/10 rounded-xl p-3 text-on-surface font-medium focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-on-surface-variant">Bữa Trưa</label>
                  <textarea
                    rows={3}
                    value={lunchText}
                    onChange={(e) => setLunchText(e.target.value)}
                    placeholder="Gợi ý: 200g Ức gà áp chảo + 150g Cơm gạo lứt + Bông cải xanh"
                    className="w-full bg-surface-bright border border-white/10 rounded-xl p-3 text-on-surface font-medium focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-on-surface-variant">Bữa Tối</label>
                  <textarea
                    rows={3}
                    value={dinnerText}
                    onChange={(e) => setDinnerText(e.target.value)}
                    placeholder="Gợi ý: 200g Thăn bò nướng / Cá hồi + Salad xà lách sốt olive"
                    className="w-full bg-surface-bright border border-white/10 rounded-xl p-3 text-on-surface font-medium focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-on-surface-variant">Bữa Phụ</label>
                  <textarea
                    rows={3}
                    value={snackText}
                    onChange={(e) => setSnackText(e.target.value)}
                    placeholder="Gợi ý: 1 Muỗng Whey Protein + 30g Hạnh nhân / Sữa chua"
                    className="w-full bg-surface-bright border border-white/10 rounded-xl p-3 text-on-surface font-medium focus:border-primary outline-none"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tab 3: Chỉ Số InBody & Biểu Đồ Tiến Độ */}
        {activeSubTab === "inbody" && (
          <section className="space-y-6">
            {/* InBody Summary Cards & Edit Action */}
            <div className="bento-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">monitor_weight</span>
                  Chỉ số thể hình InBody ({studentDetail.bodyMetrics?.updatedAt || 'Vừa cập nhật'})
                </h3>

                <button
                  onClick={() => setIsEditingInBody(!isEditingInBody)}
                  className="px-4 py-2 bg-primary/15 text-primary hover:bg-primary/25 border border-primary/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  {isEditingInBody ? "Hủy Sửa" : "Sửa Chỉ Số InBody"}
                </button>
              </div>

              {/* Editable InBody Form */}
              {isEditingInBody && (
                <div className="bg-surface-bright/50 p-5 rounded-2xl border border-primary/40 space-y-4 animate-fadeIn">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-primary">
                    Cập nhật đo lường InBody mới
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <label className="block text-on-surface-variant font-medium mb-1">
                        Cân nặng (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={inbodyWeight}
                        onChange={(e) => setInbodyWeight(Number(e.target.value))}
                        className="w-full bg-surface-bright border border-white/10 rounded-xl px-3 py-2 text-on-surface font-extrabold focus:border-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-on-surface-variant font-medium mb-1">
                        Chiều cao (cm)
                      </label>
                      <input
                        type="number"
                        value={inbodyHeight}
                        onChange={(e) => setInbodyHeight(Number(e.target.value))}
                        className="w-full bg-surface-bright border border-white/10 rounded-xl px-3 py-2 text-on-surface font-extrabold focus:border-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-on-surface-variant font-medium mb-1">
                        Tỷ lệ mỡ (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={inbodyFat}
                        onChange={(e) => setInbodyFat(Number(e.target.value))}
                        className="w-full bg-surface-bright border border-white/10 rounded-xl px-3 py-2 text-on-surface font-extrabold focus:border-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-on-surface-variant font-medium mb-1">
                        Khối lượng cơ (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={inbodyMuscle}
                        onChange={(e) => setInbodyMuscle(Number(e.target.value))}
                        className="w-full bg-surface-bright border border-white/10 rounded-xl px-3 py-2 text-on-surface font-extrabold focus:border-primary outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSaveInBody}
                      disabled={saving}
                      className="px-6 py-2.5 bg-primary text-dark-slate rounded-xl font-extrabold text-xs shadow-[0_0_12px_rgba(102,200,28,0.4)] hover:bg-primary/90 cursor-pointer"
                    >
                      {saving ? "Đang lưu..." : "Lưu Chỉ Số InBody"}
                    </button>
                  </div>
                </div>
              )}

              {/* Metrics Display Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-surface-bright/40 p-4 rounded-2xl border border-white/10">
                  <span className="text-xs text-on-surface-variant block font-medium">Cân nặng</span>
                  <strong className="text-xl font-extrabold text-primary">
                    {studentDetail.bodyMetrics?.weightKg ?? 70} kg
                  </strong>
                </div>

                <div className="bg-surface-bright/40 p-4 rounded-2xl border border-white/10">
                  <span className="text-xs text-on-surface-variant block font-medium">Chiều cao</span>
                  <strong className="text-xl font-extrabold text-on-surface">
                    {studentDetail.bodyMetrics?.heightCm ?? 175} cm
                  </strong>
                </div>

                <div className="bg-surface-bright/40 p-4 rounded-2xl border border-white/10">
                  <span className="text-xs text-on-surface-variant block font-medium">Tỷ lệ mỡ</span>
                  <strong className="text-xl font-extrabold text-amber-400">
                    {studentDetail.bodyMetrics?.bodyFatPercent ?? 18}%
                  </strong>
                </div>

                <div className="bg-surface-bright/40 p-4 rounded-2xl border border-white/10">
                  <span className="text-xs text-on-surface-variant block font-medium">Khối lượng cơ</span>
                  <strong className="text-xl font-extrabold text-blue-400">
                    {studentDetail.bodyMetrics?.muscleMassKg ?? 32} kg
                  </strong>
                </div>
              </div>
            </div>

            {/* Visual Interactive InBody Trend Chart */}
            <div className="bento-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">show_chart</span>
                  Biểu đồ tiến độ thay đổi theo thời gian
                </h3>

                {/* Metric Selector Buttons */}
                <div className="flex items-center gap-1.5 bg-surface-bright/40 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
                  <button
                    onClick={() => setChartMetric("weight")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      chartMetric === "weight"
                        ? "bg-primary text-dark-slate shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    Cân nặng (kg)
                  </button>

                  <button
                    onClick={() => setChartMetric("fat")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      chartMetric === "fat"
                        ? "bg-amber-400 text-dark-slate shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    % Mỡ
                  </button>

                  <button
                    onClick={() => setChartMetric("muscle")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      chartMetric === "muscle"
                        ? "bg-blue-400 text-dark-slate shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    Cơ (kg)
                  </button>
                </div>
              </div>

              {/* Chart SVG Visualization */}
              <div className="bg-surface-bright/20 p-6 rounded-2xl border border-white/10 space-y-4">
                <div className="relative h-64 w-full flex items-end justify-between px-4 pt-8 pb-6 border-b border-white/10">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                    <div className="border-b border-dashed border-white"></div>
                    <div className="border-b border-dashed border-white"></div>
                    <div className="border-b border-dashed border-white"></div>
                  </div>

                  {/* Render Columns / Trend Points */}
                  {historyPoints.map((pt: InBodyHistoryPoint, idx: number) => {
                    let val = pt.weightKg;
                    let unit = "kg";
                    let minVal = 70;
                    let maxVal = 80;

                    if (chartMetric === "fat") {
                      val = pt.bodyFatPercent;
                      unit = "%";
                      minVal = 15;
                      maxVal = 25;
                    } else if (chartMetric === "muscle") {
                      val = pt.muscleMassKg;
                      unit = "kg";
                      minVal = 30;
                      maxVal = 36;
                    }

                    const heightPercent = Math.max(
                      15,
                      Math.min(95, Math.round(((val - minVal) / (maxVal - minVal)) * 100))
                    );

                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center gap-2 z-10 group relative flex-1"
                      >
                        {/* Value Badge */}
                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-surface-bright border border-white/10 shadow-sm opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all">
                          {val} {unit}
                        </span>

                        {/* Visual Bar Indicator */}
                        <div className="w-8 md:w-12 bg-surface-bright/50 rounded-t-xl overflow-hidden h-40 flex items-end justify-center p-1">
                          <div
                            className={`w-full rounded-t-lg transition-all duration-700 shadow-lg ${
                              chartMetric === "weight"
                                ? "bg-primary shadow-[0_0_12px_rgba(102,200,28,0.5)]"
                                : chartMetric === "fat"
                                ? "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                                : "bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.5)]"
                            }`}
                            style={{ height: `${heightPercent}%` }}
                          ></div>
                        </div>

                        {/* Date Label */}
                        <span className="text-[11px] font-bold text-on-surface-variant">
                          {pt.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Before / After Gallery Comparison */}
            <div className="bento-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 space-y-4">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">compare</span>
                Hình ảnh so sánh tiến độ Before / After
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2 text-center">
                  <div className="h-64 rounded-2xl overflow-hidden border border-white/10 relative">
                    <img
                      src={
                        studentDetail.beforeAfterPhotos?.beforeUrl ||
                        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80"
                      }
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-dark-slate/80 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                      BEFORE (Lúc bắt đầu)
                    </span>
                  </div>
                  <p className="text-xs font-bold text-on-surface-variant">
                    {studentDetail.beforeAfterPhotos?.beforeDate || "Ngày 15/01/2026 (78 kg)"}
                  </p>
                </div>

                <div className="space-y-2 text-center">
                  <div className="h-64 rounded-2xl overflow-hidden border border-primary/40 relative shadow-[0_0_20px_rgba(102,200,28,0.2)]">
                    <img
                      src={
                        studentDetail.beforeAfterPhotos?.afterUrl ||
                        "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80"
                      }
                      alt="After"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-primary text-dark-slate text-xs font-extrabold px-3 py-1 rounded-full shadow-md">
                      AFTER (Hiện tại)
                    </span>
                  </div>
                  <p className="text-xs font-bold text-primary">
                    {studentDetail.beforeAfterPhotos?.afterDate || "Ngày 10/02/2026 (72.5 kg)"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Modal Sửa Số Buổi & Gói Tập */}
        {isEditSessionModalOpen && (
          <div className="fixed inset-0 bg-dark-slate/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bento-card rounded-3xl p-6 md:p-8 max-w-md w-full border border-primary/30 space-y-6 shadow-2xl relative animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    settings
                  </span>
                  <h3 className="text-xl font-bold text-on-surface">
                    Sửa Số Buổi & Gói Tập
                  </h3>
                </div>
                <button
                  onClick={() => setIsEditSessionModalOpen(false)}
                  className="text-on-surface-variant hover:text-white p-1 rounded-lg hover:bg-surface-bright"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-on-surface font-semibold mb-1">
                    Gói tập PT
                  </label>
                  <input
                    type="text"
                    value={editPackageName}
                    onChange={(e) => setEditPackageName(e.target.value)}
                    className="w-full bg-surface-bright border border-white/10 rounded-xl px-4 py-3 text-on-surface font-semibold focus:border-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-on-surface font-semibold mb-1">
                      Tổng số buổi đăng ký
                    </label>
                    <input
                      type="number"
                      value={editTotalSessions}
                      onChange={(e) => setEditTotalSessions(Number(e.target.value))}
                      className="w-full bg-surface-bright border border-white/10 rounded-xl px-4 py-3 text-on-surface font-extrabold focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-on-surface font-semibold mb-1">
                      Số buổi còn lại
                    </label>
                    <input
                      type="number"
                      value={editRemainingSessions}
                      onChange={(e) => setEditRemainingSessions(Number(e.target.value))}
                      className="w-full bg-surface-bright border border-white/10 rounded-xl px-4 py-3 text-on-surface font-extrabold text-primary focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditSessionModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-surface-bright text-on-surface font-bold hover:bg-surface-bright/70"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveStudentSessions}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-primary text-dark-slate font-extrabold shadow-[0_0_12px_rgba(102,200,28,0.4)] hover:bg-primary/90 cursor-pointer"
                  >
                    {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <PTBottomNavBar activeTab="students" />
    </div>
  );
}
