"use client";

import { useMemo, useState } from "react";
import { useGymClasses } from "@/lib/hooks/use-gym-classes";
import { toPersianDigits, normalizeDigits } from "@/lib/persian-digits";
import { cn } from "@/lib/utils";

interface PeakHourItem {
  hour: string;
  hourNum: number;
  label: string;
  count: number;
  percent: number;
  isPeak: boolean;
}

const HOURS = [
  { hour: "8", hourNum: 8, label: "۰۸:۰۰" },
  { hour: "10", hourNum: 10, label: "۱۰:۰۰" },
  { hour: "12", hourNum: 12, label: "۱۲:۰۰" },
  { hour: "14", hourNum: 14, label: "۱۴:۰۰" },
  { hour: "17", hourNum: 17, label: "۱۷:۰۰" },
  { hour: "19", hourNum: 19, label: "۱۹:۰۰" },
  { hour: "21", hourNum: 21, label: "۲۱:۰۰" },
];

export function PeakHoursChart() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const { classes } = useGymClasses();

  const peakData: PeakHourItem[] = useMemo(() => {
    // Start with strictly 0 for each hour bucket
    const hourCounts: Record<number, number> = {
      8: 0,
      10: 0,
      12: 0,
      14: 0,
      17: 0,
      19: 0,
      21: 0,
    };

    // Calculate enrolled members per class session by its start time
    classes.forEach((cls) => {
      const start = normalizeDigits(cls.rawStartTime || cls.time || "08:00");
      const h = parseInt(start.split(":")[0], 10) || 8;
      const enrolled = cls.enrolled || 0;

      // Find closest hour bucket
      let closestHour = 8;
      let minDiff = 999;
      HOURS.forEach((bucket) => {
        const diff = Math.abs(bucket.hourNum - h);
        if (diff < minDiff) {
          minDiff = diff;
          closestHour = bucket.hourNum;
        }
      });

      hourCounts[closestHour] = (hourCounts[closestHour] || 0) + enrolled;
    });

    const maxCount = Math.max(...Object.values(hourCounts), 1);

    return HOURS.map((bucket) => {
      const count = hourCounts[bucket.hourNum] || 0;
      const percent = count > 0 ? Math.max(18, Math.round((count / maxCount) * 100)) : 5;
      return {
        hour: bucket.hour,
        hourNum: bucket.hourNum,
        label: bucket.label,
        count,
        percent,
        isPeak: count > 0 && count === maxCount,
      };
    });
  }, [classes]);

  return (
    <div className="rounded-[16px] border border-border bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.04)] print-avoid-break">
      <div className="flex items-center justify-between border-b border-border p-[20px_22px]">
        <div>
          <h3 className="text-[16px] font-extrabold text-ink">ساعات اوج مراجعه</h3>
          <div className="mt-[3px] text-[12.5px] text-ink-faint">
            تراکم حضور در سانس‌ها و کلاس‌ها
          </div>
        </div>
        {hoveredIdx !== null && peakData[hoveredIdx] && (
          <span className="rounded-full bg-tint px-[10px] py-[3px] text-[12px] font-bold text-primary-dark animate-in fade-in duration-150">
            ساعت {toPersianDigits(peakData[hoveredIdx].hour)}: {toPersianDigits(peakData[hoveredIdx].count)} نفر شاگرد/ورودی
          </span>
        )}
      </div>

      <div className="p-[22px]">
        <div className="flex h-[180px] items-end justify-between gap-[10px] pt-[10px]">
          {peakData.map((col, index) => (
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
                  "w-full max-w-[30px] rounded-t-[8px] transition-all duration-300",
                  col.count > 0
                    ? col.isPeak
                      ? "bg-gradient-to-b from-primary to-[#0EA5E9] shadow-sm"
                      : "bg-primary/50 group-hover:bg-primary"
                    : "bg-border/60",
                  hoveredIdx === index ? "brightness-110 shadow-sm" : "",
                )}
              />

              {/* X label */}
              <span
                className={cn(
                  "text-[11.5px] font-semibold transition-colors duration-150",
                  hoveredIdx === index ? "font-bold text-ink" : "text-ink-faint",
                )}
              >
                {toPersianDigits(col.hour)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
