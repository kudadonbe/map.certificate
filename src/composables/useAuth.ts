import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'vue-router';
import type { UserRole } from '@/types/auth.types';

/**
 * Composable for easy access to authentication state and actions
 * Usage: const { user, isAuthenticated, isAdmin, logout } = useAuth()
 */
export function useAuth() {
  const authStore = useAuthStore();
  const router = useRouter();

  // Computed properties from store
  const user = computed(() => authStore.user);
  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const isAdmin = computed(() => authStore.isAdmin);
  const isParticipant = computed(() => authStore.isParticipant);
  const isPublic = computed(() => authStore.isPublic);
  const isLoading = computed(() => authStore.isLoading);
  const error = computed(() => authStore.error);
  const userEmail = computed(() => authStore.userEmail);
  const userDisplayName = computed(() => authStore.userDisplayName);
  const userRole = computed(() => authStore.userRole);
  const userRoles = computed(() => authStore.userRoles);

  /**
   * Check if user has a specific role
   */
  function hasRole(role: UserRole): boolean {
    return authStore.hasRole(role);
  }

  /**
   * Check if user has any of the specified roles
   */
  function hasAnyRole(roles: UserRole[]): boolean {
    return authStore.hasAnyRole(roles);
  }

  /**
   * Check if user has all of the specified roles
   */
  function hasAllRoles(roles: UserRole[]): boolean {
    return authStore.hasAllRoles(roles);
  }

  /**
   * Logout and redirect to login page
   */
  async function logout() {
    await authStore.logout();
    router.push('/login');
  }

  return {
    // State
    user,
    isAuthenticated,
    isAdmin,
    isParticipant,
    isPublic,
    isLoading,
    error,
    userEmail,
    userDisplayName,
    userRole,
    userRoles,

    // Role methods
    hasRole,
    hasAnyRole,
    hasAllRoles,

    // Actions
    logout,
  };
}
