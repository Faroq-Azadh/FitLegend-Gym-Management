"use client";

import { useState } from "react";
import { useCoachDashboard } from "@/lib/hooks/queries/use-coach-dashboard";
import { toPersianDigits } from "@/lib/persian-digits";
import { cn } from "@/lib/utils";

export function CoachWeeklyAttendance() {
  const { data: dashboard } = useCoachDashboard();
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const weeklyBars = dashboard?.weekly_attendance ?? [
    { day: "شنبه", checkins: 19, percentage: 62 },
    { day: "یکشنبه", checkins: 24, percentage: 78 },
    { day: "دوشنبه", checkins: 16, percentage: 54 },
    { day: "سه‌شنبه", checkins: 26, percentage: 85 },
    { day: "چهارشنبه", checkins: 22, percentage: 71 },
    { day: "پنجشنبه", checkins: 28, percentage: 92 },
    { day: "جمعه", checkins: 8, percentage: 28, is_muted: true },
  ];

  // If monthly is selected, demonstrate monthly distribution
  const monthlyBars = [
    { day: "هفته ۱", checkins: 110, percentage: 74, is_muted: false },
    { day: "هفته ۲", checkins: 125, percentage: 86, is_muted: false },
    { day: "هفته ۳", checkins: 132, percentage: 91, is_muted: false },
    { day: "هفته ۴", checkins: 118, percentage: 79, is_muted: false },
  ];

  const activeBars = period === "week" ? weeklyBars : monthlyBars;

  return (
    <div className="card bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] mb-[18px]">
      {/* Card Head */}
      <div className="flex items-center justify-between p-[20px_22px] border-b border-border flex-wrap gap-3">
        <div>
          <h3 className="text-[16px] font-extrabold text-ink">
            {period === "week" ? "حضور هفتگی شاگردان" : "حضور ماهانه شاگردان"}
          </h3>
          <div className="text-[12.5px] text-ink-faint mt-[3px]">
            {period === "week"
              ? "تعداد جلسات حاضرشده در هر روز هفته"
              : "میانگین حضور شاگردان در ۴ هفته‌ی اخیر"}
          </div>
        </div>

        {/* Segmented Control */}
        <div className="seg flex gap-[4px] bg-bg p-[4px] rounded-[10px]">
          <button
            type="button"
            onClick={() => setPeriod("month")}
            className={cn(
              "text-[12.5px] font-bold py-[6px] px-[12px] rounded-[8px] transition-all duration-180 cursor-pointer",
              period === "month"
                ? "active bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                : "text-ink-faint hover:text-ink"
            )}
          >
            ماه
          </button>
          <button
            type="button"
            onClick={() => setPeriod("week")}
            className={cn(
              "text-[12.5px] font-bold py-[6px] px-[12px] rounded-[8px] transition-all duration-180 cursor-pointer",
              period === "week"
                ? "active bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                : "text-ink-faint hover:text-ink"
            )}
          >
            هفته
          </button>
        </div>
      </div>

      {/* Card Body with Attendance Bars */}
      <div className="p-[22px]">
        <div className="bars flex items-end justify-between gap-[10px] h-[180px] pt-[10px]">
          {activeBars.map((bar) => {
            const isHovered = hoveredDay === bar.day;
            const isMuted = bar.is_muted;
            return (
              <div
                key={bar.day}
                className="bar-col flex-1 flex flex-col items-center gap-[8px] h-full justify-end relative cursor-pointer group"
                onMouseEnter={() => setHoveredDay(bar.day)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {/* Floating Tooltip */}
                <div
                  className={cn(
                    "absolute -top-[30px] z-10 whitespace-nowrap rounded-[8px] bg-ink px-[8px] py-[3px] text-[11px] font-bold text-white shadow-md transition-all duration-200 pointer-events-none",
                    isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                  )}
                >
                  {toPersianDigits(bar.checkins)} حضور (٪{toPersianDigits(bar.percentage)})
                </div>

                {/* Animated Vertical Bar */}
                <div
                  className={cn(
                    "bar w-full max-w-[30px] rounded-t-[8px] transition-all duration-300 group-hover:opacity-85",
                    isMuted
                      ? "muted bg-tint"
                      : "bg-gradient-to-t from-cyan to-primary shadow-[0_4px_12px_rgba(242,92,31,0.15)]"
                  )}
                  style={{ height: `${bar.percentage}%` }}
                />

                {/* Day / Week Label */}
                <div
                  className={cn(
                    "bar-lbl text-[11px] font-semibold transition-colors",
                    isHovered ? "text-ink font-bold" : "text-ink-faint"
                  )}
                >
                  {bar.day}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
