"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore/lite";
import { getDb } from "@/lib/firebase";

interface SplashData {
  image: string;
  linkUrl: string;
  alt: string;
}

export default function SplashBanner() {
  const [visible, setVisible] = useState(false);
  const [splash, setSplash] = useState<SplashData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const seen = (): boolean => {
    try { return !!localStorage.getItem("splash_seen"); } catch { return false; }
  };

  const markSeen = () => {
    try { localStorage.setItem("splash_seen", "true"); } catch {}
  };

  useEffect(() => {
    if (seen()) return;

    const fetchLatest = async () => {
      try {
        const snap = await getDocs(
          query(collection(getDb(), "splashBanners"), orderBy("createdAt", "desc"), limit(1))
        );
        if (!snap.empty) {
          const data = snap.docs[0].data() as SplashData;
          if (data.image) {
            setSplash(data);
            setVisible(true);
            return;
          }
        }
      } catch {
        "Failed to fetch splash banner data";
      }
      setSplash({
        image: "/home/project/project.png",
        linkUrl: "/events",
        alt: "Sample announcement",
      });
      setVisible(true);
    };
    fetchLatest();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    if (visible) {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [visible]);

  const close = () => {
    markSeen();
    setVisible(false);
    setDismissed(true);
  };

  if (!visible || !splash || dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Announcement"
    >
      <div
        className="relative w-[85vw] max-w-sm sm:max-w-md lg:max-w-lg rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {splash.linkUrl ? (
          <Link href={splash.linkUrl} className="block relative w-full max-h-[80vh]">
            <Image
              src={splash.image}
              alt={splash.alt}
              width={800}
              height={800}
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
              priority
            />
          </Link>
        ) : (
          <div className="relative w-full max-h-[80vh]">
            <Image
              src={splash.image}
              alt={splash.alt}
              width={800}
              height={800}
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
              priority
            />
          </div>
        )}

        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="
            absolute top-3 right-3 z-10
            w-10 h-10 rounded-full
            bg-black/50 hover:bg-black/70
            flex items-center justify-center
            transition-colors duration-200
            cursor-pointer
          "
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
