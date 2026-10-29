'use client';

import React, { useMemo } from 'react';
import type { InBodyStockChartProps } from '../../../../../interface';

const InBodyStockChart = ({
  historyPoints,
  metric,
  onMetricChange,
  targetWeight,
  initialWeight,
  currentWeight,
}: InBodyStockChartProps) => {
  const chartHeight = 220; // SVG viewBox height for grid
  const chartWidth = 1000; // SVG viewBox width for grid

  // Metric configuration (Units, Labels)
  const metricConfig = useMemo(() => {
    switch (metric) {
      case 'fat':
        return {
          key: 'bodyFatPercent' as const,
          label: 'Tỷ lệ Mỡ (Body Fat)',
          shortLabel: 'Body Fat',
          unit: '%',
        };
      case 'muscle':
        return {
          key: 'muscleMassKg' as const,
          label: 'Khối lượng Cơ (Muscle Mass)',
          shortLabel: 'Khối cơ',
          unit: 'Kg',
        };
      case 'weight':
      default:
        return {
          key: 'weightKg' as const,
          label: 'Cân nặng',
          shortLabel: 'Cân nặng',
          unit: 'Kg',
        };
    }
  }, [metric]);

  // Sort chronologically (oldest to newest for timeline chart)
  const sortedPoints = useMemo(() => {
    if (!historyPoints || historyPoints.length === 0) return [];

    const parseDate = (dStr: string) => {
      if (!dStr) return 0;
      if (dStr.includes('T')) {
        const t = new Date(dStr).getTime();
        if (!isNaN(t)) return t;
      }
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
      const parsed = new Date(dStr).getTime();
      return isNaN(parsed) ? 0 : parsed;
    };

    return [...historyPoints].sort((a, b) => parseDate(a.date) - parseDate(b.date));
  }, [historyPoints]);

  // Format short date (e.g. "24/10/2026" -> "24-10")
  const formatShortDate = (dStr: string) => {
    if (!dStr) return '';
    if (dStr.includes('T')) {
      const d = new Date(dStr);
      if (!isNaN(d.getTime())) {
        return `${d.getDate()}-${d.getMonth() + 1}`;
      }
    }
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

  // 1. Initial, Current, Target Values for Top 3 Summary Cards
  const initialVal = useMemo(() => {
    if (metric === 'weight' && initialWeight && initialWeight > 0) {
      return initialWeight;
    }
    if (dataSeries.length > 0 && dataSeries[0]) {
      return dataSeries[0].value;
    }
    return 0;
  }, [metric, initialWeight, dataSeries]);

  const currentVal = useMemo(() => {
    if (metric === 'weight' && currentWeight && currentWeight > 0) {
      return currentWeight;
    }
    if (dataSeries.length > 0) {
      const last = dataSeries[dataSeries.length - 1];
      return last ? last.value : initialVal;
    }
    return initialVal;
  }, [metric, currentWeight, dataSeries, initialVal]);

  const targetVal = useMemo(() => {
    if (metric === 'weight' && targetWeight && targetWeight > 0) {
      return targetWeight;
    }
    return 0;
  }, [metric, targetWeight]);

  // 2. Status message (e.g. "Bạn đang giữ vững cân nặng")
  const statusMessage = useMemo(() => {
    if (dataSeries.length === 0) {
      return 'Chưa có dữ liệu ghi nhận chỉ số';
    }
    const diff = Math.round((currentVal - initialVal) * 10) / 10;
    if (Math.abs(diff) < 0.1) {
      return `Học viên đang giữ vững ${metricConfig.shortLabel.toLowerCase()}`;
    }
    if (diff < 0) {
      return `Học viên đã giảm ${Math.abs(diff).toFixed(1)} ${metricConfig.unit}`;
    }
    return `Học viên đã tăng ${diff.toFixed(1)} ${metricConfig.unit}`;
  }, [dataSeries.length, currentVal, initialVal, metricConfig]);

  // 3. Calculate Y-axis ticks and maximum value matching user's weight chart style
  const { yTicks, maxVal } = useMemo(() => {
    const highestVal = Math.max(
      ...dataSeries.map((d) => d.value),
      metric === 'weight' && targetWeight ? targetWeight : 0,
      0
    );

    if (metric === 'fat') {
      const calculatedMax = Math.max(40, Math.ceil((highestVal + 2) / 10) * 10);
      const step = calculatedMax / 5;
      const ticks: number[] = [];
      for (let i = 5; i >= 0; i--) {
        ticks.push(Math.round(step * i));
      }
      return { yTicks: ticks, maxVal: calculatedMax };
    }

    if (metric === 'muscle') {
      const calculatedMax = Math.max(60, Math.ceil((highestVal + 2) / 10) * 10);
      const step = calculatedMax / 6;
      const ticks: number[] = [];
      for (let i = 6; i >= 0; i--) {
        ticks.push(Math.round(step * i));
      }
      return { yTicks: ticks, maxVal: calculatedMax };
    }

    // Default weight: 0 - 90 (or higher by multiples of 15)
    const calculatedMax = Math.max(90, Math.ceil((highestVal + 2) / 15) * 15);
    const step = calculatedMax / 6;
    const ticks: number[] = [];
    for (let i = 6; i >= 0; i--) {
      ticks.push(Math.round(step * i));
    }
    return { yTicks: ticks, maxVal: calculatedMax };
  }, [dataSeries, metric, targetWeight]);

  // 4. Compute point coordinates matching WeightChartCard geometry
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

  // 5. Polyline points string for green trendline
  const polylinePoints = useMemo(() => {
    if (coords.length < 2) return '';
    return coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  }, [coords]);

  // 6. Orange Target line calculation (matching user's WeightChartCard)
  const targetLine = useMemo(() => {
    if (!targetWeight || targetWeight <= 0 || coords.length === 0 || metric !== 'weight') {
      return null;
    }
    const first = coords[0];
    const last = coords[coords.length - 1];
    if (!first || !last) return null;

    const clampedTarget = Math.min(Math.max(targetWeight, 0), maxVal);
    const targetY = chartHeight - (clampedTarget / maxVal) * chartHeight;

    const x1 = coords.length === 1 ? first.x - 40 : first.x;
    const x2 = coords.length === 1 ? first.x + 40 : last.x;

    return { x1, x2, targetY };
  }, [targetWeight, coords, maxVal, chartHeight, metric]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Top Summary Card (Ban đầu | Hiện tại | Mục tiêu) matching Screenshot 2 */}
      <section className="bg-white dark:bg-[#141b17] rounded-3xl border border-slate-200/80 dark:border-white/10 p-5 shadow-xs transition-colors">
        <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-white/10 text-center">
          {/* Ban đầu */}
          <div className="px-2">
            <div className="text-slate-800 dark:text-white font-bold text-sm mb-1.5">
              <span>Ban đầu</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {initialVal > 0 ? `${initialVal}${metricConfig.unit}` : '--'}
            </div>
          </div>

          {/* Hiện tại */}
          <div className="px-2">
            <div className="text-slate-800 dark:text-white font-bold text-sm mb-1.5">
              <span>Hiện tại</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {currentVal > 0 ? `${currentVal}${metricConfig.unit}` : '--'}
            </div>
          </div>

          {/* Mục tiêu */}
          <div className="px-2">
            <div className="text-slate-800 dark:text-white font-bold text-sm mb-1.5">
              <span>Mục tiêu</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {targetVal > 0 ? `${targetVal}${metricConfig.unit}` : '--'}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Status Banner matching Screenshot 2 */}
      <div className="text-center py-0.5">
        <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-white/95">
          {statusMessage}
        </p>
      </div>

      {/* 3. Metric Filter Buttons (styled exactly like Ngày | Tuần | Tháng in Screenshot 2) */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-white dark:bg-[#141b17] border-2 border-[#82c91e] rounded-2xl shadow-xs gap-1.5">
          <button
            type="button"
            onClick={() => onMetricChange('weight')}
            className={`px-5 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              metric === 'weight'
                ? 'bg-[#82c91e] text-slate-950 shadow-xs'
                : 'bg-[#9ca3af] dark:bg-[#6b7280] text-white hover:opacity-90'
            }`}
          >
            Cân nặng
          </button>
          <button
            type="button"
            onClick={() => onMetricChange('fat')}
            className={`px-5 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              metric === 'fat'
                ? 'bg-[#82c91e] text-slate-950 shadow-xs'
                : 'bg-[#9ca3af] dark:bg-[#6b7280] text-white hover:opacity-90'
            }`}
          >
            Body Fat
          </button>
          <button
            type="button"
            onClick={() => onMetricChange('muscle')}
            className={`px-5 py-1.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              metric === 'muscle'
                ? 'bg-[#82c91e] text-slate-950 shadow-xs'
                : 'bg-[#9ca3af] dark:bg-[#6b7280] text-white hover:opacity-90'
            }`}
          >
            Khối cơ
          </button>
        </div>
      </div>

      {/* 4. Chart Card matching Screenshot 2 */}
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

            {/* HTML Overlay: Circular Dots & Crisp Measurement Numbers */}
            <div className="absolute inset-0 pointer-events-none">
              {coords.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Chưa có đủ dữ liệu InBody để kết xuất biểu đồ
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
                  {/* Measurement value text right above the dot */}
                  <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 text-[13px] font-bold text-slate-700 dark:text-slate-200 select-none whitespace-nowrap leading-none drop-shadow-xs">
                    {c.value}
                  </span>

                  {/* Point Dot */}
                  <div className="w-2.5 h-2.5 rounded-full bg-[#82c91e] ring-2 ring-white dark:ring-[#141b17] pointer-events-auto transition-transform hover:scale-150 shadow-xs" />
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
      </section>
    </div>
  );
};

export default InBodyStockChart;
