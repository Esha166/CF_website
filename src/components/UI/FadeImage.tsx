"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

export default function FadeImage({ className = "", onLoad, ...props }: ImageProps) {
    const [loaded, setLoaded] = useState(false);

    return (
        <>
            <div
                className={`absolute inset-0 bg-gray-200 transition-opacity duration-300 ${loaded ? "opacity-0" : "opacity-100 animate-pulse"
                    }`}
            />
            <Image
                {...props}
                className={`${className} transition-opacity duration-500 ease-out ${loaded ? "opacity-100" : "opacity-0"
                    }`}
                onLoad={(e) => {
                    setLoaded(true);
                    onLoad?.(e);
                }}
            />
        </>
    );
}
