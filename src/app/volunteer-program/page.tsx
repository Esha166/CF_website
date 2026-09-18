import Hero from "@/components/UI/hero"
import HowItWorks from "@/components/volunteer/Howitworks"
import WhyJoinUs from "@/components/volunteer/Whyjoinus"
import CtaSection from "@/components/UI/CtaSection";
import HearFromVolunteers from "@/components/volunteer/ourVolunteer";
import VolunteerFAQ from "@/components/volunteer/VolunteerFAQ";
import PageMotion from "@/components/UI/PageMotion";

export const metadata = {
    title: "Volunteer Program",
    description: "Join Combine Foundation's Youth Leadership Program and volunteer opportunities in Pakistan to grow your career while serving the community.",
    keywords: [
        "Youth Leadership Program",
        "Volunteer Program Pakistan",
        "NGO Volunteer Program Pakistan",
        "Volunteer Opportunities Pakistan",
        "NGO in Pakistan",
        "Nonprofit Organization Pakistan",
    ],
};

export default function VolunteerPage() {
    return (
        <PageMotion>
            <Hero text1="VOLUNTEER" text2="PROGRAM"
                image1="/volunteer-program/hero g (2).svg"
                image2="/volunteer-program/hero g.svg"
                text1Size="small"
                text2Size="small"
                mobileTitle="Volunteer"
            />
            <HowItWorks />
            <WhyJoinUs />
            <CtaSection text="More Than Volunteering — A Career Journey" buttonText="Join Today" url="https://www.combinefoundationportal.com/volunteer/apply" />
            <HearFromVolunteers />
            <VolunteerFAQ />
        </PageMotion>
    );
}
