"use client";

import { toPersianDigits } from "@/lib/persian-digits";

interface ClassesKpiProps {
  activeClassesCount?: number;
  activeCoachesCount?: number;
  avgCapacityPercent?: number;
  fullClassesCount?: number;
}

export function ClassesKpi({
  activeClassesCount = 24,
  activeCoachesCount = 8,
  avgCapacityPercent = 82,
  fullClassesCount = 3,
}: ClassesKpiProps) {
  return (
    <div className="mb-[24px] grid grid-cols-1 gap-[16px] min-[520px]:grid-cols-2 min-[1080px]:grid-cols-4">
      {/* 1. Active Weekly Classes */}
      <div className="rounded-[16px] border border-border bg-surface p-[20px_22px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <div className="mb-[12px] flex items-center justify-between">
          <span className="flex h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-tint text-primary-dark kpi-c-orange">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[20px] w-[20px]"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </span>
        </div>
        <div className="text-[28px] font-black tracking-[-0.02em] text-ink">
          {toPersianDigits(activeClassesCount)}
        </div>
        <div className="mt-[4px] text-[13px] text-ink-faint">
          کلاس فعال هفته
        </div>
      </div>

      {/* 2. Active Coaches */}
      <div className="rounded-[16px] border border-border bg-surface p-[20px_22px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <div className="mb-[12px] flex items-center justify-between">
          <span className="flex h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-tint text-primary-dark kpi-c-sky">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[20px] w-[20px]"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </span>
        </div>
        <div className="text-[28px] font-black tracking-[-0.02em] text-ink">
          {toPersianDigits(activeCoachesCount)}
        </div>
        <div className="mt-[4px] text-[13px] text-ink-faint">
          مربی درگیر
        </div>
      </div>

      {/* 3. Average Capacity Rate */}
      <div className="rounded-[16px] border border-border bg-surface p-[20px_22px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <div className="mb-[12px] flex items-center justify-between">
          <span className="flex h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-tint text-primary-dark kpi-c-violet">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[20px] w-[20px]"
            >
              <path d="m9 12 2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </span>
          <span className="rounded-full bg-tint px-[8px] py-[3px] text-[12px] font-bold text-primary-dark">
            ٪۴+
          </span>
        </div>
        <div className="text-[28px] font-black tracking-[-0.02em] text-ink">
          ٪{toPersianDigits(avgCapacityPercent)}
        </div>
        <div className="mt-[4px] text-[13px] text-ink-faint">
          میانگین پُری ظرفیت
        </div>
      </div>

      {/* 4. Full Classes Count */}
      <div className="rounded-[16px] border border-border bg-surface p-[20px_22px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <div className="mb-[12px] flex items-center justify-between">
          <span className="flex h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-[#FFFBEB] text-[#D97706] kpi-c-amber">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[20px] w-[20px]"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </span>
        </div>
        <div className="text-[28px] font-black tracking-[-0.02em] text-ink">
          {toPersianDigits(fullClassesCount)}
        </div>
        <div className="mt-[4px] text-[13px] text-ink-faint">
          کلاس پُر شده
        </div>
      </div>
    </div>
  );
}
