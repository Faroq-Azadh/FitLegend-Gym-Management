"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useCoachDashboard } from "@/lib/hooks/queries/use-coach-dashboard";
import { useCoachMe } from "@/lib/hooks/queries/use-coaches";
import { CoachSidebar } from "@/components/coach/coach-sidebar";
import { CoachTopbar } from "@/components/coach/coach-topbar";
import { CoachKpiGrid } from "@/components/coach/coach-kpi-grid";
import { CoachTodaySessions } from "@/components/coach/coach-today-sessions";
import { CoachNeedsAttention } from "@/components/coach/coach-needs-attention";
import { CoachWeeklyAttendance } from "@/components/coach/coach-weekly-attendance";
import { CoachTopStudents } from "@/components/coach/coach-top-students";
import { CoachRecentActivity } from "@/components/coach/coach-recent-activity";
import { CoachQuickSessionModal } from "@/components/coach/coach-quick-session-modal";
import { toPersianDigits } from "@/lib/persian-digits";

export default function CoachDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [persianGreeting, setPersianGreeting] = useState("سلام مربی، در حال دریافت برنامه‌ها...");

  const { user } = useAuth();
  const { data: dashboard } = useCoachDashboard();
  const { data: coachMe } = useCoachMe();

  const coachFullName = user?.full_name?.trim() || coachMe?.full_name?.trim();
  const firstName = coachFullName ? coachFullName.split(" ")[0] : "مربی";
  const sessionsCount = dashboard?.sessions_today_total ?? 4;

  useEffect(() => {
    try {
      const fmt = new Intl.DateTimeFormat("fa-IR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      const formattedDate = fmt.format(new Date());
      setPersianGreeting(
        `سلام ${firstName}، ${formattedDate} — امروز ${toPersianDigits(sessionsCount)} جلسه‌ی تمرین داری`
      );
    } catch {
      setPersianGreeting(`سلام ${firstName}، امروز ${toPersianDigits(sessionsCount)} جلسه‌ی تمرین داری`);
    }
  }, [firstName, sessionsCount]);

  return (
    <div className="app flex min-h-screen">
      {/* Sidebar Navigation */}
      <CoachSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="main flex flex-1 flex-col min-w-0">
        {/* Topbar */}
        <CoachTopbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Page Content */}
        <main className="content flex-1 p-[18px] min-[640px]:p-[28px]">
          {/* Page Head */}
          <div className="page-head flex flex-wrap items-end justify-between gap-[16px] mb-[24px]">
            <div>
              <h1 className="text-[22px] min-[640px]:text-[26px] font-extrabold text-ink tracking-[-0.01em]">
                داشبورد
              </h1>
              <div className="sub text-[14px] text-ink-faint mt-[5px]">
                {persianGreeting}
              </div>
            </div>

            {/* Page Head Actions */}
            <div className="page-head-actions flex items-center gap-[10px]">
              <Link
                href="/coach/classes"
                className="btn btn-outline btn-sm"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-[17px] w-[17px]"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <span>تقویم هفته</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary btn-sm"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-[17px] w-[17px]"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>ثبت جلسه</span>
              </button>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <CoachKpiGrid />

          {/* Section 1: Today's Workouts + Needs Attention */}
          <section className="grid grid-cols-1 min-[1101px]:grid-cols-[1.6fr_1fr] gap-[18px] mb-[18px]">
            <CoachTodaySessions />
            <CoachNeedsAttention />
          </section>

          {/* Section 2: Weekly Student Attendance Chart */}
          <CoachWeeklyAttendance />

          {/* Section 3: Top Students + Recent Activity */}
          <section className="grid grid-cols-1 min-[1101px]:grid-cols-[1fr_1.4fr] gap-[18px]">
            <CoachTopStudents />
            <CoachRecentActivity />
          </section>
        </main>
      </div>

      {/* Quick Session Modal */}
      <CoachQuickSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
