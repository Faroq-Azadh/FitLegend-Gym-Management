import React from "react";
import { toPersianDigits } from "@/lib/persian-digits";

interface BookingsKpiProps {
  confirmedCount: number;
  pendingCount: number;
  cancelledCount: number;
  todayCount?: string;
}

export function BookingsKpi({
  confirmedCount,
  pendingCount,
  cancelledCount,
  todayCount = "۰",
}: BookingsKpiProps) {
  return (
    <div className="mb-[18px] grid grid-cols-1 gap-[18px] min-[640px]:grid-cols-2 min-[1101px]:grid-cols-4">
      {/* KPI 1: رزرو امروز */}
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
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </span>
        </div>
        <div className="text-[28px] font-extrabold leading-none text-ink">
          {todayCount}
        </div>
        <div className="text-[13.5px] font-medium text-ink-soft">
          رزرو امروز
        </div>
      </div>

      {/* KPI 2: تأییدشده */}
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
        <div className="text-[28px] font-extrabold leading-none text-ink" id="kConf">
          {toPersianDigits(confirmedCount)}
        </div>
        <div className="text-[13.5px] font-medium text-ink-soft">
          تأییدشده
        </div>
      </div>

      {/* KPI 3: در انتظار تأیید */}
      <div className="group flex flex-col gap-[14px] rounded-[16px] border border-border bg-surface p-[20px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between">
          <span className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-[#FFFBEB] text-[#D97706] kpi-c-amber">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[22px] w-[22px]"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </span>
        </div>
        <div className="text-[28px] font-extrabold leading-none text-ink" id="kPend">
          {toPersianDigits(pendingCount)}
        </div>
        <div className="text-[13.5px] font-medium text-ink-soft">
          در انتظار تأیید
        </div>
      </div>

      {/* KPI 4: لغوشده */}
      <div className="group flex flex-col gap-[14px] rounded-[16px] border border-border bg-surface p-[20px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between">
          <span className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-[#FFF1F2] text-[#E11D48] kpi-c-rose">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[22px] w-[22px]"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6M9 9l6 6" />
            </svg>
          </span>
        </div>
        <div className="text-[28px] font-extrabold leading-none text-ink" id="kCanc">
          {toPersianDigits(cancelledCount)}
        </div>
        <div className="text-[13.5px] font-medium text-ink-soft">
          لغوشده
        </div>
      </div>
    </div>
  );
}
