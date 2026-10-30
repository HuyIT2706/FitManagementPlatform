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
