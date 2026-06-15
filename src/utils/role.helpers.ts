import type { AppUser, UserRole, RoleGroup } from '@/types/auth.types';

/**
 * Role Groups Configuration
 * Define role hierarchies and permissions
 * Hierarchy: developer > system_admin > admin > officer > participant > public
 */
export const ROLE_GROUPS: Record<UserRole, RoleGroup> = {
  developer: {
    name: 'Developer',
    description: 'Full system access including role management and developer onboarding',
    permissions: [
      'read:all',
      'write:all',
      'delete:all',
      'manage:roles',
      'manage:developers',
      'manage:system-admins',
      'manage:admins',
      'manage:officers',
      'manage:users',
      'manage:groups',
      'manage:participants',
      'manage:certificates',
      'manage:templates',
      'manage:settings',
    ],
  },
  system_admin: {
    name: 'System Admin',
    description: 'User and admin management with full content access',
    permissions: [
      'read:all',
      'write:all',
      'delete:all',
      'manage:admins',
      'manage:officers',
      'manage:users',
      'manage:groups',
      'manage:participants',
      'manage:certificates',
      'manage:templates',
      'manage:settings',
    ],
  },
  admin: {
    name: 'Administrator',
    description: 'Content management for participants, certificates, and templates',
    permissions: [
      'read:all',
      'write:all',
      'delete:all',
      'manage:participants',
      'manage:certificates',
      'manage:templates',
    ],
  },
  officer: {
    name: 'Officer',
    description: 'Family Court staff with access to office applications',
    permissions: [
      'read:participants',
      'read:certificates',
      'read:templates',
      'write:participants',
      'write:certificates',
      'view:admin-dashboard',
      'access:office-apps',
    ],
  },
  participant: {
    name: 'Participant',
    description: 'Program participant with access to own certificates',
    permissions: [
      'read:own-certificates',
      'download:own-certificates',
      'view:own-profile',
      'update:own-profile',
    ],
  },
  public: {
    name: 'Public User',
    description: 'General authenticated user',
    permissions: [
      'view:own-profile',
      'update:own-profile',
    ],
  },
};

/**
 * Check if user has a specific role
 */
export function hasRole(user: AppUser | null, role: UserRole): boolean {
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: AppUser | null, roles: UserRole[]): boolean {
  if (!user || !user.roles) return false;
  return roles.some(role => user.roles.includes(role));
}

/**
 * Check if user has all of the specified roles
 */
export function hasAllRoles(user: AppUser | null, roles: UserRole[]): boolean {
  if (!user || !user.roles) return false;
  return roles.every(role => user.roles.includes(role));
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: AppUser | null, permission: string): boolean {
  if (!user || !user.roles) return false;

  // Check if any of the user's roles has this permission
  return user.roles.some(role => {
    const roleGroup = ROLE_GROUPS[role];
    return roleGroup?.permissions.includes(permission);
  });
}

/**
 * Get all permissions for a user based on their roles
 */
export function getUserPermissions(user: AppUser | null): string[] {
  if (!user || !user.roles) return [];

  const permissions = new Set<string>();
  user.roles.forEach(role => {
    const roleGroup = ROLE_GROUPS[role];
    if (roleGroup) {
      roleGroup.permissions.forEach(permission => permissions.add(permission));
    }
  });

  return Array.from(permissions);
}

/**
 * Add a role to user
 */
export function addRole(user: AppUser, role: UserRole): UserRole[] {
  if (!user.roles.includes(role)) {
    return [...user.roles, role];
  }
  return user.roles;
}

/**
 * Remove a role from user
 */
export function removeRole(user: AppUser, role: UserRole): UserRole[] {
  return user.roles.filter(r => r !== role);
}

/**
 * Get display label for a role
 * Handles variations like system-admin vs system_admin
 */
export function getRoleLabel(role: string): string {
  // Normalize role key (handle hyphens vs underscores)
  const normalizedRole = role.replace(/-/g, '_') as UserRole;

  // Check if it's in ROLE_GROUPS
  if (ROLE_GROUPS[normalizedRole]) {
    return ROLE_GROUPS[normalizedRole].name;
  }

  // Fallback: Convert to title case (system_admin -> System Admin)
  return role
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Get user's primary role display name
 */
export function getPrimaryRoleLabel(user: AppUser | null): string {
  if (!user) return 'Guest';
  return getRoleLabel(user.primaryRole);
}

/**
 * Get all role labels for a user
 */
export function getAllRoleLabels(user: AppUser | null): string[] {
  if (!user || !user.roles) return [];
  return user.roles.map(role => getRoleLabel(role));
}

/**
 * Determine primary role from roles array
 * Priority: developer > system_admin > admin > officer > participant > public
 */
export function determinePrimaryRole(roles: UserRole[]): UserRole {
  if (roles.includes('developer')) return 'developer';
  if (roles.includes('system_admin')) return 'system_admin';
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('officer')) return 'officer';
  if (roles.includes('participant')) return 'participant';
  return 'public';
}

/**
 * Check if user can manage all roles (developer only)
 */
export function canManageAllRoles(user: AppUser | null): boolean {
  return hasRole(user, 'developer');
}

/**
 * Check if user can manage user roles (developer or system_admin)
 */
export function canManageUsers(user: AppUser | null): boolean {
  return hasAnyRole(user, ['developer', 'system_admin']);
}

/**
 * Check if user has admin-level access (developer, system_admin, or admin)
 */
export function hasAdminAccess(user: AppUser | null): boolean {
  return hasAnyRole(user, ['developer', 'system_admin', 'admin']);
}

/**
 * Check if user has officer-level access (can access admin dashboard)
 * Includes: developer, system_admin, admin, officer
 */
export function hasOfficerAccess(user: AppUser | null): boolean {
  return hasAnyRole(user, ['developer', 'system_admin', 'admin', 'officer']);
}

/**
 * Check if user is a Family Court staff member
 */
export function isStaffMember(user: AppUser | null): boolean {
  return hasAnyRole(user, ['developer', 'system_admin', 'admin', 'officer']);
}

/**
 * Get roles that a user can assign based on their own role
 */
export function getAssignableRoles(user: AppUser | null): UserRole[] {
  if (!user) return [];

  if (hasRole(user, 'developer')) {
    return ['developer', 'system_admin', 'admin', 'officer', 'participant', 'public'];
  }
  if (hasRole(user, 'system_admin')) {
    return ['admin', 'officer', 'participant', 'public'];
  }
  if (hasRole(user, 'admin')) {
    return ['officer', 'participant', 'public'];
  }
  return [];
}
