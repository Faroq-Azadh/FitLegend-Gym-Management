"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";

interface CoachQuickSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionAdded?: (session: {
    studentName: string;
    workoutTitle: string;
    day: string;
    date: string;
    time: string;
    duration: number;
    notes?: string;
  }) => void;
}

const WEEKDAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];

export function CoachQuickSessionModal({
  isOpen,
  onClose,
  onSessionAdded,
}: CoachQuickSessionModalProps) {
  const [studentName, setStudentName] = useState("");
  const [workoutTitle, setWorkoutTitle] = useState("");
  const [day, setDay] = useState(WEEKDAYS[0]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("۱۸:۰۰");
  const [duration, setDuration] = useState("۶۰");
  const [notes, setNotes] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !workoutTitle.trim()) return;

    onSessionAdded?.({
      studentName: studentName.trim(),
      workoutTitle: workoutTitle.trim(),
      day,
      date,
      time,
      duration: parseInt(duration, 10) || 60,
      notes: notes.trim(),
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      setStudentName("");
      setWorkoutTitle("");
      setDay(WEEKDAYS[0]);
      setDate("");
      setNotes("");
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-[4px] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-[480px] rounded-[20px] border border-border bg-surface p-6 shadow-xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-tint text-primary-dark">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="h-5 w-5"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            <div>
              <h2 className="text-[17px] font-extrabold text-ink">ثبت جلسه تمرینی</h2>
              <p className="text-[12px] text-ink-faint">زمان‌بندی و ثبت حضور شاگرد</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-bg hover:text-ink"
            aria-label="بستن"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in duration-200">
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-tint text-primary-dark shadow-[0_4px_16px_rgba(22,224,160,0.3)]">
              <Check className="h-7 w-7 stroke-[3]" />
            </span>
            <h3 className="text-[17px] font-extrabold text-ink">جلسه با موفقیت ثبت شد</h3>
            <p className="mt-1 text-[13px] text-ink-faint">به لیست تمرین‌های امروز اضافه گردید</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-bold text-ink">
                نام شاگرد <span className="text-[#F43F5E]">*</span>
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="مثال: سارا محمدی"
                className="w-full rounded-[12px] border border-border bg-surface px-3.5 py-2.5 text-[13.5px] text-ink transition-colors focus:border-primary focus:bg-tint focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-bold text-ink">
                عنوان تمرین / برنامه <span className="text-[#F43F5E]">*</span>
              </label>
              <input
                type="text"
                required
                value={workoutTitle}
                onChange={(e) => setWorkoutTitle(e.target.value)}
                placeholder="مثال: سینه و زیربغل — هفته‌ی سوم"
                className="w-full rounded-[12px] border border-border bg-surface px-3.5 py-2.5 text-[13.5px] text-ink transition-colors focus:border-primary focus:bg-tint focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-ink">
                  روز جلسه <span className="text-[#F43F5E]">*</span>
                </label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full rounded-[12px] border border-border bg-surface px-3.5 py-2.5 text-[13.5px] text-ink transition-colors focus:border-primary focus:bg-tint focus:outline-none"
                >
                  {WEEKDAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-ink">
                  تاریخ <span className="text-[#F43F5E]">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-[12px] border border-border bg-surface px-3.5 py-2.5 text-[13.5px] text-ink transition-colors focus:border-primary focus:bg-tint focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-ink">ساعت جلسه</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="۱۸:۰۰"
                  className="w-full rounded-[12px] border border-border bg-surface px-3.5 py-2.5 text-[13.5px] text-ink transition-colors focus:border-primary focus:bg-tint focus:outline-none text-center"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-ink">مدت زمان (دقیقه)</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full rounded-[12px] border border-border bg-surface px-3.5 py-2.5 text-[13.5px] text-ink transition-colors focus:border-primary focus:bg-tint focus:outline-none"
                >
                  <option value="۳۰">۳۰ دقیقه</option>
                  <option value="۴۵">۴۵ دقیقه</option>
                  <option value="۶۰">۶۰ دقیقه</option>
                  <option value="۷۵">۷۵ دقیقه</option>
                  <option value="۹۰">۹۰ دقیقه</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-bold text-ink">یادداشت مربی (اختیاری)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="نکات تمرینی یا تأکید بر انجام حرکات اصلاحی..."
                className="w-full resize-none rounded-[12px] border border-border bg-surface px-3.5 py-2.5 text-[13.5px] text-ink transition-colors focus:border-primary focus:bg-tint focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="mt-2 flex items-center justify-end gap-2.5 border-t border-border pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline btn-sm"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
              >
                ثبت و تأیید جلسه
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
