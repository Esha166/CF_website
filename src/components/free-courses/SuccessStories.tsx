"use client";

import { useEffect, useState } from "react";

export interface StoryItem {
  name: string;
  description: string;
  course: string;
  videoUrl?: string;
}

function platformLabel(url: string): string | null {
  try {
    const h = new URL(url).hostname.toLowerCase();
    if (h.includes("instagram")) return "Instagram";
    if (h.includes("youtube") || h.includes("youtu.be")) return "YouTube";
    if (h.includes("facebook") || h.includes("fb.watch")) return "Facebook";
    if (h.includes("tiktok")) return "TikTok";
    if (h.includes("linkedin")) return "LinkedIn";
    if (h.includes("x.com") || h.includes("twitter")) return "X";
    return null;
  } catch {
    return null;
  }
}

export default function SuccessStories({ stories }: { stories: StoryItem[] }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [animating, setAnimating] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const navigate = (dir: "left" | "right") => {
    if (animating || stories.length <= 1) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent((prev) =>
        dir === "right"
          ? (prev + 1) % stories.length
          : (prev - 1 + stories.length) % stories.length
      );
      setAnimating(false);
      setDirection(null);
    }, 320);
  };

  const story = stories[current];

  if (stories.length === 0) return null;

  const motionClass =
    reduceMotion || stories.length <= 1
      ? ""
      : animating
        ? direction === "right"
          ? "slide-exit-left"
          : "slide-exit-right"
        : "slide-enter-right";

  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .slide-enter-right,
          .slide-enter-left,
          .slide-exit-right,
          .slide-exit-left,
          .play-btn,
          .nav-btn,
          .dot {
            animation: none !important;
            transition: none !important;
          }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(48px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-48px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutRight {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(48px); }
        }
        @keyframes slideOutLeft {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-48px); }
        }

        .slide-enter-right { animation: slideInRight 0.32s cubic-bezier(0.22,1,0.36,1) both; }
        .slide-enter-left  { animation: slideInLeft  0.32s cubic-bezier(0.22,1,0.36,1) both; }
        .slide-exit-right  { animation: slideOutRight 0.32s cubic-bezier(0.22,1,0.36,1) both; }
        .slide-exit-left   { animation: slideOutLeft  0.32s cubic-bezier(0.22,1,0.36,1) both; }

        .play-btn {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .play-btn:hover {
          transform: scale(1.12);
          box-shadow: 0 8px 32px rgba(0,0,0,0.28);
        }
        .nav-btn {
          transition: background 0.18s ease, transform 0.18s ease;
        }
        .nav-btn:hover {
          filter: brightness(0.9) !important;
          transform: scale(1.08);
        }
        .nav-btn:active { transform: scale(0.96); }

        .dot { transition: width 0.3s ease, background 0.3s ease; }
      `}</style>

      <section className="w-full max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="border-b border-gray-300 pb-3 mb-5">
          <h2 className="ss-title text-2xl md:text-5xl font-bold text-secondary-500 tracking-tight">
            Our Success Stories & Achievements
          </h2>
        </div>

        <div style={{ margin: "0 20px" }}>
          <div className="w-full rounded-2xl overflow-visible" style={{ background: "#FF6900" }}>
            <div className="relative">
              {stories.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => navigate("left")}
                    aria-label="Previous"
                    className="nav-btn absolute z-20 flex items-center justify-center rounded-full w-10 h-10 lg:w-[50px] lg:h-[50px] xl:w-[60px] xl:h-[60px]"
                    style={{
                      background: "var(--secondary-500)",
                      border: "none",
                      cursor: "pointer",
                      left: -22,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M9 2L4 7L9 12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("right")}
                    aria-label="Next"
                    className="nav-btn absolute z-20 flex items-center justify-center rounded-full w-10 h-10 lg:w-[50px] lg:h-[50px] xl:w-[60px] xl:h-[60px]"
                    style={{
                      background: "var(--secondary-500)",
                      border: "none",
                      cursor: "pointer",
                      right: -22,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M5 2L10 7L5 12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </>
              )}

              <div
                className={`w-full relative flex items-center justify-center overflow-hidden rounded-t-2xl ${motionClass}`}
                style={{ background: "#c4cdd6", minHeight: 220, maxHeight: 340, aspectRatio: "16/7" }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 4px)",
                  }}
                />

                <div className="w-full flex flex-col items-center justify-center gap-2">
                  {story.videoUrl ? (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(story.videoUrl, "_blank", "noopener,noreferrer");
                        }}
                        aria-label={`Watch on ${platformLabel(story.videoUrl) || "external platform"}`}
                        className="play-btn relative z-10 flex items-center justify-center rounded-full"
                        style={{
                          width: 56,
                          height: 56,
                          background: "var(--secondary-500)",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
                          <path d="M2 1.5L18 11L2 20.5V1.5Z" fill="white" />
                        </svg>
                      </button>
                      <span className="relative z-10 text-xs text-gray-600 font-medium flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-full">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        Watch on {platformLabel(story.videoUrl) || "External"}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs">No video</span>
                  )}
                </div>
              </div>
            </div>

            <div
              className={`rounded-b-2xl px-6 py-5 ${
                stories.length <= 1 ? "" : animating
                  ? direction === "right" ? "slide-exit-left" : "slide-exit-right"
                  : "slide-enter-right"
              }`}
              style={{ background: "var(--secondary-500)" }}
            >
              <p
                className="ss-title font-bold text-white mb-1.5"
                style={{ fontSize: "clamp(14px, 2vw, 17px)" }}
              >
                {story.name} — {story.course}
              </p>
              <p
                className="text-blue-100 leading-relaxed lg:text-base"
                style={{ fontSize: "clamp(11px, 1.5vw, 13.5px)" }}
              >
                {story.description}
              </p>

              <div className="flex items-center gap-1.5 mt-3">
                {stories.map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => {
                      if (i === current) return;
                      const forward = (i - current + stories.length) % stories.length;
                      setDirection(forward <= stories.length / 2 ? "right" : "left");
                      setAnimating(true);
                      setTimeout(() => {
                        setCurrent(i);
                        setAnimating(false);
                        setDirection(null);
                      }, 320);
                    }}
                    aria-label={`Go to story ${i + 1}`}
                    className="dot rounded-full"
                    style={{
                      height: 6,
                      width: i === current ? 20 : 6,
                      background: i === current ? "#fff" : "rgba(255,255,255,0.35)",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
