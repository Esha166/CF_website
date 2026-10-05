"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";
import type { Event } from "./UpcomingEvents";

interface EventsAcheivementListProps {
    events?: Event[];
    activeId?: string | null;
    onToggle?: (id: string) => void;
}

function parseEventDate(dateStr: string): Date | null {
    if (!dateStr || dateStr.toLowerCase().includes("to be announced")) return null;

    const cleaned = dateStr.trim();
    const dateOnly = cleaned.split(" / ")[0]?.trim() || cleaned;
    const normalized = dateOnly.replace(/(\d+)(st|nd|rd|th)/g, "$1");

    const parsed = new Date(normalized);
    if (!isNaN(parsed.getTime())) return parsed;

    const fallback = new Date(normalized.replace(/\s+/g, " "));
    return isNaN(fallback.getTime()) ? null : fallback;
}

function EventItem({
    event,
    open,
    onToggle,
}: {
    event: Event;
    open: boolean;
    onToggle: () => void;
}) {
    const bulletPoints = event.bulletPoints?.filter((point) => point && point.trim() !== "") ?? [];
    const images = event.images?.filter((src) => src && src.trim() !== "") ?? [];

    const handleViewPictures = () => {
        onToggle();
        setTimeout(() => {
            document.getElementById(`event-card-${event.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
    };

    return (
        <div
            id={`event-card-${event.id}`}
            className={`rounded-2xl overflow-hidden border transition-all duration-500 ease-in-out ${
                open
                    ? "bg-secondary-500 border-gray-600"
                    : "bg-white border-gray-200 hover:border-gray-300"
            }`}
        >
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer"
            >
                <div className="flex-1">
                    <span className={`font-semibold text-sm md:text-base transition-colors duration-300 ${open ? "text-white" : "text-gray-900"}`}>
                        {event.title}
                    </span>
                </div>

                <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-500 ${
                        open ? "bg-white/15 rotate-180" : "bg-gray-100 rotate-0"
                    }`}
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={open ? "white" : "#374151"}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
            </button>

            <div className={`overflow-hidden transition-all duration-700 ease-in-out ${open ? "max-h-[5000px]" : "max-h-0"}`}>
                <div className={`px-6 pb-8 space-y-5 transition-all duration-500 ${open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}>
                    {event.description && event.description.trim() !== "" && (
                        <p className="text-sm leading-7 text-white/85">{event.description}</p>
                    )}

                    {open && images.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                            {images.map((src, index) => (
                                <div key={`${event.id}-${index}`} className="relative h-[220px] w-[260px] shrink-0 overflow-hidden rounded-2xl border border-white/10">
                                    <Image
                                        src={src}
                                        alt={`${event.title} image ${index + 1}`}
                                        fill
                                        sizes="260px"
                                        loading="lazy"
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {bulletPoints.length > 0 && (
                        <div>
                            <h4 className="mb-2 text-sm font-semibold text-white">Highlights</h4>
                            <ul className="space-y-2">
                                {bulletPoints.map((point, index) => (
                                    <li key={`${event.id}-${index}`} className="flex items-start gap-2 text-sm leading-6 text-white/85">
                                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-white/70 flex-shrink-0" />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid gap-3 md:grid-cols-3">
                        {event.date && (
                            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                                <p className="text-xs uppercase tracking-wide text-white/70">Date</p>
                                <p className="mt-1 text-sm font-semibold text-white">{event.date}</p>
                            </div>
                        )}

                        {(event.startTime || event.endTime) && (
                            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                                <p className="text-xs uppercase tracking-wide text-white/70">Time</p>
                                <p className="mt-1 text-sm font-semibold text-white">
                                    {event.startTime}{event.startTime && event.endTime ? " - " : ""}{event.endTime}
                                </p>
                            </div>
                        )}

                        {event.location && (
                            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                                <p className="text-xs uppercase tracking-wide text-white/70">Location</p>
                                <p className="mt-1 text-sm font-semibold text-white">{event.location}</p>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleViewPictures}
                        className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-secondary-600 transition hover:bg-gray-100"
                    >
                        {images.length > 0 ? (open ? "Hide Pictures" : "View Pictures") : (open ? "Hide Details" : "View Details")}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function EventsAcheivementList({
    events: incomingEvents,
    activeId,
    onToggle,
}: EventsAcheivementListProps) {
    const [events, setEvents] = useState<Event[]>(incomingEvents ?? []);
    const [loading, setLoading] = useState(!incomingEvents || incomingEvents.length === 0);

    useEffect(() => {
        if (incomingEvents && incomingEvents.length > 0) {
            setEvents(incomingEvents);
            setLoading(false);
            return;
        }

        let isMounted = true;

        async function fetchEvents() {
            try {
                if (!db) return;
                const snapshot = await getDocs(collection(db, "events"));
                const data = snapshot.docs.map((doc) => {
                    const item = doc.data();

                    let date = "";
                    let startTime = "";
                    let endTime = "";

                    if (item.dateTime) {
                        const parsedDateTime = new Date(item.dateTime);
                        if (!isNaN(parsedDateTime.getTime())) {
                            date = parsedDateTime.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
                            startTime = parsedDateTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                        } else if (typeof item.dateTime === "string" && item.dateTime.includes(" / ")) {
                            const [datePart, timePart] = item.dateTime.split(" / ");
                            date = datePart;
                            startTime = timePart;
                        } else {
                            date = item.dateTime;
                        }
                        endTime = item.endTime || "";
                    } else if (item.date) {
                        date = item.date;
                        startTime = item.startTime || "";
                        endTime = item.endTime || "";
                    }

                    return {
                        id: doc.id,
                        title: item.title || item.name || item.eventName || "Untitled Event",
                        description: item.description || "",
                        bulletPoints: Array.isArray(item.bulletPoints) ? item.bulletPoints : [],
                        images: Array.isArray(item.images) ? item.images : [],
                        date,
                        startTime,
                        endTime,
                        location: item.location || "",
                        registerLink: item.registerLink || item.registrationLink || null,
                    } as Event;
                });

                if (!isMounted) return;

                const previousEvents = data
                    .filter((event) => {
                        const parsedDate = parseEventDate(event.date);
                        if (!parsedDate) return false;
                        return parsedDate.getTime() < Date.now();
                    })
                    .sort((a, b) => {
                        const dateA = parseEventDate(a.date);
                        const dateB = parseEventDate(b.date);
                        if (!dateA || !dateB) return 0;
                        return dateB.getTime() - dateA.getTime();
                    });

                setEvents(previousEvents);
            } catch (error) {
                console.error("Error fetching previous events:", error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchEvents();

        return () => {
            isMounted = false;
        };
    }, [incomingEvents]);

    const sortedEvents = useMemo(() => {
        return [...events].sort((a, b) => {
            const dateA = parseEventDate(a.date);
            const dateB = parseEventDate(b.date);
            if (!dateA || !dateB) return 0;
            return dateB.getTime() - dateA.getTime();
        });
    }, [events]);

    return (
        <section className="max-w-[1500px] px-4 md:px-6 lg:px-8 py-10 space-y-4">
            <div className="mb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-secondary-500">Previous Events</h2>
                <p className="mt-2 text-sm md:text-base text-gray-600">Browse our recent community gatherings and highlights.</p>
            </div>

            {loading ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-8 text-center text-sm text-gray-600">
                    Loading previous events...
                </div>
            ) : sortedEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-8 text-center text-sm text-gray-600">
                    No previous events available yet.
                </div>
            ) : (
                sortedEvents.map((event) => (
                    <EventItem
                        key={event.id}
                        event={event}
                        open={activeId === event.id}
                        onToggle={() => onToggle?.(event.id)}
                    />
                ))
            )}
        </section>
    );
}
