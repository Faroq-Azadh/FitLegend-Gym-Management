"use client";

import { useCoachDashboard } from "@/lib/hooks/queries/use-coach-dashboard";
import { toPersianDigits } from "@/lib/persian-digits";

export function CoachKpiGrid() {
  const { data: dashboard, isLoading } = useCoachDashboard();

  const activeStudents = dashboard?.active_students ?? 38;
  const newStudents = dashboard?.new_students_this_month ?? 4;
  const sessionsTotal = dashboard?.sessions_today_total ?? 4;
  const sessionsRemaining = dashboard?.sessions_today_remaining ?? 2;
  const weeklyRate = dashboard?.weekly_attendance_rate ?? 91;
  const weeklyTrend = dashboard?.weekly_attendance_rate_trend ?? 3;
  const messagesCount = dashboard?.unanswered_messages_count ?? 5;

  return (
    <div className="grid grid-cols-1 gap-[18px] min-[641px]:grid-cols-2 min-[1101px]:grid-cols-4 mb-[18px]">
      {/* Card 1: شاگردان فعال */}
      <div className="card kpi p-[20px] flex flex-col gap-[14px] bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
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
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            </svg>
          </span>
          <span className="kpi-trend up inline-flex items-center gap-[4px] rounded-full bg-tint px-[9px] py-[4px] text-[12.5px] font-bold text-primary-dark">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[13px] w-[13px]"
            >
              <path d="m6 15 6-6 6 6" />
            </svg>
            <span>{toPersianDigits(newStudents)} جدید</span>
          </span>
        </div>
        <div className="text-[28px] font-extrabold leading-none text-ink">
          {toPersianDigits(activeStudents)}
        </div>
        <div className="text-[13.5px] font-medium text-ink-soft">
          شاگردان فعال
        </div>
      </div>

      {/* Card 2: جلسات امروز */}
      <div className="card kpi p-[20px] flex flex-col gap-[14px] bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
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
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </span>
          <span className="kpi-trend up inline-flex items-center gap-[4px] rounded-full bg-tint px-[9px] py-[4px] text-[12.5px] font-bold text-primary-dark">
            <span>{toPersianDigits(sessionsRemaining)} مانده</span>
          </span>
        </div>
        <div className="text-[28px] font-extrabold leading-none text-ink">
          {toPersianDigits(sessionsTotal)}
        </div>
        <div className="text-[13.5px] font-medium text-ink-soft">
          جلسات امروز
        </div>
      </div>

      {/* Card 3: نرخ حضور این هفته */}
      <div className="card kpi p-[20px] flex flex-col gap-[14px] bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
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
              <path d="m9 12 2 2 4-4" />
              <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </span>
          <span className="kpi-trend up inline-flex items-center gap-[4px] rounded-full bg-tint px-[9px] py-[4px] text-[12.5px] font-bold text-primary-dark">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[13px] w-[13px]"
            >
              <path d="m6 15 6-6 6 6" />
            </svg>
            <span>٪{toPersianDigits(weeklyTrend)}</span>
          </span>
        </div>
        <div className="text-[28px] font-extrabold leading-none text-ink">
          ٪{toPersianDigits(weeklyRate)}
        </div>
        <div className="text-[13.5px] font-medium text-ink-soft">
          نرخ حضور این هفته
        </div>
      </div>

      {/* Card 4: پیام‌های پاسخ‌نداده */}
      <div className="card kpi p-[20px] flex flex-col gap-[14px] bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <span className="kpi-trend up inline-flex items-center gap-[4px] rounded-full bg-tint px-[9px] py-[4px] text-[12.5px] font-bold text-primary-dark">
            <span>{toPersianDigits(messagesCount)} تازه</span>
          </span>
        </div>
        <div className="text-[28px] font-extrabold leading-none text-ink">
          {toPersianDigits(messagesCount)}
        </div>
        <div className="text-[13.5px] font-medium text-ink-soft">
          پیام‌های پاسخ‌نداده
        </div>
      </div>
    </div>
  );
}
