/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../../../components/ui/Header";
import PTBottomNavBar from "../../../components/navigation/PTBottomNavBar";
import apiClient from "../../../api/axios";
import type { UserDataHome } from "../../../interface";
import { toast } from "../../../utils/toast";

export default function PTStudentsPage() {
  const [userData, setUserData] = useState<UserDataHome | null>(null);
  const [loading, setLoading] = useState(true);

  // Invite Student Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [packageName, setPackageName] = useState("Gói PT VIP 1-1");
  const [totalSessions, setTotalSessions] = useState(12);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null);

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

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmail) {
      toast.error("Vui lòng nhập Email học viên!");
      return;
    }

    setSendingInvite(true);
    apiClient
      .post<{ inviteUrl: string; inviteCode: string }>("/pt/students/invite", {
        studentEmail,
        packageName,
        totalSessions,
        remainingSessions: totalSessions,
      })
      .then((res) => {
        setSendingInvite(false);
        const url = res.data.inviteUrl || "https://fitmanagement.app/invite?code=INV-9921";
        setGeneratedInviteUrl(url);
        toast.success("Đã khởi tạo Link mời liên kết học viên thành công!");
      })
      .catch((err) => {
        console.error(err);
        setSendingInvite(false);
        toast.error("Không thể tạo link mời học viên!");
      });
  };

  const handleCopyInviteUrl = () => {
    if (!generatedInviteUrl) return;
    navigator.clipboard.writeText(generatedInviteUrl);
    toast.success("Đã sao chép Link Mời vào bộ nhớ tạm!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const studentsList = [
    {
      id: "std-101",
      name: "Bùi Văn Huy",
      pkg: "Gói PT VIP 1-1",
      remaining: 8,
      total: 12,
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "std-102",
      name: "Nguyễn Văn A",
      pkg: "Gói PT Chuẩn",
      remaining: 5,
      total: 10,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "std-103",
      name: "Trần Thị B",
      pkg: "Gói PT VIP 1-1",
      remaining: 12,
      total: 36,
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "std-104",
      name: "Lê Văn C",
      pkg: "Gói PT Chuẩn",
      remaining: 2,
      total: 12,
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-32 pt-2 md:pt-0 dark text-on-surface">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-container-padding mt-4 md:mt-8 space-y-6">
        {/* Header Summary & Add Student Action */}
        <div className="bento-card rounded-3xl p-6 md:p-8 space-y-4 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-headline-md text-on-surface">
              Danh sách Học viên phụ trách
            </h1>
            <p className="text-sm text-on-surface-variant font-medium mt-1">
              Quản lý danh sách học viên kèm PT, gửi link mời Gmail/QR Code, giao giáo án và thực đơn.
            </p>
          </div>

          <button
            onClick={() => {
              setGeneratedInviteUrl(null);
              setIsInviteModalOpen(true);
            }}
            className="px-5 py-3 bg-primary text-dark-slate font-extrabold text-xs rounded-2xl shadow-[0_0_15px_rgba(102,200,28,0.4)] hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            + Thêm Học Viên Mới
          </button>
        </div>

        {/* Student Roster Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {studentsList.map((student) => (
            <div
              key={student.id}
              className="bento-card rounded-2xl p-5 border border-outline-variant/30 space-y-4 relative group hover:border-primary/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shrink-0">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-base group-hover:text-primary transition-colors">
                      {student.name}
                    </h4>
                    <span className="text-xs text-on-surface-variant font-medium">
                      {student.pkg}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-primary block">
                    {student.remaining}/{student.total}
                  </span>
                  <span className="text-xs text-on-surface-variant">Buổi còn lại</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                <Link
                  href={`/pt/students/${student.id}`}
                  className="flex-1 bg-primary/10 text-primary hover:bg-primary/20 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-primary/20"
                >
                  <span className="material-symbols-outlined text-[16px]">edit_note</span>
                  Giao bài tập & Thực đơn
                </Link>

                <Link
                  href={`/pt/students/${student.id}`}
                  className="px-4 py-2 bg-surface-bright/40 text-on-surface hover:bg-surface-bright rounded-xl text-xs font-bold flex items-center gap-1 transition-colors border border-white/10"
                >
                  <span className="material-symbols-outlined text-[16px]">monitor_weight</span>
                  InBody
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Thêm Học Viên / Gửi Link Mời Gmail */}
        {isInviteModalOpen && (
          <div className="fixed inset-0 bg-dark-slate/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bento-card rounded-3xl p-6 md:p-8 max-w-lg w-full border border-primary/30 space-y-6 shadow-2xl relative animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    mark_email_read
                  </span>
                  <h3 className="text-xl font-bold text-on-surface">
                    Thêm Học Viên & Gửi Link Mời
                  </h3>
                </div>
                <button
                  onClick={() => setIsInviteModalOpen(false)}
                  className="text-on-surface-variant hover:text-white p-1 rounded-lg hover:bg-surface-bright"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {!generatedInviteUrl ? (
                <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-on-surface font-semibold mb-1">
                      Email Gmail Học viên
                    </label>
                    <input
                      type="email"
                      required
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="ví dụ: hocvien@gmail.com"
                      className="w-full bg-surface-bright border border-white/10 rounded-xl px-4 py-3 text-on-surface font-medium focus:border-primary outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-on-surface font-semibold mb-1">
                        Gói tập PT
                      </label>
                      <select
                        value={packageName}
                        onChange={(e) => setPackageName(e.target.value)}
                        className="w-full bg-surface-bright border border-white/10 rounded-xl px-3 py-3 text-on-surface font-semibold focus:border-primary outline-none"
                      >
                        <option value="Gói PT VIP 1-1">Gói PT VIP 1-1</option>
                        <option value="Gói PT Chuẩn">Gói PT Chuẩn</option>
                        <option value="Gói PT Trải Nghiệm">Gói PT Trải Nghiệm</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-on-surface font-semibold mb-1">
                        Số buổi gói tập
                      </label>
                      <input
                        type="number"
                        value={totalSessions}
                        onChange={(e) => setTotalSessions(Number(e.target.value))}
                        className="w-full bg-surface-bright border border-white/10 rounded-xl px-4 py-3 text-on-surface font-extrabold focus:border-primary outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsInviteModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-surface-bright text-on-surface font-bold hover:bg-surface-bright/70"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={sendingInvite}
                      className="px-6 py-2.5 rounded-xl bg-primary text-dark-slate font-extrabold shadow-[0_0_12px_rgba(102,200,28,0.4)] hover:bg-primary/90 cursor-pointer"
                    >
                      {sendingInvite ? "Đang tạo link..." : "Tạo Link Mời Gmail"}
                    </button>
                  </div>
                </form>
              ) : (
                /* Generated Invite Link View */
                <div className="space-y-5 text-xs">
                  <div className="bg-primary/10 p-4 rounded-2xl border border-primary/30 space-y-2">
                    <span className="text-primary font-bold block">
                      ✔ Đã tạo thành công Link liên kết tài khoản!
                    </span>
                    <p className="text-on-surface-variant">
                      Gửi link này cho học viên <strong>{studentEmail}</strong> qua Gmail / Zalo. Khi học viên bấm link &rarr; Tài khoản tự động kết nối với Coach.
                    </p>
                  </div>

                  <div className="bg-surface-bright/50 p-3 rounded-xl border border-white/10 flex items-center justify-between gap-2">
                    <span className="font-mono text-primary font-semibold text-xs truncate">
                      {generatedInviteUrl}
                    </span>
                    <button
                      onClick={handleCopyInviteUrl}
                      className="px-3 py-1.5 bg-primary text-dark-slate font-extrabold rounded-lg shrink-0 flex items-center gap-1 hover:bg-primary/90"
                    >
                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      Sao chép
                    </button>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setIsInviteModalOpen(false)}
                      className="px-6 py-2.5 rounded-xl bg-primary text-dark-slate font-extrabold shadow-md cursor-pointer"
                    >
                      Hoàn thành
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <PTBottomNavBar activeTab="students" />
    </div>
  );
}
