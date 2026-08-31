"use client";

import {
  Menu,
  Search,
  Bell,
  MessageSquare,
  Calendar,
  ChevronDown,
  LogOut,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getStoredUser, getToken, getStoredAvatar, subscribeAvatarChange } from "@/lib/auth";
import { getInitials } from "@/lib/utils/formatters";
import CalendarPicker from "@/components/shared/Calendar";
import { MENU_ITEMS } from "@/lib/constants";
import { MODULES, QUICK_ACCESS } from "@/lib/modules";
import { listNotifications, listMessages, markAllNotificationsRead } from "@/lib/services/communicationService";

interface DashboardHeaderProps {
  userName?: string;
  userRole?: string;
}

type SearchResult = {
  title: string;
  icon: LucideIcon;
  href: string;
};

const SEARCH_INDEX: SearchResult[] = [
  ...MENU_ITEMS.map((m) => ({
    title: m.label,
    icon: m.icon,
    href: m.href ?? "#",
  })),
  ...MODULES.map((m) => ({ title: m.title, icon: m.icon, href: m.href })),
  ...QUICK_ACCESS.map((q) => ({ title: q.label, icon: q.icon, href: q.href })),
];

export default function DashboardHeader({
  userName,
  userRole,
}: DashboardHeaderProps = {}) {
  const [name, setName] = useState(userName ?? "");
  const [role, setRole] = useState(userRole ?? "");
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  const dashboardRole = pathname.match(/^\/dashboard\/([^/]+)/)?.[1];
  const actionPaths: Record<string, { messages?: string; notifications?: string }> = {
    admin: {
      messages: "/dashboard/admin/messages",
      notifications: "/dashboard/admin/notifications",
    },
    parent: {
      messages: "/dashboard/parent/messages",
      notifications: "/dashboard/parent/notifications",
    },
    teacher: { messages: "/dashboard/teacher/messages", notifications: "/dashboard/teacher/notifications" },
    student: { messages: "/dashboard/student/messages", notifications: "/dashboard/student/notifications" },
    accountant: { messages: "/dashboard/accountant/messages", notifications: "/dashboard/accountant/notifications" },
    librarian: { messages: "/dashboard/librarian/messages", notifications: "/dashboard/librarian/notifications" },
    warden: { messages: "/dashboard/warden/messages", notifications: "/dashboard/warden/notifications" },
  };
  const actions = dashboardRole ? actionPaths[dashboardRole] : undefined;

  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = () => {
      const user = getStoredUser();
      if (!user) return;
      setName(user.username);
      setRole(user.role?.role_name ?? user.role_id);
    };
    loadUserData();
    setAvatar(getStoredAvatar());
    const unsubscribe = subscribeAvatarChange((newAvatar) => {
      setAvatar(newAvatar);
    });
    window.addEventListener("focus", loadUserData);
    return () => {
      unsubscribe();
      window.removeEventListener("focus", loadUserData);
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SEARCH_INDEX.filter((r) => r.title.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    const handleNotifsViewed = () => {
      setHasUnreadNotifications(false);
    };
    const handleMsgsViewed = () => {
      setHasUnreadMessages(false);
    };

    window.addEventListener("edtech_notifications_viewed", handleNotifsViewed);
    window.addEventListener("edtech_messages_viewed", handleMsgsViewed);

    if (pathname && (pathname.includes("/notifications") || pathname.includes("/notices"))) {
      setHasUnreadNotifications(false);
      try {
        localStorage.setItem("edtech_notifications_viewed_at", new Date().toISOString());
      } catch {}
    }
    if (pathname && pathname.includes("/messages")) {
      setHasUnreadMessages(false);
      try {
        localStorage.setItem("edtech_messages_viewed_at", new Date().toISOString());
      } catch {}
    }

    const checkUnread = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const user = getStoredUser();
        const userId = user?.id;

        // If currently viewing notifications page, suppress unread badge
        if (pathname && (pathname.includes("/notifications") || pathname.includes("/notices"))) {
          setHasUnreadNotifications(false);
        } else {
          const lastViewedStr = typeof window !== "undefined" ? localStorage.getItem("edtech_notifications_viewed_at") : null;
          const lastViewedTime = lastViewedStr ? new Date(lastViewedStr).getTime() : 0;

          // Fetch notifications
          const notifs = await listNotifications(token).catch(() => []);
          const unreadNotif = notifs.some((n: any) => {
            if (n.is_read) return false;
            const notifTime = new Date(n.created_at || n.sent_at || n.sent_on || 0).getTime();
            if (lastViewedTime && notifTime && notifTime <= lastViewedTime) return false;
            return true;
          });
          setHasUnreadNotifications(unreadNotif);
        }

        // Messages
        if (pathname && pathname.includes("/messages")) {
          setHasUnreadMessages(false);
        } else {
          const lastViewedMsgStr = typeof window !== "undefined" ? localStorage.getItem("edtech_messages_viewed_at") : null;
          const lastViewedMsgTime = lastViewedMsgStr ? new Date(lastViewedMsgStr).getTime() : 0;

          const msgs = await listMessages(token).catch(() => []);
          const unreadMsg = msgs.some((m: any) => {
            if (m.is_read || m.receiver_id !== userId) return false;
            const msgTime = new Date(m.created_at || m.sent_at || 0).getTime();
            if (lastViewedMsgTime && msgTime && msgTime <= lastViewedMsgTime) return false;
            return true;
          });
          setHasUnreadMessages(unreadMsg);
        }
      } catch (err) {
        console.error("Failed to check unread communications:", err);
      }
    };

    void checkUnread();

    const interval = setInterval(() => {
      void checkUnread();
    }, 20000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("edtech_notifications_viewed", handleNotifsViewed);
      window.removeEventListener("edtech_messages_viewed", handleMsgsViewed);
    };
  }, [pathname]);

  const handleOpenNotifications = () => {
    setHasUnreadNotifications(false);
    try {
      localStorage.setItem("edtech_notifications_viewed_at", new Date().toISOString());
    } catch {}
    window.dispatchEvent(new CustomEvent("edtech_notifications_viewed"));
    const token = getToken();
    if (token) {
      void markAllNotificationsRead(token).catch(() => {});
    }
    if (actions?.notifications) {
      router.push(actions.notifications);
    }
  };

  const handleOpenMessages = () => {
    setHasUnreadMessages(false);
    try {
      localStorage.setItem("edtech_messages_viewed_at", new Date().toISOString());
    } catch {}
    window.dispatchEvent(new CustomEvent("edtech_messages_viewed"));
    if (actions?.messages) {
      router.push(actions.messages);
    }
  };

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    if (!calendarOpen && !open && !profileOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCalendarOpen(false);
        setOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [calendarOpen, open, profileOpen]);

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "/") {
        event.preventDefault();
        searchInputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);

  const go = (href: string) => {
    setQuery("");
    setOpen(false);
    router.push(href);
  };

  const handleLogout = () => {
    clearAuth();
    router.replace("/login");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) {
      if (e.key === "Enter" && results.length > 0) {
        e.preventDefault();
        go(results[0].href);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => (s + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => (s - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[selected].href);
    }
  };

  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 hover:bg-slate-100 rounded-lg">
            <Menu className="w-5 h-5 text-slate-600" />
          </button>

          {/* Search Bar */}
          <div ref={searchRef} className="relative">
            <div
              className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                open
                  ? "border-purple-400 bg-purple-50 shadow-sm"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <Search className="w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                placeholder="Search for modules, students, reports..."
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={onKeyDown}
                className="bg-transparent outline-none text-sm w-64 placeholder-slate-400"
              />
              <span className="text-xs text-slate-400 font-medium">Ctrl /</span>
            </div>

            {open && query.trim() !== "" && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[60vh] overflow-y-auto rounded-xl border border-slate-200 bg-white py-2 shadow-2xl">
                {results.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-500">
                    No matching modules or pages found
                  </div>
                ) : (
                  results.map((r, i) => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={`${r.title}-${r.href}-${i}`}
                        onClick={() => go(r.href)}
                        onMouseEnter={() => setSelected(i)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
                          i === selected
                            ? "bg-purple-50 text-[#6d28d9]"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 truncate">{r.title}</span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {actions?.notifications && (
            <button
              type="button"
              onClick={handleOpenNotifications}
              aria-label="Open notifications"
              className="relative p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {hasUnreadNotifications && (
                <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>
          )}

          {actions?.messages && (
            <button
              type="button"
              onClick={handleOpenMessages}
              aria-label="Open messages"
              className="relative p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <MessageSquare className="w-5 h-5 text-slate-600" />
              {hasUnreadMessages && (
                <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>
          )}

          {/* Calendar */}
          <div className="relative flex items-center gap-2" ref={calendarRef}>
            <span className="hidden md:block text-sm font-medium text-slate-600">
              {formattedDate}
            </span>
            <button
              type="button"
              onClick={() => setCalendarOpen((o) => !o)}
              aria-haspopup="dialog"
              aria-expanded={calendarOpen}
              aria-label="Open calendar"
              className="relative p-2 hover:bg-slate-100 rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            >
              <Calendar className="w-5 h-5 text-slate-600" />
            </button>

            {calendarOpen && (
              <div
                role="dialog"
                aria-label="Calendar"
                className="fixed right-4 top-20 z-[60] w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl"
              >
                <CalendarPicker
                  selectedDate={selectedDate}
                  onSelect={(d) => {
                    setSelectedDate(d);
                    setCalendarOpen(false);
                  }}
                />
              </div>
            )}
          </div>

          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((isOpen) => !isOpen)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              className="flex items-center gap-3 rounded-lg py-2 pl-3 pr-2 transition hover:bg-slate-100"
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-8 h-8 rounded-full object-cover border border-purple-300 shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {getInitials(name)}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-900">{name}</p>
                <p className="text-xs text-slate-500">{role}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {profileOpen && (
              <div role="menu" className="absolute right-0 z-50 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                {dashboardRole && ["admin", "teacher", "student", "parent", "librarian", "accountant"].includes(dashboardRole) && (
                  <button type="button" role="menuitem" onClick={() => router.push(`/dashboard/${dashboardRole}/settings`)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                )}
                <button type="button" role="menuitem" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50">
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
