"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useOwnerDashboard } from "@/lib/hooks/queries/use-owner-dashboard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { KpiSection } from "@/components/admin/kpi-section";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { TodayClasses } from "@/components/admin/today-classes";
import { RecentActivity } from "@/components/admin/recent-activity";
import { RecentMembersTable } from "@/components/admin/recent-members-table";

export default function AdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [persianDate, setPersianDate] = useState("امروز · در حال بارگذاری…");
  const { user } = useAuth();
  const { data: dashboard, isLoading } = useOwnerDashboard();

  useEffect(() => {
    try {
      const fmt = new Intl.DateTimeFormat("fa-IR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      setPersianDate(`امروز · ${fmt.format(new Date())}`);
    } catch {
      setPersianDate("داشبورد مدیریت باشگاه");
    }
  }, []);

  const firstName = user?.full_name ? user.full_name.trim().split(" ")[0] : "مدیر عزیز";

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar Header */}
        <AdminTopbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Page Content */}
        <main className="flex-1 p-[18px] min-[640px]:p-[28px]">
          {/* Page Head */}
          <div className="mb-[24px] flex flex-wrap items-end justify-between gap-[16px]">
            <div>
              <h1 className="text-[22px] font-extrabold tracking-[-0.01em] text-ink min-[640px]:text-[26px]">
                سلام {firstName} 👋
              </h1>
              <div className="mt-[5px] text-[14px] text-ink-faint">
                {persianDate}
              </div>
            </div>

            <div className="flex items-center gap-[10px]">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-[8px] whitespace-nowrap rounded-[10px] border-[1.5px] border-border bg-surface px-[14px] py-[8px] text-[13px] font-semibold text-ink transition-all duration-200 hover:border-primary hover:bg-tint"
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
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="M7 10l5 5 5-5M12 15V3" />
                </svg>
                <span>خروجی گزارش</span>
              </button>

              <Link
                href="/admin/classes"
                className="inline-flex items-center justify-center gap-[8px] whitespace-nowrap rounded-[10px] btn-ink-gradient px-[14px] py-[8px] text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-[1px] hover:shadow-emerald"
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
                <span>افزودن رویداد</span>
              </Link>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <KpiSection />

          {/* Chart + Today's classes */}
          <section className="mb-[18px] grid grid-cols-1 gap-[18px] min-[1101px]:grid-cols-[1.6fr_1fr]">
            <RevenueChart />
            <TodayClasses />
          </section>

          {/* Members table + Recent Activity */}
          <section className="grid grid-cols-1 gap-[18px] min-[1101px]:grid-cols-[1fr_1.4fr]">
            <RecentActivity />
            <RecentMembersTable />
          </section>
        </main>
      </div>
    </div>
  );
}
