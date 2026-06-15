# AQD - Family Court Digital Ecosystem

## Overview

**AQD** (aqd.familycourt.gov.mv) is the digital ecosystem for Family Court, Maldives. It serves as a unified platform connecting the public to court services and managing internal office operations.

### Vision

```
aqd.familycourt.gov.mv
├── Core Platform
│   ├── Authentication (Office 365 / Google)
│   ├── User Management & Groups
│   ├── Security Policies
│   └── Shared Services
│
├── MAP Module (Marriage Awareness Program)
│   ├── Certificate Generation
│   ├── Participant Management
│   └── Email Distribution
│
├── Future Modules
│   ├── Case Management
│   ├── Document Portal
│   └── Public Services
│
└── Public Portal
    ├── Service Information
    ├── Certificate Verification
    └── Participant Access
```

## Technology Stack

- **Frontend**: Vue 3 + Vite + Tailwind CSS + Pinia
- **Backend**: Firebase (Firestore, Storage, Auth)
- **Authentication**:
  - Office 365 (Family Court Staff - `@familycourt.gov.mv`)
  - Google OAuth (Public Users / Participants)
- **Email Service**: Microsoft Graph API
- **PDF Generation**: Puppeteer/PDFKit (Firebase Functions)

## Authentication

### Domain-Based Access

| Provider | Domain | User Type |
|----------|--------|-----------|
| Office 365 | `@familycourt.gov.mv` | Officer (Staff) |
| Google | Any | Public / Participant |

### User Groups

User permissions are managed through **security groups** stored in Firestore:

```
user_groups/
  {groupId}/
    - name: string
    - permissions: string[]
    - members: string[] (user UIDs)
```

Roles are assigned through group membership, allowing flexible permission management.

## Modules

### MAP Module (Current)

The Marriage Awareness Program Certificate System:

- **Participant Management**: Track program participants
- **Certificate Templates**: Visual template editor with bilingual support
- **Certificate Generation**: Bulk PDF generation
- **Email Distribution**: Automated certificate delivery via Microsoft Graph
- **Participant Portal**: Self-service certificate access

[View MAP Documentation](docs/MAP_MODULE.md)

### Future Modules

- Case Management System
- Document Portal
- Public Services Gateway
- Court Calendar

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (package manager)
- Firebase account
- Office 365 account (for staff authentication)

### Installation

```bash
# Clone repository
git clone https://github.com/familycourt/aqd.git

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# Start development server
pnpm dev
```

### Development Commands

```bash
pnpm dev              # Start dev server (http://localhost:5173)
pnpm build            # Production build
pnpm preview          # Preview production build
pnpm deploy:firebase  # Deploy to Firebase Hosting
```

## Project Structure

```
aqd/
├── src/
│   ├── components/
│   │   ├── admin/           # Admin components
│   │   ├── layout/          # Shared layouts
│   │   └── template/        # Template editor
│   ├── views/
│   │   ├── admin/           # Admin pages
│   │   ├── participant/     # Participant portal
│   │   └── public/          # Public pages
│   ├── stores/              # Pinia stores
│   ├── services/            # API services
│   ├── types/               # TypeScript types
│   ├── utils/               # Utilities
│   └── router/              # Vue Router
├── docs/                    # Documentation
├── functions/               # Firebase Functions (planned)
└── scripts/                 # Setup scripts
```

## Routes

### Public Routes
- `/` - AQD Landing Page
- `/login` - Authentication

### Staff Routes (Office 365)
- `/admin/dashboard` - Admin Dashboard
- `/admin/users` - User Management
- `/admin/participants` - Participant Management
- `/admin/certificates` - Certificate Management
- `/admin/templates` - Template Editor

### Participant Routes (Google)
- `/participant/portal` - Participant Dashboard
- `/profile` - User Profile

## Database Structure

### Firestore Collections

```javascript
// User Groups
user_groups/
  {groupId}/
    - name: string
    - description: string
    - permissions: string[]
    - createdAt: timestamp

// Users
users/
  {uid}/
    - email: string
    - displayName: string
    - roles: string[]
    - groups: string[] (group IDs)
    - provider: 'microsoft' | 'google'
    - isActive: boolean
    - lastLoginAt: timestamp

// MAP Module - Participants
participants/
  {id}/
    - name: string
    - name_dv: string (Dhivehi)
    - email: string
    - status: string
    - certificateUrl: string

// MAP Module - Templates
certificate_templates/
  {id}/
    - name: string
    - isDefault: boolean
    - settings: object

// Settings
settings/
  - certificate_config
  - app_config
```

## Security

### Authentication Flow

**Staff (Office 365)**:
1. User clicks "Staff Login"
2. Redirects to Microsoft OAuth
3. Authenticates with Family Court credentials
4. System verifies `@familycourt.gov.mv` domain
5. Creates/updates user record with "officer" role
6. Redirects to admin dashboard

**Public (Google)**:
1. User clicks "Login with Google"
2. Authenticates with Google account
3. System checks if email matches participant record
4. Assigns appropriate role (participant/public)
5. Redirects to appropriate portal

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users - authenticated users can read own, officers can read all
    match /users/{userId} {
      allow read: if request.auth != null &&
                     (request.auth.uid == userId || isOfficer());
      allow write: if request.auth != null && isAdmin();
    }

    // User groups - officers can read, admins can write
    match /user_groups/{groupId} {
      allow read: if request.auth != null && isOfficer();
      allow write: if request.auth != null && isAdmin();
    }

    // Participants - officers can read/write
    match /participants/{id} {
      allow read, write: if request.auth != null && isOfficer();
      allow read: if request.auth != null &&
                     resource.data.email == request.auth.token.email;
    }
  }
}
```

## Bilingual Support

The system supports both English and Dhivehi:

- All participant data has dual fields (`name` / `name_dv`)
- Certificate templates support bilingual text elements
- UI supports RTL for Dhivehi content

## Documentation

- [MAP Module](docs/MAP_MODULE.md) - Certificate system documentation
- [Firebase Setup](docs/FIREBASE_SETUP.md) - Firebase configuration guide
- [Template Customization](docs/TEMPLATE_CUSTOMIZATION.md) - Template editor guide
- [Role System](docs/ROLE_SYSTEM.md) - User roles and permissions
- [UI Conventions](docs/UI_CONVENTIONS.md) - Design guidelines

## Roadmap

### Phase 1: Foundation (Current)
- [x] Authentication system (Office 365 + Google)
- [x] User management
- [x] Role-based access control
- [x] MAP Certificate module (UI)
- [ ] MAP Backend integration
- [ ] AQD Landing page

### Phase 2: Full MAP Module
- [ ] Participant management (Firestore)
- [ ] Certificate generation (Firebase Functions)
- [ ] Email distribution (Microsoft Graph)
- [ ] Participant portal (functional)

### Phase 3: Ecosystem Expansion
- [ ] User groups and policies
- [ ] Additional modules
- [ ] API for external integrations
- [ ] Mobile app

## Contributing

This is an internal Family Court project. For access or contributions, contact IT department.

## License

Proprietary - Family Court, Maldives

## Contact

**Family Court, Maldives**
Email: info@familycourt.gov.mv
Website: familycourt.gov.mv
