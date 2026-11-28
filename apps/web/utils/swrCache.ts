const CACHE_PREFIX = 'nutricore_swr_cache_v1_';

function getTokenUserScope(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('jwt_token');
  if (!token) return null;
  try {
    const payloadSegment = token.split('.')[1];
    if (!payloadSegment) return 'anon';
    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const parsed = JSON.parse(json) as { sub?: string };
    return parsed?.sub || 'anon';
  } catch {
    return 'anon';
  }
}

export function readSwrCache<T>(key: string): T | undefined {
  if (typeof window === 'undefined' || !key) return undefined;
  const scope = getTokenUserScope();
  if (!scope) return undefined;
  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${scope}_${key}`);
    if (!raw) return undefined;
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export function writeSwrCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined' || !key || data === undefined) return;
  const scope = getTokenUserScope();
  if (!scope) return;
  try {
    sessionStorage.setItem(
      `${CACHE_PREFIX}${scope}_${key}`,
      JSON.stringify(data),
    );
  } catch {
    // Ignore storage quota or serialization errors
  }
}

export function clearSwrCache(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // Ignore storage access errors
  }
}
