"use client";

import Link from "next/link";

interface Props {
    text: string;
    buttonText: string;
    url?: string;
}

export default function VisionBanner({ text, buttonText, url }: Props) {
    const href = url?.trim();
    const isValidLink = !!href;

    return (
        <div className="w-[97vw] m-auto flex  mb-10 justify-center px-0 sm:px-4 lg:px-0">
            <div className=" w-full m-auto sm:w-[98%] bg-secondary-500 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-6">
                <p className="text-white text-sm sm:text-xl md:text-2xl font-bold text-center sm:text-left">
                    {text}
                </p>
                {isValidLink ? (
                    <Link href={href} className="shrink-0 bg-primary-500 hover:brightness-90 text-white font-semibold text-sm px-6 py-3 rounded-full transition-all duration-200 whitespace-nowrap">
                        {buttonText}
                    </Link>
                ) : (
                    <span className="shrink-0 bg-primary-500/60 text-white font-semibold text-sm px-6 py-3 rounded-full whitespace-nowrap cursor-not-allowed">
                        {buttonText}
                    </span>
                )}
            </div>
        </div>
    );
}
