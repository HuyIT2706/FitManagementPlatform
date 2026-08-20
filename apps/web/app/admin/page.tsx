/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  Award,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import apiClient from '../../api/axios';
import { toast } from '../../utils/toast';

interface AdminPtApplication {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  experienceYears: number;
  specialties: string[];
  certificateUrl?: string;
  bio?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote?: string;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalPts: number;
  pendingApps: number;
  approvedApps: number;
  rejectedApps: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [applications, setApplications] = useState<AdminPtApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');

  // Rejection/Approval modal
  const [selectedApp, setSelectedApp] = useState<AdminPtApplication | null>(null);
  const [modalAction, setModalAction] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      apiClient.get<AdminStats>('/admin/stats'),
      apiClient.get<AdminPtApplication[]>('/admin/pt-applications'),
    ])
      .then(([statsRes, appsRes]) => {
        setStats(statsRes.data);
        setApplications(appsRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching admin data:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    window.location.href = '/login';
  };

  const handleOpenActionModal = (app: AdminPtApplication, action: 'APPROVE' | 'REJECT') => {
    setSelectedApp(app);
    setModalAction(action);
    setActionNote(action === 'APPROVE' ? 'Đã phê duyệt đủ điều kiện chứng chỉ PT' : 'Chưa đủ chứng chỉ chuyên môn');
  };

  const handleSubmitAction = () => {
    if (!selectedApp || !modalAction) return;

    setSubmitting(true);
    const endpoint = modalAction === 'APPROVE'
      ? `/admin/pt-applications/${selectedApp.id}/approve`
      : `/admin/pt-applications/${selectedApp.id}/reject`;

    apiClient
      .post(endpoint, { note: actionNote })
      .then((res) => {
        toast.success(res.data.message || 'Thao tác thành công!');
        setSelectedApp(null);
        setModalAction(null);
        fetchData();
      })
      .catch((err) => {
        console.error('Error updating application:', err);
        toast.error('Có lỗi xảy ra khi xử lý đơn đăng ký!');
      })
      .finally(() => setSubmitting(false));
  };

  const filteredApps = applications.filter((app) => {
    const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus;
    const matchesSearch =
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#090d0b] text-[#dde4dd] font-sans pb-24">
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-30 bg-[#0e1511]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center text-[#10b981]">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">FitManagement Admin</h1>
            <p className="text-xs text-white/60">Cổng Quản Trị Hệ Thống & Xét Duyệt HLV PT</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={18} />
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        {/* Section 1: Hero Stats Overview */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#121a15] border border-white/10 space-y-1">
            <span className="text-xs font-semibold text-white/60">Tổng Học Viên / User</span>
            <strong className="text-3xl font-extrabold text-white block">{stats?.totalUsers ?? 0}</strong>
            <span className="text-[11px] text-[#10b981] font-medium">Tài khoản trên hệ thống</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#121a15] border border-amber-500/30 relative overflow-hidden space-y-1 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <span className="text-xs font-semibold text-amber-300">Đơn chờ duyệt HLV</span>
            <strong className="text-3xl font-extrabold text-amber-400 block">{stats?.pendingApps ?? 0}</strong>
            <span className="text-[11px] text-amber-200/70 font-medium">Cần Admin phản hồi</span>
            {stats?.pendingApps ? (
              <span className="absolute top-3 right-3 w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
            ) : null}
          </div>

          <div className="p-5 rounded-2xl bg-[#121a15] border border-[#10b981]/30 space-y-1">
            <span className="text-xs font-semibold text-[#10b981]">HLV PT Đã Phê Duyệt</span>
            <strong className="text-3xl font-extrabold text-[#10b981] block">{stats?.totalPts ?? 0}</strong>
            <span className="text-[11px] text-white/60 font-medium">Đang giảng dạy 1:1</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#121a15] border border-rose-500/30 space-y-1">
            <span className="text-xs font-semibold text-rose-400">Đơn bị từ chối</span>
            <strong className="text-3xl font-extrabold text-rose-400 block">{stats?.rejectedApps ?? 0}</strong>
            <span className="text-[11px] text-white/60 font-medium">Chưa đủ điều kiện bằng cấp</span>
          </div>
        </section>

        {/* Section 2: Filters & Search */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121a15] p-4 rounded-2xl border border-white/10">
          {/* Status Filter Tabs */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto w-full sm:w-auto">
            {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  filterStatus === st
                    ? st === 'PENDING'
                      ? 'bg-amber-400 text-dark-slate shadow-md'
                      : st === 'APPROVED'
                        ? 'bg-[#10b981] text-[#003824] shadow-md'
                        : st === 'REJECTED'
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'bg-white text-black shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {st === 'PENDING'
                  ? `Chờ duyệt (${stats?.pendingApps ?? 0})`
                  : st === 'APPROVED'
                    ? 'Đã duyệt'
                    : st === 'REJECTED'
                      ? 'Đã từ chối'
                      : 'Tất cả'}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên HLV hoặc email..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:border-[#10b981] outline-none"
            />
          </div>
        </section>

        {/* Section 3: Applications List */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText size={20} className="text-[#10b981]" />
            Danh sách Đơn Đăng Ký Trở Thành HLV PT ({filteredApps.length})
          </h2>

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-white/60 font-medium">Đang tải danh sách đơn đăng ký HLV...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="py-16 text-center bg-[#121a15] rounded-2xl border border-white/10">
              <Clock size={40} className="mx-auto text-white/30 mb-3" />
              <p className="text-sm font-bold text-white/80">Không có đơn đăng ký nào phù hợp</p>
              <p className="text-xs text-white/50 mt-1">Thay đổi bộ lọc hoặc tìm kiếm tên HLV khác.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className={`p-6 rounded-2xl border transition-all bg-[#121a15] flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                    app.status === 'PENDING'
                      ? 'border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
                      : app.status === 'APPROVED'
                        ? 'border-[#10b981]/30'
                        : 'border-rose-500/30 opacity-80'
                  }`}
                >
                  {/* Left Column: Avatar & Basic Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                      {app.avatarUrl ? (
                        <img src={app.avatarUrl} alt={app.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#10b981] text-[#003824] font-extrabold text-2xl flex items-center justify-center">
                          {app.fullName.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-white">{app.fullName}</h3>
                        {app.status === 'PENDING' && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                            <Clock size={12} />
                            Chờ xét duyệt
                          </span>
                        )}
                        {app.status === 'APPROVED' && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#10b981]/20 text-[#10b981] text-[10px] font-bold border border-[#10b981]/30 flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            Đã duyệt PT
                          </span>
                        )}
                        {app.status === 'REJECTED' && (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30 flex items-center gap-1">
                            <XCircle size={12} />
                            Đã từ chối
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-white/60 font-medium">
                        Email: <strong className="text-white">{app.email}</strong> {app.phone ? `• SĐT: ${app.phone}` : ''}
                      </p>

                      {/* Specialties & Experience */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="bg-[#10b981]/15 text-[#10b981] text-xs font-bold px-2.5 py-0.5 rounded-md border border-[#10b981]/30 flex items-center gap-1">
                          <Award size={13} />
                          {app.experienceYears} năm kinh nghiệm
                        </span>
                        {app.specialties.map((spec, idx) => (
                          <span
                            key={idx}
                            className="bg-white/5 text-white/70 text-xs font-medium px-2.5 py-0.5 rounded-md border border-white/10"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      {app.bio && (
                        <p className="text-xs text-white/70 italic pt-1 max-w-2xl">
                          &quot;{app.bio}&quot;
                        </p>
                      )}

                      {app.adminNote && (
                        <div className="mt-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-amber-300">
                          <strong>Ghi chú Admin:</strong> {app.adminNote}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Certificate Link & Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-end justify-between gap-4 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-white/10">
                    {app.certificateUrl ? (
                      <a
                        href={app.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold hover:bg-blue-500/20 transition-colors"
                      >
                        <ExternalLink size={14} />
                        Xem Bằng Cấp / Chứng Chỉ
                      </a>
                    ) : (
                      <span className="text-xs text-white/40 italic">Chưa tải bằng cấp</span>
                    )}

                    <div className="flex gap-2 w-full sm:w-auto">
                      {app.status !== 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(app, 'APPROVE')}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#10b981] text-[#003824] text-xs font-extrabold hover:opacity-90 transition-opacity flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.3)] cursor-pointer"
                        >
                          <UserCheck size={16} />
                          Phê duyệt HLV
                        </button>
                      )}

                      {app.status !== 'REJECTED' && (
                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(app, 'REJECT')}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold hover:bg-rose-500/30 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <UserX size={16} />
                          Từ chối
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal Confirmation / Rejection Note */}
      {selectedApp && modalAction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121a15] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 text-white shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold flex items-center gap-2">
              {modalAction === 'APPROVE' ? (
                <>
                  <UserCheck className="text-[#10b981]" size={22} />
                  Xác nhận Phê duyệt HLV PT
                </>
              ) : (
                <>
                  <UserX className="text-rose-400" size={22} />
                  Xác nhận Từ chối Đơn HLV
                </>
              )}
            </h3>

            <p className="text-xs text-white/70 leading-relaxed">
              {modalAction === 'APPROVE'
                ? `Bạn đang chuẩn bị phê duyệt tài khoản ${selectedApp.fullName} (${selectedApp.email}) thành Huấn luyện viên PT chính thức.`
                : `Bạn đang từ chối đơn đăng ký PT của ${selectedApp.fullName}. Vui lòng nhập lý do bên dưới để gửi thông báo.`}
            </p>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Ghi chú / Nhận xét của Admin:
              </label>
              <textarea
                rows={3}
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#10b981] outline-none"
                placeholder="Nhập lý do hoặc nhận xét..."
              />
            </div>

            <div className="flex gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setSelectedApp(null);
                  setModalAction(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 text-xs font-bold hover:bg-white/5"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmitAction}
                disabled={submitting}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-opacity flex items-center justify-center gap-1 cursor-pointer ${
                  modalAction === 'APPROVE'
                    ? 'bg-[#10b981] text-[#003824] shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                }`}
              >
                {submitting ? 'Đang xử lý...' : modalAction === 'APPROVE' ? 'Xác nhận Phê Duyệt' : 'Xác nhận Từ Chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
