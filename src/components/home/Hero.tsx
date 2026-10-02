"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

type Slide = {
  id: number;
  image: string;
  mobile: string;
  alt: string;
};

const slides: Slide[] = [
  {
    id: 1,
    image: "/home/heroslider/1.webp",
    mobile: "/home/heroslider/mobile1.webp",
    alt: "Building communities together",
  },
  {
    id: 2,
    image: "/home/heroslider/2.webp",
    mobile: "/home/heroslider/mobile2.webp",
    alt: "Empowering education across borders",
  },
  {
    id: 3,
    image: "/home/heroslider/3.webp",
    mobile: "/home/heroslider/mobile3.webp",
    alt: "Creating lasting change",
  },
  {
    id: 4,
    image: "/home/heroslider/5.webp",
    mobile: "/home/heroslider/mobile5.webp",
    alt: "Volunteers making a difference",
  },
];

type Direction = "next" | "prev";

export default function HeroSlider() {
  const [current, setCurrent] = useState<number>(0);
  const [sliding, setSliding] = useState<boolean>(false);
  const [direction, setDirection] = useState<Direction>("next");
  const [isMobile, setIsMobile] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const goNext = useCallback(() => {
    if (sliding) return;
    setDirection("next");
    setSliding(true);
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
      setSliding(false);
    }, 400);
  }, [sliding]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      goNext();
    }, 5000);
  }, [goNext]);

  useEffect(() => {
    if (reduceMotion) return;
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer, reduceMotion]);

  const handleNext = () => {
    goNext();
    startTimer();
  };

  const handlePrev = () => {
    if (sliding) return;
    setDirection("prev");
    setSliding(true);
    setTimeout(() => {
      setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
      setSliding(false);
    }, 400);
    startTimer();
  };

  return (
    <section className={`relative w-full overflow-hidden bg-gray-300 ${isMobile ? "aspect-[1280/700]" : "aspect-[1280/480]"}`}>
      <div
        className="absolute inset-0"
        style={{
          opacity: sliding ? 0 : 1,
          transform: sliding
            ? direction === "next"
              ? "translateX(-30px)"
              : "translateX(30px)"
            : "translateX(0)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        <Image
          src={isMobile ? slides[current].mobile : slides[current].image}
          alt={slides[current].alt}
          fill
          className={`motion-image ${isMobile ? "object-cover object-top" : "object-cover object-center"}`}
          sizes="100vw"
          priority={!reduceMotion}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
      </div>

      <div className="absolute bottom-6 left-6 flex gap-2 z-10">
        <button
          onClick={handlePrev}
          aria-label="Previous slide"
          className="w-9 h-9 rounded-full border border-white/60 bg-white backdrop-blur-sm text-black flex items-center justify-center hover:bg-white/85 transition-colors duration-200 cursor-pointer"
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
          aria-label="Next slide"
          className="w-9 h-9 rounded-full border border-white/60 bg-white backdrop-blur-sm text-black flex items-center justify-center hover:bg-white/85 transition-colors duration-200 cursor-pointer"
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

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        {slides.map((_, i) => (
          <span
            key={i}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: i === current ? "24px" : "8px",
              background:
                i === current ? "#fff" : "rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
