# MAP Certificate Generator - Project Plan

## Project Background

### Current Situation

**Marriage Awareness Program (MAP)** is a physical program conducted by the Family Court of Maldives for couples.

**Current Registration Flow:**
1. Couples visit familycourt.gov.mv (WordPress website)
2. Fill out registration form
3. Form data automatically saved to Google Sheets via WordPress plugin
4. Certificates are manually created using Word/Excel templates

### Problem Statement

The current certificate generation and distribution process is:
- Manual and time-consuming
- Prone to human error
- Difficult to track who has received certificates
- Not scalable for large batches
- Delays in certificate delivery to participants

### Project Objective

Build an automated web application to:
1. **Generate PDF certificates** for approved participants
2. **Email certificates automatically** with one click
3. **Track certificate status** (generated, sent, failed)
4. **Reduce manual work** for administrative staff

---

## Solution Design

### Architecture Overview

**Technology Stack:**
- Frontend: Vue 3, Vite, Tailwind CSS, Pinia
- Backend: Firebase (Functions, Firestore, Storage, Authentication)
- Authentication: Office 365 (Admin Staff), Google OAuth (Public), eFaas (Public - Future)
- Email Service: Microsoft Graph API (Office 365)
- External APIs: Google Sheets API

### System Components

#### 1. Data Source Layer
- **Google Sheets**: Primary data source (existing registration data)
- **Google Sheets API**: Read registration data programmatically

#### 2. Database Layer
- **Firebase Firestore**: Store approved participants
- Provides real-time sync, querying, and status tracking
- Acts as a filtered/approved subset of Google Sheets data

#### 3. Application Layer

**Admin Dashboard (Family Court Staff)**:
- View Google Sheets registration data
- Verify user-submitted profile updates
- Approve/reject participants
- Review and validate bilingual data (English & Dhivehi)
- Select participants for certificate generation
- Trigger bulk email operations
- Monitor email delivery status
- Manage system settings

**Participant Portal (Public Users)**:
- Login with Google/eFaas authentication
- View certificate status (pending, approved, issued)
- Download issued certificates (PDF)
- Update personal profile information
- Submit bilingual data (English & Dhivehi names)
- Track profile verification status
- View certificate history

#### 4. Processing Layer
- **Firebase Cloud Functions**:
  - Generate PDF certificates from template
  - Send emails with certificate attachments
  - Handle batch processing
  - Log operations

#### 5. Storage Layer
- **Firebase Storage**: 
  - Store generated PDF certificates
  - Store certificate templates and assets (logos, signatures, backgrounds)
  - Store user profile documents (if needed)
  - Organize by folders: `/certificates/{year}/{month}/`, `/assets/`, `/templates/`
  - Secure access with Firebase Storage Rules
  - Provide secure download URLs for participants

---

## Implementation Plan

### Phase 1: Foundation (Week 1-2)

**Goals:**
- Set up development environment
- Create project structure
- Implement authentication
- Connect to Google Sheets

**Tasks:**
1. Initialize Vite + Vue 3 project
2. Configure Tailwind CSS
3. Set up Pinia store management
4. Initialize Firebase project
5. Configure Firebase Authentication
6. Create login page and auth flow
7. Set up Google Sheets API credentials
8. Create service to read Google Sheets data
9. Build basic admin dashboard layout

**Deliverables:**
- Working Vue app with authentication
- Admin can view Google Sheets data in dashboard

---

### Phase 2: Data Management (Week 3-4)

**Goals:**
- Sync data from Google Sheets to Firestore
- Manage participant approval workflow

**Tasks:**
1. Design Firestore data structure (with bilingual fields)
2. Create participant list component
3. Implement "Approve" and "Verify" functionality
4. Sync approved participants to Firestore
5. Add filtering and search features
6. Implement participant status management (pending, verified, approved, rejected)
7. Create bulk approve functionality
8. Build profile verification interface for staff
9. Add bilingual data validation (English & Dhivehi)
10. Implement data review and edit features

**Deliverables:**
- Approved participants stored in Firestore
- Admin can manage participant data

---

### Phase 3: Certificate Generation (Week 5-6)

**Goals:**
- Design certificate template
- Generate PDF certificates

**Tasks:**
1. Design certificate HTML/CSS template
2. Add certificate preview component
3. Set up Firebase Functions project
4. Implement PDF generation function (using Puppeteer or PDFKit)
5. Store generated PDFs in Firebase Storage
6. Create certificate download feature
7. Add certificate number generation logic
8. Test PDF generation with various data

**Deliverables:**
- Certificate template designed
- PDFs can be generated and stored
- Admin can preview and download certificates

---

### Phase 4: Email Integration (Week 7-8)

**Goals:**
- Send certificates via email
- Track email delivery status

**Tasks:**
1. Configure Microsoft Graph API for Office 365 email
2. Register application in Azure AD (Family Court tenant)
3. Configure Mail.Send permissions
4. Create email template with certificate attachment
5. Implement Firebase Function for sending emails via Microsoft Graph
6. Add bulk email functionality
7. Implement email status tracking
8. Create email logs in Firestore
9. Add retry mechanism for failed emails
10. Build email status dashboard
11. Implement notification system

**Deliverables:**
- Certificates can be emailed to participants
- Email delivery tracked and logged
- Admin can resend failed emails

---

### Phase 4.5: Participant Portal (Week 8-9)

**Goals:**
- Build participant self-service portal
- Allow profile updates and certificate downloads
- Implement verification workflow

**Tasks:**
1. Create participant authentication (Google/eFaas)
2. Build participant dashboard UI
3. Implement certificate viewer with download
4. Create profile update form (bilingual: English & Dhivehi)
5. Add profile verification status display
6. Build certificate status tracker
7. Implement real-time notifications
8. Add certificate history view
9. Create user-friendly error messages
10. Test participant user experience

**Deliverables:**
- Working participant portal
- Users can login, view, and download certificates
- Users can update and submit profile information
- Staff can verify submitted data

---

### Phase 5: Testing & Deployment (Week 10-11)

**Goals:**
- Test entire system
- Deploy to production

**Tasks:**
1. Write unit tests for critical functions
2. Test with real data from Google Sheets
3. Perform user acceptance testing
4. Fix bugs and optimize performance
5. Set up Firebase hosting
6. Configure custom domain (if needed)
7. Set up monitoring and error tracking
8. Create user documentation
9. Train administrative staff
10. Deploy to production

**Deliverables:**
- Fully tested application
- Production deployment
- User documentation
- Trained staff

---

## Data Flow Details

### 1. Registration to Google Sheets
```
User fills form on familycourt.gov.mv
    ↓
WordPress plugin captures data
    ↓
Data saved to Google Sheets
```

### 2. Sync to Firestore
```
Admin logs into dashboard
    ↓
Dashboard fetches Google Sheets data
    ↓
Admin selects participants to approve
    ↓
Approved participants synced to Firestore
    ↓
Status set as "pending" (awaiting profile completion)
```

### 3. Participant Profile Update
```
Participant logs in (Google/eFaas)
    ↓
View certificate status: "Profile Incomplete"
    ↓
Update profile form:
  - Name (English & Dhivehi)
  - Partner name (English & Dhivehi)
  - ID numbers
    ↓
Submit profile update
    ↓
Create record in profile_updates collection
    ↓
Status changed to "profile_submitted"
    ↓
Notification sent to FC staff
```

### 4. Staff Verification
```
FC Staff views pending profile updates
    ↓
Review submitted information:
  - Verify English names
  - Verify Dhivehi names
  - Verify ID numbers
  - Check data accuracy
    ↓
Approve or Reject with notes
    ↓
If approved:
  - Update participant record in Firestore
  - Status changed to "verified"
  - Notify participant
If rejected:
  - Send rejection reason
  - Request corrections
```

### 5. Certificate Generation & Email
```
Admin selects verified participants
    ↓
Clicks "Generate & Email Certificates"
    ↓
Firebase Function triggered
    ↓
For each participant:
  - Generate bilingual PDF certificate (English & Dhivehi)
  - Upload to Firebase Storage (/certificates/2026/01/MAP-2026-001.pdf)
  - Send email with certificate attachment via Microsoft Graph
  - Update Firestore status to "certificate_sent"
  - Update certificate_url field
  - Log email delivery result
    ↓
Participant receives email notification
```

### 6. Participant Certificate Download
```
Participant logs into portal
    ↓
Views certificate status: "Certificate Issued"
    ↓
Clicks "Download Certificate"
    ↓
Firebase Storage generates secure download URL
    ↓
PDF downloaded from Firebase Storage
    ↓
Download logged in participant record
```

---

## Database Schema

### Firestore Collections

#### `participants` Collection
```javascript
{
  id: "auto-generated-id",
  
  // English Information
  name: "Ahmed Ali",
  partner_name: "Aminath Sara",
  
  // Dhivehi Information (User-submitted)
  name_dv: "އަހްމަދު އަލީ",
  partner_name_dv: "އާމިނަތު ސާރާ",
  
  // Contact Information
  email: "ahmed@example.com",
  phone: "7777777",
  id_number: "A123456",
  partner_id_number: "A654321",
  
  // Program Information
  course_date: Timestamp,
  course_completed: true,
  
  // Certificate Information
  certificate_number: "MAP-2026-001",
  certificate_url: "https://storage.firebase.com/certificates/2026/01/MAP-2026-001.pdf",
  certificate_generated_at: Timestamp,
  
  // Status Management
  status: "pending" | "profile_submitted" | "verified" | "approved" | "certificate_sent" | "rejected",
  profile_verified: false,
  verification_notes: "Pending ID verification",
  verified_by: "admin_user_id",
  verified_at: Timestamp,
  
  // Email Tracking
  email_sent_at: Timestamp,
  email_attempts: 0,
  email_status: "pending" | "sent" | "failed",
  
  // User Profile Management
  profile_updated_at: Timestamp,
  profile_update_requested: false,
  profile_complete: false,
  
  // System Fields
  created_at: Timestamp,
  updated_at: Timestamp,
  synced_from_sheets: true,
  sheet_row_number: 5,
  user_id: "firebase_auth_uid" // Link to authenticated user
}
```

#### `email_logs` Collection
```javascript
{
  id: "auto-generated-id",
  participant_id: "reference-to-participant",
  email: "ahmed@example.com",
  status: "sent" | "failed" | "pending",
  error_message: "...",
  sent_at: Timestamp,
  certificate_url: "...",
  attempts: 1
}
```

#### `settings` Collection
```javascript
{
  id: "config",
  google_sheet_id: "...",
  sheet_name: "Registrations",
  certificate_prefix: "MAP",
  email_from: "certificates@familycourt.gov.mv",
  email_subject: "MAP Certificate - Marriage Awareness Program",
  last_certificate_number: 150,
  storage_paths: {
    certificates: "/certificates/{year}/{month}/",
    templates: "/templates/",
    assets: "/assets/"
  }
}
```

#### `profile_updates` Collection
```javascript
{
  id: "auto-generated-id",
  participant_id: "reference-to-participant",
  user_id: "firebase_auth_uid",
  
  // Submitted Data
  name: "Ahmed Ali",
  name_dv: "އަހްމަދު އަލީ",
  partner_name: "Aminath Sara",
  partner_name_dv: "އާމިނަތު ސާރާ",
  id_number: "A123456",
  partner_id_number: "A654321",
  
  // Status
  status: "pending" | "approved" | "rejected",
  submitted_at: Timestamp,
  reviewed_by: "admin_user_id",
  reviewed_at: Timestamp,
  review_notes: "ID number verified",
  
  // Changes tracking
  changes: {
    field_name: { old: "old_value", new: "new_value" }
  }
}
```

---

## Certificate Template Design

### Required Fields on Certificate

**English Section:**
- Certificate Number (e.g., MAP-2026-001)
- Participant Name (English)
- Partner Name (English)
- Course Date
- Issue Date
- Official Seal/Logo
- Signatures (authorized persons)

**Dhivehi Section:**
- Participant Name (Dhivehi - ދިވެހި)
- Partner Name (Dhivehi - ދިވެހި)
- Course completion text in Dhivehi

### Template Format
- Size: A4 (210mm × 297mm)
- Orientation: Landscape
- Format: PDF
- Design: Professional, formal with Family Court branding
- Language: Bilingual (English & Dhivehi)
- Assets stored in Firebase Storage: `/assets/logo.png`, `/assets/seal.png`, `/assets/signature.png`

---

## Email Configuration

### Email Service: Microsoft Graph API (Office 365)

The system uses the organization's Office 365 email service via Microsoft Graph API for sending certificates.

**Benefits:**
- ✅ Official Family Court email address as sender
- ✅ Better email deliverability (trusted domain)
- ✅ No additional email service costs
- ✅ Unified with Office 365 authentication
- ✅ Professional appearance
- ✅ Email tracking in Office 365 admin center
- ✅ Compliance with organizational email policies

### Azure AD App Registration Setup

**Prerequisites:**
1. Azure AD admin access for Family Court tenant
2. Office 365 mailbox: certificates@familycourt.gov.mv (or similar)

**Configuration Steps:**
1. Register app in Azure AD (Azure Portal)
2. Grant API Permissions:
   - `Mail.Send` - Send mail as any user
   - `Mail.ReadWrite` - Read and write mail (optional, for tracking)
3. Create client secret or certificate
4. Note: Application (Client) ID and Tenant ID
5. Configure Firebase Functions with credentials

### Implementation

```javascript
// Firebase Function - Send Email via Microsoft Graph API
const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');

// Initialize Graph client
const credential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID,
  process.env.AZURE_CLIENT_ID,
  process.env.AZURE_CLIENT_SECRET
);

const graphClient = Client.initWithMiddleware({
  authProvider: {
    getAccessToken: async () => {
      const token = await credential.getToken('https://graph.microsoft.com/.default');
      return token.token;
    }
  }
});

// Send email with certificate
await graphClient
  .api('/users/certificates@familycourt.gov.mv/sendMail')
  .post({
    message: {
      subject: 'MAP Certificate - Marriage Awareness Program',
      body: {
        contentType: 'HTML',
        content: emailBodyHTML
      },
      toRecipients: [
        { emailAddress: { address: participant.email, name: participant.name } }
      ],
      attachments: [
        {
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: 'MAP_Certificate.pdf',
          contentType: 'application/pdf',
          contentBytes: certificatePDFBase64
        }
      ]
    },
    saveToSentItems: true
  });
```

---

## Email Template

**From:** certificates@familycourt.gov.mv  
**Subject:** MAP Certificate - Marriage Awareness Program

**Body:**
```html
Dear [Participant Name] and [Partner Name],

Congratulations on successfully completing the Marriage Awareness Program!

Please find attached your official certificate of completion.

Certificate Number: [Certificate Number]
Course Date: [Course Date]
Issue Date: [Today's Date]

If you have any questions, please contact us at:
Email: info@familycourt.gov.mv
Phone: +960 xxx-xxxx

Best regards,
Family Court, Maldives
```

---

## Authentication & Authorization

### Multi-Provider Authentication Strategy

The system implements role-based authentication with different providers for different user types:

#### 1. Administrative Staff (Family Court Staff)
- **Provider**: Office 365 / Microsoft Azure AD
- **Access Level**: Full admin access
- **Permissions**:
  - View all registration data from Google Sheets
  - Approve/reject participants
  - Generate certificates
  - Send bulk emails
  - Manage system settings
  - View logs and analytics
- **Implementation**: Firebase Authentication with Microsoft provider

#### 2. Public Users (Participants)
- **Phase 1 - Google OAuth**:
  - **Provider**: Google Sign-In
  - **Access Level**: Participant portal (view-only)
  - **Permissions**:
    - View own certificate status
    - Download own certificate
    - Update contact information
  - **Implementation**: Firebase Authentication with Google provider

- **Phase 2 - eFaas Integration** (Future Enhancement):
  - **Provider**: eFaas (Maldives Government SSO)
  - **Access Level**: Participant portal (view-only)
  - **Permissions**: Same as Google OAuth
  - **Implementation**: Custom Firebase Auth with eFaas API integration
  - **Benefits**: Unified government identity, better verification

### User Roles & Access Control

```javascript
// Firestore user document structure
users/
  {userId}/
    - email: string
    - name: string
    - role: "admin" | "participant"
    - provider: "microsoft" | "google" | "efaas"
    - organization: "family_court" (for admins only)
    - verified: boolean
    - created_at: timestamp
    - last_login: timestamp
```

### Authentication Flow

#### Admin Login Flow:
```
1. User clicks "Staff Login"
2. Redirected to Microsoft/Office 365 login
3. Authenticate with Family Court credentials
4. Firebase verifies token and checks domain (@familycourt.gov.mv)
5. Assign "admin" role if domain matches
6. Redirect to admin dashboard
```

#### Participant Login Flow:
```
1. User clicks "Participant Login"
2. Choose provider: Google or eFaas (future)
3. Authenticate with chosen provider
4. Firebase verifies token
5. Check if email exists in participants database
6. Assign "participant" role
7. Redirect to participant portal
```

### Firebase Security Rules

```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Participants collection - Admin full access, Participants read own only
    match /participants/{participantId} {
      allow read, write: if request.auth != null && 
                          request.auth.token.role == 'admin';
      allow read: if request.auth != null && 
                     request.auth.token.role == 'participant' &&
                     request.auth.token.email == resource.data.email;
    }
    
    // Settings - Admin only
    match /settings/{document=**} {
      allow read, write: if request.auth != null && 
                          request.auth.token.role == 'admin';
    }
    
    // Email logs - Admin only
    match /email_logs/{document=**} {
      allow read, write: if request.auth != null && 
                          request.auth.token.role == 'admin';
    }
    
    // Profile updates - Participants can create/read own, Admin can read/write all
    match /profile_updates/{updateId} {
      allow create: if request.auth != null && 
                       request.auth.token.role == 'participant';
      allow read: if request.auth != null && 
                     (request.auth.token.role == 'admin' ||
                      request.auth.uid == resource.data.user_id);
      allow write: if request.auth != null && 
                      request.auth.token.role == 'admin';
    }
  }
}

// Firebase Storage Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Certificates - Participants can read own, Admin can read/write all
    match /certificates/{year}/{month}/{filename} {
      allow read: if request.auth != null && 
                     (request.auth.token.role == 'admin' ||
                      isOwner(filename));
      allow write: if request.auth != null && 
                      request.auth.token.role == 'admin';
    }
    
    // Templates and Assets - Admin only write, Public read
    match /templates/{filename} {
      allow read: if true; // Public read for certificate generation
      allow write: if request.auth != null && 
                      request.auth.token.role == 'admin';
    }
    
    match /assets/{filename} {
      allow read: if true; // Public read for logos, seals
      allow write: if request.auth != null && 
                      request.auth.token.role == 'admin';
    }
    
    // Helper function to check if user owns the certificate
    function isOwner(filename) {
      let participantData = firestore.get(/databases/(default)/documents/participants/$(request.auth.uid));
      return filename.matches(participantData.data.certificate_number + '.*');
    }
  }
}
```

---

## Security Considerations

1. **Multi-Provider Authentication**: 
   - Office 365 for administrative staff (domain-restricted)
   - Google OAuth for public participants
   - eFaas SSO for future government integration
2. **Role-Based Access Control (RBAC)**: Firestore rules enforce role-based permissions
3. **Domain Restriction**: Only @familycourt.gov.mv emails get admin access
4. **Google Sheets API**: Use service account with read-only access
5. **Firestore Rules**: Strict rules based on user roles and email verification
6. **Firebase Storage Rules**: 
   - Role-based access to certificate files
   - Participants can only download their own certificates
   - Admin can manage all files
   - Public read access for templates and assets (for certificate generation)
7. **Email**: Use verified sender email address (certificates@familycourt.gov.mv)
8. **Environment Variables**: Store API keys and secrets securely in Firebase Functions config
9. **Rate Limiting**: Prevent abuse of email sending and API calls
10. **Audit Logs**: Track all admin actions and certificate generations
11. **Data Validation**: Validate bilingual input (English & Dhivehi) before saving
12. **Profile Verification**: Two-step verification (user submission + staff approval)

---

## Success Metrics

1. **Efficiency**: Reduce certificate generation time by 90%
2. **Accuracy**: Zero errors in certificate data
3. **Delivery**: 95%+ email delivery success rate
4. **User Satisfaction**: Admin staff feedback
5. **Scalability**: Handle 100+ certificates in one batch

---

## Future Enhancements

### Completed in Initial Release
1. ✅ **Participant Portal**: Self-service portal for participants to view and download certificates
2. ✅ **Google OAuth Integration**: Participants can login and access their certificates
3. ✅ **Profile Management**: Users can update bilingual personal information
4. ✅ **Staff Verification**: FC staff verify user-submitted data
5. ✅ **Bilingual Certificates**: English & Dhivehi support on certificates
6. ✅ **Firebase Storage**: PDF storage and asset management

### Phase 2 Enhancements
7. **Certificate Verification**: Public portal to verify certificate authenticity via QR code
8. **eFaas Integration**: Maldives Government SSO for participant authentication
9. **SMS Notifications**: Send SMS with certificate link using local SMS gateway
10. **Analytics Dashboard**: Track program statistics, participation rates, and trends
11. **Push Notifications**: Real-time notifications for certificate status updates

### Phase 3 Enhancements
12. **Batch Import**: Upload CSV to bulk approve participants
13. **Advanced Reporting**: Generate reports on certificate issuance, email delivery rates
14. **Reminder System**: Automated reminders for incomplete profile updates
15. **Certificate Templates**: Multiple certificate designs for different program types
16. **Digital Signatures**: Integrate digital signatures for certificate authenticity
17. **API Integration**: REST API for integration with other Family Court systems
18. **Mobile App**: Native mobile app for certificate access

---

## Risk Management

| Risk | Impact | Mitigation |
|------|--------|------------|
| Google Sheets API quota limits | High | Cache data, optimize API calls |
| Email delivery failures | Medium | Retry mechanism, use reliable service |
| PDF generation timeouts | Medium | Optimize template, use efficient library |
| Data sync issues | High | Add validation, error logging |
| Authentication vulnerabilities | High | Use Firebase Auth, implement proper rules |

---

## Budget Estimate

### Firebase Costs (Monthly)
- Firestore: Free tier (up to 1GB)
- Storage: Free tier (up to 5GB)
- Functions: Free tier (2M invocations)
- Hosting: Free tier

### External Services
- Microsoft Graph API (Office 365): Included in existing Office 365 subscription (no additional cost)
- Google Sheets API: Free
- Azure AD App Registration: Free

**Estimated Monthly Cost: $0** (all services covered by existing subscriptions)

### Cost Savings
- ✅ No SendGrid or email service costs
- ✅ Uses existing Office 365 subscription
- ✅ Firebase free tier sufficient for initial deployment
- ✅ Scalable within organizational budget

---

## Team & Responsibilities

- **Developer**: Build full-stack application
- **Designer**: Certificate template design (if needed)
- **Admin Staff**: User acceptance testing, feedback
- **IT Support**: Firebase setup, domain configuration

---

## Timeline Summary

- **Phase 1-2**: Foundation & Data Management (4 weeks)
- **Phase 3**: Certificate Generation (2 weeks)
- **Phase 4**: Email Integration (2 weeks)
- **Phase 4.5**: Participant Portal (2 weeks)
- **Phase 5**: Testing & Deployment (2 weeks)

**Total Estimated Time: 12 weeks**

---

## Contact & Support

**Project Owner:** Family Court, Maldives  
**Developer:** [Your Name]  
**Start Date:** January 1, 2026  
**Target Launch:** March 15, 2026

---

*Document Version: 1.3*  
*Last Updated: January 2, 2026*
