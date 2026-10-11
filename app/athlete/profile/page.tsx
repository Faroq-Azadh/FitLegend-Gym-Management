"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { toPersianDigits } from "@/lib/persian-digits";
import { AthleteSidebar } from "@/components/athlete/athlete-sidebar";
import { AthleteTopbar } from "@/components/athlete/athlete-topbar";

export default function AthleteProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const athleteName = user?.full_name?.trim() || "سارا محمدی";
  const athletePhone = user?.phone_number || "۰۹۱۲۳۴۵۶۷۸۹";
  const athleteEmail = user?.email || "sara.mohammadi@example.com";

  return (
    <div className="app">
      <AthleteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <AthleteTopbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="content">
          <div className="page-head">
            <div>
              <h1>پروفایل ورزشکار</h1>
              <div className="sub">مشخصات هویتی، اطلاعات تماس و شناسه ورزشکاری در باشگاه تیتان</div>
            </div>
            <div className="page-head-actions">
              <Link href="/athlete" className="btn btn-outline btn-sm">
                بازگشت به داشبورد
              </Link>
            </div>
          </div>

          <div className="max-w-2xl">
            <div className="card p-6 mb-6">
              <div className="flex items-center gap-5 pb-6 border-b border-border">
                <div className="w-16 h-16 rounded-[16px] bg-gradient-to-br from-primary to-cyan flex items-center justify-center font-extrabold text-[22px] text-ink shrink-0">
                  سم
                </div>
                <div>
                  <h2 className="text-[20px] font-extrabold text-ink">{athleteName}</h2>
                  <div className="text-[13px] text-primary-dark font-semibold mt-0.5">
                    شناسه عضویت: #TTN-{toPersianDigits("9428")}
                  </div>
                  <div className="text-[12px] text-ink-faint mt-1">عضو رسمی از شهریور ۱۴۰۲</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                <div className="p-3.5 bg-bg rounded-[12px]">
                  <div className="text-[11.5px] text-ink-faint">شماره موبایل</div>
                  <div className="text-[14px] font-bold text-ink mt-1">{toPersianDigits(athletePhone)}</div>
                </div>
                <div className="p-3.5 bg-bg rounded-[12px]">
                  <div className="text-[11.5px] text-ink-faint">پست الکترونیکی</div>
                  <div className="text-[14px] font-bold text-ink mt-1">{athleteEmail}</div>
                </div>
                <div className="p-3.5 bg-bg rounded-[12px]">
                  <div className="text-[11.5px] text-ink-faint">گروه خونی</div>
                  <div className="text-[14px] font-bold text-ink mt-1">O+ (مثبت)</div>
                </div>
                <div className="p-3.5 bg-bg rounded-[12px]">
                  <div className="text-[11.5px] text-ink-faint">شماره تماس اضطراری</div>
                  <div className="text-[14px] font-bold text-ink mt-1">{toPersianDigits("۰۹۱۸۷۶۵۴۳۲۱")} (همسر)</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
