"use client";

import { useState } from "react";
import PageHeroMobile from "@/components/UI/Pageheromobile";
import OurIdeaAboutEvents from "@/components/events/ourideas";
import UpcomingEvents from "@/components/events/UpcomingEvents";
import EventsAcheivementList from "@/components/events/EventsAcheivementList";
import Head from "./head";
import PageMotion from "@/components/UI/PageMotion";

export default function Page() {
    const [activeId, setActiveId] = useState<string | null>(null);

    const handleCardToggle = (id: string) => {
        setActiveId((prev) => (prev === id ? null : id));
    };

    return (
        <PageMotion>
            <Head/>
            <PageHeroMobile title="Events" imageSrc="/events/hero.png" />
            <OurIdeaAboutEvents />
            <UpcomingEvents />
            <EventsAcheivementList activeId={activeId} onToggle={handleCardToggle} />
        </PageMotion>
    );
}
