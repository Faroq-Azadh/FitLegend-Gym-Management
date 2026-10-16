"use client";

import Link from "next/link";
import { useCoachDashboard } from "@/lib/hooks/queries/use-coach-dashboard";
import { cn } from "@/lib/utils";

export function CoachRecentActivity() {
  const { data: dashboard } = useCoachDashboard();
  const activities = dashboard?.recent_activity ?? [];

  const getActivityIcon = (type: (typeof activities)[0]["type"]) => {
    switch (type) {
      case "checkin":
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
            <path d="m9 12 2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
      case "weight":
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
      case "program":
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
            <path d="M9 2h6a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2V3a1 1 0 0 1 1-1Z" />
          </svg>
        );
      case "new_student":
      default:
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
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
        );
    }
  };

  return (
    <div className="card bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      {/* Card Head */}
      <div className="p-[20px_22px] border-b border-border">
        <h3 className="text-[16px] font-extrabold text-ink">فعالیت اخیر</h3>
        <div className="text-[12.5px] text-ink-faint mt-[3px]">
          آخرین رویدادهای شاگردان
        </div>
      </div>

      {/* Card Body */}
      <div className="p-[22px]">
        {activities.map((item) => {
          const isCyan = item.type === "weight";
          return (
            <div
              key={item.id}
              className="feed-item flex gap-[13px] py-[14px] border-b border-border last:border-b-0 last:pb-0 first:pt-0"
            >
              {/* Feed Icon */}
              <div
                className={cn(
                  "feed-ico flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[11px]",
                  isCyan
                    ? "cyan bg-[rgba(14,165,233,0.12)] text-[#0369A1]"
                    : "bg-tint text-primary-dark"
                )}
              >
                {getActivityIcon(item.type)}
              </div>

              {/* Feed Content */}
              <div className="feed-body flex-1 min-w-0">
                <div className="t text-[13.5px] font-medium leading-[1.6] text-ink">
                  {item.type === "program" ? (
                    <>
                      برنامه‌ی جدید برای{" "}
                      <Link
                        href="/coach/students"
                        className="font-extrabold hover:text-primary-dark transition-colors"
                      >
                        {item.student_name}
                      </Link>{" "}
                      تخصیص داده شد
                    </>
                  ) : item.type === "new_student" ? (
                    <>
                      شاگرد جدید{" "}
                      <Link
                        href="/coach/students"
                        className="font-extrabold hover:text-primary-dark transition-colors"
                      >
                        {item.student_name}
                      </Link>{" "}
                      اضافه شد
                    </>
                  ) : (
                    <>
                      <Link
                        href="/coach/students"
                        className="font-extrabold hover:text-primary-dark transition-colors"
                      >
                        {item.student_name}
                      </Link>{" "}
                      {item.action_text}
                    </>
                  )}
                </div>
                <div className="time text-[11.5px] text-ink-faint mt-[3px]">
                  {item.time}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
