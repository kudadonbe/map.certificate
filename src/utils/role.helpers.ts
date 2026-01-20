import type { AppUser, UserRole, RoleGroup } from '@/types/auth.types';

/**
 * Role Groups Configuration
 * Define role hierarchies and permissions
 */
export const ROLE_GROUPS: Record<UserRole, RoleGroup> = {
  admin: {
    name: 'Administrator',
    description: 'Full system access and management capabilities',
    permissions: [
      'read:all',
      'write:all',
      'delete:all',
      'manage:users',
      'manage:participants',
      'manage:certificates',
      'manage:templates',
      'manage:settings',
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
 * Get user's primary role display name
 */
export function getPrimaryRoleLabel(user: AppUser | null): string {
  if (!user) return 'Guest';
  const roleGroup = ROLE_GROUPS[user.primaryRole];
  return roleGroup?.name || 'User';
}

/**
 * Get all role labels for a user
 */
export function getAllRoleLabels(user: AppUser | null): string[] {
  if (!user || !user.roles) return [];
  return user.roles.map(role => ROLE_GROUPS[role]?.name || role);
}

/**
 * Determine primary role from roles array
 * Priority: admin > participant > public
 */
export function determinePrimaryRole(roles: UserRole[]): UserRole {
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('participant')) return 'participant';
  return 'public';
}
