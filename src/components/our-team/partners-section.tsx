"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import type { FirestorePartner } from "@/lib/admin-actions";

interface Partner {
  id: number | string;
  name: string;
  description: string;
  image: string;
  mouUrl?: string;
}

type Direction = "next" | "prev";

export default function PartnersSection({ partners: initialPartners }: { partners?: FirestorePartner[] }) {
  const displayPartners: Partner[] =
    initialPartners && initialPartners.length > 0 ? (initialPartners as Partner[]) : [];

  const [current, setCurrent] = useState<number>(0);
  const [sliding, setSliding] = useState<boolean>(false);
  const [direction, setDirection] = useState<Direction>("next");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (dir: Direction) => {
      if (sliding || displayPartners.length === 0) return;
      setDirection(dir);
      setSliding(true);
      setTimeout(() => {
        setCurrent((prev) =>
          dir === "next"
            ? (prev + 1) % displayPartners.length
            : (prev - 1 + displayPartners.length) % displayPartners.length
        );
        setSliding(false);
      }, 400);
    },
    [sliding, displayPartners.length]
  );

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (displayPartners.length < 2) return;
    timerRef.current = setInterval(() => goTo("next"), 5000);
  }, [goTo, displayPartners.length]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const handlePrev = () => { goTo("prev"); startTimer(); };
  const handleNext = () => { goTo("next"); startTimer(); };

  if (displayPartners.length === 0) return null;

  const partner = displayPartners[current];
  const [firstWord, ...remainingWords] = partner.name.split(" ");
  const remainingName = remainingWords.join(" ");

  return (
    <div className="">
      <div className="mb-2 p-4 md:p-6 lg:p-8 px-16">
        <h2 className="text-3xl font-bold text-secondary-500">Our Partners</h2>
      <hr className="border-gray-300" />
      </div>
    <div className="group grid grid-cols-1 md:grid-cols-5 gap-0 rounded-3xl overflow-hidden mb-5">
      {/* Text */}
      <div className="md:col-span-3 flex flex-col justify-center p-8 md:p-10 lg:p-12">
        <h3 className="text-xl md:text-2xl font-bold mb-6">
          <span className="text-primary-600">{firstWord}</span>
          {remainingName && (
            <span className="text-secondary-500"> {remainingName}</span>
          )}
        </h3>
        <p className="text-sm md:text-base text-primary-800 leading-relaxed">
          {partner.description}
        </p>


        {/* moved here */}
        <div className="grid grid-cols-2">

          <div className="flex gap-3 mt-8">
            <button onClick={handlePrev} aria-label="Previous partner" className="w-11 h-11 rounded-full bg-primary-700 hover:brightness-90 text-white flex items-center justify-center transition-all duration-200 cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button onClick={handleNext} aria-label="Next partner" className="w-11 h-11 rounded-full bg-primary-700 hover:brightness-90 text-white flex items-center justify-center transition-all duration-200 cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          {partner.mouUrl && (
            <div className="mt-10 md:mt-0 flex justify-start items-center md:justify-end">
              <a
                href={partner.mouUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-500 text-white font-medium text-sm rounded-lg hover:shadow-lg hover:brightness-110 transition-all duration-300"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View MOU
              </a>
            </div>
          )}
        </div>
      </div>
      <div
        className="hidden md:flex relative md:col-span-2 w-full overflow-hidden rounded-2xl"
        style={{ height: "500px" }}
      >
        <div
          className="flex absolute inset-0 transition-all w-full duration-400 ease-in-out rounded-2xl"
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
            src={partner.image}
            alt={partner.name}
            fill
            className="object-cover rounded-2xl"
            priority
          />
        </div>


      </div>

    </div>
    </div>
  );
}
