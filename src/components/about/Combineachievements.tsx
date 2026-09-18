"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SectionHeader from "@/components/UI/SectionHeader";
import FadeImage from "@/components/UI/FadeImage";
type Achievement = {
    id: number;
    title: string;
    paragraphs: string[];
    images: string[];
};

const achievements: Achievement[] = [
    {
        id: 1,
        title: "3,000+ Lives Impacted Through Meaningful Programs",
        paragraphs: [
            "The Combine Foundation has brought positive change into the lives of more than 3,000 people. Our programs aim to provide students, professionals, and communities with the necessary skills, knowledge, and opportunities for growth and development.",
            "By providing free webinars, skill-building training sessions, and high-demand Information Technology training programs at up to 95% scholarships, Combine Foundation impacted 3,000+ lives and made them capable of leading their lives.",
        ],
        images: [
            "/about/galleryimgs/1.svg",
            "/about/galleryimgs/2.svg",
            "/about/galleryimgs/3.svg",
            "/about/galleryimgs/4.svg",
        ],
    },
    {
        id: 2,
        title: "204+ Students Trained in Technology & Professional Skills",
        paragraphs: [
            "By providing training through our technology and development programs, 204+ students have been empowered with the skills and confidence required to develop careers in the IT sector. This was achieved through the provision of 95% scholarship that we provide, which made high-quality IT education available to highly talented people who would not have received it under original price.",
            "Today, these students are earning good amounts of income, paying for their education, providing for their families, and making full-time careers within the technology sector. These are just some examples that demonstrate the positive effects of access to education, skill development, and making a difference by creating opportunities.",
        ],
        images: [
            "/about/galleryimgs/5.svg",
            "/about/galleryimgs/6.svg",
            "/about/galleryimgs/7.svg",
            "/about/galleryimgs/8.svg",
        ],
    },
    {
        id: 3,
        title: "Growing a Network of Dedicated 40+ Youth Leaders and 250+ Volunteers",
        paragraphs: [
            "With 40+ youth leaders and 250+ volunteers, we are giving young people of Pakistan the opportunity to develop important qualities such as leadership and decision-making apart from traditional academics. With our community projects, social causes, and various experiences, the young generation involved can gain enough confidence and exposure to develop themselves as good leaders and responsible citizens.",
            "For those volunteers who are interested in contributing to a better society, our organization offers special volunteer programs related to sustainability, environmental awareness, and other social causes. These programs give volunteers the opportunity to make a difference, help others in their community, and spread what they know among people.",
        ],
        images: [
            "/about/galleryimgs/9.svg",
            "/about/galleryimgs/10.svg",
            "/about/galleryimgs/11.svg",
            "/about/galleryimgs/12.svg",
        ],
    },
    {
        id: 4,
        title: "Shaping Futures Through 9 Professional Courses",
        paragraphs: [
            "By means of 9+ professional and industry-specific courses, we are training young people to equip themselves with relevant skills that will enable them to survive in the modern economy. Some of the professional training courses offered include web development, Meta ads mastery, quantitative finance, Python programming, AI automation, among others.",
            "To ensure that lack of finances does not become a barrier for any bright learner from taking these courses, we offer up to 95% scholarship grants to deserving candidates. Many of the students that enroll in these courses have become financially independent and are either self-employed or employed, making positive contributions in their lives and career paths.",
        ],
        images: [
            "/about/galleryimgs/13.svg",
            "/about/galleryimgs/14.svg",
            "/about/galleryimgs/15.svg",
            "/about/galleryimgs/16.svg",
        ],
    }
];

type Direction = "next" | "prev";

export default function CombineAchievements() {
    const [current, setCurrent] = useState<number>(0);
    const [sliding, setSliding] = useState<boolean>(false);
    const [direction, setDirection] = useState<Direction>("next");
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const goTo = useCallback(
        (dir: Direction) => {
            if (sliding) return;
            setDirection(dir);
            setSliding(true);
            setTimeout(() => {
                setCurrent((prev) =>
                    dir === "next"
                        ? (prev + 1) % achievements.length
                        : (prev - 1 + achievements.length) % achievements.length
                );
                setSliding(false);
            }, 350);
        },
        [sliding]
    );

    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => goTo("next"), 5000);
    }, [goTo]);

    useEffect(() => {
        startTimer();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [startTimer]);

    const handlePrev = () => {
        goTo("prev");
        startTimer();
    };

    const handleNext = () => {
        goTo("next");
        startTimer();
    };

    const item = achievements[current];

    return (
        <section className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-14">
            <SectionHeader title="Combine Foundation Impact & Achievements" />

            <div
                className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 flex flex-col md:flex-row gap-8 overflow-hidden justify-center items-center"
                style={{
                    opacity: sliding ? 0 : 1,
                    transform: sliding
                        ? direction === "next"
                            ? "translateX(-16px)"
                            : "translateX(16px)"
                        : "translateX(0)",
                    transition: "opacity 0.35s ease, transform 0.35s ease",
                }}
            >
                <div className="flex-1">
                    <h3 className="text-secondary-500 font-bold text-xl md:text-2xl mb-4">
                        {item.title}
                    </h3>
                    <div className="space-y-4">
                        {item.paragraphs.map((para, i) => (
                            <p key={i} className="text-orange text-sm leading-5">
                                {para}
                            </p>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 shrink-0 w-full md:w-[52%]">
                    {item.images.map((src, i) => (
                        <div
                            key={i}
                            className="relative rounded-xl overflow-hidden"
                            style={{ height: "clamp(120px, 14vw, 190px)" }}
                        >
                            <FadeImage
                                src={src}
                                alt={`${item.title} image ${i + 1}`}
                                fill
                                className="object-cover object-top"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-5">
                <button
                    onClick={handlePrev}
                    aria-label="Previous achievement"
                    className="w-11 h-11 rounded-full bg-secondary-500 hover:brightness-90 text-white flex items-center justify-center transition-all duration-200 cursor-pointer"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <button
                    onClick={handleNext}
                    aria-label="Next achievement"
                    className="w-11 h-11 rounded-full bg-secondary-500 hover:brightness-90 text-white flex items-center justify-center transition-all duration-200 cursor-pointer"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>
        </section>
    );
}
