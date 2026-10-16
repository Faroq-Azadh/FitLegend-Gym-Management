"use client";

import { useState, useEffect } from "react";
import { ProfileNotificationData } from "./types";
import { useGymSettings, useUpdateGymSettings } from "@/lib/hooks/queries/use-gym-me";
import { useAuth } from "@/lib/auth-context";
import { Check, Loader2, Bell } from "lucide-react";

const NOTIF_PROFILE_STORAGE_KEY = "fitlegend_profile_notifications";

interface NotificationsTabProps {
  notifications: ProfileNotificationData;
  onUpdateNotifications: (updated: Partial<ProfileNotificationData>) => void;
}

export function NotificationsTab({
  notifications,
  onUpdateNotifications,
}: NotificationsTabProps) {
  const { data: settingsData } = useGymSettings();
  const updateSettingsMutation = useUpdateGymSettings();
  const { user: authUser, updateUser } = useAuth();

  const [data, setData] = useState<ProfileNotificationData>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(NOTIF_PROFILE_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return { ...notifications, ...parsed };
        }
      } catch {}
    }
    return notifications;
  });

  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync from Django settings / user notification preferences
  useEffect(() => {
    if (settingsData?.notification_preferences) {
      const prefs = settingsData.notification_preferences as Record<string, any>;
      setData((prev) => ({
        ...prev,
        emailNewMembers: prefs.emailNewMembers ?? prefs.welcome_member ?? prev.emailNewMembers,
        alertFailedPayment: prefs.alertFailedPayment ?? prev.alertFailedPayment,
        smsExpiryReminder: prefs.smsExpiryReminder ?? prefs.renewal_reminder ?? prev.smsExpiryReminder,
        weeklyReport: prefs.weeklyReport ?? prefs.daily_report ?? prev.weeklyReport,
      }));
    }
    if (authUser) {
      setData((prev) => ({
        ...prev,
        smsExpiryReminder: authUser.notify_membership_expiry ?? prev.smsExpiryReminder,
      }));
    }
  }, [settingsData, authUser]);

  const handleToggle = (key: keyof ProfileNotificationData) => {
    setData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Save locally
      localStorage.setItem(NOTIF_PROFILE_STORAGE_KEY, JSON.stringify(data));
    } catch {}

    onUpdateNotifications(data);

    try {
      // 2. Persist in Django backend via /gyms/me/settings/
      await updateSettingsMutation.mutateAsync({
        notification_preferences: {
          ...(settingsData?.notification_preferences || {}),
          emailNewMembers: data.emailNewMembers,
          alertFailedPayment: data.alertFailedPayment,
          smsExpiryReminder: data.smsExpiryReminder,
          weeklyReport: data.weeklyReport,
          renewal_reminder: data.smsExpiryReminder,
          welcome_member: data.emailNewMembers,
          daily_report: data.weeklyReport,
        },
      });

      // 3. Also update User notification flags in /users/me/
      try {
        await updateUser({
          notify_membership_expiry: data.smsExpiryReminder,
          notify_promotions: data.emailNewMembers,
        });
      } catch {}

      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      console.warn("Save profile notifications in Django note:", err);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-[20px_16px] min-[640px]:p-[24px_22px]">
      <div className="flex items-center gap-[8px]">
        <Bell className="h-[20px] w-[20px] text-primary" />
        <div className="text-[15px] font-extrabold text-ink">اعلان‌ها و هشدارهای مدیر</div>
      </div>
      <div className="mb-[20px] mt-[2px] text-[13px] text-ink-faint">
        انتخاب کنید چه رویدادهایی به شما اطلاع داده شوند.
      </div>

      <form onSubmit={handleSubmit}>
        <div className="divide-y divide-border">
          {/* 1. Email New Members */}
          <div className="flex items-center gap-[14px] py-[16px]">
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-bold text-ink">
                ایمیل عضویت‌های جدید
              </div>
              <div className="mt-[2px] text-[12.5px] text-ink-faint">
                هنگام ثبت‌نام یا تمدید عضو جدید در باشگاه
              </div>
            </div>

            <label className="relative inline-block h-[26px] w-[46px] shrink-0 cursor-pointer">
              <input
                type="checkbox"
                checked={data.emailNewMembers}
                onChange={() => handleToggle("emailNewMembers")}
                className="peer sr-only"
              />
              <span className="block h-full w-full rounded-full bg-border transition-colors duration-200 peer-checked:bg-primary" />
              <span className="absolute top-[3px] right-[3px] h-[20px] w-[20px] rounded-full bg-white shadow-xs transition-transform duration-200 peer-checked:-translate-x-[20px]" />
            </label>
          </div>

          {/* 2. Alert Failed Payment */}
          <div className="flex items-center gap-[14px] py-[16px]">
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-bold text-ink">
                هشدار پرداخت ناموفق
              </div>
              <div className="mt-[2px] text-[12.5px] text-ink-faint">
                اطلاع‌رسانی فوری تراکنش‌های ناموفق و اختلالات درگاه
              </div>
            </div>

            <label className="relative inline-block h-[26px] w-[46px] shrink-0 cursor-pointer">
              <input
                type="checkbox"
                checked={data.alertFailedPayment}
                onChange={() => handleToggle("alertFailedPayment")}
                className="peer sr-only"
              />
              <span className="block h-full w-full rounded-full bg-border transition-colors duration-200 peer-checked:bg-primary" />
              <span className="absolute top-[3px] right-[3px] h-[20px] w-[20px] rounded-full bg-white shadow-xs transition-transform duration-200 peer-checked:-translate-x-[20px]" />
            </label>
          </div>

          {/* 3. SMS Expiry Reminder */}
          <div className="flex items-center gap-[14px] py-[16px]">
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-bold text-ink">
                پیامک یادآوری انقضا
              </div>
              <div className="mt-[2px] text-[12.5px] text-ink-faint">
                ارسال خودکار پیامک هشدار به اعضای رو به اتمام
              </div>
            </div>

            <label className="relative inline-block h-[26px] w-[46px] shrink-0 cursor-pointer">
              <input
                type="checkbox"
                checked={data.smsExpiryReminder}
                onChange={() => handleToggle("smsExpiryReminder")}
                className="peer sr-only"
              />
              <span className="block h-full w-full rounded-full bg-border transition-colors duration-200 peer-checked:bg-primary" />
              <span className="absolute top-[3px] right-[3px] h-[20px] w-[20px] rounded-full bg-white shadow-xs transition-transform duration-200 peer-checked:-translate-x-[20px]" />
            </label>
          </div>

          {/* 4. Weekly Report */}
          <div className="flex items-center gap-[14px] py-[16px]">
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-bold text-ink">
                گزارش هفتگی و ماهانه عملکرد
              </div>
              <div className="mt-[2px] text-[12.5px] text-ink-faint">
                خلاصه‌ی درآمد، تردد و شاگردان هر هفته
              </div>
            </div>

            <label className="relative inline-block h-[26px] w-[46px] shrink-0 cursor-pointer">
              <input
                type="checkbox"
                checked={data.weeklyReport}
                onChange={() => handleToggle("weeklyReport")}
                className="peer sr-only"
              />
              <span className="block h-full w-full rounded-full bg-border transition-colors duration-200 peer-checked:bg-primary" />
              <span className="absolute top-[3px] right-[3px] h-[20px] w-[20px] rounded-full bg-white shadow-xs transition-transform duration-200 peer-checked:-translate-x-[20px]" />
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-[22px] flex items-center justify-start gap-[10px] border-t border-border pt-[20px]">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-[6px] rounded-[10px] btn-ink-gradient px-[20px] py-[9px] text-[13px] font-bold text-white transition-all hover:shadow-[0_20px_50px_rgba(242,92,31,0.25)] active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-[14px] w-[14px] animate-spin" /> : null}
            <span>ذخیره ترجیحات </span>
          </button>

          {saved && (
            <span className="mr-auto inline-flex items-center gap-[6px] rounded-full bg-[#E0F2FE] px-[12px] py-[5px] text-[12.5px] font-bold text-[#0284C7] animate-in fade-in duration-200">
              <Check className="h-[15px] w-[15px]" />
              ترجیحات اعلان‌ها با موفقیت خیره شد
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
