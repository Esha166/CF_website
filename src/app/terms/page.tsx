import Link from "next/link";
import PageMotion from "@/components/UI/PageMotion";

export const metadata = {
  title: "Terms of Service",
  description: "Review the terms that apply when using the Combine Foundation website.",
};

const sections = [
  {
    title: "About These Terms",
    paragraphs: [
      "These Terms of Service govern your access to and use of the Combine Foundation website. By using this website, you agree to follow these terms. If you do not agree, please do not use the website.",
      "Combine Foundation is a registered non-profit organization working in education, health awareness, youth empowerment, and community welfare. References to \"we\", \"us\", and \"our\" mean Combine Foundation.",
    ],
  },
  {
    title: "Acceptable Use",
    paragraphs: [
      "You may use the website only for lawful purposes and in a way that does not harm the website, our organization, or other users. You must not attempt to gain unauthorized access, interfere with website security, introduce malicious code, scrape content in a harmful manner, or submit information that is false, unlawful, abusive, or infringing.",
    ],
  },
  {
    title: "Programs, Courses, and Events",
    paragraphs: [
      "Program, course, volunteer, and event information is provided for general guidance and may change without notice. Registration does not guarantee acceptance, attendance, funding, employment, or a particular outcome. We may cancel, reschedule, limit, or modify an initiative when circumstances require it.",
      "You are responsible for providing accurate information and following any specific rules or instructions communicated for a program or event.",
    ],
  },
  {
    title: "Donations",
    paragraphs: [
      "Donations are voluntary contributions intended to support Combine Foundation's charitable work. Donation processing may be handled by a third-party payment provider and may be subject to that provider's terms. Please review your donation details carefully before submitting a payment.",
    ],
  },
  {
    title: "Intellectual Property",
    paragraphs: [
      "Unless otherwise stated, website text, branding, graphics, photographs, videos, and other materials belong to Combine Foundation or are used with permission. You may view and share links to our public content for personal, non-commercial purposes, provided that you do not remove attribution or misrepresent the source. Any other use requires prior written permission.",
    ],
  },
  {
    title: "Third-Party Services and Links",
    paragraphs: [
      "The website may contain links to third-party websites, platforms, maps, payment providers, or social media services. These services are operated independently and are governed by their own terms and policies. We are not responsible for their content, availability, security, or practices.",
    ],
  },
  {
    title: "Disclaimers",
    paragraphs: [
      "The website and its content are provided on an \"as available\" basis. We aim to keep information accurate and current, but we do not guarantee that the website will always be complete, uninterrupted, error-free, or free from harmful components. Website content does not constitute professional, financial, medical, legal, or employment advice.",
    ],
  },
  {
    title: "Limitation of Liability",
    paragraphs: [
      "To the fullest extent permitted by applicable law, Combine Foundation will not be liable for indirect, incidental, special, consequential, or punitive losses arising from your use of, or inability to use, the website or third-party services. Nothing in these terms limits any liability that cannot lawfully be limited.",
    ],
  },
  {
    title: "Changes and Governing Terms",
    paragraphs: [
      "We may update these terms when our website, programs, or legal obligations change. Updates take effect when posted on this page. Your continued use of the website after an update means that you accept the revised terms. These terms are interpreted under the applicable laws of Pakistan, subject to any mandatory legal rights available to you.",
    ],
  },
];

export default function TermsPage() {
  return (
    <PageMotion>
    <div className="bg-gray-50 text-gray-800">
      <section className="bg-secondary-600 px-4 py-20 text-white md:px-8 md:py-28">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-orange">Legal</p>
          <h1 className="text-4xl font-bold md:text-6xl">Terms of Service</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 md:text-lg">
            The rules and responsibilities that apply when you use the Combine Foundation website.
          </p>
          <p className="mt-8 text-sm text-white/60">Effective date: August 22, 2026</p>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title} className="border-t border-gray-200 pt-8 first:border-t-0 first:pt-0">
              <h2 className="text-xl font-bold text-secondary-600 md:text-2xl">{section.title}</h2>
              <div className="mt-4 space-y-4 text-gray-600">
                {section.paragraphs.map((paragraph) => <p key={paragraph} className="leading-8">{paragraph}</p>)}
              </div>
            </section>
          ))}

          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-bold text-secondary-600 md:text-2xl">Contact Us</h2>
            <p className="mt-4 leading-8 text-gray-600">
              Questions about these terms can be sent through our <Link href="/contact" className="font-semibold text-secondary-600 underline underline-offset-4">Contact Us</Link> page.
            </p>
          </section>
        </div>
      </main>
    </div>
    </PageMotion>
  );
}
