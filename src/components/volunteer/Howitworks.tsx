"use client";

import Image from "next/image";

const steps = [
    {
        id: 1,
        title: "Fill Out the Volunteer Form",
        description: "Complete the online volunteer application form with your basic details, interests, and availability to join our volunteer program.",
        top: "top-[20px]",
        left: "left-[13px]",
    },
    {
        id: 2,
        title: "Get Approved & Access Your Volunteer Portal",
        description: "Our team will review your application and send you the volunteer program details by email. Once your application is approved, you will also get access to the volunteer portal to start your journey.",
        top: "top-[300px]",
        left: "left-[108px]",
    },
    {
        id: 3,
        title: "Build Experience & Strengthen Your Resume",
        description: "Gain valuable experience, improve your skills, and enhance your CV or resume while making a positive impact on the community.",
        top: "top-[575px]",
        left: "left-[34px]",
    },
];

export default function HowItWorks() {
    return (
        <section className="w-full mt-20 py-20 overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="grid lg:grid-cols-[480px_1fr] gap-16 items-start relative">

                    {/* LEFT SIDE */}
                    <div className="relative z-10">
                        <h2 className="text-4xl text-center md:text-5xl font-bold text-black mb-10">
                            Become a Volunteer in 3 Steps
                        </h2>
                        <div className="relative w-full h-[450px] lg:h-[620] rounded-[32px] overflow-hidden">
                            <Image
                                src="/volunteer-program/career.webp"
                                alt="Team"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="relative min-h-[400px] min-[450px]:min-h-[760px]">

                        {/* MOBILE STEPS — below 450px, no curve, simple stack */}
                        <div className="flex flex-col gap-8 min-[450px]:hidden">
                            {steps.map((step) => (
                                <div key={step.id} className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                        {step.id}
                                    </div>
                                    <div>
                                        <h3 className="text-[17px] font-bold text-black mb-2 leading-snug">
                                            {step.title}
                                        </h3>
                                        <p className="text-[#444] text-[15px] leading-[1.5]">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* DESKTOP STEPS — curve layout, hidden below 450px */}
                        <div className="hidden min-[450px]:block">

                            {/* CURVE */}
                            <svg
                                className="absolute left-[-280px] top-[-40px] h-[900px] w-[500px] pointer-events-none"
                                viewBox="0 0 500 900"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M 220 0 Q 470 170 420 450 Q 360 760 140 900"
                                    stroke="#d7d7d7"
                                    strokeWidth="3"
                                    fill="transparent"
                                />
                            </svg>

                            {/* STEPS */}
                            {steps.map((step) => (
                                <div
                                    key={step.id}
                                    className={`absolute ${step.left} ${step.top} flex items-start gap-10`}
                                >
                                    <div className="relative z-20 flex-shrink-0">
                                        <div className="w-20 h-20 rounded-full bg-secondary-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                                            {step.id}
                                        </div>
                                    </div>
                                    <div className="max-w-[520px] pt-1">
                                        <h3 className="text-[20px] leading-[1.1] font-bold text-black mb-5">
                                            {step.title}
                                        </h3>
                                        <p className="text-[#444] text-[17px] leading-[1.5]">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
