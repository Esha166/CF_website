"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import PageHeroMobile from "@/components/UI/Pageheromobile";
import AchievementsList from "@/components/projects/Achievementslist ";
import { getAllProjects, type Project } from "@/lib/projects";
import { getEventLocations, type EventLocation } from "@/lib/events";
import { Loader2 } from "lucide-react";
import PageMotion from "@/components/UI/PageMotion";

const AchievementsMap = dynamic(() => import("@/components/projects/map"), { ssr: false });

export default function Projects() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [eventLocations, setEventLocations] = useState<EventLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getAllProjects();
        setProjects(data);

        const params = new URLSearchParams(window.location.search);
        const urlId = params.get("id");
        if (urlId) {
          const exists = data.some((p) => String(p.id) === urlId);
          if (exists) {
            setActiveId(urlId);
            setTimeout(() => {
              const el = document.getElementById(`project-card-${urlId}`);
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 300);
          }
        }
      } catch (err) {
        console.error("Error loading projects:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();

    getEventLocations()
      .then(setEventLocations)
      .catch((err) => console.error("Error loading event locations:", err));
  }, []);

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
    <PageMotion>
      <div>
        {loading ? (
          <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-orange animate-spin" />
            <span className="mt-4 text-gray-600 font-medium">Loading projects...</span>
          </div>
        ) : (
          <>
            <PageHeroMobile title="Projects" imageSrc="/achievement-gallery/hero.svg" />
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
        )}
      </div>
    </PageMotion>
  );
}
