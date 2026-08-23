'use client';

import React from 'react';
import { FileText, Clock } from 'lucide-react';
import type { CoachReviewListProps } from '../../../../interface';
import AdminLoading from '../../components/AdminLoading';
import CoachReviewCard from './CoachReviewCard';

const CoachReviewList = ({
  applications,
  loading,
  onApprove,
  onReject,
}: CoachReviewListProps) => {
  return (
    <section className="space-y-4" suppressHydrationWarning>
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <FileText size={20} className="text-[#10b981]" />
        Danh sách Đơn Đăng Ký Trở Thành HLV PT ({applications.length})
      </h2>

      {loading ? (
        <AdminLoading message="Đang tải danh sách đơn đăng ký HLV..." />
      ) : applications.length === 0 ? (
        <div className="py-16 text-center bg-[#121a15] rounded-2xl border border-white/10" suppressHydrationWarning>
          <Clock size={40} className="mx-auto text-white/30 mb-3" />
          <p className="text-sm font-bold text-white/80">Không có đơn đăng ký nào phù hợp</p>
          <p className="text-xs text-white/50 mt-1">Thay đổi bộ lọc hoặc tìm kiếm tên HLV khác.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {applications.map((app) => (
            <CoachReviewCard
              key={app.id}
              application={app}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CoachReviewList;
