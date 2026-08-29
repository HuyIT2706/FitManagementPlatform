/* eslint-disable @next/next/no-img-element */
'use client';

import { Settings2 } from 'lucide-react';

interface StudentHeaderHeroProps {
  fullName: string;
  avatarUrl?: string;
  email: string;
  phone?: string;
  packageName: string;
  remainingSessions: number;
  totalSessions: number;
  onOpenEditSessionModal: () => void;
}

const StudentHeaderHero = ({
  fullName,
  avatarUrl,
  email,
  phone,
  packageName,
  remainingSessions,
  totalSessions,
  onOpenEditSessionModal,
}: StudentHeaderHeroProps) => {
  const sessionPercentage = Math.min(
    100,
    Math.round((remainingSessions / Math.max(1, totalSessions)) * 100)
  );

  return (
    <section className="bento-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-6">
      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary shadow-[0_0_20px_rgba(102,200,28,0.3)] shrink-0">
        <img
          src={
            avatarUrl ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
          }
          alt={fullName}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 text-center md:text-left space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-headline-md text-on-surface">
              {fullName}
            </h1>
            <p className="text-xs text-on-surface-variant font-medium mt-0.5">
              {email} {phone ? `• ${phone}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2 self-center md:self-start">
            <span className="px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider">
              {packageName}
            </span>

            <button
              type="button"
              suppressHydrationWarning
              onClick={onOpenEditSessionModal}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary/20 text-white/70 hover:text-primary border border-white/15 hover:border-primary/40 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95 group"
              title="Chỉnh sửa số buổi & gói tập"
              aria-label="Chỉnh sửa số buổi & gói tập"
            >
              <Settings2 size={16} className="group-hover:rotate-45 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Session Progress */}
        <div className="pt-2 max-w-md space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-on-surface">Tiến độ gói tập</span>
            <span className="text-primary">
              {remainingSessions} / {totalSessions} Buổi còn lại
            </span>
          </div>
          <div className="w-full h-2.5 bg-surface-bright rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(102,200,28,0.5)]"
              style={{ width: `${sessionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentHeaderHero;
