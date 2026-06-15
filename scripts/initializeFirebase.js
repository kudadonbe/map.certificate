import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_f0Rek5B1epD7dF5pyT_nNwhEyBfeqhY",
  authDomain: "map-certificate.firebaseapp.com",
  projectId: "map-certificate",
  storageBucket: "map-certificate.firebasestorage.app",
  messagingSenderId: "727124162834",
  appId: "1:727124162834:web:8e1283f84b93f2d23a1bcb",
  measurementId: "G-W4FTQCDCGB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Default template configuration
const defaultTemplate = {
  name: 'Classic A4 Portrait',
  description: 'Traditional bilingual certificate layout in portrait orientation',
  size: 'A4',
  orientation: 'portrait',
  width: 210,
  height: 297,
  
  background: {
    type: 'color',
    value: '#ffffff',
    opacity: 1,
  },
  
  border: {
    enabled: true,
    width: 3,
    color: '#580f41',
    style: 'double',
    radius: 0,
    margin: 15,
  },
  
  theme: {
    primary: '#580f41',
    secondary: '#ab5989',
    accent: '#b47a0b',
    text: '#2d1325',
  },
  
  elements: [],
  signatures: [],
  stamps: [],
  
  createdBy: 'system',
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  version: 1,
  isDefault: true,
  isActive: true,
  
  printSettings: {
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    resolution: 300,
  },
};

// Default settings
const defaultSettings = {
  certificatePrefix: 'MAP',
  lastCertificateNumber: 0,
  pdfResolution: 300,
  embedFonts: true,
  allowParticipantDownload: true,
  allowParticipantPreview: true,
  emailNotificationOnGeneration: true,
  storagePath: {
    certificates: '/certificates/{year}/{month}/',
    templates: '/templates/',
    assets: '/assets/',
  },
};

async function initializeData() {
  try {
    console.log('🚀 Initializing MAP Certificate data...\n');
    
    // Create default template
    console.log('📄 Creating default certificate template...');
    const templateRef = await addDoc(collection(db, 'certificate_templates'), defaultTemplate);
    console.log('✅ Template created with ID:', templateRef.id);
    
    // Create default settings
    console.log('\n⚙️  Creating default settings...');
    const settingsRef = await addDoc(collection(db, 'settings'), {
      ...defaultSettings,
      defaultTemplateId: templateRef.id,
    });
    console.log('✅ Settings created with ID:', settingsRef.id);
    
    console.log('\n🎉 Initialization complete!');
    console.log('\nNext steps:');
    console.log('1. Run: npm install');
    console.log('2. Run: npm run dev');
    console.log('3. Visit: http://localhost:5173/admin/templates');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing data:', error);
    process.exit(1);
  }
}

// Run initialization
initializeData();
