import Hero from "@/components/UI/hero";
import AboutCourses from "@/components/free-courses/AboutCourses";
import CoursesOffered from "@/components/free-courses/CoursesOffered";
import SuccessStories from "@/components/free-courses/SuccessStories";
import FaqSection from "@/components/home/FaqSection";
import { getAllCourses, SuccessStory } from "@/lib/freeCourses";
import PageMotion from "@/components/UI/PageMotion";

export const dynamic = "force-dynamic";

export default async function Home() {
  const courses = await getAllCourses();

  const stories = courses
    .flatMap((c) =>
      (c.successStories || []).map((s: SuccessStory) => ({
        name: s.studentName,
        description: s.testimonial,
        course: c.title,
        videoUrl: s.videoUrl,
      }))
    )
    .filter((s) => s.name && s.description);

  return (
  <PageMotion>
    <Hero text1="Free" text2="Courses" image1="/course/hero.svg" image2="/course/hero (2).svg"
    mobileTitle="Free Courses" text1Size = "big"
    text2Size="big"
    />
    <AboutCourses />
    <CoursesOffered courses={courses} />
    <SuccessStories stories={stories} />
    <FaqSection />

  </PageMotion>
)}
