// Seeds the chatbot knowledge base into Firestore so the foundation profile
// can be edited live (Firebase Console or an admin tool) without redeploying.
//
// The chatbot reads Firestore at settings/companyInfo and only falls back to
// src/data/company-knowledge.json when the document is missing. Re-running this
// script overwrites the Firestore copy with the current JSON file.
//
// Usage:
//   node scripts/seed-company-info.mjs
//
// Requires PROJECT_ID, CLIENT_EMAIL and PRIVATE_KEY in .env (never committed).

import { readFile } from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const ROOT = path.resolve(import.meta.dirname, "..");
dotenv.config({ path: path.join(ROOT, ".env") });

const projectId = process.env.PROJECT_ID;
const clientEmail = process.env.CLIENT_EMAIL?.trim();
const privateKey = process.env.PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing one of PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY in .env");
  process.exit(1);
}

const app = getApps().length
  ? getApps()[0]
  : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });

const db = getFirestore(app);

const sourcePath = path.join(ROOT, "src", "data", "company-knowledge.json");
const data = JSON.parse(await readFile(sourcePath, "utf8"));

await db.collection("settings").doc("companyInfo").set(data, { merge: false });

console.log(`Seeded ${sourcePath} -> settings/companyInfo`);
process.exit(0);
