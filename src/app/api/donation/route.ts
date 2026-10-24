import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/server/firebase-admin";
import { checkRateLimit } from "@/lib/server/rate-limit";
import {
    getClientIp,
    hashRateLimitKey,
    jsonError,
    readJsonBody,
    sanitizeText,
} from "@/lib/server/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_AMOUNT = 10_000_000;
const MAX_BODY_BYTES = 100_000;

export async function POST(req: Request) {
    const db = getAdminDb();
    if (!db) {
        return jsonError("Donation service is not configured.", 503);
    }

    const ip = getClientIp(req);
    const rate = await checkRateLimit(
        `donation:${hashRateLimitKey(ip)}`,
        RATE_LIMIT,
        RATE_WINDOW_MS
    );
    if (!rate.allowed) {
        const minutes = Math.ceil(rate.retryAfterSeconds / 60);
        return jsonError(
            `Too many donation submissions. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
            429,
            rate.retryAfterSeconds
        );
    }

    const parsed = await readJsonBody(req, MAX_BODY_BYTES);
    if (!parsed.ok) {
        return jsonError(parsed.status === 413 ? "Request is too large." : "Invalid request.", parsed.status);
    }

    const body = parsed.body;

    // Honeypot: real users never fill this hidden field.
    if (typeof body.website === "string" && body.website.trim()) {
        return jsonError("Submission blocked.", 400);
    }

    const firstName = sanitizeText(body.firstName, 80);
    const lastName = sanitizeText(body.lastName, 80);
    const email = sanitizeText(body.email, 254);
    const phone = sanitizeText(body.phone, 20);
    const amount = Number(body.amount);
    const country = sanitizeText(body.country, 2);
    const city = sanitizeText(body.city, 100);
    const paymentMethod = sanitizeText(body.paymentMethod, 20);

    if (firstName.length < 2) {
        return jsonError("Enter a valid first name.", 400);
    }
    if (lastName.length < 2) {
        return jsonError("Enter a valid last name.", 400);
    }
    if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(email)) {
        return jsonError("Enter a valid email address.", 400);
    }
    if (phone.length < 7) {
        return jsonError("Enter a valid phone number.", 400);
    }
    if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) {
        return jsonError("Enter a valid donation amount.", 400);
    }
    if (!["card", "bank", "jazzcash", "easypaisa"].includes(paymentMethod)) {
        return jsonError("Select a valid payment method.", 400);
    }

    try {
        await db.collection("donations").add({
            firstName,
            lastName,
            name: `${firstName} ${lastName}`.trim(),
            email,
            phone,
            amount,
            country,
            city,
            paymentMethod,
            createdAt: FieldValue.serverTimestamp(),
        });
        return Response.json({ ok: true });
    } catch (error) {
        console.error("Failed to save donation:", error);
        return jsonError("Something went wrong. Please try again.", 500);
    }
}
