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
import { verifyTurnstile } from "@/lib/server/turnstile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const BLOG_ID_RE = /^[A-Za-z0-9_-]{1,200}$/;

function formatCommentDate(date: Date) {
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export async function POST(req: Request) {
    const db = getAdminDb();
    if (!db) {
        return jsonError("Comment service is not configured.", 503);
    }

    const ip = getClientIp(req);
    const rate = await checkRateLimit(
        `comment:${hashRateLimitKey(ip)}`,
        RATE_LIMIT,
        RATE_WINDOW_MS
    );
    if (!rate.allowed) {
        const minutes = Math.ceil(rate.retryAfterSeconds / 60);
        return jsonError(
            `Too many comments. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
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

    if (typeof body.website === "string" && body.website.trim()) {
        return jsonError("Submission blocked.", 400);
    }

    const turnstile = await verifyTurnstile(body.turnstileToken, ip);
    if (!turnstile.ok) {
        return jsonError(turnstile.error ?? "Verification failed.", 403);
    }

    const blogId = sanitizeText(body.blogId, 200);
    const name = sanitizeText(body.name, 80);
    const text = sanitizeText(body.text, 2000, true);

    if (!BLOG_ID_RE.test(blogId)) {
        return jsonError("Invalid article.", 400);
    }
    if (name.length < 2) {
        return jsonError("Name must be at least 2 characters.", 400);
    }
    if (text.length < 5 || text.trim().split(/\s+/).length < 5) {
        return jsonError("Comment must be at least 5 words.", 400);
    }

    try {
        const blogRef = db.collection("blogs").doc(blogId);
        const blog = await blogRef.get();
        if (!blog.exists) {
            return jsonError("Article not found.", 404);
        }

        const createdAt = new Date();
        const ref = await blogRef.collection("comments").add({
            name,
            text,
            avatar: "",
            createdAt: FieldValue.serverTimestamp(),
        });

        return Response.json({
            comment: {
                id: ref.id,
                name,
                date: formatCommentDate(createdAt),
                text,
                avatar: "",
            },
        });
    } catch (error) {
        console.error("Failed to save comment:", error);
        return jsonError("Failed to post comment. Please try again.", 500);
    }
}
