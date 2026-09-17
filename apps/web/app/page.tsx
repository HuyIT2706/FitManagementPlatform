'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../api/axios';
import { handleRoleRedirect } from '../utils/authRedirect';

import AppLoading from '../components/ui/AppLoading';

const RootPage = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      handleRoleRedirect(null, router);
      return;
    }

    apiClient
      .get<{ role: string; onboardingCompleted: boolean }>('/users/me')
      .then((res) => {
        handleRoleRedirect(res.data, router);
      })
      .catch(() => {
        localStorage.removeItem('jwt_token');
        handleRoleRedirect(null, router);
      });
  }, [router]);

  return <AppLoading fullScreen size="lg" message="Đang kết nối hệ thống NutriCore..." />;
};

export default RootPage;
