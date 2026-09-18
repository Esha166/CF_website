import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore/lite";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only if API key is present
let app: FirebaseApp | undefined = undefined;
let isAppAlreadyInitialized = false;
if (firebaseConfig.apiKey) {
  isAppAlreadyInitialized = getApps().length > 0;
  app = isAppAlreadyInitialized ? getApp() : initializeApp(firebaseConfig);
} else {
  // During build time or if env vars are missing
  console.warn("Firebase API Key is missing. Firebase services will not be initialized.");
}

// Initialize services with safety checks
const auth: Auth | undefined = app ? getAuth(app) : undefined;

let db: Firestore | undefined = undefined;
if (app) {
  db = getFirestore(app);
}

const storage: FirebaseStorage | undefined = app ? getStorage(app) : undefined;

export const getDb = (): Firestore => {
  if (!db) {
    throw new Error("Firestore is not initialized. Check your Firebase configuration.");
  }
  return db;
};

// Initialize Analytics (only in client-side)
let analytics;
if (typeof window !== "undefined" && app) {
  isSupported().then((supported) => {
    if (supported && app) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, storage, analytics };
