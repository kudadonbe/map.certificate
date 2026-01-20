import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

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

async function createTestParticipant() {
  try {
    // Get email from command line argument or use default
    const email = process.argv[2] || 'test@example.com';

    console.log('🚀 Creating test participant...\n');

    const participantData = {
      email: email.toLowerCase(),
      name: 'Test Participant',
      name_dv: 'ޓެސްޓް ޕާޓިސިޕަންޓް',
      partner_name: 'Test Partner',
      partner_name_dv: 'ޓެސްޓް ޕާޓްނަރ',
      phone: '+960 7777777',
      id_number: 'A000000',
      partner_id_number: 'A000001',
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    };

    const docRef = await addDoc(collection(db, 'participants'), participantData);

    console.log('✅ Test participant created successfully!');
    console.log('   Document ID:', docRef.id);
    console.log('   Email:', email);
    console.log('\n📝 You can now login with this email using Google OAuth\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating participant:', error);
    process.exit(1);
  }
}

createTestParticipant();
