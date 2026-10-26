	"use client";

	import { useEffect } from "react";

	/**
	 * Full-screen success modal that completely replaces the page layout.
	 * Uses fixed positioning with high z-index and locks body scroll without
	 * breaking the html/body layout.
	 */
	export default function DonationSuccessModal({ onClose }: { onClose: () => void }) {
		// Lock body scroll when modal is mounted
		useEffect(() => {
			const prevOverflow = document.body.style.overflow;
			document.body.style.overflow = "hidden";
			return () => {
				document.body.style.overflow = prevOverflow;
			};
		}, []);

		// Escape key to close
		useEffect(() => {
			const onKey = (e: KeyboardEvent) => {
				if (e.key === "Escape") onClose();
			};
			window.addEventListener("keydown", onKey);
			return () => window.removeEventListener("keydown", onKey);
		}, [onClose]);

		return (
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="donation-success-title"
				className="donation-modal-root fixed inset-0 z-[99999] h-screen w-screen overflow-hidden bg-black/60 backdrop-blur-xl flex items-center justify-center"
			>
				<div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl overflow-hidden">
					<div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
						<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
							<polyline points="20 6 9 17 4 12" />
						</svg>
					</div>

					<h3 id="donation-success-title" className="mb-2 text-2xl font-extrabold text-secondary-500">
						Thank You!
					</h3>
					<p className="text-sm leading-relaxed text-primary-800">
						Your form has been submitted successfully. Our team will connect with you shortly.
					</p>

					<button
						type="button"
						onClick={onClose}
						className="mt-6 w-full cursor-pointer rounded-full py-3 text-white font-bold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0"
						style={{
							background: "linear-gradient(135deg, var(--secondary-600) 0%, var(--secondary-500) 33%, var(--secondary-500) 66%, var(--secondary-600) 100%)",
							boxShadow: "0 4px 14px rgba(13,59,122,0.35)",
						}}
					>
						Done
					</button>
				</div>
			</div>
		);
	}