# Firebase Deployment Instructions

## Quick Deploy (First Time)

### Step 1: Login to Firebase

Open your terminal and run:

```bash
firebase login
```

This will open a browser window. Login with your Google account that has access to the Firebase project.

### Step 2: Set Active Project

```bash
firebase use map-certificate
```

### Step 3: Deploy

```bash
firebase deploy --only hosting
```

**Or use the npm script:**

```bash
npm run deploy:firebase
```

This will:
1. Build the project (`npm run build`)
2. Deploy to Firebase Hosting

## Quick Deploy (After First Time)

Once you've logged in once, just run:

```bash
firebase deploy --only hosting
```

Or:

```bash
npm run deploy:firebase
```

## What Gets Deployed

- **Source:** `dist/` folder (production build)
- **Destination:** Firebase Hosting
- **URL:** https://map-certificate.firebaseapp.com
- **Alternative URL:** https://map-certificate.web.app

## Deployment Checklist

Before deploying, make sure:

- [ ] Code is committed and pushed to GitHub
- [ ] Build succeeds (`npm run build`)
- [ ] All tests pass (if any)
- [ ] Environment variables are correct
- [ ] Firebase project is set (`firebase use map-certificate`)

## After Deployment

### 1. Verify Deployment

Visit your app:
```
https://map-certificate.firebaseapp.com
```

### 2. Test Login

1. Click "Participant Login"
2. Sign in with Google
3. Should successfully login and redirect to profile

### 3. Check Browser Console

Press F12 and check for errors.

Expected logs:
```
Using redirect mode (production)
✅ Login successful!
👤 User: your-email@gmail.com
```

### 4. Fix Common Issues

**Issue:** Login doesn't work on production

**Solution:**
1. Add authorized domain in Firebase Console:
   - Go to: https://console.firebase.google.com/project/map-certificate/authentication/settings
   - Scroll to "Authorized domains"
   - Add: `map-certificate.firebaseapp.com`
   - Add: `map-certificate.web.app`

2. Add OAuth redirect URI in Google Cloud Console:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Select OAuth 2.0 Client ID
   - Add redirect URI: `https://map-certificate.firebaseapp.com/__/auth/handler`

See `TROUBLESHOOTING.md` for more details.

## Deployment Output

You should see:

```
=== Deploying to 'map-certificate'...

i  deploying hosting
i  hosting[map-certificate]: beginning deploy...
i  hosting[map-certificate]: found 3 files in dist
✔  hosting[map-certificate]: file upload complete
i  hosting[map-certificate]: finalizing version...
✔  hosting[map-certificate]: version finalized
i  hosting[map-certificate]: releasing new version...
✔  hosting[map-certificate]: release complete

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/map-certificate/overview
Hosting URL: https://map-certificate.firebaseapp.com
```

## Rollback (If Needed)

If deployment has issues, you can rollback:

```bash
# List versions
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:rollback
```

## Custom Domain (Optional)

To add a custom domain:

1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Follow the DNS configuration steps
4. Wait for SSL certificate provisioning (can take 24 hours)

## CI/CD (Future)

For automated deployments, you can set up GitHub Actions.

See Firebase docs: https://firebase.google.com/docs/hosting/github-integration

## Need Help?

- **Firebase Docs:** https://firebase.google.com/docs/hosting
- **Troubleshooting:** See `TROUBLESHOOTING.md`
- **Session Notes:** See `SESSION_NOTES.md`

## Quick Commands Reference

```bash
# Login (first time only)
firebase login

# Set project
firebase use map-certificate

# Build only
npm run build

# Deploy only
firebase deploy --only hosting

# Build and deploy
npm run deploy:firebase

# Check deployment status
firebase hosting:channel:list

# View logs
firebase hosting:channel:open

# Rollback
firebase hosting:rollback
```

## Production URL

After deployment, your app will be live at:

🌐 **https://map-certificate.firebaseapp.com**

or

🌐 **https://map-certificate.web.app**

Both URLs point to the same deployed application.
