# Office 365 Quick Start Guide

Quick reference for setting up Microsoft/Office 365 authentication.

## TL;DR - What You Need

1. **Azure AD Application (client) ID** - From Azure Portal
2. **Azure AD Client Secret** - From Azure Portal
3. **Add them to Firebase Console** - Authentication > Microsoft provider

## 5-Minute Setup

### Step 1: Azure Portal (2 minutes)

```
https://portal.azure.com
→ Azure Active Directory
→ App registrations
→ + New registration

Name: MAP Certificate
Redirect URI: https://map-certificate.firebaseapp.com/__/auth/handler

→ Copy "Application (client) ID"
→ Certificates & secrets → + New client secret
→ Copy the secret VALUE (you won't see it again!)
```

### Step 2: Firebase Console (1 minute)

```
https://console.firebase.google.com
→ map-certificate project
→ Authentication → Sign-in method
→ Microsoft → Enable

Paste:
- Application (client) ID
- Application (client) secret

→ Save
```

### Step 3: Add Admin Emails (2 minutes)

```
Firebase Console
→ Firestore Database
→ settings collection
→ admin_whitelist document

Add structure:
{
  "emails": [
    "youremail@familycourt.gov.mv"
  ]
}
```

### Step 4: Test

```bash
npm run dev

# Go to http://localhost:5173/login
# Click "Admin" → "Sign in with Office 365"
# Login with your work account
```

## Credentials Template

Save this information securely:

```
PROJECT: MAP Certificate

AZURE AD APP REGISTRATION
-------------------------
Application Name: MAP Certificate Authentication
Application (client) ID: ________________________________
Directory (tenant) ID: ________________________________
Client Secret: ________________________________
Client Secret Expires: ________________________________

REDIRECT URIS
-------------------------
Development: http://localhost:5173/__/auth/handler
Production: https://map-certificate.firebaseapp.com/__/auth/handler
Custom Domain: https://yourdomain.com/__/auth/handler

ADMIN WHITELIST
-------------------------
1. admin@familycourt.gov.mv
2. _______________________________
3. _______________________________
```

## Tenant Configuration

### Current Setting (firebase.ts)

```typescript
tenant: 'common'  // Allows any Microsoft account
```

### Options

1. **'common'** - Any Microsoft account (work, school, personal)
2. **'organizations'** - Any organizational account only (no personal)
3. **'consumers'** - Personal Microsoft accounts only
4. **'your-tenant-id'** - Specific organization only (most secure)

### To Restrict to Family Court Only

Edit `src/firebase.ts`:

```typescript
export const microsoftProvider = new OAuthProvider('microsoft.com');
microsoftProvider.setCustomParameters({
  tenant: 'your-tenant-id-here',  // Replace with Family Court tenant ID
  prompt: 'select_account',
});
```

Get your tenant ID from Azure Portal → Azure Active Directory → Overview.

## Common Issues

| Issue | Solution |
|-------|----------|
| "Configuration not found" | Enable Microsoft in Firebase Console |
| "Email not authorized" | Add email to Firestore whitelist (lowercase) |
| "Redirect URI mismatch" | Check Azure AD redirect URI matches Firebase |
| Popup blocked | Allow popups for localhost or wait for redirect |

## Testing Checklist

- [ ] Azure app created with client ID and secret
- [ ] Microsoft provider enabled in Firebase
- [ ] Admin email added to Firestore whitelist
- [ ] Login tested successfully
- [ ] User created in Firestore with admin role
- [ ] Admin dashboard accessible

## Next Steps

After basic setup works:

1. **Add all admin emails** to whitelist
2. **Restrict tenant** to Family Court only (optional)
3. **Set up production** redirect URIs
4. **Configure Firestore rules** to protect whitelist
5. **Set reminder** for client secret expiration

## Full Documentation

See `OFFICE365_SETUP.md` for complete step-by-step guide with screenshots and troubleshooting.
