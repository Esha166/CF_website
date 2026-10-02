import React from 'react';
import Image from 'next/image';

interface ProfileHeroProps {
  name: string;
  role: string;
  description: string[];
  image: string;
  reverse?: boolean;
}

const ProfileHero = ({ name, role, description, image, reverse = false }: ProfileHeroProps) => {
  return (
    <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 md:gap-16 py-12`}>
      <div className="w-full md:w-1/2">
        <div className="relative">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-orange opacity-20 rounded-full blur-2xl"></div>
          <div className="relative w-full aspect-[4/3] rounded-3xl shadow-2xl overflow-hidden z-10">
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-navy opacity-10 rounded-full blur-3xl"></div>
        </div>
      </div>
      <div className="w-full md:w-1/2 space-y-4">
        <h3 className="text-orange font-bold uppercase tracking-wider text-sm">{role}</h3>
        <h2 className="text-4xl font-extrabold text-navy">{name}</h2>
        <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
          {description.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileHero;
