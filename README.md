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
- **Data Source**: Google Sheets API
- **PDF Generation**: Puppeteer/PDFKit
- **Email Service**: Nodemailer/SendGrid

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
- [ ] Google Sheets API integration
- [ ] Admin dashboard to view registration data
- [ ] Approve and sync participants to Firestore
- [ ] Firebase Authentication for admin access

### Phase 2: Certificate Generation
- [ ] Certificate template design (HTML/CSS)
- [ ] Firebase Function for PDF generation
- [ ] Certificate preview functionality
- [ ] Store generated PDFs in Firebase Storage

### Phase 3: Email Automation
- [ ] Email service integration
- [ ] Bulk certificate email functionality
- [ ] Email status tracking
- [ ] Retry mechanism for failed emails
- [ ] Email delivery logs

## Database Structure

### Firestore Collections

```javascript
participants/
  {participantId}/
    - name: string
    - email: string
    - partner_name: string
    - course_date: timestamp
    - certificate_number: string
    - status: "approved" | "certificate_sent" | "pending"
    - certificate_url: string (Firebase Storage link)
    - email_sent_at: timestamp
    - created_at: timestamp
    - updated_at: timestamp
```

## Benefits

- ✅ Modern, professional admin interface
- ✅ Real-time status updates
- ✅ Scalable and secure (Firebase)
- ✅ Mobile-responsive dashboard
- ✅ Audit trail for certificate generation
- ✅ Reduced manual work
- ✅ Faster certificate delivery

## Getting Started

### Prerequisites

- Node.js (v18+)
- Firebase account
- Google Cloud Project (for Sheets API)
- Gmail/SendGrid account for email delivery

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
4. Enable Firebase Authentication
5. Deploy Firebase Functions
6. Configure Google Sheets API credentials

## Project Structure

```
map.certificate/
├── src/                          # Vue application
│   ├── components/
│   │   ├── ParticipantList.vue
│   │   ├── CertificatePreview.vue
│   │   └── EmailStatus.vue
│   ├── stores/                   # Pinia stores
│   │   ├── participants.js
│   │   └── auth.js
│   ├── views/
│   │   ├── Dashboard.vue
│   │   └── Login.vue
│   ├── composables/
│   │   └── useFirebase.js
│   └── main.js
├── functions/                    # Firebase Functions
│   ├── index.js
│   ├── certificateGenerator.js
│   ├── emailSender.js
│   └── sheetsSync.js
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
