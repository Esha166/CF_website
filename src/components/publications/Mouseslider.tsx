"use client";

import { useState } from "react";
import Image from "next/image";
import type { FirestorePartner } from "@/lib/admin-actions";

const MOUSlider = ({ mous: dbPartners = [] }: { mous: FirestorePartner[] }) => {
    const displayPartners = dbPartners
        .filter((partner) => partner?.image)
        .map((partner, index) => ({
            ...partner,
            id: partner.id || index.toString(),
            name: partner.name || "Partner",
            description: partner.description || "",
            image: partner.image,
        }));

    const [current, setCurrent] = useState(0);

    const handlePrev = () =>
        setCurrent((c) => (c === 0 ? displayPartners.length - 1 : c - 1));
    const handleNext = () =>
        setCurrent((c) => (c === displayPartners.length - 1 ? 0 : c + 1));

    const partner = displayPartners[current];

    if (!partner) return null;

    return (
        <section className="bg-white mt-8">
            <div className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8">

                {/* Section Header */}
                <div className="mb-2">
                    <h2 className="text-3xl font-bold text-secondary-500">Our Partners</h2>
                </div>
                <hr className="border-gray-300 mb-8" />

                {/* Slide Content */}
                <div className="transition-all duration-300">

                    {/* Title */}
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary-600 mb-4 leading-snug">
                        {partner.name}
                    </h3>

                    {/* Description Paragraphs */}
                    <div className="space-y-4 mb-6">
                        {partner.description.split("\n").filter(Boolean).map((para, idx) => (
                            <p key={idx} className="text-primary-800 text-sm md:text-base lg:text-lg leading-relaxed">
                                {para}
                            </p>
                        ))}
                    </div>

                    {/* Image */}
                    <div className="relative w-full min-h-full sm:h-96 rounded-2xl overflow-hidden ">
                        <Image
                            src={partner.image}
                            alt={partner.name}
                            fill
                            className="object-fit"
                        />
                        {partner.mou && (
                            <a
                                href={partner.mou}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 hover:bg-white text-gray-900 font-semibold text-sm shadow-lg transition-all duration-200"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                                View MOU
                            </a>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-center sm:justify-end items-center gap-3 mt-6">
                    <button
                        onClick={handlePrev}
                        aria-label="Previous partner"
                        className="w-11 h-11 rounded-full bg-secondary-700 hover:brightness-90 text-white flex items-center justify-center transition-all duration-200 cursor-pointer"
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <button
                        onClick={handleNext}
                        aria-label="Next partner"
                        className="w-11 h-11 rounded-full bg-secondary-700 hover:brightness-90 text-white flex items-center justify-center transition-all duration-200 cursor-pointer"
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>

            </div>
        </section>
    );
};

export default MOUSlider;
