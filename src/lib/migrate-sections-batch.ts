import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore/lite";
import { getDb } from "./firebase";

async function migrateSection(fromSection: string, toSection: string) {
  const db = getDb();
  const q = query(collection(db, "teamMembers"), where("section", "==", fromSection));
  const snap = await getDocs(q);

  const updates = snap.docs.map(async (d) => {
    await updateDoc(doc(db, "teamMembers", d.id), { section: toSection, role: toSection });
  });
  await Promise.all(updates);

  return { from: fromSection, to: toSection, count: snap.docs.length };
}

export async function migrateAllSections() {
  const results = [];
  results.push(await migrateSection("Ambassador", "International Forum"));
  results.push(await migrateSection("Youth Leader", "Youth Forum"));
  return results;
}
