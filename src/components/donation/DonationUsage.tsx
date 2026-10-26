"use client";

import Image from "next/image";
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip } from "recharts";

const SLICES = [
    {
        label: "Education & Technology Programs",
        percent: "40%",
        value: 40,
        color: "var(--secondary-600)",
        desc: "Your donations help us to provide AI, web development, digital literacy, and leadership training programs that empower youth to become skilled and self-reliant",
    },
    {
        label: "Scholarships & Student Support",
        percent: "15%",
        value: 15,
        color: "var(--primary-500)",
        desc: "Your support gives deserving students a hope to continue their education, follow their dreams, and create a brighter tomorrow without fear of financial conditions.",
    },
    {
        label: "Community Welfare & Relief Programs",
        percent: "10%",
        value: 10,
        color: "var(--color-orange)",
        desc: "Your contribution brings hope to struggling families through food support, emergency relief, and care during difficult times.",
    },
    {
        label: "Sustainability & Plantation Initiatives",
        percent: "15%",
        value: 15,
        color: "#4CAF50",
        desc: "Your donation helps create a greener future through plantation drives, environmental awareness, and sustainability programs for coming generation",
    },
    {
        label: "Volunteer & Leadership Development",
        percent: "15%",
        value: 15,
        color: "#7ECDE8",
        desc: "Your support empowers youth to become future leaders, serve communities, and inspire positive change around them.",
    },
    {
        label: "Operational & Compliance Support",
        percent: "5%",
        value: 5,
        color: "#B0BEC5",
        desc: "Your contribution helps us to maintain transparent systems and responsible operations, so every donation creates a meaningful impact.",
    },
];

export default function DonationUsage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-[1280px]">

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-secondary-500 tracking-tight mb-3">
                    See How Your Donation Helps
                </h1>
                <hr className="border-t border-[#b0bec5] mb-10" />

                {/* Two-col layout */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">

                    {/* ── LEFT: Pie Chart ── */}
                    <div className="w-full md:w-[50%] flex justify-center">
                        <div className="w-full max-w-[520px] aspect-square">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={SLICES}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius="95%"
                                        dataKey="value"
                                        startAngle={90}
                                        endAngle={-270}
                                        strokeWidth={3}
                                        stroke="#e8f0f7"
                                    >
                                        {SLICES.map((slice, i) => (
                                            <Cell key={i} fill={slice.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#fff",
                                            border: "1px solid #ccc",
                                            borderRadius: "4px",
                                            padding: "8px",
                                            color: "#000",
                                        }}
                                        formatter={(value, name, props) => [
                                            `${props.payload.label}`,
                                            `${props.payload.percent}`,
                                        ]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* ── RIGHT: Legend items ── */}
                    <div className="flex flex-col gap-7 w-full md:w-[50%]">
                        {SLICES.map((slice, i) => (
                            <div key={i} className="flex flex-col gap-1.5">
                                {/* Label row */}
                                <div className="flex items-center gap-3">

                                    <span
                                        className="shrink-0 w-4 h-4 rounded-full inline-block"
                                        style={{ background: slice.color }}
                                    />
                                    <h3 className="text-lg md:text-xl font-bold text-black">
                                        {slice.label}
                                        <span className="ml-2 text-black font-bold">| {slice.percent}</span>
                                    </h3>
                                </div>
                                {/* Description */}
                                <p className=" text-base md:text-sm lg:text-base xl:text-xl text-gray-600 leading-relaxed pl-7">
                                    {slice.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}