import apiClient, { notifyAuthChanged } from '../api/axios';
import { mutate } from 'swr';
import { clearPendingInvite, isInvitePath } from './pendingInvite';
import { clearSwrCache } from './swrCache';

/**
 * Logs out the user: clears SWR cache, revokes backend refresh token,
 * purges client storage, and redirects to the target page.
 */
export const performLogout = async (redirectPath = '/login'): Promise<void> => {
  try {
    try {
      await mutate(() => true, undefined, { revalidate: false });
    } catch {
      // Non-blocking
    }

    await apiClient.post('/auth/logout', {}).catch(() => {});
  } catch (error) {
    console.warn('Logout error:', error);
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('refresh_token');
      clearSwrCache();
      notifyAuthChanged();
      if (!isInvitePath(redirectPath)) {
        clearPendingInvite();
      }
      try {
        sessionStorage.removeItem('nutricore_push_synced');
      } catch {
        // Non-blocking
      }
      window.location.href = redirectPath;
    }
  }
};
