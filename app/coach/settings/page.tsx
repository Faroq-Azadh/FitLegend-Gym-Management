"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { CoachSidebar } from "@/components/coach/coach-sidebar";
import { CoachTopbar } from "@/components/coach/coach-topbar";
import { toPersianDigits } from "@/lib/persian-digits";
import { cn } from "@/lib/utils";
import {
  Bell,
  Clock,
  CheckCircle2,
  Lock,
  Sliders,
  User,
  Check,
  AlertCircle,
  Monitor,
  Smartphone,
  Laptop,
} from "lucide-react";

interface WorkingDay {
  on: boolean;
  from: string;
  to: string;
}

interface ActiveDevice {
  id: string;
  name: string;
  isCurrent: boolean;
  time: string;
  icon: "monitor" | "phone" | "laptop";
}

export default function CoachSettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"notif" | "hours" | "rules" | "security" | "pref">("notif");

  // Toast state
  const [toastMessage, setToastMessage] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToastMessage({ msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Form State
  const initialFormState = {
    // 1. Notifications Matrix
    n_session_reminder_app: true,
    n_session_reminder_sms: true,
    n_session_reminder_email: false,
    n_student_message_app: true,
    n_student_message_sms: false,
    n_student_message_email: false,
    n_booking_app: true,
    n_booking_sms: false,
    n_booking_email: false,
    n_attendance_app: true,
    n_attendance_sms: true,
    n_attendance_email: false,
    n_membership_app: true,
    n_membership_sms: false,
    n_membership_email: true,
    n_weekly_report_app: false,
    n_weekly_report_sms: false,
    n_weekly_report_email: true,
    quiet_hours: true,

    // 2. Working Hours
    wh: [
      { on: true, from: "08:00", to: "20:30" }, // Sat
      { on: true, from: "08:00", to: "20:30" }, // Sun
      { on: true, from: "08:00", to: "20:30" }, // Mon
      { on: true, from: "08:00", to: "20:30" }, // Tue
      { on: true, from: "08:00", to: "20:30" }, // Wed
      { on: true, from: "07:00", to: "13:00" }, // Thu
      { on: false, from: "08:00", to: "20:30" }, // Fri
    ] as WorkingDay[],
    accept_private: true,
    buffer_minutes: "10",
    max_private_per_day: 5,

    // 3. Class Rules
    default_capacity: 15,
    default_duration: 60,
    cancel_window_hours: "2",
    late_threshold_minutes: 10,
    attendance_lock_days: "3",
    absence_alert_count: 3,
    auto_checkin_qr: false,
    allow_expired: false,
    waitlist: true,

    // 4. Security
    two_step: true,

    // 5. Preferences
    language: "fa",
    calendar: "jalali",
    week_start: "sat",
    time_format: "24",
    weight_unit: "kg",
    landing: "dash",
    persian_digits: true,
  };

  const [form, setForm] = useState(initialFormState);
  const [savedFormSnapshot, setSavedFormSnapshot] = useState(JSON.stringify(initialFormState));

  // Password Box State
  const [pwBoxOpen, setPwBoxOpen] = useState(false);
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [hasPasswordSet, setHasPasswordSet] = useState(false);

  // Active Devices State
  const [devices, setDevices] = useState<ActiveDevice[]>([
    { id: "d1", name: "Chrome · ویندوز", isCurrent: true, time: "سنندج · هم‌اکنون فعال", icon: "monitor" },
    { id: "d2", name: "Safari · آیفون", isCurrent: false, time: "سنندج · ۳ ساعت پیش", icon: "phone" },
    { id: "d3", name: "Firefox · لینوکس", isCurrent: false, time: "تهران · ۵ روز پیش", icon: "laptop" },
  ]);

  // Deep-link via URL hash
  useEffect(() => {
    if (typeof window !== "undefined") {
      const h = window.location.hash.slice(1);
      if (h === "notif" || h === "hours" || h === "rules" || h === "security" || h === "pref") {
        setActiveTab(h);
      }
    }
  }, []);

  const switchTab = (tab: "notif" | "hours" | "rules" | "security" | "pref") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${tab}`);
    }
  };

  // Dirty detection
  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== savedFormSnapshot;
  }, [form, savedFormSnapshot]);

  // Working day names in Saturday=0 order
  const DAY_NAMES = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

  // Handlers for working hours
  const updateWhDay = (idx: number, field: keyof WorkingDay, val: any) => {
    setForm((prev) => {
      const nextWh = [...prev.wh];
      nextWh[idx] = { ...nextWh[idx], [field]: val };
      return { ...prev, wh: nextWh };
    });
  };

  // Form submit / save validation
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validate working hours
    for (let i = 0; i < 7; i++) {
      const item = form.wh[i];
      if (item.on && (!item.from || !item.to || item.from >= item.to)) {
        switchTab("hours");
        showToast("ساعت پایان باید بعد از ساعت شروع باشد", "err");
        return;
      }
    }

    // Validate capacity & duration
    const cap = form.default_capacity;
    const dur = form.default_duration;
    if (!(cap >= 1 && cap <= 100) || !(dur >= 15 && dur <= 180)) {
      switchTab("rules");
      showToast("ظرفیت یا مدت پیش‌فرض خارج از بازه‌ی مجاز است", "err");
      return;
    }

    setSavedFormSnapshot(JSON.stringify(form));
    showToast("تنظیمات ذخیره شد");
  };

  const handleDiscard = () => {
    setForm(JSON.parse(savedFormSnapshot));
    showToast("تغییرات لغو شد");
  };

  // Password submission
  const handleSavePassword = () => {
    if (pw1.length < 8) {
      setPwErr("رمز عبور باید حداقل ۸ کاراکتر باشد");
      return;
    }
    if (pw1 !== pw2) {
      setPwErr("تکرار رمز با رمز جدید یکسان نیست");
      return;
    }
    setPwErr("");
    setPwBoxOpen(false);
    setPw1("");
    setPw2("");
    setHasPasswordSet(true);
    showToast("رمز عبور ذخیره شد");
  };

  // Devices actions
  const handleRevokeDevice = (id: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    showToast("دستگاه از حساب خارج شد");
  };

  const handleRevokeAllOtherDevices = () => {
    setDevices((prev) => prev.filter((d) => d.isCurrent));
    showToast("از همه‌ی دستگاه‌های دیگر خارج شدی");
  };

  return (
    <div className="app flex min-h-screen">
      <CoachSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main flex flex-1 flex-col min-w-0">
        <CoachTopbar onToggleSidebar={() => setSidebarOpen((p) => !p)} />

        <main className="content flex-1 p-[18px] min-[640px]:p-[28px]">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="toast-wrap" aria-live="polite">
              <div className={cn("toast", toastMessage.type === "err" && "err")}>
                {toastMessage.type === "err" ? (
                  <AlertCircle className="h-[18px] w-[18px] text-[#FB7185] shrink-0" />
                ) : (
                  <Check className="h-[18px] w-[18px] text-primary shrink-0 stroke-[2.2]" />
                )}
                <span>{toastMessage.msg}</span>
              </div>
            </div>
          )}

          {/* Page Head */}
          <div className="page-head flex flex-wrap items-end justify-between gap-[16px] mb-[24px]">
            <div>
              <h1 className="text-[22px] min-[640px]:text-[26px] font-extrabold text-ink tracking-tight">
                تنظیمات
              </h1>
              <div className="sub text-[14px] text-ink-faint mt-[5px]">
                اعلان‌ها، ساعات کاری، قوانین کلاس و امنیت حساب مربی
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} noValidate autoComplete="off">
            <div className="card bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] overflow-hidden">
              {/* Tabs Bar */}
              <div className="tabs-bar flex gap-1 bg-bg p-[5px] rounded-[12px] m-[20px_22px_0] flex-wrap" role="tablist">
                <button
                  type="button"
                  onClick={() => switchTab("notif")}
                  className={cn("tab", activeTab === "notif" && "active")}
                  role="tab"
                  aria-selected={activeTab === "notif"}
                >
                  <Bell className="h-4 w-4" />
                  <span>اعلان‌ها</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchTab("hours")}
                  className={cn("tab", activeTab === "hours" && "active")}
                  role="tab"
                  aria-selected={activeTab === "hours"}
                >
                  <Clock className="h-4 w-4" />
                  <span>ساعات کاری</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchTab("rules")}
                  className={cn("tab", activeTab === "rules" && "active")}
                  role="tab"
                  aria-selected={activeTab === "rules"}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>قوانین کلاس و حضور</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchTab("security")}
                  className={cn("tab", activeTab === "security" && "active")}
                  role="tab"
                  aria-selected={activeTab === "security"}
                >
                  <Lock className="h-4 w-4" />
                  <span>امنیت</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchTab("pref")}
                  className={cn("tab", activeTab === "pref" && "active")}
                  role="tab"
                  aria-selected={activeTab === "pref"}
                >
                  <Sliders className="h-4 w-4" />
                  <span>ترجیحات</span>
                </button>
              </div>

              {/* PANEL 1: اعلان‌ها (Notifications) */}
              {activeTab === "notif" && (
                <div className="panel active block p-[24px_22px]">
                  {/* Link Card to Coach Profile */}
                  <div className="link-card">
                    <span className="ic">
                      <User className="h-5 w-5" />
                    </span>
                    <div className="tx">
                      نام، عکس، تخصص‌ها و گواهی‌ها در پروفایل مربی ویرایش می‌شود
                      <span>اینجا فقط تنظیمات کاری و حساب را مدیریت می‌کنی.</span>
                    </div>
                    <Link href="/coach/profile" className="btn btn-outline btn-sm">
                      رفتن به پروفایل
                    </Link>
                  </div>

                  <div className="panel-title text-[15px] font-extrabold text-ink mb-1">
                    اعلان‌ها
                  </div>
                  <div className="panel-sub text-[13px] text-ink-faint mb-5">
                    برای هر رویداد مشخص کن از کدام کانال خبر بگیری
                  </div>

                  {/* Notification Matrix Table */}
                  <div className="table-wrap overflow-x-auto">
                    <table className="matrix">
                      <thead>
                        <tr>
                          <th>رویداد</th>
                          <th>اپ</th>
                          <th>پیامک</th>
                          <th>ایمیل</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* 1. یادآوری جلسه */}
                        <tr>
                          <td>
                            <div className="t">یادآوری جلسه</div>
                            <div className="d">قبل از شروع هر کلاس یا جلسه‌ی تمرین</div>
                          </td>
                          <td>
                            <label className="chk">
                              <input
                                type="checkbox"
                                checked={form.n_session_reminder_app}
                                onChange={(e) => setForm({ ...form, n_session_reminder_app: e.target.checked })}
                                aria-label="یادآوری جلسه - اپ"
                              />
                              <span><Check /></span>
                            </label>
                          </td>
                          <td>
                            <label className="chk">
                              <input
                                type="checkbox"
                                checked={form.n_session_reminder_sms}
                                onChange={(e) => setForm({ ...form, n_session_reminder_sms: e.target.checked })}
                                aria-label="یادآوری جلسه - پیامک"
                              />
                              <span><Check /></span>
                            </label>
                          </td>
                          <td>
                            <label className="chk">
                              <input
                                type="checkbox"
                                checked={form.n_session_reminder_email}
                                onChange={(e) => setForm({ ...form, n_session_reminder_email: e.target.checked })}
                                aria-label="یادآوری جلسه - ایمیل"
                              />
                              <span><Check /></span>
                            </label>
                          </td>
                        </tr>

                        {/* 2. پیام شاگردان */}
                        <tr>
                          <td>
                            <div className="t">پیام شاگردان</div>
                            <div className="d">هنگام دریافت پیام جدید</div>
                          </td>
                          <td>
                            <label className="chk">
                              <input
                                type="checkbox"
                                checked={form.n_student_message_app}
                                onChange={(e) => setForm({ ...form, n_student_message_app: e.target.checked })}
                                aria-label="پیام شاگردان - اپ"
                              />
                              <span><Check /></span>
                            </label>
                          </td>
                          <td>
                            <label className="chk">
                              <input
                                type="checkbox"
                                checked={form.n_student_message_sms}
                                onChange={(e) => setForm({ ...form, n_student_message_sms: e.target.checked })}
                                aria-label="پیام شاگردان - پیامک"
                              />
                              <span><Check /></span>
                            </label>
                          </td>
                          <td>
                            <label className="chk">
                              <input
                                type="checkbox"
                                checked={form.n_student_message_email}
                                onChange={(e) => setForm({ ...form, n_student_message_email: e.target.checked })}
                                aria-label="پیام شاگردان - ایمیل"
                              />
                              <span><Check /></span>
                            </label>
                          </td>
                        </tr>

                        {/* 3. رزرو و لغو کلاس */}
                        <tr>
                          <td>
                            <div className="t">رزرو و لغو کلاس</div>
                            <div className="d">وقتی شاگردی در کلاس ثبت‌نام یا لغو می‌کند</div>
                          </td>
                          <td>
                            <label className="chk">
                              <input
                                type="checkbox"
                                checked={form.n_booking_app}
                                onChange={(e) => setForm({ ...form, n_booking_app: e.target.checked })}
                                aria-label="رزرو و لغو کلاس - اپ"
                              />
                              <span><Check /></span>
                            </label>
                          </td>
                          <td>
                            <label className="chk">
                              <input
                                type="checkbox"
                                checked={form.n_booking_sms}
                                onChange={(e) => setForm({ ...form, n_booking_sms: e.target.checked })}
                                aria-label="رزرو و لغو کلاس - پیامک"
                              />
                              <span><Check /></span>
                            </label>
                          </td>
                          <td>
                            <label className="chk">
                              <input
                                type="checkbox"
                                checked={form.n_booking_email}
                                onChange={(e) => setForm({ ...form, n_booking_email: e.target.checked })}
                                aria-label="رزرو و لغو کلاس - ایمیل"
                              />
                              <span><Check /></span>
                            </label>
                          </td>
                        </tr>

                        {/* 4. یادآوری ثبت حضور و غیاب */}
                        <tr>
                          <td>
                            <div className="t">یادآوری ثبت حضور و غیاب</div>
                            <div className="d">اگر پایان کلاس، حضور ثبت نشده باشد</div>
                          </td>
                          <td>
                            <label className="chk">
                              <input
                                type="checkbox"
                                checked={form.n_attendance_app}
                                onChange={(e) => setForm({ ...form, n_attendance_app: e.target.checked })}
                                aria-label="یادآوری ثبت حضور - اپ"
                              />
                              <span><Check /></span>
                            </label>
                          </td>
                          <td>
                            <label className="chk">
                              <input
                                type="checkbox"
                                checked={form.n_attendance_sms}
                                onChange={(e) => setForm({ ...form, n_attendance_sms: e.target.checked })}
                                aria-label="یادآوری ثبت حضور - پیامک"
                              />
                              <span><Check /></span>
                            </label>
                          </td>
                          <td>
                            <label className="chk">
                              <input
                                type="checkbox"
                                checked={form.n_attendance_email}
                                onChange={(e) => setForm({ ...form, n_attendance_email: e.target.checked })}
                                aria-label="یادآوری ثبت حضور - ایمیل"
                              />
                              <span><Check /></span>
                            </label>
                          </td>
                        </tr>

                        {/* 5. پایان عضویت شاگرد */}
                        <tr>
                          <td>
                            <div className="t">پایان عضویت شاگرد</div>
                            <div className="d">چند روز قبل از انقضای عضویت شاگردان</div>
                          </td>
                          <td>
                            <label className="chk">
                              <input
                                type="checkbox"
                                checked={form.n_membership_app}
                                onChange={(e) => setForm({ ...form, n_membership_app: e.target.checked })}
                                aria-label="پایان عضویت شاگرد - اپ"
                              />
                              <span><Check /></span>
                            </label>
                          </td>
                          <td>
                            <label className="chk">
                              <input
                                type="checkbox"
                                checked={form.n_membership_sms}
                                onChange={(e) => setForm({ ...form, n_membership_sms: e.target.checked })}
                                aria-label="پایان عضویت شاگرد - پیامک"
                              />
                              <span><Check /></span>
                            </label>
                          </td>
                          <td>
                            <label className="chk">
                              <input
                                type="checkbox"
                                checked={form.n_membership_email}
                                onChange={(e) => setForm({ ...form, n_membership_email: e.target.checked })}
                                aria-label="پایان عضویت شاگرد - ایمیل"
                              />
                              <span><Check /></span>
                            </label>
                          </td>
                        </tr>

                        {/* 6. گزارش هفتگی */}
                        <tr>
                          <td>
                            <div className="t">گزارش هفتگی</div>
                            <div className="d">خلاصه‌ی حضور و پیشرفت شاگردان</div>
                          </td>
                          <td>
                            <label className="chk">
                              <input
                                type="checkbox"
                                checked={form.n_weekly_report_app}
                                onChange={(e) => setForm({ ...form, n_weekly_report_app: e.target.checked })}
                                aria-label="گزارش هفتگی - اپ"
                              />
                              <span><Check /></span>
                            </label>
                          </td>
                          <td>
                            <label className="chk">
                              <input
                                type="checkbox"
                                checked={form.n_weekly_report_sms}
                                onChange={(e) => setForm({ ...form, n_weekly_report_sms: e.target.checked })}
                                aria-label="گزارش هفتگی - پیامک"
                              />
                              <span><Check /></span>
                            </label>
                          </td>
                          <td>
                            <label className="chk">
                              <input
                                type="checkbox"
                                checked={form.n_weekly_report_email}
                                onChange={(e) => setForm({ ...form, n_weekly_report_email: e.target.checked })}
                                aria-label="گزارش هفتگی - ایمیل"
                              />
                              <span><Check /></span>
                            </label>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Quiet Hours Switch */}
                  <div className="toggle-row" style={{ marginTop: "12px" }}>
                    <div className="meta">
                      <div className="t">حالت مزاحم نشوید (۲۲:۰۰ تا ۰۷:۰۰)</div>
                      <div className="d">در این بازه فقط اعلان‌های فوری ارسال می‌شود و پیامک قطع است</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={form.quiet_hours}
                        onChange={(e) => setForm({ ...form, quiet_hours: e.target.checked })}
                        aria-label="حالت مزاحم نشوید"
                      />
                      <span className="slider" />
                    </label>
                  </div>
                </div>
              )}

              {/* PANEL 2: ساعات کاری (Working Hours) */}
              {activeTab === "hours" && (
                <div className="panel active block p-[24px_22px]">
                  <div className="panel-title text-[15px] font-extrabold text-ink mb-1">
                    ساعات کاری هفتگی
                  </div>
                  <div className="panel-sub text-[13px] text-ink-faint mb-5">
                    شاگردان فقط در این بازه‌ها می‌توانند جلسه‌ی خصوصی درخواست کنند
                  </div>

                  {/* 7 Days Working Hours List */}
                  <div>
                    {form.wh.map((item, i) => (
                      <div key={i} className={cn("wh-row", !item.on && "is-off")}>
                        <div className="wh-day">
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={item.on}
                              onChange={(e) => updateWhDay(i, "on", e.target.checked)}
                              aria-label={`${DAY_NAMES[i]} فعال`}
                            />
                            <span className="slider" />
                          </label>
                          <span>{DAY_NAMES[i]}</span>
                        </div>
                        <div className="wh-times">
                          <input
                            className="input"
                            type="time"
                            value={item.from}
                            onChange={(e) => updateWhDay(i, "from", e.target.value)}
                            aria-label={`شروع ${DAY_NAMES[i]}`}
                          />
                          <span className="sep">تا</span>
                          <input
                            className="input"
                            type="time"
                            value={item.to}
                            onChange={(e) => updateWhDay(i, "to", e.target.value)}
                            aria-label={`پایان ${DAY_NAMES[i]}`}
                          />
                          <span className="off">تعطیل</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Accept Private Sessions */}
                  <div className="toggle-row" style={{ marginTop: "12px" }}>
                    <div className="meta">
                      <div className="t">پذیرش درخواست جلسه‌ی خصوصی</div>
                      <div className="d">اگر خاموش باشد، شاگردان نمی‌توانند از پروفایلت درخواست جلسه بدهند</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={form.accept_private}
                        onChange={(e) => setForm({ ...form, accept_private: e.target.checked })}
                        aria-label="پذیرش درخواست جلسه خصوصی"
                      />
                      <span className="slider" />
                    </label>
                  </div>

                  {/* Form Grid */}
                  <div className="form-grid" style={{ marginTop: "16px" }}>
                    <div className="field">
                      <label htmlFor="buf">فاصله بین جلسه‌ها</label>
                      <select
                        className="input"
                        id="buf"
                        value={form.buffer_minutes}
                        onChange={(e) => setForm({ ...form, buffer_minutes: e.target.value })}
                      >
                        <option value="0">بدون فاصله</option>
                        <option value="10">۱۰ دقیقه</option>
                        <option value="15">۱۵ دقیقه</option>
                        <option value="30">۳۰ دقیقه</option>
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="maxd">حداکثر جلسه‌ی خصوصی در روز</label>
                      <input
                        className="input"
                        id="maxd"
                        type="number"
                        min="1"
                        max="12"
                        value={form.max_private_per_day}
                        onChange={(e) =>
                          setForm({ ...form, max_private_per_day: parseInt(e.target.value, 10) || 1 })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 3: قوانین کلاس و حضور (Class & Attendance Rules) */}
              {activeTab === "rules" && (
                <div className="panel active block p-[24px_22px]">
                  <div className="panel-title text-[15px] font-extrabold text-ink mb-1">
                    قوانین کلاس و حضور
                  </div>
                  <div className="panel-sub text-[13px] text-ink-faint mb-5">
                    مقدارهای پیش‌فرض برای کلاس‌هایی که می‌سازی
                  </div>

                  <div className="form-grid">
                    <div className="field">
                      <label htmlFor="cap">ظرفیت پیش‌فرض کلاس جدید</label>
                      <input
                        className="input"
                        id="cap"
                        type="number"
                        min="1"
                        max="100"
                        value={form.default_capacity}
                        onChange={(e) =>
                          setForm({ ...form, default_capacity: parseInt(e.target.value, 10) || 1 })
                        }
                      />
                      <span className="fhint">هنگام ساخت کلاس قابل تغییر است</span>
                    </div>

                    <div className="field">
                      <label htmlFor="dur">مدت پیش‌فرض (دقیقه)</label>
                      <input
                        className="input"
                        id="dur"
                        type="number"
                        min="15"
                        max="180"
                        step="5"
                        value={form.default_duration}
                        onChange={(e) =>
                          setForm({ ...form, default_duration: parseInt(e.target.value, 10) || 15 })
                        }
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="cancel">مهلت لغو رزرو توسط شاگرد</label>
                      <select
                        className="input"
                        id="cancel"
                        value={form.cancel_window_hours}
                        onChange={(e) => setForm({ ...form, cancel_window_hours: e.target.value })}
                      >
                        <option value="0">هر زمان</option>
                        <option value="2">تا ۲ ساعت قبل</option>
                        <option value="6">تا ۶ ساعت قبل</option>
                        <option value="12">تا ۱۲ ساعت قبل</option>
                        <option value="24">تا ۲۴ ساعت قبل</option>
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="late">حداکثر تأخیر مجاز (دقیقه)</label>
                      <input
                        className="input"
                        id="late"
                        type="number"
                        min="0"
                        max="60"
                        value={form.late_threshold_minutes}
                        onChange={(e) =>
                          setForm({ ...form, late_threshold_minutes: parseInt(e.target.value, 10) || 0 })
                        }
                      />
                      <span className="fhint">بعد از این زمان، ورود شاگرد «تأخیر» حساب می‌شود</span>
                    </div>

                    <div className="field">
                      <label htmlFor="lock">قفل ویرایش حضور و غیاب</label>
                      <select
                        className="input"
                        id="lock"
                        value={form.attendance_lock_days}
                        onChange={(e) => setForm({ ...form, attendance_lock_days: e.target.value })}
                      >
                        <option value="0">هرگز</option>
                        <option value="1">۱ روز بعد از کلاس</option>
                        <option value="3">۳ روز بعد از کلاس</option>
                        <option value="7">۷ روز بعد از کلاس</option>
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="noshow">غیبت پیاپی برای هشدار</label>
                      <input
                        className="input"
                        id="noshow"
                        type="number"
                        min="1"
                        max="10"
                        value={form.absence_alert_count}
                        onChange={(e) =>
                          setForm({ ...form, absence_alert_count: parseInt(e.target.value, 10) || 1 })
                        }
                      />
                    </div>
                  </div>

                  {/* QR Auto Checkin */}
                  <div className="toggle-row" style={{ marginTop: "16px" }}>
                    <div className="meta">
                      <div className="t">ورود شاگرد با QR باشگاه</div>
                      <div className="d">حضور شاگردان هنگام اسکن QR در ورودی، خودکار «حاضر» ثبت شود</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={form.auto_checkin_qr}
                        onChange={(e) => setForm({ ...form, auto_checkin_qr: e.target.checked })}
                        aria-label="ثبت خودکار با QR"
                      />
                      <span className="slider" />
                    </label>
                  </div>

                  {/* Allow Expired Attendance */}
                  <div className="toggle-row">
                    <div className="meta">
                      <div className="t">اجازه‌ی حضور با عضویت منقضی</div>
                      <div className="d">اگر خاموش باشد، شاگرد با عضویت منقضی در لیست حضور هشدار می‌گیرد</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={form.allow_expired}
                        onChange={(e) => setForm({ ...form, allow_expired: e.target.checked })}
                        aria-label="حضور با عضویت منقضی"
                      />
                      <span className="slider" />
                    </label>
                  </div>

                  {/* Waitlist */}
                  <div className="toggle-row">
                    <div className="meta">
                      <div className="t">لیست انتظار خودکار</div>
                      <div className="d">وقتی کلاس پُر است، شاگردان در صف انتظار قرار می‌گیرند و با لغو یک نفر خبر می‌شوند</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={form.waitlist}
                        onChange={(e) => setForm({ ...form, waitlist: e.target.checked })}
                        aria-label="لیست انتظار"
                      />
                      <span className="slider" />
                    </label>
                  </div>
                </div>
              )}

              {/* PANEL 4: امنیت (Security) */}
              {activeTab === "security" && (
                <div className="panel active block p-[24px_22px]">
                  <div className="panel-title text-[15px] font-extrabold text-ink mb-1">
                    امنیت حساب
                  </div>
                  <div className="panel-sub text-[13px] text-ink-faint mb-5">
                    ورود تو با کد پیامکی (OTP) انجام می‌شود؛ رمز عبور اختیاری است
                  </div>

                  {/* Phone Line */}
                  <div className="info-line">
                    <div className="meta">
                      <div className="t">
                        شماره‌ی موبایل <span className="tag">تأیید شده</span>
                      </div>
                      <div className="d" dir="ltr" style={{ textAlign: "right" }}>
                        ۰۹۱۸ ۱۲۳ ۴۵۶۷
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast("کد تأیید به شماره‌ی فعلی ارسال می‌شود (نمونه)")}
                      className="btn btn-outline btn-sm cursor-pointer"
                    >
                      تغییر شماره
                    </button>
                  </div>

                  {/* Password Line */}
                  <div className="info-line">
                    <div className="meta">
                      <div className="t">
                        رمز عبور{" "}
                        <span className={cn("tag", !hasPasswordSet && "gray")}>
                          {hasPasswordSet ? "تنظیم شده" : "تنظیم نشده"}
                        </span>
                      </div>
                      <div className="d">با تنظیم رمز، علاوه بر کد پیامکی می‌توانی با رمز هم وارد شوی</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPwBoxOpen((p) => !p)}
                      className="btn btn-outline btn-sm cursor-pointer"
                    >
                      {hasPasswordSet ? "تغییر رمز عبور" : "تنظیم رمز عبور"}
                    </button>
                  </div>

                  {/* Password Toggle Box */}
                  <div className={cn("pw-box", pwBoxOpen && "show")}>
                    <div className="form-grid">
                      <div className="field">
                        <label htmlFor="pw1">رمز عبور جدید</label>
                        <input
                          className="input"
                          id="pw1"
                          type="password"
                          autoComplete="new-password"
                          placeholder="حداقل ۸ کاراکتر"
                          value={pw1}
                          onChange={(e) => setPw1(e.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="pw2">تکرار رمز عبور</label>
                        <input
                          className="input"
                          id="pw2"
                          type="password"
                          autoComplete="new-password"
                          placeholder="••••••••"
                          value={pw2}
                          onChange={(e) => setPw2(e.target.value)}
                        />
                        {pwErr && <span className="ferr">{pwErr}</span>}
                      </div>
                    </div>

                    <div style={{ marginTop: "14px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setPwBoxOpen(false);
                          setPw1("");
                          setPw2("");
                          setPwErr("");
                        }}
                        className="btn btn-outline btn-sm cursor-pointer"
                      >
                        انصراف
                      </button>
                      <button
                        type="button"
                        onClick={handleSavePassword}
                        className="btn btn-primary btn-sm cursor-pointer"
                      >
                        ذخیره‌ی رمز
                      </button>
                    </div>
                  </div>

                  {/* Two Step Auth */}
                  <div className="toggle-row" style={{ marginTop: "14px" }}>
                    <div className="meta">
                      <div className="t">تأیید دو مرحله‌ای برای عملیات حساس</div>
                      <div className="d">قبل از تغییر شماره یا حذف شاگرد، یک کد پیامکی جدید دریافت می‌کنی</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={form.two_step}
                        onChange={(e) => setForm({ ...form, two_step: e.target.checked })}
                        aria-label="تأیید دو مرحله‌ای"
                      />
                      <span className="slider" />
                    </label>
                  </div>

                  {/* Active Devices */}
                  <div className="panel-title text-[15px] font-extrabold text-ink mb-1" style={{ marginTop: "26px" }}>
                    دستگاه‌های فعال
                  </div>
                  <div className="panel-sub text-[13px] text-ink-faint mb-5">
                    نشست‌هایی که الان وارد حساب تو هستند
                  </div>

                  <div id="devs">
                    {devices.map((d) => (
                      <div key={d.id} className="dev">
                        <span className="dico">
                          {d.icon === "monitor" ? (
                            <Monitor className="h-5 w-5" />
                          ) : d.icon === "phone" ? (
                            <Smartphone className="h-5 w-5" />
                          ) : (
                            <Laptop className="h-5 w-5" />
                          )}
                        </span>
                        <div>
                          <div className="nm">
                            <span>{d.name}</span>
                            {d.isCurrent && <span className="tag">این دستگاه</span>}
                          </div>
                          <div className="sb">{d.time}</div>
                        </div>
                        {!d.isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleRevokeDevice(d.id)}
                            className="btn btn-danger btn-sm cursor-pointer"
                          >
                            خروج
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {devices.some((d) => !d.isCurrent) && (
                    <div style={{ marginTop: "16px" }}>
                      <button
                        type="button"
                        onClick={handleRevokeAllOtherDevices}
                        className="btn btn-danger btn-sm cursor-pointer"
                      >
                        خروج از همه‌ی دستگاه‌های دیگر
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* PANEL 5: ترجیحات (Preferences) */}
              {activeTab === "pref" && (
                <div className="panel active block p-[24px_22px]">
                  <div className="panel-title text-[15px] font-extrabold text-ink mb-1">
                    ترجیحات
                  </div>
                  <div className="panel-sub text-[13px] text-ink-faint mb-5">
                    نمایش و قالب‌بندی برنامه
                  </div>

                  <div className="form-grid">
                    <div className="field">
                      <label htmlFor="lang">زبان</label>
                      <select
                        className="input"
                        id="lang"
                        value={form.language}
                        onChange={(e) => setForm({ ...form, language: e.target.value })}
                      >
                        <option value="fa">فارسی</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="cal">تقویم</label>
                      <select
                        className="input"
                        id="cal"
                        value={form.calendar}
                        onChange={(e) => setForm({ ...form, calendar: e.target.value })}
                      >
                        <option value="jalali">شمسی (جلالی)</option>
                        <option value="gregorian">میلادی</option>
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="fd">اولین روز هفته</label>
                      <select
                        className="input"
                        id="fd"
                        value={form.week_start}
                        onChange={(e) => setForm({ ...form, week_start: e.target.value })}
                      >
                        <option value="sat">شنبه</option>
                        <option value="sun">یکشنبه</option>
                        <option value="mon">دوشنبه</option>
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="tf">قالب ساعت</label>
                      <select
                        className="input"
                        id="tf"
                        value={form.time_format}
                        onChange={(e) => setForm({ ...form, time_format: e.target.value })}
                      >
                        <option value="24">۲۴ ساعته</option>
                        <option value="12">۱۲ ساعته</option>
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="wu">واحد وزن</label>
                      <select
                        className="input"
                        id="wu"
                        value={form.weight_unit}
                        onChange={(e) => setForm({ ...form, weight_unit: e.target.value })}
                      >
                        <option value="kg">کیلوگرم</option>
                        <option value="lb">پوند</option>
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="dv">صفحه‌ی شروع</label>
                      <select
                        className="input"
                        id="dv"
                        value={form.landing}
                        onChange={(e) => setForm({ ...form, landing: e.target.value })}
                      >
                        <option value="dash">داشبورد</option>
                        <option value="classes">برنامه و کلاس‌ها</option>
                        <option value="attendance">حضور و غیاب</option>
                      </select>
                    </div>
                  </div>

                  {/* Persian Digits Switch */}
                  <div className="toggle-row" style={{ marginTop: "16px" }}>
                    <div className="meta">
                      <div className="t">نمایش اعداد فارسی</div>
                      <div className="d">اعداد در همه‌ی صفحه‌ها با ارقام فارسی نمایش داده شود</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={form.persian_digits}
                        onChange={(e) => setForm({ ...form, persian_digits: e.target.checked })}
                        aria-label="اعداد فارسی"
                      />
                      <span className="slider" />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Dirty Bar: Sticky save/discard bar when changes exist */}
            <div className={cn("dirty-bar", isDirty && "show")} role="status">
              <span className="tx">تغییرات ذخیره‌نشده داری</span>
              <button
                type="button"
                onClick={handleDiscard}
                className="btn btn-outline btn-sm cursor-pointer"
              >
                لغو تغییرات
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm cursor-pointer"
              >
                ذخیره‌ی تنظیمات
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
