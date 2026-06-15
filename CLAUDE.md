# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AQD** is the digital ecosystem for Family Court, Maldives (aqd.familycourt.gov.mv). It serves as a unified platform connecting the public to court services and managing internal office operations.

**Current Module**: MAP Certificate - Marriage Awareness Program certificate generation and distribution system.

**Tech Stack**: Vue 3 + TypeScript + Vite + Firebase (Firestore, Storage, Auth) + Tailwind CSS + Pinia

## Development Commands

```bash
# Development
pnpm dev              # Start dev server on http://localhost:5173

# Build
pnpm build            # TypeScript compilation + Vite production build
pnpm preview          # Preview production build locally

# Firebase
pnpm init             # Initialize Firebase with default template
pnpm deploy:firebase  # Build and deploy to Firebase Hosting
```

## Architecture

### AQD Ecosystem Structure

```
aqd.familycourt.gov.mv
├── Core Platform
│   ├── Authentication (Office 365 / Google)
│   ├── User Management & Groups
│   └── Shared Services
│
├── MAP Module (Current)
│   ├── Certificate Generation
│   ├── Participant Management
│   └── Email Distribution
│
└── Future Modules
    ├── Case Management
    ├── Document Portal
    └── Public Services
```

### Frontend Structure

The application follows a role-based architecture:

- **AQD Landing** (`/`): Main ecosystem entry point with app grid
- **Admin Portal** (`/admin/*`): Staff management, MAP administration
- **Participant Portal** (`/participant/*`): Certificate viewing, profile updates
- **User Profile** (`/profile`): Profile viewing for all authenticated users

### Authentication

**Domain-Based Access** (NO whitelist required):
- **Office 365** (`@familycourt.gov.mv`) → Officer role (staff access)
- **Google** → Public/Participant role

**User Groups**: Permissions managed through Firestore security groups, not individual role assignment.

### State Management

Uses Pinia stores:
- `auth.store.ts`: Authentication and user state
- `template.store.ts`: Certificate template CRUD, asset uploads
- Additional stores: `participants`, `profileUpdates` (planned)

### Firebase Backend

**Firestore Collections**:
- `users/`: User profiles with roles and group membership
- `user_groups/`: Security groups with permissions
- `certificate_templates/`: Template definitions
- `participants/`: Participant data (MAP module)
- `settings/`: App and module configuration

**Firebase Storage**:
- `assets/`: Signatures, stamps, logos, backgrounds
- `certificates/{year}/{month}/`: Generated PDFs

## Key Conventions

### Component Organization

```
src/
├── components/
│   ├── admin/           # Admin-only components
│   ├── layout/          # Shared layout components
│   └── template/        # Template editor (MAP module)
├── views/
│   ├── admin/           # Admin pages
│   │   └── template/    # Template manager (MAP)
│   ├── participant/     # Participant pages (MAP)
│   └── public/          # Public pages
├── stores/              # Pinia state management
├── services/            # API services (auth, etc.)
├── types/               # TypeScript definitions
├── utils/               # Utilities and helpers
└── router/              # Vue Router configuration
```

### Route Structure

**Public**:
- `/` - AQD Landing page
- `/login` - Authentication

**Staff (Office 365 - `@familycourt.gov.mv`)**:
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/participants` - Participants list (MAP)
- `/admin/certificates` - Certificate management (MAP)
- `/admin/templates` - Template manager (MAP)

**Authenticated Users**:
- `/profile` - User profile
- `/participant/portal` - Participant portal (MAP)

### Icons

**Use Heroicons only** - Do not create custom SVG icons. Import from `@heroicons/vue`.

### TypeScript

Strict type checking enabled. Key type files:
- `src/types/auth.types.ts`: User, Role, Group types
- `src/types/template.types.ts`: Certificate template types

### Bilingual Support

All participant data has dual language fields:
- `name` / `name_dv` (Dhivehi)
- `partner_name` / `partner_name_dv`

## Role System

### User Types

| Login Provider | Domain | Role |
|----------------|--------|------|
| Office 365 | `@familycourt.gov.mv` | Officer |
| Google | Any | Public/Participant |

### User Groups (Firestore-based)

Permissions are managed through security groups:

```typescript
// user_groups/{groupId}
{
  name: string,
  description: string,
  permissions: string[],
  members: string[] // user UIDs
}
```

### Role Assignment Flow

**Office 365 Login**:
1. User authenticates with Microsoft
2. System checks domain is `@familycourt.gov.mv`
3. Assigns "officer" base role
4. Checks group membership for additional permissions

**Google Login**:
1. User authenticates with Google
2. Checks if email exists in participants collection
3. Assigns "participant" or "public" role accordingly

### Key Files

- `src/types/auth.types.ts` - Type definitions
- `src/utils/role.helpers.ts` - Role checking utilities
- `src/middleware/auth.guards.ts` - Route guards
- `src/stores/auth.store.ts` - Auth state
- `src/services/auth.service.ts` - Auth logic

## MAP Module (Certificate System)

### Template System

Visual template editor with:
- Live preview (A4 print and mobile views)
- Customizable backgrounds, borders, colors
- Multiple signatures and stamps
- Bilingual text elements

### Certificate Generation Flow (Planned)

1. Admin approves participants
2. Bulk generation triggered
3. Firebase Function renders PDF
4. Uploads to Storage
5. Emails via Microsoft Graph API

### Participant Status Workflow

1. `pending` - Initial registration
2. `profile_submitted` - User submitted updates
3. `verified` - Admin verified data
4. `approved` - Ready for certificate
5. `certificate_sent` - Certificate delivered

## Common Tasks

### Adding a New Module

1. Create views in `src/views/{module}/`
2. Create components in `src/components/{module}/`
3. Add Pinia store in `src/stores/{module}.store.ts`
4. Define types in `src/types/{module}.types.ts`
5. Add routes with appropriate guards
6. Update AQD landing page app grid

### Adding User Permissions

1. Define permission in `user_groups` collection
2. Add permission check in `role.helpers.ts`
3. Use in route guards or component logic

### Firebase Collections

1. Define TypeScript interface in `src/types/`
2. Create Pinia store with CRUD operations
3. Update Firestore security rules
4. Add initialization script if needed

## Environment Variables

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
```

## Important Notes

- **Package manager**: Uses `pnpm`
- **Path aliases**: `@/` maps to `src/`
- **No whitelist**: Domain-based access for staff
- **User groups**: Firestore-based permission management
- **Icons**: Use Heroicons only, no custom SVGs

## Documentation

- `docs/MAP_MODULE.md` - MAP Certificate module documentation
- `docs/FIREBASE_SETUP.md` - Firebase setup guide
- `docs/TEMPLATE_CUSTOMIZATION.md` - Template editor guide
- `docs/ROLE_SYSTEM.md` - Role and permission system
- `README.md` - Project overview
