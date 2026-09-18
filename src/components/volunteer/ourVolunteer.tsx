"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

const TESTIMONIALS = [
    {
        name: "Manal Kafeel",
        role: "Volunteer — Content Writer",
        quote:
            "My six-month journey as a Content Writer team member at Combine Foundation has been one of the most helpful and meaningful experiences in my content writing journey. This is where I truly learned how to research properly, structure content, and write with clarity and purpose. Working on education and health-related topics felt very close to my heart, which motivated me to give my best. The team and coordinators were extremely supportive, patient, and understanding, especially during deadlines or delays, which created a positive and stress-free working environment. Being part of such a cooperative and respectful team helped me grow not only as a writer but also as a responsible team member. Overall, this experience strengthened my confidence, improved my skills, and made me more passionate about purpose-driven content writing.",
        image: "/volunteer-program/testimonial.svg",
    },
    {
        name: "Sadain Zafar",
        role: "Volunteer",
        quote:
            "Joining Combine Foundation was a great learning experience for me. Through this volunteer program, I improved my communication, teamwork, and professional skills while working on real-world projects. The environment is very supportive, peaceful, and motivating for students and young professionals. I also got the opportunity to connect with talented people, learn from industry professionals, and gain practical experience that helped strengthen my confidence and career growth. I highly recommend this volunteer program to anyone who wants to create positive impact while building their future.",
        image: "/avatar.svg",
    },
];

type Direction = "next" | "prev";

export default function HearFromVolunteers() {
    const [current, setCurrent] = useState(0);
    const [sliding, setSliding] = useState(false);
    const [direction, setDirection] = useState<Direction>("next");
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const goNext = useCallback(() => {
        if (sliding) return;
        setDirection("next");
        setSliding(true);
        setTimeout(() => {
            setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
            setSliding(false);
        }, 400);
    }, [sliding]);

    const goPrev = useCallback(() => {
        if (sliding) return;
        setDirection("prev");
        setSliding(true);
        setTimeout(() => {
            setCurrent((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
            setSliding(false);
        }, 400);
    }, [sliding]);

    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            goNext();
        }, 6000);
    }, [goNext]);

    useEffect(() => {
        startTimer();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [startTimer]);

    const handleNext = () => {
        goNext();
        startTimer();
    };

    const handlePrev = () => {
        goPrev();
        startTimer();
    };

    const t = TESTIMONIALS[current];

    return (
        <section className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
            <div>

                {/* Title */}
                <h2 className="text-4xl md:text-5xl font-extrabold text-secondary-500 tracking-tight mb-4">
                    What Volunteers Love About Us
                </h2>
                {/* Full-width divider */}
                <div className="w-full h-1 bg-gray-300 mb-12" />

                {/* Content row with transition */}
                <div 
                    className="flex flex-col min-[550px]:flex-row items-center gap-8 md:gap-16"
                    style={{
                        opacity: sliding ? 0 : 1,
                        transform: sliding
                            ? direction === "next"
                                ? "translateX(-20px)"
                                : "translateX(20px)"
                            : "translateX(0)",
                        transition: "opacity 0.4s ease, transform 0.4s ease",
                    }}
                >

                    {/* ── Left: text ── */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-center min-[550px]:justify-start gap-x-3 gap-y-1 mb-4">
                            <span className="text-lg md:text-xl font-bold text-secondary-500 whitespace-nowrap">
                                {t.name}
                            </span>
                            <span className="text-primary-700 font-light text-lg select-none">—</span>
                            <span className="text-sm md:text-base text-primary-800 font-medium">
                                {t.role}
                            </span>
                        </div>

                        <p className="text-sm md:text-base text-primary-800 leading-relaxed text-center min-[550px]:text-left">
                            {t.quote}
                        </p>
                    </div>

                    {/* ── Right: image ── */}
                    <div className="relative shrink-0 w-full min-[550px]:w-72 h-[320px] min-[550px]:h-72">
                        <div className="relative w-full h-full rounded-2xl overflow-hidden z-10">
                            <Image
                                src={t.image || "/avatar.svg"}
                                alt={t.name}
                                fill
                                className="object-cover object-top"
                                sizes="(max-width: 768px) 100vw, 192px"
                            />
                        </div>
                    </div>

                </div>

                {/* ── Footer: Nav buttons ── */}
                <div className="flex justify-center sm:justify-end gap-3 mt-12">
                    <button
                        onClick={handlePrev}
                        aria-label="Previous"
                        className="w-10 h-10 rounded-full bg-secondary-500 flex items-center justify-center
                       transition-all duration-200 hover:brightness-90 hover:scale-105 active:scale-95"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M10 12L6 8l4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <button
                        onClick={handleNext}
                        aria-label="Next"
                        className="w-10 h-10 rounded-full bg-secondary-500 flex items-center justify-center
                       transition-all duration-200 hover:brightness-90 hover:scale-105 active:scale-95"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M6 4l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

            </div>
        </section>
    );
}
