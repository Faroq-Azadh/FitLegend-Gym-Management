"use client";

import { useMemo } from "react";
import { useMembersData } from "@/lib/members-store";
import { toPersianDigits } from "@/lib/persian-digits";

interface PlanSlice {
  name: string;
  count: number;
  percent: number;
  color: string;
}

const PALETTE = [
  "#F59E0B", // Gold / Amber
  "#D94A10", // Primary Emerald
  "#0EA5E9", // Cyan
  "#6366F1", // Indigo
  "#D97706", // Bronze
  "#EC4899", // Pink
];

export function PlansDonut() {
  const { members, counts } = useMembersData();

  const { slices, totalActive } = useMemo(() => {
    // 1. Group active members by their plan
    const activeMembers = members.filter((m) => m.status === "active");
    const targetMembers = activeMembers.length > 0 ? activeMembers : members;

    if (targetMembers.length === 0) {
      return {
        slices: [
          { name: "ماهانه", count: 0, percent: 0, color: "#F59E0B" },
          { name: "۳ ماهه", count: 0, percent: 0, color: "#D94A10" },
          { name: "۶ ماهه", count: 0, percent: 0, color: "#0EA5E9" },
        ],
        totalActive: 0,
      };
    }

    const planCounts: Record<string, number> = {};
    targetMembers.forEach((m) => {
      const planName = m.plan?.trim() || "ماهانه";
      planCounts[planName] = (planCounts[planName] || 0) + 1;
    });

    const total = targetMembers.length;
    const sortedEntries = Object.entries(planCounts).sort((a, b) => b[1] - a[1]);

    const items: PlanSlice[] = sortedEntries.map(([name, count], idx) => ({
      name,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
      color: PALETTE[idx % PALETTE.length],
    }));

    // Adjust percent so sum is 100 if any members exist
    if (items.length > 0 && total > 0) {
      const sum = items.reduce((acc, it) => acc + it.percent, 0);
      if (sum !== 100 && sum > 0) {
        items[0].percent += 100 - sum;
      }
    }

    return { slices: items, totalActive: total };
  }, [members]);

  let accumulatedPercent = 0;

  return (
    <div className="rounded-[16px] border border-border bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.04)] print-avoid-break">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-[20px_22px]">
        <div>
          <h3 className="text-[16px] font-extrabold text-ink">توزیع پلن‌ها</h3>
          <div className="mt-[3px] text-[12.5px] text-ink-faint">
            اعضای فعال بر اساس اشتراک
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-[22px]">
        <div className="flex flex-wrap items-center justify-center gap-[28px]">
          {/* Donut Circle */}
          <div className="relative h-[160px] w-[160px] shrink-0">
            <svg
              viewBox="0 0 42 42"
              className="h-full w-full -rotate-90 transform"
            >
              {/* Background Track */}
              <circle
                cx="21"
                cy="21"
                r="15.915"
                fill="none"
                stroke="var(--bg)"
                strokeWidth="5"
              />

              {/* Dynamic Slices */}
              {totalActive > 0 ? (
                slices.map((slice, index) => {
                  const strokeDasharray = `${slice.percent} ${100 - slice.percent}`;
                  const strokeDashoffset = -accumulatedPercent;
                  accumulatedPercent += slice.percent;

                  return (
                    <circle
                      key={index}
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="none"
                      stroke={slice.color}
                      strokeWidth="5"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500 hover:opacity-80"
                    />
                  );
                })
              ) : (
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="5"
                  strokeDasharray="100 0"
                />
              )}
            </svg>

            {/* Donut Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="text-[24px] font-extrabold text-ink">
                {toPersianDigits(totalActive)}
              </div>
              <div className="text-[11.5px] font-semibold text-ink-faint">
                عضو فعال
              </div>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="flex flex-col gap-[12px] min-w-[140px]">
            {slices.map((slice, index) => (
              <div key={index} className="flex items-center gap-[10px] text-[13px]">
                <span
                  style={{ backgroundColor: slice.color }}
                  className="h-[10px] w-[10px] shrink-0 rounded-[3px]"
                />
                <span className="font-semibold text-ink-soft">{slice.name}</span>
                <span className="mr-auto font-extrabold text-ink">
                  {toPersianDigits(slice.percent)}٪
                  <span className="mr-[5px] text-[11px] font-normal text-ink-faint">
                    ({toPersianDigits(slice.count)} نفر)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
