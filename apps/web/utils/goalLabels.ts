const SHORT_GOAL_LABELS: Record<string, string> = {
  LOSE_WEIGHT: 'Giảm Mỡ',
  GAIN_WEIGHT: 'Tăng Cân',
  GAIN_MUSCLE: 'Tăng Cơ',
  BUILD_MUSCLE: 'Tăng Cơ',
  MAINTAIN: 'Giữ Vóc Dáng',
  ENDURANCE: 'Sức Bền',
};

const DESCRIPTIVE_GOAL_LABELS: Record<string, string> = {
  LOSE_WEIGHT: 'Giảm Mỡ / Giảm Cân',
  GAIN_WEIGHT: 'Tăng Cân / Tăng Cơ',
  GAIN_MUSCLE: 'Tăng Cơ / Xây Dựng Vóc Dáng',
  BUILD_MUSCLE: 'Tăng Cơ / Xây Dựng Vóc Dáng',
  MAINTAIN: 'Duy Trì Vóc Dáng & Sức Khỏe',
  ENDURANCE: 'Sức Bền & Thể Lực',
};

/**
 * Translates backend goal enum keys (e.g. LOSE_WEIGHT, GAIN_WEIGHT) into Vietnamese labels.
 */
export function formatGoalLabel(
  goal?: string | null,
  variant: 'short' | 'descriptive' = 'short',
  fallback = 'Chưa chọn',
): string {
  if (!goal || !goal.trim()) return fallback;
  const key = goal.trim().toUpperCase();
  const map = variant === 'descriptive' ? DESCRIPTIVE_GOAL_LABELS : SHORT_GOAL_LABELS;
  return map[key] || goal;
}
