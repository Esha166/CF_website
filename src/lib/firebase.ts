import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore/lite";
import { getStorage, FirebaseStorage } from "firebase/storage";
import type { Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// initializeApp() must receive all six of these or the SDK falls back to
// fetching the rest from firebase.googleapis.com/.../webConfig at runtime,
// adding a multi-second lookup (CORS preflight included) to first load.
const REQUIRED_CONFIG_KEYS = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
] as const;

const missingConfigKeys = REQUIRED_CONFIG_KEYS.filter((key) => !firebaseConfig[key]);

let app: FirebaseApp | undefined = undefined;
let isAppAlreadyInitialized = false;
if (missingConfigKeys.length === 0) {
  isAppAlreadyInitialized = getApps().length > 0;
  app = isAppAlreadyInitialized ? getApp() : initializeApp(firebaseConfig);
} else {
  // During build time or if env vars are missing
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `Firebase config is missing: ${missingConfigKeys.join(", ")}. Firebase services will not be initialized.`
    );
  }
}

// Auth pulls in Firebase's gapi iframe stack (apis.google.com/js/api.js, the
// __/auth/iframe helper, getProjectConfig, ~350 KB / 4 round trips) as soon as
// firebase/auth is evaluated, whether or not a visitor ever signs in. Nothing
// on the public site needs auth, so it's loaded lazily, only when a consumer
// (the login form, the admin route guard) actually asks for it. No popup or
// redirect sign-in is used anywhere in this app, so initializeAuth() is used
// without a popupRedirectResolver, which keeps the iframe stack out entirely.
let authPromise: Promise<Auth | undefined> | undefined;
export function getFirebaseAuth(): Promise<Auth | undefined> {
  if (!app) return Promise.resolve(undefined);
  if (!authPromise) {
    const currentApp = app;
    authPromise = import("firebase/auth").then(({ initializeAuth, browserLocalPersistence, getAuth }) => {
      try {
        return initializeAuth(currentApp, { persistence: browserLocalPersistence });
      } catch {
        // Already initialized (e.g. React Strict Mode / Fast Refresh re-running this module).
        return getAuth(currentApp);
      }
    });
  }
  return authPromise;
}

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

export { app, db, storage };
