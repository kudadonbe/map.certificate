import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AppUser, LoginResult, UserRole } from '@/types/auth.types';
import { AuthService } from '@/services/auth.service';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/firebase';
import router from '@/router';
import { hasRole, hasAnyRole, hasAllRoles } from '@/utils/role.helpers';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<AppUser | null>(null);
  const firebaseUser = ref<FirebaseUser | null>(null);
  const isLoading = ref(true);
  const error = ref<string | null>(null);

  // Getters (computed properties)
  const isAuthenticated = computed(() => !!user.value);

  // Backward compatible role checks
  const isDeveloper = computed(() => hasRole(user.value, 'developer'));
  const isSystemAdmin = computed(() => hasRole(user.value, 'system_admin') || hasRole(user.value, 'developer'));
  const isAdmin = computed(() => hasRole(user.value, 'admin') || hasRole(user.value, 'system_admin') || hasRole(user.value, 'developer'));
  const isOfficer = computed(() => hasRole(user.value, 'officer') || hasRole(user.value, 'admin') || hasRole(user.value, 'system_admin') || hasRole(user.value, 'developer'));
  const isParticipant = computed(() => hasRole(user.value, 'participant'));
  const isPublic = computed(() => hasRole(user.value, 'public'));
  const canManageUsers = computed(() => hasRole(user.value, 'developer') || hasRole(user.value, 'system_admin'));
  const isStaff = computed(() => isOfficer.value); // Alias for isOfficer

  const userEmail = computed(() => user.value?.email || '');
  const userDisplayName = computed(() => user.value?.displayName || 'User');
  const userRole = computed(() => user.value?.primaryRole);
  const userRoles = computed(() => user.value?.roles || []);

  // New role group methods
  function checkHasRole(role: UserRole): boolean {
    return hasRole(user.value, role);
  }

  function checkHasAnyRole(roles: UserRole[]): boolean {
    return hasAnyRole(user.value, roles);
  }

  function checkHasAllRoles(roles: UserRole[]): boolean {
    return hasAllRoles(user.value, roles);
  }

  // Actions

  /**
   * Initialize authentication state
   * Sets up Firebase auth state listener and loads user data
   */
  async function initializeAuth(): Promise<void> {
    isLoading.value = true;

    // First, check if we're returning from an OAuth redirect
    const redirectResult = await AuthService.handleRedirectResult();

    if (redirectResult) {
      // User just completed OAuth redirect
      if (redirectResult.success && redirectResult.user) {
        user.value = redirectResult.user;
        firebaseUser.value = auth.currentUser;
        isLoading.value = false;

        console.log('✅ Login successful!');
        console.log('👤 User:', redirectResult.user.email);
        console.log('🔑 Role:', redirectResult.user.primaryRole);

        // Redirect to home page after successful login
        router.push('/');
        return;
      } else {
        // Redirect failed (not whitelisted or not a participant)
        error.value = redirectResult.error || 'Login failed';
        isLoading.value = false;

        console.error('❌ Login failed:', redirectResult.error);

        // Redirect to login page with error
        router.push('/login');
        return;
      }
    }

    // No redirect result, set up normal auth state listener
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        firebaseUser.value = fbUser;

        if (fbUser) {
          // User is signed in - load their profile data from Firestore
          const appUser = await AuthService.loadUserData(fbUser.uid);

          if (appUser) {
            // Prefer the current provider profile image over a stale Firestore URL.
            appUser.photoURL = fbUser.photoURL || appUser.photoURL;
            user.value = appUser;
            console.log('✅ User session restored');
            console.log('👤 User:', appUser.email);
            console.log('🔑 Role:', appUser.primaryRole);
            // Update last login timestamp
            await AuthService.updateLastLogin(fbUser.uid);
          } else {
            // Firebase user exists but no Firestore profile
            // This shouldn't happen in normal flow, sign them out
            console.warn('Firebase user exists but no Firestore profile found');
            await AuthService.signOut();
            user.value = null;
            firebaseUser.value = null;
          }
        } else {
          // User is signed out
          user.value = null;
        }

        isLoading.value = false;
        resolve();
        unsubscribe();
      });
    });
  }

  /**
   * Login with Microsoft/Office 365 (for admin users)
   */
  async function loginWithMicrosoft(): Promise<LoginResult> {
    error.value = null;
    isLoading.value = true;

    try {
      const result = await AuthService.signInWithMicrosoft();

      if (result.success && result.user) {
        // Popup mode - user data returned immediately
        user.value = result.user;
        firebaseUser.value = auth.currentUser;
      } else if (result.success && !result.user) {
        // Redirect mode - redirect is in progress
        // Don't set loading to false, let redirect happen
        return result;
      } else {
        // Error occurred
        error.value = result.error || 'Login failed';
      }

      return result;
    } catch (e: any) {
      error.value = e.message;
      return { success: false, error: e.message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Login with Google (for participant users or whitelisted admins)
   */
  async function loginWithGoogle(): Promise<LoginResult> {
    error.value = null;
    isLoading.value = true;

    try {
      const result = await AuthService.signInWithGoogle();

      if (result.success && result.user) {
        // Popup mode - user data returned immediately
        user.value = result.user;
        firebaseUser.value = auth.currentUser;
      } else if (result.success && !result.user) {
        // Redirect mode - redirect is in progress
        // Don't set loading to false, let redirect happen
        return result;
      } else {
        // Error occurred
        error.value = result.error || 'Login failed';
      }

      return result;
    } catch (e: any) {
      error.value = e.message;
      return { success: false, error: e.message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Register admin with email and password
   * Requires email to be in admin whitelist
   */
  async function registerAdmin(email: string, password: string): Promise<LoginResult> {
    error.value = null;
    isLoading.value = true;

    try {
      const result = await AuthService.registerWithEmailPassword(email, password);

      if (result.success && result.user) {
        // Registration successful but needs email verification
        // Don't set user in state yet - they need to verify email first
        // But show success message
        if (result.error) {
          // This contains the "check your email" message
          error.value = result.error;
        }
      } else {
        error.value = result.error || 'Registration failed';
      }

      return result;
    } catch (e: any) {
      error.value = e.message;
      return { success: false, error: e.message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Login admin with email and password
   * Requires email verification and whitelist check
   */
  async function loginWithEmailPassword(email: string, password: string): Promise<LoginResult> {
    error.value = null;
    isLoading.value = true;

    try {
      const result = await AuthService.signInWithEmailPassword(email, password);

      if (result.success && result.user) {
        user.value = result.user;
        firebaseUser.value = auth.currentUser;
      } else {
        error.value = result.error || 'Login failed';
      }

      return result;
    } catch (e: any) {
      error.value = e.message;
      return { success: false, error: e.message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Send passwordless sign-in link to email
   */
  async function sendSignInLink(email: string): Promise<{ success: boolean; error?: string }> {
    error.value = null;
    isLoading.value = true;

    try {
      const result = await AuthService.sendSignInLink(email);

      if (!result.success) {
        error.value = result.error || 'Failed to send sign-in link';
      }

      return result;
    } catch (e: any) {
      error.value = e.message;
      return { success: false, error: e.message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Check if current URL is a sign-in link
   */
  function isSignInWithEmailLink(): boolean {
    return AuthService.isSignInWithEmailLink();
  }

  /**
   * Complete passwordless sign-in from email link
   */
  async function completeSignInWithEmailLink(email?: string): Promise<LoginResult> {
    error.value = null;
    isLoading.value = true;

    try {
      const result = await AuthService.completeSignInWithEmailLink(email);

      if (result.success && result.user) {
        user.value = result.user;
        firebaseUser.value = auth.currentUser;
      } else {
        error.value = result.error || 'Sign-in failed';
      }

      return result;
    } catch (e: any) {
      error.value = e.message;
      return { success: false, error: e.message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Logout current user
   */
  async function logout(): Promise<void> {
    try {
      console.log('🚪 Logging out...');
      await AuthService.signOut();
      user.value = null;
      firebaseUser.value = null;
      error.value = null;
      console.log('✅ Logout successful');
    } catch (e: any) {
      error.value = e.message;
      console.error('❌ Logout error:', e);
      throw e;
    }
  }

  /**
   * Refresh current user data from Firestore
   */
  async function refreshUser(): Promise<void> {
    if (!firebaseUser.value) return;

    try {
      const appUser = await AuthService.loadUserData(firebaseUser.value.uid);
      if (appUser) {
        user.value = appUser;
        console.log('✅ User data refreshed');
      }
    } catch (e: any) {
      console.error('❌ Error refreshing user:', e);
    }
  }

  /**
   * Clear any error messages
   */
  function clearError(): void {
    error.value = null;
  }

  return {
    // State
    user,
    firebaseUser,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    isDeveloper,
    isSystemAdmin,
    isAdmin,
    isOfficer,
    isStaff,
    isParticipant,
    isPublic,
    canManageUsers,
    userEmail,
    userDisplayName,
    userRole,
    userRoles,

    // Role group methods
    hasRole: checkHasRole,
    hasAnyRole: checkHasAnyRole,
    hasAllRoles: checkHasAllRoles,

    // Actions
    initializeAuth,
    loginWithMicrosoft,
    loginWithGoogle,
    loginWithEmailPassword,
    registerAdmin,
    sendSignInLink,
    isSignInWithEmailLink,
    completeSignInWithEmailLink,
    logout,
    refreshUser,
    clearError,
  };
});
