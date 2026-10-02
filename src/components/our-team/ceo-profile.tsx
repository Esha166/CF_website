import Image from "next/image";

export default function CeoProfile() {
  return (

    <section className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8 py-10">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black border-b border-black pb-4 mb-10">

        Our CEO
      </h2>

      <div className="flex flex-col md:flex-row gap-10 lg:gap-16 items-start">
        
        <div className="relative w-full md:w-[23rem] lg:w-[32rem] xl:w-[38rem] aspect-[4/3] md:aspect-square flex-shrink-0 order-2 md:order-1 rounded-[2rem] overflow-hidden shadow-sm">
          <Image
            src="/1.jpg"
            alt="Mr. Ashfaq Nathani"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 23rem, (max-width: 1280px) 32rem, 38rem"
            className="object-cover"
          />
        </div>

        <div className="flex-1 order-1 md:order-2 mt-3">
          <h3 className="text-xl lg:text-3xl font-bold text-primary-600 uppercase tracking-wide mb-1">
            Mr. Ashfaq Nathani
          </h3>
          <p className="text-sm md:text-base text-primary-800 mb-5">
            Chief Executive Officer & Board of Director
          </p>

          <p className="text-xs sm:text-xs lg:text-lg xl:text-xl text-gray-800 leading-relaxed mb-5">
            Ashfaq Nathani serves as the Chief Executive Officer and board member at Combine Foundation, responsible for managing operations and youth development programs. He is deeply committed to developing young people into future leaders through effective leadership training, technology education, innovation, and applied learning opportunities.
          </p>

          <p className="text-xs sm:text-xs lg:text-lg xl:text-xl text-gray-800 leading-relaxed">
            Sustainable development is a key focus, believing that quality education, healthcare, leadership, and accountability are essential for stronger communities. Under his leadership, Combine Foundation prepares the next generation to compete globally and drive positive change in Pakistan.
          </p>
        </div>
      </div>
    </section>
  );
}
