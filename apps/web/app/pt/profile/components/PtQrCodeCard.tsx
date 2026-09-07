/* eslint-disable @next/next/no-img-element */
'use client';

import { QrCode, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface PtQrCodeCardProps {
  ptCode: string;
  qrUrl: string;
  onCopyPtCode: () => void;
}

const PtQrCodeCard = ({ ptCode, qrUrl, onCopyPtCode }: PtQrCodeCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopyPtCode();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bento-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-primary/30 space-y-4 sm:space-y-6 bg-primary/5 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-primary/15 text-primary px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2 border border-primary/30">
            <QrCode size={15} className="sm:w-4 sm:h-4" />
            Mã Định Danh PT Coach
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-on-surface">Mã PT & QR Code Liên Kết 1-1</h3>
          <p className="text-xs text-on-surface-variant mt-1 font-medium max-w-md leading-relaxed">
            Cho học viên quét mã QR hoặc gõ Mã PT này khi đăng ký/liên kết tài khoản để kết nối trực
            tiếp với Coach.
          </p>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-white/20 shadow-lg self-center sm:self-auto shrink-0 text-center">
          <img src={qrUrl} alt="PT QR Code" className="w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-lg" />
          <span className="text-[11px] text-gray-900 font-extrabold block mt-1.5 font-mono">
            {ptCode}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 pt-2 border-t border-white/10">
        <div className="flex-1 bg-surface-bright/60 border border-white/10 rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between w-full">
          <span className="text-xs text-on-surface-variant font-medium">Mã PT của bạn:</span>
          <strong className="text-base sm:text-lg font-extrabold text-primary tracking-wider font-mono">
            {ptCode}
          </strong>
        </div>

        <button
          type="button"
          suppressHydrationWarning
          onClick={handleCopy}
          className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 bg-primary text-dark-slate rounded-xl sm:rounded-2xl font-extrabold text-xs shadow-[0_0_15px_rgba(102,200,28,0.4)] hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? 'Đã sao chép' : 'Sao chép Mã PT'}
        </button>
      </div>
    </div>
  );
};

export default PtQrCodeCard;
