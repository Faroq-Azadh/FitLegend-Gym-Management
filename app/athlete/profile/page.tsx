"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { toPersianDigits } from "@/lib/persian-digits";
import { AthleteSidebar } from "@/components/athlete/athlete-sidebar";
import { AthleteTopbar } from "@/components/athlete/athlete-topbar";

export default function AthleteProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Picture State
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Account Information State (Moved from Settings)
  const [firstName, setFirstName] = useState("سارا");
  const [lastName, setLastName] = useState("محمدی");
  const [email, setEmail] = useState("sara@fitlegend.fit");
  const [phone, setPhone] = useState("۰۹۱۲۱۱۱۲۲۳۳");
  const [sensitiveConditions, setSensitiveConditions] = useState(
    "آسیب‌دیدگی جزئی زانوی چپ در تمرینات سنگین — نیاز به گرم‌کردن اختصاصی پیش از اسکات"
  );
  const [bloodType, setBloodType] = useState("O+ (مثبت)");
  const [emergencyContact, setEmergencyContact] = useState("۰۹۱۸۷۶۵۴۳۲۱ (همسر)");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Handle Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("حجم فایل نباید بیشتر از ۵ مگابایت باشد.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result as string);
        showToast("تصویر پروفایل با موفقیت تنظیم شد.");
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove Profile Picture
  const handleRemoveImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    showToast("تصویر پروفایل حذف شد و نشان پیش‌فرض قرار گرفت.");
  };

  // Save Account Changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("اطلاعات پروفایل و حساب کاربری با موفقیت ذخیره شد.");
  };

  // Reset to initial
  const handleReset = () => {
    setFirstName("سارا");
    setLastName("محمدی");
    setEmail("sara@fitlegend.fit");
    setPhone("۰۹۱۲۱۱۱۲۲۳۳");
    setSensitiveConditions(
      "آسیب‌دیدگی جزئی زانوی چپ در تمرینات سنگین — نیاز به گرم‌کردن اختصاصی پیش از اسکات"
    );
    showToast("تغییرات به مقادیر پیش‌فرض بازگردانده شد.");
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
              <h1>پروفایل ورزشکار</h1>
              <div className="sub">مدیریت اطلاعات حساب، تصویر نمایه و شرایط حساس پزشکی</div>
            </div>
            <div className="page-head-actions">
              <Link href="/athlete" className="btn btn-outline btn-sm">
                بازگشت به داشبورد
              </Link>
            </div>
          </div>

          <div className="w-full space-y-6">
            {/* Main Profile & Account Card */}
            <div className="card p-6 w-full">
              {/* Profile Picture Header & Controls */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-border">
                {/* Avatar Display */}
                <div className="relative group shrink-0">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="تصویر پروفایل سارا محمدی"
                      className="w-24 h-24 rounded-[22px] object-cover border-2 border-primary shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-[22px] bg-gradient-to-br from-primary to-cyan flex items-center justify-center font-black text-[28px] text-ink shadow-md">
                      سم
                    </div>
                  )}

                  {/* Quick Change Overlay */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-ink/40 rounded-[22px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    title="تغییر تصویر"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-6 h-6"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </button>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {/* Profile Meta & Actions */}
                <div className="flex-1 text-center sm:text-right">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                    <h2 className="text-[20px] font-extrabold text-ink">
                      {firstName} {lastName}
                    </h2>
                    <span className="tag cyan text-[11px] font-bold">
                      شناسه عضویت: #TTN-{toPersianDigits("9428")}
                    </span>
                  </div>
                  <div className="text-[12.5px] text-ink-faint mb-4">
                    عضو رسمی باشگاه فیتلجند از شهریور ۱۴۰۲ · سطح پیشرفته
                  </div>

                  {/* Profile Picture Actions: Set, Change, Remove */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-outline btn-sm text-[12.5px] font-bold flex items-center gap-1.5"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 ml-1"
                      >
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      {profileImage ? "تغییر تصویر نمایه" : "تنظیم تصویر نمایه"}
                    </button>

                    {profileImage && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="btn btn-outline btn-sm text-[12.5px] font-bold text-[#E11D48] hover:border-[#E11D48] hover:bg-[#FFF1F2] flex items-center gap-1.5"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4 ml-1"
                        >
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        حذف تصویر
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Form (Moved from Settings + "شرایط حساس") */}
              <form onSubmit={handleSaveProfile} className="pt-6">
                <div className="mb-4">
                  <h3 className="text-[16px] font-extrabold text-ink">اطلاعات حساب و مشخصات فردی</h3>
                  <p className="text-[12.5px] text-ink-faint mt-0.5">
                    مشخصات هویتی و شرایط جسمانی خود را جهت ثبت در پرونده باشگاه ویرایش نمایید
                  </p>
                </div>

                <div className="form-grid">
                  <div className="field">
                    <label>نام</label>
                    <input
                      className="input"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>نام خانوادگی</label>
                    <input
                      className="input"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>ایمیل</label>
                    <input
                      className="input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      dir="ltr"
                    />
                  </div>

                  <div className="field">
                    <label>شماره تماس</label>
                    <input
                      className="input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      dir="ltr"
                    />
                  </div>

                  {/* New Field: شرایط حساس */}
                  <div className="field full">
                    <label className="flex items-center gap-2">
                      <span>شرایط حساس</span>
                      <span className="text-[11px] font-normal text-primary-dark bg-tint px-2 py-0.5 rounded-full">
                        مهم برای برنامه تمرینی
                      </span>
                    </label>
                    <textarea
                      rows={3}
                      className="input"
                      value={sensitiveConditions}
                      onChange={(e) => setSensitiveConditions(e.target.value)}
                      placeholder="مثال: سابقه آسیب‌دیدگی مفصلی (زانوی چپ)، دیسک کمر، فشار خون، آلرژی به مکمل یا شرایط خاص پزشکی..."
                    />
                    <div className="fhint">
                      این اطلاعات به‌صورت مستقیم در اختیار مربی اختصاصی شما قرار می‌گیرد تا حرکات تمرینی متناسب با وضعیت بدنی شما شخصی‌سازی شوند.
                    </div>
                  </div>

                  {/* Complementary fields */}
                  <div className="field">
                    <label>گروه خونی</label>
                    <input
                      className="input"
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>شماره تماس اضطراری</label>
                    <input
                      className="input"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn btn-outline btn-sm"
                  >
                    انصراف
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    ذخیره تغییرات حساب
                  </button>
                </div>
              </form>
            </div>
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
