import Link from "next/link";
import PageMotion from "@/components/UI/PageMotion";

export const metadata = {
  title: "Privacy Policy",
  description: "Read how Combine Foundation collects, uses, and protects your information.",
};

const sections = [
  {
    title: "Information We Collect",
    paragraphs: [
      "We may collect information you choose to provide when you contact us, register for an event, apply for a volunteer or career opportunity, enroll in a course, make a donation, or submit content through the website. This may include your name, email address, phone number, organization, and information included in your message.",
      "We may also collect limited technical information, such as your browser type, device information, approximate location, and pages visited. This helps us keep the website secure and improve its performance.",
    ],
  },
  {
    title: "How We Use Information",
    paragraphs: [
      "Combine Foundation uses information to respond to enquiries, process donations, administer programs and events, communicate important updates, evaluate applications, provide requested services, and improve our website and initiatives.",
      "We do not sell, rent, or trade your personal information. We share information only when necessary to provide a requested service, comply with the law, protect our rights, or support the safe operation of the website.",
    ],
  },
  {
    title: "Donations and Payments",
    paragraphs: [
      "Payment details are handled by the relevant payment provider. Combine Foundation does not intentionally store complete card numbers or payment authentication details on this website. Payment providers may process information under their own privacy policies and terms.",
    ],
  },
  {
    title: "Cookies and Analytics",
    paragraphs: [
      "The website may use essential cookies or similar technologies to maintain functionality, security, and preferences. We may also use analytics tools to understand general website usage and improve the experience. You can control cookies through your browser settings, although disabling some cookies may affect functionality.",
    ],
  },
  {
    title: "Data Retention and Security",
    paragraphs: [
      "We retain personal information only for as long as reasonably necessary for the purpose for which it was collected, to maintain records, or to meet legal and operational requirements. We use reasonable administrative and technical safeguards, but no internet transmission or storage system can be guaranteed to be completely secure.",
    ],
  },
  {
    title: "Your Choices",
    paragraphs: [
      "You may ask us to confirm, correct, update, or delete personal information we hold about you, subject to applicable legal and operational requirements. You may also opt out of non-essential communications by using the unsubscribe option in the message or contacting us directly.",
    ],
  },
  {
    title: "Children's Privacy",
    paragraphs: [
      "Our website is intended for a general audience. We do not knowingly request personal information from children without appropriate consent. If you believe a child has provided personal information to us, please contact us so we can review and remove it where appropriate.",
    ],
  },
  {
    title: "Changes to This Policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time to reflect changes in our services, technology, or legal obligations. The updated version will be posted on this page with a revised effective date.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <PageMotion>
    <div className="bg-gray-50 text-gray-800">
      <section className="bg-secondary-600 px-4 py-20 text-white md:px-8 md:py-28">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-orange">Legal</p>
          <h1 className="text-4xl font-bold md:text-6xl">Privacy Policy</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 md:text-lg">
            How Combine Foundation collects, uses, and protects information when you use our website and services.
          </p>
          <p className="mt-8 text-sm text-white/60">Effective date: August 22, 2026</p>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-secondary-600">Our Commitment</h2>
            <p className="mt-4 leading-8 text-gray-600">
              Combine Foundation respects your privacy and is committed to handling personal information responsibly. This policy explains our general practices for information collected through this website. By using the website, you acknowledge these practices.
            </p>
          </section>

          {sections.map((section) => (
            <section key={section.title} className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-bold text-secondary-600 md:text-2xl">{section.title}</h2>
              <div className="mt-4 space-y-4 text-gray-600">
                {section.paragraphs.map((paragraph) => <p key={paragraph} className="leading-8">{paragraph}</p>)}
              </div>
            </section>
          ))}

          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-bold text-secondary-600 md:text-2xl">Contact Us</h2>
            <p className="mt-4 leading-8 text-gray-600">
              For privacy questions or requests, please contact us through our <Link href="/contact" className="font-semibold text-secondary-600 underline underline-offset-4">Contact Us</Link> page.
            </p>
          </section>
        </div>
      </main>
    </div>
    </PageMotion>
  );
}
