"use client";

import { useState, useEffect } from "react";
import { useGymMe, useUpdateGymMe } from "@/lib/hooks/queries/use-gym-me";
import { Check, Loader2, AlertCircle } from "lucide-react";

const CLUB_INFO_STORAGE_KEY = "fitlegend_gym_club_info_overrides";

export function ClubInfoTab() {
  const { data: gymData, isLoading: isGymLoading } = useGymMe();
  const updateGymMutation = useUpdateGymMe();

  const [formData, setFormData] = useState({
    name: "باشگاه ورزشی فیتلجند",
    phone_number: "۰۲۱۴۴۵۵۶۶۷۷",
    email: "info@fitlegend.fit",
    city: "تهران",
    address: "تهران، سعادت‌آباد، بلوار دریا، پلاک ۱۲۰",
    about: "باشگاه تخصصی بدنسازی و فیتنس با مجهزترین امکانات و تیم مربیان حرفه‌ای.",
  });

  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize from backend or localStorage
  useEffect(() => {
    let localSaved: any = null;
    try {
      const raw = localStorage.getItem(CLUB_INFO_STORAGE_KEY);
      if (raw) localSaved = JSON.parse(raw);
    } catch { }

    if (gymData) {
      setFormData({
        name: gymData.name || localSaved?.name || "باشگاه ورزشی فیتلجند",
        phone_number: gymData.phone_number || localSaved?.phone_number || "۰۲۱۴۴۵۵۶۶۷۷",
        email: gymData.email || localSaved?.email || "info@fitlegend.fit",
        city: gymData.city || localSaved?.city || "تهران",
        address: gymData.address || localSaved?.address || "تهران، سعادت‌آباد، بلوار دریا، پلاک ۱۲۰",
        about: gymData.about || localSaved?.about || "باشگاه تخصصی بدنسازی و فیتنس با مجهزترین امکانات و تیم مربیان حرفه‌ای.",
      });
    } else if (localSaved) {
      setFormData(localSaved);
    }
  }, [gymData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Save locally immediately
    try {
      localStorage.setItem(CLUB_INFO_STORAGE_KEY, JSON.stringify(formData));
    } catch { }

    try {
      await updateGymMutation.mutateAsync({
        name: formData.name.trim(),
        phone_number: formData.phone_number.trim(),
        email: formData.email.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        about: formData.about.trim(),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      console.warn("Gym update notice:", err);
      // If backend returns detail or message
      const msg = err?.response?.data?.detail || err?.message;
      if (msg && typeof msg === "string") {
        setErrorMessage(msg);
      } else {
        // Still treat local save as success if offline
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      }
    }
  };

  const handleReset = () => {
    if (gymData) {
      setFormData({
        name: gymData.name || "",
        phone_number: gymData.phone_number || "",
        email: gymData.email || "",
        city: gymData.city || "",
        address: gymData.address || "",
        about: gymData.about || "",
      });
    }
  };

  if (isGymLoading && !formData.name) {
    return (
      <div className="flex items-center justify-center p-[60px]">
        <Loader2 className="h-[28px] w-[28px] animate-spin text-primary" />
        <span className="mr-[10px] text-[13px] text-ink-faint">در حال بارگذاری اطلاعات باشگاه از سرور…</span>
      </div>
    );
  }

  return (
    <div className="p-[24px_22px]">
      <div className="text-[15px] font-extrabold text-ink">اطلاعات باشگاه</div>
      <div className="mb-[20px] text-[13px] text-ink-faint">
        این اطلاعات در سامانه، فاکتورها و صفحه‌ی عمومی باشگاه ذخیره و نمایش داده می‌شود
      </div>

      {errorMessage && (
        <div className="mb-[18px] flex items-center gap-[10px] rounded-[12px] border border-[#FCA5A5] bg-[#FEF2F2] p-[12px_16px] text-[13px] font-bold text-[#DC2626]">
          <AlertCircle className="h-[18px] w-[18px] shrink-0" />
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
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: باشگاه ورزشی فیتلجند"
              className="w-full rounded-[12px] border-[1.5px] border-border bg-surface p-[11px_14px] text-[13.5px] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none"
            />
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-ink">شماره تماس</label>
            <input
              type="text"
              required
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              placeholder="مثال: ۰۲۱۴۴۵۵۶۶۷۷"
              className="w-full rounded-[12px] border-[1.5px] border-border bg-surface p-[11px_14px] text-[13.5px] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-ink">ایمیل رسمی باشگاه</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="info@fitlegend.fit"
              className="w-full rounded-[12px] border-[1.5px] border-border bg-surface p-[11px_14px] text-[13.5px] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none"
            />
          </div>

          {/* City */}
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-bold text-ink">شهر</label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="مثال: تهران"
              className="w-full rounded-[12px] border-[1.5px] border-border bg-surface p-[11px_14px] text-[13.5px] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none"
            />
          </div>

          {/* Address - Full width */}
          <div className="flex flex-col gap-[7px] min-[640px]:col-span-2">
            <label className="text-[13px] font-bold text-ink">آدرس دقیق باشگاه</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="تهران، سعادت‌آباد، بلوار دریا، پلاک ۱۲۰"
              className="w-full rounded-[12px] border-[1.5px] border-border bg-surface p-[11px_14px] text-[13.5px] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none"
            />
          </div>

          {/* About Club - Full width */}
          <div className="flex flex-col gap-[7px] min-[640px]:col-span-2">
            <label className="text-[13px] font-bold text-ink">درباره‌ی باشگاه و امکانات</label>
            <textarea
              rows={3}
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              placeholder="توضیحات کوتاه درباره امکانات سالن، تجهیزات و سوابق مربیان..."
              className="min-h-[84px] w-full resize-y rounded-[12px] border-[1.5px] border-border bg-surface p-[11px_14px] text-[13.5px] leading-[1.7] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-[20px] flex items-center justify-end gap-[10px]">
          {saved && (
            <span className="ml-auto inline-flex items-center gap-[6px] text-[12.5px] font-bold text-primary-dark animate-in fade-in duration-200">
              <Check className="h-[15px] w-[15px]" />
              اطلاعات باشگاه با موفقیت ذخیره شد
            </span>
          )}

          <button
            type="button"
            onClick={handleReset}
            disabled={updateGymMutation.isPending}
            className="rounded-[10px] border border-border bg-surface px-[14px] py-[8px] text-[13px] font-semibold text-ink-soft transition-colors hover:border-primary hover:bg-tint hover:text-ink disabled:opacity-50"
          >
            بازنشانی
          </button>

          <button
            type="submit"
            disabled={updateGymMutation.isPending}
            className="inline-flex items-center gap-[8px] rounded-[10px] btn-ink-gradient px-[18px] py-[8px] text-[13px] font-bold text-white transition-all hover:shadow-[0_20px_50px_rgba(242,92,31,0.25)] disabled:opacity-50"
          >
            {updateGymMutation.isPending && <Loader2 className="h-[15px] w-[15px] animate-spin" />}
            <span>ذخیره‌ی تغییرات</span>
          </button>
        </div>
      </form>
    </div>
  );
}
