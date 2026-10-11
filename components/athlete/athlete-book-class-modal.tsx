"use client";

import { useState } from "react";
import { toPersianDigits } from "@/lib/persian-digits";

interface ClassOption {
  id: string;
  name: string;
  coach: string;
  time: string;
  day: string;
  hall: string;
  capacityText: string;
  filledPercent: number;
}

const AVAILABLE_CLASSES: ClassOption[] = [
  {
    id: "1",
    name: "TRX و کاهش وزن",
    coach: "آرش رستمی",
    time: "۱۷:۳۰",
    day: "امروز",
    hall: "سالن هوازی",
    capacityText: "۱۳ از ۱۵ نفر (۲ جای خالی)",
    filledPercent: 87,
  },
  {
    id: "2",
    name: "فانکشنال و کراس",
    coach: "آرش رستمی",
    time: "۰۹:۳۰",
    day: "چهارشنبه",
    hall: "سالن کراس‌فیت",
    capacityText: "۱۹ از ۲۰ نفر (۱ جای خالی)",
    filledPercent: 95,
  },
  {
    id: "3",
    name: "پیلاتس پیشرفته",
    coach: "مهسا نظری",
    time: "۱۰:۰۰",
    day: "پنجشنبه",
    hall: "سالن ۲",
    capacityText: "۸ از ۱۲ نفر (۴ جای خالی)",
    filledPercent: 66,
  },
  {
    id: "4",
    name: "اسپینینگ استقامتی",
    coach: "کامران صادقی",
    time: "۱۸:۰۰",
    day: "شنبه",
    hall: "سالن اسپینینگ",
    capacityText: "۱۰ از ۱۶ نفر (۶ جای خالی)",
    filledPercent: 62,
  },
];

interface AthleteBookClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (className: string) => void;
}

export function AthleteBookClassModal({
  isOpen,
  onClose,
  onSuccess,
}: AthleteBookClassModalProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>("1");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleBook = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      const chosen = AVAILABLE_CLASSES.find((c) => c.id === selectedClassId);
      if (chosen && onSuccess) {
        onSuccess(chosen.name);
      }
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-[3px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-[500px] overflow-hidden rounded-[20px] border border-border bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-[18px_22px]">
          <div>
            <h3 className="text-[17px] font-extrabold text-ink">رزرو سریع کلاس</h3>
            <div className="text-[12px] text-ink-faint mt-0.5">
              کلاس مورد نظرتان را انتخاب کنید و جایگاه خود را ثبت نمایید
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-bg hover:text-ink"
            aria-label="بستن"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-[20px]">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-tint text-primary-dark mb-3">
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m5 12 5 5L20 7" />
                </svg>
              </div>
              <div className="text-[16px] font-extrabold text-ink">رزرو با موفقیت ثبت شد!</div>
              <div className="text-[13px] text-ink-faint mt-1">
                اطلاعات کلاس به لیست برنامه‌های شما افزوده شد.
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto mb-5">
                {AVAILABLE_CLASSES.map((c) => {
                  const isSelected = selectedClassId === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedClassId(c.id)}
                      className={`flex items-center gap-3.5 p-3.5 rounded-[14px] border transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-tint/30 shadow-sm"
                          : "border-border hover:border-slate-300 hover:bg-bg"
                      }`}
                    >
                      <div className="shrink-0 w-12 text-center bg-bg rounded-[10px] p-2 border border-border">
                        <div className="text-[14px] font-extrabold text-ink">{toPersianDigits(c.time)}</div>
                        <div className="text-[10.5px] text-ink-faint">{c.day}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[14px] font-bold text-ink">{c.name}</span>
                          <span className="text-[11.5px] font-semibold text-primary-dark">
                            {toPersianDigits(c.hall)}
                          </span>
                        </div>
                        <div className="text-[12px] text-ink-faint mt-0.5">
                          مربی: {c.coach}
                        </div>
                        <div className="mt-2">
                          <div className="h-1.5 w-full bg-bg rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-cyan rounded-full"
                              style={{ width: `${c.filledPercent}%` }}
                            />
                          </div>
                          <div className="text-[11px] text-ink-faint mt-1">
                            {toPersianDigits(c.capacityText)}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-border"
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="m5 12 5 5L20 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-outline btn-sm"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleBook}
                  className="btn btn-primary btn-sm min-w-[110px]"
                >
                  {isSubmitting ? "در حال ثبت…" : "تأیید و رزرو"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
