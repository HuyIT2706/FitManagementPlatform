import apiClient from '../api/axios';
import { mutate } from 'swr';

/**
 * Centrally handles logging out the user:
 * 1. Removes the access token from localStorage immediately.
 * 2. Clears the SWR cache to stop background revalidators from making authenticated calls.
 * 3. Calls backend `/auth/logout` to clear refreshToken in DB and remove httpOnly refresh_token cookie.
 * 4. Navigates cleanly to `/login` via window.location.href to reset all in-memory React state.
 */
export const performLogout = async (redirectPath = '/login'): Promise<void> => {
  try {
    // 1. Immediately remove access token from local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwt_token');
    }

    // 2. Clear SWR in-memory cache to prevent background queries
    try {
      await mutate(() => true, undefined, { revalidate: false });
    } catch {
      // Ignore mutate errors
    }

    // 3. Notify backend to clear DB refreshTokenHash and clear cookie
    await apiClient.post('/auth/logout', {}).catch(() => {
      // Ignore network errors or if already unauthenticated
    });
  } catch (error) {
    console.warn('Logout error:', error);
  } finally {
    // 4. Ensure token is cleared and force a clean browser navigation
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwt_token');
      window.location.href = redirectPath;
    }
  }
};
