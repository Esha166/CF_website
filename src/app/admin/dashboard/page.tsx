"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import type { SectionId } from "@/components/dashboard/Sidebar";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { useSearchParams } from "next/navigation";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<SectionId>("events");
  const searchParams = useSearchParams();

  useEffect(() => {
    const section = searchParams.get("section") as SectionId | null;
    const validSections: SectionId[] = [
      "events",
      "courses",
      "blogs",
      "contact",
      "donations",
      "projects",
      "publications",
      "jobs",
      "team",
      "splash",
    ];

    if (section && validSections.includes(section)) {
      setActiveSection(section);
    }
  }, [searchParams]);

  return (
    <div className="flex-1 bg-gray-50 flex items-stretch min-h-screen min-w-0">
      <Sidebar
        activeSection={activeSection}
        onSelect={setActiveSection}
      />
      <main className="flex-1 transition-all duration-300 p-6 min-w-0 overflow-x-auto md:overflow-x-visible">
        <DashboardContent section={activeSection} />
      </main>
    </div>
  );
}
