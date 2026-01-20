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
  const isAdmin = computed(() => hasRole(user.value, 'admin'));
  const isParticipant = computed(() => hasRole(user.value, 'participant'));
  const isPublic = computed(() => hasRole(user.value, 'public'));

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
        console.log('🔑 Role:', redirectResult.user.role);

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
            user.value = appUser;
            console.log('✅ User session restored');
            console.log('👤 User:', appUser.email);
            console.log('🔑 Role:', appUser.role);
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
   * Login with Google (for participant users)
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
    isAdmin,
    isParticipant,
    isPublic,
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
    logout,
    clearError,
  };
});
