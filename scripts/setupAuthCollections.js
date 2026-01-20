import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase configuration (same as .env.example)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyB_f0Rek5B1epD7dF5pyT_nNwhEyBfeqhY',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'map-certificate.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'map-certificate',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'map-certificate.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '727124162834',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:727124162834:web:8e1283f84b93f2d23a1bcb',
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-W4FTQCDCGB'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setupAuthCollections() {
  try {
    console.log('🚀 Setting up authentication collections...\n');

    // Create admin whitelist
    const whitelistRef = doc(db, 'settings', 'admin_whitelist');
    await setDoc(whitelistRef, {
      emails: [
        'admin@familycourt.gov.mv',
        // Add additional admin emails here
      ],
      updatedAt: new Date(),
      updatedBy: 'system'
    });

    console.log('✅ Admin whitelist created successfully');
    console.log('   Default admin email: admin@familycourt.gov.mv');
    console.log('\n📝 To add more admin emails:');
    console.log('   1. Go to Firebase Console > Firestore');
    console.log('   2. Navigate to settings/admin_whitelist');
    console.log('   3. Edit the emails array\n');

    console.log('✅ Authentication setup complete!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up collections:', error);
    process.exit(1);
  }
}

setupAuthCollections();
