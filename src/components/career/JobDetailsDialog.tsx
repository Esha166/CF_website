"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Mail, X } from "lucide-react";
import { Job } from "@/types/database";
import { sanitizeJobDescription } from "@/lib/job-description";

interface JobDetailsDialogProps {
  job: Job;
  onClose: () => void;
}

export default function JobDetailsDialog({ job, onClose }: JobDetailsDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    setMounted(true);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      setMounted(false);
    };
  }, [onClose]);

  const dialog = (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-slate-950/60 p-2 backdrop-blur-[2px] sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-dialog-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[calc(100dvh-1rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[min(800px,calc(100dvh-2rem))] sm:rounded-3xl">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 bg-white px-5 py-4 sm:px-8 sm:py-5">
          <div>
            <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-secondary-500">
              {job.department || "Open Position"}
            </span>
            <h2 id="job-dialog-title" className="mt-2 text-xl font-bold text-secondary-500 md:text-2xl">
              {job.title}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Close job details" className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
          <div className="space-y-6">
          <div
            className="text-sm leading-relaxed text-gray-600 md:text-base [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1"
            dangerouslySetInnerHTML={{ __html: sanitizeJobDescription(job.description) }}
          />

          {job.requirements?.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-900">Requirements & Qualifications</h3>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-600 md:text-base">
                {job.requirements.map((requirement, index) => <li key={index}>{requirement}</li>)}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 md:flex-row md:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-white text-secondary-500 shadow-sm">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">How to Apply</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                Apply using the form or send your updated resume / CV to{" "}
                <a href={`mailto:info@combinefoundation.org?subject=Job Application - ${job.title}`} className="font-bold text-secondary-500 hover:underline">
                  info@combinefoundation.org
                </a>.
              </p>
            </div>
          </div>

          </div>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50">
            Close
          </button>
          {job.formLink && (
            <a href={job.formLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-secondary-600">
              Apply Now <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return mounted ? createPortal(dialog, document.body) : null;
}
