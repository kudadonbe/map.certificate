import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import type { UserRole } from '@/types/auth.types';

/**
 * Require authentication - user must be logged in
 */
export async function requireAuth(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore();

  // Wait for auth initialization if still loading
  if (authStore.isLoading) {
    await authStore.initializeAuth();
  }

  if (!authStore.isAuthenticated) {
    return next({
      name: 'Login',
      query: { redirect: to.fullPath, error: 'unauthorized' }
    });
  }

  next();
}

/**
 * Require admin role - user must be authenticated and have admin, system_admin, or developer role
 */
export async function requireAdmin(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore();

  // Wait for auth initialization if still loading
  if (authStore.isLoading) {
    await authStore.initializeAuth();
  }

  if (!authStore.isAuthenticated) {
    return next({
      name: 'Login',
      query: { redirect: to.fullPath, error: 'unauthorized' }
    });
  }

  // Check for admin-level roles
  if (!authStore.hasAnyRole(['admin', 'system_admin', 'developer'])) {
    // User is authenticated but doesn't have admin role
    return next({
      name: 'Login',
      query: { error: 'forbidden' }
    });
  }

  next();
}

/**
 * Require officer role - user must be authenticated and have officer or higher role
 * This is for Family Court staff access (anyone with @familycourt.gov.mv email)
 */
export async function requireOfficer(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore();

  // Wait for auth initialization if still loading
  if (authStore.isLoading) {
    await authStore.initializeAuth();
  }

  if (!authStore.isAuthenticated) {
    return next({
      name: 'Login',
      query: { redirect: to.fullPath, error: 'unauthorized' }
    });
  }

  // Check for officer-level roles (officer, admin, system_admin, developer)
  if (!authStore.hasAnyRole(['officer', 'admin', 'system_admin', 'developer'])) {
    // User is authenticated but doesn't have officer role
    return next({
      name: 'Login',
      query: { error: 'forbidden' }
    });
  }

  next();
}

/**
 * Require developer role - user must be authenticated and have developer role
 */
export async function requireDeveloper(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore();

  // Wait for auth initialization if still loading
  if (authStore.isLoading) {
    await authStore.initializeAuth();
  }

  if (!authStore.isAuthenticated) {
    return next({
      name: 'Login',
      query: { redirect: to.fullPath, error: 'unauthorized' }
    });
  }

  if (!authStore.hasRole('developer')) {
    // User is authenticated but doesn't have developer role
    return next({
      name: 'Login',
      query: { error: 'forbidden' }
    });
  }

  next();
}

/**
 * Require participant role - user must be authenticated and have participant role
 */
export async function requireParticipant(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore();

  // Wait for auth initialization if still loading
  if (authStore.isLoading) {
    await authStore.initializeAuth();
  }

  if (!authStore.isAuthenticated) {
    return next({
      name: 'Login',
      query: { redirect: to.fullPath, error: 'unauthorized' }
    });
  }

  if (!authStore.hasRole('participant')) {
    // User is authenticated but doesn't have participant role
    return next({
      name: 'Login',
      query: { error: 'forbidden' }
    });
  }

  next();
}

/**
 * Require specific role - user must have the specified role
 */
export function requireRole(role: UserRole) {
  return async (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const authStore = useAuthStore();

    // Wait for auth initialization if still loading
    if (authStore.isLoading) {
      await authStore.initializeAuth();
    }

    if (!authStore.isAuthenticated) {
      return next({
        name: 'Login',
        query: { redirect: to.fullPath, error: 'unauthorized' }
      });
    }

    if (!authStore.hasRole(role)) {
      return next({
        name: 'Login',
        query: { error: 'forbidden' }
      });
    }

    next();
  };
}

/**
 * Require any of the specified roles
 */
export function requireAnyRole(roles: UserRole[]) {
  return async (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const authStore = useAuthStore();

    // Wait for auth initialization if still loading
    if (authStore.isLoading) {
      await authStore.initializeAuth();
    }

    if (!authStore.isAuthenticated) {
      return next({
        name: 'Login',
        query: { redirect: to.fullPath, error: 'unauthorized' }
      });
    }

    if (!authStore.hasAnyRole(roles)) {
      return next({
        name: 'Login',
        query: { error: 'forbidden' }
      });
    }

    next();
  };
}

/**
 * Guest only - redirect authenticated users to home page
 */
export async function guestOnly(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore();

  // Wait for auth initialization if still loading
  if (authStore.isLoading) {
    await authStore.initializeAuth();
  }

  if (authStore.isAuthenticated) {
    // Redirect to home page where they can choose to go to their portal
    return next({ name: 'Home' });
  }

  next();
}
