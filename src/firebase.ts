// Firebase Configuration for MAP Certificate
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
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

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app;
