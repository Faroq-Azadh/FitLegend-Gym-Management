"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { toPersianDigits } from "@/lib/persian-digits";
import { AthleteSidebar } from "@/components/athlete/athlete-sidebar";
import { AthleteTopbar } from "@/components/athlete/athlete-topbar";
import { AthleteKpiGrid } from "@/components/athlete/athlete-kpi-grid";
import { AthleteTodayWorkout } from "@/components/athlete/athlete-today-workout";
import { AthleteWeightChart } from "@/components/athlete/athlete-weight-chart";
import { AthleteCoachCard } from "@/components/athlete/athlete-coach-card";
import { AthleteUpcomingClasses } from "@/components/athlete/athlete-upcoming-classes";

export default function AthleteDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [todaySubtext, setTodaySubtext] = useState(
    "امروز روز تمرین سینه و بازوئه — بزن بریم!"
  );

  const { user } = useAuth();
  const firstName = user?.full_name ? user.full_name.trim().split(" ")[0] : "سارا";

  useEffect(() => {
    try {
      const fmt = new Intl.DateTimeFormat("fa-IR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      const formattedDate = fmt.format(new Date());
      setTodaySubtext(
        `${toPersianDigits(formattedDate)} · امروز روز تمرین سینه و بازوئه — بزن بریم!`
      );
    } catch {
      setTodaySubtext("امروز روز تمرین سینه و بازوئه — بزن بریم!");
    }
  }, []);

  return (
    <div className="app">
      {/* Sidebar Navigation */}
      <AthleteSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Area */}
      <div className="main">
        {/* Topbar */}
        <AthleteTopbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Dashboard Content */}
        <main className="content">
          {/* Page Head */}
          <div className="page-head">
            <div>
              <h1>سلام، {firstName} 👋</h1>
              <div className="sub" id="todayDate">
                {todaySubtext}
              </div>
            </div>
            <div className="page-head-actions">
              <Link href="/athlete/program" className="btn btn-outline btn-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 2h6a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2V3a1 1 0 0 1 1-1Z" />
                </svg>
                برنامه‌ی کامل
              </Link>
            </div>
          </div>

          {/* KPI Cards */}
          <AthleteKpiGrid />

          {/* Section 1: Today's Workout & Weight Chart */}
          <div className="grid-2">
            <AthleteTodayWorkout />
            <AthleteWeightChart />
          </div>

          {/* Section 2: Coach & Upcoming Classes */}
          <div className="grid-2b">
            <AthleteCoachCard />
            <AthleteUpcomingClasses />
          </div>
        </main>
      </div>
    </div>
  );
}
