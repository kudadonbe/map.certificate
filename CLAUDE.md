# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MAP Certificate is a certificate generation and distribution system for the Marriage Awareness Program (MAP) held by Family Court, Maldives. The system automates certificate creation with a visual template editor, manages participant data from Google Sheets, and handles bulk email distribution via Microsoft Graph API.

**Tech Stack**: Vue 3 + TypeScript + Vite + Firebase (Firestore, Storage, Auth) + Tailwind CSS + Pinia

## Development Commands

```bash
# Development
npm run dev              # Start dev server on http://localhost:5173

# Build
npm run build            # TypeScript compilation + Vite production build
npm run preview          # Preview production build locally

# Firebase
npm run init             # Initialize Firebase with default template (scripts/initializeFirebase.js)
npm run deploy:firebase  # Build and deploy to Firebase Hosting
```

## Architecture

### Frontend Structure

The application follows a flexible role-based architecture with multiple user interfaces:

- **Admin Portal** (`/admin/*`): Template management, participant verification, certificate generation
- **Participant Portal** (`/participant/*`): Certificate viewing, profile updates, download access
- **Public Profile** (`/profile`): Profile viewing for all authenticated users
- **Authentication**: Multi-provider OAuth
  - **Office 365** for admins (whitelist-based) - See `docs/OFFICE365_SETUP.md`
  - **Google** for participants and public users
  - Flexible role system supporting multiple simultaneous roles
  - Auto-role assignment based on whitelist and participant records

### State Management

Uses Pinia stores for centralized state:
- `template.store.ts`: Certificate template CRUD, asset uploads to Firebase Storage
- Additional stores expected: `participants`, `auth`, `profileUpdates` (referenced in README but not yet implemented)

### Firebase Backend

**Firestore Collections**:
- `certificate_templates/`: Template definitions with design settings, signatures, stamps
- `settings/certificate_config`: Global config (certificatePrefix, lastCertificateNumber, pdfResolution)
- `participants/`: Participant data with bilingual names (English & Dhivehi), certificate URLs
- `profile_updates/`: Pending profile change requests for admin review
- `email_logs/`: Email delivery tracking

**Firebase Storage**:
- `assets/signatures/`: Uploaded signature images
- `assets/stamps/`: Official seals and stamps
- `assets/logos/`: Organization logos
- `assets/backgrounds/`: Certificate background images
- `certificates/{year}/{month}/`: Generated PDF certificates

### Certificate Template System

Key feature: Visual template editor with live preview in both print (A4) and mobile views. Templates support:
- Customizable backgrounds (solid, gradient, image), borders, theme colors
- Multiple signatures with signatory names/titles
- Multiple stamps/seals with opacity control
- Bilingual text elements (English & Dhivehi)
- Dynamic fields linked to participant data

Template management functions in `template.store.ts`:
- `loadTemplates()`, `createTemplate()`, `updateTemplate()`, `deleteTemplate()`
- `setDefaultTemplate(id)`, `duplicateTemplate(id, newName)`
- `uploadAsset(file, type)`, `deleteAsset(url)`

See `docs/TEMPLATE_CUSTOMIZATION.md` for complete template system documentation.

## Key Conventions

### Component Organization

```
src/
├── components/
│   ├── admin/           # Admin-only components
│   ├── layout/          # Shared layout components
│   └── template/        # Template editor components
├── views/
│   ├── admin/           # Admin pages (Dashboard, ParticipantsList, CertificateManagement)
│   │   └── template/    # TemplateManager page
│   └── participant/     # Participant pages (Portal, etc.)
├── stores/              # Pinia state management
├── types/               # TypeScript type definitions (template.types.ts)
├── utils/               # Utilities and defaults (template.defaults.ts)
└── router/              # Vue Router configuration
```

### Route Structure

- `/` - Home page
- `/login` - Authentication
- `/admin/dashboard` - Admin dashboard
- `/admin/participants` - Participants list
- `/admin/certificates` - Certificate management
- `/admin/templates` - Template manager
- `/participant/portal` - Participant portal

### TypeScript Configuration

The project uses TypeScript with strict type checking. Key types defined in:
- `src/types/template.types.ts`: CertificateTemplate, TextElement, SignatureElement, StampElement, etc.

### Bilingual Support

All participant-facing data has dual language fields:
- `name` (English) / `name_dv` (Dhivehi)
- `partner_name` / `partner_name_dv`

Certificate templates must handle both languages in text elements.

### Firebase Configuration

Environment variables in `.env.example` (copy to `.env.local`):
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
```

Firebase initialized in `src/firebase.ts`, exports `db`, `storage`, `auth`.

## Critical Implementation Details

### Role-Based Access Control (RBAC)

The system implements a **flexible role groups system** where users can have multiple roles simultaneously.

**Role Types**:
- `admin`: Full system access (Office 365 + whitelist)
- `participant`: Program participant (Google + participant record)
- `public`: General authenticated user (Google)

**User Structure**:
```typescript
{
  roles: ['admin', 'participant', 'public'],  // Multiple roles
  primaryRole: 'admin'  // Display role (hierarchy: admin > participant > public)
}
```

**Role Assignment**:
- **Admin**: Office 365 login + email in whitelist → `['admin', 'public']`
- **Participant**: Google login + participant record → `['participant', 'public']`
- **Public**: Google login without participant record → `['public']`

**Detailed Documentation**: See `docs/ROLE_SYSTEM.md` for complete role system architecture, helper functions, and usage examples.

**Key Files**:
- `src/types/auth.types.ts` - Role type definitions
- `src/utils/role.helpers.ts` - Role checking utilities and permissions
- `src/middleware/auth.guards.ts` - Route guards
- `src/stores/auth.store.ts` - Auth state management
- `src/composables/useAuth.ts` - Auth composable for components

### Template Asset Upload Flow

1. User selects image file in template editor
2. `uploadAsset(file, type)` uploads to Firebase Storage path: `assets/{type}s/{timestamp}_{filename}`
3. Returns download URL
4. URL stored in template document in Firestore
5. Assets must be publicly readable for certificate PDF generation

### Certificate Generation Flow (Planned)

1. Admin approves participants in dashboard
2. Bulk certificate generation triggered
3. Firebase Function loads default template from Firestore
4. Renders template with participant data to PDF
5. Uploads PDF to Storage: `certificates/{year}/{month}/{filename}`
6. Updates participant document with `certificateUrl`
7. Sends email via Microsoft Graph API with PDF attachment

### Firebase Security Rules Philosophy

- **Templates**: Admins write, authenticated users read active templates
- **Storage Assets**: Admins write, public read (required for PDF generation)
- **Certificates**: Admins write, authenticated users read their own
- **Participants**: Admins full access, users read own records (by email match)

## Common Development Tasks

### Adding a New Template Element Type

1. Define type in `src/types/template.types.ts`
2. Add to `CertificateTemplate.elements` array type
3. Update default template in `src/utils/template.defaults.ts`
4. Add UI controls in template editor component
5. Implement rendering logic in certificate preview component

### Adding a New Firestore Collection

1. Update security rules in Firebase Console (Firestore Rules tab)
2. Create TypeScript interface in `src/types/`
3. Create Pinia store in `src/stores/` with CRUD operations
4. Add collection initialization to `scripts/initializeFirebase.js` if needed

### Testing Template Changes

1. Run `npm run dev`
2. Navigate to `/admin/templates`
3. Create/edit template with changes
4. Toggle between Print View (A4) and Mobile View
5. Verify responsive behavior and layout

## Firebase Initialization

The `npm run init` command runs `scripts/initializeFirebase.js` which sets up:
- Default A4 portrait template in `certificate_templates/`
- Initial settings document in `settings/certificate_config`

**Note**: Firebase Functions directory does not exist yet. Certificate PDF generation and email sending will be implemented in `functions/` directory (referenced in README but not created).

## Important Notes

- **No Firebase Functions yet**: The `functions/` directory referenced in README.md does not exist. Backend logic (PDF generation, email sending, Google Sheets sync) is planned but not implemented.
- **Authentication providers**: Set up in Firebase Console but integration code may be incomplete.
- **Package manager**: Uses `pnpm` (specified in package.json: `"packageManager": "pnpm@8.15.0"`)
- **Path aliases**: `@/` maps to `src/` (configured in vite.config.ts)

## Documentation

- `docs/TEMPLATE_CUSTOMIZATION.md`: Complete guide to template system features, API reference
- `docs/FIREBASE_SETUP.md`: Step-by-step Firebase project setup (30-40 min)
- `docs/TEMPLATE_QUICK_START.md`: Quick start for template usage
- `README.md`: Project overview, architecture, database structure, features roadmap

## Status References

Participant status workflow:
1. `pending` - Initial registration
2. `profile_submitted` - User submitted profile updates
3. `verified` - Admin verified profile data
4. `approved` - Ready for certificate generation
5. `certificate_sent` - Certificate generated and emailed
