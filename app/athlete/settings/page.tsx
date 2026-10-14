"use client";

import { useState } from "react";
import Link from "next/link";
import { AthleteSidebar } from "@/components/athlete/athlete-sidebar";
import { AthleteTopbar } from "@/components/athlete/athlete-topbar";

type TabKey = "notif" | "security";

export default function AthleteSettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("notif");

  // Notifications State
  const [workoutReminder, setWorkoutReminder] = useState(true);
  const [coachMessage, setCoachMessage] = useState(true);
  const [membershipReminder, setMembershipReminder] = useState(true);
  const [promoEmails, setPromoEmails] = useState(false);

  // Security State
  const [currentPassword, setCurrentPassword] = useState("********");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSaveNotif = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("تنظیمات اعلان‌ها با موفقیت ذخیره شد.");
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      showToast("رمز عبور جدید با تکرار آن مطابقت ندارد.");
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    showToast("رمز عبور با موفقیت به‌روزرسانی شد.");
  };

  return (
    <div className="app">
      <AthleteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <AthleteTopbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="content">
          {/* Page Head */}
          <div className="page-head">
            <div>
              <h1>تنظیمات</h1>
              <div className="sub">مدیریت اعلان‌ها، حریم خصوصی و امنیت حساب</div>
            </div>
          </div>

          {/* Settings Card */}
          <div className="card">
            {/* Tabs Bar: Note: "حساب" tab moved to Profile page per user request */}
            <div className="tabs-bar settings-tabs" id="tabsBar">
              <button
                type="button"
                className={`tab ${activeTab === "notif" ? "active" : ""}`}
                onClick={() => setActiveTab("notif")}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                اعلان‌ها
              </button>
              <button
                type="button"
                className={`tab ${activeTab === "security" ? "active" : ""}`}
                onClick={() => setActiveTab("security")}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                امنیت
              </button>
            </div>

            {/* Panel 1: Notifications */}
            {activeTab === "notif" && (
              <form
                onSubmit={handleSaveNotif}
                className="panel active"
                data-panel="notif"
                style={{ padding: "24px 22px" }}
              >
                <div className="panel-title">اعلان‌ها</div>
                <div className="panel-sub">کنترل اعلان‌هایی که دریافت می‌کنی</div>

                <div className="toggle-row">
                  <div className="meta">
                    <div className="t">یادآوری تمرین</div>
                    <div className="d">اعلان روزهای تمرین</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={workoutReminder}
                      onChange={(e) => setWorkoutReminder(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-row">
                  <div className="meta">
                    <div className="t">پیام مربی</div>
                    <div className="d">اعلان هنگام دریافت پیام</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={coachMessage}
                      onChange={(e) => setCoachMessage(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-row">
                  <div className="meta">
                    <div className="t">یادآوری تمدید عضویت</div>
                    <div className="d">پیش از پایان عضویت</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={membershipReminder}
                      onChange={(e) => setMembershipReminder(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-row">
                  <div className="meta">
                    <div className="t">ایمیل تبلیغاتی</div>
                    <div className="d">پیشنهادها و رویدادهای باشگاه</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={promoEmails}
                      onChange={(e) => setPromoEmails(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div style={{ marginTop: "18px", display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" className="btn btn-primary btn-sm">
                    ذخیره
                  </button>
                </div>
              </form>
            )}

            {/* Panel 2: Security */}
            {activeTab === "security" && (
              <form
                onSubmit={handleUpdatePassword}
                className="panel active"
                data-panel="security"
                style={{ padding: "24px 22px" }}
              >
                <div className="panel-title">امنیت</div>
                <div className="panel-sub">رمز عبور و ورود دو مرحله‌ای</div>

                <div className="form-grid">
                  <div className="field full">
                    <label>رمز عبور فعلی</label>
                    <input
                      className="input"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>رمز عبور جدید</label>
                    <input
                      className="input"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>تکرار رمز جدید</label>
                    <input
                      className="input"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="toggle-row" style={{ marginTop: "14px" }}>
                  <div className="meta">
                    <div className="t">ورود دو مرحله‌ای</div>
                    <div className="d">کد پیامکی هنگام ورود</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={twoFactorAuth}
                      onChange={(e) => setTwoFactorAuth(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div style={{ marginTop: "18px", display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" className="btn btn-primary btn-sm">
                    به‌روزرسانی رمز
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>

      {/* Floating Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-90 bg-ink text-white px-5 py-3 rounded-[14px] shadow-2xl flex items-center gap-3 text-[13.5px] font-bold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
