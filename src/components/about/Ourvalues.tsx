"use client";

import { useEffect, useRef, useState } from "react";
import SectionHeader from "@/components/UI/SectionHeader";
type Value = {
    id: number;
    urdu: string;
    english: string;
    description: string;
};

const values: Value[] = [
    {
        id: 1,
        urdu: "بااختیاربنانا",
        english: "Empowerment",
        description:
            "Equipping individuals with the tools, knowledge, and confidence to take control of their lives and create meaningful change in their communities.",
    },
    {
        id: 2,
        urdu: "قیادت",
        english: "Leadership",
        description:
            "Developing visionary leaders who inspire others, drive positive change, and take initiative to solve challenges facing their communities.",
    },
    {
        id: 3,
        urdu: "پائیداری",
        english: "Sustainability",
        description:
            "Promoting long-term environmental, social, and economic practices that ensure a better future for generations to come.",
    },
    {
        id: 4,
        urdu: "خود انحصاری",
        english: "Self-reliance",
        description:
            "Fostering independence and self-sufficiency so individuals and communities can thrive without external dependency.",
    },
    {
        id: 5,
        urdu: "ہمدردی",
        english: "Compassion",
        description:
            "Leading with empathy and kindness, understanding the needs of others, and working to uplift those who are underserved.",
    },
    {
        id: 6,
        urdu: "سالمیت",
        english: "Integrity",
        description:
            "Upholding the highest standards of honesty, transparency, and ethical conduct in all our actions and decisions.",
    },
];


type ValueCardProps = {
    value: Value;
};

function ValueCard({ value }: ValueCardProps) {
    const [hovered, setHovered] = useState<boolean>(false);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="relative overflow-hidden rounded-2xl flex items-center justify-center text-center px-6 py-10 cursor-pointer bg-secondary-600"
            style={{ minHeight: "290px" }}
        >
            {/* DEFAULT STATE */}
            <div
                className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ease-out
        ${hovered ? "opacity-0 translate-y-4 scale-95" : "opacity-100 translate-y-0 scale-100"}`}
            >
                <p
                    className="text-white text-2xl mb-1"
                    style={{ fontFamily: "serif", direction: "rtl" }}
                >
                    {value.urdu}
                </p>
                <p className="text-white font-bold text-xl italic">
                    {value.english}
                </p>
            </div>

            {/* HOVER STATE */}
            <div
                className={`absolute inset-0 flex flex-col items-center justify-center px-4 transition-all duration-500 ease-out
        ${hovered ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-4 scale-95"}`}
            >
                <p className="text-white font-bold text-lg mb-3">
                    <span className="font-normal" style={{ fontFamily: "serif" }}>
                        {value.urdu}
                    </span>{" "}
                    {value.english}
                </p>
                <p className="text-white/85 text-sm leading-6">
                    {value.description}
                </p>
            </div>
        </div>
    );
}

export default function OurValues() {
    const sliderRef = useRef<HTMLDivElement | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isAutoScrollingRef = useRef(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const stopAutoScroll = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const scrollToIndex = (index: number, fromAuto = false) => {
        const container = sliderRef.current;
        if (!container) return;

        const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
        const card = container.children.item(clampedIndex) as HTMLElement | null;
        if (!card) return;

        if (!fromAuto) {
            stopAutoScroll();
        }

        isAutoScrollingRef.current = fromAuto;
        container.scrollTo({
            left: card.offsetLeft - container.offsetLeft,
            behavior: "smooth",
        });
        setActiveIndex(clampedIndex);
    };

    const startAutoScroll = () => {
        stopAutoScroll();
        timerRef.current = setInterval(() => {
            setActiveIndex((current) => {
                const next = (current + 1) % values.length;
                scrollToIndex(next, true);
                return next;
            });
        }, 4500);
    };

    const handleScroll = () => {
        const container = sliderRef.current;
        if (!container || isAutoScrollingRef.current) return;

        const center = container.scrollLeft + container.clientWidth / 2;
        let closestIndex = 0;
        let closestDistance = Number.POSITIVE_INFINITY;

        Array.from(container.children).forEach((child, index) => {
            const element = child as HTMLElement;
            const childCenter = element.offsetLeft + element.offsetWidth / 2;
            const distance = Math.abs(center - childCenter);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        setActiveIndex(closestIndex);
    };

    useEffect(() => {
        startAutoScroll();
        return () => stopAutoScroll();
    }, []);

    return (
        <section className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-14 w-full">

            <SectionHeader title="Our Values" />

            <div
                ref={sliderRef}
                onScroll={handleScroll}
                onTouchStart={stopAutoScroll}
                onTouchEnd={startAutoScroll}
                onMouseDown={stopAutoScroll}
                onMouseUp={startAutoScroll}
                className="mt-15 w-full flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-4 px-4 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {values.map((value) => (
                    <div key={value.id} className="min-w-full snap-center">
                        <ValueCard value={value} />
                    </div>
                ))}
            </div>

            <div className="mt-15 hidden grid-cols-1 gap-4 w-full sm:grid sm:grid-cols-2 lg:grid-cols-3">
                {values.map((value) => (
                    <ValueCard key={value.id} value={value} />
                ))}
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 md:hidden">
                {values.map((_, index) => (
                    <button
                        key={index}
                        type="button"
                        aria-label={`Go to value ${index + 1}`}
                        onClick={() => scrollToIndex(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                            activeIndex === index ? "w-6 bg-secondary-500" : "w-2 bg-gray-300"
                        }`}
                    />
                ))}
            </div>
        </section>
    );
}
