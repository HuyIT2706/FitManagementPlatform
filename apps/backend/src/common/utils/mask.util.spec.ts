import { maskEmail, maskPhone, maskFullName } from './mask.util';

describe('Mask Utils', () => {
  describe('maskEmail', () => {
    it('should mask standard email properly', () => {
      expect(maskEmail('john.doe@example.com')).toBe('jo***e@example.com');
    });

    it('should handle short local part', () => {
      expect(maskEmail('ab@example.com')).toBe('a***@example.com');
    });

    it('should return empty or non-email strings as-is', () => {
      expect(maskEmail(null)).toBe('');
      expect(maskEmail('')).toBe('');
      expect(maskEmail('not-an-email')).toBe('not-an-email');
    });
  });

  describe('maskPhone', () => {
    it('should mask valid phone numbers', () => {
      expect(maskPhone('0901234567')).toBe('090****567');
    });

    it('should return *** for short phone numbers', () => {
      expect(maskPhone('12345')).toBe('***');
    });

    it('should handle null/empty values', () => {
      expect(maskPhone(null)).toBe('');
      expect(maskPhone('')).toBe('');
    });
  });

  describe('maskFullName', () => {
    it('should mask multiple-part full names preserving prefix and first letter of last name', () => {
      expect(maskFullName('Nguyen Van A')).toBe('Nguyen Van A***');
    });

    it('should mask single names', () => {
      expect(maskFullName('Alex')).toBe('Al***');
      expect(maskFullName('Al')).toBe('***');
    });

    it('should handle null/empty strings', () => {
      expect(maskFullName(null)).toBe('');
      expect(maskFullName('')).toBe('');
    });
  });
});
