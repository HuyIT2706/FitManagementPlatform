'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '../hooks/swr';
import { handleRoleRedirect } from '../utils/authRedirect';
import { performLogout } from '../utils/logout';

import AppLoading from '../components/ui/AppLoading';

const RootPage = () => {
  const router = useRouter();
  const { data: userData, error } = useCurrentUser();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const search = window.location.search;
      if (
        hash.includes('access_token=') ||
        search.includes('access_token=') ||
        search.includes('token=')
      ) {
        router.replace(`/login${search}${hash}`);
        return;
      }
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    if (!token) {
      router.replace('/login');
      return;
    }
    if (error) {
      performLogout();
      return;
    }
    if (userData && userData.role) {
      handleRoleRedirect(userData, router);
    }
  }, [userData, error, router]);

  return <AppLoading fullScreen size="lg" message="Đang kết nối hệ thống NutriCore..." />;
};

export default RootPage;
