import Image from "next/image";

export default function FounderProfile() {
  return (

    <section className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8 py-10">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black border-b border-black pb-4 mb-10">

        Our Founder & Mentor
      </h2>

      <div className="flex flex-col md:flex-row gap-10 lg:gap-16 items-start">
        
        <div className="flex-1 order-1 mt-3">
          <h3 className="text-xl lg:text-3xl font-bold text-primary-600 uppercase tracking-wide mb-1">
            Mr. Amin Nathani
          </h3>
          <p className="text-sm md:text-base text-primary-800 mb-5">
            Founder & Member, Board of Directors
          </p>

          <p className="text-xs sm:text-xs lg:text-lg xl:text-xl text-gray-800 leading-relaxed mb-5">
            Mr. Muhammad Amin Nathani is a visionary leader and board member of Combine Foundation, an organization dedicated to educating and empowering youth to become the leaders of tomorrow. As the founder, his focus is on creating lasting pathways for young people to develop essential skills, leadership qualities, and the confidence needed to drive meaningful change in their communities.
          </p>

          <p className="text-xs sm:text-xs lg:text-lg xl:text-xl text-gray-800 leading-relaxed">
            His passion lies in designing programs and initiatives that equip the next generation with the tools to succeed. Through Combine Foundation, Mr. Amin Nathani continues to champion youth empowerment, skill development, and leadership training, ensuring that young individuals are prepared to thrive and make a positive impact in Pakistan and beyond.
          </p>
        </div>

        <div className="relative w-full md:w-[23rem] lg:w-[32rem] xl:w-[38rem] aspect-[4/3] md:aspect-square flex-shrink-0 order-2 rounded-[2rem] overflow-hidden shadow-sm">
          <Image
            src="/about/founder/founder.jpeg"
            alt="Mr. Amin Nathani"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 23rem, (max-width: 1280px) 32rem, 38rem"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
