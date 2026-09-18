"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ClientChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin") || pathname?.startsWith("/login");

  return (
    <>
      {!isAdminPage && <Header />}
      <main className="site-main grow flex flex-col overflow-x-clip">{children}</main>
      {!isAdminPage && <Footer />}
    </>
  );
}
