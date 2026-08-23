'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, LogOut, RefreshCw } from 'lucide-react';
import apiClient from '../../../api/axios';
import { toast } from '../../../utils/toast';
import type {
  AdminPtApplication,
  AdminStats,
  AdminFilterStatus,
} from '../../../interface';
import CoachReviewHeroStats from './components/CoachReviewHeroStats';
import CoachReviewFilterBar from './components/CoachReviewFilterBar';
import CoachReviewList from './components/CoachReviewList';
import CoachReviewActionModal from './components/CoachReviewActionModal';

export default function CoachReviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [applications, setApplications] = useState<AdminPtApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<AdminFilterStatus>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');

  // Rejection/Approval modal state
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
        toast.error('Không thể tải danh sách đơn đăng ký HLV');
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    window.location.href = '/login';
  };

  const handleOpenApproveModal = (app: AdminPtApplication) => {
    setSelectedApp(app);
    setModalAction('APPROVE');
    setActionNote('Đã phê duyệt đủ điều kiện chứng chỉ PT');
  };

  const handleOpenRejectModal = (app: AdminPtApplication) => {
    setSelectedApp(app);
    setModalAction('REJECT');
    setActionNote('Chưa đủ chứng chỉ chuyên môn');
  };

  const handleCloseModal = () => {
    setSelectedApp(null);
    setModalAction(null);
    setActionNote('');
  };

  const handleSubmitAction = () => {
    if (!selectedApp || !modalAction) return;

    setSubmitting(true);
    const endpoint =
      modalAction === 'APPROVE'
        ? `/admin/pt-applications/${selectedApp.id}/approve`
        : `/admin/pt-applications/${selectedApp.id}/reject`;

    apiClient
      .post(endpoint, { note: actionNote })
      .then((res) => {
        toast.success(res.data.message || 'Thao tác thành công!');
        handleCloseModal();
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
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#0e1511]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center text-[#10b981]">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">FitManagement Admin</h1>
            <p className="text-xs text-white/60">Xét Duyệt Đơn Đăng Ký Huấn Luyện Viên PT</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        {/* Component 1: Hero Stats Overview */}
        <CoachReviewHeroStats stats={stats} />

        {/* Component 2: Filters & Search */}
        <CoachReviewFilterBar
          filterStatus={filterStatus}
          pendingCount={stats?.pendingApps ?? 0}
          searchTerm={searchTerm}
          onFilterChange={setFilterStatus}
          onSearchChange={setSearchTerm}
        />

        {/* Component 3: Applications List */}
        <CoachReviewList
          applications={filteredApps}
          loading={loading}
          onApprove={handleOpenApproveModal}
          onReject={handleOpenRejectModal}
        />
      </main>

      {/* Component 4: Action Modal (Approve / Reject) */}
      <CoachReviewActionModal
        isOpen={Boolean(selectedApp && modalAction)}
        application={selectedApp}
        action={modalAction}
        actionNote={actionNote}
        submitting={submitting}
        onNoteChange={setActionNote}
        onClose={handleCloseModal}
        onSubmit={handleSubmitAction}
      />
    </div>
  );
}