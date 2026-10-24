"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Phone,
  ChevronDown,
  Menu,
  X,
  Calendar,
  Briefcase,
  BookOpen,
  Users,
  Trophy,
  GraduationCap,
} from "lucide-react";

const Linkedin = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const Facebook = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/>
  </svg>
);

const Instagram = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

type DropdownId = "work" | "join";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownId | null>(null);

  const workRef = useRef<HTMLDivElement>(null);
  const joinRef = useRef<HTMLDivElement>(null);

  const ourWorkItems = [
    { label: "Events", href: "/events", icon: <Calendar className="w-4 h-4" /> },
    { label: "Projects", href: "/projects", icon: <Trophy className="w-4 h-4" /> },
    { label: "Courses", href: "/free-courses", icon: <BookOpen className="w-4 h-4" /> },
  ];

  const joinUsItems = [
    { label: "Career Opportunities", href: "/career", icon: <Briefcase className="w-4 h-4" /> },
    { label: "Volunteer for Combine", href: "/volunteer-program", icon: <Users className="w-4 h-4" /> },
    { label: "Youth Leadership Program", href: "https://ylp.combinefoundation.org/", icon: <GraduationCap className="w-4 h-4" /> },
  ];

  const toggleDropdown = (id: DropdownId) =>
    setOpenDropdown((prev) => (prev === id ? null : id));

  const closeMobile = () => setIsMobileMenuOpen(false);

  // Close dropdowns on outside click / Escape
  useEffect(() => {
    if (!openDropdown) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const ref = openDropdown === "work" ? workRef : joinRef;
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenDropdown(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [openDropdown]);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const linkProps = (href: string) =>
    href.startsWith("http")
      ? { target: "_blank", rel: "noopener noreferrer" }
      : {};

  const navLinkClass =
    "hover:text-secondary-500 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-secondary-500 hover:after:w-full after:transition-all";

  const mobileRowClass =
    "flex items-center justify-between rounded-xl px-4 py-3 text-base font-bold text-slate-900 transition hover:bg-secondary-50 hover:text-secondary-600";

  return (
    <header className="w-full sticky top-0 z-[100] bg-white">
      {/* Top Bar */}
      <div className="bg-secondary-500 text-white py-2 px-4 md:px-8 text-xs font-medium">
        <div className="max-w-[1500px] mx-auto flex justify-between items-center">
          {/* Social Icons */}
          <div className="flex items-center space-x-4">
            <Link
              href="https://www.instagram.com/combinefoundation"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-200 transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </Link>
            <Link
              href="https://www.linkedin.com/company/combine-foundation/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-200 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </Link>
            <Link
              href="https://www.facebook.com/combinefoundationoffical"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-200 transition-colors"
            >
              <Facebook className="w-4 h-4" />
            </Link>
          </div>

          {/* Contact Info */}
          <div className="flex items-center space-x-6">
            <a
              href="mailto:info@combinefoundation.org"
              className="flex items-center space-x-2 hover:text-blue-200 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline text-[10px] md:text-xs">info@combinefoundation.org</span>
            </a>
            <a
              href="tel:03208686644"
              className="flex items-center space-x-2 hover:text-blue-200 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline text-[10px] md:text-xs">03208686644</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm px-4 py-2 md:px-8 md:py-4 relative">
        <div className="max-w-[1500px] mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center group" onClick={closeMobile}>
            <div className="relative overflow-hidden">
              <Image
                src="/logo.png"
                alt="Combine Foundation Logo"
                width={120}
                height={34}
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-10 font-semibold text-sm text-gray-800">
            <Link href="/" className={navLinkClass}>
              Home
            </Link>
            <Link href="/about" className={navLinkClass}>
              About Us
            </Link>

            {/* Our Work Dropdown (click + hover) */}
            <div
              className="relative py-2"
              ref={workRef}
              onMouseEnter={() => setOpenDropdown("work")}
              onMouseLeave={() =>
                setOpenDropdown((prev) => (prev === "work" ? null : prev))
              }
            >
              <button
                type="button"
                onClick={() => toggleDropdown("work")}
                aria-haspopup="true"
                aria-expanded={openDropdown === "work"}
                className={`flex items-center cursor-pointer transition-colors hover:text-secondary-500 ${
                  openDropdown === "work" ? "text-secondary-500" : ""
                }`}
              >
                Our Work
                <ChevronDown
                  className={`w-4 h-4 ml-1.5 transition-transform ${
                    openDropdown === "work"
                      ? "rotate-180 text-secondary-500"
                      : "text-gray-400"
                  }`}
                />
              </button>

              <div
                className={`absolute top-full left-0 mt-0 w-56 transition-all duration-300 transform z-[100] ${
                  openDropdown === "work"
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible translate-y-2"
                }`}
              >
                <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden mt-2">
                  <div className="py-2">
                    {ourWorkItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setOpenDropdown(null)}
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-secondary-50 hover:text-secondary-500 transition-colors group/item"
                      >
                        <span className="p-2 rounded-lg bg-gray-50 group-hover/item:bg-white group-hover/item:shadow-sm mr-3 transition-all">
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Link href="/our-team" className={navLinkClass}>
              Our Team
            </Link>
            <Link href="/publications" className={navLinkClass}>
              Publications
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Join Us Dropdown (click + hover) */}
            <div
              className="relative"
              ref={joinRef}
              onMouseEnter={() => setOpenDropdown("join")}
              onMouseLeave={() =>
                setOpenDropdown((prev) => (prev === "join" ? null : prev))
              }
            >
              <button
                type="button"
                onClick={() => toggleDropdown("join")}
                aria-haspopup="true"
                aria-expanded={openDropdown === "join"}
                className="flex items-center cursor-pointer bg-linear-to-r from-secondary-500 to-secondary-700 text-white px-7 py-3 rounded-full hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Join Us
                <ChevronDown
                  className={`w-4 h-4 ml-2 opacity-80 transition-transform ${
                    openDropdown === "join" ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`absolute top-full right-0 mt-0 w-64 transition-all duration-300 transform z-[100] ${
                  openDropdown === "join"
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible translate-y-2"
                }`}
              >
                <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden mt-2">
                  {joinUsItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      {...linkProps(item.href)}
                      onClick={() => setOpenDropdown(null)}
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-secondary-50 hover:text-secondary-500 transition-colors group/item"
                    >
                      <div className="w-8 h-8 rounded-full bg-secondary-50 flex items-center justify-center mr-3 group-hover/item:bg-secondary-500 group-hover/item:text-white transition-all">
                        {item.icon}
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/donations"
              className="border-2 border-secondary-500 text-secondary-500 px-8 py-2.5 rounded-full font-bold hover:bg-secondary-700 hover:text-white transition-all duration-300 shadow-sm"
            >
              Donate
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden p-2 text-secondary-500 hover:bg-secondary-50 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full inset-x-0 z-[90] lg:hidden animate-in fade-in duration-300">
          {/* Backdrop */}
          <div
            className="absolute inset-x-0 top-0 h-screen bg-slate-950/35 backdrop-blur-[2px]"
            onClick={closeMobile}
          />

          {/* Panel */}
          <div className="relative max-h-[calc(100dvh-110px)] overflow-y-auto overscroll-contain rounded-b-[2rem] border-t border-white/60 bg-gradient-to-b from-white to-orange-50 shadow-[0_20px_60px_rgba(15,23,42,0.18)] animate-in slide-in-from-top-2 duration-300">
            <div className="px-4 py-4 sm:px-6 space-y-3">
              <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-3 shadow-lg shadow-slate-900/5 backdrop-blur-sm">
                {/* Main links */}
                <div className="space-y-1">
                  <Link href="/" className={mobileRowClass} onClick={closeMobile}>
                    <span>Home</span>
                    <span className="text-secondary-500">↗</span>
                  </Link>
                  <Link href="/about" className={mobileRowClass} onClick={closeMobile}>
                    <span>About Us</span>
                    <span className="text-secondary-500">↗</span>
                  </Link>
                </div>

                {/* Our Work */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="px-4 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Our Work
                  </p>
                  <div className="space-y-1">
                    {ourWorkItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={mobileRowClass}
                        onClick={closeMobile}
                      >
                        <span>{item.label}</span>
                        <span className="text-secondary-500">{item.icon}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Join Us */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="px-4 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Join Us
                  </p>
                  <div className="space-y-1">
                    {joinUsItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        {...linkProps(item.href)}
                        className={mobileRowClass}
                        onClick={closeMobile}
                      >
                        <span>{item.label}</span>
                        <span className="text-secondary-500">{item.icon}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Team / Publications */}
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
                  <Link
                    href="/our-team"
                    className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-center text-sm font-bold text-slate-800 transition hover:border-secondary-100 hover:bg-secondary-50 hover:text-secondary-600"
                    onClick={closeMobile}
                  >
                    Our Team
                  </Link>
                  <Link
                    href="/publications"
                    className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-center text-sm font-bold text-slate-800 transition hover:border-secondary-100 hover:bg-secondary-50 hover:text-secondary-600"
                    onClick={closeMobile}
                  >
                    Publications
                  </Link>
                </div>
              </div>

              {/* Donate card */}
              <div className="rounded-[1.5rem] bg-secondary-500 p-4 shadow-xl shadow-secondary-500/20">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-white">
                    <p className="text-sm font-semibold opacity-90">Support our work</p>
                    <p className="mt-1 text-xs opacity-80">Your contribution creates real impact.</p>
                  </div>
                  <Link
                    href="/donations"
                    className="shrink-0 rounded-full bg-white px-5 py-3 text-sm font-extrabold text-secondary-600 transition hover:bg-orange-50"
                    onClick={closeMobile}
                  >
                    Donate Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}