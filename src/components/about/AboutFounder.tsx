"use client";

import Image from "next/image";
import SectionHeader from "@/components/UI/SectionHeader";

type FounderContent = {
    title: string;
    image: string;
    imageAlt: string;
    description: string;
};

const founderContent: FounderContent = {
    title: "The Vision Behind Combine Foundation ",
    image: "/about/founder/aboutfounder.webp",
    imageAlt: "About the founder meeting",
    description:
        "Combine Foundation is led by dedicated Founders who believe in creating opportunities for youth and communities across Pakistan. Mr. Amin Nathani started the foundation with a vision to spread education, leadership, and long-term social impact. Mr. Ashfaq Nathani leads the organization with a focus on youth development, digital education, mentorship, and innovation-driven learning opportunities. Alongside them, Mr. Farrukh Rehman brings years of experience in leadership development, finance, and corporate consultancy, helping strengthen the foundation's mission of preparing future-ready generations and creating meaningful change in communities.",
};

export default function AboutFounder() {
    return (
        <section className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8 md:py-14">
            <SectionHeader title={`${founderContent.title}`} />

            <div className="relative w-full rounded-2xl overflow-hidden md:mb-7 h-32 md:h-[clamp(220px,45vw,400px)]">
                <Image
                    src={founderContent.image}
                    alt={founderContent.imageAlt}
                    fill
                    className="object-contain "
                    priority
                />
            </div>

            <div className="flex gap-4 items-stretch">
                <div className="w-1 rounded-full bg-accent-orange shrink-0" />
                <p className="text-gray-700 text-sm md:text-base leading-7">
                    {founderContent.description}
                </p>
            </div>
        </section>
    );
}
