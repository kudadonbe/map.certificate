import type { User as FirebaseUser } from 'firebase/auth';

/**
 * Available roles in the system
 * Users can have multiple roles simultaneously
 */
export type UserRole = 'admin' | 'participant' | 'public';
export type AuthProvider = 'microsoft' | 'google';

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

  provider: AuthProvider;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
  isActive: boolean;

  // Admin-specific
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
  NOT_IN_WHITELIST = 'not-in-whitelist',
  NOT_A_PARTICIPANT = 'not-a-participant',
  POPUP_CLOSED = 'popup-closed',
  NETWORK_ERROR = 'network-error',
  UNKNOWN_ERROR = 'unknown-error',
}

export interface AdminWhitelist {
  emails: string[];
  updatedAt: Date;
  updatedBy: string;
}
