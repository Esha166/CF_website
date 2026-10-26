import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/server/firebase-admin";
import { checkRateLimit } from "@/lib/server/rate-limit";
import {
    getClientIp,
    hashRateLimitKey,
    isValidEmail,
    isValidName,
    jsonError,
    readJsonBody,
    sanitizeText,
} from "@/lib/server/security";
import { verifyTurnstile } from "@/lib/server/turnstile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
    const db = getAdminDb();
    if (!db) {
        return jsonError("Contact service is not configured.", 503);
    }

    const ip = getClientIp(req);
    const rate = await checkRateLimit(
        `contact:${hashRateLimitKey(ip)}`,
        RATE_LIMIT,
        RATE_WINDOW_MS
    );
    if (!rate.allowed) {
        const minutes = Math.ceil(rate.retryAfterSeconds / 60);
        return jsonError(
            `Too many messages. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
            429,
            rate.retryAfterSeconds
        );
    }

    const parsed = await readJsonBody(req);
    if (!parsed.ok) {
        return jsonError(
            parsed.status === 413 ? "Request is too large." : "Invalid request.",
            parsed.status
        );
    }
    const body = parsed.body;

    // Honeypot: real users never fill this hidden field.
    if (typeof body.website === "string" && body.website.trim()) {
        return jsonError("Submission blocked.", 400);
    }

    const turnstile = await verifyTurnstile(body.turnstileToken, ip);
    if (!turnstile.ok) {
        return jsonError(turnstile.error ?? "Verification failed.", 403);
    }

    const name = sanitizeText(body.name, 80);
    const email = sanitizeText(body.email, 254);
    const message = sanitizeText(body.message, 2000, true);

    if (!isValidName(name)) {
        return jsonError("Enter a valid name (letters only, 2-80 chars).", 400);
    }
    if (!isValidEmail(email)) {
        return jsonError("Enter a valid email address.", 400);
    }
    if (message.length < 10) {
        return jsonError("Message must be at least 10 characters.", 400);
    }

    try {
        await db.collection("contacts").add({
            name,
            email,
            subject: "Website Contact",
            message,
            timestamp: new Date().toLocaleString(),
            createdAt: FieldValue.serverTimestamp(),
        });
        return Response.json({ ok: true });
    } catch (error) {
        console.error("Failed to save contact message:", error);
        return jsonError("Something went wrong. Please try again.", 500);
    }
}
