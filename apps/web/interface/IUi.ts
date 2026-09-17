import type React from 'react';
import type { UserData } from '@repo/types';

export interface AppSearchInputProps {
  value: string;
  onChange: (value: string, e?: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  onClear?: () => void;
  onSubmit?: () => void;
  className?: string;
  inputClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'glass';
  disabled?: boolean;
  autoFocus?: boolean;
  showClearButton?: boolean;
  id?: string;
}

export interface AppLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export interface PtPendingApprovalProps {
  currentUser?: UserData | null;
  onLogout?: () => void;
}

export interface AccessDeniedProps {
  requiredRole?: 'ADMIN' | 'PT' | 'USER';
  currentUser?: UserData | null;
  onLogout?: () => void;
  title?: string;
  message?: string;
}

export interface BottomNavBarProps {
  activeTab: 'diary' | 'workout' | 'history' | 'profile';
}

export interface PTBottomNavBarProps {
  activeTab: 'home' | 'schedule' | 'students' | 'profile';
}
