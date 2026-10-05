"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import SectionHeader from "../UI/SectionHeader";
import Image from "next/image";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  description: string;
  image: string;
  link: string;
};

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "1",
    name: "RAISE",
    description:
      "RAISE (Rising Ambitions in Skills & Education) is a project of the Combine Foundation that aims to empower students and employees with the information, skills, and opportunities to excel in today's fast-paced environment. The project connects learners to practical training modules relevant to industries, helping them secure future employment. RAISE offers courses like Web Development (coding fundamentals, responsive design, freelancing skills — 2 successful batches), Quantitative Finance (financial literacy, data analysis, market concepts — batches 1 & 2 completed, batch 3 upcoming), Python with AI Development (AI development, automation, coding — batch 1 completed, batch 2 in progress), Basic Computer Skills (MS Office, typing, digital platforms for beginners), and Meta Ads Marketing (Facebook & Instagram ads, audience targeting, freelancing skills). With a focus on digital literacy, innovation, and lifelong learning, this project helps learners pursue freelancing and improve their income and self-reliance.",
    image: "/home/projects/6.webp",
    link: "/projects",
  },
  {
    id: "2",
    name: "Scholarship & Career Support",
    description:
      "The Scholarship & Career Support Projects by Combine Foundation are designed to help students achieve their educational and professional goals through financial assistance, career guidance, and skill development opportunities. The CSC Scholarship Program was launched to support deserving and talented students facing financial hardships, providing financial assistance and academic support so they can continue their studies with confidence. Currently, many deserving students are studying and growing under this program. Additionally, Freelancing & Online Earning Awareness sessions teach students and freelancers how to start earning online through digital skills and freelancing platforms, covering online marketplaces, career opportunities, and how to get clients through inbound and outbound leads.",
    image: "/home/projects/1.webp",
    link: "/projects",
  },
  {
    id: "3",
    name: "Volunteer & Youth Leadership",
    description:
      "The Volunteer and Youth Leadership Programs by Combine Foundation are designed to help students and young individuals develop leadership, communication, teamwork, and professional skills through real-world projects, community involvement, and social initiatives beyond academics. The Volunteer Program provides opportunities to work across different niches, building leadership, teamwork, responsibility, and communication skills while contributing to social and educational initiatives. The Youth Leadership Program is a 6-month leadership development program that empowers young individuals to become confident and responsible future leaders through activities, real-world projects, teamwork, decision-making, and strategic thinking. We have a strong network of youth from various universities participating as youth leaders and volunteers.",
    image: "/home/projects/4.webp",
    link: "/projects",
  },
  {
    id: "4",
    name: "Health & Environmental Sustainability",
    description:
      "The Health Awareness & Environmental Sustainability Initiatives by Combine Foundation focus on promoting wellness, healthy living, and environmental awareness within communities. The Healthy Lifestyle Awareness Program guides individuals on balanced nutrition, physical activity, disciplined routines, and mindful living through interactive sessions. Our One Follower One Plant plantation drive promotes environmental sustainability by planting a tree for every new supporter to improve air quality and combat climate impact. The Kitchen Garden Festival Camp educates families on organic lifestyles, home-grown food, and reducing processed food consumption. The Packet Palto Phir Kharido awareness campaign encourages smarter food choices by teaching people to read product labels, avoid harmful ingredients, and choose healthier alternatives.",
    image: "/home/projects/2.webp",
    link: "/projects",
  },
  {
    id: "5",
    name: "Community Welfare & Support",
    description:
      "The Community Welfare & Support Initiatives by Combine Foundation are focused on helping deserving families and supporting communities during difficult times. Through Disaster Relief & Emergency camps, we provide immediate help to communities affected by floods and natural disasters, distributing essential supplies including food, clean water, and daily necessities with compassion and respect. The Winter Relief & Community Support Drives provide warm clothing, blankets, bedding, and essential supplies to vulnerable families and students in remote areas like Balochistan. The Ramadan Food Support & Relief Program distributes essential food packages to deserving households during Ramadan, ensuring dignity and complete privacy by keeping recipients' identity anonymous with no video recording.",
    image: "/home/projects/3.webp",
    link: "/projects",
  },
];

type Direction = "next" | "prev";

interface ProjectsSliderProps {
  projects?: Array<{
    id: string | number;
    title?: string;
    name?: string;
    images?: string[];
    image?: string;
    description: string;
    link?: string;
  }>;
}

export default function ProjectsSlider({ projects: initialProjects }: ProjectsSliderProps) {
  const displayProjects = useMemo(() => {
    const list = initialProjects && initialProjects.length > 0 ? initialProjects : DEFAULT_PROJECTS;
    return list.map((p: any) => ({
      id: String(p.id),
      name: p.title || p.name || "",
      description: p.description,
      image: p.images?.[0] || p.image || "/home/project/project.png",
      link: p.link || `/projects?id=${p.id}`,
    }));
  }, [initialProjects]);

  const [current, setCurrent] = useState<number>(0);
  const [sliding, setSliding] = useState<boolean>(false);
  const [direction, setDirection] = useState<Direction>("next");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (dir: Direction) => {
      if (sliding) return;
      setDirection(dir);
      setSliding(true);
      setTimeout(() => {
        setCurrent((prev) =>
          dir === "next"
            ? (prev + 1) % displayProjects.length
            : (prev - 1 + displayProjects.length) % displayProjects.length
        );
        setSliding(false);
      }, 400);
    },
    [sliding, displayProjects.length]
  );

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => goTo("next"), 5000);
  }, [goTo]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const handlePrev = () => {
    goTo("prev");
    startTimer();
  };

  const handleNext = () => {
    goTo("next");
    startTimer();
  };

  const project = displayProjects[current];

  if (displayProjects.length === 0) {
    return null;
  }

  return (
    <section className="relative max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8 py-4">
      <SectionHeader
        title="Our Projects"
        description="Explore our initiatives creating lasting impact across Pakistan."
      />

      <div className="absolute left-1 sm:left-3 top-1/2 w-1.5 h-[30%] translate-y-[-35%] rounded-full bg-primary-700" />
      <div className="absolute right-1 sm:right-3 translate-y-[-35%] top-1/2 w-1.5 h-[30%] rounded-full bg-primary-700" />

      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{ height: "430px" }}
      >
        <div
          className="absolute inset-0 transition-all duration-400 ease-in-out"
          style={{
            opacity: sliding ? 0 : 1,
            transform: sliding
              ? direction === "next"
                ? "translateX(-20px)"
                : "translateX(20px)"
              : "translateX(0)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
          }}
        >
          <Image
            src={project.image}
            alt={project.name}
            fill
            className="motion-image object-cover object-center"
            sizes="(max-width: 768px) 100vw, 1500px"
            priority
          />

          <div className="absolute inset-0 bg-black/35" />
        </div>

        <div
          className="absolute inset-0 flex flex-col justify-center px-10 max-w-2xl items-center md:items-start"
          style={{
            opacity: sliding ? 0 : 1,
            transition: "opacity 0.3s ease",
          }}
        >
          <h2 className="text-white text-2xl md:text-4xl font-bold mb-5 text-center md:text-left ">
            {project.name}
          </h2>
          <p className="text-white/90 text-sm md:text-base leading-relaxed mb-8 line-clamp-5">
            {project.description}
          </p>
          <Link
            href={project.link}
            className="inline-flex items-center justify-center w-fit px-7 py-3 rounded-full bg-navy hover:brightness-90 text-white font-semibold text-base transition-all duration-200"
          >
            Learn More
          </Link>
        </div>
      </div>

      <div className="flex justify-center sm:justify-end gap-3 my-10">
        <button
          onClick={handlePrev}
          aria-label="Previous project"
          className="w-11 h-11 rounded-full bg-primary-700 hover:brightness-90 text-white flex items-center justify-center transition-all duration-200 cursor-pointer"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          onClick={handleNext}
          aria-label="Next project"
          className="w-11 h-11 rounded-full bg-primary-700 hover:brightness-90 text-white flex items-center justify-center transition-all duration-200 cursor-pointer"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </section>
  );
}
