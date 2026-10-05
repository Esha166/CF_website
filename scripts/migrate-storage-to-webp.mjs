// One-off migration: converts every non-WebP image in Firebase Storage to
// WebP, and updates every Firestore document that references it.
//
// Cost-conscious by design:
//   - `dry-run` (default) never downloads a file. It only lists bucket
//     metadata (size, content-type) and reads Firestore documents once, to
//     report what a real run would cost - zero storage egress.
//   - `migrate` skips any file already recorded in the manifest from a
//     previous run, so re-running after an interruption doesn't re-download
//     or re-upload anything already converted.
//   - `cleanup` only deletes originals that the manifest confirms have a
//     working replacement, and only after you've reviewed the site.
//
// Usage:
//   node scripts/migrate-storage-to-webp.mjs --mode=dry-run   (default)
//   node scripts/migrate-storage-to-webp.mjs --mode=migrate
//   node scripts/migrate-storage-to-webp.mjs --mode=cleanup
//
// Requires PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY and
// NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET in .env (never committed).

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import dotenv from "dotenv";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
dotenv.config({ path: path.join(ROOT, ".env") });

const MODE = (process.argv.find((a) => a.startsWith("--mode=")) || "--mode=dry-run").split("=")[1];
const MANIFEST_DIR = path.join(ROOT, "scripts", "migration-output");
const MANIFEST_PATH = path.join(MANIFEST_DIR, "storage-webp-manifest.json");

const MAX_DIMENSION = 1600; // long edge, matches the Fix 1 convention
const WEBP_QUALITY = 80;

const COLLECTIONS = [
  "events",
  "courses",
  "blogs",
  "annualReports",
  "mous",
  "teamMembers",
  "partners",
  "splashBanners",
  "projects",
];

const SKIP_CONTENT_TYPES = new Set(["application/pdf"]);

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

function initFirebase() {
  const projectId = process.env.PROJECT_ID;
  const clientEmail = process.env.CLIENT_EMAIL?.trim();
  const privateKey = process.env.PRIVATE_KEY?.replace(/\\n/g, "\n");
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (!projectId || !clientEmail || !privateKey || !storageBucket) {
    throw new Error(
      "Missing one of PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY, NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET in .env"
    );
  }

  const app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket,
  });

  return { bucket: getStorage(app).bucket(), db: getFirestore(app) };
}

// Parses a Firebase Storage download URL into its bucket + object path.
function parseStorageUrl(url) {
  const m = /firebasestorage\.googleapis\.com\/v0\/b\/([^/]+)\/o\/([^?]+)/.exec(url);
  if (!m) return null;
  return { bucket: m[1], objectPath: decodeURIComponent(m[2]) };
}

function buildDownloadUrl(bucketName, objectPath, token) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(
    objectPath
  )}?alt=media&token=${token}`;
}

// Walks a Firestore document's fields recursively, collecting every string
// value that looks like a Storage download URL, with a JSON-path-ish
// location so a targeted update can be applied later.
function collectImageRefs(value, fieldPath, out) {
  if (typeof value === "string") {
    if (parseStorageUrl(value)) out.push({ fieldPath, url: value });
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => collectImageRefs(v, `${fieldPath}[${i}]`, out));
  } else if (value && typeof value === "object") {
    if (typeof value.toDate === "function") return; // Firestore Timestamp
    for (const [k, v] of Object.entries(value)) {
      collectImageRefs(v, fieldPath ? `${fieldPath}.${k}` : k, out);
    }
  }
}

async function loadAllDocs(db) {
  const docs = []; // { collection, id, data }
  for (const collectionName of COLLECTIONS) {
    const snap = await db.collection(collectionName).get();
    for (const doc of snap.docs) {
      docs.push({ collection: collectionName, id: doc.id, data: doc.data() });
    }
  }
  return docs;
}

// Maps storage object path -> [{ collection, id, fieldPath, url }]
function buildReferenceIndex(docs) {
  const index = new Map();
  for (const doc of docs) {
    const refs = [];
    collectImageRefs(doc.data, "", refs);
    for (const ref of refs) {
      const parsed = parseStorageUrl(ref.url);
      if (!parsed) continue;
      const key = parsed.objectPath;
      if (!index.has(key)) index.set(key, []);
      index.get(key).push({ collection: doc.collection, id: doc.id, fieldPath: ref.fieldPath, url: ref.url });
    }
  }
  return index;
}

async function listConvertibleFiles(bucket) {
  const [files] = await bucket.getFiles();
  return files.filter((f) => {
    const contentType = f.metadata.contentType || "";
    if (SKIP_CONTENT_TYPES.has(contentType)) return false;
    if (!contentType.startsWith("image/")) return false;
    if (contentType === "image/webp") return false;
    return true;
  });
}

async function loadManifest() {
  try {
    const raw = await readFile(MANIFEST_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return { entries: {} }; // objectPath -> { newObjectPath, newUrl, oldSize, newSize, convertedAt }
  }
}

async function saveManifest(manifest) {
  await mkdir(MANIFEST_DIR, { recursive: true });
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

async function runDryRun({ bucket, db }) {
  console.log("Listing bucket metadata (no downloads, no writes)...\n");
  const files = await listConvertibleFiles(bucket);
  const docs = await loadAllDocs(db);
  const refIndex = buildReferenceIndex(docs);

  let totalBytes = 0;
  let referencedCount = 0;
  let orphanedCount = 0;
  const perCollectionRefs = {};

  for (const file of files) {
    const size = Number(file.metadata.size || 0);
    totalBytes += size;
    const refs = refIndex.get(file.name) || [];
    if (refs.length > 0) {
      referencedCount++;
      for (const r of refs) {
        perCollectionRefs[r.collection] = (perCollectionRefs[r.collection] || 0) + 1;
      }
    } else {
      orphanedCount++;
    }
  }

  console.log(`--- Dry run report ---`);
  console.log(`Convertible images in bucket: ${files.length}`);
  console.log(`Total current size:           ${formatBytes(totalBytes)}`);
  console.log(`Referenced by Firestore docs: ${referencedCount}`);
  console.log(`Orphaned (no doc references): ${orphanedCount}`);
  console.log(`\nReferences by collection:`);
  for (const [c, n] of Object.entries(perCollectionRefs)) {
    console.log(`  ${c.padEnd(15)} ${n}`);
  }
  console.log(`\nFirestore documents scanned: ${docs.length} (${docs.length} reads, one-time, already done above)`);

  console.log(`\n--- Estimated cost of a full "migrate" run ---`);
  console.log(`Storage download (egress): ~${formatBytes(totalBytes)} (~$${(totalBytes / 1024 / 1024 / 1024 * 0.12).toFixed(4)} at $0.12/GB)`);
  console.log(`Storage upload operations: ${files.length} objects (Class A ops, negligible - a few cents per 10k)`);
  console.log(`Firestore document writes: up to ${referencedCount} documents updated (Firestore write pricing, negligible at this volume)`);
  console.log(`New storage footprint added (originals kept until cleanup): roughly 5-15% of ${formatBytes(totalBytes)} depending on source formats, based on Fix 1's SVG conversion ratios`);
  console.log(`\nNo files were downloaded or modified. Re-run with --mode=migrate to convert.`);
}

async function convertOne(bucket, file) {
  const [buffer] = await file.download();
  const outBuffer = await sharp(buffer, { density: 300 })
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  const newObjectPath = file.name.replace(/\.[^./]+$/, "") + ".webp";
  const token = crypto.randomUUID();
  const newFile = bucket.file(newObjectPath);

  await newFile.save(outBuffer, {
    metadata: {
      contentType: "image/webp",
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });

  const newUrl = buildDownloadUrl(bucket.name, newObjectPath, token);
  return { newObjectPath, newUrl, oldSize: buffer.length, newSize: outBuffer.length };
}

async function updateReferences(db, refs, newUrl) {
  // Firestore batches are capped at 500 operations.
  for (let i = 0; i < refs.length; i += 400) {
    const batch = db.batch();
    for (const ref of refs.slice(i, i + 400)) {
      const docRef = db.collection(ref.collection).doc(ref.id);
      // Only single-level and array-index field paths are produced by
      // collectImageRefs; Firestore's dot-path update needs the bracket
      // notation resolved to the array itself, so re-fetch+patch arrays.
      if (ref.fieldPath.includes("[")) {
        const doc = await docRef.get();
        const data = doc.data();
        applyArrayPathUpdate(data, ref.fieldPath, newUrl);
        batch.set(docRef, data);
      } else {
        batch.update(docRef, { [ref.fieldPath]: newUrl });
      }
    }
    await batch.commit();
  }
}

// Applies an update to a dotted/bracketed path like "images[2]" or
// "commentList[0].avatar" directly on an in-memory object.
function applyArrayPathUpdate(obj, fieldPath, newValue) {
  const tokens = fieldPath.match(/[^.[\]]+/g);
  let cur = obj;
  for (let i = 0; i < tokens.length - 1; i++) {
    cur = cur[tokens[i]];
  }
  cur[tokens[tokens.length - 1]] = newValue;
}

async function runMigrate({ bucket, db }) {
  const allFiles = await listConvertibleFiles(bucket);
  const docs = await loadAllDocs(db);
  const refIndex = buildReferenceIndex(docs);
  const manifest = await loadManifest();

  // Orphaned files (no Firestore document references them) are skipped -
  // no point spending storage/bandwidth converting something nothing uses.
  const files = allFiles.filter((f) => refIndex.has(f.name));
  console.log(`Skipping ${allFiles.length - files.length} orphaned file(s) with no Firestore references.\n`);

  let converted = 0;
  let skipped = 0;
  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    if (manifest.entries[file.name]) {
      skipped++;
      continue;
    }

    const refs = refIndex.get(file.name) || [];
    console.log(`Converting ${file.name} (${refs.length} reference${refs.length === 1 ? "" : "s"})...`);

    try {
      const result = await convertOne(bucket, file);
      if (refs.length > 0) {
        await updateReferences(db, refs, result.newUrl);
      }

      manifest.entries[file.name] = {
        newObjectPath: result.newObjectPath,
        newUrl: result.newUrl,
        oldSize: result.oldSize,
        newSize: result.newSize,
        referencesUpdated: refs.length,
        convertedAt: new Date().toISOString(),
      };
      await saveManifest(manifest); // save after every file so an interruption loses nothing

      converted++;
      totalBefore += result.oldSize;
      totalAfter += result.newSize;
      console.log(
        `  -> ${result.newObjectPath}: ${formatBytes(result.oldSize)} -> ${formatBytes(result.newSize)}`
      );
    } catch (err) {
      console.error(`  FAILED: ${file.name}:`, err.message);
    }
  }

  console.log(`\n--- Migrate summary ---`);
  console.log(`Converted: ${converted}`);
  console.log(`Skipped (already in manifest from a prior run): ${skipped}`);
  console.log(`Size before: ${formatBytes(totalBefore)}`);
  console.log(`Size after:  ${formatBytes(totalAfter)}`);
  console.log(`\nOriginals were NOT deleted. Review the live site, then run --mode=cleanup to remove them.`);
}

async function runCleanup({ bucket }) {
  const manifest = await loadManifest();
  const entries = Object.entries(manifest.entries);
  if (entries.length === 0) {
    console.log("Manifest is empty - nothing to clean up. Run --mode=migrate first.");
    return;
  }

  console.log(`About to delete ${entries.length} original file(s) whose WebP replacement is on record.`);
  let deleted = 0;
  for (const [oldPath, entry] of entries) {
    if (entry.deletedAt) continue; // already cleaned up in a prior run
    try {
      await bucket.file(oldPath).delete();
      entry.deletedAt = new Date().toISOString();
      await saveManifest(manifest);
      deleted++;
      console.log(`Deleted ${oldPath}`);
    } catch (err) {
      console.error(`FAILED to delete ${oldPath}:`, err.message);
    }
  }
  console.log(`\nDeleted ${deleted} original file(s).`);
}

async function main() {
  const { bucket, db } = initFirebase();

  if (MODE === "dry-run") {
    await runDryRun({ bucket, db });
  } else if (MODE === "migrate") {
    await runMigrate({ bucket, db });
  } else if (MODE === "cleanup") {
    await runCleanup({ bucket });
  } else {
    throw new Error(`Unknown --mode=${MODE}. Use dry-run, migrate, or cleanup.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
