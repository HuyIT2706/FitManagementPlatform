const PENDING_INVITE_STORAGE_KEY = 'nutricore_pending_invite';

/**
 * Returns true if the given path points to the student PT invite activation flow.
 */
export function isInvitePath(path?: string | null): path is string {
  return Boolean(path && path.trim().startsWith('/invite'));
}

/**
 * Persists a pending PT invite path so registration, OAuth redirects,
 * and onboarding can complete and immediately submit the PT bind request.
 */
export function savePendingInvite(invitePath: string): void {
  if (typeof window === 'undefined' || !isInvitePath(invitePath)) return;
  try {
    localStorage.setItem(PENDING_INVITE_STORAGE_KEY, invitePath.trim());
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

/**
 * Reads any stored pending PT invite path.
 */
export function getPendingInvite(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const val = localStorage.getItem(PENDING_INVITE_STORAGE_KEY);
    return isInvitePath(val) ? val : null;
  } catch {
    return null;
  }
}

/**
 * Clears any stored pending PT invite path after binding finishes or logs out.
 */
export function clearPendingInvite(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PENDING_INVITE_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
