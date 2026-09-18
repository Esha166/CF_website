import { collection, getDocs } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";

export interface EventLocation {
  id: string;
  title: string;
  location: string;
  coordinates: string;
}

let cachedEventLocations: EventLocation[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30000; // 30 seconds

// Only events with coordinates are returned — used to pin events on the
// Achievements map alongside projects.
export async function getEventLocations(): Promise<EventLocation[]> {
  const now = Date.now();
  if (cachedEventLocations && now - cacheTimestamp < CACHE_TTL) {
    return cachedEventLocations;
  }

  if (!db) {
    return [];
  }

  try {
    const snap = await getDocs(collection(db, "events"));
    const data = snap.docs
      .map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.name || d.title || "Event",
          location: d.location || "",
          coordinates: d.coordinates || "",
        };
      })
      .filter((e) => e.coordinates);

    cachedEventLocations = data;
    cacheTimestamp = now;
    return data;
  } catch (error) {
    console.error("Error fetching event locations from Firebase:", error);
    return [];
  }
}
