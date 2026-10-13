"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";
import { isWithinCooldown, markSubmitted } from "@/lib/anti-spam";
// import type { Message } from "@/lib/collections";

// ── Strict validators (work regardless of input type) ──────────────────────
const EMAIL_RE =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

const NAME_RE = /^[a-zA-Z\s'\-]{2,80}$/;

function validateName(v: string) {
    if (!v.trim()) return "Name is required.";
    if (!NAME_RE.test(v.trim())) return "Enter a valid name (letters only, 2–80 chars).";
    return "";
}

function validateEmail(v: string) {
    if (!v.trim()) return "Email is required.";
    if (!EMAIL_RE.test(v.trim())) return "Enter a valid email address.";
    return "";
}

function validateMessage(v: string) {
    if (!v.trim()) return "Message is required.";
    if (v.trim().length < 10) return "Message must be at least 10 characters.";
    if (v.trim().length > 2000) return "Message must be under 2000 characters.";
    return "";
}

// ── Sanitise: strip HTML/script tags before storing ────────────────────────
function sanitise(v: string) {
    return v.trim().replace(/<[^>]*>/g, "");
}

type FieldErrors = { name: string; email: string; message: string };

const EMPTY_ERRORS: FieldErrors = { name: "", email: "", message: "" };

const ContactForm = () => {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [errors, setErrors] = useState<FieldErrors>(EMPTY_ERRORS);
    const [touched, setTouched] = useState({ name: false, email: false, message: false });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [honeypot, setHoneypot] = useState("");

    // Validate a single field and return the error string
    const validateField = (name: string, value: string) => {
        if (name === "name") return validateName(value);
        if (name === "email") return validateEmail(value);
        if (name === "message") return validateMessage(value);
        return "";
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setSubmitError("");

        // Live-validate only after field has been touched
        if (touched[name as keyof typeof touched]) {
            setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
        }
    };

    const handleBlur = (
        e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched on submit
        setTouched({ name: true, email: true, message: true });

        const newErrors: FieldErrors = {
            name: validateName(form.name),
            email: validateEmail(form.email),
            message: validateMessage(form.message),
        };
        setErrors(newErrors);

        const hasErrors = Object.values(newErrors).some(Boolean);
        if (hasErrors) return;

        if (!db) {
            setSubmitError(
                "Firebase is not initialized. Please check your environment variables."
            );
            return;
        }

        if (honeypot.trim()) {
            setSubmitError("Submission blocked.");
            return;
        }

        if (isWithinCooldown("contact", 60000)) {
            setSubmitError("Please wait a minute before sending another message.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: sanitise(form.name),
                email: sanitise(form.email),
                subject: "Website Contact",
                message: sanitise(form.message),
                timestamp: new Date().toLocaleString(),
                createdAt: serverTimestamp(),
            };
            await addDoc(collection(db, "contacts"), payload);
            markSubmitted("contact");
            setSuccess(true);
            setForm({ name: "", email: "", message: "" });
            setErrors(EMPTY_ERRORS);
            setTouched({ name: false, email: false, message: false });
            setHoneypot("");
        } catch (err) {
            console.error(err);
            setSubmitError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Shared input style — scales text and padding with viewport
    const baseInput =
        "w-full border rounded-md px-4 py-3 lg:px-5 lg:py-4 " +
        "text-sm lg:text-base xl:text-lg " +
        "text-gray-700 placeholder-gray-400 bg-white " +
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

    const fieldClass = (err: string) =>
        `${baseInput} ${err ? "border-red-400 focus:ring-red-400" : "border-gray-300"}`;

    return (
        <section className="max-w-[1500px] w-full mx-auto px-4 md:px-6 lg:px-8 py-10">
            <div className="w-full">
                {/* Header */}
                <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-secondary-500 mb-2">
                    Contact form
                </h2>
                <hr className="border-gray-200 mb-8 lg:mb-10" />

                <div className="flex flex-col md:flex-row gap-10 lg:gap-16 xl:gap-24">

                    {/* ── Left: Form ─────────────────────────────────────────── */}
                    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 flex-1">
                        <label className="sr-only" aria-hidden="true">
                            Website
                            <input
                                type="text"
                                tabIndex={-1}
                                autoComplete="off"
                                value={honeypot}
                                onChange={(e) => setHoneypot(e.target.value)}
                            />
                        </label>

                        {/* Name */}
                        <div className="flex flex-col gap-1">
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={form.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                autoComplete="name"
                                maxLength={80}
                                aria-invalid={!!errors.name}
                                aria-describedby={errors.name ? "name-error" : undefined}
                                className={fieldClass(errors.name)}
                            />
                            {errors.name && (
                                <p id="name-error" className="text-xs lg:text-sm text-red-500 pl-1">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Email — type="text" to prove validation is JS-only */}
                        <div className="flex flex-col gap-1">
                            <input
                                type="text"
                                name="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                autoComplete="email"
                                inputMode="email"
                                maxLength={254}
                                aria-invalid={!!errors.email}
                                aria-describedby={errors.email ? "email-error" : undefined}
                                className={fieldClass(errors.email)}
                            />
                            {errors.email && (
                                <p id="email-error" className="text-xs lg:text-sm text-red-500 pl-1">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Message */}
                        <div className="flex flex-col gap-1">
                            <textarea
                                name="message"
                                placeholder="Message"
                                rows={5}
                                value={form.message}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                maxLength={2000}
                                aria-invalid={!!errors.message}
                                aria-describedby={errors.message ? "message-error" : undefined}
                                className={`${fieldClass(errors.message)} resize-none`}
                            />
                            <div className="flex items-start justify-between pl-1">
                                {errors.message ? (
                                    <p id="message-error" className="text-xs lg:text-sm text-red-500">
                                        {errors.message}
                                    </p>
                                ) : (
                                    <span />
                                )}
                                <span className="text-xs text-gray-400 ml-auto">
                                    {form.message.length}/2000
                                </span>
                            </div>
                        </div>

                        {submitError && (
                            <p className="text-sm lg:text-base text-red-500">{submitError}</p>
                        )}
                        {success && (
                            <p className="text-sm lg:text-base text-green-600 font-medium">
                                ✓ Message sent successfully!
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 lg:py-4 rounded-full bg-gradient-to-r from-[var(--secondary-600)] via-[var(--secondary-500)] to-[var(--secondary-600)] hover:brightness-110
                                       text-white text-sm lg:text-base xl:text-lg
                                       font-semibold tracking-wide transition-all duration-200
                                       disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {loading ? "Sending…" : "Send Message"}
                        </button>
                    </form>

                    {/* ── Right: Contact Info ─────────────────────────────────── */}
                    <div className="flex flex-col gap-6 md:w-64 lg:w-80 xl:w-96">

                        {/* Address */}
                        <div className="flex flex-col">
                            <span className="mt-0.5 flex-shrink-0 text-secondary-500">
                                <svg width="22" height="22" className="lg:w-6 lg:h-6" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="1.8"
                                    strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                    <circle cx="12" cy="9" r="2.5" />
                                </svg>
                            </span>
                            <p className="text-sm lg:text-base xl:text-lg text-black font-semibold leading-relaxed mt-1">
                                B-18 Block 16 Gulshan-e-Iqbal near Expo Centre main University Road Karachi, Sindh, Pakistan
                            </p>
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col mb-1">
                            <span className="flex-shrink-0 text-secondary-500">
                                <svg width="22" height="22" className="lg:w-6 lg:h-6" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="1.8"
                                    strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07
                                             19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3
                                             a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91
                                             a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7
                                             A2 2 0 0122 16.92z" />
                                </svg>
                            </span>
                            <p className="text-sm lg:text-base xl:text-lg text-black font-semibold">
                                +92 320 8686644
                            </p>
                        </div>

                        {/* Email */}
                        <div className="flex flex-col">
                            <span className="flex-shrink-0 text-secondary-500">
                                <svg width="22" height="22" className="lg:w-6 lg:h-6" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="1.8"
                                    strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            </span>

                            <a
                                href="mailto:info@combinefoundation.org"
                                className="text-sm lg:text-base xl:text-lg font-semibold text-black hover:text-blue-600 transition-colors"
                            >
                                info@combinefoundation.org
                            </a>
                        </div>

                        {/* Social Icons */}
                        <div className="flex items-center gap-5 mt-1">
                            {/* Instagram */}
                            <a href="https://www.instagram.com/combinefoundation" aria-label="Instagram"
                                className="text-secondary-500 hover:text-pink-500 transition-colors">
                                <svg width="22" height="22" className="lg:w-6 lg:h-6" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="1.8"
                                    strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                </svg>
                            </a>
                            {/* Facebook */}
                            <a href="https://www.facebook.com/combinefoundationoffical" aria-label="Facebook"
                                className="text-secondary-500 hover:text-blue-600 transition-colors">
                                <svg width="22" height="22" className="lg:w-6 lg:h-6" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="1.8"
                                    strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                                </svg>
                            </a>
                            {/* LinkedIn */}
                            <a href="https://www.linkedin.com/company/combine-foundation/" aria-label="LinkedIn"
                                className="text-secondary-500 hover:text-blue-700 transition-colors">
                                <svg width="22" height="22" className="lg:w-6 lg:h-6" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="1.8"
                                    strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                                    <rect x="2" y="9" width="4" height="12" />
                                    <circle cx="4" cy="4" r="2" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactForm;
