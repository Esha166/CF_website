import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function normalisePrivateKey(value: string | undefined) {
    return value?.replace(/\\n/g, "\n");
}

const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL ?? process.env.CLIENT_EMAIL;
const privateKey = normalisePrivateKey(
    process.env.FIREBASE_PRIVATE_KEY ?? process.env.PRIVATE_KEY
);

let adminDb: Firestore | null = null;

if (getApps().length === 0 && projectId && clientEmail && privateKey) {
    try {
        initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }),
            projectId,
        });
    } catch (error) {
        console.error("Firebase Admin initialization failed:", error);
    }
}

if (getApps().length > 0) {
    adminDb = getFirestore();
}

export function getAdminDb(): Firestore | null {
    return adminDb;
}
