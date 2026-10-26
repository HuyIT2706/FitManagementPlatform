'use client';

import React, { useMemo } from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import type { InBodyStockChartProps } from '../../../../../interface';

const InBodyStockChart = ({
  historyPoints,
  metric,
  onMetricChange,
}: InBodyStockChartProps) => {
  const chartHeight = 220; // SVG viewBox height for grid
  const chartWidth = 1000; // SVG viewBox width for grid

  // Metric configuration (Colors, Units, Labels)
  const metricConfig = useMemo(() => {
    switch (metric) {
      case 'fat':
        return {
          key: 'bodyFatPercent' as const,
          label: 'Tỷ lệ Mỡ (Body Fat)',
          shortLabel: 'Body Fat',
          unit: '%',
          color: '#f59e0b',
        };
      case 'muscle':
        return {
          key: 'muscleMassKg' as const,
          label: 'Khối lượng Cơ (Muscle Mass)',
          shortLabel: 'Khối cơ',
          unit: 'Kg',
          color: '#3b82f6',
        };
      case 'weight':
      default:
        return {
          key: 'weightKg' as const,
          label: 'Biến động Cân nặng',
          shortLabel: 'Cân nặng',
          unit: 'Kg',
          color: '#82c91e',
        };
    }
  }, [metric]);

  // Sort chronologically (oldest to newest for timeline chart)
  const sortedPoints = useMemo(() => {
    if (!historyPoints || historyPoints.length === 0) return [];

    const parseDate = (dStr: string) => {
      if (!dStr) return 0;
      if (dStr.includes('/')) {
        const parts = dStr.split('/');
        const p0 = parts[0];
        const p1 = parts[1];
        const p2 = parts[2];
        if (p0 && p1 && p2) {
          const day = parseInt(p0, 10);
          const month = parseInt(p1, 10) - 1;
          const year = parseInt(p2, 10);
          return new Date(year, month, day).getTime();
        }
      }
      return new Date(dStr).getTime() || 0;
    };

    return [...historyPoints].sort((a, b) => parseDate(a.date) - parseDate(b.date));
  }, [historyPoints]);

  // Format short date (e.g. "24/10/2026" -> "24-10")
  const formatShortDate = (dStr: string) => {
    if (!dStr) return '';
    if (dStr.includes('/')) {
      const parts = dStr.split('/');
      if (parts.length >= 2 && parts[0] && parts[1]) {
        return `${parseInt(parts[0], 10)}-${parseInt(parts[1], 10)}`;
      }
    }
    if (dStr.includes('-')) {
      const parts = dStr.split('-');
      if (parts.length >= 3 && parts[1] && parts[2]) {
        return `${parseInt(parts[2], 10)}-${parseInt(parts[1], 10)}`;
      }
      if (parts.length === 2 && parts[0] && parts[1]) {
        return `${parseInt(parts[0], 10)}-${parseInt(parts[1], 10)}`;
      }
    }
    return dStr;
  };

  // Extract data values
  const dataSeries = useMemo(() => {
    return sortedPoints.map((pt) => ({
      date: pt.date,
      shortDate: formatShortDate(pt.date),
      value: Number(pt[metricConfig.key]) || 0,
    }));
  }, [sortedPoints, metricConfig.key]);

  // Summary statistics
  const stats = useMemo(() => {
    if (dataSeries.length === 0) {
      return { current: 0, initial: 0, delta: 0, pct: 0, high: 0, low: 0 };
    }
    const nonZeroSeries = dataSeries.filter((d) => d.value > 0);
    const firstItem = nonZeroSeries.length > 0 ? nonZeroSeries[0] : dataSeries[0];
    const lastItem = dataSeries[dataSeries.length - 1];
    if (!firstItem || !lastItem) {
      return { current: 0, initial: 0, delta: 0, pct: 0, high: 0, low: 0 };
    }
    const initial = firstItem.value;
    const current = lastItem.value;
    const delta = current - initial;
    const pct = initial > 0 ? (delta / initial) * 100 : 0;
    const high = Math.max(...dataSeries.map((d) => d.value));
    const low = Math.min(...dataSeries.map((d) => d.value));
    return { current, initial, delta, pct, high, low };
  }, [dataSeries]);

  // Calculate Y-axis ticks and maximum value matching user's weight chart style
  const { yTicks, maxVal } = useMemo(() => {
    const highest = Math.max(...dataSeries.map((d) => d.value), 0);

    if (metric === 'fat') {
      // Body fat % usually 0-40 or 0-50
      const calculatedMax = Math.max(40, Math.ceil((highest + 2) / 10) * 10);
      const step = calculatedMax / 5;
      const ticks: number[] = [];
      for (let i = 5; i >= 0; i--) {
        ticks.push(Math.round(step * i));
      }
      return { yTicks: ticks, maxVal: calculatedMax };
    }

    if (metric === 'muscle') {
      // Muscle mass usually 0-60
      const calculatedMax = Math.max(60, Math.ceil((highest + 2) / 10) * 10);
      const step = calculatedMax / 6;
      const ticks: number[] = [];
      for (let i = 6; i >= 0; i--) {
        ticks.push(Math.round(step * i));
      }
      return { yTicks: ticks, maxVal: calculatedMax };
    }

    // Default weight: 0 - 90 (or higher by multiples of 15)
    const calculatedMax = Math.max(90, Math.ceil((highest + 2) / 15) * 15);
    const step = calculatedMax / 6;
    const ticks: number[] = [];
    for (let i = 6; i >= 0; i--) {
      ticks.push(Math.round(step * i));
    }
    return { yTicks: ticks, maxVal: calculatedMax };
  }, [dataSeries, metric]);

  // Compute point coordinates matching WeightChartCard geometry
  const coords = useMemo(() => {
    if (dataSeries.length === 0) return [];

    const baseGap = 160;
    const minLeft = 100;
    const maxRight = 950;
    const count = dataSeries.length;

    const gap =
      count <= 1
        ? 0
        : Math.min(baseGap, (maxRight - minLeft) / Math.max(count - 1, 1));

    return dataSeries.map((p, i) => {
      const x = count <= 1 ? 120 : minLeft + i * gap;
      const clampedVal = Math.min(Math.max(p.value, 0), maxVal);
      const y = chartHeight - (clampedVal / maxVal) * chartHeight;
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
  }, [dataSeries, maxVal, chartHeight, chartWidth]);

  // Polyline points string for crisp trendline
  const polylinePoints = useMemo(() => {
    if (coords.length < 2) return '';
    return coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  }, [coords]);

  return (
    <div className="bg-white dark:bg-[#141b17] rounded-3xl border border-slate-200/80 dark:border-white/10 p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-xs">
      {/* Top Header & Ticker Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        {/* Left: Indicator Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-slate-600 dark:text-white/60 font-black">
              Biểu đồ phân tích InBody
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full border bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/70 font-mono">
              {dataSeries.length} lần đo
            </span>
          </div>

          <div className="flex items-baseline gap-3 flex-wrap pt-0.5">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {stats.current}
              <span className="text-sm sm:text-base font-bold text-slate-500 dark:text-white/50 ml-1">
                {metricConfig.unit}
              </span>
            </span>

            {dataSeries.length > 1 && (
              <div
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black tracking-wide border ${
                  stats.delta > 0
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : stats.delta < 0
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                    : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white/70 border-slate-200 dark:border-white/20'
                }`}
              >
                {stats.delta > 0 ? (
                  <TrendingUp size={14} className="shrink-0" />
                ) : stats.delta < 0 ? (
                  <TrendingDown size={14} className="shrink-0" />
                ) : (
                  <Minus size={14} className="shrink-0" />
                )}
                <span>
                  {stats.delta > 0 ? `+${stats.delta.toFixed(1)}` : stats.delta.toFixed(1)}{' '}
                  {metricConfig.unit}
                  {stats.pct !== 0 && (
                    <> ({stats.pct > 0 ? `+${stats.pct.toFixed(1)}` : stats.pct.toFixed(1)}%)</>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Metric Switcher Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-black/40 rounded-2xl border border-slate-200 dark:border-white/10 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => onMetricChange('weight')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              metric === 'weight'
                ? 'bg-[#82c91e] text-slate-900 shadow-[0_0_12px_rgba(130,201,30,0.4)]'
                : 'text-slate-700 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
            }`}
          >
            Cân nặng
          </button>
          <button
            type="button"
            onClick={() => onMetricChange('fat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              metric === 'fat'
                ? 'bg-amber-400 text-slate-900 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'text-slate-700 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
            }`}
          >
            Body Fat
          </button>
          <button
            type="button"
            onClick={() => onMetricChange('muscle')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              metric === 'muscle'
                ? 'bg-blue-400 text-slate-900 shadow-[0_0_12px_rgba(96,165,250,0.4)]'
                : 'text-slate-700 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
            }`}
          >
            Khối cơ
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative w-full flex pt-2 pb-7">
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
                  stroke={metricConfig.color}
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
              stroke={metricConfig.color}
              strokeWidth="1.5"
            />

            {/* Polyline trendline connecting data points */}
            {polylinePoints && (
              <polyline
                vectorEffect="non-scaling-stroke"
                fill="none"
                stroke={metricConfig.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePoints}
              />
            )}
          </svg>

          {/* HTML Overlay: Circular Dots & Visible Value Numbers */}
          <div className="absolute inset-0 pointer-events-none">
            {coords.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Chưa có đủ dữ liệu InBody để kết xuất biểu đồ.
                </p>
              </div>
            )}

            {coords.map((c, i) => (
              <div
                key={i}
                style={{
                  left: `${c.xPercent}%`,
                  top: `${c.yPercent}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                {/* Numeric value text right above the dot */}
                <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 text-[13px] font-bold text-slate-700 dark:text-slate-200 select-none whitespace-nowrap leading-none drop-shadow-xs">
                  {c.value}
                </span>

                {/* Point Dot */}
                <div
                  style={{ backgroundColor: metricConfig.color }}
                  className="w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-[#141b17] pointer-events-auto transition-transform hover:scale-150 shadow-xs"
                />
              </div>
            ))}
          </div>

          {/* X-axis Date Labels below the grid */}
          <div className="absolute -bottom-6 left-0 right-0 h-6">
            {coords.map((c, i) => (
              <span
                key={i}
                style={{ left: `${c.xPercent}%` }}
                className="absolute top-1 -translate-x-1/2 text-xs font-semibold text-slate-700 dark:text-slate-300 select-none whitespace-nowrap"
              >
                {c.shortDate}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-bar: High / Low / Trend summary */}
      {dataSeries.length > 1 && (
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-white/10 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 flex flex-col">
            <span className="text-[10px] text-slate-500 dark:text-white/50 font-medium">Đỉnh (Cao nhất)</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
              {stats.high} <span className="text-[10px] font-normal text-slate-400 dark:text-white/40">{metricConfig.unit}</span>
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 flex flex-col">
            <span className="text-[10px] text-slate-500 dark:text-white/50 font-medium">Đáy (Thấp nhất)</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
              {stats.low} <span className="text-[10px] font-normal text-slate-400 dark:text-white/40">{metricConfig.unit}</span>
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 flex flex-col">
            <span className="text-[10px] text-slate-500 dark:text-white/50 font-medium">Biến thiên tổng</span>
            <span
              className={`text-sm font-bold font-mono mt-0.5 ${
                stats.delta > 0 ? 'text-emerald-600 dark:text-emerald-400' : stats.delta < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {stats.delta > 0 ? `+${stats.delta.toFixed(1)}` : stats.delta.toFixed(1)}{' '}
              <span className="text-[10px] font-normal opacity-70">({stats.pct > 0 ? `+${stats.pct.toFixed(1)}` : stats.pct.toFixed(1)}%)</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InBodyStockChart;
