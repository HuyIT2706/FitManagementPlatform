import { describe, it, expect } from 'vitest';
import { parseMealMacros, sumMealMacros } from './mealMacros';

describe('mealMacros utility', () => {
  describe('parseMealMacros', () => {
    it('should return zeroes for undefined, null, or empty string', () => {
      expect(parseMealMacros(undefined)).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
      expect(parseMealMacros('')).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
      expect(parseMealMacros('   \n  ')).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    });

    it('should parse single food line with calories and P/C/F macros', () => {
      const line = '(+) 200g Ức gà áp chảo (260 kcal, 56g P, 0g C, 4g F)';
      const macros = parseMealMacros(line);

      expect(macros.calories).toBe(260);
      expect(macros.protein).toBe(56);
      expect(macros.carbs).toBe(0);
      expect(macros.fat).toBe(4);
    });

    it('should sum multiple food lines within a meal correctly', () => {
      const mealText = [
        '(+) 200g Ức gà áp chảo (260 kcal, 56g P, 0g C, 4g F)',
        '(+) 150g Cơm trắng (195 kcal, 4.1g P, 42g C, 0.5g F)',
        '(+) 100g Rau bina xào tỏi (35 kcal, 3g P, 3g C, 1g F)',
      ].join('\n');

      const macros = parseMealMacros(mealText);

      expect(macros.calories).toBe(490);
      expect(macros.protein).toBeCloseTo(63.1, 1);
      expect(macros.carbs).toBeCloseTo(45, 1);
      expect(macros.fat).toBeCloseTo(5.5, 1);
    });

    it('should handle decimal macros and alternative units without crashing', () => {
      const text = '(+) 125g Yến mạch ngâm (156.5 kcal, 4.8 P, 23.4 C, 4.8 F)';
      const macros = parseMealMacros(text);

      expect(macros.calories).toBe(157);
      expect(macros.protein).toBe(4.8);
      expect(macros.carbs).toBe(23.4);
      expect(macros.fat).toBe(4.8);
    });
  });

  describe('sumMealMacros', () => {
    it('should aggregate 4 meal sessions into a daily total', () => {
      const breakfast = { calories: 500, protein: 35, carbs: 60, fat: 12 };
      const lunch = { calories: 750, protein: 60, carbs: 80, fat: 20 };
      const dinner = { calories: 650, protein: 55, carbs: 70, fat: 15 };
      const snack = { calories: 250, protein: 15, carbs: 30, fat: 5 };

      const total = sumMealMacros([breakfast, lunch, dinner, snack]);

      expect(total.calories).toBe(2150);
      expect(total.protein).toBe(165);
      expect(total.carbs).toBe(240);
      expect(total.fat).toBe(52);
    });
  });
});

