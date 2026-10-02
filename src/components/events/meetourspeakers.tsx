"use client";

import Image from "next/image";

type Speaker = {
    id: number;
    name: string;
    role: string;
    image: string; // URL or path to image
};

const speakers: Speaker[] = [
    {
        id: 1,
        name: "Faysal Aziz Khan",
        role: "President | BOL Media Group",
        image: "/events/eventsperson.png",
    },
    {
        id: 2,
        name: "Faysal Aziz Khan",
        role: "President | BOL Media Group",
        image: "/events/eventsperson.png",
    },
    {
        id: 3,
        name: "Faysal Aziz Khan",
        role: "President | BOL Media Group",
        image: "/events/eventsperson.png",
    },
];

function SpeakerCard({ speaker }: { speaker: Speaker }) {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="w-36 h-32 mb-4">
                <div className="relative w-36 h-32 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                    <Image
                        src={speaker.image}
                        alt={speaker.name}
                        fill
                        sizes="144px"
                        className="object-cover object-top"
                    />
                </div>
            </div>
            <p className="text-gray-900 font-bold text-sm mt-1">{speaker.name}</p>
            <p className="text-gray-500 text-sm leading-snug mt-0.5 max-w-[140px]">
                {speaker.role}
            </p>
        </div>
    );
}

export default function MeetOurSpeakers() {
    return (
        <section className="w-full mx-auto px-6 py-10 md:py-14">
            <h2 className="text-gray-900 font-bold text-3xl md:text-4xl mb-3">
                Meet Our Speakers
            </h2>
            <div className="w-full h-px bg-gray-300 mb-10" />


            <div className="grid grid-cols-1 min-[405px]:grid-cols-2 sm:grid-cols-3 justify-center items-center gap-x-8 gap-y-20 ">
                {speakers.map((speaker) => (
                    <SpeakerCard key={speaker.id} speaker={speaker} />
                ))}
            </div>
        </section>
    );
}
