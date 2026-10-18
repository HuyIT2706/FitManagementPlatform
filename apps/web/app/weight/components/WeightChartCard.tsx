'use client';

import React, { useMemo } from 'react';
import type { WeightChartCardProps } from '../../../interface';

export const WeightChartCard: React.FC<WeightChartCardProps> = ({
  yTicks,
  maxVal,
  chartPoints,
  targetWeight,
}) => {
  const chartHeight = 220; // SVG viewBox height for grid
  const chartWidth = 1000; // SVG viewBox width for grid

  // Compute point coordinates
  const coords = useMemo(() => {
    if (!chartPoints || chartPoints.length === 0) return [];

    const baseGap = 160;
    const minLeft = 100;
    const maxRight = 950;
    const count = chartPoints.length;

    const gap =
      count <= 1
        ? 0
        : Math.min(baseGap, (maxRight - minLeft) / Math.max(count - 1, 1));

    return chartPoints.map((p, i) => {
      const x = count <= 1 ? 120 : minLeft + i * gap;
      const clampedWeight = Math.min(Math.max(p.weight, 0), maxVal);
      const y = chartHeight - (clampedWeight / maxVal) * chartHeight;
      const xPercent = (x / chartWidth) * 100;
      const yPercent = (y / chartHeight) * 100;

      return {
        ...p,
        x,
        y,
        xPercent,
        yPercent,
      };
    });
  }, [chartPoints, maxVal, chartHeight, chartWidth]);

  // SVG polyline points string for green trendline
  const polylinePoints = useMemo(() => {
    if (coords.length < 2) return '';
    return coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  }, [coords]);

  // Target line calculation
  const targetLine = useMemo(() => {
    if (!targetWeight || targetWeight <= 0 || coords.length === 0) return null;
    const first = coords[0];
    const last = coords[coords.length - 1];
    if (!first || !last) return null;

    const clampedTarget = Math.min(Math.max(targetWeight, 0), maxVal);
    const targetY = chartHeight - (clampedTarget / maxVal) * chartHeight;

    const x1 = coords.length === 1 ? first.x - 40 : first.x;
    const x2 = coords.length === 1 ? first.x + 40 : last.x;

    return { x1, x2, targetY };
  }, [targetWeight, coords, maxVal, chartHeight]);

  return (
    <section className="bg-white dark:bg-[#141b17] rounded-3xl border border-slate-200/80 dark:border-white/10 p-5 pt-6 pb-7 shadow-xs">
      <div className="relative w-full flex">
        {/* Y-axis Ticks Labels (Left) */}
        <div className="relative w-10 h-[220px] shrink-0 select-none">
          {yTicks.map((tick, index) => {
            const topPercent = (index / Math.max(yTicks.length - 1, 1)) * 100;
            return (
              <span
                key={index}
                style={{ top: `${topPercent}%` }}
                className="absolute right-2.5 -translate-y-1/2 text-xs font-semibold text-slate-600 dark:text-slate-400 leading-none"
              >
                {Math.round(tick)}
              </span>
            );
          })}
        </div>

        {/* Chart Canvas Area */}
        <div className="relative flex-1 h-[220px]">
          {/* SVG Canvas for Grid and Lines */}
          <svg
            className="w-full h-full overflow-visible"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="none"
          >
            {/* Horizontal Gridlines */}
            {yTicks.map((_, index) => {
              const yCoord = (index / Math.max(yTicks.length - 1, 1)) * chartHeight;
              return (
                <line
                  key={index}
                  vectorEffect="non-scaling-stroke"
                  x1={0}
                  y1={yCoord}
                  x2={chartWidth}
                  y2={yCoord}
                  stroke="#82c91e"
                  strokeWidth="1.2"
                  strokeOpacity="0.75"
                />
              );
            })}

            {/* Vertical Axis Line (left edge of chart) */}
            <line
              vectorEffect="non-scaling-stroke"
              x1={0}
              y1={-8}
              x2={0}
              y2={chartHeight + 8}
              stroke="#82c91e"
              strokeWidth="1.5"
            />

            {/* Orange Target Line */}
            {targetLine && (
              <line
                vectorEffect="non-scaling-stroke"
                x1={targetLine.x1}
                y1={targetLine.targetY}
                x2={targetLine.x2}
                y2={targetLine.targetY}
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}

            {/* Green Trendline connecting data points */}
            {polylinePoints && (
              <polyline
                vectorEffect="non-scaling-stroke"
                fill="none"
                stroke="#82c91e"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePoints}
              />
            )}
          </svg>

          {/* HTML Overlay: Circular Dots & Crisp Weight Numbers */}
          <div className="absolute inset-0 pointer-events-none">
            {coords.map((c) => (
              <div
                key={c.id || c.label}
                style={{
                  left: `${c.xPercent}%`,
                  top: `${c.yPercent}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                {/* Weight text right above the dot */}
                <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 text-[13px] font-bold text-slate-700 dark:text-slate-200 select-none whitespace-nowrap leading-none drop-shadow-xs">
                  {c.weight}
                </span>

                {/* Point Dot */}
                <div className="w-2.5 h-2.5 rounded-full bg-[#82c91e] ring-2 ring-white dark:ring-[#141b17] pointer-events-auto transition-transform hover:scale-150 shadow-xs" />
              </div>
            ))}
          </div>

          {/* X-axis Date Labels below the grid */}
          <div className="absolute -bottom-6 left-0 right-0 h-6">
            {coords.map((c) => (
              <span
                key={c.id || c.label}
                style={{ left: `${c.xPercent}%` }}
                className="absolute top-1 -translate-x-1/2 text-xs font-semibold text-slate-700 dark:text-slate-300 select-none whitespace-nowrap"
              >
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeightChartCard;
