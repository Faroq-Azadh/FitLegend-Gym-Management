"use client";

import Link from "next/link";
import { useCoachDashboard } from "@/lib/hooks/queries/use-coach-dashboard";
import { cn } from "@/lib/utils";

export function CoachNeedsAttention() {
  const { data: dashboard } = useCoachDashboard();
  const items = dashboard?.needs_attention ?? [];

  const getIcon = (item: (typeof items)[0]) => {
    if (item.badge_type === "cyan") {
      // Weight / Activity pulse
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[18px] w-[18px]"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      );
    }

    if (item.badge_type === "default") {
      // Membership card / expiration
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[18px] w-[18px]"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
      );
    }

    // Message or warning (amber)
    if (item.text.includes("سؤال") || item.text.includes("پرسیده")) {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[18px] w-[18px]"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    }

    // Alert triangle
    return (
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
    );
  };

  return (
    <div className="card bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      {/* Card Head */}
      <div className="p-[20px_22px] border-b border-border">
        <h3 className="text-[16px] font-extrabold text-ink">نیازمند توجه</h3>
        <div className="text-[12.5px] text-ink-faint mt-[3px]">
          شاگردانی که پیگیری لازم دارند
        </div>
      </div>

      {/* Card Body */}
      <div className="p-[22px]">
        {items.map((item) => (
          <div
            key={item.id}
            className="feed-item flex gap-[13px] py-[14px] border-b border-border last:border-b-0 last:pb-0 first:pt-0"
          >
            {/* Feed Icon */}
            <div
              className={cn(
                "feed-ico flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[11px]",
                item.badge_type === "amber" && "amber bg-[#FFFBEB] text-[#B45309]",
                item.badge_type === "cyan" && "cyan bg-[rgba(14,165,233,0.12)] text-[#0369A1]",
                item.badge_type === "default" && "bg-tint text-primary-dark"
              )}
            >
              {getIcon(item)}
            </div>

            {/* Feed Content */}
            <div className="feed-body flex-1 min-w-0">
              <div className="t text-[13.5px] font-medium leading-[1.6] text-ink">
                <Link
                  href="/coach/students"
                  className="font-extrabold hover:text-primary-dark transition-colors"
                >
                  {item.member_name}
                </Link>{" "}
                {item.text}
              </div>
              <div className="time text-[11.5px] text-ink-faint mt-[3px]">
                {item.time_hint}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
