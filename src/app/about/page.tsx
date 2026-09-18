import AboutHero from "@/components/UI/hero"
import OurStory from "@/components/about/OurStory"
import MissionVision from "@/components/about/Missionvision"
import Objective from "@/components/about/Objective"
import AboutFounder from "@/components/about/AboutFounder"
import Combineachievements from "@/components/about/Combineachievements"
import Ourvalues from "@/components/about/Ourvalues"
import Goals from "@/components/about/Goals"
import PageMotion from "@/components/UI/PageMotion"

export const metadata = {
    title: "About Us",
    description: "Learn about Combine Foundation's mission, story, leadership, values, and community impact.",
    keywords: [
        "Non Profit Organization in Pakistan",
        "NPO in Pakistan",
        "NGO in Pakistan",
        "Registered NGO Pakistan",
        "Nonprofit Organization Mission Pakistan",
        "Combine Foundation About Us",
        "Community Welfare Organization",
    ],
};

const AboutPage = () => {
    return (
        <PageMotion>
            <AboutHero
                text1="ABOUT"
                text2="COMBINE"
                image1="/about/hero/1.svg"
                image2="/about/hero/2.svg"
                text1Size="big"
                text2Size="big"
                mobileTitle="About"
            />
            <OurStory />
            <MissionVision />
            <Objective />
            <AboutFounder />
            <Combineachievements />
            <Ourvalues />
            <Goals />
        </PageMotion>
    )
}

export default AboutPage
