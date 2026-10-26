"use client";

import Image from "next/image";

interface Certificate {
    id: number;
    title: string;
    image: string;
    imageAlt: string;
    url: string;
}

const certificates: Certificate[] = [
    {
        id: 1,
        title: "Certificate of Incorporation",
        image: "/publications/pub1.png",
        imageAlt: "COI",
        url: "/coi-combine-foundation.pdf",
    },
    {
        id: 2,
        title: "PCP Certificate",
        image: "/publications/pub2.png",
        imageAlt: "PCP Certificate",
        url: "/pcp-certificate-2026-1.pdf",
    },
    {
        id: 3,
        title: "License",
        image: "/publications/pub3.png",
        imageAlt: "License",
        url: "/License.pdf",
    },
    {
        id: 4,
        title: "FBR Certificate",
        image: "/publications/pub4.png",
        imageAlt: "FBR Certificate",
        url: "/fbr-certificate.pdf",
    },
];

const ArrowIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="7" y1="17" x2="17" y2="7" />
        <polyline points="7 7 17 7 17 17" />
    </svg>
);

const CertificateCard = ({ cert }: { cert: Certificate }) => {
    return (
        <div className="aspect-square flex flex-col rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200 ">
            {/* Book Cover Image */}
            <div className="relative w-full flex-1 bg-gray-200 flex items-center justify-center">
                {cert.image ? (
                    <Image
                        src={cert.image}
                        alt={cert.imageAlt}
                        fill
                        className="object-cover object-top"
                    />
                ) : (
                    <span className="text-gray-400 text-sm lg:text-base font-medium">
                        Book cover image
                    </span>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white shrink-0">
                <span className="text-sm font-medium text-gray-900 leading-tight">
                    {cert.title}
                </span>
                <a
                    href={cert.url}
                    aria-label={`Open ${cert.title}`}
                    className="ml-3 flex-shrink-0 w-8 h-8 rounded-full bg-secondary-600 hover:brightness-90 text-white flex items-center justify-center transition-all duration-200 cursor-pointer"
                >
                    <ArrowIcon />
                </a>
            </div>
        </div>
    );
};

const TaxShariaCertificates = () => {
    return (
        <section id="tax-certificates" className="scroll-mt-28 bg-white py-12">
            <div className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8">

                <div className="mb-2">
                    <h2 className="text-2xl font-bold text-secondary-500">
                        Tax and Sharia Certificates
                    </h2>
                </div>
                <hr className="border-gray-300 mb-8" />

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mx-5">
                    {certificates.map((cert) => (
                        <CertificateCard key={cert.id} cert={cert} />
                    ))}
                </div>

            </div>
        </section>
    );
};

export default TaxShariaCertificates;
