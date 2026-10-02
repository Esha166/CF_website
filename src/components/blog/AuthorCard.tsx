"use client";

import Image from "next/image";

interface AuthorCardProps {
  name?: string;
  bio?: string;
  image?: string;
}

export default function AuthorCard({
  name = "Ali Ibrahim",
  bio = "Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa miquam in hendrerit urna. Pellentesque sit amet sapien.",
  image = "/home/founder/person.png",
}: AuthorCardProps) {
  return (
    <div className="pt-5 mt-6">
      <hr className="h-2 bg-gray-200 rounded-2xl border-none mb-5" />
      <div className="flex justify-end">
        <div className="flex items-start gap-3 max-w-sm">
          <div>
            <p className="text-sm md:text-base font-bold text-gray-900 mb-1">Written By {name}</p>
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{bio}</p>
          </div>

          <div
            className="relative shrink-0 rounded-full overflow-hidden bg-gray-100"
            style={{ width: 56, height: 56 }}
          >
            <Image
              src={image}
              alt={name}
              fill
              sizes="56px"
              className="object-cover object-top"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
