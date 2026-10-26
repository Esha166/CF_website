const VERIFY_URL =
    "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export interface TurnstileResult {
    ok: boolean;
    error?: string;
}

export async function verifyTurnstile(
    token: unknown,
    ip: string
): Promise<TurnstileResult> {
    const secret = process.env.TURNSTILE_SECRET_KEY;

    // Not configured yet: allow submissions so local development still works.
    if (!secret) return { ok: true };

    if (typeof token !== "string" || !token.trim()) {
        return { ok: false, error: "Please complete the human verification." };
    }

    try {
        const body = new URLSearchParams({
            secret,
            response: token,
        });
        if (ip && ip !== "unknown") body.set("remoteip", ip);

        const res = await fetch(VERIFY_URL, {
            method: "POST",
            body,
            cache: "no-store",
        });
        const data = (await res.json()) as { success?: boolean };

        return data.success
            ? { ok: true }
            : {
                ok: false,
                error: "Verification failed. Please refresh the page and try again.",
            };
    } catch (error) {
        console.error("Turnstile verification failed:", error);
        return {
            ok: false,
            error: "Verification service is unavailable. Please try again.",
        };
    }
}
