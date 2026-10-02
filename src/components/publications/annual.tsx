"use client";

import Image from "next/image";
import type { FirestoreAnnualReport } from "@/lib/admin-actions";

type Report = {
    id: string | number;
    title: string;
    description: string;
    image: string;
    viewUrl: string;
};


function ReportCard({ report }: { report: Report | FirestoreAnnualReport }) {
    return (
        <div className="w-full bg-white rounded-2xl shadow-xl flex flex-col min-[500px]:flex-row overflow-hidden h-auto min-[500px]:h-[350px] items-center md:p-6 p-4 gap-4 min-[500px]:gap-0">
            {/* Image */}
            <div className="relative w-full min-[500px]:w-[200px] sm:min-[500px]:w-[250px] md:min-[500px]:w-[430px] shrink-0 h-[220px] min-[500px]:h-[300px]">
                <Image
                    src={report.image}
                    alt={report.title}
                    fill
                    sizes="(max-width: 500px) 100vw, (max-width: 768px) 250px, 430px"
                    className="object-top object-cover rounded-xl"
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pl-0 min-[500px]:pl-5 py-2 min-[500px]:py-5 flex flex-col h-full justify-center w-full">
                <h2 className="text-xl lg:text-4xl font-bold text-secondary-500 leading-snug">
                    {report.title}
                </h2>

                <p className="mt-2 text-primary-800 text-sm md:text-xs lg:text-base leading-relaxed">
                    {report.description}
                </p>

                {/* Buttons */}
                <div className="mt-5 flex w-full flex-col flex-wrap gap-3 md:flex-row">
                    {/* View */}
                    <a
                        href={report.viewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-[42px] w-full items-center justify-center rounded-full bg-[linear-gradient(90deg,var(--secondary-700)_0%,var(--secondary-500)_100%)] text-sm font-semibold text-white transition-opacity hover:opacity-90 min-[830px]:w-[350px]"
                    >
                        View
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function AnnualReports({ reports }: { reports?: FirestoreAnnualReport[] }) {
    const displayReports = reports && reports.length > 0 ? reports : [];
    return (
        <section id="annual-reports" className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8 py-12">
            {/* Heading */}
            <div className="mb-8 border-b border-gray-300 pb-4">
                <h1 className="text-3xl md:text-4xl font-extrabold text-secondary-500">
                    Annual Reports
                </h1>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-5">
                {displayReports.map((report) => (
                    <ReportCard key={report.id || report.title} report={report} />
                ))}
            </div>
        </section>
    );
}
