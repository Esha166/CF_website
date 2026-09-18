"use client";

import Image from "next/image";

type StoryContent = {
    title: string;
    paragraphs: string[];
    image: string;
    imageAlt: string;
};

const storyContent: StoryContent = {
    title: "The Story Behind Combine Foundation",
    paragraphs: [
        "Combine Foundation was established on the ideology that \"nation cannot build through donations\" and under this spirit Combine Foundation aims to fill the gap between despair and hope. Pakistan has extraordinary youth potential, yet millions of students still lack access to quality education, leadership opportunities, mentorship, career guidance, and digital skills for the future. After Identify this challenge and need Combine Foundation came into being as a part of Combine Group's mission to uplift Pakistani youth.",
        "The Combine Foundation evolved into a structured organization officially registered as a Non-Profit Organization (NPO) under Section 42 of the Companies Act 2017, in 2023, with the SECP, and officially launched as Combine Foundation.",
    ],
    image: "/about/story/ourstory.svg",
    imageAlt: "Students on a field visit",
};

export default function OurStory() {
    return (
<section className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-14">
            <div
                className="w-full rounded-2xl px-8 py-6 mb-8 md:mb-10 bg-secondary-500"
            >
                <h2 className="text-white font-bold text-4xl md:text-5xl">
                    <span className="md:hidden">The Story</span>
                    <span className="hidden md:inline">{storyContent.title}</span>
                </h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 md:gap-12 items-start">
                <div className="flex-1 space-y-5">
                    {storyContent.paragraphs.map((para, i) => (
                        <p key={i} className="text-black text-base lg:text-lg leading-7">
                            {para}
                        </p>
                    ))}
                </div>

                <div
                    className="relative w-full lg:w-[45%] shrink-0 rounded-2xl overflow-hidden"
                    style={{ height: "clamp(220px, 30vw, 360px)" }}
                >
                    <Image
                        src={storyContent.image}
                        alt={storyContent.imageAlt}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            </div>
        </section>
    );
}
