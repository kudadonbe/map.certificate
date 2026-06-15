# MAP Module - Marriage Awareness Program Certificate System

## Overview

The MAP (Marriage Awareness Program) module is the first application within the AQD ecosystem. It automates certificate generation and distribution for the Marriage Awareness Program conducted by Family Court, Maldives.

## Features

### Certificate Template System
- Visual template editor with live preview
- Dual view modes: A4 print and mobile
- Customizable backgrounds, borders, colors
- Multiple signatures with signatory details
- Multiple stamps/seals with opacity control
- Bilingual support (English & Dhivehi)

### Participant Management
- Track program participants
- Bilingual data (name/name_dv, partner_name/partner_name_dv)
- Status workflow management
- Profile verification by staff

### Certificate Generation
- Bulk PDF generation via Firebase Functions
- Secure storage in Firebase Storage
- Certificate numbering system
- Download access for participants

### Email Distribution
- Automated email via Microsoft Graph API
- Bulk sending capability
- Delivery tracking and logging
- Retry mechanism for failures

## Data Flow

### Registration to Firestore

```
WordPress Form (familycourt.gov.mv)
    ↓
Google Sheets (via plugin)
    ↓
Admin Dashboard (sync action)
    ↓
Firestore participants collection
```

### Participant Profile Update

```
Participant logs in (Google)
    ↓
Updates profile (English + Dhivehi names)
    ↓
Creates profile_updates record
    ↓
Staff reviews and verifies
    ↓
Updates participant record
    ↓
Status: "verified"
```

### Certificate Generation & Delivery

```
Staff selects verified participants
    ↓
Triggers bulk generation
    ↓
Firebase Function:
  - Loads default template
  - Renders PDF for each participant
  - Uploads to Storage
  - Sends email via Microsoft Graph
    ↓
Updates participant status: "certificate_sent"
```

## Database Structure

### participants collection

```javascript
participants/{id}
{
  // English Names
  name: string,
  partner_name: string,

  // Dhivehi Names
  name_dv: string,
  partner_name_dv: string,

  // Contact
  email: string,
  phone: string,

  // IDs
  id_number: string,
  partner_id_number: string,

  // Certificate
  certificate_number: string,      // e.g., "MAP-2026-001"
  certificate_url: string,          // Firebase Storage URL
  certificate_generated_at: timestamp,

  // Status
  status: "pending" | "profile_submitted" | "verified" | "approved" | "certificate_sent",
  profile_verified: boolean,
  verified_by: string,              // staff user ID
  verified_at: timestamp,

  // Email
  email_sent_at: timestamp,
  email_status: "pending" | "sent" | "failed",

  // System
  created_at: timestamp,
  updated_at: timestamp,
  user_id: string                   // Firebase Auth UID
}
```

### profile_updates collection

```javascript
profile_updates/{id}
{
  participant_id: string,
  user_id: string,

  // Submitted Data
  name: string,
  name_dv: string,
  partner_name: string,
  partner_name_dv: string,
  id_number: string,
  partner_id_number: string,

  // Review
  status: "pending" | "approved" | "rejected",
  submitted_at: timestamp,
  reviewed_by: string,
  reviewed_at: timestamp,
  review_notes: string
}
```

### certificate_templates collection

```javascript
certificate_templates/{id}
{
  name: string,
  description: string,
  isDefault: boolean,
  isActive: boolean,
  version: number,

  // Page Settings
  size: "A4" | "Letter",
  orientation: "portrait" | "landscape",

  // Design
  background: {
    type: "color" | "gradient" | "image",
    value: string
  },
  border: {
    width: number,
    color: string,
    style: string
  },
  theme: {
    primary: string,
    secondary: string,
    accent: string,
    text: string
  },

  // Elements
  textElements: TextElement[],
  signatures: SignatureElement[],
  stamps: StampElement[],

  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: string
}
```

### email_logs collection

```javascript
email_logs/{id}
{
  participant_id: string,
  email: string,
  certificate_url: string,

  status: "pending" | "sent" | "failed",
  sent_at: timestamp,
  error_message: string,
  attempts: number
}
```

## Status Workflow

```
┌─────────┐    Profile     ┌──────────────────┐
│ pending │───submitted───→│ profile_submitted │
└─────────┘                └──────────────────┘
                                   │
                            Staff verifies
                                   ↓
                           ┌──────────┐
                           │ verified │
                           └──────────┘
                                   │
                            Staff approves
                                   ↓
                           ┌──────────┐
                           │ approved │
                           └──────────┘
                                   │
                          Generate & send
                                   ↓
                        ┌──────────────────┐
                        │ certificate_sent │
                        └──────────────────┘
```

## Routes

### Staff Routes (Officers)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/dashboard` | Dashboard.vue | Overview, stats, quick actions |
| `/admin/participants` | ParticipantsList.vue | Manage participants |
| `/admin/certificates` | CertificateManagement.vue | Certificate operations |
| `/admin/templates` | TemplateManager.vue | Template editor |

### Participant Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/participant/portal` | Portal.vue | View certificates, update profile |

## Components

### Admin Components

- `Dashboard.vue` - Statistics, pending approvals, recent activity
- `ParticipantsList.vue` - Table with search, filter, bulk actions
- `CertificateManagement.vue` - Generate, send, track certificates
- `TemplateManager.vue` - Create, edit, manage templates
- `TemplateEditor.vue` - Visual template editor

### Participant Components

- `Portal.vue` - Certificate status, download, profile info

## Template System

### Element Types

**Text Elements**:
- Dynamic fields: `{name}`, `{name_dv}`, `{partner_name}`, `{partner_name_dv}`, `{certificate_number}`, `{date}`
- Static text with full styling control

**Signature Elements**:
- Image upload to Firebase Storage
- Signatory name and title
- Position and size control

**Stamp Elements**:
- Official seals and watermarks
- Opacity control
- Position and size control

### Asset Storage

```
Firebase Storage:
assets/
├── signatures/
│   └── {timestamp}_{filename}
├── stamps/
│   └── {timestamp}_{filename}
├── logos/
│   └── {timestamp}_{filename}
└── backgrounds/
    └── {timestamp}_{filename}

certificates/
└── {year}/
    └── {month}/
        └── MAP-{year}-{number}.pdf
```

## Email Configuration

Uses Microsoft Graph API with Office 365:

**Sender**: certificates@familycourt.gov.mv

**Required Azure AD Permissions**:
- `Mail.Send`
- `Mail.ReadWrite` (optional, for tracking)

**Email Template**:
```
Subject: MAP Certificate - Marriage Awareness Program

Dear {name} and {partner_name},

Congratulations on completing the Marriage Awareness Program!

Please find attached your certificate of completion.

Certificate Number: {certificate_number}
Issue Date: {date}

Best regards,
Family Court, Maldives
```

## Implementation Status

### Completed
- [x] Certificate template types
- [x] Template store (CRUD operations)
- [x] Template editor UI
- [x] Template manager page
- [x] Default templates
- [x] Asset upload to Storage
- [x] Admin dashboard (static)
- [x] Participants list (static)
- [x] Participant portal (static)

### In Progress
- [ ] Firestore integration for participants
- [ ] Profile update workflow
- [ ] Staff verification interface

### Planned
- [ ] Firebase Functions for PDF generation
- [ ] Microsoft Graph email integration
- [ ] Google Sheets sync
- [ ] Certificate download
- [ ] Email delivery tracking

## Security

### Firestore Rules

```javascript
// Participants - officers can read/write, users read own
match /participants/{id} {
  allow read, write: if isOfficer();
  allow read: if request.auth.token.email == resource.data.email;
}

// Templates - officers can read/write
match /certificate_templates/{id} {
  allow read, write: if isOfficer();
}

// Profile updates - users create, officers review
match /profile_updates/{id} {
  allow create: if request.auth != null;
  allow read: if isOfficer() || request.auth.uid == resource.data.user_id;
  allow write: if isOfficer();
}
```

### Storage Rules

```javascript
// Assets - officers write, public read
match /assets/{allPaths=**} {
  allow read: if true;
  allow write: if isOfficer();
}

// Certificates - officers write, users read own
match /certificates/{year}/{month}/{filename} {
  allow read: if isOfficer() || isOwner(filename);
  allow write: if isOfficer();
}
```

## API Reference

### Template Store

```typescript
// Load all templates
await templateStore.loadTemplates()

// Create template
const id = await templateStore.createTemplate(templateData)

// Update template
await templateStore.updateTemplate(id, updates)

// Delete template
await templateStore.deleteTemplate(id)

// Set default
await templateStore.setDefaultTemplate(id)

// Duplicate
await templateStore.duplicateTemplate(id, newName)

// Upload asset
const url = await templateStore.uploadAsset(file, 'signature')
```

### Participant Store (Planned)

```typescript
// Load participants
await participantStore.loadParticipants(filters)

// Update status
await participantStore.updateStatus(id, newStatus)

// Verify profile
await participantStore.verifyProfile(id, notes)

// Generate certificate
await participantStore.generateCertificate(id)

// Send certificate email
await participantStore.sendCertificateEmail(id)
```

## Related Documentation

- [Template Customization](TEMPLATE_CUSTOMIZATION.md) - Full template editor guide
- [Template Quick Start](TEMPLATE_QUICK_START.md) - Getting started with templates
- [Firebase Setup](FIREBASE_SETUP.md) - Firebase configuration
