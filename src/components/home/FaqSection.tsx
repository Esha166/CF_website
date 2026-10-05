"use client";

import { useState } from "react";
import SectionHeader from "@/components/UI/SectionHeader";

type FaqItem = {
  id: number;
  question: string;
  answer: string | string[];
};

const faqs: FaqItem[] = [
  {
    id: 1,
    question: "What is Combine Foundation and what is its mission?",
    answer:
      "Combine Foundation is a registered non-profit organization under section 42 companies Act 2017 while we are Tax exempted organization and the social impact arm of Combine Group. We are dedicated to creating sustainable change in Pakistan by focusing on education, health awareness, youth empowerment, and community welfare. Our approach is built on transparency, innovation, and long-term impact.",
  },
  {
    id: 2,
    question: "How can I join or volunteer with Combine Foundation?",
    answer:
      "You can join Combine Foundation by submitting an application through the Combine Foundation Portal. The process includes application submission, review, interview, and onboarding. Students, professionals, and passionate individuals who want to contribute to social impact, community development, and learning opportunities are welcome. No prior experience is required.",
  },
  {
    id: 3,
    question: "How can I donate or support the foundation?",
    answer: [
      "You can support Combine Foundation by:",
      "Donating to fund education, healthcare, and welfare programs",
      "Sponsoring students through scholarships",
      "Supporting community relief initiatives",
    ],
  },
  {
    id: 4,
    question: "Why should organizations partner with the Combine Foundation?",
    answer: [
      "Partnering with Combine Foundation offers:",
      "Direct impact through a zero-admin-cost approach",
      "Transparency and accountability in all operations",
      "Future-focused programs (AI, technology, workforce development)",
      "CSR collaboration opportunities aligned with global standards",
    ],
  },
  {
    id: 5,
    question: "Is prior experience required for volunteering?",
    answer:
      "No. Beginners and students are welcome as long as they are motivated to contribute and learn.",
  },
  {
    id: 6,
    question: "Are certificates provided to volunteers?",
    answer:
      "Yes, certificates are awarded based on participation and performance.",
  },
  {
    id: 7,
    question: "Can volunteers grow into leadership roles?",
    answer:
      "Yes, volunteers can progress into youth leadership, internship, and job opportunities.",
  },
  {
    id: 8,
    question: "What benefits do volunteers get?",
    answer:
      "Volunteers gain practical experience, leadership and communication skills, access to training sessions and webinars, real project exposure, networking opportunities, and career development support.",
  },
  {
    id: 9,
    question: "Who can join as a volunteer?",
    answer:
      "Students, professionals, and passionate individuals who want to contribute to social impact, community development, and learning opportunities can join as volunteers.",
  },
];

type FaqRowProps = {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
  panelId: string;
};

function FaqRow({ item, isOpen, onToggle, panelId }: FaqRowProps) {
  return (
    <div className="border-b border-gray-200 transition-colors duration-300 hover:bg-black/[0.02]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 px-4 py-5 text-left cursor-pointer group"
      >
        <span className="text-base font-semibold text-gray-900 transition-colors duration-300 group-hover:text-secondary-500 md:text-lg">
          {item.question}
        </span>
        <span
          className={`flex-shrink-0 text-2xl transition-colors duration-300 ${
            isOpen ? "text-secondary-500" : "text-gray-400"
          }`}
        >
          {isOpen ? "−" : "+"}
        </span>
      </button>

      <div
        id={panelId}
        className={`grid px-4 transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] pb-0 opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          {Array.isArray(item.answer) ? (
            <>
              <p className="text-sm leading-relaxed text-gray-600 md:text-base">
                {item.answer[0]}
              </p>
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm leading-relaxed text-gray-600 md:text-base">
                {item.answer.slice(1).map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm leading-relaxed text-gray-600 md:text-base">
              {item.answer}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

type FaqSectionProps = {
  description?: string;
};

export default function FaqSection({ description }: FaqSectionProps) {
  const [openId, setOpenId] = useState<number | null>(0);

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-16 md:px-6 lg:px-8">
      {description ? (
        <SectionHeader
          title="Frequently Asked Questions"
          description={description}
        />
      ) : (
        <h2 className="border-b border-gray-300 pb-3 text-2xl font-bold tracking-tight text-black md:text-5xl">
          Frequently Asked Questions
        </h2>
      )}

      <div className="mt-10">
        {faqs.map((item) => (
          <FaqRow
            key={item.id}
            item={item}
            isOpen={openId === item.id}
            panelId={`faq-panel-${item.id}`}
            onToggle={() => toggle(item.id)}
          />
        ))}
      </div>
    </section>
  );
}
