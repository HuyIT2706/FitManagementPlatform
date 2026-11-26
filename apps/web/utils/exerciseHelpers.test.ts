import { describe, expect, it } from 'vitest';
import {
  buildExerciseOverview,
  cleanInstructionSteps,
  estimateBurnedCalories,
  formatEquipmentLabel,
  formatLevelLabel,
  formatMechanicLabel,
  formatMuscleLabel,
  getGoalPrescription,
} from './exerciseHelpers';
import type { ExerciseItem } from '../interface';

describe('exerciseHelpers utility', () => {
  it('formats Vietnamese muscle labels accurately', () => {
    expect(formatMuscleLabel('cơ ngực')).toBe('Ngực');
    expect(formatMuscleLabel('cơ xô')).toBe('Xô (Lats)');
    expect(formatMuscleLabel('cơ dang (hông ngoài)')).toBe('Hông ngoài');
  });

  it('formats mechanic, level, and equipment labels with fallbacks', () => {
    expect(formatMechanicLabel('phức hợp (compound)')).toBe('Đa khớp');
    expect(formatMechanicLabel('cô lập (isolation)')).toBe('Cô lập');
    expect(formatMechanicLabel(null)).toBeNull();

    expect(formatLevelLabel('mới bắt đầu')).toBe('Người mới');
    expect(formatLevelLabel('trung cấp')).toBe('Trung bình');
    expect(formatLevelLabel('nâng cao')).toBe('Nâng cao');

    expect(formatEquipmentLabel(null)).toBe('Trọng lượng cơ thể');
    expect(formatEquipmentLabel('thanh đòn')).toBe('Thanh đòn');
  });

  it('prioritizes PT assigned sets/reps over derived goal prescription', () => {
    const baseExercise = {
      category: 'Sức mạnh',
      mechanic: 'phức hợp (compound)',
      level: 'mới bắt đầu',
    };

    expect(getGoalPrescription(baseExercise, 'LOSE_WEIGHT', 5, 8)).toEqual({
      setsReps: '5 × 8',
      restLabel: '90–120 giây',
      goalCaption: 'Theo giáo án PT của bạn • Người mới',
    });

    expect(getGoalPrescription(baseExercise, 'GAIN_MUSCLE')).toEqual({
      setsReps: '4 × 6–10',
      restLabel: '2 phút',
      goalCaption: 'Theo mục tiêu của bạn: Tăng cơ & sức mạnh • Người mới',
    });

    expect(getGoalPrescription(baseExercise, 'LOSE_WEIGHT')).toEqual({
      setsReps: '4 × 10–12',
      restLabel: '60–90 giây',
      goalCaption: 'Theo mục tiêu của bạn: Giảm mỡ & săn chắc • Người mới',
    });
  });

  it('cleans redundant generic instruction steps and builds overview', () => {
    const steps = cleanInstructionSteps([
      'Nằm ngửa trên ghế phẳng.',
      'Hạ tạ có kiểm soát.',
      'Lặp lại số lần lặp lại được đề xuất.',
    ]);
    expect(steps).toEqual(['Nằm ngửa trên ghế phẳng.', 'Hạ tạ có kiểm soát.']);

    const mockExercise: ExerciseItem = {
      id: 'ex-1',
      name: 'Barbell Bench Press',
      category: 'Sức mạnh',
      level: 'mới bắt đầu',
      mechanic: 'phức hợp (compound)',
      equipment: 'thanh đòn',
      primaryMuscles: ['cơ ngực'],
      secondaryMuscles: ['cơ vai', 'cơ tay sau'],
      instructions: steps,
      setupImageUrl: null,
      startImageUrl: null,
    };

    const overview = buildExerciseOverview(mockExercise);
    expect(overview).toContain('ngực');
    expect(overview).toContain('thanh đòn');
  });

  it('estimates burned calories from MET, duration, weight, and intensity', () => {
    // 6.0 MET * 1.0 intensity * 70kg * (60 / 60 h) = 420 kcal
    expect(estimateBurnedCalories(6.0, 60, 70, 1.0)).toBe(420);
    // 9.5 MET * 1.25 intensity * 60kg * (30 / 60 h) = 356.25 -> 356 kcal
    expect(estimateBurnedCalories(9.5, 30, 60, 1.25)).toBe(356);
    expect(estimateBurnedCalories(6.0, 0, 70, 1.0)).toBe(0);
  });
});
