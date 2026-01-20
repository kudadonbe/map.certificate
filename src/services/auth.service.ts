import {
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  signOut as firebaseSignOut,
  type UserCredential
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { auth, db, googleProvider, microsoftProvider } from '@/firebase';
import type {
  AppUser,
  LoginResult,
  AuthErrorCode,
  AdminWhitelist
} from '@/types/auth.types';
import { AuthErrorCode as ErrorCode } from '@/types/auth.types';

export class AuthService {
  // Use popup in development, redirect in production
  private static USE_POPUP = import.meta.env.DEV;

  /**
   * Handle redirect result after OAuth redirect completes
   * Call this on app initialization
   */
  static async handleRedirectResult(): Promise<LoginResult | null> {
    // Skip if using popup mode
    if (this.USE_POPUP) {
      return null;
    }
    try {
      console.log('🔍 Checking for redirect result...');
      const result = await getRedirectResult(auth);

      if (!result) {
        // No redirect result (user didn't just complete OAuth)
        console.log('ℹ️ No redirect result found');
        return null;
      }

      console.log('✅ Redirect result received!');
      console.log('Provider:', result.providerId);

      const email = result.user.email;
      console.log('Email:', email);
      if (!email) {
        return {
          success: false,
          error: 'No email found in account',
          errorCode: ErrorCode.UNAUTHORIZED_EMAIL
        };
      }

      // Determine if this was Microsoft or Google login
      const providerId = result.providerId;

      if (providerId?.includes('microsoft')) {
        console.log('🔵 Processing Microsoft login...');
        // Microsoft login - check whitelist
        console.log('🔍 Checking admin whitelist...');
        const isWhitelisted = await this.checkAdminWhitelist(email);
        console.log('Whitelist check result:', isWhitelisted);

        if (!isWhitelisted) {
          console.error('❌ Email not in whitelist:', email);
          await firebaseSignOut(auth);
          return {
            success: false,
            error: `Email ${email} is not authorized for admin access. Please contact your administrator.`,
            errorCode: ErrorCode.NOT_IN_WHITELIST
          };
        }

        console.log('✅ Email is whitelisted, creating user...');
        const user = await this.createOrUpdateUser(result, 'admin', 'microsoft');
        console.log('✅ Admin user created/updated');
        return { success: true, user };

      } else if (providerId?.includes('google')) {
        console.log('🔵 Processing Google login...');
        // Google login - check if participant record exists
        console.log('🔍 Checking if participant record exists...');
        const participant = await this.findParticipantByEmail(email);

        if (participant) {
          console.log('✅ Existing participant found, linking to record');
          // Participant gets both 'participant' and 'public' roles
          const user = await this.createOrUpdateUser(result, ['participant', 'public'], 'google', participant.id);
          console.log('✅ Participant user created/updated with existing record');
          return { success: true, user };
        } else {
          console.log('ℹ️ No existing participant record, creating public user');
          // Public user gets only 'public' role
          const user = await this.createOrUpdateUser(result, ['public'], 'google');
          console.log('✅ New public user created');
          return { success: true, user };
        }
      }

      return { success: false, error: 'Unknown provider', errorCode: ErrorCode.UNKNOWN_ERROR };

    } catch (error: any) {
      return this.handleAuthError(error);
    }
  }

  /**
   * Sign in with Microsoft/Office 365
   * Validates user email against admin whitelist before allowing access
   */
  static async signInWithMicrosoft(): Promise<LoginResult> {
    try {
      console.log('🔵 Starting Microsoft login...');

      if (this.USE_POPUP) {
        // Use popup in development
        console.log('Using popup mode (development)');
        const result = await signInWithPopup(auth, microsoftProvider);
        return await this.processMicrosoftLogin(result);
      } else {
        // Use redirect in production
        console.log('Using redirect mode (production)');
        await signInWithRedirect(auth, microsoftProvider);
        return { success: true }; // Redirect in progress
      }
    } catch (error: any) {
      console.error('❌ Microsoft login error:', error);
      return this.handleAuthError(error);
    }
  }

  /**
   * Process Microsoft login result
   */
  private static async processMicrosoftLogin(result: UserCredential): Promise<LoginResult> {
    const email = result.user.email;
    console.log('Email:', email);

    if (!email) {
      return {
        success: false,
        error: 'No email found in Microsoft account',
        errorCode: ErrorCode.UNAUTHORIZED_EMAIL
      };
    }

    console.log('🔍 Checking admin whitelist...');
    const isWhitelisted = await this.checkAdminWhitelist(email);
    console.log('Whitelist check result:', isWhitelisted);

    if (!isWhitelisted) {
      console.error('❌ Email not in whitelist:', email);
      await firebaseSignOut(auth);
      return {
        success: false,
        error: `Email ${email} is not authorized for admin access. Please contact your administrator.`,
        errorCode: ErrorCode.NOT_IN_WHITELIST
      };
    }

    console.log('✅ Email is whitelisted, creating user...');
    // Admin gets both 'admin' and 'public' roles
    const user = await this.createOrUpdateUser(result, ['admin', 'public'], 'microsoft');
    console.log('✅ Admin user created/updated');
    return { success: true, user };
  }

  /**
   * Sign in with Google OAuth
   * Validates user email exists in participants collection before allowing access
   */
  static async signInWithGoogle(): Promise<LoginResult> {
    try {
      console.log('🔵 Starting Google login...');

      if (this.USE_POPUP) {
        // Use popup in development
        console.log('Using popup mode (development)');
        const result = await signInWithPopup(auth, googleProvider);
        return await this.processGoogleLogin(result);
      } else {
        // Use redirect in production
        console.log('Using redirect mode (production)');
        await signInWithRedirect(auth, googleProvider);
        return { success: true }; // Redirect in progress
      }
    } catch (error: any) {
      console.error('❌ Google login error:', error);
      return this.handleAuthError(error);
    }
  }

  /**
   * Process Google login result
   * Anyone with a Google account can login (as public or participant)
   */
  private static async processGoogleLogin(result: UserCredential): Promise<LoginResult> {
    const email = result.user.email;
    console.log('Email:', email);

    if (!email) {
      return {
        success: false,
        error: 'No email found in Google account',
        errorCode: ErrorCode.UNAUTHORIZED_EMAIL
      };
    }

    console.log('🔍 Checking if participant record exists...');
    const participant = await this.findParticipantByEmail(email);

    if (participant) {
      console.log('✅ Existing participant found, linking to record');
      // Link to existing participant record - gets both 'participant' and 'public' roles
      const user = await this.createOrUpdateUser(result, ['participant', 'public'], 'google', participant.id);
      console.log('✅ Participant user created/updated with existing record');
      return { success: true, user };
    } else {
      console.log('ℹ️ No existing participant record, creating public user');
      // Create new public user (anyone can login with Google) - gets 'public' role
      const user = await this.createOrUpdateUser(result, ['public'], 'google');
      console.log('✅ New public user created');
      return { success: true, user };
    }
  }

  /**
   * Check if email is in admin whitelist
   */
  static async checkAdminWhitelist(email: string): Promise<boolean> {
    try {
      const whitelistRef = doc(db, 'settings', 'admin_whitelist');
      const whitelistSnap = await getDoc(whitelistRef);

      if (!whitelistSnap.exists()) {
        console.error('Admin whitelist not found in Firestore');
        return false;
      }

      const whitelist = whitelistSnap.data() as AdminWhitelist;
      const normalizedEmail = email.toLowerCase().trim();

      return whitelist.emails.some(
        whitelistedEmail => whitelistedEmail.toLowerCase().trim() === normalizedEmail
      );
    } catch (error) {
      console.error('Error checking admin whitelist:', error);
      return false;
    }
  }

  /**
   * Find participant by email in participants collection
   */
  static async findParticipantByEmail(email: string) {
    try {
      const participantsRef = collection(db, 'participants');
      const normalizedEmail = email.toLowerCase().trim();
      const q = query(participantsRef, where('email', '==', normalizedEmail));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      // Return first matching participant
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      };
    } catch (error) {
      console.error('Error finding participant:', error);
      return null;
    }
  }

  /**
   * Create or update user document in Firestore
   * Auto-creates on first login, updates on subsequent logins
   */
  static async createOrUpdateUser(
    credential: UserCredential,
    roles: ('admin' | 'participant' | 'public')[],
    provider: 'microsoft' | 'google',
    participantId?: string
  ): Promise<AppUser> {
    const { user: firebaseUser } = credential;
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    const now = Timestamp.now();

    // Determine primary role (admin > participant > public)
    const primaryRole = roles.includes('admin')
      ? 'admin'
      : roles.includes('participant')
      ? 'participant'
      : 'public';

    const userData: any = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      roles,
      primaryRole,
      provider,
      updatedAt: now,
      lastLoginAt: now,
      isActive: true,
    };

    if (roles.includes('participant') && participantId) {
      userData.participantId = participantId;
    }

    if (!userSnap.exists()) {
      // New user - create document
      userData.createdAt = now;
      await setDoc(userRef, userData);
      console.log('✅ New user created:', firebaseUser.email);
    } else {
      // Existing user - update document
      await updateDoc(userRef, userData);
      console.log('✅ User updated:', firebaseUser.email);
    }

    // Convert to AppUser format with Date objects
    return {
      ...userData,
      createdAt: userData.createdAt?.toDate() || now.toDate(),
      updatedAt: now.toDate(),
      lastLoginAt: now.toDate(),
    } as AppUser;
  }

  /**
   * Load user data from Firestore by UID
   */
  static async loadUserData(uid: string): Promise<AppUser | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.warn('User document not found for UID:', uid);
        return null;
      }

      const data = userSnap.data();

      // Handle backward compatibility: convert old single role to roles array
      let roles = data.roles;
      let primaryRole = data.primaryRole;

      if (!roles && data.role) {
        // Old data format - migrate to new format
        roles = [data.role];
        primaryRole = data.role;
        console.log('📦 Migrating user from single role to roles array');
      }

      return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        roles: roles || ['public'],
        primaryRole: primaryRole || 'public',
        provider: data.provider,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        lastLoginAt: data.lastLoginAt?.toDate(),
        isActive: data.isActive,
        participantId: data.participantId,
        adminApprovedBy: data.adminApprovedBy,
        adminApprovedAt: data.adminApprovedAt?.toDate(),
      } as AppUser;
    } catch (error) {
      console.error('Error loading user data:', error);
      return null;
    }
  }

  /**
   * Update user's last login timestamp
   */
  static async updateLastLogin(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        lastLoginAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    await firebaseSignOut(auth);
    console.log('✅ User signed out');
  }

  /**
   * Handle authentication errors and map to user-friendly messages
   */
  static handleAuthError(error: any): LoginResult {
    console.error('Auth error:', error);

    // Map Firebase error codes to our error codes
    if (error.code === 'auth/popup-closed-by-user') {
      return {
        success: false,
        error: 'Login was cancelled. Please try again.',
        errorCode: ErrorCode.POPUP_CLOSED
      };
    }

    if (error.code === 'auth/network-request-failed') {
      return {
        success: false,
        error: 'Network error. Please check your internet connection and try again.',
        errorCode: ErrorCode.NETWORK_ERROR
      };
    }

    if (error.code === 'auth/popup-blocked') {
      return {
        success: false,
        error: 'Popup was blocked by your browser. Please allow popups for this site.',
        errorCode: ErrorCode.UNKNOWN_ERROR
      };
    }

    if (error.code === 'auth/cancelled-popup-request') {
      return {
        success: false,
        error: 'Another login attempt is in progress.',
        errorCode: ErrorCode.UNKNOWN_ERROR
      };
    }

    // Generic error
    return {
      success: false,
      error: error.message || 'An unexpected error occurred during login. Please try again.',
      errorCode: ErrorCode.UNKNOWN_ERROR
    };
  }
}
