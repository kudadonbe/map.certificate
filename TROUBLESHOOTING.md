# Troubleshooting: Login Works in Dev but Not in Production

## Common Issues and Solutions

### Issue 1: Authorized Domains Not Configured

**Symptom:** Login works on localhost but fails on hosted domain

**Solution:**
1. Go to Firebase Console: https://console.firebase.google.com/project/map-certificate/authentication/settings
2. Scroll to "Authorized domains"
3. Make sure these domains are added:
   - `localhost`
   - `map-certificate.firebaseapp.com`
   - `map-certificate.web.app` (if using this domain)

**How to add:**
- Click "Add domain"
- Enter the domain (without https://)
- Click "Add"

### Issue 2: OAuth Redirect URIs Not Configured

**For Google OAuth:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Add authorized redirect URI:
   ```
   https://map-certificate.firebaseapp.com/__/auth/handler
   ```

**For Microsoft OAuth:**
1. Go to Azure Portal: https://portal.azure.com
2. Navigate to: Azure AD > App registrations > Your app
3. Click "Authentication"
4. Add redirect URI:
   ```
   https://map-certificate.firebaseapp.com/__/auth/handler
   ```

### Issue 3: Redirect Mode vs Popup Mode

**In Production:** The app uses redirect mode automatically

**Check in Browser Console:**
Look for these logs:
```
Using redirect mode (production)
```

**If you see redirect errors:**
- User is redirected away and comes back
- Check for error in URL parameters
- Check browser console for errors

### Issue 4: CORS or Security Errors

**Common errors:**
- "Cross-Origin-Opener-Policy"
- "blocked by CORS policy"

**Solution:**
This is expected in production. Redirect mode handles this automatically.

## Quick Diagnostic Steps

### Step 1: Open Browser Console

1. Go to your hosted app: https://map-certificate.firebaseapp.com
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Click login button

### Step 2: Look for Error Messages

**Common errors:**

**Error: "auth/unauthorized-domain"**
```
Solution: Add domain to Firebase Console > Authentication > Settings > Authorized domains
```

**Error: "auth/redirect-uri-mismatch"**
```
Solution: Add redirect URI to Google Cloud Console or Azure Portal
```

**Error: "Failed to get redirect result"**
```
Solution: Check if redirect is completing properly
```

### Step 3: Check Network Tab

1. Open Network tab in DevTools
2. Click login
3. Look for failed requests
4. Check response errors

## Detailed Debugging

### Check 1: Firebase Authorized Domains

```bash
# Run this script to check configuration
node scripts/checkOffice365Config.js
```

Expected domains in Firebase Console:
- localhost
- map-certificate.firebaseapp.com
- map-certificate.web.app

### Check 2: Google OAuth Configuration

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your project
3. Find OAuth 2.0 Client IDs
4. Click on Web client
5. Check "Authorized redirect URIs"

Should include:
```
https://map-certificate.firebaseapp.com/__/auth/handler
http://localhost:5173/__/auth/handler
```

### Check 3: Test Redirect Flow

Open this URL to test redirect:
```
https://map-certificate.firebaseapp.com/login
```

Click "Participant Login" and watch what happens:
1. Redirects to Google login
2. After login, redirects back to your app
3. Should show logged in state

**If it fails:**
- Check URL for error parameter: `?error=...`
- Check browser console for detailed error
- Check Network tab for failed requests

### Check 4: Firestore Rules

Make sure Firestore rules allow user creation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Admin whitelist (anyone authenticated can read to check)
    match /settings/admin_whitelist {
      allow read: if request.auth != null;
    }

    // Participants collection (anyone authenticated can read to check)
    match /participants/{participantId} {
      allow read: if request.auth != null;
    }
  }
}
```

## Step-by-Step Fix

### Fix for Google Login

**1. Add Authorized Domain in Firebase:**
```
Firebase Console > Authentication > Settings > Authorized domains
Add: map-certificate.firebaseapp.com
```

**2. Add Redirect URI in Google Cloud:**
```
Google Cloud Console > APIs & Services > Credentials
Select OAuth 2.0 Client ID
Add redirect URI: https://map-certificate.firebaseapp.com/__/auth/handler
```

**3. Test:**
```
Go to: https://map-certificate.firebaseapp.com/login
Click: "Sign in with Google"
Should redirect to Google and back
```

### Fix for Office 365 Login

**1. Configure in Azure Portal:**
```
Azure Portal > App registrations > Your app > Authentication
Add redirect URI: https://map-certificate.firebaseapp.com/__/auth/handler
```

**2. Add Authorized Domain in Firebase:**
```
Firebase Console > Authentication > Settings > Authorized domains
Add: map-certificate.firebaseapp.com
```

**3. Test:**
```
Go to: https://map-certificate.firebaseapp.com/login
Click: "Sign in with Office 365"
Should redirect to Microsoft and back
```

## What to Check in Browser Console

### Expected Logs (Success):

```
🔍 Checking for redirect result...
✅ Redirect result received!
Provider: google.com
Email: your-email@gmail.com
🔍 Checking if participant record exists...
✅ New public user created
✅ Login successful!
👤 User: your-email@gmail.com
🔑 Role: public
```

### Error Logs (Failure):

```
❌ Error: auth/unauthorized-domain
```
**Fix:** Add domain to Firebase authorized domains

```
❌ Error: auth/redirect-uri-mismatch
```
**Fix:** Add redirect URI to OAuth provider

```
❌ Login failed: Email not authorized for admin access
```
**Fix:** Add email to admin whitelist (for Office 365 only)

## Quick Test Script

Save this and run in browser console on your hosted app:

```javascript
// Test Firebase Auth is initialized
console.log('Auth:', window.firebase?.auth ? '✅' : '❌');

// Test current user
console.log('User:', window.firebase?.auth()?.currentUser?.email || 'Not logged in');

// Test redirect result
window.firebase?.auth()?.getRedirectResult()
  .then(result => {
    console.log('Redirect result:', result);
  })
  .catch(error => {
    console.error('Redirect error:', error);
  });
```

## Common Solutions Summary

| Problem | Solution |
|---------|----------|
| Login works on localhost only | Add production domain to Firebase authorized domains |
| "unauthorized-domain" error | Add domain in Firebase Console > Authentication > Settings |
| "redirect-uri-mismatch" | Add redirect URI in Google Cloud Console / Azure Portal |
| Infinite redirect loop | Check OAuth scopes and permissions |
| "User not found" error | Check Firestore rules allow user creation |
| Whitelist errors | Add email to Firestore `settings/admin_whitelist` |

## Need More Help?

Share these details:
1. What error message do you see in browser console?
2. What happens when you click login? (redirect, error, nothing?)
3. Any error in the URL after redirect? (check for `?error=...`)
4. Screenshot of browser console errors

## Immediate Action

**Do this now:**

1. Open: https://console.firebase.google.com/project/map-certificate/authentication/settings
2. Scroll to "Authorized domains"
3. Click "Add domain"
4. Add: `map-certificate.firebaseapp.com`
5. Try login again

This should fix 90% of production login issues!
