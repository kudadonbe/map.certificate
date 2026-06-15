# AQD Ecosystem - Project Plan

## Vision

**AQD** (aqd.familycourt.gov.mv) is the digital ecosystem for Family Court, Maldives. It serves as:
- A unified platform connecting the public to court services
- An internal office management system
- A modular architecture for future applications

## Architecture

```
AQD Ecosystem
├── Core Platform
│   ├── Authentication (Office 365 / Google)
│   ├── User Management & Groups
│   ├── Security Policies
│   └── Shared Services
│
├── MAP Module (Phase 1)
│   ├── Certificate Generation
│   ├── Participant Management
│   └── Email Distribution
│
└── Future Modules
    ├── Case Management
    ├── Document Portal
    ├── Public Services
    └── Court Calendar
```

## Technology Stack

- **Frontend**: Vue 3 + Vite + Tailwind CSS + Pinia
- **Backend**: Firebase (Firestore, Storage, Auth, Functions)
- **Authentication**:
  - Office 365 for staff (`@familycourt.gov.mv`)
  - Google OAuth for public users
- **Email**: Microsoft Graph API
- **PDF Generation**: Puppeteer/PDFKit (Firebase Functions)

## Authentication Model

### Domain-Based Access

| Provider | Domain | Role |
|----------|--------|------|
| Office 365 | `@familycourt.gov.mv` | Officer |
| Google | Any | Public / Participant |

No whitelist required - domain verification is automatic.

### User Groups

Permissions managed through Firestore security groups:

```javascript
user_groups/{groupId}
{
  name: string,
  description: string,
  permissions: string[],
  members: string[] // user UIDs
}
```

## Implementation Phases

### Phase 1: Foundation (Current)

**Goal**: Core platform with authentication and user management

**Completed**:
- [x] Vue 3 + Vite project setup
- [x] Tailwind CSS styling
- [x] Firebase integration
- [x] Multi-provider authentication (Office 365 + Google)
- [x] Role-based access control
- [x] User management interface
- [x] Route guards and middleware

**In Progress**:
- [ ] Remove whitelist system, use domain-based access
- [ ] User groups and permissions
- [ ] AQD landing page

### Phase 2: MAP Module

**Goal**: Full certificate generation and distribution system

**UI Completed**:
- [x] Certificate template editor
- [x] Template management
- [x] Admin dashboard (static)
- [x] Participants list (static)
- [x] Participant portal (static)

**Backend Needed**:
- [ ] Participants Firestore integration
- [ ] Profile update workflow
- [ ] Staff verification interface
- [ ] Firebase Functions for PDF generation
- [ ] Microsoft Graph email integration
- [ ] Google Sheets sync

### Phase 3: Ecosystem Expansion

**Goal**: Additional modules and enhanced features

- [ ] Case Management module
- [ ] Document Portal module
- [ ] Public Services gateway
- [ ] API for external integrations
- [ ] Mobile app (optional)

## Database Structure

### Core Collections

```javascript
// Users
users/{uid}
{
  email: string,
  displayName: string,
  photoURL: string,
  roles: string[],
  groups: string[],
  provider: 'microsoft' | 'google',
  isActive: boolean,
  createdAt: timestamp,
  lastLoginAt: timestamp
}

// User Groups
user_groups/{groupId}
{
  name: string,
  description: string,
  permissions: string[],
  createdAt: timestamp,
  updatedAt: timestamp
}

// Settings
settings/{configId}
{
  // App-wide configuration
}
```

### MAP Module Collections

```javascript
// Participants
participants/{id}
{
  name: string,
  name_dv: string,
  partner_name: string,
  partner_name_dv: string,
  email: string,
  status: string,
  certificate_url: string,
  // ... other fields
}

// Certificate Templates
certificate_templates/{id}
{
  name: string,
  isDefault: boolean,
  settings: object,
  // ... template configuration
}

// Profile Updates
profile_updates/{id}
{
  participant_id: string,
  submitted_data: object,
  status: string,
  // ... review fields
}

// Email Logs
email_logs/{id}
{
  participant_id: string,
  status: string,
  // ... tracking fields
}
```

## Route Structure

### Public Routes
- `/` - AQD Landing Page
- `/login` - Authentication

### Staff Routes (Office 365)
- `/admin/dashboard` - Dashboard
- `/admin/users` - User Management
- `/admin/participants` - Participants (MAP)
- `/admin/certificates` - Certificates (MAP)
- `/admin/templates` - Templates (MAP)

### User Routes
- `/profile` - User Profile
- `/participant/portal` - Participant Portal (MAP)

## Security Model

### Authentication Flow

**Staff Login**:
1. User clicks "Staff Login"
2. Redirects to Microsoft OAuth
3. Authenticates with Family Court credentials
4. System verifies `@familycourt.gov.mv` domain
5. Creates/updates user with "officer" role
6. Redirects to admin dashboard

**Public Login**:
1. User clicks "Login with Google"
2. Authenticates with Google
3. System checks for participant record
4. Assigns "participant" or "public" role
5. Redirects to appropriate portal

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isOfficer() {
      return request.auth.token.email.matches('.*@familycourt\\.gov\\.mv');
    }

    function isAdmin() {
      return isOfficer() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid))
               .data.roles.hasAny(['admin', 'developer']);
    }

    // Users
    match /users/{userId} {
      allow read: if request.auth.uid == userId || isOfficer();
      allow write: if isAdmin();
    }

    // User Groups
    match /user_groups/{groupId} {
      allow read: if isOfficer();
      allow write: if isAdmin();
    }

    // Participants
    match /participants/{id} {
      allow read, write: if isOfficer();
      allow read: if request.auth.token.email == resource.data.email;
    }

    // Templates
    match /certificate_templates/{id} {
      allow read, write: if isOfficer();
    }
  }
}
```

## AQD Landing Page Design

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Family Court    AQD                     [User] [Logout]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Welcome, [User Name]                                      │
│   [Role Badge] • Family Court Maldives                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│   APPLICATIONS                                              │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│   │   MAP    │  │  Coming  │  │  Coming  │  │  Coming  │   │
│   │Certificate│  │   Soon   │  │   Soon   │  │   Soon   │   │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│   QUICK LINKS                     │   SUPPORT               │
│   • My Profile                    │   • Help Center         │
│   • Recent Activity               │   • Contact IT          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│   ANNOUNCEMENTS                                             │
│   • System updates and court notices                        │
└─────────────────────────────────────────────────────────────┘
```

### Features

- **App Grid**: Visual cards for each module
- **Role-based Display**: Different apps based on user role
- **Quick Links**: Shortcuts to common actions
- **Announcements**: System updates, court notices
- **Professional Design**: Government-appropriate styling
- **Bilingual Support**: English/Dhivehi

## Success Metrics

### Phase 1
- Stable authentication system
- User management functional
- Domain-based access working

### Phase 2 (MAP Module)
- 90% reduction in certificate generation time
- Zero errors in certificate data
- 95%+ email delivery rate
- 100+ certificates per batch

### Phase 3
- Additional modules deployed
- API integrations active
- Mobile access available

## Risk Management

| Risk | Impact | Mitigation |
|------|--------|------------|
| Authentication issues | High | Thorough testing, fallback options |
| Email delivery failures | Medium | Retry mechanism, tracking |
| PDF generation timeouts | Medium | Optimize templates, queue system |
| Data sync issues | High | Validation, error logging |

## Budget

**Firebase (Monthly)**:
- Firestore: Free tier (1GB)
- Storage: Free tier (5GB)
- Functions: Free tier (2M invocations)
- Hosting: Free tier

**External Services**:
- Microsoft Graph API: Included in Office 365
- Google OAuth: Free

**Estimated Cost**: $0 (within free tiers)

## Team

- **Developer**: Full-stack implementation
- **IT Support**: Firebase setup, domain configuration
- **Staff**: User acceptance testing

## Timeline

### Phase 1: Foundation
- Authentication: Complete
- User Management: Complete
- User Groups: In Progress
- Landing Page: Pending

### Phase 2: MAP Module
- UI Components: Complete
- Backend Integration: Pending
- PDF Generation: Pending
- Email Distribution: Pending

### Phase 3: Expansion
- Planning phase

---

**Document Version**: 2.0
**Last Updated**: January 2026
**Status**: Active Development
