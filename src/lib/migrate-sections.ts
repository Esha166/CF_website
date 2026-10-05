import { getDb } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore/lite";

export async function migrateDepartmentHeadToYouthForum() {
  const db = getDb();
  const q = query(collection(db, "teamMembers"), where("section", "==", "Department Head"));
  const snap = await getDocs(q);

  let count = 0;
  const updates = snap.docs.map(async (d) => {
    await updateDoc(doc(db, "teamMembers", d.id), { section: "Youth Forum" });
    count++;
  });
  await Promise.all(updates);

  return { updated: count };
}
