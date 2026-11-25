'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mutate as globalMutate } from 'swr';
import apiClient from '../../api/axios';
import type { UserDataHome } from '../../interface';
import { handleRoleRedirect } from '../../utils/authRedirect';
import { getPendingInvite } from '../../utils/pendingInvite';
import AppLoading from '../ui/AppLoading';

/**
 * Prevents authenticated users from landing on the marketing page at `/`,
 * routing them directly to their role portal while leaving `/` untouched for guests.
 */
export default function RootAuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    let cancelled = false;
    setIsRedirecting(true);

    apiClient
      .get<UserDataHome>('/users/me')
      .then((res) => {
        if (cancelled) return;
        if (res.data && res.data.role) {
          void globalMutate('/users/me', res.data, false);
          handleRoleRedirect(res.data, router, getPendingInvite());
          return;
        }
        setIsRedirecting(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('refresh_token');
        }
        setIsRedirecting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (isRedirecting) {
    return (
      <AppLoading fullScreen size="lg" message="Đang vào không gian NutriCore..." />
    );
  }

  return <>{children}</>;
}
