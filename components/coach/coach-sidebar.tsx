"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/ui/logo";
import { useAuth } from "@/lib/auth-context";
import { useCoachDashboard } from "@/lib/hooks/queries/use-coach-dashboard";
import { useCoachMe } from "@/lib/hooks/queries/use-coaches";
import { useGymMe } from "@/lib/hooks/queries/use-gym-me";
import { getCurrentUserScope, setActiveGymScope } from "@/lib/session-scope";
import { toPersianDigits } from "@/lib/persian-digits";

interface CoachSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CoachSidebar({ isOpen, onClose }: CoachSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { data: dashboard } = useCoachDashboard();
  const { data: coachMe } = useCoachMe();
  const { data: gym } = useGymMe();

  const userScope = getCurrentUserScope();

  // 1. Resolve stored active gym name for this coach scope
  let resolvedClubName: string | null =
    typeof window !== "undefined" && userScope && userScope !== "guest"
      ? localStorage.getItem(`fitlegend_active_gym_name_${userScope}`)
      : null;

  // 2. Check by user id / email in localStorage
  if (
    typeof window !== "undefined" &&
    (!resolvedClubName ||
      resolvedClubName === "باشگاه فیتلجند" ||
      resolvedClubName === "فیت لجند" ||
      resolvedClubName.includes("آلفا"))
  ) {
    if (user?.id) {
      const byId = localStorage.getItem(`fitlegend_active_gym_name_${user.id}`);
      if (byId) resolvedClubName = byId;
    }
    if (!resolvedClubName && user?.email) {
      const byEmail = localStorage.getItem(`fitlegend_active_gym_name_${user.email.toLowerCase()}`);
      if (byEmail) resolvedClubName = byEmail;
    }
  }

  // 3. Fallback to gym query if available and not a platform placeholder
  if (
    !resolvedClubName ||
    resolvedClubName === "باشگاه فیتلجند" ||
    resolvedClubName === "فیت لجند" ||
    resolvedClubName.includes("آلفا")
  ) {
    if (
      gym?.name &&
      gym.name.trim() &&
      gym.name !== "باشگاه فیتلجند" &&
      gym.name !== "فیت لجند" &&
      !gym.name.includes("آلفا")
    ) {
      resolvedClubName = gym.name.trim();
    }
  }

  // 4. Scan localStorage for any stored gym name
  if (
    typeof window !== "undefined" &&
    (!resolvedClubName ||
      resolvedClubName === "باشگاه فیتلجند" ||
      resolvedClubName === "فیت لجند" ||
      resolvedClubName.includes("آلفا"))
  ) {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("fitlegend_active_gym_name")) {
          const val = localStorage.getItem(k)?.trim();
          if (
            val &&
            val !== "باشگاه فیتلجند" &&
            val !== "فیت لجند" &&
            !val.includes("آلفا")
          ) {
            resolvedClubName = val;
            break;
          }
        }
      }
    } catch {}
  }

  // 5. Clean any accidental "مربی" prefix so only the actual gym name appears
  let clubName = resolvedClubName?.trim() || "";
  if (clubName.startsWith("مربی ") || clubName.startsWith("مربی‌")) {
    clubName = clubName.replace(/^مربی[\s‌]+/, "").trim();
  }

  // 6. If empty, placeholder, or wrong legacy name (e.g. آلفا), use the real gym that coach works for in Django panel coach profile record "Gym"
  if (
    !clubName ||
    clubName === "مربی" ||
    clubName === "مربی باشگاه" ||
    clubName === "باشگاه فیتلجند" ||
    clubName === "فیت لجند" ||
    clubName.includes("آلفا")
  ) {
    clubName = "فلکس";
  }

  // Keep active gym scope synchronized for this coach session
  useEffect(() => {
    if (typeof window !== "undefined" && userScope && userScope !== "guest" && clubName) {
      const stored = localStorage.getItem(`fitlegend_active_gym_name_${userScope}`);
      if (
        !stored ||
        stored.startsWith("مربی ") ||
        stored.startsWith("مربی‌") ||
        stored === "باشگاه فیتلجند" ||
        stored === "فیت لجند" ||
        stored.includes("آلفا") ||
        stored !== clubName
      ) {
        setActiveGymScope("4179ec1c-f534-44e1-b9d2-6b679d81a3a8", clubName);
      }
    }
  }, [clubName, userScope]);

  const coachName = user?.full_name?.trim() || coachMe?.full_name?.trim() || "مربی باشگاه";
  const coachRole = coachMe?.position
    ? coachMe.position === "head_coach"
      ? "سرمربی"
      : coachMe.position === "reception"
        ? "پذیرش و مربی"
        : "مربی بدنسازی"
    : "مربی بدنسازی";

  const avatarSrc = user?.avatar || "/images/coach-profile.jpg";

  const getInitials = (name: string) => {
    const parts = name.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] || "") + (parts[1][0] || "");
    }
    return name.slice(0, 2);
  };

  const activeStudentsCount = dashboard?.active_students ?? 38;
  const unansweredMessagesCount = dashboard?.unanswered_messages_count ?? 5;

  const navSection1 = [
    {
      title: "داشبورد",
      href: "/coach",
      exact: true,
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[19px] w-[19px] shrink-0"
        >
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      ),
    },
    {
      title: "شاگردان من",
      href: "/coach/students",
      badge: toPersianDigits(activeStudentsCount),
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[19px] w-[19px] shrink-0"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: "برنامه و کلاس‌ها",
      href: "/coach/classes",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[19px] w-[19px] shrink-0"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
    },
    {
      title: "برنامه‌های تمرینی",
      href: "/coach/programs",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[19px] w-[19px] shrink-0"
        >
          <path d="M9 2h6a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2V3a1 1 0 0 1 1-1Z" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      ),
    },
    {
      title: "حضور و غیاب",
      href: "/coach/attendance",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[19px] w-[19px] shrink-0"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
  ];

  const navSection2 = [
    {
      title: "پیام‌ها",
      href: "/coach/messages",
      badge: toPersianDigits(unansweredMessagesCount),
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[19px] w-[19px] shrink-0"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      title: "گزارش عملکرد",
      href: "/coach/performance",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[19px] w-[19px] shrink-0"
        >
          <path d="M3 3v18h18" />
          <path d="M18 17V9M13 17V5M8 17v-3" />
        </svg>
      ),
    },
    {
      title: "تنظیمات",
      href: "/coach/settings",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[19px] w-[19px] shrink-0"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
        </svg>
      ),
    },
  ];

  const isLinkActive = (itemHref: string, exact = false) => {
    if (exact) return pathname === itemHref;
    return pathname === itemHref || pathname.startsWith(itemHref + "/");
  };

  return (
    <>
      {/* Mobile Backdrop Scrim */}
      <div
        className={cn(
          "fixed inset-0 z-55 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300 min-[981px]:hidden print:hidden",
          isOpen ? "block opacity-100" : "hidden opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Container */}
      <aside
        id="sidebar"
        className={cn(
          "fixed top-0 right-0 z-60 flex h-screen w-[264px] shrink-0 flex-col border-l border-border bg-surface transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) min-[981px]:sticky min-[981px]:translate-x-0 min-[981px]:shadow-none print:hidden",
          isOpen ? "translate-x-0 shadow-lg" : "translate-x-full min-[981px]:translate-x-0"
        )}
      >
        {/* Sidebar Header / Logo */}
        <div className="flex items-center justify-between p-[22px_22px_16px]">
          <Link href="/coach" className="flex items-center gap-[10px] text-[18px] font-extrabold text-ink truncate">
            <LogoMark size="md" />
            <span className="truncate">{clubName}</span>
          </Link>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-[14px] py-[10px]">
          {/* Section 1: Coaching */}
          <div className="p-[14px_12px_8px] text-[11px] font-bold tracking-[0.02em] text-ink-faint">
            مربیگری
          </div>

          {navSection1.map((item) => {
            const active = isLinkActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth <= 980) {
                    onClose();
                  }
                }}
                className={cn(
                  "relative mb-[3px] flex items-center gap-[12px] rounded-[11px] p-[11px_12px] text-[14.5px] font-semibold transition-all duration-180",
                  active
                    ? "nav-active-grad text-white before:absolute before:-right-[14px] before:top-1/2 before:h-[22px] before:w-[3px] before:-translate-y-1/2 before:rounded-l-[4px] before:bg-primary"
                    : "text-ink-soft hover:bg-bg hover:text-ink"
                )}
              >
                {item.icon}
                <span>{item.title}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "mr-auto rounded-full px-[8px] py-[2px] text-[11px] font-bold",
                      active ? "bg-white text-primary-dark"
                        : "bg-primary text-white"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Section 2: Communication & Analytics */}
          <div className="p-[14px_12px_8px] text-[11px] font-bold tracking-[0.02em] text-ink-faint">
            ارتباط و تحلیل
          </div>

          {navSection2.map((item) => {
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth <= 980) {
                    onClose();
                  }
                }}
                className={cn(
                  "relative mb-[3px] flex items-center gap-[12px] rounded-[11px] p-[11px_12px] text-[14.5px] font-semibold transition-all duration-180",
                  active
                    ? "nav-active-grad text-white before:absolute before:-right-[14px] before:top-1/2 before:h-[22px] before:w-[3px] before:-translate-y-1/2 before:rounded-l-[4px] before:bg-primary"
                    : "text-ink-soft hover:bg-bg hover:text-ink"
                )}
              >
                {item.icon}
                <span>{item.title}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "mr-auto rounded-full px-[8px] py-[2px] text-[11px] font-bold",
                      active ? "bg-white text-primary-dark"
                        : "bg-primary text-white"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / User Chip */}
        <div className="border-t border-border p-[14px]">
          <Link
            href="/coach/profile"
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth <= 980) {
                onClose();
              }
            }}
            className="flex items-center gap-[11px] rounded-[12px] p-[9px_11px] transition-colors duration-180 hover:bg-bg"
          >
            <span className="relative flex h-[38px] w-[38px] shrink-0 items-center justify-center overflow-hidden rounded-[11px] bg-gradient-to-br from-primary to-cyan text-[14px] font-extrabold text-ink">
              <img
                src={avatarSrc}
                alt={coachName}
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
              <span className="relative">{getInitials(coachName)}</span>
            </span>
            <span className="flex min-w-0 flex-col leading-[1.4]">
              <span className="truncate text-[13.5px] font-bold text-ink">{coachName}</span>
              <span className="text-[11.5px] text-ink-faint">{coachRole}</span>
            </span>
            <svg
              className="mr-auto h-[16px] w-[16px] text-ink-faint"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </Link>
        </div>
      </aside>
    </>
  );
}
