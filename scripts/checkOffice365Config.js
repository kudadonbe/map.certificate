/**
 * Check Office 365 Configuration
 *
 * This script verifies that Office 365 authentication is properly configured.
 * Run: node scripts/checkOffice365Config.js
 */

import { initializeApp } from 'firebase/app';
import { getAuth, OAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB_f0Rek5B1epD7dF5pyT_nNwhEyBfeqhY",
  authDomain: "map-certificate.firebaseapp.com",
  projectId: "map-certificate",
  storageBucket: "map-certificate.firebasestorage.app",
  messagingSenderId: "727124162834",
  appId: "1:727124162834:web:8e1283f84b93f2d23a1bcb"
};

// Initialize
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('🔍 Checking Office 365 Configuration...\n');

// Check 1: Provider Configuration
console.log('✅ Step 1: Provider Configuration');
const provider = new OAuthProvider('microsoft.com');
console.log('   - Provider ID:', provider.providerId);
console.log('   - Ready to use\n');

// Check 2: Firebase Console Configuration
console.log('📋 Step 2: Firebase Console Setup');
console.log('   ⚠️  Manual check required:');
console.log('   1. Go to: https://console.firebase.google.com/project/map-certificate/authentication/providers');
console.log('   2. Verify Microsoft provider is ENABLED');
console.log('   3. Verify Application ID and Secret are configured\n');

// Check 3: Admin Whitelist
console.log('🔍 Step 3: Checking Admin Whitelist...');
try {
  const whitelistRef = doc(db, 'settings', 'admin_whitelist');
  const whitelistSnap = await getDoc(whitelistRef);

  if (whitelistSnap.exists()) {
    const data = whitelistSnap.data();
    console.log('   ✅ Whitelist found!');
    console.log('   - Number of admins:', data.emails?.length || 0);
    console.log('   - Admin emails:');
    data.emails?.forEach((email, index) => {
      console.log(`      ${index + 1}. ${email}`);
    });
    console.log('');
  } else {
    console.log('   ❌ Whitelist NOT found!');
    console.log('   - Create document: settings/admin_whitelist');
    console.log('   - Structure: { "emails": ["admin@example.com"] }\n');
  }
} catch (error) {
  console.error('   ❌ Error checking whitelist:', error.message);
  console.log('');
}

// Check 4: Redirect URIs
console.log('📍 Step 4: Redirect URI Configuration');
console.log('   Add these URIs to Azure AD App Registration:');
console.log('   - Development: http://localhost:5173/__/auth/handler');
console.log('   - Production: https://map-certificate.firebaseapp.com/__/auth/handler');
console.log('');

// Check 5: Test Instructions
console.log('🧪 Step 5: Testing');
console.log('   1. Run: npm run dev');
console.log('   2. Go to: http://localhost:5173/login');
console.log('   3. Toggle to "Admin" tab');
console.log('   4. Click "Sign in with Office 365"');
console.log('   5. Check browser console for logs\n');

// Summary
console.log('📝 Configuration Checklist:');
console.log('   [ ] Azure AD App Registration created');
console.log('   [ ] Client ID and Secret obtained');
console.log('   [ ] Microsoft provider enabled in Firebase Console');
console.log('   [ ] Credentials added to Firebase Console');
console.log('   [ ] Redirect URIs configured in Azure AD');
console.log('   [ ] Admin whitelist created in Firestore');
console.log('   [ ] Admin email(s) added to whitelist');
console.log('   [ ] Login tested successfully\n');

console.log('📚 Documentation:');
console.log('   - Quick Start: docs/OFFICE365_QUICK_START.md');
console.log('   - Full Guide: docs/OFFICE365_SETUP.md\n');

process.exit(0);
