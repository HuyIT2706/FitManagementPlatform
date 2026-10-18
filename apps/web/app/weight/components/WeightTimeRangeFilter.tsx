'use client';

import React from 'react';
import type { WeightTimeRangeFilterProps, WeightTimeRange } from '../../../interface';

export const WeightTimeRangeFilter: React.FC<WeightTimeRangeFilterProps> = ({
  timeRange,
  onChangeTimeRange,
}) => {
  const options: Array<{ id: WeightTimeRange; label: string }> = [
    { id: 'DAY', label: 'Ngày' },
    { id: 'WEEK', label: 'Tuần' },
    { id: 'MONTH', label: 'Tháng' },
  ];

  return (
    <div className="flex justify-center">
      <div className="inline-flex p-1 bg-white dark:bg-[#141b17] border-2 border-[#82c91e] rounded-2xl shadow-xs gap-1.5">
        {options.map((opt) => {
          const isActive = timeRange === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChangeTimeRange(opt.id)}
              className={`px-5 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#82c91e] text-slate-950 shadow-xs'
                  : 'bg-[#9ca3af] dark:bg-[#6b7280] text-white hover:opacity-90'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WeightTimeRangeFilter;
