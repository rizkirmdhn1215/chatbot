import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

if (typeof window !== 'undefined') {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_CHATBOT_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_CHATBOT_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_CHATBOT_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_CHATBOT_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_CHATBOT_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_CHATBOT_FIREBASE_APP_ID
  };

  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

export { app, db, auth }; 