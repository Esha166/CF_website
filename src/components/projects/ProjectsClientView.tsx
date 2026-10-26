"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import PageHeroMobile from "@/components/UI/Pageheromobile";
import AchievementsList from "@/components/projects/Achievementslist ";
import type { Project } from "@/lib/projects";
import type { EventLocation } from "@/lib/events";

const AchievementsMap = dynamic(() => import("@/components/projects/map"), { ssr: false });

interface ProjectsClientViewProps {
  initialProjects: Project[];
  initialEventLocations: EventLocation[];
  initialActiveId?: string | null;
}

export default function ProjectsClientView({
  initialProjects,
  initialEventLocations,
  initialActiveId = null,
}: ProjectsClientViewProps) {
  const [activeId, setActiveId] = useState<string | null>(initialActiveId);
  const [projects] = useState<Project[]>(initialProjects);
  const [eventLocations] = useState<EventLocation[]>(initialEventLocations);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlId = params.get("id") || initialActiveId;
    if (urlId) {
      const exists = projects.some((p) => String(p.id) === urlId);
      if (exists) {
        setActiveId(urlId);
        setTimeout(() => {
          const el = document.getElementById(`project-card-${urlId}`);
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      }
    }
  }, [projects, initialActiveId]);

  const handleMapSelect = (id: string) => {
    setActiveId(id);
    setTimeout(() => {
      const el = document.getElementById(`project-card-${id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const handleCardToggle = (id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <PageHeroMobile title="Projects" imageSrc="/achievement-gallery/hero.webp" />
      <AchievementsMap
        projects={projects}
        events={eventLocations}
        activeId={activeId}
        onSelect={handleMapSelect}
      />
      <AchievementsList
        projects={projects}
        activeId={activeId}
        onToggle={handleCardToggle}
      />
    </>
  );
}
