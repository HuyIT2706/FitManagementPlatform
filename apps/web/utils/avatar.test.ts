import { describe, it, expect } from 'vitest';
import { getAvatarUrl, DEFAULT_AVATAR } from './avatar';

describe('avatar utils', () => {
  it('should return DEFAULT_AVATAR when url is null, undefined, or empty', () => {
    expect(getAvatarUrl(null)).toBe(DEFAULT_AVATAR);
    expect(getAvatarUrl(undefined)).toBe(DEFAULT_AVATAR);
    expect(getAvatarUrl('')).toBe(DEFAULT_AVATAR);
    expect(getAvatarUrl('   ')).toBe(DEFAULT_AVATAR);
  });

  it('should return the provided url when valid', () => {
    const validUrl = 'https://lh3.googleusercontent.com/avatar.jpg';
    expect(getAvatarUrl(validUrl)).toBe(validUrl);
  });
});

