"use client";

import { useState, useEffect } from "react";
import { ProfileSecurityData } from "./types";
import { authService } from "@/lib/api/services/auth.service";
import { Check, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from "lucide-react";

const USER_PASSWORD_STORAGE_KEY = "fitlegend_user_password";
const USER_SECURITY_STORAGE_KEY = "fitlegend_user_security";

interface SecurityTabProps {
  security: ProfileSecurityData;
  onUpdateSecurity: (updated: Partial<ProfileSecurityData>) => void;
}

export function SecurityTab({ security, onUpdateSecurity }: SecurityTabProps) {
  // Current password state: dynamically loaded from browser login storage (fitlegend_saved_password / fitlegend_user_password)
  const [currentPassword, setCurrentPassword] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored =
        localStorage.getItem("fitlegend_saved_password") ||
        localStorage.getItem(USER_PASSWORD_STORAGE_KEY) ||
        sessionStorage.getItem("fitlegend_active_password") ||
        localStorage.getItem("password");
      if (stored) return stored;
    }
    return "";
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Eye toggle visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Security toggles
  const [twoFactor, setTwoFactor] = useState(security.twoFactorEnabled);
  const [logoutOthers, setLogoutOthers] = useState(security.logoutOtherDevices);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync password and security toggles from browser storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const p =
        localStorage.getItem("fitlegend_saved_password") ||
        localStorage.getItem(USER_PASSWORD_STORAGE_KEY) ||
        sessionStorage.getItem("fitlegend_active_password") ||
        localStorage.getItem("password");
      if (p) {
        setCurrentPassword(p);
      }

      try {
        const raw = localStorage.getItem(USER_SECURITY_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.twoFactor !== undefined) setTwoFactor(parsed.twoFactor);
          if (parsed.logoutOthers !== undefined) setLogoutOthers(parsed.logoutOthers);
        }
      } catch {}
    }
  }, []);

  const handleCurrentPasswordChange = (val: string) => {
    setCurrentPassword(val);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(USER_PASSWORD_STORAGE_KEY, val);
        localStorage.setItem("fitlegend_saved_password", val);
        sessionStorage.setItem("fitlegend_active_password", val);
      } catch {}
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // If changing password, validate
    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        setErrorMessage("رمز عبور جدید باید حداقل ۶ کاراکتر باشد.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage("رمز عبور جدید و تکرار آن یکسان نیستند.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (newPassword) {
        await authService.changePassword({
          new_password1: newPassword,
          new_password2: confirmPassword,
        });

        // Replace current password with the newly entered password
        setCurrentPassword(newPassword);
        if (typeof window !== "undefined") {
          localStorage.setItem(USER_PASSWORD_STORAGE_KEY, newPassword);
          localStorage.setItem("fitlegend_saved_password", newPassword);
          sessionStorage.setItem("fitlegend_active_password", newPassword);
        }
      }

      // Save security options
      onUpdateSecurity({
        twoFactorEnabled: twoFactor,
        logoutOtherDevices: logoutOthers,
      });

      if (typeof window !== "undefined") {
        localStorage.setItem(
          USER_SECURITY_STORAGE_KEY,
          JSON.stringify({ twoFactor, logoutOthers })
        );
      }

      // Reset new password inputs
      setNewPassword("");
      setConfirmPassword("");
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      const msg =
        err?.message ||
        err?.detail ||
        "خطا در به‌روزرسانی رمز عبور؛ لطفاً مجدداً بررسی فرمایید.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-[20px_16px] min-[640px]:p-[24px_22px]">
      <div className="flex items-center gap-[8px]">
        <ShieldCheck className="h-[20px] w-[20px] text-primary" />
        <div className="text-[15px] font-extrabold text-ink">امنیت حساب و رمز عبور</div>
      </div>
      <div className="mb-[20px] mt-[2px] text-[13px] text-ink-faint">
        رمز عبور فعلی و جدید خود را مدیریت کنید. برای مشاهده یا پنهان‌سازی رمز، روی آیکون چشم کلیک کنید.
      </div>

      {errorMessage && (
        <div className="mb-[18px] flex items-center gap-[8px] rounded-[10px] bg-red-500/10 p-[12px] text-[12.5px] font-bold text-red-600 animate-in fade-in duration-200">
          <AlertCircle className="h-[16px] w-[16px] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-[16px] min-[640px]:grid-cols-2">
          {/* Current Password - Masked/Hashed by default with Eye Toggle */}
          <div className="flex flex-col gap-[7px] min-[640px]:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-ink">رمز عبور فعلی اکانت (هش‌شده)</label>
              <span className="text-[11.5px] font-semibold text-primary-dark">
                {showCurrentPassword ? "رمز در حال نمایش است" : "رمز پنهان است (کلیک روی چشم)"}
              </span>
            </div>

            <div className="relative flex items-center">
              <input
                type={showCurrentPassword ? "text" : "password"}
                dir="ltr"
                required
                value={currentPassword}
                onChange={(e) => handleCurrentPasswordChange(e.target.value)}
                placeholder="رمز عبور فعلی اکانت"
                className="w-full rounded-[12px] border-[1.5px] border-border bg-surface p-[11px_14px] pl-[42px] text-[14px] font-mono text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute left-[10px] flex h-[28px] w-[28px] items-center justify-center rounded-[8px] text-ink-faint hover:bg-bg hover:text-ink transition-colors cursor-pointer"
                title={showCurrentPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
                aria-label={showCurrentPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-[17px] w-[17px] text-primary-dark" />
                ) : (
                  <Eye className="h-[17px] w-[17px]" />
                )}
              </button>
            </div>
          </div>

          {/* New Password with Eye Toggle */}
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-ink">رمز عبور جدید</label>
            <div className="relative flex items-center">
              <input
                type={showNewPassword ? "text" : "password"}
                dir="ltr"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-[12px] border-[1.5px] border-border bg-surface p-[11px_14px] pl-[42px] text-[14px] font-mono text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute left-[10px] flex h-[28px] w-[28px] items-center justify-center rounded-[8px] text-ink-faint hover:bg-bg hover:text-ink transition-colors cursor-pointer"
                title={showNewPassword ? "مخفی کردن رمز" : "نمایش رمز"}
              >
                {showNewPassword ? (
                  <EyeOff className="h-[17px] w-[17px] text-primary-dark" />
                ) : (
                  <Eye className="h-[17px] w-[17px]" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password with Eye Toggle */}
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-ink">تکرار رمز عبور جدید</label>
            <div className="relative flex items-center">
              <input
                type={showConfirmPassword ? "text" : "password"}
                dir="ltr"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-[12px] border-[1.5px] border-border bg-surface p-[11px_14px] pl-[42px] text-[14px] font-mono text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute left-[10px] flex h-[28px] w-[28px] items-center justify-center rounded-[8px] text-ink-faint hover:bg-bg hover:text-ink transition-colors cursor-pointer"
                title={showConfirmPassword ? "مخفی کردن رمز" : "نمایش رمز"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-[17px] w-[17px] text-primary-dark" />
                ) : (
                  <Eye className="h-[17px] w-[17px]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Security Toggles */}
        <div className="mt-[20px] divide-y divide-border border-t border-border pt-[6px]">
          {/* 2FA */}
          <div className="flex items-center gap-[14px] py-[16px]">
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-bold text-ink">
                احراز هویت دو مرحله‌ای (2FA)
              </div>
              <div className="mt-[2px] text-[12.5px] text-ink-faint">
                دریافت کد پیامکی یک‌بارمصرف هنگام ورود به پنل
              </div>
            </div>

            <label className="relative inline-block h-[26px] w-[46px] shrink-0 cursor-pointer">
              <input
                type="checkbox"
                checked={twoFactor}
                onChange={(e) => setTwoFactor(e.target.checked)}
                className="peer sr-only"
              />
              <span className="block h-full w-full rounded-full bg-border transition-colors duration-200 peer-checked:bg-primary" />
              <span className="absolute top-[3px] right-[3px] h-[20px] w-[20px] rounded-full bg-white shadow-xs transition-transform duration-200 peer-checked:-translate-x-[20px]" />
            </label>
          </div>

          {/* Logout others */}
          <div className="flex items-center gap-[14px] py-[16px]">
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-bold text-ink">
                خروج از سایر دستگاه‌ها
              </div>
              <div className="mt-[2px] text-[12.5px] text-ink-faint">
                بستن همه‌ی نشست‌های فعال حساب کاربری به جز این مرورگر
              </div>
            </div>

            <label className="relative inline-block h-[26px] w-[46px] shrink-0 cursor-pointer">
              <input
                type="checkbox"
                checked={logoutOthers}
                onChange={(e) => setLogoutOthers(e.target.checked)}
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
            <span>به‌روزرسانی رمز عبور</span>
          </button>

          {saved && (
            <span className="mr-auto inline-flex items-center gap-[6px] rounded-full bg-[#E0F2FE] px-[12px] py-[5px] text-[12.5px] font-bold text-[#0284C7] animate-in fade-in duration-200">
              <Check className="h-[15px] w-[15px]" />
              رمز عبور با موفقیت به رمز جدید تغییر یافت و جایگزین گردید
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
