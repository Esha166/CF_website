"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Job } from "@/types/database";
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react";
import { jobDescriptionText } from "@/lib/job-description";
import JobDetailsDialog from "@/components/career/JobDetailsDialog";

interface CareerClientViewProps {
  initialJobs: Job[];
}

export default function CareerClientView({ initialJobs }: CareerClientViewProps) {
  const [jobs] = useState<Job[]>(initialJobs);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      {/* Main Content Area */}
      <section className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-8 py-16">
        {jobs.length === 0 ? (
          /* No Jobs State (Currently Not Hiring) */
          <div className="max-w-2xl mx-auto bg-white rounded-[2rem] shadow-xl border border-gray-100/80 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Accent colored line */}
            <div className="h-2 bg-gradient-to-r from-secondary-800 via-secondary-500 to-secondary-800"></div>

            <div className="p-8 md:p-12 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-50 text-secondary-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Briefcase className="w-10 h-10" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-secondary-500">
                Currently Not Hiring
              </h2>
              <p className="text-gray-500 mt-4 font-semibold text-sm md:text-base leading-relaxed max-w-lg">
                We do not have any open employment positions at the moment. However, we are always looking for passionate volunteers to join our mission.
              </p>

              <div className="w-full h-px bg-gray-100 my-8"></div>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Link
                  href="https://www.combinefoundationportal.com/volunteer/apply"
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm md:text-base flex items-center gap-2 group"
                >
                  <span>Apply as Volunteer</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/contact"
                  className="border-2 border-gray-200 text-gray-600 hover:border-secondary-500 hover:text-secondary-500 font-bold px-8 py-4 rounded-full transition-all text-sm md:text-base"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Jobs List State */
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Open Positions
              </h2>
              <span className="bg-secondary-500 text-white text-xs md:text-sm font-bold px-4 py-1.5 rounded-full">
                {jobs.length} Available
              </span>
            </div>

            <div className="space-y-6">
              {jobs.map((job) => {
                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
                  >
                    <div className="p-6 md:p-8">
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                        <div>
                          {/* Department Badge */}
                          <span className="inline-block bg-blue-50 text-secondary-500 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                            {job.department || "Open Position"}
                          </span>
                          <h3 className="text-xl md:text-2xl font-bold text-secondary-500 mt-2">
                            {job.title}
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {job.formLink && (
                            <a
                              href={job.formLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl bg-secondary-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-secondary-600"
                            >
                              Apply Now <ArrowRight className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            onClick={() => setSelectedJob(job)}
                            className="flex items-center gap-1.5 rounded-xl bg-blue-50/50 px-4 py-2 text-sm font-bold text-secondary-500 transition-colors hover:bg-blue-50 hover:text-blue-800 cursor-pointer"
                          >
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>

                      {/* Location & Job Type Row */}
                      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-semibold mb-4">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-sky-400" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span>{job.type}</span>
                        </div>
                      </div>

                      {/* Job Brief Description */}
                      <p className="line-clamp-3 text-gray-600 text-sm md:text-base leading-relaxed">
                        {jobDescriptionText(job.description)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
      {selectedJob && <JobDetailsDialog job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  );
}
