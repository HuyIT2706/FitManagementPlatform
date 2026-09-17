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

export const handleRoleRedirect = (
  user?: Pick<UserData, 'role' | 'onboardingCompleted'> | null,
  router?: { replace: (url: string) => void }
): void => {
  const targetPath = getRoleRedirectPath(user);
  if (router) {
    router.replace(targetPath);
    return;
  }
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
  allowedRoles: UserRole[],
  router?: { replace: (url: string) => void }
): boolean => {
  if (!user || !user.role) {
    handleRoleRedirect(null, router);
    return false;
  }

  const isAllowed = allowedRoles.includes(user.role as UserRole);
  if (!isAllowed) {
    handleRoleRedirect(user, router);
    return false;
  }

  return true;
};
