"use client";

import { useState } from "react";

type FaqItem = {
  id: number;
  question: string;
  answer: string | string[];
};

const faqs: FaqItem[] = [
  {
    id: 1,
    question: "What is the Combine Foundation Volunteer Program?",
    answer:
      "The Combine Foundation Volunteer Program is an opportunity for students and young professionals to gain practical experience, improve their skills, work on real-world projects, and contribute positively to society in a supportive and professional environment.",
  },
  {
    id: 2,
    question: "Who can apply for the volunteer program?",
    answer:
      "Anyone interested in learning, skill development, community work, and career growth can apply. Students, fresh graduates, and young professionals are especially encouraged to join.",
  },
  {
    id: 3,
    question: "How can I apply to become a volunteer?",
    answer:
      "You can apply by filling out the online Combine Foundation Volunteer Program application form with your basic details, interests, availability, and preferred volunteer role.",
  },
  {
    id: 4,
    question: "Is there any application fee?",
    answer:
      "No, applying for the volunteer program is completely free.",
  },
  {
    id: 5,
    question: "What kind of volunteer opportunities are available?",
    answer:
      ["Volunteers can work in different areas including:", "Content Writing", "Graphic Designing", "Web Development", "Media & Marketing", "Leadership Programs", "Video Editing"],
  },
  {
    id: 6,
    question: "How many hours do I need to volunteer each week?",
    answer:
      "You can mention your availability in the application form. The program offers flexible volunteering opportunities based on your schedule.",
  },
  {
    id: 7,
    question: "Is this program suitable for students?",
    answer:
      "Yes. The program is designed to support students by helping them gain practical experience, improve skills, and strengthen their CV or resume while studying.",
  },
  {
    id: 8,
    question: "How will this program help my career?",
    answer:
      ["The volunteer program helps you:", "Gain practical experience", "Improve communication and teamwork skills", "Build leadership abilities", "Strengthen your CV or resume", "Expand your professional network", "Explore career interests and opportunities"],
  },
  {
    id: 9,
    question: "Is the volunteer program online or onsite?",
    answer:
      "The program may include both online and onsite opportunities depending on the project and role requirements.",
  },
  {
    id: 10,
    question: "Will I get a certificate after volunteering?",
    answer:
      "Yes, active volunteers may receive certificates or recognition based on their participation and performance.",
  },
  {
    id: 11,
    question: "Why should I join the Combine Foundation Volunteer Program?",
    answer:
      "Because it is more than just volunteering, it is a journey of learning, growth, networking, leadership, and career development while making a positive impact on society.",
  },
  {
    id: 12,
    question: "Are courses free for volunteers?",
    answer:
      "Yes. Combine Foundation volunteers get free access to the IT and professional courses available through the volunteer portal. If you apply for a course through our website, you can also get up to 95% scholarship on eligible courses.",
  },
];

export default function VolunteerFAQ() {
  const [openId, setOpenId] = useState<number | null>(0);

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8 py-16">
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 border-b-4 border-gray-300 pb-4">
        Frequently Asked Questions
      </h2>

      <div className="mt-10">
        {faqs.map((item) => (
          <div key={item.id} className="border-b border-gray-200 transition-colors duration-300 hover:bg-black/[0.02]">
            <button
              onClick={() => toggle(item.id)}
              aria-expanded={openId === item.id}
              className="w-full flex items-center justify-between gap-4 py-5 px-4 text-left cursor-pointer group"
            >
              <span className="text-gray-900 font-semibold text-base md:text-lg transition-colors duration-300 group-hover:text-secondary-500">
                {item.question}
              </span>
              <span
                className={`flex-shrink-0 text-2xl transition-colors duration-300 ${
                  openId === item.id ? "text-secondary-500" : "text-gray-400"
                }`}
              >
                {openId === item.id ? "−" : "+"}
              </span>
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out px-4 ${
                openId === item.id
                  ? "grid-rows-[1fr] opacity-100 pb-5"
                  : "grid-rows-[0fr] opacity-0 pb-0"
              }`}
            >
              <div className="overflow-hidden">
                {Array.isArray(item.answer) ? (
                  <>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">{item.answer[0]}</p>
                    <ul className="list-disc list-inside text-gray-600 text-sm md:text-base leading-relaxed mt-2 space-y-1">
                      {item.answer.slice(1).map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    {item.answer}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
