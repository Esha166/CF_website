"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getFirebaseAuth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { fetchContacts, fetchDonations } from "@/lib/admin-actions";

const BellIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CombineLogo = () => (
  <div className="flex-shrink-0 w-[42px] h-[42px] rounded-[6px] overflow-hidden flex items-center justify-center">
    <Image
      src="/combinelogo.png"
      alt="Combine Foundation"
      width={38}
      height={38}
      className="object-contain"
    />
  </div>
);

interface NotificationItem {
  id: string;
  type: "blog" | "event" | "course" | "contact" | "donation";
  text: string;
  time: string;
  href: string;
  read: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  blog: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  event: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  course: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  contact: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  donation: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
};

const colorMap: Record<string, string> = {
  blog: "bg-blue-500",
  event: "bg-orange-500",
  course: "bg-purple-500",
  contact: "bg-green-500",
  donation: "bg-emerald-600",
};

function AdminHeader() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [adminName, setAdminName] = useState("Admin User");
  const [adminInitial, setAdminInitial] = useState("A");
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const readKey = "admin-notification-read-ids";

  const handleLogout = async () => {
    const auth = await getFirebaseAuth();
    if (auth) {
      await auth.signOut();
    }
    try {
      await fetch("/api/auth/session", {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    }
    setDropdownOpen(false);
    router.push("/login");
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    getFirebaseAuth().then((auth) => {
      if (!auth || cancelled) return;
      unsubscribe = auth.onAuthStateChanged((user) => {
        if (user && user.email) {
          const emailName = user.email.split("@")[0];
          const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
          setAdminName(formattedName);
          setAdminInitial(formattedName.charAt(0).toUpperCase());
        } else {
          setAdminName("Admin");
          setAdminInitial("A");
        }
      });
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    let active = true;
    async function loadNotifications() {
      try {
        const readIds = new Set<string>();
        if (typeof window !== "undefined") {
          try {
            const stored = window.localStorage.getItem(readKey);
            if (stored) {
              JSON.parse(stored).forEach((id: string) => readIds.add(id));
            }
          } catch {
            // Ignore malformed storage and fall back to unread state.
          }
        }

        const [contacts, donations] = await Promise.all([
          fetchContacts().catch(() => []),
          fetchDonations().catch(() => [])
        ]);
        if (!active) return;

        const mappedContacts = contacts.slice(0, 3).map((c) => ({
          id: `contact-${c.id}`,
          type: "contact" as const,
          text: `Contact from ${c.name}: "${c.subject || c.message.substring(0, 25) + '...'}"`,
          time: "New",
          href: "/admin/dashboard?section=contact",
          read: readIds.has(`contact-${c.id}`),
        }));

        const mappedDonations = donations.slice(0, 3).map((d) => ({
          id: `donation-${d.id}`,
          type: "donation" as const,
          text: `Received Rs. ${d.amount} from ${d.name}`,
          time: "New",
          href: "/admin/dashboard?section=donations",
          read: readIds.has(`donation-${d.id}`),
        }));

        setNotifications([...mappedContacts, ...mappedDonations]);
      } catch (error) {
        console.error("Failed to load header notifications:", error);
      }
    }
    loadNotifications();
    return () => {
      active = false;
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const persistReadIds = (items: NotificationItem[]) => {
    if (typeof window === "undefined") return;
    const readIds = items.filter((item) => item.read).map((item) => item.id);
    window.localStorage.setItem(readKey, JSON.stringify(readIds));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const next = prev.map((item) => ({ ...item, read: true }));
      persistReadIds(next);
      return next;
    });
  };

  const markOneAsRead = (id: string) => {
    setNotifications((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, read: true } : item));
      persistReadIds(next);
      return next;
    });
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifOpen && notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (dropdownOpen && userRef.current && !userRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen, dropdownOpen]);

  return (
    <header
      className="w-full flex items-center justify-between px-4 sm:px-6"
      style={{
        backgroundColor: "#0f1b3d",
        height: "64px",
        minHeight: "64px",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="leading-tight">
          <p
            className="font-bold text-white m-0 p-0"
            style={{ fontSize: "11px", lineHeight: "1.3", whiteSpace: "nowrap" }}
          >
            Combine
          </p>
          <p
            className="font-bold text-white m-0 p-0"
            style={{ fontSize: "11px", lineHeight: "1.3", whiteSpace: "nowrap" }}
          >
            Foundation
          </p>
          <p
            className="font-bold text-white m-0 p-0"
            style={{ fontSize: "11px", lineHeight: "1.3", whiteSpace: "nowrap" }}
          >
            Dashboard
          </p>
        </div>
        <CombineLogo />
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((prev) => !prev)}
            className="relative flex items-center justify-center cursor-pointer bg-transparent border-none outline-none focus:outline-none"
            aria-label="Notifications"
          >
            <span className="text-white opacity-80 hover:opacity-100 transition-opacity">
              <BellIcon />
            </span>
            <span
              className="absolute flex items-center justify-center rounded-full bg-red-500 text-white font-bold"
              style={{
                top: "-6px",
                right: "-6px",
                width: "15px",
                height: "15px",
                fontSize: "8px",
                lineHeight: 1,
                display: unreadCount > 0 ? "flex" : "none",
              }}
            >
              {unreadCount}
            </span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">Notifications</p>
                <button
                  type="button"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="text-xs font-medium text-secondary-600 hover:text-secondary-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                  Mark all as read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => {
                      markOneAsRead(n.id);
                      setNotifOpen(false);
                    }}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                      n.read ? "hover:bg-gray-50" : "bg-secondary-50/60 hover:bg-secondary-50"
                    }`}
                  >
                    <span className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0 ${colorMap[n.type]}`}>
                      {iconMap[n.type]}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-sm leading-snug ${n.read ? "text-gray-700" : "text-slate-900 font-medium"}`}>
                        {n.text}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                  </Link>
                ))}
                {notifications.length === 0 && (
                  <div className="px-4 py-6 text-sm text-gray-500 text-center">
                    No notifications yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          className="hidden sm:block h-6 w-px opacity-20"
          style={{ backgroundColor: "#ffffff" }}
        />

        <div className="relative" ref={userRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 cursor-pointer bg-transparent border-none outline-none focus:outline-none"
            aria-label="User menu"
          >
            <div
              className="flex items-center justify-center rounded-full text-white font-bold flex-shrink-0"
              style={{
                width: "30px",
                height: "30px",
                backgroundColor: "var(--primary-500)",
                fontSize: "13px",
              }}
            >
              {adminInitial}
            </div>
            <span
              className="hidden sm:inline text-white font-medium"
              style={{ fontSize: "13px", whiteSpace: "nowrap" }}
            >
              {adminName}
            </span>
            <span
              className="text-white opacity-70"
              style={{
                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <ChevronDownIcon />
            </span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    getFirebaseAuth().then((auth) => {
      if (cancelled) return;
      if (!auth) {
        setAuthorized(true);
        return;
      }
      unsubscribe = auth.onAuthStateChanged((user) => {
        if (!user) {
          router.push("/login");
        } else {
          setAuthorized(true);
        }
      });
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-lg font-medium">
        Checking admin authentication...
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      <AdminHeader />
      {children}
    </div>
  );
}
