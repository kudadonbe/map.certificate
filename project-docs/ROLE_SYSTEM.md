# Flexible Role Groups System

## Overview

The MAP Certificate application uses a flexible role-based access control (RBAC) system that allows users to have multiple roles simultaneously. This provides granular control over permissions and access levels.

## Architecture

### Role Types

The system supports three primary roles:

1. **Admin** - Full system access and management capabilities
2. **Participant** - Program participant with access to own certificates
3. **Public** - General authenticated user

### User Role Structure

Each user has:
- `roles: UserRole[]` - Array of roles the user possesses
- `primaryRole: UserRole` - Main role for display purposes (determined by hierarchy)

**Role Hierarchy Priority:**
```
admin > participant > public
```

## Role Assignment Logic

### Google Login (Public/Participant)

```typescript
// If user has participant record in Firestore
roles: ['participant', 'public']
primaryRole: 'participant'

// If user has no participant record
roles: ['public']
primaryRole: 'public'
```

### Microsoft Login (Admin)

```typescript
// If email is in admin whitelist
roles: ['admin', 'public']
primaryRole: 'admin'
```

## Role Groups Configuration

Roles are defined with specific permissions in `src/utils/role.helpers.ts`:

```typescript
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
```

## Helper Functions

### Role Checking

```typescript
import { hasRole, hasAnyRole, hasAllRoles } from '@/utils/role.helpers';

// Check if user has a specific role
hasRole(user, 'admin') // true/false

// Check if user has any of the specified roles
hasAnyRole(user, ['admin', 'participant']) // true if has at least one

// Check if user has all of the specified roles
hasAllRoles(user, ['participant', 'public']) // true if has all
```

### Permission Checking

```typescript
import { hasPermission, getUserPermissions } from '@/utils/role.helpers';

// Check if user has specific permission
hasPermission(user, 'manage:certificates') // true/false

// Get all permissions for user
const permissions = getUserPermissions(user)
// Returns: ['read:all', 'write:all', 'delete:all', ...]
```

### Role Management

```typescript
import { addRole, removeRole, determinePrimaryRole } from '@/utils/role.helpers';

// Add a role to user
const newRoles = addRole(user, 'participant')

// Remove a role from user
const updatedRoles = removeRole(user, 'public')

// Determine primary role from roles array
const primaryRole = determinePrimaryRole(['admin', 'participant', 'public'])
// Returns: 'admin' (highest priority)
```

## Usage in Components

### Using the Auth Composable

```vue
<script setup lang="ts">
import { useAuth } from '@/composables/useAuth';

const {
  user,
  userRoles,
  userRole,
  isAdmin,
  isParticipant,
  isPublic,
  hasRole,
  hasAnyRole,
  hasAllRoles
} = useAuth();

// Backward compatible role checks
if (isAdmin.value) {
  // User has admin role
}

// New flexible role checks
if (hasRole('participant')) {
  // User has participant role
}

if (hasAnyRole(['admin', 'participant'])) {
  // User has either admin OR participant role
}

if (hasAllRoles(['participant', 'public'])) {
  // User has BOTH participant AND public roles
}

// Access all user roles
console.log(userRoles.value) // ['participant', 'public']
console.log(userRole.value) // 'participant' (primary role)
</script>
```

### Template Usage

```vue
<template>
  <div>
    <!-- Show for specific role -->
    <div v-if="hasRole('admin')">
      Admin only content
    </div>

    <!-- Show for any of multiple roles -->
    <div v-if="hasAnyRole(['admin', 'participant'])">
      Content for admins or participants
    </div>

    <!-- Display all roles -->
    <div>
      <span v-for="role in userRoles" :key="role">
        {{ role }}
      </span>
    </div>
  </div>
</template>
```

## Route Guards

### Basic Guards (Backward Compatible)

```typescript
import { requireAuth, requireAdmin, requireParticipant } from '@/middleware/auth.guards';

// Require authentication
{
  path: '/profile',
  component: Profile,
  beforeEnter: requireAuth
}

// Require admin role
{
  path: '/admin/dashboard',
  component: Dashboard,
  beforeEnter: requireAdmin
}

// Require participant role
{
  path: '/participant/portal',
  component: Portal,
  beforeEnter: requireParticipant
}
```

### Flexible Role Guards

```typescript
import { requireRole, requireAnyRole } from '@/middleware/auth.guards';

// Require specific role
{
  path: '/special',
  component: Special,
  beforeEnter: requireRole('admin')
}

// Require any of multiple roles
{
  path: '/dashboard',
  component: Dashboard,
  beforeEnter: requireAnyRole(['admin', 'participant'])
}
```

## Store Methods

### Auth Store

```typescript
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();

// Check roles
authStore.hasRole('admin')
authStore.hasAnyRole(['admin', 'participant'])
authStore.hasAllRoles(['participant', 'public'])

// Get user roles
authStore.userRole // Primary role
authStore.userRoles // All roles array

// Backward compatible
authStore.isAdmin
authStore.isParticipant
authStore.isPublic
```

## Migration from Single Role

The system automatically migrates users with the old single `role` field to the new `roles` array format:

```typescript
// Old format (automatically migrated)
{
  role: 'admin'
}

// New format
{
  roles: ['admin'],
  primaryRole: 'admin'
}
```

## Best Practices

1. **Use Primary Role for Display**: When showing the user's role in the UI, use `primaryRole` or the `getPrimaryRoleLabel()` helper.

2. **Check Multiple Roles for Access Control**: When determining access, check if user has the required role using `hasRole()` or `hasAnyRole()`.

3. **Permission-Based Checks**: For fine-grained access control, use `hasPermission()` instead of role checks.

4. **Backward Compatibility**: The system maintains backward compatibility with `isAdmin`, `isParticipant`, and `isPublic` computed properties.

5. **Role Addition**: When adding new roles to a user, always update the `primaryRole` using `determinePrimaryRole()`.

## Example Scenarios

### Scenario 1: Participant who is also Admin

```typescript
{
  roles: ['admin', 'participant', 'public'],
  primaryRole: 'admin'
}

// Can access:
// - Admin dashboard ✓
// - Participant portal ✓
// - Profile page ✓
```

### Scenario 2: Public User

```typescript
{
  roles: ['public'],
  primaryRole: 'public'
}

// Can access:
// - Profile page ✓
// - Admin dashboard ✗
// - Participant portal ✗
```

### Scenario 3: Promoting Public User to Participant

When a participant record is created for a public user:

```typescript
// Before
{
  roles: ['public'],
  primaryRole: 'public'
}

// After (on next login)
{
  roles: ['participant', 'public'],
  primaryRole: 'participant'
}
```

## Files Reference

- **Types**: `src/types/auth.types.ts`
- **Helpers**: `src/utils/role.helpers.ts`
- **Service**: `src/services/auth.service.ts`
- **Store**: `src/stores/auth.store.ts`
- **Composable**: `src/composables/useAuth.ts`
- **Guards**: `src/middleware/auth.guards.ts`
