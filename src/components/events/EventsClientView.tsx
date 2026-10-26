"use client";

import { useState } from "react";
import EventsAcheivementList from "@/components/events/EventsAcheivementList";

export default function EventsClientView() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleCardToggle = (id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  return <EventsAcheivementList activeId={activeId} onToggle={handleCardToggle} />;
}
