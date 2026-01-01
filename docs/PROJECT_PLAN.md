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
- External APIs: Google Sheets API, Email Service (Nodemailer/SendGrid)

### System Components

#### 1. Data Source Layer
- **Google Sheets**: Primary data source (existing registration data)
- **Google Sheets API**: Read registration data programmatically

#### 2. Database Layer
- **Firebase Firestore**: Store approved participants
- Provides real-time sync, querying, and status tracking
- Acts as a filtered/approved subset of Google Sheets data

#### 3. Application Layer
- **Vue Admin Dashboard**: 
  - View Google Sheets data
  - Approve and sync participants to Firestore
  - Select participants for certificate generation
  - Trigger bulk email operations
  - Monitor email delivery status

#### 4. Processing Layer
- **Firebase Cloud Functions**:
  - Generate PDF certificates from template
  - Send emails with certificate attachments
  - Handle batch processing
  - Log operations

#### 5. Storage Layer
- **Firebase Storage**: Store generated PDF certificates
- Provides secure URLs for accessing certificates

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
1. Design Firestore data structure
2. Create participant list component
3. Implement "Approve" functionality
4. Sync approved participants to Firestore
5. Add filtering and search features
6. Implement participant status management
7. Create bulk approve functionality
8. Add edit participant details feature

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
1. Configure email service (Nodemailer/SendGrid)
2. Create email template with certificate attachment
3. Implement Firebase Function for sending emails
4. Add bulk email functionality
5. Implement email status tracking
6. Create email logs in Firestore
7. Add retry mechanism for failed emails
8. Build email status dashboard
9. Implement notification system

**Deliverables:**
- Certificates can be emailed to participants
- Email delivery tracked and logged
- Admin can resend failed emails

---

### Phase 5: Testing & Deployment (Week 9-10)

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
Status set as "approved"
```

### 3. Certificate Generation & Email
```
Admin selects approved participants
    ↓
Clicks "Generate & Email Certificates"
    ↓
Firebase Function triggered
    ↓
For each participant:
  - Generate PDF certificate
  - Upload to Firebase Storage
  - Send email with certificate attachment
  - Update Firestore status to "certificate_sent"
  - Log email delivery result
```

---

## Database Schema

### Firestore Collections

#### `participants` Collection
```javascript
{
  id: "auto-generated-id",
  name: "Ahmed Ali",
  partner_name: "Aminath Sara",
  email: "ahmed@example.com",
  phone: "7777777",
  id_number: "A123456",
  course_date: Timestamp,
  certificate_number: "MAP-2026-001",
  status: "approved" | "certificate_sent" | "pending" | "failed",
  certificate_url: "https://storage.firebase.com/...",
  email_sent_at: Timestamp,
  email_attempts: 0,
  created_at: Timestamp,
  updated_at: Timestamp,
  synced_from_sheets: true,
  sheet_row_number: 5
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
  last_certificate_number: 150
}
```

---

## Certificate Template Design

### Required Fields on Certificate
- Certificate Number (e.g., MAP-2026-001)
- Participant Name
- Partner Name
- Course Date
- Issue Date
- Official Seal/Logo
- Signatures (authorized persons)

### Template Format
- Size: A4 (210mm × 297mm)
- Orientation: Landscape
- Format: PDF
- Design: Professional, formal with Family Court branding

---

## Email Template

**Subject:** MAP Certificate - Marriage Awareness Program

**Body:**
```
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

## Security Considerations

1. **Authentication**: Only authorized staff can access admin dashboard
2. **Google Sheets API**: Use service account with read-only access
3. **Firestore Rules**: Restrict write access to authenticated users only
4. **Firebase Storage Rules**: Only authenticated users can read/write
5. **Email**: Use verified sender email address
6. **Environment Variables**: Store API keys securely
7. **Rate Limiting**: Prevent abuse of email sending

---

## Success Metrics

1. **Efficiency**: Reduce certificate generation time by 90%
2. **Accuracy**: Zero errors in certificate data
3. **Delivery**: 95%+ email delivery success rate
4. **User Satisfaction**: Admin staff feedback
5. **Scalability**: Handle 100+ certificates in one batch

---

## Future Enhancements

1. **SMS Notifications**: Send SMS with certificate link
2. **Participant Portal**: Let participants download certificates themselves
3. **Analytics Dashboard**: Track program statistics
4. **Certificate Verification**: Public portal to verify certificate authenticity
5. **Multi-language**: Dhivehi language support
6. **Batch Import**: Upload CSV to bulk approve participants
7. **Reminder System**: Send reminders to complete registration

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
- SendGrid: Free tier (100 emails/day) or paid plan
- Google Sheets API: Free

**Estimated Monthly Cost: $0 - $20** (depending on usage)

---

## Team & Responsibilities

- **Developer**: Build full-stack application
- **Designer**: Certificate template design (if needed)
- **Admin Staff**: User acceptance testing, feedback
- **IT Support**: Firebase setup, domain configuration

---

## Timeline Summary

- **Phase 1-2**: Foundation & Data (4 weeks)
- **Phase 3**: Certificate Generation (2 weeks)
- **Phase 4**: Email Integration (2 weeks)
- **Phase 5**: Testing & Deployment (2 weeks)

**Total Estimated Time: 10 weeks**

---

## Contact & Support

**Project Owner:** Family Court, Maldives  
**Developer:** [Your Name]  
**Start Date:** January 1, 2026  
**Target Launch:** March 15, 2026

---

*Document Version: 1.0*  
*Last Updated: January 1, 2026*
