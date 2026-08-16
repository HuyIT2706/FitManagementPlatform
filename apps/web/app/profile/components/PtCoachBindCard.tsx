'use client';

import { QrCode, Link as LinkIcon } from 'lucide-react';
import type { PtCoachBindCardProps } from '../../../interface';
import apiClient from '../../../api/axios';
import { toast } from '../../../utils/toast';

export default function PtCoachBindCard({ onBindSuccess }: PtCoachBindCardProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
    <section className="bento-card rounded-2xl p-5 md:p-6 border border-primary/30 bg-primary/5 space-y-3">
      <div className="flex items-center gap-2">
        <QrCode size={20} className="text-primary shrink-0" />
        <h3 className="font-bold text-on-surface text-base">Liên kết với Huấn Luyện Viên PT</h3>
      </div>
      <p className="text-xs text-on-surface-variant font-medium">
        Nhập Mã PT duy nhất của Coach (ví dụ:{' '}
        <strong className="text-primary font-mono">PT-HUY066</strong>) hoặc Mã Mời từ Gmail để kết
        nối 1-1.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 pt-1">
        <input
          type="text"
          name="ptCode"
          suppressHydrationWarning
          placeholder="Gõ Mã PT (ví dụ: PT-HUY066 / INV-9921)"
          className="w-full sm:flex-1 bg-surface-bright border border-white/10 rounded-xl px-4 py-2.5 text-xs text-on-surface font-extrabold focus:border-primary outline-none tracking-wider uppercase font-mono"
        />
        <button
          type="submit"
          suppressHydrationWarning
          className="w-full sm:w-auto px-6 py-2.5 bg-primary text-dark-slate font-extrabold text-xs rounded-xl shadow-[0_0_12px_rgba(102,200,28,0.4)] hover:bg-primary/90 transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
        >
          <LinkIcon size={15} />
          Kết nối PT Coach
        </button>
      </form>
    </section>
  );
}
