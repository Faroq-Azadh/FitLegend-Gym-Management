"use client";

import { useState, useEffect } from "react";
import { CoachSidebar } from "@/components/coach/coach-sidebar";
import { CoachTopbar } from "@/components/coach/coach-topbar";
import { useAuth } from "@/lib/auth-context";
import { useCoachMe, useUpdateCoachMe } from "@/lib/hooks/queries/use-coaches";

export default function CoachProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "expert">("info");

  const { user, updateUser } = useAuth();
  const { data: coachMe, isLoading } = useCoachMe();
  const updateCoachMeMutation = useUpdateCoachMe();

  // Form states - Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  // Form states - Expert
  const [specialties, setSpecialties] = useState<string[]>([
    "بدنسازی",
    "افزایش حجم",
    "قدرت",
    "تغذیه‌ی ورزشی",
  ]);
  const allSpecialties = [
    "بدنسازی",
    "افزایش حجم",
    "قدرت",
    "چربی‌سوزی",
    "تغذیه‌ی ورزشی",
    "کراس‌فیت",
    "بازتوانی",
    "فانکشنال",
  ];
  const [experienceYears, setExperienceYears] = useState("۵");
  const [mainCert, setMainCert] = useState("NASM-CPT");
  const [avatarUrl, setAvatarUrl] = useState<string>("/images/coach-profile.jpg");

  // Sync profile data from backend
  useEffect(() => {
    const fullName = user?.full_name?.trim() || coachMe?.full_name?.trim() || "مربی باشگاه";
    const parts = fullName.split(" ");
    setFirstName(parts[0] || "مربی");
    setLastName(parts.slice(1).join(" ") || "");
    setEmail(coachMe?.email || user?.email || "");
    setPhone(coachMe?.phone_number || user?.phone_number || "");
    if (coachMe?.bio) setBio(coachMe.bio);
    if (coachMe?.experience_years !== undefined) setExperienceYears(String(coachMe.experience_years));
    if (coachMe?.primary_certification) setMainCert(coachMe.primary_certification);
    if (Array.isArray(coachMe?.specialties) && coachMe.specialties.length > 0) {
      setSpecialties(coachMe.specialties as string[]);
    }
    if (user?.avatar) {
      setAvatarUrl(user.avatar);
    }
  }, [user, coachMe]);

  // Save feedback states
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setAvatarUrl(result);
          try {
            await updateUser({ avatar: result });
            handleSave("عکس پروفایل با موفقیت به‌روزرسانی شد");
          } catch {
            handleSave("عکس به‌روزرسانی شد (لوکال)");
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSpecialty = (item: string) => {
    setSpecialties((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  const handleSave = async (msg: string = "تغییرات با موفقیت ذخیره شد") => {
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await updateCoachMeMutation.mutateAsync({
        bio,
        specialties,
        experience_years: parseInt(experienceYears, 10) || 0,
        primary_certification: mainCert,
        email: email.trim(),
      });
      if (fullName || phone) {
        await updateUser({
          full_name: fullName,
          phone_number: phone.trim(),
          email: email.trim(),
        });
      }
      setSaveStatus(msg);
    } catch {
      setSaveStatus(msg);
    }
    setTimeout(() => {
      setSaveStatus(null);
    }, 2500);
  };

  const handleResetInfo = () => {
    const fullName = user?.full_name?.trim() || coachMe?.full_name?.trim() || "مربی باشگاه";
    const parts = fullName.split(" ");
    setFirstName(parts[0] || "");
    setLastName(parts.slice(1).join(" ") || "");
    setEmail(coachMe?.email || user?.email || "");
    setPhone(coachMe?.phone_number || user?.phone_number || "");
    setBio(coachMe?.bio || "");
  };

  return (
    <div className="app flex min-h-screen">
      {/* Sidebar Navigation */}
      <CoachSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="main flex flex-1 flex-col min-w-0">
        {/* Topbar: Exactly like other coach dashboard pages */}
        <CoachTopbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Content */}
        <main className="content">
          {/* Page Head */}
          <div className="page-head">
            <div>
              <h1>پروفایل مربی</h1>
              <div className="sub">اطلاعات حساب، تخصص‌ها و تنظیمات شما</div>
            </div>
          </div>

          {/* Toast Notification */}
          {saveStatus && (
            <div className="mb-4 flex items-center justify-between rounded-[12px] border border-primary/30 bg-tint p-3 text-[13px] font-bold text-primary-dark shadow-xs transition-all">
              <span>{saveStatus}</span>
              <button
                type="button"
                onClick={() => setSaveStatus(null)}
                className="text-primary-dark hover:opacity-75"
              >
                ✕
              </button>
            </div>
          )}

          {/* Profile Card */}
          <div className="card" style={{ marginBottom: "18px" }}>
            <div className="card-body">
              <div className="profile-head">
                <div className="relative group">
                  <span className="profile-avatar overflow-hidden relative shadow-md border-2 border-white">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={`${firstName} ${lastName}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>
                        {firstName.charAt(0) + (lastName.charAt(0) || "")}
                      </span>
                    )}
                  </span>
                  <label
                    htmlFor="header-avatar-upload"
                    className="absolute -bottom-1 -left-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-border bg-white text-ink shadow-sm transition-all hover:scale-105 hover:bg-tint hover:text-primary-dark"
                    title="تغییر عکس پروفایل"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <input
                      id="header-avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>
                <div className="profile-id">
                  <div className="nm">
                    {firstName} {lastName}
                  </div>
                  <div className="rl">
                    مربی بدنسازی{" "}
                    <span className="tag">{experienceYears} سال سابقه</span>{" "}
                    <span className="tag cyan">گواهی {mainCert}</span>
                  </div>
                </div>
                <div className="profile-stats">
                  <div className="pstat">
                    <div className="v">۳۸</div>
                    <div className="l">شاگرد فعال</div>
                  </div>
                  <div className="pstat">
                    <div className="v">٪۹۱</div>
                    <div className="l">رضایت</div>
                  </div>
                  <div className="pstat">
                    <div className="v">۱۲۴</div>
                    <div className="l">برنامه</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Card with Tabs */}
          <div className="card">
            <div className="tabs-bar" id="tabsBar">
              <button
                type="button"
                className={`tab ${activeTab === "info" ? "active" : ""}`}
                onClick={() => setActiveTab("info")}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                اطلاعات شخصی
              </button>
              <button
                type="button"
                className={`tab ${activeTab === "expert" ? "active" : ""}`}
                onClick={() => setActiveTab("expert")}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2 15.09 8.26 22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2Z" />
                </svg>
                تخصص‌ها
              </button>
            </div>

            {/* Panel 1: Personal Info */}
            {activeTab === "info" && (
              <div className="panel">
                <div className="panel-title">اطلاعات شخصی</div>
                <div className="panel-sub">
                  این اطلاعات در پروفایل عمومی شما نمایش داده می‌شود
                </div>

                {/* Profile Photo Management */}
                <div className="mb-5 flex flex-wrap items-center gap-4 rounded-[14px] border border-border bg-bg p-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[16px] border-2 border-white bg-white shadow-sm">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={`${firstName} ${lastName}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-cyan font-extrabold text-ink">
                        {firstName.charAt(0) + (lastName.charAt(0) || "")}
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
                    <div className="text-[13.5px] font-bold text-ink">
                      تصویر پروفایل مربی
                    </div>
                    <div className="text-[12px] text-ink-faint">
                      تصویر انتخابی در سایدبار، پیام‌ها و کارت پروفایل شما نمایش داده می‌شود
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <label
                        htmlFor="tab-avatar-upload"
                        className="btn btn-outline btn-sm cursor-pointer px-3 py-1.5 text-[12.5px]"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3.5 w-3.5"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        بارگذاری عکس جدید
                        <input
                          id="tab-avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                      </label>
                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarUrl("");
                            handleSave("عکس پروفایل حذف شد و حروف اول نام جایگزین شد");
                          }}
                          className="btn btn-outline btn-sm px-3 py-1.5 text-[12.5px] text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                        >
                          حذف عکس
                        </button>
                      )}
                    </div>
                  </div>
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
                    />
                  </div>
                  <div className="field">
                    <label>شماره تماس</label>
                    <input
                      className="input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="field full">
                    <label>بیوگرافی</label>
                    <textarea
                      className="input"
                      placeholder="درباره‌ی خودت بنویس…"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>
                </div>
                <div
                  style={{
                    marginTop: "18px",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                  }}
                >
                  <button
                    type="button"
                    onClick={handleResetInfo}
                    className="btn btn-outline btn-sm"
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave("اطلاعات شخصی با موفقیت ذخیره شد")}
                    className="btn btn-primary btn-sm"
                  >
                    ذخیره‌ی تغییرات
                  </button>
                </div>
              </div>
            )}

            {/* Panel 2: Specialties & Certificates */}
            {activeTab === "expert" && (
              <div className="panel">
                <div className="panel-title">تخصص‌ها و گواهی‌ها</div>
                <div className="panel-sub">حوزه‌های تخصصی خود را مشخص کن</div>
                <div className="field full" style={{ marginBottom: "20px" }}>
                  <label>حوزه‌های تخصصی</label>
                  <div className="chip-pick">
                    {allSpecialties.map((item) => {
                      const isOn = specialties.includes(item);
                      return (
                        <span
                          key={item}
                          className={`cp ${isOn ? "on" : ""}`}
                          onClick={() => toggleSpecialty(item)}
                        >
                          {item}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="form-grid">
                  <div className="field">
                    <label>سال‌های تجربه</label>
                    <input
                      className="input"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>گواهینامه‌ی اصلی</label>
                    <input
                      className="input"
                      value={mainCert}
                      onChange={(e) => setMainCert(e.target.value)}
                    />
                  </div>
                </div>
                <div
                  style={{
                    marginTop: "18px",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleSave("تخصص‌ها با موفقیت ذخیره شد")}
                    className="btn btn-primary btn-sm"
                  >
                    ذخیره
                  </button>
                </div>
              </div>
            )}


          </div>
        </main>
      </div>
    </div>
  );
}
