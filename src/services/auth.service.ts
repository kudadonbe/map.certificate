import {
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  type UserCredential,
  type User as FirebaseUser
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
  AuthProvider,
  UserRole
} from '@/types/auth.types';
import { AuthErrorCode as ErrorCode, isFamilyCourtEmail, FAMILY_COURT_DOMAIN } from '@/types/auth.types';
import { determinePrimaryRole } from '@/utils/role.helpers';

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
      console.log('Checking for redirect result...');
      const result = await getRedirectResult(auth);

      if (!result) {
        // No redirect result (user didn't just complete OAuth)
        console.log('No redirect result found');
        return null;
      }

      console.log('Redirect result received!');
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
        console.log('Processing Microsoft login...');
        return await this.processMicrosoftLoginResult(result, email);
      } else if (providerId?.includes('google')) {
        console.log('Processing Google login...');
        return await this.processGoogleLoginResult(result, email);
      }

      return { success: false, error: 'Unknown provider', errorCode: ErrorCode.UNKNOWN_ERROR };

    } catch (error: any) {
      return this.handleAuthError(error);
    }
  }

  /**
   * Process Microsoft login result - domain-based access
   */
  private static async processMicrosoftLoginResult(result: UserCredential, email: string): Promise<LoginResult> {
    // Check if email is from Family Court domain
    if (!isFamilyCourtEmail(email)) {
      console.error('Email not from Family Court domain:', email);
      await firebaseSignOut(auth);
      return {
        success: false,
        error: `Only @${FAMILY_COURT_DOMAIN} email addresses can login with Office 365.`,
        errorCode: ErrorCode.INVALID_DOMAIN
      };
    }

    console.log('Email is from Family Court domain, creating officer user...');

    // Check if user already exists and has higher roles
    const existingUser = await this.loadUserData(result.user.uid);
    let roles: UserRole[] = ['officer', 'public'];

    if (existingUser) {
      // Preserve existing higher roles (developer, system_admin, admin)
      if (existingUser.roles.includes('developer')) roles = ['developer', ...roles.filter(r => r !== 'developer')];
      else if (existingUser.roles.includes('system_admin')) roles = ['system_admin', ...roles.filter(r => r !== 'system_admin')];
      else if (existingUser.roles.includes('admin')) roles = ['admin', ...roles.filter(r => r !== 'admin')];

      // Check if also a participant
      const participant = await this.findParticipantByEmail(email);
      if (participant && !roles.includes('participant')) {
        roles.push('participant');
      }
    }

    const user = await this.createOrUpdateUser(result, roles, 'microsoft');
    console.log('Officer user created/updated');
    return { success: true, user };
  }

  /**
   * Process Google login result
   */
  private static async processGoogleLoginResult(result: UserCredential, email: string): Promise<LoginResult> {
    // Check if participant record exists
    console.log('Checking if participant record exists...');
    const participant = await this.findParticipantByEmail(email);

    if (participant) {
      console.log('Existing participant found, linking to record');
      // Participant gets both 'participant' and 'public' roles
      const user = await this.createOrUpdateUser(result, ['participant', 'public'], 'google', participant.id);
      console.log('Participant user created/updated with existing record');
      return { success: true, user };
    } else {
      console.log('No participant record, creating public user');
      // Public user gets only 'public' role
      const user = await this.createOrUpdateUser(result, ['public'], 'google');
      console.log('New public user created');
      return { success: true, user };
    }
  }

  /**
   * Sign in with Microsoft/Office 365
   * Only allows @familycourt.gov.mv email addresses
   */
  static async signInWithMicrosoft(): Promise<LoginResult> {
    try {
      console.log('Starting Microsoft login...');

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
      console.error('Microsoft login error:', error);
      return this.handleAuthError(error);
    }
  }

  /**
   * Process Microsoft login result - domain-based access
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

    // Check if email is from Family Court domain
    if (!isFamilyCourtEmail(email)) {
      console.error('Email not from Family Court domain:', email);
      await firebaseSignOut(auth);
      return {
        success: false,
        error: `Only @${FAMILY_COURT_DOMAIN} email addresses can login with Office 365.`,
        errorCode: ErrorCode.INVALID_DOMAIN
      };
    }

    console.log('Email is from Family Court domain, creating officer user...');

    // Check if user already exists and has higher roles
    const existingUser = await this.loadUserData(result.user.uid);
    let roles: UserRole[] = ['officer', 'public'];

    if (existingUser) {
      // Preserve existing higher roles
      const existingRoles = existingUser.roles;
      if (existingRoles.includes('developer')) {
        roles = [...new Set([...existingRoles, 'officer', 'public'] as UserRole[])];
      } else if (existingRoles.includes('system_admin')) {
        roles = [...new Set([...existingRoles, 'officer', 'public'] as UserRole[])];
      } else if (existingRoles.includes('admin')) {
        roles = [...new Set([...existingRoles, 'officer', 'public'] as UserRole[])];
      }
    }

    // Check if also a participant
    const participant = await this.findParticipantByEmail(email);
    if (participant && !roles.includes('participant')) {
      roles.push('participant');
    }

    const user = await this.createOrUpdateUser(result, roles, 'microsoft', participant?.id);
    console.log('Officer user created/updated');
    return { success: true, user };
  }

  /**
   * Sign in with Google OAuth
   * Anyone with a Google account can login
   */
  static async signInWithGoogle(): Promise<LoginResult> {
    try {
      console.log('Starting Google login...');

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
      console.error('Google login error:', error);
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

    // Check for participant record
    console.log('Checking if participant record exists...');
    const participant = await this.findParticipantByEmail(email);

    if (participant) {
      console.log('Existing participant found, linking to record');
      // Link to existing participant record - gets both 'participant' and 'public' roles
      const user = await this.createOrUpdateUser(result, ['participant', 'public'], 'google', participant.id);
      console.log('Participant user created/updated with existing record');
      return { success: true, user };
    } else {
      console.log('No participant record, creating public user');
      // Create new public user - gets 'public' role
      const user = await this.createOrUpdateUser(result, ['public'], 'google');
      console.log('New public user created');
      return { success: true, user };
    }
  }

  /**
   * Check if email is from Family Court domain
   */
  static isFamilyCourtDomain(email: string): boolean {
    return isFamilyCourtEmail(email);
  }

  /**
   * Get all users from Firestore
   */
  static async getAllUsers(): Promise<AppUser[]> {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: data.uid,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          roles: data.roles || ['public'],
          primaryRole: data.primaryRole || 'public',
          groups: data.groups || [],
          provider: data.provider,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          lastLoginAt: data.lastLoginAt?.toDate(),
          isActive: data.isActive,
          participantId: data.participantId,
        } as AppUser;
      });
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  /**
   * Update user roles
   */
  static async updateUserRoles(
    uid: string,
    roles: UserRole[],
    updatedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return { success: false, error: 'User not found' };
      }

      // Determine primary role
      const primaryRole = determinePrimaryRole(roles);

      await updateDoc(userRef, {
        roles,
        primaryRole,
        updatedAt: Timestamp.now(),
        rolesUpdatedBy: updatedBy,
        rolesUpdatedAt: Timestamp.now(),
      });

      console.log('User roles updated:', uid, roles);
      return { success: true };
    } catch (error: any) {
      console.error('Error updating user roles:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user profile (display name, etc.)
   */
  static async updateUserProfile(
    uid: string,
    updates: { displayName?: string }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return { success: false, error: 'User not found' };
      }

      const updateData: any = {
        updatedAt: Timestamp.now(),
      };

      if (updates.displayName !== undefined) {
        updateData.displayName = updates.displayName;
      }

      await updateDoc(userRef, updateData);

      console.log('User profile updated:', uid);
      return { success: true };
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message };
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
    credentialOrUser: UserCredential | FirebaseUser,
    roles: UserRole[],
    provider: AuthProvider,
    participantId?: string
  ): Promise<AppUser> {
    const firebaseUser = 'user' in credentialOrUser ? credentialOrUser.user : credentialOrUser;
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    const now = Timestamp.now();

    // Determine primary role using the helper
    const primaryRole = determinePrimaryRole(roles);

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

    if (participantId) {
      userData.participantId = participantId;
    }

    if (!userSnap.exists()) {
      // New user - create document
      userData.createdAt = now;
      userData.groups = []; // Initialize empty groups array
      await setDoc(userRef, userData);
      console.log('New user created:', firebaseUser.email);
    } else {
      // Existing user - preserve groups and other data
      const existingData = userSnap.data();
      userData.groups = existingData.groups || [];
      await updateDoc(userRef, userData);
      console.log('User updated:', firebaseUser.email);
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
        console.log('Migrating user from single role to roles array');
      }

      return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        roles: roles || ['public'],
        primaryRole: primaryRole || 'public',
        groups: data.groups || [],
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
    console.log('User signed out');
  }

  /**
   * Register officer with email and password
   * Requires email to be from Family Court domain
   */
  static async registerWithEmailPassword(email: string, password: string): Promise<LoginResult> {
    try {
      console.log('Starting officer registration with email...');
      const normalizedEmail = email.toLowerCase().trim();

      // Check domain BEFORE creating account
      if (!isFamilyCourtEmail(normalizedEmail)) {
        console.error('Email not from Family Court domain:', normalizedEmail);
        return {
          success: false,
          error: `Only @${FAMILY_COURT_DOMAIN} email addresses can register. Please use your Family Court email.`,
          errorCode: ErrorCode.INVALID_DOMAIN
        };
      }

      console.log('Email is from Family Court domain, creating account...');

      // Create Firebase Auth user
      const result = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      console.log('Firebase Auth user created');

      // Send email verification
      await sendEmailVerification(result.user);
      console.log('Verification email sent');

      // Create user document with officer role
      const user = await this.createOrUpdateUser(result.user, ['officer', 'public'], 'email-password');
      console.log('Officer user document created');

      return {
        success: true,
        user,
        error: 'Please check your email to verify your account before signing in.'
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return this.handleAuthError(error);
    }
  }

  /**
   * Sign in officer with email and password
   * Requires email verification and Family Court domain
   */
  static async signInWithEmailPassword(email: string, password: string): Promise<LoginResult> {
    try {
      console.log('Starting email/password login...');
      const normalizedEmail = email.toLowerCase().trim();

      // Sign in with Firebase Auth
      const result = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      console.log('Firebase Auth sign in successful');

      // Check if email is verified
      if (!result.user.emailVerified) {
        console.error('Email not verified');
        // Send another verification email
        await sendEmailVerification(result.user);
        await firebaseSignOut(auth);
        return {
          success: false,
          error: 'Please verify your email before signing in. A new verification email has been sent.',
          errorCode: ErrorCode.EMAIL_NOT_VERIFIED
        };
      }

      // Check domain
      if (!isFamilyCourtEmail(normalizedEmail)) {
        console.error('Email not from Family Court domain:', normalizedEmail);
        await firebaseSignOut(auth);
        return {
          success: false,
          error: `Only @${FAMILY_COURT_DOMAIN} email addresses can login.`,
          errorCode: ErrorCode.INVALID_DOMAIN
        };
      }

      console.log('Email verified and from Family Court domain');

      // Load existing user data to preserve roles
      const existingUser = await this.loadUserData(result.user.uid);
      let roles: UserRole[] = ['officer', 'public'];

      if (existingUser) {
        // Preserve existing higher roles
        roles = existingUser.roles;
        if (!roles.includes('officer')) {
          roles.push('officer');
        }
        if (!roles.includes('public')) {
          roles.push('public');
        }
      }

      // Update user document
      const user = await this.createOrUpdateUser(result.user, roles, 'email-password');
      console.log('Officer user updated');

      return { success: true, user };
    } catch (error: any) {
      console.error('Email/password login error:', error);
      return this.handleAuthError(error);
    }
  }

  /**
   * Resend email verification
   */
  static async resendVerificationEmail(): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: 'No user is currently signed in.' };
      }

      await sendEmailVerification(currentUser);
      return { success: true };
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send passwordless sign-in link to email
   * Requires email to be from Family Court domain
   */
  static async sendSignInLink(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Sending sign-in link...');
      const normalizedEmail = email.toLowerCase().trim();

      // Check domain BEFORE sending link
      if (!isFamilyCourtEmail(normalizedEmail)) {
        console.error('Email not from Family Court domain:', normalizedEmail);
        return {
          success: false,
          error: `Only @${FAMILY_COURT_DOMAIN} email addresses can receive sign-in links.`
        };
      }

      // Configure the sign-in link
      const actionCodeSettings = {
        url: window.location.origin + '/login?emailLink=true',
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, normalizedEmail, actionCodeSettings);

      // Save email to localStorage for completing sign-in
      window.localStorage.setItem('emailForSignIn', normalizedEmail);

      console.log('Sign-in link sent to:', normalizedEmail);
      return { success: true };
    } catch (error: any) {
      console.error('Error sending sign-in link:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if current URL is a sign-in link
   */
  static isSignInWithEmailLink(): boolean {
    return isSignInWithEmailLink(auth, window.location.href);
  }

  /**
   * Complete passwordless sign-in from email link
   */
  static async completeSignInWithEmailLink(email?: string): Promise<LoginResult> {
    try {
      console.log('Completing email link sign-in...');

      // Get email from localStorage or parameter
      let signInEmail = email || window.localStorage.getItem('emailForSignIn');

      if (!signInEmail) {
        return {
          success: false,
          error: 'Please enter your email address to complete sign-in.',
          errorCode: ErrorCode.UNAUTHORIZED_EMAIL
        };
      }

      signInEmail = signInEmail.toLowerCase().trim();

      // Complete sign-in
      const result = await signInWithEmailLink(auth, signInEmail, window.location.href);
      console.log('Email link sign-in successful');

      // Clear saved email
      window.localStorage.removeItem('emailForSignIn');

      // Check domain (for security)
      if (!isFamilyCourtEmail(signInEmail)) {
        console.error('Email not from Family Court domain:', signInEmail);
        await firebaseSignOut(auth);
        return {
          success: false,
          error: `Only @${FAMILY_COURT_DOMAIN} email addresses can login.`,
          errorCode: ErrorCode.INVALID_DOMAIN
        };
      }

      // Load existing user data to preserve roles
      const existingUser = await this.loadUserData(result.user.uid);
      let roles: UserRole[] = ['officer', 'public'];

      if (existingUser) {
        roles = existingUser.roles;
        if (!roles.includes('officer')) {
          roles.push('officer');
        }
        if (!roles.includes('public')) {
          roles.push('public');
        }
      }

      // Create/update user document
      const user = await this.createOrUpdateUser(result.user, roles, 'email-password');
      console.log('Officer user created/updated via email link');

      return { success: true, user };
    } catch (error: any) {
      console.error('Email link sign-in error:', error);
      window.localStorage.removeItem('emailForSignIn');
      return this.handleAuthError(error);
    }
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

    // Email/Password specific errors
    if (error.code === 'auth/email-already-in-use') {
      return {
        success: false,
        error: 'This email is already registered. Please sign in instead.',
        errorCode: ErrorCode.EMAIL_ALREADY_IN_USE
      };
    }

    if (error.code === 'auth/weak-password') {
      return {
        success: false,
        error: 'Password is too weak. Please use at least 6 characters.',
        errorCode: ErrorCode.WEAK_PASSWORD
      };
    }

    if (error.code === 'auth/invalid-email') {
      return {
        success: false,
        error: 'Invalid email address format.',
        errorCode: ErrorCode.INVALID_CREDENTIALS
      };
    }

    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      return {
        success: false,
        error: 'Invalid email or password. Please check your credentials and try again.',
        errorCode: ErrorCode.INVALID_CREDENTIALS
      };
    }

    if (error.code === 'auth/too-many-requests') {
      return {
        success: false,
        error: 'Too many failed attempts. Please try again later or reset your password.',
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
