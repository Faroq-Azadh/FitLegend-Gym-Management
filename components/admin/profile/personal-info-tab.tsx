"use client";

import { useState, useEffect } from "react";
import { ProfileUserData } from "./types";
import { useAuth } from "@/lib/auth-context";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { getSavedManagerAvatar, saveManagerAvatar } from "@/lib/manager-avatar";

interface PersonalInfoTabProps {
  user: ProfileUserData;
  onUpdateUser: (updated: Partial<ProfileUserData>) => void;
}

export function PersonalInfoTab({ user, onUpdateUser }: PersonalInfoTabProps) {
  const { user: authUser, updateUser } = useAuth();
  const [formData, setFormData] = useState<ProfileUserData>(user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync when parent user or authUser changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      firstName: user.firstName || prev.firstName,
      lastName: user.lastName || prev.lastName,
      email: user.email || prev.email,
      phone: user.phone || prev.phone,
      about: user.about || prev.about,
      language: user.language || prev.language,
      role: user.role || prev.role,
    }));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const currentAvatar = user.avatarUrl || getSavedManagerAvatar(authUser?.email || (authUser ? String(authUser.id) : null)) || undefined;
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    try {
      if (currentAvatar) {
        saveManagerAvatar(currentAvatar, authUser?.email || (authUser ? String(authUser.id) : null));
      }

      // 1. Update in Django backend via PATCH /users/me/
      await updateUser({
        full_name: fullName,
        phone_number: formData.phone.trim(),
        language: formData.language === "English" ? "en" : "fa",
        avatar: currentAvatar || undefined,
      });

      // 2. Also update parent state for immediate UI reflection in summary card
      onUpdateUser({ ...formData, avatarUrl: currentAvatar });

      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err: any) {
      console.warn("Update user profile in Django warning:", err);
      // Still persist locally
      if (currentAvatar) {
        saveManagerAvatar(currentAvatar, authUser?.email || (authUser ? String(authUser.id) : null));
      }
      onUpdateUser({ ...formData, avatarUrl: currentAvatar });
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(user);
    setErrorMessage(null);
  };

  return (
    <div className="p-[20px_16px] min-[640px]:p-[24px_22px]">
      <div className="text-[15px] font-extrabold text-ink">اطلاعات شخصی مدیر</div>
      <div className="mb-[20px] text-[13px] text-ink-faint">
        اطلاعات حساب کاربری شما
      </div>

      {errorMessage && (
        <div className="mb-[18px] flex items-center gap-[8px] rounded-[10px] bg-red-500/10 p-[12px] text-[12.5px] font-bold text-red-600">
          <AlertCircle className="h-[16px] w-[16px] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-[16px] min-[640px]:grid-cols-2">
          {/* First Name */}
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-ink">نام</label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              className="w-full rounded-[12px] border-[1.5px] border-border bg-surface p-[11px_14px] text-[13.5px] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none"
            />
          </div>

          {/* Last Name */}
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-ink">نام خانوادگی</label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              className="w-full rounded-[12px] border-[1.5px] border-border bg-surface p-[11px_14px] text-[13.5px] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none"
            />
          </div>

          {/* Email (Read-only as per Django User serializer) */}
          <div className="flex flex-col gap-[7px]">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-ink">ایمیل (حساب کاربری)</label>
              <span className="text-[11px] font-semibold text-ink-faint">شناسه غیرقابل تغییر</span>
            </div>
            <input
              type="email"
              disabled
              value={formData.email || (authUser?.email ?? "admin@fitlegend.fit")}
              className="w-full rounded-[12px] border-[1.5px] border-border bg-bg/50 p-[11px_14px] text-[13.5px] text-ink-faint cursor-not-allowed outline-none"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-ink">شماره تماس (همراه)</label>
            <input
              type="tel"
              required
              dir="ltr"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full rounded-[12px] border-[1.5px] border-border bg-surface p-[11px_14px] text-[13.5px] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none text-right font-mono"
            />
          </div>

          {/* Role Select */}
          <div className="flex flex-col gap-[7px] min-[640px]:col-span-2">
            <label className="text-[13px] font-bold text-ink">نقش در سامانه</label>
            <div className="relative">
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="select-input w-full rounded-[12px] border-[1.5px] border-border bg-surface p-[11px_14px] text-[13.5px] font-medium text-ink focus:border-primary focus:bg-tint focus:outline-none"
              >
                <option value="مدیر باشگاه">مدیر باشگاه (Owner)</option>
                <option value="مدیر شعبه">مدیر شعبه</option>
                <option value="پذیرش">پذیرش</option>
              </select>
            </div>
          </div>

          {/* About */}
          <div className="flex flex-col gap-[7px] min-[640px]:col-span-2">
            <label className="text-[13px] font-bold text-ink">درباره مدیر / بیوگرافی</label>
            <textarea
              rows={3}
              placeholder="توضیح کوتاه درباره خودتان…"
              value={formData.about}
              onChange={(e) =>
                setFormData({ ...formData, about: e.target.value })
              }
              className="min-h-[84px] w-full resize-y rounded-[12px] border-[1.5px] border-border bg-surface p-[11px_14px] text-[13.5px] leading-[1.7] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-[22px] flex items-center justify-start gap-[10px] border-t border-border pt-[20px]">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-[6px] rounded-[10px] bg-ink px-[20px] py-[9px] text-[13px] font-bold text-white transition-all hover:bg-primary-dark hover:shadow-[0_20px_50px_rgba(22,224,160,0.25)] active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-[14px] w-[14px] animate-spin" /> : null}
            <span>ذخیره</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-[10px] border border-border bg-surface px-[16px] py-[9px] text-[13px] font-semibold text-ink-soft transition-colors hover:border-primary hover:bg-tint hover:text-ink"
          >
            بازنشانی
          </button>

          {saved && (
            <span className="mr-auto inline-flex items-center gap-[6px] rounded-full bg-tint px-[12px] py-[5px] text-[12.5px] font-bold text-primary-dark animate-in fade-in duration-200">
              <Check className="h-[15px] w-[15px]" />
              اطلاعات شخصی با موفقیت ذخیره شد
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
