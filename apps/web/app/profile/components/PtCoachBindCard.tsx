'use client';

import { QrCode, Link as LinkIcon, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { PtCoachBindCardProps } from '../../../interface';
import apiClient from '../../../api/axios';
import { toast } from '../../../utils/toast';

const PtCoachBindCard = ({ assignedPt, onBindSuccess }: PtCoachBindCardProps) => {
  const hasPt = Boolean(assignedPt && assignedPt.fullName);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (hasPt) {
      toast.error('Bạn đã có Huấn Luyện Viên đồng hành!');
      return;
    }
    const form = e.currentTarget;
    const input = (form.elements.namedItem('ptCode') as HTMLInputElement).value;
    if (!input) {
      toast.error('Vui lòng nhập Mã PT!');
      return;
    }
    apiClient
      .post<{ message?: string }>('/pt/students/bind', { ptCodeOrInviteCode: input })
      .then((res) => {
        toast.success(res.data.message || 'Đã liên kết 1-1 với Coach thành công!');
        if (onBindSuccess) onBindSuccess();
      })
      .catch(() => {
        toast.error('Không thể kết nối với PT Code này!');
      });
  };

  return (
    <section
      className={`bento-card rounded-2xl p-5 md:p-6 border transition-all space-y-3 ${
        hasPt
          ? 'border-green-light/30 bg-green-light/5'
          : 'border-primary/30 bg-primary/5'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <QrCode size={20} className={hasPt ? 'text-green-light' : 'text-primary'} />
          <h3 className="font-bold text-on-surface text-base">
            {hasPt ? 'Huấn Luyện Viên PT Đồng Hành' : 'Liên kết với Huấn Luyện Viên PT'}
          </h3>
        </div>
        {hasPt && (
          <span className="px-2.5 py-0.5 rounded-full bg-green-light/15 border border-green-light/30 text-green-light text-[11px] font-bold flex items-center gap-1">
            <CheckCircle2 size={12} />
            Đang hoạt động
          </span>
        )}
      </div>

      {hasPt ? (
        <p className="text-xs text-on-surface-variant font-medium">
          Bạn đang tập luyện 1:1 cùng{' '}
          <strong className="text-green-light font-bold">
            Coach {assignedPt?.fullName}
          </strong>
          {assignedPt?.phone ? ` (SĐT: ${assignedPt.phone})` : ''}. Chức năng nhập mã mới đã được khóa.
        </p>
      ) : (
        <p className="text-xs text-on-surface-variant font-medium">
          Nhập Mã PT duy nhất của Coach (ví dụ:{' '}
          <strong className="text-primary font-mono">PT-HUY066</strong>) hoặc Mã Mời từ Gmail để kết
          nối 1-1.
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 pt-1">
        <input
          type="text"
          name="ptCode"
          disabled={hasPt}
          suppressHydrationWarning
          value={hasPt ? `ĐÃ LIÊN KẾT: COACH ${assignedPt?.fullName?.toUpperCase()}` : undefined}
          placeholder="Gõ Mã PT (ví dụ: PT-HUY066 / INV-9921)"
          className={`w-full sm:flex-1 border rounded-xl px-4 py-2.5 text-xs font-extrabold outline-none tracking-wider uppercase font-mono transition-all ${
            hasPt
              ? 'bg-surface-bright/40 border-white/5 text-on-surface-variant/70 cursor-not-allowed select-none'
              : 'bg-surface-bright border-white/10 text-on-surface focus:border-primary'
          }`}
        />
        <button
          type="submit"
          disabled={hasPt}
          suppressHydrationWarning
          className={`w-full sm:w-auto px-6 py-2.5 font-extrabold text-xs rounded-xl transition-all shrink-0 flex items-center justify-center gap-1.5 ${
            hasPt
              ? 'bg-surface-bright border border-white/10 text-on-surface-variant/50 cursor-not-allowed opacity-75'
              : 'bg-primary text-dark-slate shadow-[0_0_12px_rgba(102,200,28,0.4)] hover:bg-primary/90 cursor-pointer'
          }`}
        >
          {hasPt ? (
            <>
              <ShieldCheck size={15} className="text-green-light" />
              Đã có HLV PT
            </>
          ) : (
            <>
              <LinkIcon size={15} />
              Kết nối PT Coach
            </>
          )}
        </button>
      </form>
    </section>
  );
};

export default PtCoachBindCard;
