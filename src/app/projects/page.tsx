import type { Metadata } from "next";
import { getAllProjects } from "@/lib/projects";
import { getEventLocations } from "@/lib/events";
import ProjectsClientView from "@/components/projects/ProjectsClientView";
import PageMotion from "@/components/UI/PageMotion";

interface PageProps {
  searchParams: Promise<{
    id?: string;
  }>;
}

export const revalidate = 3600;

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { id } = await searchParams;
  const projects = await getAllProjects();

  if (id) {
    const project = projects.find((p) => String(p.id) === String(id));
    if (project) {
      const desc = project.description
        ? project.description.replace(/\s+/g, " ").trim().slice(0, 160)
        : "Explore this project by Combine Foundation.";
      return {
        title: `${project.title} - Projects`,
        description: desc,
        openGraph: {
          title: `${project.title} | Combine Foundation`,
          description: desc,
          type: "article",
          images: project.images?.[0] ? [{ url: project.images[0], alt: project.title }] : [],
        },
        twitter: {
          card: "summary_large_image",
          title: `${project.title} | Combine Foundation`,
          description: desc,
          images: project.images?.[0] ? [project.images[0]] : [],
        },
      };
    }
  }

  return {
    title: "Projects",
    description:
      "Explore Combine Foundation's impactful initiatives, community welfare projects, and achievements across Pakistan.",
    keywords: [
      "Combine Foundation Projects",
      "NGO Projects in Pakistan",
      "Welfare Initiatives Pakistan",
      "Community Development Programs",
    ],
  };
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const { id } = await searchParams;
  const [projects, eventLocations] = await Promise.all([
    getAllProjects(),
    getEventLocations(),
  ]);

  return (
    <PageMotion>
      <ProjectsClientView
        initialProjects={projects}
        initialEventLocations={eventLocations}
        initialActiveId={id || null}
      />
    </PageMotion>
  );
}
