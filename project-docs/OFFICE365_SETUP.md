# Office 365 Authentication Setup Guide

This guide walks you through setting up Office 365 (Microsoft) authentication for admin users in the MAP Certificate application.

## Overview

Office 365 authentication is used for admin access with email whitelist validation. The flow is:

1. User clicks "Sign in with Office 365"
2. Redirected to Microsoft login
3. After successful login, checks if email is in admin whitelist
4. If whitelisted, creates user with `['admin', 'public']` roles

## Prerequisites

- Access to Azure Portal (portal.azure.com)
- Admin rights to create App Registrations
- Access to Firebase Console
- Family Court Office 365 tenant (or Azure AD)

## Step 1: Create Azure AD App Registration

### 1.1 Go to Azure Portal

1. Navigate to https://portal.azure.com
2. Sign in with your Office 365 admin account
3. Search for **"Azure Active Directory"** in the search bar
4. Click on **"App registrations"** in the left menu

### 1.2 Register New Application

1. Click **"+ New registration"**
2. Fill in the details:
   - **Name**: `MAP Certificate Authentication`
   - **Supported account types**: Choose one:
     - "Accounts in this organizational directory only" (Single tenant - Family Court only)
     - "Accounts in any organizational directory" (Multi-tenant - any organization)
   - **Redirect URI**: Select "Web" and enter:
     ```
     https://map-certificate.firebaseapp.com/__/auth/handler
     ```
3. Click **"Register"**

### 1.3 Get Application Credentials

After registration, you'll see the app overview page. **Copy these values**:

1. **Application (client) ID**: Copy this (e.g., `12345678-1234-1234-1234-123456789abc`)
2. **Directory (tenant) ID**: Copy this (e.g., `87654321-4321-4321-4321-cba987654321`)

### 1.4 Create Client Secret

1. In the left menu, click **"Certificates & secrets"**
2. Click **"+ New client secret"**
3. Add description: `Firebase Auth`
4. Set expiration (recommended: 24 months)
5. Click **"Add"**
6. **IMPORTANT**: Copy the **Value** immediately (you won't see it again!)
   - This is your **Client Secret**

### 1.5 Configure API Permissions

1. In the left menu, click **"API permissions"**
2. By default, you should see `Microsoft Graph > User.Read`
3. Optionally, add more permissions:
   - Click **"+ Add a permission"**
   - Select **"Microsoft Graph"**
   - Select **"Delegated permissions"**
   - Add: `email`, `profile`, `openid`, `offline_access`
4. Click **"Add permissions"**

### 1.6 Configure Authentication Settings

1. In the left menu, click **"Authentication"**
2. Under **"Platform configurations"**, click on your Web platform
3. Enable these settings:
   - ✓ **Access tokens** (used for implicit flows)
   - ✓ **ID tokens** (used for implicit flows)
4. Under **"Supported account types"**, verify your selection
5. Click **"Save"**

## Step 2: Configure Firebase Console

### 2.1 Go to Firebase Console

1. Navigate to https://console.firebase.google.com
2. Select your project: **map-certificate**
3. Go to **Authentication** (in left sidebar)
4. Click on **"Sign-in method"** tab

### 2.2 Enable Microsoft Provider

1. Find **"Microsoft"** in the provider list
2. Click on it to configure
3. Toggle **"Enable"** to ON
4. Fill in the credentials from Azure AD:
   - **Application (client) ID**: Paste from Step 1.3
   - **Application (client) secret**: Paste from Step 1.4
   - **Tenant ID**: Paste from Step 1.3
5. Copy the **Callback URL** shown (should be the redirect URI you used)
6. Click **"Save"**

### 2.3 Verify Configuration

You should now see:
- ✅ Microsoft - **Enabled**
- Application ID configured
- Redirect URI configured

## Step 3: Configure Admin Whitelist

### 3.1 Add Admin Emails to Firestore

You need to create the admin whitelist in Firestore:

1. Go to Firebase Console > **Firestore Database**
2. Navigate to the `settings` collection
3. Find or create document: `admin_whitelist`
4. Set the document structure:

```json
{
  "emails": [
    "admin@familycourt.gov.mv",
    "hussain.shareef@familycourt.gov.mv",
    "another.admin@familycourt.gov.mv"
  ],
  "updatedAt": "2024-01-20T10:00:00.000Z",
  "updatedBy": "system"
}
```

**Important**: Use lowercase emails in the array!

### 3.2 Using the Setup Script (Alternative)

You can use the provided script:

```bash
node scripts/setupAuthCollections.js
```

This will create the whitelist with a default email. Then update it in Firestore Console.

## Step 4: Test Office 365 Login

### 4.1 Test in Development

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Navigate to: http://localhost:5173/login

3. Toggle to **"Admin"** tab

4. Click **"Sign in with Office 365"**

5. You should see Microsoft login popup (in dev mode)

6. After login:
   - If email is in whitelist → Success! Redirected to home
   - If email NOT in whitelist → Error message shown

### 4.2 Check Browser Console

Look for these logs:
```
🔵 Starting Microsoft login...
Using popup mode (development)
Email: your-email@domain.com
🔍 Checking admin whitelist...
Whitelist check result: true
✅ Email is whitelisted, creating user...
✅ Admin user created/updated
✅ Login successful!
```

### 4.3 Verify in Firestore

1. Go to Firebase Console > Firestore
2. Check the `users` collection
3. You should see a new document with your UID:

```json
{
  "uid": "firebase-uid-here",
  "email": "your-email@domain.com",
  "displayName": "Your Name",
  "photoURL": "https://...",
  "roles": ["admin", "public"],
  "primaryRole": "admin",
  "provider": "microsoft",
  "isActive": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "lastLoginAt": "timestamp"
}
```

## Step 5: Configure for Production

### 5.1 Update Redirect URIs

When deploying to production, add your production domain to Azure AD:

1. Go to Azure Portal > App registrations > Your app
2. Click **"Authentication"**
3. Add production redirect URI:
   ```
   https://your-domain.com/__/auth/handler
   ```
4. If using custom domain, add:
   ```
   https://customdomain.com/__/auth/handler
   ```

### 5.2 Update Firebase Authorized Domains

1. Go to Firebase Console > Authentication
2. Click **"Settings"** tab
3. Scroll to **"Authorized domains"**
4. Add your production domain

### 5.3 Production Mode

In production, the app uses **redirect mode** instead of popup:

```typescript
// Automatically switches based on environment
private static USE_POPUP = import.meta.env.DEV;
```

Users will be redirected to Microsoft login and back to your app.

## Troubleshooting

### Error: "auth/configuration-not-found"

**Cause**: Microsoft provider not enabled in Firebase Console

**Solution**:
1. Go to Firebase Console > Authentication > Sign-in method
2. Enable Microsoft provider
3. Add Application ID and Secret

### Error: "Email not authorized for admin access"

**Cause**: User's email is not in the admin whitelist

**Solution**:
1. Add email to Firestore `settings/admin_whitelist` document
2. Make sure email is lowercase
3. Try logging in again

### Error: "AADSTS50011: The redirect URI does not match"

**Cause**: Redirect URI mismatch between Azure AD and Firebase

**Solution**:
1. Go to Azure Portal > App registrations
2. Update redirect URI to match Firebase callback URL
3. Make sure it's exactly: `https://map-certificate.firebaseapp.com/__/auth/handler`

### Error: "Cross-Origin-Opener-Policy policy would block"

**Cause**: Browser blocking popup in development

**Solution**:
- This is expected in dev mode with popups
- The app will still work
- In production, redirect mode is used (no popups)

### Popup Blocked

**Cause**: Browser blocking authentication popup

**Solution**:
1. Allow popups for localhost:5173
2. Or use redirect mode (production behavior)

### Login Works but No Access

**Cause**: User created but doesn't have admin role

**Solution**:
1. Check Firestore `users` collection
2. Verify user has `roles: ["admin", "public"]`
3. Check if email is in whitelist
4. Delete user document and try login again

## Security Best Practices

### 1. Restrict to Organization Only

In Azure AD App Registration:
- Set "Supported account types" to **"Accounts in this organizational directory only"**
- This prevents external users from attempting login

### 2. Limit Whitelist Access

- Keep the `admin_whitelist` document secure
- Only add trusted admin emails
- Regularly review and update the list

### 3. Monitor Authentication

Check Firebase Authentication logs:
- Go to Firebase Console > Authentication > Users
- Monitor new admin logins
- Review any suspicious activity

### 4. Rotate Client Secrets

- Azure AD client secrets expire
- Set reminders to rotate before expiration
- Generate new secret in Azure Portal
- Update in Firebase Console

### 5. Use Firestore Security Rules

Ensure your Firestore rules protect the whitelist:

```javascript
match /settings/admin_whitelist {
  // Only admins can read the whitelist
  allow read: if request.auth != null &&
              request.auth.token.roles.hasAny(['admin']);

  // Only existing admins can update
  allow write: if request.auth != null &&
               request.auth.token.roles.hasAny(['admin']);
}
```

## Testing Checklist

- [ ] Azure AD app registration created
- [ ] Client ID and Secret copied
- [ ] Firebase Microsoft provider enabled
- [ ] Redirect URI configured in both Azure and Firebase
- [ ] Admin whitelist created in Firestore
- [ ] Test email added to whitelist
- [ ] Dev login tested with popup mode
- [ ] User document created in Firestore with admin role
- [ ] Admin dashboard accessible after login
- [ ] Production redirect URIs configured
- [ ] Client secret expiration noted

## Additional Resources

- [Azure AD App Registration Docs](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Firebase Microsoft Auth Docs](https://firebase.google.com/docs/auth/web/microsoft-oauth)
- [Microsoft Graph API Permissions](https://docs.microsoft.com/en-us/graph/permissions-reference)

## Need Help?

If you encounter issues:
1. Check browser console for detailed error logs
2. Verify all credentials match between Azure and Firebase
3. Ensure email is in lowercase in whitelist
4. Try deleting and recreating the user document
5. Check that redirect URIs exactly match (including `/__/auth/handler`)
