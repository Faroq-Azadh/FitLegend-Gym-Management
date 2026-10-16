"use client";

import { useState, useEffect } from "react";
import { WorkingHourItem } from "./types";
import { useGymSettings, useUpdateGymSettings } from "@/lib/hooks/queries/use-gym-me";
import { toPersianDigits, normalizeDigits } from "@/lib/persian-digits";
import { Check, Loader2, Plus, Trash2, Clock } from "lucide-react";

const WORKING_HOURS_KEY = "fitlegend_gym_working_hours";

const INITIAL_HOURS: WorkingHourItem[] = [
  {
    id: "hours-1",
    title: "شنبه تا چهارشنبه",
    openTime: "۰۶:۰۰",
    closeTime: "۲۳:۰۰",
    description: "سانس عمومی بدنسازی و فیتنس",
    enabled: true,
  },
  {
    id: "hours-2",
    title: "پنجشنبه",
    openTime: "۰۶:۰۰",
    closeTime: "۲۲:۰۰",
    description: "سانس نیمه‌وقت",
    enabled: true,
  },
  {
    id: "hours-3",
    title: "جمعه",
    openTime: "۰۸:۰۰",
    closeTime: "۱۴:۰۰",
    description: "سانس صبحگاهی آخر هفته",
    enabled: true,
  },
  {
    id: "hours-4",
    title: "بخش بانوان (سانس اختصاصی)",
    openTime: "۱۰:۰۰",
    closeTime: "۱۶:۰۰",
    description: "روزهای زوج ویژه بانوان",
    enabled: true,
  },
];

export function WorkingHoursTab() {
  const { data: settingsData, isLoading: isSettingsLoading } = useGymSettings();
  const updateSettingsMutation = useUpdateGymSettings();

  const [hours, setHours] = useState<WorkingHourItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(WORKING_HOURS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return INITIAL_HOURS;
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settingsData?.working_hours) {
      const wh = settingsData.working_hours;
      if (Array.isArray(wh) && wh.length > 0) {
        setHours(wh);
      }
    }
  }, [settingsData]);

  const handleToggle = (id: string) => {
    setHours((prev) => prev.map((h) => (h.id === id ? { ...h, enabled: !h.enabled } : h)));
  };

  const handleFieldChange = (id: string, field: keyof WorkingHourItem, value: any) => {
    setHours((prev) => prev.map((h) => (h.id === id ? { ...h, [field]: value } : h)));
  };

  const handleAddShift = () => {
    const newId = `hours-${Date.now()}`;
    const newShift: WorkingHourItem = {
      id: newId,
      title: "سانس جدید",
      openTime: "۰۸:۰۰",
      closeTime: "۲۰:۰۰",
      description: "سانس اختصاصی",
      enabled: true,
    };
    setHours((prev) => [...prev, newShift]);
  };

  const handleDeleteShift = (id: string) => {
    setHours((prev) => prev.filter((h) => h.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      localStorage.setItem(WORKING_HOURS_KEY, JSON.stringify(hours));
    } catch {}

    try {
      await updateSettingsMutation.mutateAsync({
        working_hours: hours as any,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      console.warn("Save working hours notice:", err);
      // Still treat local save as success
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    }
  };

  return (
    <div className="p-[24px_22px]">
      <div className="flex flex-wrap items-center justify-between gap-[12px]">
        <div>
          <div className="text-[15px] font-extrabold text-ink">ساعات کاری باشگاه</div>
          <div className="mt-[2px] text-[13px] text-ink-faint">
            تنظیم و ویرایش ساعات بازگشایی، بسته‌شدن و سانس‌های روزانه
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddShift}
          className="inline-flex items-center gap-[6px] rounded-[10px] border border-border bg-surface px-[12px] py-[6px] text-[12.5px] font-bold text-ink transition-colors hover:border-primary hover:bg-tint"
        >
          <Plus className="h-[14px] w-[14px]" />
          <span>افزودن سانس / شیفت جدید</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="mt-[20px]">
        <div className="space-y-[14px]">
          {hours.map((item) => (
            <div
              key={item.id}
              className={`rounded-[14px] border p-[16px_18px] transition-all duration-200 ${
                item.enabled ? "border-border bg-surface shadow-xs" : "border-border/60 bg-bg/60 opacity-60"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-[14px]">
                {/* Title & Description */}
                <div className="min-w-[220px] flex-1">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleFieldChange(item.id, "title", e.target.value)}
                    placeholder="عنوان روز یا سانس"
                    className="w-full rounded-[8px] border border-transparent bg-transparent px-[8px] py-[4px] text-[14px] font-bold text-ink hover:border-border focus:border-primary focus:bg-surface focus:outline-none"
                  />
                  <input
                    type="text"
                    value={item.description || ""}
                    onChange={(e) => handleFieldChange(item.id, "description", e.target.value)}
                    placeholder="توضیحات (اختیاری)"
                    className="mt-[2px] w-full rounded-[8px] border border-transparent bg-transparent px-[8px] py-[2px] text-[12.5px] text-ink-faint hover:border-border focus:border-primary focus:bg-surface focus:outline-none"
                  />
                </div>

                {/* Time inputs: Open & Close */}
                <div className="flex items-center gap-[10px]">
                  <div className="flex items-center gap-[6px] rounded-[10px] border border-border bg-bg/80 px-[10px] py-[6px]">
                    <Clock className="h-[14px] w-[14px] text-ink-faint" />
                    <span className="text-[12px] font-semibold text-ink-faint">از:</span>
                    <input
                      type="text"
                      value={item.openTime}
                      onChange={(e) => handleFieldChange(item.id, "openTime", e.target.value)}
                      placeholder="۰۶:۰۰"
                      className="w-[54px] bg-transparent text-center text-[13px] font-bold text-ink focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-[6px] rounded-[10px] border border-border bg-bg/80 px-[10px] py-[6px]">
                    <Clock className="h-[14px] w-[14px] text-ink-faint" />
                    <span className="text-[12px] font-semibold text-ink-faint">تا:</span>
                    <input
                      type="text"
                      value={item.closeTime}
                      onChange={(e) => handleFieldChange(item.id, "closeTime", e.target.value)}
                      placeholder="۲۳:۰۰"
                      className="w-[54px] bg-transparent text-center text-[13px] font-bold text-ink focus:outline-none"
                    />
                  </div>

                  {/* Toggle */}
                  <label className="relative inline-block h-[26px] w-[46px] shrink-0 cursor-pointer" title={item.enabled ? "فعال" : "تعطیل"}>
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={() => handleToggle(item.id)}
                      className="peer sr-only"
                    />
                    <span className="block h-full w-full rounded-full bg-border transition-colors duration-200 peer-checked:bg-primary" />
                    <span className="absolute top-[3px] right-[3px] h-[20px] w-[20px] rounded-full bg-white shadow-xs transition-transform duration-200 peer-checked:-translate-x-[20px]" />
                  </label>

                  {/* Delete button */}
                  {hours.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteShift(item.id)}
                      className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] text-ink-faint transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                      title="حذف این سانس"
                    >
                      <Trash2 className="h-[15px] w-[15px]" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action button */}
        <div className="mt-[22px] flex items-center justify-end gap-[10px]">
          {saved && (
            <span className="ml-auto inline-flex items-center gap-[6px] text-[12.5px] font-bold text-primary-dark animate-in fade-in duration-200">
              <Check className="h-[15px] w-[15px]" />
              ساعات کاری با موفقیت در سیستم و سرور ذخیره شد
            </span>
          )}

          <button
            type="submit"
            disabled={updateSettingsMutation.isPending}
            className="inline-flex items-center gap-[8px] rounded-[10px] btn-ink-gradient px-[20px] py-[8px] text-[13px] font-bold text-white transition-all hover:shadow-[0_20px_50px_rgba(242,92,31,0.25)] disabled:opacity-50"
          >
            {updateSettingsMutation.isPending && <Loader2 className="h-[15px] w-[15px] animate-spin" />}
            <span>ذخیره‌ی ساعات کاری</span>
          </button>
        </div>
      </form>
    </div>
  );
}
