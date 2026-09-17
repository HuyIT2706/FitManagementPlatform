import type { UserData } from '@repo/types';

export interface HeaderProps {
  userData?: UserData | null;
  onLogout: () => void;
}
