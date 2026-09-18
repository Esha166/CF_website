
import DonationForm from "@/components/donation/DonationForm"
import DonationUsage from "@/components/donation/DonationUsage"
import SuccessfulVentures from "@/components/donation/successfulventures"
import CtaSection from "@/components/UI/CtaSection"
import PageMotion from "@/components/UI/PageMotion"

export const metadata = {
    title: "Donate",
    description: "Support Combine Foundation's education, youth, health, and community welfare programs.",
    keywords: [
        "Donate to NGO in Pakistan",
        "Tax Exempted NPO",
        "Tax Deductible Donation Pakistan",
        "Charity Donation Pakistan",
        "Nonprofit Organization Pakistan",
        "Donate to Charity in Pakistan",
    ],
};

function page() {
    return (
        <PageMotion>
            <DonationForm />
            <DonationUsage />
            <SuccessfulVentures />
            <CtaSection text="Your Support Can Save Dreams" buttonText="Support Now" url="#form" />
        </PageMotion>
    )
}

export default page
