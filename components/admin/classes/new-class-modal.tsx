"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ClassSession, DayOfWeek, TimeSlot, ClassTheme } from "./types";
import { useCoaches } from "@/lib/hooks/queries/use-coaches";
import { normalizeDigits, toPersianDigits } from "@/lib/persian-digits";
import { X, Loader2, AlertCircle } from "lucide-react";
import { logActivity } from "@/lib/activities-store";
import {
  isStaffMember,
  getDeletedCoachIds,
  getLocalCoachOverrides,
  normalizePersianName,
} from "@/lib/coaches-store";

interface NewClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: Omit<ClassSession, "id">, editId?: string) => Promise<void> | void;
  editClass?: ClassSession | null;
  defaultDay?: DayOfWeek;
  defaultTime?: TimeSlot;
}

const DAYS: DayOfWeek[] = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];

const CATEGORIES = [
  "بدنسازی",
  "یوگا",
  "فیتنس",
  "کراس‌فیت",
  "TRX",
  "پیلاتس",
  "اسپینینگ",
];

const DEFAULT_COACHES = [
  { id: "4dd8384d-ea66-4a4b-a44d-839124679bb8", name: "اسرا محمدی", short: "اسرا" },
  { id: "e905061f-266b-4d23-b964-2d9079452a41", name: "سینا رادمنش", short: "سینا" },
  { id: "6bc9512f-8860-4d30-b724-7137f19eba75", name: "صهیب رحیمی", short: "صهیب" },
  { id: "coach-arash", name: "آرش رضایی", short: "آرش" },
  { id: "coach-sepideh", name: "سپیده کاظمی", short: "سپیده" },
  { id: "coach-negar", name: "نگار اسدی", short: "نگار" },
  { id: "coach-behnam", name: "بهنام سعیدی", short: "بهنام" },
  { id: "coach-kaveh", name: "کاوه مرادی", short: "کاوه" },
  { id: "coach-maryam", name: "مریم توکلی", short: "مریم" },
];

export function NewClassModal({
  isOpen,
  onClose,
  onSave,
  editClass,
  defaultDay = "شنبه",
  defaultTime = "۰۸:۰۰",
}: NewClassModalProps) {
  const { data: coachesData } = useCoaches();

  const coachesList = useMemo(() => {
    const listMap = new Map<string, { id: string; name: string; short: string }>();

    const overrides = getLocalCoachOverrides();
    const deletedCoachIds = getDeletedCoachIds();

    // 1. Standard gym coaches (exclude if deleted or marked as staff)
    DEFAULT_COACHES.forEach((c) => {
      const idStr = String(c.id);
      if (deletedCoachIds.includes(idStr)) return;
      const norm = normalizePersianName(c.name);
      const override = overrides[idStr] || overrides[`name_${c.name}`] || overrides[`normname_${norm}`] || {};
      if (override.is_deleted || isStaffMember({}, override)) return;
      listMap.set(c.name, c);
    });

    // 2. Overrides from local storage (excluding staff & deleted)
    Object.entries(overrides).forEach(([id, obj]: [string, any]) => {
      if (id.startsWith("name_") || id.startsWith("normname_") || id.startsWith("phone_")) return;
      if (deletedCoachIds.includes(id)) return;
      if (obj.is_deleted || isStaffMember({}, obj)) return;

      const name = obj.name || obj.full_name;
      if (name) {
        listMap.set(name, {
          id,
          name,
          short: name.split(" ")[0],
        });
      }
    });

    // 3. Live coaches from backend (excluding staff & deleted)
    if (coachesData) {
      let raw: any[] = [];
      if (Array.isArray(coachesData)) {
        raw = coachesData;
      } else if (typeof coachesData === "object") {
        const b = coachesData as any;
        raw = Array.isArray(b.coaches)
          ? b.coaches
          : Array.isArray(b.results)
            ? b.results
            : Array.isArray(b.data?.coaches)
              ? b.data.coaches
              : Array.isArray(b.data?.results)
                ? b.data.results
                : Array.isArray(b.data)
                  ? b.data
                  : [];
      }

      raw.forEach((c: any) => {
        const idStr = String(c.id);
        if (deletedCoachIds.includes(idStr)) return;

        const name = (
          c.full_name ||
          (c.user && (c.user.full_name || `${c.user.first_name || ""} ${c.user.last_name || ""}`.trim())) ||
          `${c.first_name || ""} ${c.last_name || ""}`.trim() ||
          c.name
        )?.trim();

        if (!name) return;

        const norm = normalizePersianName(name);
        const override = overrides[idStr] || overrides[`name_${name}`] || overrides[`normname_${norm}`] || {};
        if (override.is_deleted || isStaffMember(c, override)) return;
        if (c.is_active === false && override.status !== "active") return;

        listMap.set(name, {
          id: idStr,
          name,
          short: (c.first_name || name).split(" ")[0],
        });
      });
    }

    return Array.from(listMap.values());
  }, [coachesData]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("بدنسازی");
  const [coachId, setCoachId] = useState<string>("");
  const [coachName, setCoachName] = useState<string>("");
  const [day, setDay] = useState<DayOfWeek>(defaultDay);
  const [time, setTime] = useState<TimeSlot>(defaultTime);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [endTime, setEndTime] = useState("۰۹:۰۰");
  const [capacity, setCapacity] = useState(20);
  const [enrolled, setEnrolled] = useState(0);
  const [room, setRoom] = useState("سالن اصلی بدنسازی");
  const [level, setLevel] = useState<ClassSession["level"]>("همه سطوح");
  const [theme, setTheme] = useState<ClassTheme>("emerald");
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Calculate end time helper
  const calculateEndTime = (startStr: string, duration: number) => {
    const clean = normalizeDigits(startStr).trim();
    const parts = clean.split(":");
    if (parts.length >= 2) {
      const h = parseInt(parts[0], 10) || 8;
      const m = parseInt(parts[1], 10) || 0;
      const totalMinutes = h * 60 + m + (duration || 60);
      const endH = Math.floor(totalMinutes / 60) % 24;
      const endM = totalMinutes % 60;
      return toPersianDigits(`${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`);
    }
    return "۰۹:۳۰";
  };

  useEffect(() => {
    if (editClass) {
      setName(editClass.name);
      setCategory(editClass.category || "بدنسازی");
      setCoachId(editClass.coachId || "");
      setCoachName(editClass.coach || "");
      setDay(editClass.day || defaultDay);
      setTime(editClass.time || defaultTime);
      const dur = editClass.durationMinutes || 60;
      setDurationMinutes(dur);
      setEndTime(editClass.endTime || calculateEndTime(editClass.time || "08:00", dur));
      setCapacity(editClass.capacity || 20);
      setEnrolled(editClass.enrolled || 0);
      setRoom(editClass.room || "سالن اصلی بدنسازی");
      setLevel(editClass.level || "همه سطوح");
      setTheme(editClass.theme || "emerald");
      setDescription(editClass.description || "");
    } else {
      setName("");
      setCategory("بدنسازی");
      setCoachId("");
      setCoachName("");
      setDay(defaultDay);
      setTime(defaultTime);
      setDurationMinutes(60);
      setEndTime(calculateEndTime(defaultTime, 60));
      setCapacity(20);
      setEnrolled(0);
      setRoom("سالن اصلی بدنسازی");
      setLevel("همه سطوح");
      setTheme("emerald");
      setDescription("");
    }
    setSubmitError(null);
  }, [editClass, defaultDay, defaultTime, isOpen]);

  // If coaches load, resolve coachId by name if missing
  useEffect(() => {
    if (!editClass && !coachId && coachesList.length > 0) {
      setCoachId(coachesList[0].id);
      setCoachName(coachesList[0].name);
    } else if (editClass && !coachId && coachesList.length > 0 && editClass.coach) {
      const found = coachesList.find((c) => c.name === editClass.coach);
      if (found) {
        setCoachId(found.id);
        setCoachName(found.name);
      }
    }
  }, [coachesList, editClass, coachId]);

  if (!isOpen) return null;

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    setEndTime(calculateEndTime(newTime, durationMinutes));
  };

  const handleDurationChange = (newDuration: number) => {
    setDurationMinutes(newDuration);
    setEndTime(calculateEndTime(time, newDuration));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setSubmitError("لطفاً نام کلاس را وارد کنید.");
      return;
    }

    const matchedCoach = coachesList.find((c) => c.id === coachId);
    const resolvedCoachName = matchedCoach ? matchedCoach.name : coachName || "بدون مربی";
    const coachShort = matchedCoach ? matchedCoach.short : resolvedCoachName.split(" ")[0];

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSave(
        {
          name: name.trim(),
          category,
          coach: resolvedCoachName,
          coachShort,
          coachId: coachId || null,
          day,
          time,
          endTime,
          durationMinutes: Number(durationMinutes) || 60,
          capacity: Number(capacity) || 20,
          enrolled: Number(enrolled) || 0,
          room,
          level,
          theme,
          description,
          isActive: true,
        },
        editClass?.id,
      );

      if (editClass) {
        logActivity({
          type: "EDIT",
          text: `ویرایش مشخصات کلاس «${name.trim()}»`,
        });
      } else {
        logActivity({
          type: "CLASS",
          text: `ایجاد کلاس جدید «${name.trim()}» با ظرفیت ${toPersianDigits(capacity)} نفر`,
        });
      }

      onClose();
    } catch (err: any) {
      console.error("Failed to save class:", err);
      let errorMsg = "خطا در برقراری ارتباط با سرور";
      if (err?.response?.data) {
        const d = err.response.data;
        if (typeof d === "string") {
          errorMsg = d;
        } else if (d.detail) {
          errorMsg = d.detail;
        } else if (typeof d === "object") {
          const firstKey = Object.keys(d)[0];
          const val = d[firstKey];
          errorMsg = `${firstKey}: ${Array.isArray(val) ? val.join("، ") : val}`;
        }
      } else if (err?.message) {
        errorMsg = err.message;
      }
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-[16px]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-[580px] overflow-hidden rounded-[20px] border border-border bg-surface shadow-[0_20px_60px_rgba(15,23,42,0.15)] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-bg/60 p-[20px_24px]">
          <div>
            <h3 className="text-[18px] font-black text-ink">
              {editClass ? "ویرایش کلاس" : "تعریف کلاس جدید"}
            </h3>
            <p className="mt-[2px] text-[12.5px] text-ink-faint">
              تنظیم مشخصات جلسه، مربی، زمان‌بندی و ظرفیت سالن
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] text-ink-faint transition-colors hover:bg-surface hover:text-ink"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="max-h-[72vh] space-y-[18px] overflow-y-auto p-[24px]">
            {/* Error Banner */}
            {submitError && (
              <div className="flex items-center gap-[10px] rounded-[12px] border border-[#FCA5A5] bg-[#FEF2F2] p-[12px_16px] text-[13px] font-bold text-[#DC2626]">
                <AlertCircle className="h-[18px] w-[18px] shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Class Name & Category */}
            <div className="grid grid-cols-1 gap-[14px] min-[480px]:grid-cols-2">
              <div>
                <label className="mb-[6px] block text-[12.5px] font-bold text-ink">
                  عنوان کلاس <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: بدنسازی پیشرفته"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-[12px] border border-border bg-surface p-[10px_14px] text-[13.5px] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-[6px] block text-[12.5px] font-bold text-ink">
                  رشته / دسته‌بندی
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCategory(val);
                    if (!name) setName(val);
                    if (val === "یوگا" || val === "فیتنس") setTheme("cyan");
                    else if (val === "کراس‌فیت" || val === "TRX") setTheme("amber");
                    else setTheme("emerald");
                  }}
                  className="select-input w-full rounded-[12px] border border-border bg-surface p-[10px_14px] text-[13.5px] text-ink focus:border-primary focus:bg-tint focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Coach & Room */}
            <div className="grid grid-cols-1 gap-[14px] min-[480px]:grid-cols-2">
              <div>
                <label className="mb-[6px] block text-[12.5px] font-bold text-ink">
                  مربی کلاس
                </label>
                <select
                  value={coachId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setCoachId(id);
                    const found = coachesList.find((c) => c.id === id);
                    if (found) setCoachName(found.name);
                    else setCoachName("");
                  }}
                  className="select-input w-full rounded-[12px] border border-border bg-surface p-[10px_14px] text-[13.5px] text-ink focus:border-primary focus:bg-tint focus:outline-none"
                >
                  <option value="">بدون مربی اختصاصی</option>
                  {coachesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-[6px] block text-[12.5px] font-bold text-ink">
                  سالن برگزاری
                </label>
                <input
                  type="text"
                  placeholder="مثال: سالن اصلی بدنسازی"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full rounded-[12px] border border-border bg-surface p-[10px_14px] text-[13.5px] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none"
                />
              </div>
            </div>

            {/* Day & Time Slot & Duration */}
            <div className="grid grid-cols-1 gap-[14px] min-[480px]:grid-cols-3">
              <div>
                <label className="mb-[6px] block text-[12.5px] font-bold text-ink">
                  روز برگزاری
                </label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value as DayOfWeek)}
                  className="select-input w-full rounded-[12px] border border-border bg-surface p-[10px_14px] text-[13.5px] text-ink focus:border-primary focus:bg-tint focus:outline-none"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-[6px] block text-[12.5px] font-bold text-ink">
                  ساعت شروع
                </label>
                <input
                  type="text"
                  placeholder="08:00"
                  value={time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full rounded-[12px] border border-border bg-surface p-[10px_14px] text-[13.5px] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-[6px] block text-[12.5px] font-bold text-ink">
                  مدت زمان (دقیقه)
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => handleDurationChange(Number(e.target.value))}
                  className="select-input w-full rounded-[12px] border border-border bg-surface p-[10px_14px] text-[13.5px] text-ink focus:border-primary focus:bg-tint focus:outline-none"
                >
                  <option value={45}>۴۵ دقیقه</option>
                  <option value={60}>۶۰ دقیقه (۱ ساعت)</option>
                  <option value={75}>۷۵ دقیقه (۱ ساعت و ربع)</option>
                  <option value={90}>۹۰ دقیقه (۱.۵ ساعت)</option>
                  <option value={120}>۱۲۰ دقیقه (۲ ساعت)</option>
                  {![45, 60, 75, 90, 120].includes(durationMinutes) && (
                    <option value={durationMinutes}>{toPersianDigits(durationMinutes)} دقیقه</option>
                  )}
                </select>
              </div>
            </div>

            {/* Capacity & Enrolled & Level */}
            <div className="grid grid-cols-1 gap-[14px] min-[480px]:grid-cols-3">
              <div>
                <label className="mb-[6px] block text-[12.5px] font-bold text-ink">
                  حداکثر ظرفیت (نفر)
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full rounded-[12px] border border-border bg-surface p-[10px_14px] text-[13.5px] text-ink focus:border-primary focus:bg-tint focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-[6px] block text-[12.5px] font-bold text-ink">
                  ساعت پایان محاسبه‌شده
                </label>
                <input
                  type="text"
                  disabled
                  value={endTime}
                  className="w-full rounded-[12px] border border-border bg-bg p-[10px_14px] text-[13.5px] font-bold text-ink-soft opacity-80"
                />
              </div>

              <div>
                <label className="mb-[6px] block text-[12.5px] font-bold text-ink">
                  سطح دوره
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as ClassSession["level"])}
                  className="select-input w-full rounded-[12px] border border-border bg-surface p-[10px_14px] text-[13.5px] text-ink focus:border-primary focus:bg-tint focus:outline-none"
                >
                  <option value="همه سطوح">همه سطوح</option>
                  <option value="مبتدی">مبتدی</option>
                  <option value="متوسط">متوسط</option>
                  <option value="پیشرفته">پیشرفته</option>
                </select>
              </div>
            </div>

            {/* Theme Badge Picker */}
            <div>
              <label className="mb-[8px] block text-[12.5px] font-bold text-ink">
                رنگ کارت در تقویم
              </label>
              <div className="flex flex-wrap gap-[10px]">
                <button
                  type="button"
                  onClick={() => setTheme("emerald")}
                  className={cn(
                    "flex items-center gap-[8px] rounded-[10px] border p-[8px_14px] text-[12.5px] font-bold transition-all",
                    theme === "emerald"
                      ? "border-primary bg-tint text-primary-dark ring-2 ring-primary/40"
                      : "border-border bg-surface text-ink-soft hover:bg-bg",
                  )}
                >
                  <span className="h-[12px] w-[12px] rounded-full bg-primary-dark" />
                  نارنجی (بدنسازی)
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("cyan")}
                  className={cn(
                    "flex items-center gap-[8px] rounded-[10px] border p-[8px_14px] text-[12.5px] font-bold transition-all",
                    theme === "cyan"
                      ? "border-[#0EA5E9] bg-[rgba(14,165,233,0.15)] text-[#0369A1] ring-2 ring-[#0EA5E9]/40"
                      : "border-border bg-surface text-ink-soft hover:bg-bg",
                  )}
                >
                  <span className="h-[12px] w-[12px] rounded-full bg-[#0369A1]" />
                  آبی (یوگا / فیتنس)
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("amber")}
                  className={cn(
                    "flex items-center gap-[8px] rounded-[10px] border p-[8px_14px] text-[12.5px] font-bold transition-all",
                    theme === "amber"
                      ? "border-[#F59E0B] bg-[#FFFBEB] text-[#B45309] ring-2 ring-[#F59E0B]/40"
                      : "border-border bg-surface text-ink-soft hover:bg-bg",
                  )}
                >
                  <span className="h-[12px] w-[12px] rounded-full bg-[#F59E0B]" />
                  کهربایی (کراس‌فیت / TRX)
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-[6px] block text-[12.5px] font-bold text-ink">
                توضیحات و اهداف دوره
              </label>
              <textarea
                rows={2}
                placeholder="توضیحات کوتاه در مورد تمرینات و لوازم مورد نیاز..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-[12px] border border-border bg-surface p-[10px_14px] text-[13px] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-[10px] border-t border-border bg-bg/50 p-[16px_24px]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-[10px] border border-border bg-surface px-[16px] py-[9px] text-[13px] font-bold text-ink-soft transition-colors hover:bg-bg hover:text-ink disabled:opacity-50"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-[8px] rounded-[10px] btn-ink-gradient px-[20px] py-[9px] text-[13.5px] font-bold text-white transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-[16px] w-[16px] animate-spin" />
                  <span>در حال ذخیره در سرور...</span>
                </>
              ) : (
                <span>{editClass ? "ذخیره تغییرات" : "ثبت و ایجاد کلاس"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
