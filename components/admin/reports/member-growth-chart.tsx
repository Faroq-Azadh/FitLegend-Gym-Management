"use client";

import { useMemo, useState } from "react";
import { useMembersData } from "@/lib/members-store";
import { toPersianDigits } from "@/lib/persian-digits";
import { cn } from "@/lib/utils";

interface MemberGrowthChartProps {
  range?: "7days" | "30days" | "year";
}

const MONTH_LABELS = [
  { short: "فرو", full: "فروردین" },
  { short: "ارد", full: "اردیبهشت" },
  { short: "خرد", full: "خرداد" },
  { short: "تیر", full: "تیر" },
  { short: "مرد", full: "مرداد" },
  { short: "شهر", full: "شهریور" },
  { short: "مهر", full: "مهر" },
];

const WEEK_DAYS = [
  { short: "ش", full: "شنبه" },
  { short: "ی", full: "یکشنبه" },
  { short: "د", full: "دوشنبه" },
  { short: "س", full: "سه‌شنبه" },
  { short: "چ", full: "چهارشنبه" },
  { short: "پ", full: "پنج‌شنبه" },
  { short: "ج", full: "جمعه" },
];

function getMemberDayIdx(dateStr?: string | null): number {
  if (!dateStr) return (new Date().getDay() + 1) % 7;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return (d.getDay() + 1) % 7;
    }
  } catch {}
  return (new Date().getDay() + 1) % 7;
}

function getMemberMonthIdx(dateStr?: string | null): number {
  if (!dateStr) return 6; // مهر
  try {
    const cleaned = dateStr.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
    if (cleaned.includes("/")) {
      const parts = cleaned.split("/").map(Number);
      if (parts.length >= 2 && parts[1] >= 1 && parts[1] <= 12) {
        return Math.min(6, parts[1] - 1);
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const m = d.getMonth();
      return Math.min(6, Math.max(0, m - 2));
    }
  } catch {}
  return 6;
}

export function MemberGrowthChart({ range = "30days" }: MemberGrowthChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const { members } = useMembersData();

  const chartData = useMemo(() => {
    if (range === "7days") {
      const counts = [0, 0, 0, 0, 0, 0, 0];
      members.forEach((m) => {
        const dayIdx = getMemberDayIdx(m.startDateIso || m.joinDate);
        counts[dayIdx] += 1;
      });

      const maxVal = Math.max(...counts, 1);
      return WEEK_DAYS.map((day, idx) => ({
        label: day.short,
        fullLabel: day.full,
        count: counts[idx],
        percent: counts[idx] > 0 ? Math.max(20, Math.round((counts[idx] / maxVal) * 100)) : 5,
      }));
    }

    // Monthly view
    const counts = [0, 0, 0, 0, 0, 0, 0];
    members.forEach((m) => {
      const mIdx = getMemberMonthIdx(m.startDateIso || m.joinDate);
      counts[mIdx] += 1;
    });

    // If no specific dates were parsed, put members in the current active month (مهر)
    const sum = counts.reduce((a, b) => a + b, 0);
    if (sum === 0 && members.length > 0) {
      counts[6] = members.length;
    }

    const maxVal = Math.max(...counts, 1);
    return MONTH_LABELS.map((m, idx) => ({
      label: m.short,
      fullLabel: m.full,
      count: counts[idx],
      percent: counts[idx] > 0 ? Math.max(20, Math.round((counts[idx] / maxVal) * 100)) : 5,
    }));
  }, [members, range]);

  return (
    <div className="rounded-[16px] border border-border bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.04)] print-avoid-break">
      <div className="flex items-center justify-between border-b border-border p-[20px_22px]">
        <div>
          <h3 className="text-[16px] font-extrabold text-ink">رشد اعضا</h3>
          <div className="mt-[3px] text-[12.5px] text-ink-faint">
            {range === "7days" ? "عضویت جدید روزانه (۷ روز اخیر)" : "عضویت جدید در ماه‌های اخیر"}
          </div>
        </div>
        {hoveredIdx !== null && chartData[hoveredIdx] && (
          <span className="rounded-full bg-tint px-[10px] py-[3px] text-[12px] font-bold text-primary-dark animate-in fade-in duration-150">
            {chartData[hoveredIdx].fullLabel}: {toPersianDigits(chartData[hoveredIdx].count)} عضو
          </span>
        )}
      </div>

      <div className="p-[22px]">
        <div className="flex h-[180px] items-end justify-between gap-[10px] pt-[10px]">
          {chartData.map((col, index) => (
            <div
              key={index}
              className="group flex h-full flex-1 cursor-pointer flex-col items-center justify-end gap-[8px]"
              onMouseEnter={() => setHoveredIdx(index)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Real count above bar */}
              <span
                className={cn(
                  "text-[11px] font-bold transition-all duration-150",
                  col.count > 0 ? "text-primary opacity-100" : "text-ink-faint opacity-50",
                  hoveredIdx === index ? "scale-110" : "",
                )}
              >
                {toPersianDigits(col.count)}
              </span>

              {/* Bar */}
              <div
                style={{ height: `${col.percent}%` }}
                className={cn(
                  "w-full max-w-[32px] rounded-t-[8px] transition-all duration-300",
                  col.count > 0
                    ? "bg-gradient-to-b from-primary to-[#0EA5E9]"
                    : "bg-border/60",
                  hoveredIdx === index ? "brightness-110 shadow-sm" : "group-hover:opacity-85",
                )}
              />

              {/* Label */}
              <span
                className={cn(
                  "text-[11.5px] font-semibold transition-colors duration-150",
                  hoveredIdx === index ? "font-bold text-ink" : "text-ink-faint",
                )}
              >
                {col.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
