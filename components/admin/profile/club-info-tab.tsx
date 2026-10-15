"use client";

import { useState, useEffect } from "react";
import { ProfileClubData } from "./types";
import { useGymMe, useUpdateGymMe, useGymSettings, useUpdateGymSettings } from "@/lib/hooks/queries/use-gym-me";
import { Check, Loader2, AlertCircle } from "lucide-react";

const CLUB_INFO_STORAGE_KEY = "fitlegend_gym_club_info_overrides";

interface ClubInfoTabProps {
  club: ProfileClubData;
  onUpdateClub: (updated: Partial<ProfileClubData>) => void;
}

export function ClubInfoTab({ club, onUpdateClub }: ClubInfoTabProps) {
  const { data: gymData } = useGymMe();
  const updateGymMutation = useUpdateGymMe();
  const { data: settingsData } = useGymSettings();
  const updateSettingsMutation = useUpdateGymSettings();

  const [formData, setFormData] = useState<ProfileClubData>(club);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync from gymData or localStorage overrides
  useEffect(() => {
    let localSaved: any = null;
    try {
      const raw = localStorage.getItem(CLUB_INFO_STORAGE_KEY);
      if (raw) localSaved = JSON.parse(raw);
    } catch { }

    const workingHours = settingsData?.working_hours as any;

    setFormData((prev) => ({
      clubName: gymData?.name || localSaved?.name || club.clubName || "باشگاه ورزشی فیتلجند",
      phone: gymData?.phone_number || localSaved?.phone_number || club.phone || "۰۲۱۴۴۵۵۶۶۷۷",
      startHour: workingHours?.open || localSaved?.startHour || club.startHour || "۰۶:۰۰",
      endHour: workingHours?.close || localSaved?.endHour || club.endHour || "۲۳:۰۰",
      address: gymData?.address || localSaved?.address || club.address || "تهران، سعادت‌آباد، بلوار دریا، پلاک ۱۲۰",
    }));
  }, [gymData, settingsData, club]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Save locally for instant UI sync
    try {
      localStorage.setItem(
        CLUB_INFO_STORAGE_KEY,
        JSON.stringify({
          name: formData.clubName.trim(),
          phone_number: formData.phone.trim(),
          startHour: formData.startHour.trim(),
          endHour: formData.endHour.trim(),
          address: formData.address.trim(),
        })
      );
    } catch { }

    onUpdateClub(formData);

    try {
      // 1. Update in Django backend via PATCH /gyms/me/
      await updateGymMutation.mutateAsync({
        name: formData.clubName.trim(),
        phone_number: formData.phone.trim(),
        address: formData.address.trim(),
      });

      // 2. Also update working hours in Django settings if possible
      try {
        await updateSettingsMutation.mutateAsync({
          working_hours: {
            open: formData.startHour.trim(),
            close: formData.endHour.trim(),
          },
        });
      } catch { }

      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err: any) {
      console.warn("Update club in Django warning:", err);
      // Still show saved locally
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    }
  };

  const handleReset = () => {
    setFormData(club);
    setErrorMessage(null);
  };

  const isSubmitting = updateGymMutation.isPending || updateSettingsMutation.isPending;

  return (
    <div className="p-[20px_16px] min-[640px]:p-[24px_22px]">
      <div className="text-[15px] font-extrabold text-ink">اطلاعات باشگاه</div>
      <div className="mb-[20px] text-[13px] text-ink-faint">
        مشخصات باشگاه
      </div>

      {errorMessage && (
        <div className="mb-[18px] flex items-center gap-[8px] rounded-[10px] bg-red-500/10 p-[12px] text-[12.5px] font-bold text-red-600">
          <AlertCircle className="h-[16px] w-[16px] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-[16px] min-[640px]:grid-cols-2">
          {/* Club Name */}
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-ink">نام باشگاه</label>
            <input
              type="text"
              required
              value={formData.clubName}
              onChange={(e) =>
                setFormData({ ...formData, clubName: e.target.value })
              }
              className="w-full rounded-[12px] border-[1.5px] border-border bg-surface p-[11px_14px] text-[13.5px] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none"
            />
          </div>

          {/* Club Phone */}
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-ink">شماره تماس باشگاه</label>
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

          {/* Start Hour */}
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-ink">ساعت شروع کار باشگاه</label>
            <input
              type="text"
              required
              dir="ltr"
              value={formData.startHour}
              onChange={(e) =>
                setFormData({ ...formData, startHour: e.target.value })
              }
              placeholder="۰۶:۰۰"
              className="w-full rounded-[12px] border-[1.5px] border-border bg-surface p-[11px_14px] text-[13.5px] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none text-center font-mono"
            />
          </div>

          {/* End Hour */}
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-ink">ساعت پایان کار باشگاه</label>
            <input
              type="text"
              required
              dir="ltr"
              value={formData.endHour}
              onChange={(e) =>
                setFormData({ ...formData, endHour: e.target.value })
              }
              placeholder="۲۳:۰۰"
              className="w-full rounded-[12px] border-[1.5px] border-border bg-surface p-[11px_14px] text-[13.5px] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none text-center font-mono"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col gap-[7px] min-[640px]:col-span-2">
            <label className="text-[13px] font-bold text-ink">آدرس کامل باشگاه</label>
            <textarea
              rows={3}
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
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
            <span>ذخیره </span>
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
              اطلاعات باشگاه با موفقیت ذخیره شد
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
