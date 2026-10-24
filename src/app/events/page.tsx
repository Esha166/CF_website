import type { Metadata } from "next";
import PageHeroMobile from "@/components/UI/Pageheromobile";
import OurIdeaAboutEvents from "@/components/events/ourideas";
import UpcomingEvents from "@/components/events/UpcomingEvents";
import EventsClientView from "@/components/events/EventsClientView";
import PageMotion from "@/components/UI/PageMotion";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Discover upcoming and past community events, welfare drives, and initiatives organized by Combine Foundation.",
  keywords: [
    "Combine Foundation Events",
    "NGO Events Pakistan",
    "Charity Drives Karachi",
    "Community Welfare Events",
    "Youth Leadership Events",
  ],
};

export default function Page() {
  return (
    <PageMotion>
      <PageHeroMobile title="Events" imageSrc="/events/hero.png" />
      <OurIdeaAboutEvents />
      <UpcomingEvents />
      <EventsClientView />
    </PageMotion>
  );
}
