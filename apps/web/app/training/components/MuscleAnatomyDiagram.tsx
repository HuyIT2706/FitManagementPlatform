'use client';

import React, { useMemo } from 'react';

interface MuscleAnatomyDiagramProps {
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
}

type MuscleRegionId =
  | 'neck'
  | 'traps'
  | 'shoulders'
  | 'chest'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'lats'
  | 'mid_back'
  | 'lower_back'
  | 'glutes'
  | 'abductors'
  | 'adductors'
  | 'quads'
  | 'hamstrings'
  | 'calves';

const MUSCLE_REGION_MAP: Record<string, MuscleRegionId> = {
  'cơ cổ': 'neck',
  'cơ cầu vai': 'traps',
  'cơ vai': 'shoulders',
  'cơ ngực': 'chest',
  'cơ tay trước': 'biceps',
  'cơ tay sau': 'triceps',
  'cẳng tay': 'forearms',
  'cơ bụng': 'abs',
  'cơ xô': 'lats',
  'cơ lưng giữa': 'mid_back',
  'cơ lưng dưới': 'lower_back',
  'cơ mông': 'glutes',
  'cơ dang (hông ngoài)': 'abductors',
  'cơ khép (đùi trong)': 'adductors',
  'cơ đùi trước': 'quads',
  'cơ đùi sau': 'hamstrings',
  'bắp chân': 'calves',
};

function toRegions(muscles?: string[]): Set<MuscleRegionId> {
  const set = new Set<MuscleRegionId>();
  for (const m of muscles || []) {
    const key = m.trim().toLowerCase();
    const mapped = MUSCLE_REGION_MAP[key];
    if (mapped) set.add(mapped);
  }
  return set;
}

const MuscleAnatomyDiagram = ({
  primaryMuscles,
  secondaryMuscles,
}: MuscleAnatomyDiagramProps) => {
  const primarySet = useMemo(() => toRegions(primaryMuscles), [primaryMuscles]);
  const secondarySet = useMemo(
    () => toRegions(secondaryMuscles),
    [secondaryMuscles],
  );

  const getFill = (region: MuscleRegionId): string => {
    if (primarySet.has(region)) return '#9fe81e';
    if (secondarySet.has(region)) return '#d3f88f';
    return 'currentColor';
  };

  const getOpacity = (region: MuscleRegionId): number => {
    if (primarySet.has(region)) return 1;
    if (secondarySet.has(region)) return 0.88;
    return 0.24;
  };

  return (
    <svg
      viewBox="0 0 220 205"
      className="w-36 sm:w-44 h-auto text-slate-400 dark:text-slate-500 select-none shrink-0"
      aria-label="Sơ đồ nhóm cơ tác động"
    >
      {/* ── FRONT SILHOUETTE (x center ~ 55) ── */}
      <g>
        {/* Head */}
        <circle cx="55" cy="18" r="10.5" fill="currentColor" opacity="0.22" />
        {/* Neck */}
        <rect
          x="50"
          y="29"
          width="10"
          height="7"
          rx="3"
          fill={getFill('neck')}
          opacity={getOpacity('neck')}
        />
        {/* Traps (front upper) */}
        <path
          d="M42 36 L50 32 L60 32 L68 36 L62 41 L48 41 Z"
          fill={getFill('traps')}
          opacity={getOpacity('traps')}
        />
        {/* Chest */}
        <path
          d="M39 42 Q47 40 54 42 L54 57 Q45 58 38 53 Z"
          fill={getFill('chest')}
          opacity={getOpacity('chest')}
        />
        <path
          d="M71 42 Q63 40 56 42 L56 57 Q65 58 72 53 Z"
          fill={getFill('chest')}
          opacity={getOpacity('chest')}
        />
        {/* Shoulders (Delts) */}
        <ellipse
          cx="34"
          cy="45"
          rx="6"
          ry="8.5"
          transform="rotate(14 34 45)"
          fill={getFill('shoulders')}
          opacity={getOpacity('shoulders')}
        />
        <ellipse
          cx="76"
          cy="45"
          rx="6"
          ry="8.5"
          transform="rotate(-14 76 45)"
          fill={getFill('shoulders')}
          opacity={getOpacity('shoulders')}
        />
        {/* Biceps */}
        <ellipse
          cx="29"
          cy="63"
          rx="4.5"
          ry="11"
          transform="rotate(10 29 63)"
          fill={getFill('biceps')}
          opacity={getOpacity('biceps')}
        />
        <ellipse
          cx="81"
          cy="63"
          rx="4.5"
          ry="11"
          transform="rotate(-10 81 63)"
          fill={getFill('biceps')}
          opacity={getOpacity('biceps')}
        />
        {/* Forearms */}
        <path
          d="M25 75 L31 76 L27 98 L22 97 Z"
          fill={getFill('forearms')}
          opacity={getOpacity('forearms')}
        />
        <path
          d="M79 76 L85 75 L88 97 L83 98 Z"
          fill={getFill('forearms')}
          opacity={getOpacity('forearms')}
        />
        {/* Abs */}
        <rect
          x="45"
          y="59"
          width="20"
          height="32"
          rx="6"
          fill={getFill('abs')}
          opacity={getOpacity('abs')}
        />
        {/* Hip Abductors (outer hip) */}
        <path
          d="M38 92 L43 93 L41 112 L36 109 Z"
          fill={getFill('abductors')}
          opacity={getOpacity('abductors')}
        />
        <path
          d="M67 93 L72 92 L74 109 L69 112 Z"
          fill={getFill('abductors')}
          opacity={getOpacity('abductors')}
        />
        {/* Adductors (inner thigh) */}
        <path
          d="M49 97 L54 97 L52 126 L48 124 Z"
          fill={getFill('adductors')}
          opacity={getOpacity('adductors')}
        />
        <path
          d="M56 97 L61 97 L62 124 L58 126 Z"
          fill={getFill('adductors')}
          opacity={getOpacity('adductors')}
        />
        {/* Quads */}
        <path
          d="M39 97 L48 97 L48 139 L40 139 Q37 118 39 97 Z"
          fill={getFill('quads')}
          opacity={getOpacity('quads')}
        />
        <path
          d="M62 97 L71 97 Q73 118 70 139 L62 139 Z"
          fill={getFill('quads')}
          opacity={getOpacity('quads')}
        />
        {/* Front lower legs */}
        <path
          d="M40 144 L48 144 L46 184 L41 184 Z"
          fill="currentColor"
          opacity="0.22"
        />
        <path
          d="M62 144 L70 144 L69 184 L64 184 Z"
          fill="currentColor"
          opacity="0.22"
        />
      </g>

      {/* ── BACK SILHOUETTE (x center ~ 165) ── */}
      <g>
        {/* Head */}
        <circle cx="165" cy="18" r="10.5" fill="currentColor" opacity="0.22" />
        {/* Neck */}
        <rect
          x="160"
          y="29"
          width="10"
          height="7"
          rx="3"
          fill={getFill('neck')}
          opacity={getOpacity('neck')}
        />
        {/* Traps */}
        <path
          d="M150 36 L165 32 L180 36 L169 54 L161 54 Z"
          fill={getFill('traps')}
          opacity={getOpacity('traps')}
        />
        {/* Shoulders (rear delts) */}
        <ellipse
          cx="144"
          cy="45"
          rx="6"
          ry="8.5"
          transform="rotate(14 144 45)"
          fill={getFill('shoulders')}
          opacity={getOpacity('shoulders')}
        />
        <ellipse
          cx="186"
          cy="45"
          rx="6"
          ry="8.5"
          transform="rotate(-14 186 45)"
          fill={getFill('shoulders')}
          opacity={getOpacity('shoulders')}
        />
        {/* Mid Back */}
        <rect
          x="157"
          y="50"
          width="16"
          height="20"
          rx="4"
          fill={getFill('mid_back')}
          opacity={getOpacity('mid_back')}
        />
        {/* Lats */}
        <path
          d="M148 49 L156 51 L156 76 L151 74 Q147 62 148 49 Z"
          fill={getFill('lats')}
          opacity={getOpacity('lats')}
        />
        <path
          d="M182 49 L174 51 L174 76 L179 74 Q183 62 182 49 Z"
          fill={getFill('lats')}
          opacity={getOpacity('lats')}
        />
        {/* Lower Back */}
        <path
          d="M155 72 L175 72 L173 91 L157 91 Z"
          fill={getFill('lower_back')}
          opacity={getOpacity('lower_back')}
        />
        {/* Triceps */}
        <ellipse
          cx="139"
          cy="63"
          rx="4.5"
          ry="11"
          transform="rotate(10 139 63)"
          fill={getFill('triceps')}
          opacity={getOpacity('triceps')}
        />
        <ellipse
          cx="191"
          cy="63"
          rx="4.5"
          ry="11"
          transform="rotate(-10 191 63)"
          fill={getFill('triceps')}
          opacity={getOpacity('triceps')}
        />
        {/* Forearms */}
        <path
          d="M135 75 L141 76 L137 98 L132 97 Z"
          fill={getFill('forearms')}
          opacity={getOpacity('forearms')}
        />
        <path
          d="M189 76 L195 75 L198 97 L193 98 Z"
          fill={getFill('forearms')}
          opacity={getOpacity('forearms')}
        />
        {/* Glutes */}
        <ellipse
          cx="157"
          cy="101"
          rx="8"
          ry="10"
          fill={getFill('glutes')}
          opacity={getOpacity('glutes')}
        />
        <ellipse
          cx="173"
          cy="101"
          rx="8"
          ry="10"
          fill={getFill('glutes')}
          opacity={getOpacity('glutes')}
        />
        {/* Hamstrings */}
        <path
          d="M149 112 L160 112 L159 140 L150 140 Z"
          fill={getFill('hamstrings')}
          opacity={getOpacity('hamstrings')}
        />
        <path
          d="M170 112 L181 112 L180 140 L171 140 Z"
          fill={getFill('hamstrings')}
          opacity={getOpacity('hamstrings')}
        />
        {/* Calves */}
        <ellipse
          cx="154"
          cy="160"
          rx="5"
          ry="15"
          fill={getFill('calves')}
          opacity={getOpacity('calves')}
        />
        <ellipse
          cx="176"
          cy="160"
          rx="5"
          ry="15"
          fill={getFill('calves')}
          opacity={getOpacity('calves')}
        />
      </g>
    </svg>
  );
};

export default MuscleAnatomyDiagram;
