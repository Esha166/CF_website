"use client";

import { useState } from "react";
import DonationForm from "@/components/donation/DonationForm";
import DonationSuccessModal from "@/components/donation/DonationSuccessModal";
import DonationUsage from "@/components/donation/DonationUsage";
import TaxReceipts from "@/components/donation/TaxReceipts";
import SuccessfulVentures from "@/components/donation/successfulventures";
import CtaSection from "@/components/UI/CtaSection";
import PageMotion from "@/components/UI/PageMotion";

/**
 * Client wrapper that handles the conditional modal view.
 * The parent page.tsx stays a Server Component so it can export metadata.
 */
export default function DonationPageClient() {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<>
			{isModalOpen ? (
				/* Full-screen modal replaces the entire page layout —
				   rendered outside PageMotion so it isn't hidden by opacity animation */
				<DonationSuccessModal onClose={() => setIsModalOpen(false)} />
			) : (
				/* Normal page layout with Header, Footer, and all sections */
				<PageMotion>
					<DonationForm onSubmitted={() => setIsModalOpen(true)} />
					<TaxReceipts />
					<DonationUsage />
					<SuccessfulVentures />
					<CtaSection text="Your Support Can Save Dreams" buttonText="Support Now" url="#form" />
				</PageMotion>
			)}
		</>
	);
}