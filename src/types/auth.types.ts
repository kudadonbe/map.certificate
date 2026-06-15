import type { User as FirebaseUser } from 'firebase/auth';

/**
 * Family Court domain for officer access
 */
export const FAMILY_COURT_DOMAIN = 'familycourt.gov.mv';

/**
 * Available roles in the system
 * Users can have multiple roles simultaneously
 * Hierarchy: developer > system_admin > admin > officer > participant > public
 */
export type UserRole = 'developer' | 'system_admin' | 'admin' | 'officer' | 'participant' | 'public';
export type AuthProvider = 'microsoft' | 'google' | 'email-password';

/**
 * Role group definitions
 * Each group can have specific permissions
 */
export interface RoleGroup {
  name: string;
  description: string;
  permissions: string[];
}

/**
 * User Group for Firestore-based permission management
 */
export interface UserGroup {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  members: string[]; // user UIDs
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/**
 * Application User with flexible role groups
 */
export interface AppUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;

  // Multiple roles support
  roles: UserRole[];
  primaryRole: UserRole; // Main role for display purposes

  // User groups (Firestore-based permission system)
  groups?: string[]; // group IDs

  provider: AuthProvider;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
  isActive: boolean;

  // Admin-specific (legacy, for backward compatibility)
  adminApprovedBy?: string;
  adminApprovedAt?: Date;

  // Participant-specific
  participantId?: string;
}

export interface AuthState {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Backward compatible role checks
  isAdmin: boolean;
  isOfficer: boolean;
  isParticipant: boolean;
  isPublic: boolean;

  // New role group methods
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasAllRoles: (roles: UserRole[]) => boolean;
}

export interface LoginResult {
  success: boolean;
  user?: AppUser;
  error?: string;
  errorCode?: AuthErrorCode;
}

export enum AuthErrorCode {
  UNAUTHORIZED_EMAIL = 'unauthorized-email',
  INVALID_DOMAIN = 'invalid-domain',
  NOT_A_PARTICIPANT = 'not-a-participant',
  EMAIL_NOT_VERIFIED = 'email-not-verified',
  WEAK_PASSWORD = 'weak-password',
  EMAIL_ALREADY_IN_USE = 'email-already-in-use',
  INVALID_CREDENTIALS = 'invalid-credentials',
  POPUP_CLOSED = 'popup-closed',
  NETWORK_ERROR = 'network-error',
  UNKNOWN_ERROR = 'unknown-error',
  // Legacy - kept for backward compatibility
  NOT_IN_WHITELIST = 'not-in-whitelist',
}

/**
 * @deprecated Use domain-based access instead
 * Kept for backward compatibility during migration
 */
export interface AdminWhitelist {
  emails: string[];
  updatedAt: Date;
  updatedBy: string;
}

/**
 * Check if email is from Family Court domain
 */
export function isFamilyCourtEmail(email: string): boolean {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  return normalizedEmail.endsWith(`@${FAMILY_COURT_DOMAIN}`);
}
