import type { UserData } from '../interface';

export type UserRole = 'ADMIN' | 'PT' | 'USER';

/**
 * Returns the destination route for a given user based on their role and onboarding status.
 */
export const getRoleRedirectPath = (
  user?: Pick<UserData, 'role' | 'onboardingCompleted'> | null
): string => {
  if (!user) {
    return '/login';
  }

  if (user.role === 'ADMIN') {
    return '/admin';
  }

  if (user.role === 'PT') {
    return '/pt';
  }

  if (user.onboardingCompleted === false) {
    return '/onboarding';
  }

  return '/home';
};

/**
 * Automatically redirects the browser to the appropriate dashboard path for the user.
 */
export const handleRoleRedirect = (
  user?: Pick<UserData, 'role' | 'onboardingCompleted'> | null
): void => {
  const targetPath = getRoleRedirectPath(user);
  if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
    window.location.href = targetPath;
  }
};

/**
 * Verifies if the current user role is allowed on the page.
 * If not allowed, automatically redirects them to their designated role dashboard.
 * @returns true if allowed, false if redirected
 */
export const guardRoleAccess = (
  user: Pick<UserData, 'role' | 'onboardingCompleted'> | null | undefined,
  allowedRoles: UserRole[]
): boolean => {
  if (!user || !user.role) {
    handleRoleRedirect(null);
    return false;
  }

  const isAllowed = allowedRoles.includes(user.role as UserRole);
  if (!isAllowed) {
    handleRoleRedirect(user);
    return false;
  }

  return true;
};
