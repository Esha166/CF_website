import Contact from "@/components/contact/contact";
import Locations from "@/components/contact/locations";
import PageMotion from "@/components/UI/PageMotion";

export const metadata = {
    title: "Contact Us",
    description: "Get in touch with Combine Foundation for donations, volunteering, programs, partnerships, and general enquiries.",
    keywords: [
        "Contact NGO in Pakistan",
        "Contact Nonprofit Organization Pakistan",
        "Combine Foundation Contact",
        "NPO in Pakistan",
    ],
};

export default function ContactPage() {
    return (
        <PageMotion>
            <Contact />
            <Locations />
        </PageMotion>

    )
}
