"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useOwnerDashboard } from "@/lib/hooks/queries/use-owner-dashboard";
import type { RecentActivityEvent } from "@/lib/api/services/gyms.service";
import {
  useActivitiesData,
  categorizeActivity,
  ACTIVITY_CATEGORIES,
  type ActivityItem,
  type ActivityCategoryKey,
} from "@/lib/activities-store";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/persian-digits";
import { Search, X, ExternalLink, Activity } from "lucide-react";

interface RecentActivityProps {
  activities?: RecentActivityEvent[];
  isLoading?: boolean;
}

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
    return date.toLocaleDateString("fa-IR", { month: "short", day: "numeric" });
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
        badge: "حذف و هشدار",
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

export function RecentActivity({ activities: propActivities, isLoading: propLoading }: RecentActivityProps) {
  const { data: dashboard, isLoading: queryLoading } = useOwnerDashboard();
  const { activities: mergedActivities } = useActivitiesData(propActivities ?? dashboard?.recent_activity);
  const isLoading = propLoading ?? queryLoading;

  // STRICTLY show 5 recent activities in the dashboard card
  const dashboardItems = mergedActivities && mergedActivities.length > 0 ? mergedActivities.slice(0, 5) : [];

  // Modal state for showing all activities
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategoryKey>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Category counts across all merged activities
  const categoryCounts = useMemo(() => {
    const counts: Record<ActivityCategoryKey, number> = {
      all: mergedActivities.length,
      members: 0,
      coaches: 0,
      classes: 0,
      edits: 0,
      alerts: 0,
    };
    for (const act of mergedActivities) {
      const cat = categorizeActivity(act);
      if (counts[cat] !== undefined) {
        counts[cat]++;
      }
    }
    return counts;
  }, [mergedActivities]);

  // Filtered activities inside modal
  const modalActivities = useMemo(() => {
    return mergedActivities.filter((act) => {
      if (selectedCategory !== "all") {
        const cat = categorizeActivity(act);
        if (cat !== selectedCategory) return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        return act.text.toLowerCase().includes(query);
      }
      return true;
    });
  }, [mergedActivities, selectedCategory, searchQuery]);

  if (isLoading && dashboardItems.length === 0) {
    return (
      <div className="rounded-[16px] border border-border bg-surface p-[22px] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between border-b border-border pb-[16px]">
          <div className="h-[20px] w-[120px] animate-pulse rounded bg-bg" />
        </div>
        <div className="flex flex-col gap-[14px] pt-[16px]">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex h-[50px] animate-pulse items-center gap-[12px] rounded bg-bg/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-[16px] border border-border bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between border-b border-border px-[22px] py-[20px]">
          <div>
            <h3 className="text-[16px] font-extrabold text-ink">فعالیت‌های اخیر</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer rounded-full bg-tint px-[12px] py-[5px] text-[11.5px] font-bold text-primary-dark transition-all hover:bg-primary/20 active:scale-95"
            title="مشاهده و دسته‌بندی تمام فعالیت‌ها"
          >
            همه
          </button>
        </div>

        <div className="px-[22px] pt-[8px] pb-[22px]">
          {dashboardItems.length === 0 ? (
            <div className="py-8 text-center text-[13.5px] text-ink-faint">
              فعالیت اخیری برای نمایش وجود ندارد.
            </div>
          ) : (
            dashboardItems.map((item, index) => {
              const config = getActivityConfig(item.type);
              const timeStr = getRelativeTime(item.timestamp);

              return (
                <div
                  key={item.id || index}
                  className={cn(
                    "flex gap-[13px] py-[14px]",
                    index < dashboardItems.length - 1 && "border-b border-border",
                    index === dashboardItems.length - 1 && "pb-0",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[11px]",
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
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-medium leading-[1.6] text-ink">
                      {item.text}
                    </div>
                    <div className="mt-[3px] text-[11.5px] text-ink-faint">{timeStr}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: All Activities Categorized */}
      {isModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[4px]">
          <div className="flex max-h-[88vh] w-full max-w-[620px] flex-col rounded-[20px] border border-border bg-surface shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border px-[24px] py-[18px]">
              <div className="flex items-center gap-[10px]">
                <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[12px] bg-tint text-primary-dark">
                  <Activity className="h-[20px] w-[20px]" />
                </div>
                <div>
                  <h3 className="text-[16.5px] font-extrabold text-ink">
                    تمام فعالیت‌های اخیر باشگاه
                  </h3>
                  <p className="mt-[2px] text-[12px] text-ink-faint">
                    دسته‌بندی هوشمند و تفکیک کلیه وقایع و اقدامات ثبت‌شده
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-[6px]">
                <Link
                  href="/admin/activities"
                  onClick={() => setIsModalOpen(false)}
                  className="inline-flex items-center gap-[5px] rounded-[10px] border border-border bg-bg px-[10px] py-[6px] text-[11.5px] font-bold text-ink-soft transition-colors hover:text-ink hover:border-primary"
                  title="مشاهده در صفحه تمام فعالیت‌ها"
                >
                  <span>صفحه اختصاصی</span>
                  <ExternalLink className="h-[12px] w-[12px]" />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex h-[32px] w-[32px] items-center justify-center rounded-[9px] text-ink-faint hover:bg-bg hover:text-ink transition-colors cursor-pointer"
                >
                  <X className="h-[18px] w-[18px]" />
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="border-b border-border px-[24px] py-[12px]">
              <div className="relative flex items-center">
                <Search className="absolute right-[12px] h-[15px] w-[15px] text-ink-faint" />
                <input
                  type="text"
                  placeholder="جستجو در متن فعالیت‌ها (نام عضو، مربی، کلاس، ...)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-[11px] border border-border bg-bg/60 pr-[36px] pl-[14px] py-[8px] text-[13px] text-ink outline-none transition focus:border-primary focus:bg-surface"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute left-[12px] text-ink-faint hover:text-ink text-[12px] font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-[6px] border-b border-border bg-bg/30 px-[24px] py-[10px]">
              {ACTIVITY_CATEGORIES.map((cat) => {
                const count = categoryCounts[cat.id] || 0;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "cursor-pointer flex items-center gap-[6px] rounded-[10px] px-[12px] py-[6px] text-[12px] font-bold transition-all",
                      isSelected
                        ? "bg-surface text-ink border border-border shadow-2xs text-primary-dark font-extrabold"
                        : "text-ink-faint hover:text-ink hover:bg-surface/50",
                    )}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={cn(
                        "rounded-full px-[6px] py-[1px] text-[10.5px] font-bold",
                        isSelected ? "bg-tint text-primary-dark" : "bg-bg text-ink-faint",
                      )}
                    >
                      {toPersianDigits(count)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Activities Scrollable List */}
            <div className="flex-1 overflow-y-auto px-[24px] py-[16px] divide-y divide-border">
              {modalActivities.length === 0 ? (
                <div className="py-12 text-center">
                  <Activity className="mx-auto h-[32px] w-[32px] text-ink-faint/40 mb-[8px]" />
                  <div className="text-[13.5px] font-bold text-ink">فعالیتی در این دسته‌بندی یافت نشد</div>
                  <div className="mt-[2px] text-[12px] text-ink-faint">
                    {searchQuery ? "عبارت جستجو شده را بررسی کنید." : "هیچ موردی ثبت نشده است."}
                  </div>
                </div>
              ) : (
                modalActivities.map((item, index) => {
                  const config = getActivityConfig(item.type);
                  const timeStr = getRelativeTime(item.timestamp);

                  return (
                    <div
                      key={item.id || index}
                      className="flex items-center gap-[14px] py-[13px] first:pt-0 last:pb-0"
                    >
                      <span
                        className={cn(
                          "flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[12px]",
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
                      <div className="min-w-0 flex-1">
                        <div className="text-[13.5px] font-bold text-ink leading-[1.5]">
                          {item.text}
                        </div>
                        <div className="mt-[3px] flex items-center gap-[8px] text-[11.5px] text-ink-faint">
                          <span>{timeStr}</span>
                          <span>•</span>
                          <span className="rounded-full bg-bg px-[7px] py-[1px] text-[10.5px] font-semibold text-ink-soft">
                            {config.badge}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-border px-[24px] py-[14px] bg-bg/20">
              <span className="text-[12px] text-ink-faint font-medium">
                تعداد نمایش داده شده: {toPersianDigits(modalActivities.length)} فعالیت
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer rounded-[10px] bg-surface border border-border px-[14px] py-[6px] text-[12.5px] font-bold text-ink shadow-2xs hover:bg-bg transition"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
