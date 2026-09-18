import Hero from "@/components/UI/hero"
import FounderProfile from "@/components/our-team/founder-profile"
import CeoProfile from "@/components/our-team/ceo-profile"
import BoardOfTrustees from "@/components/our-team/board-of-trustees"
import BoardOfMembers from "@/components/our-team/board-of-members"
import LeadershipSections from "@/components/our-team/leadership-sections"
import PartnersSection from "@/components/our-team/partners-section"
import { fetchTeamMembers, fetchPartners, fetchMOUs, type FirestoreTeamMember, type FirestorePartner, type FirestoreMOU } from "@/lib/admin-actions"
import PageMotion from "@/components/UI/PageMotion"

export const dynamic = "force-dynamic";

const Page = async () => {
  let teamMembers: FirestoreTeamMember[] = [];
  let partners: FirestorePartner[] = [];
  let mous: FirestoreMOU[] = [];
  try {
    teamMembers = await fetchTeamMembers();
  } catch (e) {
    console.error("Failed to fetch team members:", e);
  }
  try {
    partners = await fetchPartners();
  } catch (e) {
    console.error("Failed to fetch partners:", e);
  }
  try {
    mous = await fetchMOUs();
  } catch (e) {
    console.error("Failed to fetch MOUs:", e);
  }

  const mouPartners = mous.map((m) => ({
    id: m.id || "",
    name: m.title,
    description: m.paragraphs.join(" "),
    image: m.image,
    pdf: m.pdf || "",
  }));

  const displayPartners = mouPartners.length > 0 ? mouPartners : partners;

  return (
    <PageMotion>
      <Hero text1="OUR" text2="TEAM" image1="/home/projects/4.svg" image2="/home/impact cards/8.svg" text1Size="big" text2Size="big" mobileTitle="OUR TEAM"/>
      <FounderProfile />
      <CeoProfile />
      <BoardOfTrustees members={teamMembers} />
      <BoardOfMembers members={teamMembers} />
      <LeadershipSections members={teamMembers} />
      <PartnersSection partners={displayPartners as FirestorePartner[]} />
    </PageMotion>
  )
}

export default Page
