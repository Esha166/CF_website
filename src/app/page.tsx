import Hero from "@/components/home/Hero";
import OurImpact from "@/components/home/OurImpact";
import Introduction from "@/components/home/Introduction";
import OurProject from "@/components/home/OurProject";
import FounderInfo from "@/components/home/FounderInfo";
import FaqSection from "@/components/home/FaqSection"; 
import BlogSection from "@/components/home/BlogSection";
// import SplashBanner from "@/components/UI/SplashBanner";
import Reveal from "@/components/UI/Reveal";
import { getAllBlogs } from "@/lib/blogs";
import { getAllProjects } from "@/lib/projects";

export const metadata = {
  title: "Combine Foundation",
  description:
    "Combine Foundation is a nonprofit organization focused on education, health awareness, youth empowerment, and community welfare in Pakistan.",
  keywords: [
    "Combine Foundation",
    "Non Profit Organization in Pakistan",
    "NPO in Pakistan",
    "NGO in Pakistan",
    "Tax Exempted NPO",
    "Youth Leadership Program",
    "Youth Empowerment Pakistan",
    "Charity Organization in Pakistan",
    "Nonprofit Organization Pakistan",
    "Community Welfare Pakistan",
  ],
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const blogs = await getAllBlogs();
  const projects = await getAllProjects();
  return (
    <div>
      {/* <SplashBanner /> */}
      <Reveal><Hero /></Reveal>
      <Reveal delay={80}><OurImpact /></Reveal>
      <Reveal delay={100}><Introduction /></Reveal>
      <Reveal delay={120}><OurProject projects={projects} /></Reveal>
      <Reveal delay={80}><FounderInfo /></Reveal>
      <Reveal delay={120}>
        <FaqSection
          description="Find answers to common questions about our mission, projects, and how you can get involved."
        />
      </Reveal>
      <Reveal delay={80}><BlogSection blogs={blogs} /></Reveal>
    </div>
  );
}
