import { describe, expect, it } from 'vitest';
import { formatGoalLabel } from './goalLabels';

describe('goalLabels utility', () => {
  it('formats short goal labels including GAIN_WEIGHT', () => {
    expect(formatGoalLabel('LOSE_WEIGHT')).toBe('Giảm Mỡ');
    expect(formatGoalLabel('GAIN_WEIGHT')).toBe('Tăng Cân');
    expect(formatGoalLabel('gain_weight')).toBe('Tăng Cân');
    expect(formatGoalLabel('GAIN_MUSCLE')).toBe('Tăng Cơ');
    expect(formatGoalLabel('BUILD_MUSCLE')).toBe('Tăng Cơ');
    expect(formatGoalLabel('MAINTAIN')).toBe('Giữ Vóc Dáng');
    expect(formatGoalLabel(null)).toBe('Chưa chọn');
  });

  it('formats descriptive goal labels for charts', () => {
    expect(formatGoalLabel('GAIN_WEIGHT', 'descriptive')).toBe('Tăng Cân / Tăng Cơ');
    expect(formatGoalLabel('LOSE_WEIGHT', 'descriptive')).toBe('Giảm Mỡ / Giảm Cân');
    expect(formatGoalLabel('MAINTAIN', 'descriptive')).toBe('Duy Trì Vóc Dáng & Sức Khỏe');
  });
});
