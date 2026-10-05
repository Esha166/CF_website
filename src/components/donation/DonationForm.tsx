"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";
import { isWithinCooldown, markSubmitted } from "@/lib/anti-spam";
import Image from "next/image";

const ChevronDown = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

// Validation functions
const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
const NAME_RE = /^[a-zA-Z\s'\-]{2,80}$/;
const PHONE_RE = /^[0-9\s\-\+\(\)]{7,20}$/;
const MAX_DONATION_AMOUNT = 10_000_000;

const CITIES_BY_COUNTRY: Record<string, string[]> = {
    PK: ["Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta"],
    US: ["New York", "Los Angeles", "Chicago", "Houston", "Washington"],
    UK: ["London", "Manchester", "Birmingham", "Liverpool", "Edinburgh"],
    AE: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Al Ain"],
};

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

function validateAmount(v: string) {
    if (!v) return "Amount is required.";
    const num = parseFloat(v);
    if (!Number.isFinite(num) || num <= 0 || num > MAX_DONATION_AMOUNT) return `Amount must be between 0 and ${MAX_DONATION_AMOUNT.toLocaleString()}.`;
    if (!/^\d+(\.\d{1,2})?$/.test(v)) return "Amount can have up to 2 decimal places.";
    return "";
}

function validatePhone(v: string) {
    if (!v.trim()) return "Phone number is required.";
    if (!PHONE_RE.test(v.trim())) return "Enter a valid phone number.";
    return "";
}

function sanitise(v: string) {
    return v.trim().replace(/<[^>]*>/g, "");
}

type FieldErrors = { 
    firstName: string; 
    lastName: string;
    email: string;
    phone: string;
    amount: string;
    country: string;
    city: string;
    paymentMethod: string;
};

const EMPTY_ERRORS: FieldErrors = { 
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    amount: "",
    country: "",
    city: "",
    paymentMethod: "",
};

export default function DonationForm() {
    const [form, setForm] = useState({
        firstName: "",
        email: "",
        country: "",
        amount: "",
        lastName: "",
        phone: "",
        city: "",
        paymentMethod: "",
    });

    const [errors, setErrors] = useState<FieldErrors>(EMPTY_ERRORS);
    const [touched, setTouched] = useState({ 
        firstName: false, 
        lastName: false,
        email: false,
        phone: false,
        amount: false,
        country: false,
        city: false,
        paymentMethod: false,
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [honeypot, setHoneypot] = useState("");

    const handle = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.value;
        setForm((p) => ({ ...p, [k]: value, ...(k === "country" ? { city: "" } : {}) }));
        setSubmitError("");

        // Live validate if field has been touched
        if (touched[k as keyof typeof touched]) {
            validateField(k, value);
        }
        if (k === "country") setErrors((prev) => ({ ...prev, city: "" }));
    };

    const validateField = (name: string, value: string) => {
        let error = "";
        switch (name) {
            case "firstName":
                error = validateName(value);
                break;
            case "lastName":
                error = validateName(value);
                break;
            case "email":
                error = validateEmail(value);
                break;
            case "phone":
                error = validatePhone(value);
                break;
            case "amount":
                error = validateAmount(value);
                break;
            case "country":
                if (!value.trim()) error = "Country is required.";
                break;
            case "city":
                if (!value.trim()) error = "City is required.";
                break;
            case "paymentMethod":
                if (!value.trim()) error = "Payment method is required.";
                break;
        }
        setErrors((prev) => ({ ...prev, [name]: error }));
        return error;
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched on submit
        setTouched({
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            amount: true,
            country: true,
            city: true,
            paymentMethod: true,
        });

        // Validate all fields
        const newErrors: FieldErrors = {
            firstName: validateName(form.firstName),
            lastName: validateName(form.lastName),
            email: validateEmail(form.email),
            phone: validatePhone(form.phone),
            amount: validateAmount(form.amount),
            country: form.country ? "" : "Country is required.",
            city: form.city ? "" : "City is required.",
            paymentMethod: form.paymentMethod ? "" : "Payment method is required.",
        };
        setErrors(newErrors);

        const hasErrors = Object.values(newErrors).some(Boolean);
        if (hasErrors) return;

        if (!db) {
            setSubmitError("Firebase is not initialized. Please check your environment variables.");
            return;
        }

        if (honeypot.trim()) {
            setSubmitError("Submission blocked.");
            return;
        }

        if (isWithinCooldown("donation", 60000)) {
            setSubmitError("Please wait a minute before submitting again.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: `${sanitise(form.firstName)} ${sanitise(form.lastName)}`.trim(),
                firstName: sanitise(form.firstName),
                lastName: sanitise(form.lastName),
                email: sanitise(form.email),
                phone: sanitise(form.phone),
                country: form.country,
                city: form.city,
                amount: parseFloat(form.amount),
                paymentMethod: form.paymentMethod,
                createdAt: serverTimestamp(),
            };
            await addDoc(collection(db, "donations"), payload);
            markSubmitted("donation");
            setSuccess(true);

            // Reset form
            setForm({
                firstName: "",
                email: "",
                country: "",
                amount: "",
                lastName: "",
                phone: "",
                city: "",
                paymentMethod: "",
            });
            setErrors(EMPTY_ERRORS);
            setTouched({
                firstName: false,
                lastName: false,
                email: false,
                phone: false,
                amount: false,
                country: false,
                city: false,
                paymentMethod: false,
            });
            setHoneypot("");
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error(err);
            setSubmitError("Failed to process donation. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fieldClass =
        "w-full px-4 py-3 rounded-lg border bg-white text-black text-sm placeholder-gray-400 outline-none focus:border-blue-400 transition-colors font-[inherit]";

    const selectClass =
        "w-full px-4 py-3 rounded-lg border bg-white text-sm outline-none focus:border-blue-400 transition-colors appearance-none cursor-pointer font-[inherit]";

    const getInputClass = (fieldName: keyof FieldErrors) => {
        const hasError = errors[fieldName];
        const borderColor = hasError ? "border-red-400 focus:ring-red-400" : "border-[#b0bec5] focus:ring-blue-400";
        return `${fieldClass} ${borderColor}`;
    };

    const getSelectClass = (fieldName: keyof FieldErrors) => {
        const hasError = errors[fieldName];
        const borderColor = hasError ? "border-red-400 focus:ring-red-400" : "border-[#b0bec5] focus:ring-blue-400";
        return `${selectClass} ${borderColor}`;
    };

    return (
        <div id="form" className="min-h-screen flex items-center justify-center px-4 py-10" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
            <div className="w-full 2xl:w-[80%]">

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-black tracking-tight mb-3">
                    <span className="text-accent-orange">Small Donations, Big Impact</span>
                </h1>
                <hr className="border-t border-[#b0bec5] mb-8" />

                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 font-semibold">Thank you! Your donation has been recorded successfully.</p>
                    </div>
                )}

                {/* Error Message */}
                {submitError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 font-semibold">{submitError}</p>
                    </div>
                )}

                {/* Two-col grid → single col on mobile */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start">
                    <label className="sr-only" aria-hidden="true">
                        Company
                        <input
                            type="text"
                            tabIndex={-1}
                            autoComplete="off"
                            value={honeypot}
                            onChange={(e) => setHoneypot(e.target.value)}
                        />
                    </label>

                    {/* ── LEFT: Form ── */}
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                            <label htmlFor="firstName" className="sr-only">First name</label>
                            <input
                                id="firstName"
                                className={getInputClass("firstName")}
                                placeholder="First Name"
                                name="firstName"
                                value={form.firstName}
                                onChange={handle("firstName")}
                                onBlur={handleBlur}
                            />
                            {errors.firstName && <span className="text-xs text-red-500">{errors.firstName}</span>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="lastName" className="sr-only">Last name</label>
                            <input
                                id="lastName"
                                className={getInputClass("lastName")}
                                placeholder="Last Name"
                                name="lastName"
                                value={form.lastName}
                                onChange={handle("lastName")}
                                onBlur={handleBlur}
                            />
                            {errors.lastName && <span className="text-xs text-red-500">{errors.lastName}</span>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="email" className="sr-only">Email</label>
                            <input
                                id="email"
                                className={getInputClass("email")}
                                placeholder="Email"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handle("email")}
                                onBlur={handleBlur}
                            />
                            {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="phone" className="sr-only">Phone number</label>
                            <input
                                id="phone"
                                className={getInputClass("phone")}
                                placeholder="Phone Number"
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handle("phone")}
                                onBlur={handleBlur}
                            />
                            {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
                        </div>

                        {/* Country */}
                        <div className="relative flex flex-col gap-1">
                            <label htmlFor="country" className="sr-only">Country</label>
                            <select
                                id="country"
                                className={`${getSelectClass("country")} ${!form.country ? "text-gray-400" : "text-black"}`}
                                name="country"
                                value={form.country}
                                onChange={handle("country")}
                                onBlur={handleBlur}
                            >
                                <option value="" disabled className="text-gray-400">Select country</option>
                                <option value="PK" className="text-black">Pakistan</option>
                                <option value="US" className="text-black">United States</option>
                                <option value="UK" className="text-black">United Kingdom</option>
                                <option value="AE" className="text-black">UAE</option>
                            </select>
                            <span className="absolute right-3.5 top-10 text-gray-400 pointer-events-none flex items-center">
                                <ChevronDown />
                            </span>
                            {errors.country && <span className="text-xs text-red-500">{errors.country}</span>}
                        </div>

                        {/* City */}
                        <div className="relative flex flex-col gap-1">
                            <label htmlFor="city" className="sr-only">City</label>
                            <select
                                id="city"
                                className={`${getSelectClass("city")} ${!form.city ? "text-gray-400" : "text-black"}`}
                                name="city"
                                value={form.city}
                                onChange={handle("city")}
                                onBlur={handleBlur}
                                disabled={!form.country}
                            >
                                <option value="" disabled className="text-gray-400">{form.country ? "Select city" : "Select country first"}</option>
                                {(CITIES_BY_COUNTRY[form.country] ?? []).map((city) => (
                                    <option key={city} value={city} className="text-black">{city}</option>
                                ))}
                            </select>
                            <span className="absolute right-3.5 top-10 text-gray-400 pointer-events-none flex items-center">
                                <ChevronDown />
                            </span>
                            {errors.city && <span className="text-xs text-red-500">{errors.city}</span>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="amount" className="sr-only">Donation amount</label>
                            <input
                                id="amount"
                                className={getInputClass("amount")}
                                placeholder="Amount"
                                type="number"
                                name="amount"
                                value={form.amount}
                                onChange={handle("amount")}
                                onBlur={handleBlur}
                                min="0.01"
                                max={MAX_DONATION_AMOUNT}
                                step="0.01"
                                inputMode="decimal"
                            />
                            {errors.amount && <span className="text-xs text-red-500">{errors.amount}</span>}
                        </div>

                        {/* Payment Method */}
                        <div className="relative flex flex-col gap-1">
                            <label htmlFor="paymentMethod" className="sr-only">Payment method</label>
                            <select
                                id="paymentMethod"
                                className={`${getSelectClass("paymentMethod")} ${!form.paymentMethod ? "text-gray-400" : "text-black"}`}
                                name="paymentMethod"
                                value={form.paymentMethod}
                                onChange={handle("paymentMethod")}
                                onBlur={handleBlur}
                            >
                                <option value="" disabled className="text-gray-400">Payment Method</option>
                                <option value="card" className="text-black">Credit / Debit Card</option>
                                <option value="bank" className="text-black">Bank Transfer</option>
                                <option value="jazzcash" className="text-black">JazzCash</option>
                                <option value="easypaisa" className="text-black">EasyPaisa</option>
                            </select>
                            <span className="absolute right-3.5 top-10 text-gray-400 pointer-events-none flex items-center">
                                <ChevronDown />
                            </span>
                            {errors.paymentMethod && <span className="text-xs text-red-500">{errors.paymentMethod}</span>}
                        </div>

                        {/* Donate button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-4 w-full py-3.5 rounded-full text-white font-bold text-base transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: "linear-gradient(135deg, var(--secondary-600) 0%, var(--secondary-500) 33%, var(--secondary-500) 66%, var(--secondary-600) 100%)",
                                boxShadow: "0 4px 14px rgba(13,59,122,0.35)",
                            }}
                        >
                            {loading ? "Processing..." : "Donate"}
                        </button>
                    </div>

                    {/* ── RIGHT: Next Goal ── */}
                    <div className="flex flex-col items-center w-full">
                        <h2 className="text-2xl md:text-[1.65rem] font-bold text-secondary-500 mb-2 text-center">
                            Turning Donations into Change
                        </h2>
                        <p className="text-sm text-primary-800 text-center leading-relaxed mb-6 ">
                            Empowering communities through education, technology, welfare support, sustainability, youth leadership initiatives and to help youth become self-dependent, skilled, and capable of building their own future.
                        </p>

                        {/* Overlapping images */}
                        <div className="relative w-full max-w-105 h-80 mb-7">

                            {/* Back image */}
                            <div className="absolute left-0 top-0 w-[42%] h-52.5 rounded-md overflow-hidden shadow-md z-10">
                                    <Image
                                    src="/donation/df1.png"
                                    alt="Community event"
                                        fill
                                        sizes="(max-width: 1024px) 42vw, 180px"
                                        className="object-cover object-top"
                                />
                            </div>

                            {/* Front image */}
                            <div
                                className="absolute left-[28%] top-13.75 w-[58%] h-65 rounded-md overflow-hidden z-20"
                                style={{ boxShadow: "0 6px 18px rgba(0,0,0,0.22)" }}
                            >
                                <Image
                                    src="/donation/donation.png"
                                    alt="Community gathering"
                                    fill
                                    sizes="(max-width: 1024px) 58vw, 240px"
                                    className="object-cover object-top"
                                />
                            </div>

                        </div>

                        {/* Progress */}
                        <div className="w-full">
                            <div className="flex justify-between mb-2">
                                <span className="font-bold text-base text-black">Progress</span>
                                <span className="font-bold text-base text-black">75%</span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-300 rounded-full overflow-hidden">
                                <div
                                    className="h-full w-3/4 rounded-full"
                                    style={{ background: "linear-gradient(90deg, var(--accent-orange), var(--color-orange))" }}
                                />
                            </div>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}
