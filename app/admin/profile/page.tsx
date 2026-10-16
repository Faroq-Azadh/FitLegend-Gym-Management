"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useGymMe } from "@/lib/hooks/queries/use-gym-me";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { ProfileSummaryCard } from "@/components/admin/profile/profile-summary-card";
import { PersonalInfoTab } from "@/components/admin/profile/personal-info-tab";
import { ClubInfoTab } from "@/components/admin/profile/club-info-tab";
import { SecurityTab } from "@/components/admin/profile/security-tab";
import { NotificationsTab } from "@/components/admin/profile/notifications-tab";
import { LogOut, Loader2, Check } from "lucide-react";
import { getSavedManagerAvatar, saveManagerAvatar } from "@/lib/manager-avatar";
import {
  ProfileUserData,
  ProfileClubData,
  ProfileSecurityData,
  ProfileNotificationData,
} from "@/components/admin/profile/types";

type ProfileTab = "personal" | "club" | "security" | "notif";

export default function AdminProfilePage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>("personal");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user: authUser, logout, updateUser } = useAuth();
  const { data: gym } = useGymMe();

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      // Proceed even if network error
    } finally {
      router.push("/");
    }
  };

  const [user, setUser] = useState<ProfileUserData>({
    firstName: "مدیر",
    lastName: "باشگاه",
    email: "",
    phone: "",
    role: "مدیر باشگاه",
    language: "فارسی",
    about: "مدیر باشگاه ورزشی فیتلجند، علاقه‌مند به مدیریت هوشمند و ارتقای خدمات ورزشی.",
    branch: "شعبه اصلی",
    memberSince: "۱۴۰۳",
  });

  const [club, setClub] = useState<ProfileClubData>({
    clubName: "باشگاه ورزشی",
    phone: "",
    startHour: "۰۶:۰۰",
    endHour: "۲۳:۰۰",
    address: "",
  });

  useEffect(() => {
    const localAvatar = getSavedManagerAvatar(authUser?.email || (authUser ? String(authUser.id) : null)) || undefined;

    if (authUser) {
      const parts = (authUser.full_name || "").trim().split(/\s+/);
      const firstName = parts[0] || "مدیر";
      const lastName = parts.slice(1).join(" ") || "";
      const memberSince = authUser.date_joined
        ? new Date(authUser.date_joined).toLocaleDateString("fa-IR", { year: "numeric", month: "long" })
        : "۱۴۰۳";

      setUser((prev) => ({
        ...prev,
        firstName,
        lastName,
        email: authUser.email || prev.email,
        phone: authUser.phone_number || prev.phone,
        memberSince,
        avatarUrl: authUser.avatar || localAvatar || prev.avatarUrl || undefined,
      }));
    } else if (localAvatar) {
      setUser((prev) => ({
        ...prev,
        avatarUrl: prev.avatarUrl || localAvatar,
      }));
    }
  }, [authUser]);

  useEffect(() => {
    if (gym) {
      setClub((prev) => ({
        ...prev,
        clubName: gym.name || prev.clubName,
        phone: gym.phone_number || prev.phone,
        address: gym.address || prev.address,
      }));
    }
  }, [gym]);

  const [security, setSecurity] = useState<ProfileSecurityData>({
    twoFactorEnabled: true,
    logoutOtherDevices: false,
  });

  const [notifications, setNotifications] = useState<ProfileNotificationData>({
    emailNewMembers: true,
    alertFailedPayment: true,
    smsExpiryReminder: true,
    weeklyReport: true,
  });

  const [topSavedNotice, setTopSavedNotice] = useState(false);

  const handleTopSave = async () => {
    try {
      const fullName = `${user.firstName} ${user.lastName}`.trim();
      const currentAvatar = user.avatarUrl || getSavedManagerAvatar(authUser?.email || (authUser ? String(authUser.id) : null)) || undefined;
      if (currentAvatar) {
        saveManagerAvatar(currentAvatar, authUser?.email || (authUser ? String(authUser.id) : null));
      }

      await updateUser({
        full_name: fullName,
        phone_number: user.phone.trim(),
        language: user.language === "English" ? "en" : "fa",
        avatar: currentAvatar || undefined,
      });
    } catch {}

    setTopSavedNotice(true);
    setTimeout(() => setTopSavedNotice(false), 3000);
  };

  return (
    <div className="flex min-h-screen bg-bg text-ink">
      {/* Sidebar Navigation */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar Header */}
        <AdminTopbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          searchPlaceholder="جستجو در پروفایل و تنظیمات…"
        />

        {/* Page Content */}
        <main className="flex-1 p-[18px] min-[640px]:p-[28px]">
          {/* Page Head */}
          <div className="mb-[24px] flex flex-wrap items-end justify-between gap-[16px]">
            <div>
              <h1 className="text-[22px] font-extrabold tracking-[-0.01em] text-ink min-[640px]:text-[26px]">
                پروفایل مدیر
              </h1>
              <div className="mt-[5px] text-[14px] text-ink-faint">
                مدیریت حساب کاربری، اطلاعات باشگاه و تنظیمات امنیتی سامانه
              </div>
            </div>

            <div className="flex items-center gap-[10px]">
              {topSavedNotice && (
                <span className="inline-flex items-center gap-[6px] rounded-full bg-[#E0F2FE] px-[12px] py-[6px] text-[12px] font-bold text-[#0284C7] animate-in fade-in duration-200">
                  <Check className="h-[14px] w-[14px]" />
                  تغییرات در سامانه ثبت شد
                </span>
              )}

              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="inline-flex items-center gap-[6px] rounded-[10px] border border-[#FCA5A5] bg-[#FEF2F2] px-[14px] py-[8px] text-[13px] font-bold text-[#DC2626] transition-colors hover:bg-[#FEE2E2]"
              >
                <LogOut className="h-[15px] w-[15px]" />
                <span>خروج از پنل</span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="rounded-[10px] border-[1.5px] border-border bg-surface px-[14px] py-[8px] text-[13px] font-semibold text-ink transition-colors hover:border-primary hover:bg-tint"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleTopSave}
                className="inline-flex items-center gap-[6px] rounded-[10px] btn-ink-gradient px-[16px] py-[8px] text-[13px] font-bold text-white transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_20px_50px_rgba(242,92,31,0.25)] active:scale-95"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-[16px] w-[16px]"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <path d="M17 21v-8H7v8M7 3v5h8" />
                </svg>
                <span>ذخیره تغییرات</span>
              </button>
            </div>
          </div>

          {/* Profile 2-Column Grid (320px / 1fr) */}
          <div className="grid grid-cols-1 items-start gap-[18px] min-[980px]:grid-cols-[320px_1fr]">
            {/* Summary Left Card */}
            <ProfileSummaryCard
              user={user}
              onUpdateUser={(updated) => {
                if (updated.avatarUrl) {
                  saveManagerAvatar(updated.avatarUrl, authUser?.email || (authUser ? String(authUser.id) : null));
                  updateUser({ avatar: updated.avatarUrl }).catch(() => {});
                }
                setUser((prev) => ({ ...prev, ...updated }));
              }}
              onLogoutClick={() => setShowLogoutModal(true)}
            />

            {/* Right Card with Tabs */}
            <div className="rounded-[16px] border border-border bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
              {/* Tabs Bar */}
              <div className="m-[20px_22px_0] flex flex-wrap gap-[4px] rounded-[12px] bg-bg p-[5px]">
                {/* Personal Info Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab("personal")}
                  className={cn(
                    "inline-flex items-center gap-[7px] whitespace-nowrap rounded-[9px] px-[15px] py-[9px] text-[13px] font-bold transition-all duration-180",
                    activeTab === "personal"
                      ? "bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                      : "text-ink-faint hover:text-ink",
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-[15px] w-[15px]"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>اطلاعات شخصی</span>
                </button>

                {/* Club Info Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab("club")}
                  className={cn(
                    "inline-flex items-center gap-[7px] whitespace-nowrap rounded-[9px] px-[15px] py-[9px] text-[13px] font-bold transition-all duration-180",
                    activeTab === "club"
                      ? "bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                      : "text-ink-faint hover:text-ink",
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-[15px] w-[15px]"
                  >
                    <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
                  </svg>
                  <span>اطلاعات باشگاه</span>
                </button>

                {/* Security Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab("security")}
                  className={cn(
                    "inline-flex items-center gap-[7px] whitespace-nowrap rounded-[9px] px-[15px] py-[9px] text-[13px] font-bold transition-all duration-180",
                    activeTab === "security"
                      ? "bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                      : "text-ink-faint hover:text-ink",
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-[15px] w-[15px]"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>امنیت</span>
                </button>

                {/* Notifications Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab("notif")}
                  className={cn(
                    "inline-flex items-center gap-[7px] whitespace-nowrap rounded-[9px] px-[15px] py-[9px] text-[13px] font-bold transition-all duration-180",
                    activeTab === "notif"
                      ? "bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                      : "text-ink-faint hover:text-ink",
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-[15px] w-[15px]"
                  >
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                  <span>اعلان‌ها</span>
                </button>
              </div>

              {/* Tab Panels */}
              {activeTab === "personal" && (
                <PersonalInfoTab
                  user={user}
                  onUpdateUser={(updated) =>
                    setUser((prev) => ({ ...prev, ...updated }))
                  }
                />
              )}
              {activeTab === "club" && (
                <ClubInfoTab
                  club={club}
                  onUpdateClub={(updated) =>
                    setClub((prev) => ({ ...prev, ...updated }))
                  }
                />
              )}
              {activeTab === "security" && (
                <SecurityTab
                  security={security}
                  onUpdateSecurity={(updated) =>
                    setSecurity((prev) => ({ ...prev, ...updated }))
                  }
                />
              )}
              {activeTab === "notif" && (
                <NotificationsTab
                  notifications={notifications}
                  onUpdateNotifications={(updated) =>
                    setNotifications((prev) => ({ ...prev, ...updated }))
                  }
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px]">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity"
            onClick={() => !isLoggingOut && setShowLogoutModal(false)}
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-[20px] border border-border bg-surface p-[24px] shadow-[0_20px_60px_rgba(15,23,42,0.18)] animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-[54px] w-[54px] items-center justify-center rounded-[16px] bg-[#FEF2F2] text-[#DC2626]">
              <LogOut className="h-[26px] w-[26px]" />
            </div>

            <div className="mt-[16px] text-center">
              <h3 className="text-[18px] font-black text-ink">
                خروج از پنل مدیریت
              </h3>
              <p className="mt-[8px] text-[13.5px] leading-[1.7] text-ink-faint">
                آیا از خروج از پنل مدیریت اطمینان دارید؟ در صورت خروج، از حساب خارج شده و به صفحه اصلی فیتلجند منتقل خواهید شد.
              </p>
            </div>

            <div className="mt-[24px] grid grid-cols-2 gap-[10px]">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutModal(false)}
                className="rounded-[12px] border border-border bg-surface py-[10px] text-[13.5px] font-bold text-ink transition-colors hover:bg-bg disabled:opacity-50"
              >
                خیر، انصراف
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleConfirmLogout}
                className="inline-flex items-center justify-center gap-[6px] rounded-[12px] bg-[#DC2626] py-[10px] text-[13.5px] font-bold text-white transition-all hover:bg-[#B91C1C] hover:shadow-[0_8px_20px_rgba(220,38,38,0.25)] disabled:opacity-50"
              >
                {isLoggingOut && <Loader2 className="h-[15px] w-[15px] animate-spin" />}
                <span>بله، خارج شو</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
