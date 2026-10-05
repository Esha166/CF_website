"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export type Event = {
    id: string;
    title: string;
    description?: string;
    bulletPoints: string[];
    images?: string[];
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    registerLink?: string | null;
};

function parseEventDate(dateStr: string): Date | null {
    if (!dateStr || dateStr.toLowerCase().includes("to be announced")) return null;
    const cleaned = dateStr.replace(/(\d+)(st|nd|rd|th)/g, "$1");
    const d = new Date(cleaned);
    return isNaN(d.getTime()) ? null : d;
}

function buildMonthGrid(year: number, month: number): number[][] {
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: number[] = [
        ...Array(firstWeekday).fill(0),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    const rows: number[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
        rows.push(cells.slice(i, i + 7));
    }
    return rows;
}

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];


function CalendarIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

function PinIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    );
}

function ListIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
    );
}

function buildCalendarUrl(event: Event): string {
    const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.bulletPoints.join("\n"));
    const location = encodeURIComponent(event.location);
    return `${base}&text=${title}&details=${details}&location=${location}`;
}

function EventCard({ event }: { event: Event }) {
    const eventDate = parseEventDate(event.date);
    const isPast = eventDate ? eventDate < new Date() : false;
    const showPost = isPast && event.images && event.images.length > 0;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-6">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                <div className="flex-1">
                    <h3 className="text-gray-900 font-bold text-lg mb-3">{event.title}</h3>
                    <ul className="space-y-1 mb-5">
                        {event.bulletPoints.map((point, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-600 text-sm leading-6">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />
                                {point}
                            </li>
                        ))}
                    </ul>
                    <div className="flex flex-wrap gap-3">
                        {showPost ? (
                            <a
                                href={event.images![0]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-2 rounded-full text-white text-sm font-semibold transition-colors duration-200"
                                style={{ background: "linear-gradient(97.67deg, var(--secondary-600) 12.02%, var(--secondary-500) 65.87%)" }}
                            >
                                View Post
                            </a>
                        ) : (
                            <>
                                <Link
                                    href={event.registerLink || "#"}
                                    className="px-5 py-2 rounded-full text-white text-sm font-semibold transition-colors duration-200"
                                    style={{ background: "linear-gradient(97.67deg, var(--secondary-600) 12.02%, var(--secondary-500) 65.87%)" }}
                                >
                                    Register Now
                                </Link>
                                <a
                                    href={buildCalendarUrl(event)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-5 py-2 rounded-full text-gray-700 text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Add to Calendar
                                </a>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4 md:min-w-[200px]">
                    <div className="flex items-start gap-3 text-gray-700 text-sm font-medium">
                        <span className="text-gray-500 mt-0.5 flex-shrink-0"><CalendarIcon /></span>
                        {event.date}
                    </div>
                    <div className="flex items-start gap-3 text-gray-700 text-sm font-medium">
                        <span className="text-gray-500 mt-0.5 flex-shrink-0"><ClockIcon /></span>
                        {event.startTime} - {event.endTime}
                    </div>
                    <div className="flex items-start gap-3 text-gray-700 text-sm font-semibold">
                        <span className="text-gray-500 mt-0.5 shrink-0"><PinIcon /></span>
                        {event.location}
                    </div>
                </div>
            </div>
        </div>
    );
}

function EventPopover({ event, onClose }: { event: Event; onClose: () => void }) {
    const eventDate = parseEventDate(event.date);
    const isPast = eventDate ? eventDate < new Date() : false;
    const showPost = isPast && event.bulletPoints.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-secondary-500 font-bold text-lg leading-tight">{event.title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-3 text-xl leading-none">&times;</button>
                </div>

                <ul className="space-y-1 mb-4">
                    {event.bulletPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-600 text-sm leading-6">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                            {point}
                        </li>
                    ))}
                </ul>

                <div className="flex flex-col gap-2 mb-5 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                        <CalendarIcon size={15} />
                        <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ClockIcon />
                        <span>{event.startTime} – {event.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <PinIcon />
                        <span>{event.location}</span>
                    </div>
                </div>

                {event.registerLink && event.registerLink.trim() !== "" && (
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href={event.registerLink}
                            className="px-5 py-2 rounded-full text-white text-sm font-semibold"
                                                            style={{ background: "linear-gradient(97.67deg, var(--secondary-600) 12.02%, var(--secondary-500) 65.87%)" }}
                        >
                            Register Now
                        </Link>
                        <a
                            href={buildCalendarUrl(event)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2 rounded-full text-gray-700 text-sm font-semibold border border-gray-300 hover:bg-gray-50"
                        >
                            Add to Calendar
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Calendar View ────────────────────────────────────────────────────────────

function CalendarView({ events }: { events: Event[] }) {
    function getInitialMonth() {
        const validEvents = events.filter(e => parseEventDate(e.date) !== null);
        if (validEvents.length === 0) {
            const today = new Date();
            return { year: today.getFullYear(), month: today.getMonth() };
        }
        const sorted = [...validEvents].sort(
            (a, b) => (parseEventDate(a.date) as Date).getTime() - (parseEventDate(b.date) as Date).getTime()
        );
        const first = parseEventDate(sorted[0].date) as Date;
        return { year: first.getFullYear(), month: first.getMonth() };
    }

    function eventsOnDay(year: number, month: number, day: number): Event[] {
        return events.filter((e) => {
            const d = parseEventDate(e.date);
            if (!d) return false;
            return (
                d.getFullYear() === year &&
                d.getMonth() === month &&
                d.getDate() === day
            );
        });
    }

    const initial = getInitialMonth();
    const [year, setYear] = useState(initial.year);
    const [month, setMonth] = useState(initial.month);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const grid = buildMonthGrid(year, month);

    const prevMonth = () => {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };

    const nextMonth = () => {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };

    const today = new Date();
    const isToday = (day: number) =>
        today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

    return (
        <>
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <button
                        onClick={prevMonth}
                        type="button"
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"
                        aria-label="Previous month"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>

                    <span className="font-bold text-gray-900 text-base">
                        {MONTH_NAMES[month]} {year}
                    </span>

                    <button
                        onClick={nextMonth}
                        type="button"
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"
                        aria-label="Next month"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>

                {/* Weekday labels */}
                <div className="grid grid-cols-7 border-b border-gray-100">
                    {WEEK_DAYS.map((d) => (
                        <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400 tracking-wide">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Day grid */}
                <div className="divide-y divide-gray-50">
                    {grid.map((row, ri) => (
                        <div key={ri} className="grid grid-cols-7 divide-x divide-gray-50">
                            {row.map((day, ci) => {
                                const dayEvents = day > 0 ? eventsOnDay(year, month, day) : [];
                                const hasEvent = dayEvents.length > 0;

                                return (
                                    <div
                                        key={ci}
                                        className={`min-h-[80px] p-1.5 flex flex-col ${day === 0 ? "bg-gray-50/50" : ""}`}
                                    >
                                        {day > 0 && (
                                            <>
                                                {/* Day number */}
                                                <span
                                                    className={`
                                                        self-start w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1 cursor-pointer
                                                        ${isToday(day)
                                                            ? "bg-secondary-500 text-white font-bold"
                                                            : "text-gray-600"
                                                        }
                                                    `}
                                                >
                                                    {day}
                                                </span>

                                                {/* Event chips */}
                                                {hasEvent && dayEvents.map((ev) => (
                                                    <button
                                                        key={ev.id}
                                                        onClick={() => setSelectedEvent(ev)}
                                                        className="w-full text-left text-white text-xs font-semibold rounded-md px-1.5 py-1 leading-tight mb-0.5 truncate transition-opacity hover:opacity-90 cursor-pointer"
                                                        style={{ background: "linear-gradient(97.67deg, var(--secondary-600) 12.02%, var(--secondary-500) 65.87%)" }}
                                                        title={ev.title}
                                                    >
                                                        {ev.title}
                                                    </button>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {selectedEvent && (
                <EventPopover event={selectedEvent} onClose={() => setSelectedEvent(null)} />
            )}
        </>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type ViewMode = "list" | "calendar";

export default function UpcomingEvents() {
    const [view, setView] = useState<ViewMode>("calendar");
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEvents() {
            try {
                if (!db) return;
                const snap = await getDocs(collection(db, "events"));
                const data = snap.docs.map(doc => {
                    const d = doc.data();
                    
                    // The dashboard formats dateTime as e.g. "2026-06-22T15:00"
                    // Or if it was seeded from JSON, it might have date, startTime, endTime separately.
                    // Let's handle both. The admin dashboard saves "dateTime" and "endTime" (string).
                    let dateStr = "";
                    let startStr = "";
                    let endStr = "";
                    
                    if (d.dateTime) {
                        const dt = new Date(d.dateTime);
                        if (!isNaN(dt.getTime())) {
                            dateStr = dt.toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' });
                            startStr = dt.toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit' });
                        } else {
                            if (d.dateTime.includes(" / ")) {
                                const [datePart, timePart] = d.dateTime.split(" / ");
                                dateStr = datePart;
                                startStr = timePart;
                            } else {
                                dateStr = d.dateTime;
                                startStr = "";
                            }
                        }
                        endStr = d.endTime || "";
                    } else if (d.date) {
                        dateStr = d.date;
                        startStr = d.startTime;
                        endStr = d.endTime;
                    }

                    return {
                        id: doc.id,
                        title: d.title || d.name || d.eventName || "",
                        description: d.description || "",
                        bulletPoints: d.bulletPoints || [],
                        date: dateStr,
                        startTime: startStr,
                        endTime: endStr,
                        location: d.location || "",
                        registerLink: d.registerLink || "",
                        post: (d as any).post || "",
                    } as Event;
                });
                const upcomingEvents = data.filter((event) => {
                    const eventDate = parseEventDate(event.date);
                    return eventDate !== null && eventDate > new Date();
                });
                setEvents(upcomingEvents);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, []);

    return (
        <section className="w-full mx-auto px-6 py-10 md:py-14">
            <h2 className="text-secondary-500 font-bold text-3xl md:text-4xl mb-3">
                Upcoming Events
            </h2>
            <div className="w-full h-px bg-gray-300 mb-5" />

            <div className="flex justify-end mb-5">
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                        <button
                            onClick={() => setView("calendar")}
                            type="button"
                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200 cursor-pointer"
                        style={{
                            background: view === "calendar" ? "#fff" : "transparent",
                            color: view === "calendar" ? "var(--secondary-500)" : "#6b7280",
                            boxShadow: view === "calendar" ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                        }}
                        aria-label="Calendar view"
                    >
                        <CalendarIcon />
                    </button>
                        <button
                            onClick={() => setView("list")}
                            type="button"
                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200 cursor-pointer"
                        style={{
                            background: view === "list" ? "#fff" : "transparent",
                            color: view === "list" ? "var(--secondary-500)" : "#6b7280",
                            boxShadow: view === "list" ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                        }}
                        aria-label="List view"
                    >
                        <ListIcon />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 text-secondary-600 animate-spin" />
                </div>
            ) : events.length === 0 ? (
                <p className="text-center text-gray-500 py-10">No upcoming events found.</p>
            ) : view === "list" ? (
                <div className="space-y-4">
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            ) : (
                <CalendarView events={events} />
            )}
        </section>
    );
}
