'use client';

import React from 'react';
import type { WeightChartCardProps } from '../../../interface';

export const WeightChartCard: React.FC<WeightChartCardProps> = ({
  yTicks,
  maxVal,
  chartPoints,
}) => {
  return (
    <section className="bg-white dark:bg-[#141b17] rounded-3xl border border-slate-200/80 dark:border-white/10 p-4 sm:p-5 shadow-xs overflow-hidden">
      <div className="relative w-full h-[280px] sm:h-[300px] flex">
        {/* Y-axis Ticks Labels (Left) */}
        <div className="w-12 h-[240px] flex flex-col justify-between items-end pr-2 text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0 select-none">
          {yTicks.map((tick, index) => (
            <span key={index} className="leading-none">
              {tick.toFixed(1)}
            </span>
          ))}
        </div>

        {/* Chart SVG Canvas */}
        <div className="relative flex-1 h-[240px]">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Horizontal Gridlines */}
            {yTicks.map((_, index) => {
              const yPercent = (index / (yTicks.length - 1)) * 100;
              return (
                <line
                  key={index}
                  x1="0%"
                  y1={`${yPercent}%`}
                  x2="100%"
                  y2={`${yPercent}%`}
                  stroke="#8fa85b"
                  strokeWidth="1.2"
                  strokeOpacity="0.75"
                />
              );
            })}

            {/* Connecting Line between points */}
            {chartPoints.length > 1 && (
              <polyline
                fill="none"
                stroke="#82c91e"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={chartPoints
                  .map((p, i) => {
                    const totalSlots = Math.max(chartPoints.length - 1, 1);
                    const x = 5 + (i / totalSlots) * 90;
                    const clampedWeight = Math.min(Math.max(p.weight, 0), maxVal);
                    const y = 100 - (clampedWeight / maxVal) * 100;
                    return `${x}%,${y}%`;
                  })
                  .join(' ')}
              />
            )}

            {/* Points & Labels */}
            {chartPoints.map((p, i) => {
              const totalSlots = Math.max(chartPoints.length - 1, 1);
              // When only 1 point, position nicely around 15% as in screenshot
              const xPercent = chartPoints.length === 1 ? 15 : 5 + (i / totalSlots) * 90;
              const clampedWeight = Math.min(Math.max(p.weight, 0), maxVal);
              const yPercent = 100 - (clampedWeight / maxVal) * 100;

              return (
                <g key={p.id || i} className="group cursor-pointer">
                  {/* Weight Value Text above point */}
                  <text
                    x={`${xPercent}%`}
                    y={`${Math.max(yPercent - 4, 3)}%`}
                    textAnchor="middle"
                    className="text-[11px] font-extrabold fill-slate-800 dark:fill-white select-none"
                  >
                    {p.weight}
                  </text>

                  {/* Point Circle */}
                  <circle
                    cx={`${xPercent}%`}
                    cy={`${yPercent}%`}
                    r="4.5"
                    fill="#82c91e"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="transition-transform group-hover:scale-125"
                  />
                </g>
              );
            })}
          </svg>

          {/* X-axis Date Labels below the grid */}
          <div className="absolute -bottom-6 left-0 right-0 h-6 flex">
            {chartPoints.map((p, i) => {
              const totalSlots = Math.max(chartPoints.length - 1, 1);
              const xPercent = chartPoints.length === 1 ? 15 : 5 + (i / totalSlots) * 90;
              return (
                <span
                  key={p.id || i}
                  style={{ left: `${xPercent}%`, transform: 'translateX(-50%)' }}
                  className="absolute text-xs font-bold text-slate-700 dark:text-slate-300 select-none whitespace-nowrap"
                >
                  {p.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeightChartCard;
