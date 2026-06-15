import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

// Firebase configuration
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

// Email to upgrade to developer
const DEVELOPER_EMAIL = 'hussain.shareef@familycourt.gov.mv';

async function bootstrapDeveloper() {
  try {
    console.log(`🔍 Looking for user with email: ${DEVELOPER_EMAIL}...\n`);

    // Find user by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', DEVELOPER_EMAIL));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('❌ User not found. Please login first, then run this script again.');
      console.log('\nSteps:');
      console.log('1. Go to the app and login with Google');
      console.log('2. Run this script again: node scripts/bootstrapDeveloper.js');
      process.exit(1);
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    console.log(`✅ Found user: ${userData.displayName || userData.email}`);
    console.log(`   Current roles: ${userData.roles?.join(', ') || 'none'}`);

    // Update to developer role
    const userRef = doc(db, 'users', userDoc.id);
    await updateDoc(userRef, {
      roles: ['developer', 'admin', 'public'],
      primaryRole: 'developer',
      updatedAt: new Date()
    });

    console.log('\n🎉 Successfully upgraded to Developer!');
    console.log('   New roles: developer, admin, public');
    console.log('\nYou now have full system access and can manage all users.');
    console.log('Navigate to /admin/users to manage user roles.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

bootstrapDeveloper();
