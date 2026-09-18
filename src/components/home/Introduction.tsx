import Image from "next/image";

const paragraphs = [
  "Combine Foundation is a Pakistan-based Non-Profit Organization working to improve access to healthcare awareness and education for underserved communities. Combine Foundation is officially registered as a Non-Profit Organization (NPO) under Section 42 of the Companies Act 2017, in 2023",
  "Our vision is to empower youth as responsible, confident, and socially-aware leaders who drive positive change, promote community development, and contribute to a more equitable and sustainable society.",
];

export default function Introduction() {
  return (
    <section className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-14">
      <div className="w-full rounded-2xl px-6 py-4 mb-8 md:mb-10 bg-secondary-500">
        <h2 className="text-white font-bold text-4xl md:text-5xl">
          Who We Are
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 md:gap-12 items-start px-2">
        <div className="flex-1 space-y-5">
          {paragraphs.map((para, i) => (
            <p key={i} className="text-black text-base lg:text-lg leading-7">
              {para}
            </p>
          ))}
        </div>

        <div
          className="relative w-full lg:w-[45%] shrink-0 rounded-2xl overflow-hidden"
          style={{ height: "clamp(220px, 30vw, 360px)" }}
        >
          <Image
            src="/about/hero/hero1.png"
            alt="Combine Foundation community activities"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
