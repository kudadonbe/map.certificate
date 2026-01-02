# MAP Certificate - Marriage Awareness Program Certificate Generator

## Project Overview

An automated certificate generation and email distribution system for the Marriage Awareness Program (MAP) held by Family Court, Maldives.

## Current Setup

The Marriage Awareness Program is currently conducted physically:

1. **Registration Process**: Couples submit registration forms via familycourt.gov.mv (WordPress website)
2. **Data Collection**: Form submissions are automatically stored in Google Sheets using a WordPress plugin
3. **Manual Certificate Process**: Certificates are currently managed manually using Word/Excel documents

## Project Goal

Automate the certificate generation and distribution process:
- Generate PDF certificates for selected/approved participants
- Email all generated certificates with one click
- Track certificate generation and email delivery status

## Solution Architecture

### Technology Stack

- **Frontend**: Vue 3 + Vite + Tailwind CSS + Pinia
- **Backend**: Firebase (Functions, Firestore, Storage, Auth)
- **Authentication**: 
  - Office 365 (Admin Staff)
  - Google OAuth (Public Users)
  - eFaas (Future - Government SSO)
- **Email Service**: Microsoft Graph API (Office 365)
- **Data Source**: Google Sheets API
- **PDF Generation**: Puppeteer/PDFKit

### Data Flow

```
Google Sheets (Registration Data)
    ↓
Firebase Firestore (Approved Participants)
    ↓
Vue Admin Dashboard (Selection & Trigger)
    ↓
Firebase Functions (PDF Generation + Email)
    ↓
Firebase Storage (PDF Storage) + Email Delivery
```

## Features

### Phase 1: Setup & Data Sync
- [ ] Vue + Vite + Firebase project initialization
- [ ] Multi-provider authentication setup
  - [ ] Office 365 / Microsoft login for admin staff
  - [ ] Google OAuth for participants
  - [ ] Role-based access control (RBAC)
- [ ] Google Sheets API integration
- [ ] Admin dashboard to view registration data
- [ ] Approve and sync participants to Firestore
- [ ] Firebase Storage setup for PDFs and assets

### Phase 2: Data Management & Verification
- [ ] Participant profile update form (bilingual: English & Dhivehi)
- [ ] Staff verification interface
- [ ] Profile update review and approval workflow
- [ ] Bilingual data validation
- [ ] Status management system

### Phase 3: Certificate Generation
- [ ] Bilingual certificate template design (HTML/CSS)
- [ ] Firebase Function for PDF generation
- [ ] Certificate preview functionality
- [ ] Store generated PDFs in Firebase Storage
- [ ] Asset management (logos, seals, signatures)

### Phase 4: Email Automation
- [ ] Microsoft Graph API integration
- [ ] Bulk certificate email functionality
- [ ] Email status tracking
- [ ] Retry mechanism for failed emails
- [ ] Email delivery logs

### Phase 5: Participant Portal
- [ ] Participant login with Google/eFaas
- [ ] Certificate status dashboard
- [ ] Download certificates from Firebase Storage
- [ ] Profile update interface
- [ ] Certificate history view
- [ ] Real-time status notifications

## Database Structure

### Firestore Collections

```javascript
participants/
  {participantId}/
    // English & Dhivehi Names
    - name: string (English)
    - name_dv: string (Dhivehi)
    - partner_name: string (English)
    - partner_name_dv: string (Dhivehi)
    
    // Contact & ID
    - email: string
    - phone: string
    - id_number: string
    - partner_id_number: string
    
    // Certificate Info
    - certificate_number: string
    - certificate_url: string (Firebase Storage link)
    
    // Status & Verification
    - status: "pending" | "profile_submitted" | "verified" | "approved" | "certificate_sent"
    - profile_verified: boolean
    - verified_by: string (admin user ID)
    
    // Timestamps
    - email_sent_at: timestamp
    - created_at: timestamp
    - updated_at: timestamp
    - user_id: string (Firebase Auth UID)

profile_updates/
  {updateId}/
    - participant_id: string
    - submitted_data: object (bilingual fields)
    - status: "pending" | "approved" | "rejected"
    - reviewed_by: string
    - review_notes: string
```

## Benefits

- ✅ **Multi-provider Authentication**: Secure login for staff (Office 365) and participants (Google/eFaas)
- ✅ **Role-based Access Control**: Separate admin and participant portals
- ✅ **Participant Self-Service**: Users can view, download certificates, and update profiles
- ✅ **Bilingual Support**: English & Dhivehi names on certificates
- ✅ **Staff Verification**: Two-step verification process for data accuracy
- ✅ **Firebase Storage**: Secure PDF storage with role-based access
- ✅ Modern, professional admin interface
- ✅ Real-time status updates and notifications
- ✅ Scalable and secure (Firebase)
- ✅ Mobile-responsive dashboard
- ✅ Audit trail for certificate generation
- ✅ Reduced manual work (90% time savings)
- ✅ Faster certificate delivery
- ✅ Zero additional costs (uses existing subscriptions)

## Getting Started

### Prerequisites

- Node.js (v18+)
- Firebase account
- Google Cloud Project (for Sheets API)
- Office 365 account with admin access (for Azure AD app registration)
- Microsoft Graph API credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/map.certificate.git

# Install dependencies
npm install

# Configure Firebase
firebase login
firebase init

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run development server
npm run dev
```

### Firebase Setup

1. Create a Firebase project
2. Enable Firestore Database
3. Enable Firebase Storage
4. Enable Firebase Authentication (Google & Microsoft providers)
5. Deploy Firebase Functions
6. Configure Google Sheets API credentials

### Office 365 / Azure AD Setup

1. Register application in Azure AD (Azure Portal)
2. Grant API permissions: `Mail.Send`, `Mail.ReadWrite`
3. Create client secret
4. Configure service account email: certificates@familycourt.gov.mv
5. Add credentials to Firebase Functions environment variables

## Project Structure

```
map.certificate/
├── src/                          # Vue application
│   ├── components/
│   │   ├── ParticipantList.vue
│   │   ├── CertificatePreview.vue
│   │   ├── EmailStatus.vue
│   │   ├── ProfileUpdateForm.vue
│   │   └── VerificationPanel.vue
│   ├── stores/                   # Pinia stores
│   │   ├── participants.js
│   │   ├── auth.js
│   │   └── profileUpdates.js
│   ├── views/
│   │   ├── admin/
│   │   │   ├── Dashboard.vue
│   │   │   ├── VerificationQueue.vue
│   │   │   └── CertificateManagement.vue
│   │   ├── participant/
│   │   │   ├── Portal.vue
│   │   │   ├── CertificateView.vue
│   │   │   └── ProfileEdit.vue
│   │   └── Login.vue
│   ├── composables/
│   │   ├── useFirebase.js
│   │   └── useStorage.js
│   └── main.js
├── functions/                    # Firebase Functions
│   ├── index.js
│   ├── certificateGenerator.js
│   ├── emailSender.js
│   ├── sheetsSync.js
│   └── profileVerification.js
├── storage/                      # Firebase Storage structure
│   ├── certificates/
│   │   └── {year}/{month}/
│   ├── templates/
│   └── assets/
│       ├── logo.png
│       ├── seal.png
│       └── signature.png
├── public/
│   └── certificate-template.html
├── docs/                         # Documentation
│   ├── PROJECT_PLAN.md
│   └── (existing certificate files)
└── firebase.json
```

## License

MIT

## Contact

Family Court, Maldives
Email: info@familycourt.gov.mv
