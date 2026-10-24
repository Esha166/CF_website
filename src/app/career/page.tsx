import type { Metadata } from "next";
import { getActiveJobs } from "@/lib/career";
import CareerClientView from "@/components/career/CareerClientView";
import PageMotion from "@/components/UI/PageMotion";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Explore career opportunities, job openings, and volunteer roles at Combine Foundation to help drive positive social impact across Pakistan.",
  keywords: [
    "Combine Foundation Careers",
    "NGO Jobs Pakistan",
    "Nonprofit Careers Karachi",
    "Social Sector Jobs Pakistan",
    "Charity Employment",
  ],
};

export const revalidate = 600; // 10 minutes cache

export default async function CareerPage() {
  const jobs = await getActiveJobs();

  return (
    <PageMotion>
      <CareerClientView initialJobs={jobs} />
    </PageMotion>
  );
}
