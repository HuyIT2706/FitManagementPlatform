'use client';

import React, { useState, useMemo } from 'react';
import type { InBodyHistoryPoint } from '@repo/types';
import { TrendingDown, TrendingUp, Minus, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface InBodyStockChartProps {
  historyPoints: InBodyHistoryPoint[];
  metric: 'weight' | 'fat' | 'muscle';
  onMetricChange: (metric: 'weight' | 'fat' | 'muscle') => void;
}

const InBodyStockChart = ({
  historyPoints,
  metric,
  onMetricChange,
}: InBodyStockChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
          glowColor: 'rgba(245, 158, 11, 0.6)',
          gradientId: 'stockGradientFat',
          badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          invertGoodTrend: true, // Lower fat is good
        };
      case 'muscle':
        return {
          key: 'muscleMassKg' as const,
          label: 'Khối lượng Cơ (Muscle Mass)',
          shortLabel: 'Khối cơ',
          unit: 'Kg',
          color: '#60a5fa',
          glowColor: 'rgba(96, 165, 250, 0.6)',
          gradientId: 'stockGradientMuscle',
          badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          invertGoodTrend: false, // Higher muscle is good
        };
      case 'weight':
      default:
        return {
          key: 'weightKg' as const,
          label: 'Biến động Cân nặng',
          shortLabel: 'Cân nặng',
          unit: 'Kg',
          color: '#10b981',
          glowColor: 'rgba(16, 185, 129, 0.6)',
          gradientId: 'stockGradientWeight',
          badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          invertGoodTrend: true, // For weight loss, lower is good
        };
    }
  }, [metric]);

  // Sort chronologically (oldest to newest for timeline chart)
  const sortedPoints = useMemo(() => {
    if (!historyPoints || historyPoints.length === 0) return [];
    
    // Parse date safely (e.g. "26/8/2026", "26/08/2026", "2026-08-26")
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

  // Extract data values
  const dataSeries = useMemo(() => {
    return sortedPoints.map((pt) => ({
      date: pt.date,
      value: Number(pt[metricConfig.key]) || 0,
    }));
  }, [sortedPoints, metricConfig.key]);

  // Chart dimensions
  const svgWidth = 800;
  const svgHeight = 240;
  const padding = { top: 30, right: 65, bottom: 40, left: 20 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Min / Max values
  const values = dataSeries.map((d) => d.value);
  const rawMin = values.length > 0 ? Math.min(...values) : 0;
  const rawMax = values.length > 0 ? Math.max(...values) : 100;
  const valRange = rawMax - rawMin;
  const margin = valRange === 0 ? (rawMax === 0 ? 10 : rawMax * 0.2) : valRange * 0.18;
  const yMin = Math.max(0, Math.floor((rawMin - margin) * 10) / 10);
  const yMax = Math.ceil((rawMax + margin) * 10) / 10;
  const effectiveRange = yMax - yMin || 1;

  // Map data point to SVG coordinates
  const coords = useMemo(() => {
    if (dataSeries.length === 0) return [];
    const firstPoint = dataSeries[0];
    if (!firstPoint) return [];
    if (dataSeries.length === 1) {
      return [
        {
          x: padding.left + plotWidth / 2,
          y: padding.top + plotHeight / 2,
          ...firstPoint,
        },
      ];
    }
    return dataSeries.map((d, idx) => {
      const x = padding.left + (idx / (dataSeries.length - 1)) * plotWidth;
      const normalizedY = (d.value - yMin) / effectiveRange;
      const y = padding.top + plotHeight - normalizedY * plotHeight;
      return { x, y, ...d };
    });
  }, [dataSeries, yMin, effectiveRange, plotWidth, plotHeight, padding.left, padding.top]);

  // Smooth Bezier path calculation (Cubic Spline interpolation)
  const { linePath, areaPath } = useMemo(() => {
    if (coords.length === 0) return { linePath: '', areaPath: '' };
    const firstCoord = coords[0];
    const lastCoord = coords[coords.length - 1];
    if (!firstCoord || !lastCoord) return { linePath: '', areaPath: '' };

    if (coords.length === 1) {
      const p = firstCoord;
      return {
        linePath: `M ${p.x - 30} ${p.y} L ${p.x + 30} ${p.y}`,
        areaPath: `M ${p.x - 30} ${p.y} L ${p.x + 30} ${p.y} L ${p.x + 30} ${padding.top + plotHeight} L ${p.x - 30} ${padding.top + plotHeight} Z`,
      };
    }

    let d = `M ${firstCoord.x},${firstCoord.y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const current = coords[i];
      const next = coords[i + 1];
      if (!current || !next) continue;
      const controlX = current.x + (next.x - current.x) / 2;
      d += ` C ${controlX},${current.y} ${controlX},${next.y} ${next.x},${next.y}`;
    }

    const baselineY = padding.top + plotHeight;
    const area = `${d} L ${lastCoord.x},${baselineY} L ${firstCoord.x},${baselineY} Z`;

    return { linePath: d, areaPath: area };
  }, [coords, padding.top, plotHeight]);

  // Stock Market Summary Statistics
  const stats = useMemo(() => {
    if (dataSeries.length === 0) {
      return { current: 0, initial: 0, delta: 0, pct: 0, high: 0, low: 0 };
    }
    const firstItem = dataSeries[0];
    const lastItem = dataSeries[dataSeries.length - 1];
    if (!firstItem || !lastItem) {
      return { current: 0, initial: 0, delta: 0, pct: 0, high: 0, low: 0 };
    }
    const initial = firstItem.value;
    const current = lastItem.value;
    const delta = current - initial;
    const pct = initial !== 0 ? (delta / initial) * 100 : 0;
    const high = Math.max(...dataSeries.map((d) => d.value));
    const low = Math.min(...dataSeries.map((d) => d.value));
    return { current, initial, delta, pct, high, low };
  }, [dataSeries]);

  // Active point for cursor
  const activePoint = hoveredIndex !== null && coords[hoveredIndex] ? coords[hoveredIndex] : null;

  // Compute delta compared to previous point for hovered tooltip
  const hoveredDelta = useMemo(() => {
    if (hoveredIndex === null || hoveredIndex <= 0) return null;
    const currItem = dataSeries[hoveredIndex];
    const prevItem = dataSeries[hoveredIndex - 1];
    if (!currItem || !prevItem) return null;
    return currItem.value - prevItem.value;
  }, [hoveredIndex, dataSeries]);

  // Y-axis grid lines (4 horizontal ticks)
  const yTicks = useMemo(() => {
    const ticksCount = 4;
    return Array.from({ length: ticksCount }).map((_, i) => {
      const val = yMin + (effectiveRange / (ticksCount - 1)) * (ticksCount - 1 - i);
      const y = padding.top + (i / (ticksCount - 1)) * plotHeight;
      return { val: Math.round(val * 10) / 10, y };
    });
  }, [yMin, effectiveRange, plotHeight, padding.top]);

  return (
    <div className="bento-card rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0c120e]/80 backdrop-blur-xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl relative overflow-hidden">
      {/* Top Header & Ticker Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        {/* Left: Financial Asset Ticker style info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: metricConfig.color }}
              />
              <span
                className="relative inline-flex rounded-full h-2.5 w-2.5"
                style={{ backgroundColor: metricConfig.color }}
              />
            </span>
            <span className="text-xs uppercase tracking-widest text-white/60 font-black flex items-center gap-1.5">
              <Activity size={13} className="text-primary" />
              Biểu đồ phân tích InBody
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full border bg-white/5 border-white/10 text-white/70 font-mono">
              {dataSeries.length} lần đo
            </span>
          </div>

          <div className="flex items-baseline gap-3 flex-wrap pt-0.5">
            <span className="text-2xl sm:text-3xl font-black font-headline-md tracking-tight text-white">
              {stats.current}
              <span className="text-sm sm:text-base font-bold text-white/50 ml-1">
                {metricConfig.unit}
              </span>
            </span>

            {dataSeries.length > 1 && (
              <div
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black tracking-wide border ${
                  stats.delta < 0
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : stats.delta > 0
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    : 'bg-white/10 text-white/70 border-white/20'
                }`}
              >
                {stats.delta < 0 ? (
                  <TrendingDown size={14} className="shrink-0" />
                ) : stats.delta > 0 ? (
                  <TrendingUp size={14} className="shrink-0" />
                ) : (
                  <Minus size={14} className="shrink-0" />
                )}
                <span>
                  {stats.delta > 0 ? `+${stats.delta.toFixed(1)}` : stats.delta.toFixed(1)}{' '}
                  {metricConfig.unit} ({stats.pct > 0 ? `+${stats.pct.toFixed(1)}` : stats.pct.toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Metric Switcher Buttons (Like Stock Pairs BTC / ETH / SOL) */}
        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-2xl border border-white/10 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => onMetricChange('weight')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              metric === 'weight'
                ? 'bg-primary text-black shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Cân nặng
          </button>
          <button
            type="button"
            onClick={() => onMetricChange('fat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              metric === 'fat'
                ? 'bg-amber-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Body Fat
          </button>
          <button
            type="button"
            onClick={() => onMetricChange('muscle')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              metric === 'muscle'
                ? 'bg-blue-400 text-black shadow-[0_0_12px_rgba(96,165,250,0.5)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Khối cơ
          </button>
        </div>
      </div>

      {/* Stock Chart Canvas Area */}
      <div className="relative w-full overflow-hidden select-none">
        {dataSeries.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-white/40 space-y-2">
            <Activity size={32} className="opacity-40 animate-pulse" />
            <p className="text-xs font-medium">Chưa có đủ dữ liệu InBody để kết xuất biểu đồ biến động.</p>
          </div>
        ) : (
          <div className="relative">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible cursor-crosshair"
              onMouseLeave={() => setHoveredIndex(null)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;
                
                // Find nearest data point
                let nearestIdx = 0;
                let minDist = Infinity;
                coords.forEach((pt, idx) => {
                  const dist = Math.abs(pt.x - mouseX);
                  if (dist < minDist) {
                    minDist = dist;
                    nearestIdx = idx;
                  }
                });
                setHoveredIndex(nearestIdx);
              }}
            >
              <defs>
                {/* Area Gradient */}
                <linearGradient id={metricConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={metricConfig.color} stopOpacity="0.35" />
                  <stop offset="70%" stopColor={metricConfig.color} stopOpacity="0.05" />
                  <stop offset="100%" stopColor={metricConfig.color} stopOpacity="0.0" />
                </linearGradient>

                {/* Line Glow Filter */}
                <filter id="stockGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={metricConfig.glowColor} />
                </filter>
              </defs>

              {/* Background Horizontal Grid Lines & Y-Axis Labels */}
              {yTicks.map((tick, i) => (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={tick.y}
                    x2={svgWidth - padding.right}
                    y2={tick.y}
                    stroke="rgba(255, 255, 255, 0.07)"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={svgWidth - padding.right + 8}
                    y={tick.y + 4}
                    fill="rgba(255, 255, 255, 0.4)"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    {tick.val}
                    <tspan fill="rgba(255, 255, 255, 0.25)" fontSize="9">
                      {metricConfig.unit}
                    </tspan>
                  </text>
                </g>
              ))}

              {/* Area fill under curve */}
              {areaPath && (
                <path d={areaPath} fill={`url(#${metricConfig.gradientId})`} />
              )}

              {/* Main Line with Neon Glow */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke={metricConfig.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#stockGlow)"
                />
              )}

              {/* Data points nodes */}
              {coords.map((pt, idx) => {
                const isHovered = hoveredIndex === idx;
                return (
                  <g key={idx}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : 3.5}
                      fill="#0c120e"
                      stroke={metricConfig.color}
                      strokeWidth={isHovered ? 2.5 : 2}
                      className="transition-all duration-150"
                    />
                    {isHovered && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="12"
                        fill={metricConfig.color}
                        opacity="0.25"
                        className="animate-ping pointer-events-none"
                      />
                    )}
                  </g>
                );
              })}

              {/* Crosshair when hovering (TradingView style) */}
              {activePoint && (
                <g className="pointer-events-none">
                  {/* Vertical Crosshair Line */}
                  <line
                    x1={activePoint.x}
                    y1={padding.top}
                    x2={activePoint.x}
                    y2={padding.top + plotHeight}
                    stroke="rgba(255, 255, 255, 0.35)"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  {/* Horizontal Crosshair Line */}
                  <line
                    x1={padding.left}
                    y1={activePoint.y}
                    x2={svgWidth - padding.right}
                    y2={activePoint.y}
                    stroke="rgba(255, 255, 255, 0.35)"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  {/* Right Y-axis Value Pill */}
                  <rect
                    x={svgWidth - padding.right + 4}
                    y={activePoint.y - 10}
                    width={48}
                    height={20}
                    rx="4"
                    fill={metricConfig.color}
                  />
                  <text
                    x={svgWidth - padding.right + 28}
                    y={activePoint.y + 3.5}
                    textAnchor="middle"
                    fill="#000"
                    fontSize="10"
                    fontWeight="800"
                    fontFamily="monospace"
                  >
                    {activePoint.value}
                  </text>
                </g>
              )}

              {/* X-Axis Dates */}
              {coords.map((pt, idx) => {
                // Show dates smartly to avoid crowding
                const showLabel =
                  coords.length <= 6 ||
                  idx === 0 ||
                  idx === coords.length - 1 ||
                  idx % Math.ceil(coords.length / 5) === 0;

                if (!showLabel) return null;

                return (
                  <text
                    key={`label-${idx}`}
                    x={pt.x}
                    y={padding.top + plotHeight + 22}
                    textAnchor="middle"
                    fill={hoveredIndex === idx ? '#fff' : 'rgba(255, 255, 255, 0.45)'}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight={hoveredIndex === idx ? 'bold' : '500'}
                  >
                    {pt.date}
                  </text>
                );
              })}
            </svg>

            {/* Floating Candlestick / Stock Tooltip Capsule */}
            {activePoint && (
              <div
                className="absolute pointer-events-none z-30 transition-transform duration-75"
                style={{
                  left: `${(activePoint.x / svgWidth) * 100}%`,
                  top: `${Math.max(10, (activePoint.y / svgHeight) * 100 - 32)}%`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <div className="bg-[#15201a]/95 border border-white/20 rounded-xl p-2.5 shadow-2xl backdrop-blur-md whitespace-nowrap min-w-[120px] text-center space-y-1">
                  <div className="text-[10px] text-white/50 font-mono font-medium">
                    {activePoint.date}
                  </div>
                  <div className="text-base font-black text-white flex items-center justify-center gap-1">
                    <span style={{ color: metricConfig.color }}>{activePoint.value}</span>
                    <span className="text-xs text-white/60 font-bold">{metricConfig.unit}</span>
                  </div>
                  {hoveredDelta !== null && (
                    <div
                      className={`text-[10px] font-bold flex items-center justify-center gap-0.5 ${
                        hoveredDelta > 0
                          ? 'text-rose-400'
                          : hoveredDelta < 0
                          ? 'text-emerald-400'
                          : 'text-white/50'
                      }`}
                    >
                      {hoveredDelta > 0 ? (
                        <ArrowUpRight size={11} />
                      ) : hoveredDelta < 0 ? (
                        <ArrowDownRight size={11} />
                      ) : null}
                      <span>
                        {hoveredDelta > 0 ? `+${hoveredDelta.toFixed(1)}` : hoveredDelta.toFixed(1)}{' '}
                        {metricConfig.unit} so với trước
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stock Sub-bar: High / Low / Trend summary */}
      {dataSeries.length > 1 && (
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-xs">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col">
            <span className="text-[10px] text-white/50 font-medium">Đỉnh (Cao nhất)</span>
            <span className="text-sm font-bold text-white font-mono mt-0.5">
              {stats.high} <span className="text-[10px] font-normal text-white/40">{metricConfig.unit}</span>
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col">
            <span className="text-[10px] text-white/50 font-medium">Đáy (Thấp nhất)</span>
            <span className="text-sm font-bold text-white font-mono mt-0.5">
              {stats.low} <span className="text-[10px] font-normal text-white/40">{metricConfig.unit}</span>
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col">
            <span className="text-[10px] text-white/50 font-medium">Biến thiên tổng</span>
            <span
              className={`text-sm font-bold font-mono mt-0.5 ${
                stats.delta < 0 ? 'text-emerald-400' : stats.delta > 0 ? 'text-rose-400' : 'text-white'
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
