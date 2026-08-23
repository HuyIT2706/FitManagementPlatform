'use client';

import { CheckCircle2, ChevronRight } from 'lucide-react';
import type { DailyMacroTargetMasterProps } from '../../../interface';

const DailyMacroTargetMaster = ({
  targetCalo,
  targetProtein,
  targetCarbs,
  targetFat,
  suggestedOffset,
}: DailyMacroTargetMasterProps) => {
  const offsetLabel =
    suggestedOffset >= 0 ? `+ ${suggestedOffset}` : `- ${Math.abs(suggestedOffset)}`;

  return (
    <section className="bento-card rounded-2xl p-6 md:p-8 flex flex-col gap-6 border border-outline-variant/30">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-headline-md font-bold mb-1 text-on-surface">
            Mục tiêu Calo & Macro Nạp Vào
          </h3>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-bright/40 border border-white/5 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
            <CheckCircle2 size={13} className="text-primary shrink-0" />
            Chỉ định bởi PT (Calo Nạp vào = TDEE {offsetLabel})
          </div>
        </div>
        <button
          type="button"
          suppressHydrationWarning
          className="text-primary text-xs font-semibold flex items-center gap-0.5 hover:underline cursor-pointer"
        >
          Yêu cầu cập nhật <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <div className="flex justify-between items-end">
          <span className="text-4xl font-headline-md font-extrabold text-on-surface leading-none">
            {targetCalo}{' '}
            <span className="text-xl font-body-md text-on-surface-variant font-medium">kcal</span>
          </span>
          <span className="text-sm font-semibold text-on-surface-variant">
            Mục tiêu hàng ngày
          </span>
        </div>
        <div className="h-3 w-full bg-surface-dim rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-green-light rounded-full shadow-[0_0_10px_rgba(102,200,28,0.5)]"
            style={{ width: '100%' }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface-bright/40 border border-white/5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-on-surface-variant uppercase tracking-wider">Protein</span>
            <span className="text-on-surface font-bold">{targetProtein}g</span>
          </div>
          <div className="h-2 w-full bg-surface-dim rounded-full overflow-hidden">
            <div className="h-full bg-blue-400 rounded-full" style={{ width: '30%' }}></div>
          </div>
        </div>

        <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface-bright/40 border border-white/5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-on-surface-variant uppercase tracking-wider">Carbs</span>
            <span className="text-on-surface font-bold">{targetCarbs}g</span>
          </div>
          <div className="h-2 w-full bg-surface-dim rounded-full overflow-hidden">
            <div className="h-full bg-orange-400 rounded-full" style={{ width: '50%' }}></div>
          </div>
        </div>

        <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface-bright/40 border border-white/5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-on-surface-variant uppercase tracking-wider">Fats</span>
            <span className="text-on-surface font-bold">{targetFat}g</span>
          </div>
          <div className="h-2 w-full bg-surface-dim rounded-full overflow-hidden">
            <div className="h-full bg-red-400 rounded-full" style={{ width: '20%' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DailyMacroTargetMaster;
