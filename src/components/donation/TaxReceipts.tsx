import Link from "next/link";

const documents = [
    {
        label: "All tax & Sharia certificates",
        meta: "Publications",
        href: "/publications#tax-certificates",
        external: false,
    },
    {
        label: "FBR certificate",
        meta: "PDF",
        href: "/fbr-certificate.pdf",
        external: true,
    },
    {
        label: "PCP certificate",
        meta: "PDF",
        href: "/pcp-certificate-2026-1.pdf",
        external: true,
    },
];

const rowClass =
    "flex items-center justify-between gap-4 border-b border-gray-300 py-3.5 text-sm md:text-base font-semibold text-secondary-500 hover:underline";

const TaxReceipts = () => {
    return (
        <div className="px-4 py-10 md:px-8 md:py-14">
            <div className="w-full max-w-[1280px] mx-auto">

                <h2 className="text-3xl md:text-4xl font-extrabold text-secondary-500 tracking-tight mb-3">
                    Tax &amp; Receipts
                </h2>
                <hr className="border-t border-[#b0bec5] mb-8" />

                <div>
                    <p className="text-sm lg:text-lg text-gray-600 leading-relaxed">
                        Combine Foundation is a registered non-profit under Section 42 of the Companies Act 2017 and a tax-exempt organisation (Charity Reg. No. PCP-R3/2022/234, National Tax No. 3162706-4).
                    </p>
                    <p className="text-sm lg:text-lg text-gray-600 leading-relaxed mt-4">
                        Donations may qualify for tax deduction under applicable Pakistani tax law. To request a donation receipt, email{" "}
                        <a
                            href="mailto:info@combinefoundation.org?subject=Donation%20receipt%20request"
                            className="font-semibold text-secondary-500 hover:underline"
                        >
                            info@combinefoundation.org
                        </a>{" "}
                        with your name, donation date and payment reference.
                    </p>
                </div>

                <h3 className="mt-8 mb-3 text-base md:text-lg font-semibold text-secondary-500">
                    Certificates
                </h3>
                <ul className="border-t border-gray-300">
                    {documents.map((doc) => (
                        <li key={doc.href}>
                            {doc.external ? (
                                <a
                                    href={doc.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={rowClass}
                                >
                                    <span>{doc.label}</span>
                                    <span className="text-xs md:text-sm font-normal text-gray-500">{doc.meta}</span>
                                </a>
                            ) : (
                                <Link href={doc.href} className={rowClass}>
                                    <span>{doc.label}</span>
                                    <span className="text-xs md:text-sm font-normal text-gray-500">{doc.meta}</span>
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>

            </div>
        </div>
    );
};

export default TaxReceipts;
