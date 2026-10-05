"use client";

import type { Module } from "@/lib/freeCourses";

interface ModulesProps {
  modules: Module[];
  guidelineCta?: string;
  guidelineFile?: string;
}

export default function Modules({ modules, guidelineCta, guidelineFile }: ModulesProps) {
  const handleDownload = () => {
    if (guidelineFile) {
      window.open(guidelineFile, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8 py-8">
      <div className="pb-3 mb-6 px-9">
        <h2 className="text-2xl md:text-5xl font-bold text-black tracking-tight">
          Modules
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:mx-9">
{modules.map((mod, idx) => (
          <div
            key={mod.id ?? idx}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col min-h-[350px]"
          >
            <h3 className="text-base lg:text-lg xl:text-xl font-bold text-gray-900 mb-3">
              {mod.title}
            </h3>
            <ul className="space-y-2 flex-1">
              {mod.bullets.map((b, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm lg:text-base xl:text-lg text-gray-700 leading-snug"
                >
                  <span className="mt-[7px] shrink-0 w-1.5 h-1.5 rounded-full bg-gray-700" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="w-full flex mt-6 mb-10 justify-center">
        <div className="w-full sm:w-[95%] bg-secondary-500 rounded-xl flex flex-col min-[550px]:flex-row items-center justify-between gap-4 px-8 py-6">
          <p className="text-white text-sm sm:text-xl md:text-2xl font-bold text-center sm:text-left">
            {guidelineCta || "Want to Master This Course? Download the Complete Course Guideline Now!"}
          </p>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!guidelineFile}
            className="shrink-0 bg-accent-orange hover:brightness-90 text-white font-semibold text-sm px-4 sm:px-6 py-3 rounded-full transition-all duration-200 whitespace-nowrap"
          >
            Download Course Guidelines
          </button>
        </div>
      </div>
    </section>
  );
}
