"use client";

import { useState } from "react";
import Link from "next/link";
import { AthleteSidebar } from "@/components/athlete/athlete-sidebar";
import { AthleteTopbar } from "@/components/athlete/athlete-topbar";
import { AthleteWeightChart } from "@/components/athlete/athlete-weight-chart";

interface MetricItem {
  label: string;
  current: string;
  initial: string;
  change: string;
  isPositive: boolean;
}

const BODY_METRICS: MetricItem[] = [
  { label: "وزن بدن", current: "۶۸ کیلوگرم", initial: "۷۴ کیلوگرم", change: "−۶ کیلو", isPositive: true },
  { label: "درصد چربی", current: "۱۸.۵٪", initial: "۲۴.۰٪", change: "−۵.۵٪", isPositive: true },
  { label: "دور کمر", current: "۷۸ سانتی‌متر", initial: "۸۵ سانتی‌متر", change: "−۷ سانت", isPositive: true },
  { label: "دور بازو", current: "۳۴ سانتی‌متر", initial: "۳۱ سانتی‌متر", change: "+۳ سانت", isPositive: true },
  { label: "دور سینه", current: "۹۶ سانتی‌متر", initial: "۹۲ سانتی‌متر", change: "+۴ سانت", isPositive: true },
];

const PERSONAL_RECORDS = [
  { exercise: "پرس سینه هالتر", record: "۶۵ کیلوگرم", date: "۲ هفته پیش" },
  { exercise: "اسکوات هالتر", record: "۸۵ کیلوگرم", date: "هفته گذشته" },
  { exercise: "ددلیفت رومانیایی", record: "۹۰ کیلوگرم", date: "۳ هفته پیش" },
];

export default function AthleteProgressPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app">
      <AthleteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <AthleteTopbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="content">
          <div className="page-head">
            <div>
              <h1>پیشرفت من</h1>
              <div className="sub">نمودارها و آمار تغییرات فیزیکی و رکوردهای تمرینی</div>
            </div>
            <div className="page-head-actions">
              <Link href="/athlete" className="btn btn-outline btn-sm">
                داشبورد
              </Link>
            </div>
          </div>

          {/* Top Weight Chart */}
          <div className="mb-6">
            <AthleteWeightChart />
          </div>

          <div className="grid-2">
            {/* Body Metrics Card */}
            <div className="card">
              <div className="card-head">
                <div>
                  <h3>سنجش ترکیب بدنی (InBody)</h3>
                  <div className="hint">مقایسه دوره جاری با دوره اول</div>
                </div>
                <span className="pill">بروزرسانی: ۲ هفته پیش</span>
              </div>
              <div className="card-body">
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>شاخص</th>
                        <th>شروع دوره</th>
                        <th>وضعیت فعلی</th>
                        <th>میزان تغییر</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BODY_METRICS.map((m, idx) => (
                        <tr key={idx}>
                          <td className="font-bold text-ink">{m.label}</td>
                          <td>{m.initial}</td>
                          <td className="font-bold text-ink">{m.current}</td>
                          <td>
                            <span className="kpi-trend up">{m.change}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Personal Records Card */}
            <div className="card">
              <div className="card-head">
                <div>
                  <h3>رکوردهای فردی (PR)</h3>
                  <div className="hint">بیشترین وزنه‌های ثبت‌شده در تمرین</div>
                </div>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {PERSONAL_RECORDS.map((pr, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 rounded-[12px] bg-bg border border-border"
                    >
                      <div>
                        <div className="font-bold text-ink text-[14.5px]">{pr.exercise}</div>
                        <div className="text-[12px] text-ink-faint mt-0.5">{pr.date}</div>
                      </div>
                      <div className="text-[16px] font-extrabold text-primary-dark bg-tint px-3 py-1 rounded-[10px]">
                        {pr.record}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
