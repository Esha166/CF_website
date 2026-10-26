import { getAdminDb } from "./firebase-admin";

export interface RateLimitResult {
    allowed: boolean;
    retryAfterSeconds: number;
}

export async function checkRateLimit(
    bucket: string,
    limit: number,
    windowMs: number
): Promise<RateLimitResult> {
    const db = getAdminDb();
    if (!db) {
        // Admin credentials are not configured; do not block traffic.
        return { allowed: true, retryAfterSeconds: 0 };
    }

    const ref = db.collection("rateLimits").doc(bucket);
    const now = Date.now();

    try {
        return await db.runTransaction<RateLimitResult>(async (transaction) => {
            const snapshot = await transaction.get(ref);
            const data = snapshot.exists
                ? (snapshot.data() as { windowStart?: number; count?: number })
                : null;

            if (!data?.windowStart || now - data.windowStart >= windowMs) {
                transaction.set(ref, { windowStart: now, count: 1, updatedAt: now });
                return { allowed: true, retryAfterSeconds: 0 };
            }

            if ((data.count ?? 0) >= limit) {
                const retryAfterSeconds = Math.max(
                    1,
                    Math.ceil((data.windowStart + windowMs - now) / 1000)
                );
                return { allowed: false, retryAfterSeconds };
            }

            transaction.update(ref, { count: (data.count ?? 0) + 1, updatedAt: now });
            return { allowed: true, retryAfterSeconds: 0 };
        });
    } catch (error) {
        console.error("Rate limit check failed:", error);
        // Fail open so a Firestore hiccup does not take the forms offline.
        return { allowed: true, retryAfterSeconds: 0 };
    }
}
