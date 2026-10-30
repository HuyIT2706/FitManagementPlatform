import type { UserData } from '../interface';

export type UserRole = 'ADMIN' | 'PT' | 'USER';

/**
 * Returns the destination route for a given user based on their role and onboarding status.
 */
export const getRoleRedirectPath = (
  user?: Pick<UserData, 'role' | 'onboardingCompleted'> | null
): string => {
  if (!user || !user.role) {
    return '/login';
  }

  if (user.role === 'ADMIN') {
    return '/admin';
  }

  if (user.role === 'PT') {
    return '/pt';
  }

  if (user.role === 'USER') {
    if (user.onboardingCompleted === false) {
      return '/onboarding';
    }
    return '/home';
  }

  return '/home';
};

export const handleRoleRedirect = (
  user?: Pick<UserData, 'role' | 'onboardingCompleted'> | null,
  router?: { replace: (url: string) => void },
  customRedirect?: string | null
): void => {
  if (!user || !user.role) {
    if (router) {
      router.replace('/login');
    } else if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    return;
  }

  // Clean customRedirect: Reject recursive redirects back to login/auth/root
  let cleanRedirect = customRedirect?.trim();
  if (
    cleanRedirect === '/login' ||
    cleanRedirect === '/register' ||
    cleanRedirect?.startsWith('/auth') ||
    cleanRedirect === '/'
  ) {
    cleanRedirect = undefined;
  }

  let targetPath = cleanRedirect || getRoleRedirectPath(user);

  // Role Boundary Enforcement: Prevent users from leaking into inappropriate role portals
  if (user.role === 'PT') {
    if (!cleanRedirect || !cleanRedirect.startsWith('/pt')) {
      targetPath = '/pt';
    }
  } else if (user.role === 'ADMIN') {
    if (!cleanRedirect || !cleanRedirect.startsWith('/admin')) {
      targetPath = '/admin';
    }
  } else if (user.role === 'USER') {
    // Member users can never access /pt or /admin portals
    if (!cleanRedirect || cleanRedirect.startsWith('/pt') || cleanRedirect.startsWith('/admin')) {
      targetPath = user.onboardingCompleted === false ? '/onboarding' : '/home';
    }
  }

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
