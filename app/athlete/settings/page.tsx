"use client";

import { useState } from "react";
import Link from "next/link";
import { AthleteSidebar } from "@/components/athlete/athlete-sidebar";
import { AthleteTopbar } from "@/components/athlete/athlete-topbar";

export default function AthleteSettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workoutReminder, setWorkoutReminder] = useState(true);
  const [coachMsgAlert, setCoachMsgAlert] = useState(true);
  const [expiryReminder, setExpiryReminder] = useState(true);
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="app">
      <AthleteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <AthleteTopbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="content">
          <div className="page-head">
            <div>
              <h1>تنظیمات حساب کاربری</h1>
              <div className="sub">شخصی‌سازی اعلان‌ها، واحد اندازه‌گیری و ترجیحات پنل</div>
            </div>
            <div className="page-head-actions">
              <button
                type="button"
                onClick={handleSave}
                className="btn btn-primary btn-sm"
              >
                {savedSuccess ? "ذخیره شد ✓" : "ذخیره تغییرات"}
              </button>
            </div>
          </div>

          <div className="max-w-2xl space-y-6">
            {/* Notification settings */}
            <div className="card p-6">
              <h3 className="text-[16px] font-extrabold text-ink mb-1">اعلان‌ها و یادآوری‌ها</h3>
              <p className="text-[12.5px] text-ink-faint mb-5">
                تعیین کنید چه نوع اعلان‌هایی برای شما پیامک یا ارسال شود
              </p>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 rounded-[12px] bg-bg cursor-pointer">
                  <div>
                    <div className="text-[14px] font-bold text-ink">یادآوری ساعت تمرین</div>
                    <div className="text-[12px] text-ink-faint">ارسال اعلان ۱ ساعت قبل از زمان جلسه یا کلاس رزرو شده</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={workoutReminder}
                    onChange={(e) => setWorkoutReminder(e.target.checked)}
                    className="w-5 h-5 accent-primary-dark cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-[12px] bg-bg cursor-pointer">
                  <div>
                    <div className="text-[14px] font-bold text-ink">پیام‌های مربی</div>
                    <div className="text-[12px] text-ink-faint">دریافت اعلان فوری هنگام ارسال پیام جدید از سوی مربی</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={coachMsgAlert}
                    onChange={(e) => setCoachMsgAlert(e.target.checked)}
                    className="w-5 h-5 accent-primary-dark cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-[12px] bg-bg cursor-pointer">
                  <div>
                    <div className="text-[14px] font-bold text-ink">هشدار پایان اشتراک</div>
                    <div className="text-[12px] text-ink-faint">یادآوری ۷ روز قبل از تاریخ اتمام اشتراک باشگاه</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={expiryReminder}
                    onChange={(e) => setExpiryReminder(e.target.checked)}
                    className="w-5 h-5 accent-primary-dark cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Units */}
            <div className="card p-6">
              <h3 className="text-[16px] font-extrabold text-ink mb-1">واحد اندازه‌گیری وزن</h3>
              <p className="text-[12.5px] text-ink-faint mb-4">
                انتخاب واحد نمایش وزن در نمودارها و صفحات تمرین
              </p>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setWeightUnit("kg")}
                  className={`btn btn-sm ${weightUnit === "kg" ? "btn-primary" : "btn-outline"}`}
                >
                  کیلوگرم (kg)
                </button>
                <button
                  type="button"
                  onClick={() => setWeightUnit("lb")}
                  className={`btn btn-sm ${weightUnit === "lb" ? "btn-primary" : "btn-outline"}`}
                >
                  پوند (lb)
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
