import React from 'react';
import Image from 'next/image';

interface TeamMemberCardProps {
  name: string;
  role: string;
  image: string;
  variant?: 'grid' | 'list';
}

const TeamMemberCard = ({ name, role, image, variant = 'grid' }: TeamMemberCardProps) => {
  if (variant === 'list') {
    return (
      <div className="flex items-center gap-6 p-6 border-b border-gray-100 last:border-0 group">
        <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-transparent group-hover:border-orange transition-all">
          <Image src={image} alt={name} fill sizes="96px" className="object-cover" />
        </div>
        <div>
          <h4 className="text-xl font-bold text-navy">{name}</h4>
          <p className="text-gray-500 font-medium">{role}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center p-4 group">
      <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-4 border-2 border-transparent group-hover:border-orange transition-all shadow-md">
        <Image src={image} alt={name} fill sizes="(max-width: 768px) 128px, 160px" className="object-cover" />
      </div>
      <h4 className="text-lg font-bold text-navy leading-tight">{name}</h4>
      <p className="text-sm text-gray-500 font-medium mt-1">{role}</p>
    </div>
  );
};

export default TeamMemberCard;
