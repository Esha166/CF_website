"use client";

import Image from "next/image";
import { useRef, useState } from "react";

const VENTURES = [
    {
        id: 1,
        heading: "Youth Leadership Program - Developing Future Leaders & Changemakers",
        description:
            "The Youth Leadership Program that we run is an initiative across the country. It aims to empower youth by preparing and educating them to become competent and responsible future leaders. They get trained in leadership skills, mentoring, volunteering, and community work through various programs to help improve their communication, team-building, and problem-solving abilities for the future.\n\nHundreds of passionate people have participated in this initiative. The objective of this program is to build tomorrow's leaders who will be self-reliant, competent, and able to make a positive difference through their actions.",
        images: [
            "/donation/YLP (2).webp",
            "/donation/YLP.webp",
            "/donation/YLP (4).webp",
            "/donation/YLP (3).webp",
            "/donation/YLP (5).webp",
        ],
    },
    {
        id: 2,
        heading: "RAISE (Rising Ambitions in Skills & Education)",
        description:
            "With our AI & Technology Education, students learn how to develop futuristic digital skills such as Python Programming, Artificial Intelligence, Web Development, and latest technology. Students will get the required knowledge and expertise with the help of hands-on training sessions and mentoring programs to excel in the digital era.\n\nOur objective here is to prepare youth for their future careers in the fields of Artificial Intelligence, Technology, and Freelancing. We aim to create proficient and self-reliant individuals who can lead a prosperous life in society.",
        images: [
            "/donation/Raise (5).webp",
            "/donation/Raise.webp",
            "/donation/Raise (2).webp",
            "/donation/Raise (3).webp",
            "/donation/Raise (4).webp"
        ],
    },
    {
        id: 3,
        heading: "Kitchen Garden Festival - Promoting Sustainable Living Through Kitchen Gardening",
        description:
            "Our 'Kitchen Garden' Campaign is a Change Making campaign where we focus on spreading organic living, environmental consciousness, and health-oriented practices among individuals within societies. It involves education programs and participation by people from within communities so that the significance of leading an eco-friendly life can be known.\n\nWe have succeeded in encouraging many families to adopt kitchen gardening and live a healthy lifestyle. Our goal is to make our society more sustainable.",
        images: [
            "/donation/Kitchen Gardening.webp",
            "/donation/Kitchen Gardening.png",
            "/donation/24.png",
            "/donation/25.png",
        ],
    },
    {
        id: 4,
        heading: "Fit Future Pakistan - Building Healthier Communities Through Fitness & Wellness",
        description:
            "Fit Future Pakistan is our health initiative that aims to promote physical fitness, awareness about exercise, yoga and other such health-related topics among young and older people. By way of fitness training, awareness programs, and wellness activities, we aim to make people live a healthier lifestyle.\n\nWe have already inspired many individuals and senior citizens to become more physically active through health-related sessions and activities.",
        images: [
            "/donation/Fit future (2).webp",
            "/donation/FIt future.webp",
            "/donation/26.png"
        ],
    },
    {
        id: 5,
        heading: "Plantation Drive - Planting Hope for Future Generations",
        description:
            "The Plantation Drive is basically designed to promote environmental sustainability. We conduct plantation drives, environmental awareness seminars, and youth-related activities to motivate people to join us in our efforts towards environmental protection and securing a better future.\n\nThere have been many plantation drives conducted by us, and a lot of volunteers are involved in plantation activities, and in raising awareness about the environment for sustainable living.",
        images: [
            "/donation/20.webp",
            "/donation/21.webp",
            "/donation/22.webp",
            "/donation/23.webp",
            "/donation/24.webp",
        ],
    },
    {
        id: 7,
        heading: "Ramadan Bachat Camp & Free Rashan Drive - Spreading Hope & Relief During Ramadan",
        description:
            "Our Ramadan Bachat Camp & Free Rashan Drive Welfare Scheme is aimed at helping deserving people by giving them rations during the holy month of Ramadan. With the help of food or Rashan, our main intention is to decrease the difficulties of these deserving families by providing them with some comfort.\n\nThere were many volunteers who took part in this drive in order to offer assistance to needy families. The purpose of this campaign is to facilitate food security, help the needy and promote the essence of Ramadan through kindness and community involvement.",
        images: [
            "/donation/Ramdan bachat.webp",
            "/donation/rashan.jpeg",
            "/donation/28.webp",
            "/donation/rashan1.jpeg",
            "/donation/29.webp",
        ],
    },
];

interface DragSliderProps {
    images: string[];
}

function DragSlider({ images }: DragSliderProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);
    const [dragged, setDragged] = useState(false);

    /* ── Mouse events ── */
    const onMouseDown = (e: React.MouseEvent) => {
        if (!trackRef.current) return;
        isDragging.current = true;
        setDragged(false);
        startX.current = e.pageX - trackRef.current.offsetLeft;
        scrollLeft.current = trackRef.current.scrollLeft;
        trackRef.current.style.cursor = "grabbing";
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !trackRef.current) return;
        e.preventDefault();
        const x = e.pageX - trackRef.current.offsetLeft;
        const walk = x - startX.current;
        if (Math.abs(walk) > 5) setDragged(true);
        trackRef.current.scrollLeft = scrollLeft.current - walk;
    };

    const onMouseUp = () => {
        isDragging.current = false;
        if (trackRef.current) trackRef.current.style.cursor = "grab";
    };

    return (
        <div
            ref={trackRef}
            className="flex gap-2 overflow-x-auto pb-1"
            style={{
                cursor: "grab",
                scrollbarWidth: "none",        /* Firefox */
                msOverflowStyle: "none",       /* IE/Edge */
                WebkitOverflowScrolling: "touch",
                userSelect: "none",
            }}
            /* hide webkit scrollbar via inline — can't do in Tailwind */
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
        >
            {/* hide scrollbar on webkit browsers */}
            {/* <style>{`
        .drag-slider::-webkit-scrollbar { display: none; }
      `}</style> */}

            {images.map((src, i) => (
                <div
                    key={i}
                    className="shrink-0 rounded-md overflow-hidden"
                    style={{ width: "32%", minWidth: "200px", aspectRatio: "4/3", position: "relative" }}
                    /* prevent accidental navigation on drag */
                    onDragStart={(e) => e.preventDefault()}
                >
                    <Image
                        src={src}
                        alt={`Slide ${i + 1}`}
                        fill
                        draggable={false}
                        className="object-cover pointer-events-none"
                        sizes="(max-width: 640px) 60vw, 30vw"
                    />
                </div>
            ))}
        </div>
    );
}

export default function SuccessfulVentures() {
    return (
        <div className="min-h-screen px-4 py-10 md:px-8 md:py-14">
            <div className="w-full mx-auto">

                <h1 className="text-3xl md:text-4xl font-extrabold text-secondary-500 tracking-tight mb-2">
                    Our Impactful Journey
                </h1>
                <p className="text-base text-gray-600 mb-8">Successful Ventures</p>

                <div className="flex flex-col gap-12">
                    {VENTURES.map((venture) => (
                        <div key={venture.id}>
                            <p className="text-base md:text-lg lg:text-xl font-semibold text-secondary-500 mb-4 leading-snug">
                                {venture.heading}
                            </p>
                            <hr className="border-t border-gray-300 mb-5" />

                            <DragSlider images={venture.images} />

                            <p className="text-sm lg:text-lg text-gray-600 leading-relaxed mt-5">
                                {venture.description}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
