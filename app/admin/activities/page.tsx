"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { useOwnerDashboard } from "@/lib/hooks/queries/use-owner-dashboard";
import {
  useActivitiesData,
  categorizeActivity,
  ACTIVITY_CATEGORIES,
  type ActivityCategoryKey,
} from "@/lib/activities-store";
import { toPersianDigits } from "@/lib/persian-digits";
import { cn } from "@/lib/utils";
import { ArrowRight, Activity, Calendar, RefreshCw, Search } from "lucide-react";

function getRelativeTime(timestamp: string): string {
  if (!timestamp) return "به تازگی";
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return timestamp;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    const fa = (n: number) => n.toLocaleString("fa-IR");

    if (diffMin < 1) return "همین الان";
    if (diffMin < 60) return `${fa(diffMin)} دقیقه پیش`;
    if (diffHour < 24) return `${fa(diffHour)} ساعت پیش`;
    if (diffDay === 1) return "دیروز";
    if (diffDay < 7) return `${fa(diffDay)} روز پیش`;
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return timestamp;
  }
}

function getActivityConfig(type: string) {
  const upper = (type || "").toUpperCase();
  switch (upper) {
    case "PAYMENT":
      return {
        variant: "emerald",
        badge: "تراکنش مالی",
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[18px] w-[18px]"
          >
            <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        ),
      };
    case "COACH":
      return {
        variant: "purple",
        badge: "مربیان و کارکنان",
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[18px] w-[18px]"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M19 8v6M22 11h-6" />
          </svg>
        ),
      };
    case "EDIT":
      return {
        variant: "blue",
        badge: "ویرایش",
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[18px] w-[18px]"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        ),
      };
    case "FULL":
      return {
        variant: "rose",
        badge: "تکمیل ظرفیت",
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[18px] w-[18px]"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        ),
      };
    case "ALERT":
    case "WARNING":
      return {
        variant: "amber",
        badge: "هشدار و عملیات",
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[18px] w-[18px]"
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
        ),
      };
    case "CLASS":
    case "TRAINING":
      return {
        variant: "cyan",
        badge: "کلاس ورزشی",
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[18px] w-[18px]"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        ),
      };
    case "MEMBER":
    default:
      return {
        variant: "emerald",
        badge: "عضویت",
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[18px] w-[18px]"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ),
      };
  }
}

export default function AdminActivitiesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<ActivityCategoryKey>("all");
  const [search, setSearch] = useState("");
  const { data: dashboard, isLoading: isDashboardLoading, refetch } = useOwnerDashboard();
  const { activities } = useActivitiesData(dashboard?.recent_activity);

  const categoryCounts = useMemo(() => {
    const counts: Record<ActivityCategoryKey, number> = {
      all: activities.length,
      members: 0,
      coaches: 0,
      classes: 0,
      edits: 0,
      alerts: 0,
    };
    for (const act of activities) {
      const cat = categorizeActivity(act);
      if (counts[cat] !== undefined) {
        counts[cat]++;
      }
    }
    return counts;
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (filter !== "all") {
        const cat = categorizeActivity(act);
        if (cat !== filter) return false;
      }
      if (search.trim()) {
        return act.text.toLowerCase().includes(search.trim().toLowerCase());
      }
      return true;
    });
  }, [activities, filter, search]);

  return (
    <div className="flex min-h-screen bg-bg text-ink">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          searchPlaceholder="جستجو در سوابق و فعالیت‌های باشگاه…"
        />

        <main className="flex-1 p-[18px] min-[640px]:p-[28px]">
          <div className="mb-[24px] flex flex-wrap items-center justify-between gap-[16px]">
            <div>
              <div className="flex items-center gap-[8px] text-[13px] text-ink-faint">
                <Link href="/admin" className="hover:text-ink transition-colors">
                  داشبورد
                </Link>
                <span>/</span>
                <span className="text-ink font-bold">تمام فعالیت‌ها</span>
              </div>
              <h1 className="mt-[4px] text-[22px] font-extrabold tracking-[-0.01em] text-ink min-[640px]:text-[26px]">
                گزارش جامع فعالیت‌های پنل
              </h1>
              <p className="mt-[4px] text-[13.5px] text-ink-faint">
                ثبت کلیه وقایع، ثبت‌نام اعضا، مربیان و کارکنان، تغییرات کلاس‌ها، ویرایش‌ها و هشدارها
              </p>
            </div>

            <div className="flex items-center gap-[10px]">
              <button
                type="button"
                onClick={() => refetch()}
                className="flex items-center gap-[6px] rounded-[10px] border border-border bg-surface px-[13px] py-[8px] text-[13px] font-bold text-ink shadow-xs transition-colors hover:bg-bg cursor-pointer"
              >
                <RefreshCw className="h-[14px] w-[14px]" />
                بروزرسانی
              </button>
            </div>
          </div>

          {/* Filter Pills with Counts and Search */}
          <div className="mb-[18px] flex flex-col gap-[12px] min-[768px]:flex-row min-[768px]:items-center min-[768px]:justify-between">
            <div className="flex flex-wrap gap-[6px]">
              {ACTIVITY_CATEGORIES.map((f) => {
                const count = categoryCounts[f.id] || 0;
                const isSelected = filter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "cursor-pointer flex items-center gap-[6px] rounded-[10px] px-[13px] py-[7px] text-[12.5px] font-bold transition-all",
                      isSelected
                        ? "bg-surface text-ink border border-border shadow-xs text-primary-dark font-extrabold"
                        : "text-ink-faint hover:text-ink hover:bg-surface/50",
                    )}
                  >
                    <span>{f.label}</span>
                    <span
                      className={cn(
                        "rounded-full px-[6px] py-[1px] text-[11px] font-bold",
                        isSelected ? "bg-tint text-primary-dark" : "bg-bg text-ink-faint",
                      )}
                    >
                      {toPersianDigits(count)}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative flex items-center min-w-[240px]">
              <Search className="absolute right-[12px] h-[15px] w-[15px] text-ink-faint" />
              <input
                type="text"
                placeholder="جستجو در وقایع..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-[10px] border border-border bg-surface pr-[36px] pl-[12px] py-[7px] text-[13px] text-ink outline-none transition focus:border-primary"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute left-[10px] text-ink-faint hover:text-ink text-[12px] font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Activity List Card */}
          <div className="rounded-[16px] border border-border bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
            <div className="p-[20px] min-[640px]:p-[24px]">
              {filteredActivities.length === 0 ? (
                <div className="py-16 text-center">
                  <Activity className="mx-auto h-[36px] w-[36px] text-ink-faint/50 mb-[10px]" />
                  <div className="text-[14px] font-bold text-ink">فعالیتی یافت نشد</div>
                  <div className="mt-[4px] text-[12.5px] text-ink-faint">
                    هیچ موردی با فیلتر انتخاب شده ثبت نشده است.
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredActivities.map((item, index) => {
                    const config = getActivityConfig(item.type);
                    const timeStr = getRelativeTime(item.timestamp);

                    return (
                      <div
                        key={item.id || index}
                        className="flex items-center justify-between gap-[16px] py-[16px] first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center gap-[14px]">
                          <span
                            className={cn(
                              "flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[12px]",
                              config.variant === "emerald" && "bg-tint text-primary-dark",
                              config.variant === "cyan" && "bg-[#0EA5E9]/15 text-[#0369A1]",
                              config.variant === "amber" && "bg-[#FFFBEB] text-[#B45309]",
                              config.variant === "purple" && "bg-[#F3E8FF] text-[#7E22CE]",
                              config.variant === "blue" && "bg-[#EFF6FF] text-[#2563EB]",
                              config.variant === "rose" && "bg-[#FFF1F2] text-[#E11D48]",
                            )}
                          >
                            {config.icon}
                          </span>
                          <div>
                            <div className="text-[14px] font-bold text-ink">
                              {item.text}
                            </div>
                            <div className="mt-[3px] flex items-center gap-[8px] text-[12px] text-ink-faint">
                              <span>{timeStr}</span>
                              <span>•</span>
                              <span className="rounded-full bg-bg px-[8px] py-[1px] text-[11px] font-semibold">
                                {config.badge}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
