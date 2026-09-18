import { notFound } from "next/navigation";
import { getAllCourseSlugs, getCourseBySlug, SuccessStory } from "@/lib/freeCourses";
import CourseHero from "@/components/free-courses/CourseHero";
import Modules from "@/components/free-courses/Modules";
import SuccessStories from "@/components/free-courses/SuccessStories";
import MeetInstructors from "@/components/free-courses/MeetInstructors";
import CtaSection from "@/components/UI/CtaSection";
import type { Metadata } from "next";

interface CoursePageProps {
  params: Promise<{
    course: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return getAllCourseSlugs();
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { course: slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    return {
      title: "Free Course",
    };
  }

  return {
    title: course.title,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
      type: "article",
    },
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { course: slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    return notFound();
  }

  const stories = (course.successStories || []).map((s: SuccessStory) => ({
    name: s.studentName,
    description: s.testimonial,
    course: course.title,
    videoUrl: s.videoUrl,
  })).filter((s) => s.name && s.description);

  return (
    <>
      <CourseHero course={course} />
      <hr className="w-[95vw] text-gray-500 m-auto" />
      <Modules modules={course.modules} guidelineCta={course.guidelineCta} />
      <SuccessStories stories={stories} />
      <MeetInstructors />
      <CtaSection
        text="Ready to Level Up Your Skills ? "
        buttonText="Enroll Now"
        url="/free-courses"
      />
      
    </>
  );
}
