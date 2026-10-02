"use client";

import Image from "next/image";
import type { Course } from "@/lib/freeCourses";

interface CourseHeroProps {
  course: Course;
}

export default function CourseHero({ course }: CourseHeroProps) {
  const shortTitle = (course.title || course.name || "").replace(/ Course$/i, "");

  return (
    <>
      <div className="w-full pl-17 pr-10 py-8 max-sm:px-6 max-sm:py-6">
        <div className="text-[12.5px] lg:text-sm xl:text-base text-gray-500 mb-7">
          Free Courses&nbsp;/&nbsp;<span className="text-gray-500">{course.title || course.name}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 items-start">
          <div>
            <h1 className="text-[clamp(32px,5vw,46px)] xl:text-6xl font-extrabold xs:text-5xl leading-[1.1] text-black mb-3.5">
              {shortTitle}
            </h1>

            <p className="text-[13.5px] lg:text-base xl:text-lg leading-relaxed text-black mb-5">
              {course.description}
            </p>

            <ul className="flex flex-col gap-2.5 mb-7">
              <li className="flex items-center gap-[9px] text-[13.5px] lg:text-base xl:text-lg text-gray-700">
                <span className="w-5 h-5 shrink-0 flex items-center justify-center text-gray-500">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </span>
                <span className="font-medium text-gray-600">Duration :&nbsp;</span>
                <span className="text-gray-900">{course.duration}</span>
              </li>

              <li className="flex items-center gap-[9px] text-[13.5px] lg:text-base xl:text-lg text-gray-700">
                <span className="w-5 h-5 shrink-0 flex items-center justify-center text-gray-500">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <line x1="3" y1="9" x2="21" y2="9"/>
                    <line x1="9" y1="21" x2="9" y2="9"/>
                  </svg>
                </span>
                <span className="font-medium text-gray-600">Lessons :&nbsp;</span>
                <span className="text-gray-900">{course.lessons}</span>
              </li>

              <li className="flex items-center gap-[9px] text-[13.5px] lg:text-base xl:text-lg text-gray-700">
                <span className="w-5 h-5 shrink-0 flex items-center justify-center text-gray-500">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </span>
                <span className="font-medium text-gray-600">Price :&nbsp;</span>
<span className="text-gray-900">{Number(course.price).toLocaleString()} PKR</span>
                {Number(course.originalPrice) > 0 && (
                  <span className="text-[12px] lg:text-sm xl:text-base text-gray-400 ml-1">(Originally {Number(course.originalPrice).toLocaleString()} PKR)</span>
                )}
              </li>

              <li className="flex items-center gap-[9px] text-[13.5px] lg:text-base xl:text-lg text-gray-700">
                <span className="w-5 h-5 shrink-0 flex items-center justify-center text-gray-500">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="6"/>
                    <path d="M8 14l-2 7 6-3 6 3-2-7"/>
                  </svg>
                </span>
                <span className="text-gray-700">Get Certified. Get Noticed. Get Hired.</span>
              </li>
            </ul>

            {course.mode && (
              <p className="text-[12.5px] lg:text-sm xl:text-base text-gray-500 mb-2">
                Mode: {course.mode}
              </p>
            )}

{course.status?.toLowerCase() === "completed" ? (
              <div className="mb-2.5">
                <p className="text-sm font-semibold text-gray-700 mb-2">This batch is completed. Stay tuned with us on:</p>
                <div className="flex items-center gap-3">
                  <a href="https://www.facebook.com/combinefoundationoffical" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/></svg>
                  </a>
                  <a href="https://www.instagram.com/combinefoundation" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-600 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  </a>
                  <a href="https://www.linkedin.com/company/combine-foundation/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-700 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </a>
                </div>
              </div>
            ) : (
              <a
                href={course.enrollmentLink || "#"}
                target={course.enrollmentLink ? "_blank" : undefined}
                rel={course.enrollmentLink ? "noopener noreferrer" : undefined}
              >
                <button className="inline-block bg-accent-orange text-white text-[12.5px] lg:text-sm xl:text-base font-bold uppercase px-6 py-2.5 rounded-full border-none cursor-pointer mb-2.5 hover:brightness-90 hover:-translate-y-0.5 active:translate-y-0 transition-all">
                  Enroll Now, Start Learning Today
                </button>
              </a>
            )}
            <div className="text-[11.5px] lg:text-xs xl:text-sm text-gray-400 italic">{course.requirements}</div>
          </div>

          <div className="relative w-full h-80 mx-auto max-sm:hidden">
            <div className="absolute left-0 top-0 w-[55%] h-[260px] rounded-[10px] overflow-hidden shadow-md z-10">
              <Image
                src={course.heroImage1 || "/course/hero.svg"}
                alt=""
                fill
                sizes="(max-width: 640px) 55vw, 300px"
                className="object-cover object-top rounded-[10px]"
                onError={(e) => {
                  const t = e.currentTarget;
                  t.style.background = "#e8e2d8";
                }}
              />
            </div>

            <div
              className="absolute left-[35%] top-[85px] w-[62%] h-[260px] rounded-[10px] overflow-hidden z-20"
              style={{ boxShadow: "0 6px 18px rgba(0,0,0,0.22)" }}
            >
              <Image
                src={course.heroImage2 || "/course/hero (2).svg"}
                alt={course.title || course.name || ""}
                fill
                sizes="(max-width: 640px) 62vw, 340px"
                className="object-cover object-top rounded-[10px]"
                onError={(e) => {
                  const t = e.currentTarget;
                  t.style.background = "#d0cbc0";
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
