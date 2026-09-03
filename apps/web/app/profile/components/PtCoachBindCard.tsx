'use client';

import { useState } from 'react';
import { QrCode, Link as LinkIcon, CheckCircle2, ShieldCheck, Clock, XCircle } from 'lucide-react';
import type { PtCoachBindCardProps } from '../../../interface';
import apiClient from '../../../api/axios';
import { toast } from '../../../utils/toast';

const PtCoachBindCard = ({ assignedPt, onBindSuccess }: PtCoachBindCardProps) => {
  const [ptCode, setPtCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // An active, approved PT
  const isApprovedPt = Boolean(
    assignedPt &&
      assignedPt.fullName &&
      (assignedPt.status === 'APPROVED' || assignedPt.isApproved)
  );

  // A pending invitation waiting for PT to approve
  const isPendingPt = Boolean(
    assignedPt &&
      assignedPt.fullName &&
      (assignedPt.status === 'PENDING' || assignedPt.isPending)
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isApprovedPt) {
      toast.error('Bạn đã có Huấn Luyện Viên đồng hành!');
      return;
    }
    const input = ptCode.trim();
    if (!input) {
      toast.error('Vui lòng nhập Mã PT!');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await apiClient.post<{ message?: string }>('/pt/students/bind', {
        ptCodeOrInviteCode: input,
      });
      toast.success(res.data.message || 'Đã gửi lời mời liên kết tới Coach! Đang chờ phê duyệt.');
      setPtCode('');
      if (onBindSuccess) onBindSuccess();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Không thể kết nối với PT Code này!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBind = async () => {
    setIsCancelling(true);
    try {
      const res = await apiClient.delete<{ message?: string }>('/pt/students/bind');
      toast.success(res.data.message || 'Đã hủy yêu cầu liên kết PT thành công!');
      if (onBindSuccess) onBindSuccess();
    } catch {
      toast.error('Không thể hủy yêu cầu liên kết!');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <section
      className={`bento-card rounded-2xl p-5 md:p-6 border transition-all space-y-3 ${
        isApprovedPt
          ? 'border-green-light/30 bg-green-light/5'
          : isPendingPt
            ? 'border-amber-400/30 bg-amber-400/5'
            : 'border-primary/30 bg-primary/5'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <QrCode
            size={20}
            className={
              isApprovedPt
                ? 'text-green-light'
                : isPendingPt
                  ? 'text-amber-400'
                  : 'text-primary'
            }
          />
          <h3 className="font-bold text-on-surface text-base">
            {isApprovedPt
              ? 'Huấn Luyện Viên PT Đồng Hành'
              : isPendingPt
                ? 'Yêu Cầu Kết Nối Đang Chờ Duyệt'
                : 'Liên kết với Huấn Luyện Viên PT'}
          </h3>
        </div>
        {isApprovedPt && (
          <span className="px-2.5 py-0.5 rounded-full bg-green-light/15 border border-green-light/30 text-green-light text-[11px] font-bold flex items-center gap-1">
            <CheckCircle2 size={12} />
            Đang hoạt động
          </span>
        )}
        {isPendingPt && (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-400 text-[11px] font-bold flex items-center gap-1 animate-pulse">
            <Clock size={12} />
            Chờ HLV duyệt
          </span>
        )}
      </div>

      {isApprovedPt ? (
        <p className="text-xs text-on-surface-variant font-medium">
          Bạn đang tập luyện 1:1 cùng{' '}
          <strong className="text-green-light font-bold">
            Coach {assignedPt?.fullName}
          </strong>
          {assignedPt?.phone ? ` (SĐT: ${assignedPt.phone})` : ''}. Chức năng nhập mã mới đã được khóa.
        </p>
      ) : isPendingPt ? (
        <p className="text-xs text-on-surface-variant font-medium">
          Bạn đã gửi lời mời liên kết tới{' '}
          <strong className="text-amber-400 font-bold">
            Coach {assignedPt?.fullName}
          </strong>
          . Vui lòng chờ Huấn luyện viên phê duyệt hoặc bấm <strong className="text-white">Hủy yêu cầu</strong> bên dưới nếu muốn nhập mã PT khác.
        </p>
      ) : (
        <p className="text-xs text-on-surface-variant font-medium">
          Nhập Mã PT duy nhất của Coach (ví dụ:{' '}
          <strong className="text-primary font-mono">PT-CHIEN / PT-HUY066</strong>) hoặc Mã Mời từ Gmail để kết nối 1-1.
        </p>
      )}

      {isPendingPt ? (
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <input
            type="text"
            disabled
            value={`CHỜ DUYỆT: COACH ${assignedPt?.fullName?.toUpperCase()}`}
            className="w-full sm:flex-1 border rounded-xl px-4 py-2.5 text-xs font-extrabold outline-none tracking-wider uppercase font-mono bg-surface-bright/40 border-amber-400/20 text-amber-300/80 cursor-not-allowed select-none"
          />
          <button
            type="button"
            onClick={handleCancelBind}
            disabled={isCancelling}
            className="w-full sm:w-auto px-5 py-2.5 font-extrabold text-xs rounded-xl transition-all shrink-0 flex items-center justify-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 cursor-pointer active:scale-95"
          >
            <XCircle size={15} />
            {isCancelling ? 'Đang hủy...' : 'Hủy yêu cầu'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <input
            type="text"
            name="ptCode"
            disabled={isApprovedPt}
            suppressHydrationWarning
            value={isApprovedPt ? `ĐÃ LIÊN KẾT: COACH ${assignedPt?.fullName?.toUpperCase()}` : ptCode}
            onChange={(e) => setPtCode(e.target.value)}
            placeholder="Gõ Mã PT....."
            className={`w-full sm:flex-1 border rounded-xl px-4 py-2.5 text-xs font-extrabold outline-none tracking-wider uppercase font-mono transition-all ${
              isApprovedPt
                ? 'bg-surface-bright/40 border-white/5 text-on-surface-variant/70 cursor-not-allowed select-none'
                : 'bg-surface-bright border-white/10 text-on-surface focus:border-primary'
            }`}
          />
          <button
            type="submit"
            disabled={isApprovedPt || isSubmitting}
            suppressHydrationWarning
            className={`w-full sm:w-auto px-6 py-2.5 font-extrabold text-xs rounded-xl transition-all shrink-0 flex items-center justify-center gap-1.5 ${
              isApprovedPt
                ? 'bg-surface-bright border border-white/10 text-on-surface-variant/50 cursor-not-allowed opacity-75'
                : 'bg-primary text-dark-slate shadow-[0_0_12px_rgba(102,200,28,0.4)] hover:bg-primary/90 cursor-pointer'
            }`}
          >
            {isApprovedPt ? (
              <>
                <ShieldCheck size={15} className="text-green-light" />
                Đã có HLV PT
              </>
            ) : (
              <>
                <LinkIcon size={15} />
                {isSubmitting ? 'Đang kết nối...' : 'Kết nối PT Coach'}
              </>
            )}
          </button>
        </form>
      )}
    </section>
  );
};

export default PtCoachBindCard;
