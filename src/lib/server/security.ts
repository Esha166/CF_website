import { createHash } from "crypto";

const EMAIL_RE =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

const NAME_RE = /^[a-zA-Z\s'\-.]{2,80}$/;

export function getClientIp(req: Request): string {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0]!.trim();
    return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export function hashRateLimitKey(value: string): string {
    return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

export function isValidEmail(value: string): boolean {
    return EMAIL_RE.test(value);
}

export function isValidName(value: string): boolean {
    return NAME_RE.test(value);
}

// Strips control characters and any HTML tags so the stored value is plain
// text. React escapes all of this again when it renders, which prevents stored
// XSS without corrupting apostrophes or other normal characters.
export function sanitizeText(
    value: unknown,
    maxLength: number,
    multiline = false
): string {
    if (typeof value !== "string") return "";

    let clean = value
        .normalize("NFKC")
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
        .replace(/<[^>]*>/g, " ");

    clean = multiline
        ? clean.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n")
        : clean.replace(/\s+/g, " ");

    return clean.trim().slice(0, maxLength);
}

export function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export type JsonBodyResult =
    | { ok: true; body: Record<string, unknown> }
    | { ok: false; status: 400 | 413 };

// Reads a JSON object with an actual size cap. Content-Length can be omitted
// or spoofed, so the decoded text length is checked as well.
export async function readJsonBody(
    req: Request,
    maxBytes = 20_000
): Promise<JsonBodyResult> {
    const declared = Number(req.headers.get("content-length") ?? 0);
    if (Number.isFinite(declared) && declared > maxBytes) {
        return { ok: false, status: 413 };
    }

    const raw = await req.text().catch(() => "");
    if (new TextEncoder().encode(raw).length > maxBytes) {
        return { ok: false, status: 413 };
    }

    try {
        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            return { ok: false, status: 400 };
        }
        return { ok: true, body: parsed as Record<string, unknown> };
    } catch {
        return { ok: false, status: 400 };
    }
}

export function jsonError(
    message: string,
    status: number,
    retryAfterSeconds?: number
): Response {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (retryAfterSeconds) headers["Retry-After"] = String(retryAfterSeconds);
    return new Response(JSON.stringify({ error: message }), { status, headers });
}
