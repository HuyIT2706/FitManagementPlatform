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
