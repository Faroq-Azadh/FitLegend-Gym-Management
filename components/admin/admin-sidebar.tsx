"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/ui/logo";
import { useAuth } from "@/lib/auth-context";
import { useGymMe } from "@/lib/hooks/queries/use-gym-me";
import { useOwnerDashboard } from "@/lib/hooks/queries/use-owner-dashboard";
import { useGymClasses } from "@/lib/hooks/use-gym-classes";
import { persianNumber } from "@/lib/api/register-gym";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { data: gym } = useGymMe();
  const { data: dashboard } = useOwnerDashboard();
  const { todayClasses } = useGymClasses();

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "OWNER":
        return "مدیر باشگاه";
      case "COACH":
        return "مربی";
      case "MEMBER":
        return "ورزشکار";
      default:
        return "مدیر باشگاه";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "تی";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] || "") + (parts[1][0] || "");
    }
    return name.slice(0, 2);
  };

  const activeMembersBadge =
    dashboard?.active_members !== undefined && dashboard.active_members > 0
      ? Number(dashboard.active_members).toLocaleString("fa-IR")
      : undefined;

  const todayClassesBadge =
    todayClasses.length > 0
      ? Number(todayClasses.length).toLocaleString("fa-IR")
      : undefined;

  const navManagement = [
    {
      title: "داشبورد",
      href: "/admin",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="h-[19px] w-[19px] shrink-0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      ),
    },
    {
      title: "اعضا",
      href: "/admin/members",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="h-[19px] w-[19px] shrink-0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      badge: activeMembersBadge,
    },
    {
      title: "مربیان و کارکنان",
      href: "/admin/coaches",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="h-[19px] w-[19px] shrink-0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="m16 11 2 2 4-4" />
        </svg>
      ),
    },
    {
      title: "رزروها",
      href: "/admin/bookings",
      disabled: true,
      badge: "غیرفعال",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="h-[19px] w-[19px] shrink-0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
    },
    {
      title: "کلاس‌ها",
      href: "/admin/classes",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="h-[19px] w-[19px] shrink-0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
      badge: todayClassesBadge,
    },
    {
      title: "پلن‌ها",
      href: "/admin/plans",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="h-[19px] w-[19px] shrink-0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
          <circle cx="7.5" cy="7.5" r="1.5" />
        </svg>
      ),
    },
    {
      title: "پرداخت‌ها",
      href: "/admin/payments",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="h-[19px] w-[19px] shrink-0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
      ),
    },
  ];

  const navAnalytics = [
    {
      title: "گزارش‌ها",
      href: "/admin/reports",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="h-[19px] w-[19px] shrink-0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3v18h18" />
          <path d="M18 17V9M13 17V5M8 17v-3" />
        </svg>
      ),
    },
    {
      title: "تنظیمات",
      href: "/admin/settings",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="h-[19px] w-[19px] shrink-0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile scrim / backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-55 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300 min-[981px]:hidden print:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar aside */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-60 flex h-screen w-[264px] shrink-0 flex-col border-l border-border bg-surface shadow-lg transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] min-[981px]:sticky min-[981px]:translate-x-0 min-[981px]:shadow-none print:hidden",
          isOpen ? "translate-x-0" : "translate-x-full min-[981px]:translate-x-0",
        )}
      >
        {/* Sidebar head with logo */}
        <div className="flex items-center justify-between px-[22px] pt-[22px] pb-[16px]">
          <Link href="/admin" className="flex items-center gap-[10px] text-[18px] font-extrabold text-ink truncate">
            <LogoMark size="md" />
            <span className="truncate">{gym?.name || "فیت لجند"}</span>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-[14px] py-[10px]">
          <div className="px-[12px] pt-[14px] pb-[8px] text-[11px] font-bold tracking-[0.02em] text-ink-faint">
            مدیریت
          </div>
          {navManagement.map((item) => {
            const isDisabled = (item as any).disabled;
            const isActive = !isDisabled && pathname === item.href;

            if (isDisabled) {
              return (
                <div
                  key={item.href}
                  className="relative mb-[3px] flex items-center gap-[12px] rounded-[11px] px-[12px] py-[11px] text-[14.5px] font-semibold text-ink-faint/60 opacity-50 cursor-not-allowed select-none transition-none"
                  title="این بخش در حال حاضر غیرفعال است"
                >
                  {item.icon}
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="mr-auto rounded-full bg-border/80 px-[8px] py-[2px] text-[10.5px] font-bold text-ink-faint">
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth <= 980) onClose();
                }}
                className={cn(
                  "relative mb-[3px] flex items-center gap-[12px] rounded-[11px] px-[12px] py-[11px] text-[14.5px] font-semibold transition-all duration-180",
                  isActive
                    ? "bg-tint text-primary-dark before:absolute before:-right-[14px] before:top-1/2 before:h-[22px] before:w-[3px] before:-translate-y-1/2 before:rounded-l-[4px] before:bg-primary"
                    : "text-ink-soft hover:bg-bg hover:text-ink",
                )}
              >
                {item.icon}
                <span>{item.title}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "mr-auto rounded-full px-[8px] py-[2px] text-[11px] font-bold",
                      isActive ? "bg-primary-dark text-white" : "bg-primary text-[#006633]",
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="px-[12px] pt-[14px] pb-[8px] text-[11px] font-bold tracking-[0.02em] text-ink-faint">
            تحلیل
          </div>
          {navAnalytics.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth <= 980) onClose();
                }}
                className={cn(
                  "relative mb-[3px] flex items-center gap-[12px] rounded-[11px] px-[12px] py-[11px] text-[14.5px] font-semibold transition-all duration-180",
                  isActive
                    ? "bg-tint text-primary-dark before:absolute before:-right-[14px] before:top-1/2 before:h-[22px] before:w-[3px] before:-translate-y-1/2 before:rounded-l-[4px] before:bg-primary"
                    : "text-ink-soft hover:bg-bg hover:text-ink",
                )}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar foot / User Profile */}
        <div className="border-t border-border p-[14px]">
          <Link
            href="/admin/profile"
            className="flex cursor-pointer items-center gap-[11px] rounded-[12px] px-[11px] py-[9px] transition-colors duration-180 hover:bg-bg"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.full_name || "کاربر"}
                className="h-[38px] w-[38px] shrink-0 rounded-[11px] object-cover"
              />
            ) : (
              <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-linear-to-br from-primary to-cyan text-[14px] font-extrabold text-ink">
                {getInitials(user?.full_name)}
              </span>
            )}
            <div className="flex min-w-0 flex-col leading-[1.4]">
              <span className="truncate text-[13.5px] font-bold text-ink">
                {user?.full_name || "صاحب باشگاه"}
              </span>
              <span className="truncate text-[11.5px] text-ink-faint">
                {getRoleLabel(user?.role)}
              </span>
            </div>
            <ChevronDown className="mr-auto h-[16px] w-[16px] text-ink-faint" />
          </Link>
        </div>
      </aside>
    </>
  );
}
