"use client";

import React from "react";
import { useCoachesData } from "@/lib/coaches-store";
import { toPersianDigits } from "@/lib/persian-digits";

interface CoachesKpiProps {
  totalCount?: number;
  activeCount?: number;
  avgRating?: string;
  staffCount?: number;
}

export function CoachesKpi({
  totalCount,
  activeCount,
  avgRating,
  staffCount,
}: CoachesKpiProps) {
  const { stats } = useCoachesData();

  const total = totalCount ?? stats.total;
  const active = activeCount ?? stats.active;
  const calculatedAvgRating = avgRating ?? stats.avgRating;
  const staff = staffCount ?? stats.staffCount;

  return (
    <div className="mb-[18px] grid grid-cols-1 gap-[18px] min-[640px]:grid-cols-2 min-[1101px]:grid-cols-4">
      {/* KPI 1: کل مربیان */}
      <div className="group flex flex-col gap-[14px] rounded-[16px] border border-border bg-surface p-[20px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between">
          <span className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-tint text-primary-dark kpi-c-orange">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[22px] w-[22px]"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </span>
        </div>
        <div className="text-[28px] font-extrabold leading-none text-ink">
          {toPersianDigits(total)}
        </div>
        <div className="text-[13.5px] font-medium text-ink-soft">
          کل مربیان
        </div>
      </div>

      {/* KPI 2: فعال */}
      <div className="group flex flex-col gap-[14px] rounded-[16px] border border-border bg-surface p-[20px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between">
          <span className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-tint text-primary-dark kpi-c-sky">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[22px] w-[22px]"
            >
              <path d="m9 12 2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </span>
        </div>
        <div className="text-[28px] font-extrabold leading-none text-ink">
          {toPersianDigits(active)}
        </div>
        <div className="text-[13.5px] font-medium text-ink-soft">
          فعال
        </div>
      </div>

      {/* KPI 3: میانگین امتیاز */}
      <div className="group flex flex-col gap-[14px] rounded-[16px] border border-border bg-surface p-[20px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between">
          <span className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-tint text-primary-dark kpi-c-violet">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[22px] w-[22px]"
            >
              <path d="M12 2 15.09 8.26 22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2Z" />
            </svg>
          </span>
        </div>
        <div className="text-[28px] font-extrabold leading-none text-ink">
          {toPersianDigits(calculatedAvgRating)}
        </div>
        <div className="text-[13.5px] font-medium text-ink-soft">
          میانگین امتیاز
        </div>
      </div>

      {/* KPI 4: کارکنان اداری */}
      <div className="group flex flex-col gap-[14px] rounded-[16px] border border-border bg-surface p-[20px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between">
          <span className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-tint text-primary-dark kpi-c-emerald">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[22px] w-[22px]"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </span>
        </div>
        <div className="text-[28px] font-extrabold leading-none text-ink">
          {toPersianDigits(staff)}
        </div>
        <div className="text-[13.5px] font-medium text-ink-soft">
          کارکنان اداری
        </div>
      </div>
    </div>
  );
}
