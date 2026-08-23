'use client';
import { useEffect, useState } from 'react';
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
const CoachReviewPage = () => {
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
    <div className="space-y-8">
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
export default CoachReviewPage;