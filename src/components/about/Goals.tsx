"use client";

import { useState } from "react";
import SectionHeader from "../UI/SectionHeader";
import { Dot } from "lucide-react";

type GoalItem = {
    id: number;
    text: string;
};

type GoalTab = {
    key: string;
    label: string;
    items: GoalItem[];
};

const goalTabs: GoalTab[] = [
    {
        key: "1year",
        label: "1 YEAR TARGETS",
        items: [
            {
                id: 1,
                text: "Our aim is to provide youth with access to the concept of AI, technology, and digital skills so they can prepare themselves for future opportunities.",
            },
            {
                id: 2,
                text: "Our motive is to expand and ensure that many students get access to the best possible training at our foundation so that they become financially independent.",
            },
            {
                id: 3,
                text: "Our focus will be on creating a stronger partnership between us and other universities/educational institutions to offer more opportunities for learning, training, and career development.",
            },
            {
                id: 4,
                text: "Our plan is to expand youth leadership programs in the future so that many more young people are confident enough to become leaders in the future.",
            },
            {
                id: 5,
                text: "With the goal of expansion of our internship and volunteering program, we hope that students will not only acquire valuable professional experience but will also get a chance to serve their communities.",
            },
            {
                id: 6,
                text: "We will continue organizing health awareness and sustainability programs that educate communities about wellness, prevention, and healthy lifestyles, creating a healthier society.",
            },
        ],
    },
    {
        key: "5year",
        label: "5 YEAR TARGETS",
        items: [
            {
                id: 1,
                text: "Our goal is to educate over 100,000 individuals to become successful leaders and professionals with the ability to contribute to society and achieve great success.",
            },
            {
                id: 2,
                text: "Our mission is to develop a nation-wide youth network of leaders who drive positive change within their communities and across the country.",
            },
            {
                id: 3,
                text: "Our goal is to build effective regional networks of young leaders, volunteers, organizations, and other representatives of the community to have an effective impact on the community.",
            },
            {
                id: 4,
                text: "Our focus is to provide opportunities for our students, to improve their relations with industries and to facilitate the transition of students from internship to sustainable employment and successful careers.",
            },
            {
                id: 5,
                text: "Our goal is to promote sustainability through the promotion of agriculture and environmental awareness programs in our communities.",
            },
            {
                id: 6,
                text: "Our aim is to create effective opportunities for learning and development together with the involvement of educational institutions, organizations, and the international community.",
            },
            {
                id: 7,
                text: "Our goal is to educate individuals about technologies to enable underserved communities to use technologies to improve their situation.",
            },
        ],
    },
];

export default function Goals() {
    const [activeKey, setActiveKey] = useState<string>("1year");

    const activeTab = goalTabs.find((t) => t.key === activeKey)!;

    return (
        <section className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-14">
            <SectionHeader title="What We Aim to Achieve" />

            <div className="flex border-b border-gray-200 mb-6 mt-15">
                {goalTabs.map((tab) => {
                    const isActive = tab.key === activeKey;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveKey(tab.key)}
                            className="flex-1 pb-3 text-sm md:text-base font-bold tracking-widest text-center cursor-pointer transition-colors duration-200"
                            style={{
                                color: isActive ? "#FF6900" : "#9ca3af",
                                borderBottom: isActive ? "3px solid var(--accent-orange)" : "3px solid transparent",
                                marginBottom: "-1px",
                            }}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div>
                {activeTab.items.map((item, i) => (
                    <div key={item.id}>
                        <div className="flex items-start gap-3 py-5 text-black hover:text-secondary-500 hover:scale-y-105 transition-colors duration-200">
                            <span className="mt-1 hover:text-secondary-500"><Dot/></span>
                            <p className=" text-sm  md:text-base leading-7">
                                {item.text}
                            </p>
                        </div>
                        {i < activeTab.items.length - 1 && (
                            <div className="w-full h-px bg-gray-200" />
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
