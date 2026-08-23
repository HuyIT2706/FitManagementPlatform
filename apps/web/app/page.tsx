'use client';

import { useEffect } from 'react';
import apiClient from '../api/axios';
import { handleRoleRedirect } from '../utils/authRedirect';

import AppLoading from '../components/ui/AppLoading';

const RootPage = () => {
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      handleRoleRedirect(null);
      return;
    }

    apiClient
      .get<{ role: string; onboardingCompleted: boolean }>('/users/me')
      .then((res) => {
        handleRoleRedirect(res.data);
      })
      .catch(() => {
        localStorage.removeItem('jwt_token');
        handleRoleRedirect(null);
      });
  }, []);

  return <AppLoading fullScreen size="lg" message="Đang kết nối hệ thống NutriCore..." />;
};

export default RootPage;
