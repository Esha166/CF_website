import PageHeroMobile from "@/components/UI/Pageheromobile"
import AnnualReports from "@/components/publications/annual"
import Mouslider from "@/components/publications/Mouseslider"
import TaxShariaCertificates from "@/components/publications/Taxshariacertificates "
import { fetchMOUs, fetchAnnualReports, type FirestoreAnnualReport,type FirestorePartner, fetchPartners } from "@/lib/admin-actions"
import PartnersSection from "@/components/our-team/partners-section"
import PageMotion from "@/components/UI/PageMotion"

export const metadata = {
    title: "Publications",
    description: "Explore Combine Foundation's annual reports, MOUs, tax and Sharia compliance certificates as a registered, tax exempted NPO in Pakistan.",
    keywords: [
        "Tax Exempted NPO",
        "Tax Exempted NGO Pakistan",
        "NPO in Pakistan",
        "NGO in Pakistan",
        "Nonprofit Annual Report Pakistan",
        "Registered NGO Pakistan",
    ],
};

export const dynamic = "force-dynamic";

const page = async () => {
    let mous: FirestorePartner[] = [];
    let reports: FirestoreAnnualReport[] = [];
    try {
        mous = await fetchPartners();
    } catch (e) {
        console.error("Failed to fetch MOUs:", e);
    }
    try {
        reports = await fetchAnnualReports();
    } catch (e) {
        console.error("Failed to fetch Annual Reports:", e);
    }

    return (
        <PageMotion>
            <PageHeroMobile
                imageSrc="/publications/hero.svg"
                title="Publications"
                mobileStyles="!text-5xl"
                styles="object-top"
            />
            
            {reports.length > 0 && <AnnualReports reports={reports} />}
            <PartnersSection partners={mous} />
            <TaxShariaCertificates />
        </PageMotion>
    )
}

export default page
