"use client";

import { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        turnstile?: {
            render: (
                container: HTMLElement,
                options: {
                    sitekey: string;
                    theme?: "light" | "dark" | "auto";
                    size?: "normal" | "compact" | "flexible";
                    callback?: (token: string) => void;
                    "expired-callback"?: () => void;
                    "error-callback"?: () => void;
                }
            ) => string;
            reset: (widgetId?: string) => void;
            remove: (widgetId?: string) => void;
        };
    }
}

const SCRIPT_ID = "cf-turnstile-script";
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

interface TurnstileProps {
    onVerify: (token: string) => void;
    resetKey?: number;
    className?: string;
}

export default function Turnstile({
    onVerify,
    resetKey = 0,
    className = "",
}: TurnstileProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const onVerifyRef = useRef(onVerify);
    const [isNarrow, setIsNarrow] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia("(max-width: 380px]").matches;
    });

    useEffect(() => {
        onVerifyRef.current = onVerify;
    }, [onVerify]);

    // Detect sub-320px viewports so the widget can scale down instead of
    // overflowing the parent form horizontally.
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 380px)");
        const update = () => setIsNarrow(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    useEffect(() => {
        if (!SITE_KEY || !containerRef.current) return;

        let cancelled = false;

        const renderWidget = () => {
            if (
                cancelled ||
                !containerRef.current ||
                !window.turnstile ||
                widgetIdRef.current
            ) {
                return;
            }
            widgetIdRef.current = window.turnstile.render(containerRef.current, {
                sitekey: SITE_KEY,
                theme: "light",
                size: isNarrow ? "compact" : "flexible",
                callback: (token) => onVerifyRef.current(token),
                "expired-callback": () => onVerifyRef.current(""),
                "error-callback": () => onVerifyRef.current(""),
            });
        };

        let script: HTMLScriptElement | null = null;

        if (window.turnstile) {
            renderWidget();
        } else {
            script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
            if (!script) {
                script = document.createElement("script");
                script.id = SCRIPT_ID;
                script.src =
                    "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
            }
            script.addEventListener("load", renderWidget);
        }

        return () => {
            cancelled = true;
            script?.removeEventListener("load", renderWidget);
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                } catch {
                    // Widget may already be detached.
                }
                widgetIdRef.current = null;
            }
        };
    }, [isNarrow]);

    useEffect(() => {
        if (widgetIdRef.current && window.turnstile) {
            window.turnstile.reset(widgetIdRef.current);
        }
    }, [resetKey]);

    if (!SITE_KEY) return null;

    return (
        <div className={`w-full max-w-full overflow-hidden min-w-0 flex justify-center sm:justify-start ${className}`}>
            <div ref={containerRef} className="w-full max-w-full overflow-hidden min-w-0" />
        </div>
    );
}
