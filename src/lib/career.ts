import { collection, query, where, getDocs } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";
import type { Job } from "@/types/database";

export async function getActiveJobs(): Promise<Job[]> {
  try {
    if (!db) return [];

    const jobsRef = collection(db, "jobs");
    const q = query(jobsRef, where("active", "==", true));
    const querySnapshot = await getDocs(q);

    const jobsList = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.seconds
          ? { seconds: data.createdAt.seconds }
          : null,
      };
    }) as Job[];

    jobsList.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });

    return jobsList;
  } catch (err) {
    console.error("Error fetching active jobs:", err);
    return [];
  }
}
