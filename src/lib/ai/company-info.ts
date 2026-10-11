import { doc, getDoc } from 'firebase/firestore/lite';
import { getDb } from '@/lib/firebase';
import bundledCompanyInfo from '@/data/company-knowledge.json';

export type CompanyInfo = typeof bundledCompanyInfo;

// The knowledge base can be edited live in Firestore at settings/companyInfo.
// The bundled JSON is only the fallback (and the seed source), so the site
// never breaks if Firestore is empty or unreachable.
const FIRESTORE_COLLECTION = 'settings';
const FIRESTORE_DOC = 'companyInfo';
const CACHE_TTL_MS = 5 * 60 * 1000;

let cache: { data: CompanyInfo; expiresAt: number } | undefined;

async function fetchFromFirestore(): Promise<CompanyInfo | undefined> {
  try {
    const snap = await getDoc(doc(getDb(), FIRESTORE_COLLECTION, FIRESTORE_DOC));
    if (!snap.exists()) return undefined;
    const data = snap.data();
    if (data && typeof data === 'object' && 'organization' in data) {
      return data as CompanyInfo;
    }
    return undefined;
  } catch (error) {
    console.error('getCompanyInfo Firestore error:', error);
    return undefined;
  }
}

export async function getCompanyInfo(): Promise<CompanyInfo> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.data;

  const fromDb = await fetchFromFirestore();
  const data = fromDb ?? (bundledCompanyInfo as CompanyInfo);
  cache = { data, expiresAt: now + CACHE_TTL_MS };
  return data;
}
