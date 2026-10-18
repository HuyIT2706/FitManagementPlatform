'use client';

import React from 'react';
import { TrendingDown, TrendingUp, Minus, Trash2 } from 'lucide-react';
import type { WeightHistoryListProps } from '../../../interface';

export const WeightHistoryList: React.FC<WeightHistoryListProps> = ({
  metrics,
  isDeletingId,
  onDelete,
}) => {
  return (
    <section className="bg-white dark:bg-[#141b17] rounded-3xl border border-slate-200/80 dark:border-white/10 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
          Lịch sử 
        </h3>
      </div>

      {metrics.length === 0 ? (
        <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs">
          Chưa có dữ liệu lịch sử cân nặng. Hãy bấm nút &quot;+&quot; để ghi nhận mốc đầu tiên!
        </div>
      ) : (
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {[...metrics].reverse().map((item, index, arr) => {
            const prev = arr[index + 1];
            const diff = prev ? Math.round((item.weight - prev.weight) * 10) / 10 : null;
            const d = new Date(item.recordedAt);

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-lime-500/15 text-lime-600 dark:text-lime-400 flex items-center justify-center font-bold text-xs">
                    {d.getDate()}/{d.getMonth() + 1}
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {item.weight} kg
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {d.toLocaleDateString('vi-VN')} {d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {diff !== null && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 ${
                        diff < 0
                          ? 'text-emerald-500 bg-emerald-500/10'
                          : diff > 0
                          ? 'text-amber-500 bg-amber-500/10'
                          : 'text-slate-400 bg-slate-100 dark:bg-white/5'
                      }`}
                    >
                      {diff < 0 ? (
                        <TrendingDown size={12} />
                      ) : diff > 0 ? (
                        <TrendingUp size={12} />
                      ) : (
                        <Minus size={12} />
                      )}
                      {diff > 0 ? `+${diff}` : `${diff}`} kg
                    </span>
                  )}

                  <button
                    type="button"
                    disabled={isDeletingId === item.id}
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Xóa bản ghi này"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default WeightHistoryList;
