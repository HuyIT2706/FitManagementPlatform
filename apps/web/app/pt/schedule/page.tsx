/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Header from "../../../components/ui/Header";
import PTBottomNavBar from "../../../components/navigation/PTBottomNavBar";
import apiClient from "../../../api/axios";
import type { UserDataHome } from "../../../interface";
import {
  getMonday,
  getWeekDays,
  isSameDay,
} from "../../../utils/date";

interface ScheduleSlot {
  id: string;
  startTime: string;
  endTime: string;
  studentName?: string;
  studentAvatar?: string;
  packageName?: string;
  sessionNumber?: string;
  workoutName?: string;
  exercisesCount?: number;
  status?: "ONGOING" | "UPCOMING" | "COMPLETED";
  isBusy: boolean;
}

export default function PTSchedulePage() {
  const [userData, setUserData] = useState<UserDataHome | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMonday(new Date()));
  const [checkedSessions, setCheckedSessions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    apiClient
      .get<UserDataHome>("/users/me")
      .then((res) => {
        setUserData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    window.location.href = "/login";
  };

  const handleCheckIn = (sessionId: string) => {
    setCheckedSessions((prev) => ({ ...prev, [sessionId]: true }));
    apiClient.post(`/pt/check-in/${sessionId}`).catch(console.error);
  };

  const handleGoToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonday(getMonday(today));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const weekDays = getWeekDays(currentMonday);
  const dayNamesMap = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const selectedDayName = dayNamesMap[selectedDate.getDay()];
  const isSelectedToday = isSameDay(selectedDate, new Date());

  // Timeline Schedule Data Slots (07:00 -> 20:00)
  const timelineSlots: ScheduleSlot[] = [
    {
      id: "slot-0700",
      startTime: "07:00",
      endTime: "08:00",
      isBusy: false,
    },
    {
      id: "slot-0800",
      startTime: "08:00",
      endTime: "09:30",
      studentName: "Bùi Văn Huy",
      studentAvatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      packageName: "Gói PT VIP 1-1",
      sessionNumber: "Buổi 8 / 12",
      workoutName: "Legs & Glutes Power (Đùi & Mông)",
      exercisesCount: 5,
      status: "ONGOING",
      isBusy: true,
    },
    {
      id: "slot-0930",
      startTime: "09:30",
      endTime: "10:00",
      isBusy: false,
    },
    {
      id: "slot-1000",
      startTime: "10:00",
      endTime: "11:30",
      studentName: "Nguyễn Văn A",
      studentAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      packageName: "Gói PT Chuẩn",
      sessionNumber: "Buổi 5 / 10",
      workoutName: "Chest & Triceps (Ngực & Tay sau)",
      exercisesCount: 4,
      status: "UPCOMING",
      isBusy: true,
    },
    {
      id: "slot-1130",
      startTime: "11:30",
      endTime: "14:00",
      isBusy: false,
    },
    {
      id: "slot-1400",
      startTime: "14:00",
      endTime: "15:30",
      studentName: "Trần Thị B",
      studentAvatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
      packageName: "Gói PT VIP 1-1",
      sessionNumber: "Buổi 12 / 36",
      workoutName: "Full Body HIIT & Core (Toàn thân)",
      exercisesCount: 6,
      status: "UPCOMING",
      isBusy: true,
    },
    {
      id: "slot-1530",
      startTime: "15:30",
      endTime: "17:00",
      isBusy: false,
    },
    {
      id: "slot-1700",
      startTime: "17:00",
      endTime: "18:30",
      studentName: "Lê Văn C",
      studentAvatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      packageName: "Gói PT Chuẩn",
      sessionNumber: "Buổi 2 / 12",
      workoutName: "Back & Core Hypertrophy (Lưng xô)",
      exercisesCount: 5,
      status: "UPCOMING",
      isBusy: true,
    },
    {
      id: "slot-1830",
      startTime: "18:30",
      endTime: "20:00",
      isBusy: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="max-w-5xl mx-auto px-container-padding mt-4 md:mt-8 space-y-gutter">
        {/* Header Summary */}
        <section className="bento-card rounded-3xl p-6 md:p-8 space-y-4 border border-outline-variant/30 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-primary/30">
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                Timeline Huấn Luyện
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold font-headline-md text-on-surface">
                Lịch dạy học viên PT
              </h1>
              <p className="text-xs md:text-sm text-on-surface-variant mt-1 font-medium">
                Theo dõi mốc thời gian các ca dạy, điểm danh trừ buổi và xếp lịch trống.
              </p>
            </div>

            {!isSelectedToday && (
              <button
                onClick={handleGoToToday}
                className="px-4 py-2 rounded-xl bg-primary/15 text-primary font-bold text-xs hover:bg-primary/25 transition-colors border border-primary/30 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">today</span>
                Về Hôm nay
              </button>
            )}
          </div>

          <div className="absolute -right-12 -top-12 w-44 h-44 bg-primary/10 blur-[60px] rounded-full pointer-events-none"></div>
        </section>

        {/* Interactive Weekday Strip */}
        <section className="bento-card rounded-3xl p-4 md:p-6 border border-outline-variant/30 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-bold text-on-surface">
              {selectedDayName}, Ngày {selectedDate.getDate()}/{selectedDate.getMonth() + 1}/{selectedDate.getFullYear()}
            </h3>
            <span className="text-xs font-semibold text-primary">
              4 ca dạy đã đăng ký
            </span>
          </div>

          {/* Weekday Chips */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {weekDays.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              const label = (dayNamesMap[day.getDay()] || "").replace("Thứ ", "T").replace("Chủ Nhật", "CN");

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center justify-center py-3 rounded-2xl transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary text-dark-slate font-extrabold shadow-[0_0_12px_rgba(102,200,28,0.4)] scale-105"
                      : isToday
                      ? "border-2 border-primary text-primary font-bold bg-primary/10"
                      : "bg-surface-bright/30 border border-white/5 text-on-surface-variant hover:bg-surface-bright hover:text-on-surface font-medium"
                  }`}
                >
                  <span className="text-[11px] font-semibold">{label}</span>
                  <span className="text-sm font-extrabold mt-0.5">{day.getDate()}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Timeline Schedule Axis (07:00 -> 20:00) */}
        <section className="space-y-6 pt-2">
          <div className="relative pl-6 md:pl-8 border-l-2 border-outline-variant/30 space-y-6">
            {timelineSlots.map((slot) => {
              const isChecked = Boolean(checkedSessions[slot.id]);

              return (
                <div key={slot.id} className="relative group">
                  {/* Timeline Glowing Bullet Dot */}
                  <div
                    className={`absolute -left-[31px] md:-left-[39px] top-4 w-4 h-4 rounded-full border-2 transition-all ${
                      slot.isBusy
                        ? "border-primary bg-primary shadow-[0_0_10px_rgba(102,200,28,0.8)]"
                        : "border-outline-variant bg-background"
                    }`}
                  ></div>

                  {/* Slot Content */}
                  {slot.isBusy ? (
                    /* Busy Class Session Card */
                    <div
                      className={`bento-card rounded-2xl p-5 md:p-6 border-l-4 transition-all duration-300 space-y-4 ${
                        isChecked
                          ? "border-l-green-light border-green-light/40 bg-green-light/10"
                          : slot.status === "ONGOING"
                          ? "border-l-primary border-primary/50 bg-primary/10 shadow-[0_0_20px_rgba(102,200,28,0.15)]"
                          : "border-l-blue-400 border-white/10 bg-surface-bright/30"
                      }`}
                    >
                      {/* Top Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full overflow-hidden border border-white/10 shrink-0">
                            <img
                              src={
                                slot.studentAvatar ||
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                              }
                              alt={slot.studentName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-on-surface text-base">
                                {slot.studentName}
                              </h4>
                              <span className="text-[11px] font-semibold text-primary/90 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                {slot.packageName}
                              </span>
                            </div>
                            <span className="text-xs text-on-surface-variant font-medium">
                              {slot.sessionNumber}
                            </span>
                          </div>
                        </div>

                        {/* Status Tag */}
                        <div className="flex items-center gap-2">
                          {slot.status === "ONGOING" && (
                            <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/40 flex items-center gap-1.5 animate-pulse">
                              <span className="w-2 h-2 rounded-full bg-primary"></span>
                              Đang diễn ra
                            </span>
                          )}
                          {slot.status === "UPCOMING" && (
                            <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/40 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">schedule</span>
                              Sắp diễn ra
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Workout Class Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-surface-bright/40 p-3 rounded-xl border border-white/5 flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-primary text-lg">
                            schedule
                          </span>
                          <div>
                            <span className="text-on-surface-variant block text-[10px]">Thang thời gian ca</span>
                            <strong className="text-on-surface text-sm">
                              {slot.startTime} - {slot.endTime}
                            </strong>
                          </div>
                        </div>

                        <div className="bg-surface-bright/40 p-3 rounded-xl border border-white/5 flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-primary text-lg">
                            fitness_center
                          </span>
                          <div>
                            <span className="text-on-surface-variant block text-[10px]">Giáo án tập luyện</span>
                            <strong className="text-on-surface text-sm">
                              {slot.workoutName}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <span className="text-xs text-on-surface-variant font-medium">
                          Giao án bao gồm <strong>{slot.exercisesCount} bài tập</strong>
                        </span>

                        <button
                          onClick={() => handleCheckIn(slot.id)}
                          disabled={isChecked}
                          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
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
                          {isChecked ? "Đã điểm danh trừ buổi" : "Check-in Trừ Buổi"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Free / Empty Slot Dashed Card */
                    <div className="border border-dashed border-white/10 bg-surface-bright/10 p-3.5 rounded-xl flex items-center justify-between text-on-surface-variant/60 hover:border-primary/50 hover:text-primary transition-all cursor-pointer group/slot">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-on-surface-variant/80 min-w-[90px]">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <span className="text-xs font-medium italic">
                          Ca trống — Chưa có lịch dạy học viên
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold group-hover/slot:text-primary">
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                        Thêm ca dạy
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <PTBottomNavBar activeTab="schedule" />
    </div>
  );
}
