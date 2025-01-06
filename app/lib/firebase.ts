import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (typeof window !== 'undefined') {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_CHATBOT_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_CHATBOT_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_CHATBOT_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_CHATBOT_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_CHATBOT_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_CHATBOT_FIREBASE_APP_ID
  };

  // Log config (remove in production)
  console.log('Firebase Config:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasAuthDomain: !!firebaseConfig.authDomain,
    hasProjectId: !!firebaseConfig.projectId,
  });

  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw new Error('Failed to initialize Firebase');
  }
} else {
  // Server-side initialization
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_CHATBOT_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_CHATBOT_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_CHATBOT_FIREBASE_PROJECT_ID,
  };
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
}

export { app, db, auth }; 