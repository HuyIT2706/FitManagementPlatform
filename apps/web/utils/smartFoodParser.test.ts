import { describe, it, expect } from 'vitest';
import { sanitizeSpeechTranscript, parseVietnameseFoodTokens } from './smartFoodParser';

describe('smartFoodParser', () => {
  describe('sanitizeSpeechTranscript', () => {
    it('should return empty string for empty input', () => {
      expect(sanitizeSpeechTranscript('')).toBe('');
    });

    it('should deduplicate consecutive identical words', () => {
      expect(sanitizeSpeechTranscript('thịt bò bò tái')).toBe('thịt bò tái');
    });

    it('should deduplicate repeating phrases from voice input', () => {
      expect(sanitizeSpeechTranscript('trứng ốp la trứng ốp la')).toBe('trứng ốp la');
    });
  });

  describe('parseVietnameseFoodTokens', () => {
    it('should extract food name and weight correctly', () => {
      const tokens = parseVietnameseFoodTokens('200g ức gà');
      expect(tokens.length).toBeGreaterThan(0);
      const chicken = tokens.find((t) => t.query.includes('ức gà') || t.weight === 200);
      expect(chicken).toBeDefined();
      expect(chicken?.weight).toBe(200);
    });

    it('should convert kg/kí to grams', () => {
      const tokens = parseVietnameseFoodTokens('1.5 kg dưa hấu');
      expect(tokens.length).toBeGreaterThan(0);
      const watermelon = tokens.find((t) => t.weight === 1500);
      expect(watermelon).toBeDefined();
    });

    it('should handle empty or whitespace input gracefully', () => {
      expect(parseVietnameseFoodTokens('')).toEqual([]);
      expect(parseVietnameseFoodTokens('   ')).toEqual([]);
    });
  });
});

