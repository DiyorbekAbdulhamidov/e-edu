import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const isConfigured = Object.values(firebaseConfig).every(Boolean);

// Firebase'ni faqat bir marta initialize qilish
let app: FirebaseApp | null = null;
if (isConfigured) {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
} else {
  console.warn('Firebase config missing. Skipping initialization.');
}

// Firebase xizmatlarini export qilish
export const auth: Auth = app ? getAuth(app) : (null as unknown as Auth);
export const db: Firestore = app ? getFirestore(app) : (null as unknown as Firestore);
export const storage: FirebaseStorage = app ? getStorage(app) : (null as unknown as FirebaseStorage);

export default app;
export { isConfigured as isFirebaseConfigured };
