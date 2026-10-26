'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser, prefetchCurrentUser } from '../hooks/swr';
import { handleRoleRedirect } from '../utils/authRedirect';
import { performLogout } from '../utils/logout';

import AppLoading from '../components/ui/AppLoading';

/**
 * Root redirect page.
 *
 * PERFORMANCE: Instead of calling apiClient.get('/users/me') directly
 * (which bypasses SWR cache), we call prefetchCurrentUser() to populate
 * the SWR cache key '/users/me', then read from it via useCurrentUser().
 * This ensures the subsequent /home page gets the data instantly from cache
 * rather than firing a second identical request.
 */
const RootPage = () => {
  const router = useRouter();

  // Populate SWR cache on mount (no-op if no token)
  useEffect(() => {
    prefetchCurrentUser();
  }, []);

  const { data: userData, error } = useCurrentUser();

  useEffect(() => {
    if (error) {
      performLogout();
      return;
    }
    if (userData) {
      handleRoleRedirect(userData, router);
    }
  }, [userData, error, router]);

  return <AppLoading fullScreen size="lg" message="Đang kết nối hệ thống NutriCore..." />;
};

export default RootPage;
