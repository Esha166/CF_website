"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import SectionHeader from "../UI/SectionHeader";

type ImpactItem = {
  id: number;
  stat: string;
  title: string;
  image: string;
  description: string;
};

const impactItems: ImpactItem[] = [
  {
    id: 1,
    stat: "5000+",
    title: "Lives Impacted",
    image: "/home/impact cards/5.webp",
    description:
      "At Combine Foundation, every project is created with the mission to bring positive change in people's lives. Through our educational, welfare, leadership, and community development programs, we have proudly impacted 3000+ individuals by creating opportunities, spreading hope, and supporting communities in times of need.",
  },
  {
    id: 2,
    stat: "360+",
    title: "Students Empowered",
    image: "/home/impact cards/3.jpeg",
    description:
      "More than 204 students have been trained through technology, digital skills, and professional development programs. These courses help students to gain confidence, build careers, start earning from home and create better futures through education, freelancing, and modern digital skills.",
  },
  {
    id: 3,
    stat: "250+",
    title: "Passionate Volunteers",
    image: "/home/impact cards/6.webp",
    description:
      "Our 250+ active volunteers are the heart of our community initiatives. From welfare drives to educational campaigns or Youth Leadership Program, they dedicate their time and efforts to serving humanity, supporting communities, and spreading kindness across Pakistan.",
  },
  {
    id: 4,
    stat: "150+",
    title: "Emerging Youth Leaders",
    image: "/home/impact cards/8.webp",
    description:
      "We have empowered 40+ active youth leaders who are confidently leading projects, social initiatives, and community activities and working as leaders in the Youth Leadership Program of the Combine Foundation.",
  },
  {
    id: 5,
    stat: "50+",
    title: "Dedicated Team Members",
    image: "/home/impact cards/7.webp",
    description:
      "Behind every successful initiative is our Combine Foundation team. We have 20+ committed members working across different departments with passion, teamwork, and a shared vision to create meaningful social impact.",
  },
  {
    id: 6,
    stat: "30+",
    title: "Webinars & Awareness Sessions",
    image: "/home/impact cards/4.webp",
    description:
      "We have organized 30+ webinars and awareness sessions covering AI, technology, medical awareness, cybersecurity, leadership, sustainability, scholarships, freelancing, self-grooming, and personal development. These sessions have inspired and educated countless individuals to learn, grow, and move toward a brighter future.",
  },
];
type ImpactCardProps = {
  item: ImpactItem;
};

function ImpactCard({ item }: ImpactCardProps) {
  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-4xl min-[450px]:w-[75%] w-[300px] sm:w-auto cursor-pointer duration-300 overflow-hidden p-2 border-2 border-gray-400"
      style={{ height: "370px" }}
    >
      <div
        className="relative w-full overflow-hidden rounded-4xl shrink-0 transition-all duration-500 ease-in-out"
        style={{ height: hovered ? "30px" : "180px" }}
      >
        <Image
          src={item.image}
          alt={item.title}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          fill
          className="motion-image object-cover object-top"
        />
      </div>

      <div className="p-5 overflow-hidden" style={{ height: hovered ? "300px " : "210px", transition: "height 0.5s ease" }}>
        <p className="text-3xl md:text-4xl font-bold text-secondary-500 leading-none mb-1">
          {item.stat}
        </p>
        <h3 className="text-xl md:text-2xl font-medium text-gray-900 mb-2.5">
          {item.title}
        </h3>
        <p
          className="text-sm text-gray-500 leading-relaxed overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: hovered ? 9 : 3,
            overflow: "hidden",
          }}
        >
          {item.description}
        </p>
      </div>
    </div>
  );
}

export default function OurImpact() {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAutoScrollingRef = useRef(false);

  const stopAutoScroll = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startAutoScroll = () => {
    stopAutoScroll();
    timerRef.current = setInterval(() => {
      const nextIndex = (activeIndex + 1) % impactItems.length;
      scrollToIndex(nextIndex, true);
    }, 4500);
  };

  const scrollToIndex = (index: number, fromAuto = false) => {
    const container = sliderRef.current;
    if (!container) return;

    const clampedIndex = Math.max(0, Math.min(index, impactItems.length - 1));
    const card = container.children.item(clampedIndex) as HTMLElement | null;
    if (!card) return;

    if (!fromAuto) {
      stopAutoScroll();
    }

    isAutoScrollingRef.current = fromAuto;
    container.scrollTo({
      left: card.offsetLeft - container.offsetLeft,
      behavior: "smooth",
    });
    setActiveIndex(clampedIndex);
  };

  const handleScroll = () => {
    const container = sliderRef.current;
    if (!container) return;

    if (isAutoScrollingRef.current) {
      return;
    }

    const center = container.scrollLeft + container.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    Array.from(container.children).forEach((child, index) => {
      const element = child as HTMLElement;
      const childCenter = element.offsetLeft + element.offsetWidth / 2;
      const distance = Math.abs(center - childCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  };

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [activeIndex]);

  return (
    <section className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8 md:py-16">
      <SectionHeader title="OUR IMPACT" description="At Combine Foundation, every project is created with the mission to bring positive change in people's lives. Through our educational, welfare, leadership, and community development programs, we have proudly impacted 3000+ individuals by creating opportunities, spreading hope, and supporting communities in times of need." />

      <div className="md:hidden mt-10">
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          onTouchStart={stopAutoScroll}
          onTouchEnd={startAutoScroll}
          onMouseDown={stopAutoScroll}
          onMouseUp={startAutoScroll}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {impactItems.map((item) => (
            <div key={item.id} className="min-w-full snap-center">
              <ImpactCard item={item} />
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          {impactItems.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to impact card ${index + 1}`}
              onClick={() => scrollToIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === index ? "w-6 bg-secondary-500" : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-center justify-items-center">
        {impactItems.map((item) => (
          <ImpactCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
