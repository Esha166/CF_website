import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import ClientChrome from "@/components/layout/ClientChrome";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Combine Foundation",
    template: "%s | Combine Foundation",
  },
  description:
    "Combine Foundation is a nonprofit organization focused on education, health awareness, youth empowerment, and community welfare in Pakistan.",
  keywords: [
    "Combine Foundation",
    "Non Profit Organization in Pakistan",
    "NPO in Pakistan",
    "NGO in Pakistan",
    "Tax Exempted NPO",
    "Tax Exempted NGO Pakistan",
    "Youth Leadership Program",
    "Youth Empowerment Pakistan",
    "Charity Organization in Pakistan",
    "Nonprofit Organization Pakistan",
    "Community Welfare Organization Pakistan",
    "Volunteer Program Pakistan",
    "Education Charity Pakistan",
    "Health Awareness NGO",
    "Social Welfare Organization Pakistan",
  ],
  openGraph: {
    title: "Combine Foundation",
    description:
      "Education, health awareness, youth empowerment, and community welfare.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Combine Foundation",
    description:
      "Education, health awareness, youth empowerment, and community welfare.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} h-full w-full antialiased overflow-x-hidden`}
    >
      <body
        className="min-h-full flex flex-col overflow-x-hidden"
        suppressHydrationWarning
      >
        <ClientChrome>{children}</ClientChrome>

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-40X0587BRT"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-40X0587BRT');
          `}
        </Script>

        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}