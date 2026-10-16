"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/persian-digits";
import { ClassSession, DayOfWeek } from "./types";
import { Users, Clock, MapPin } from "lucide-react";

interface ClassesDayViewProps {
  classes: ClassSession[];
  onSelectClass: (cls: ClassSession) => void;
  onAddNewClass: () => void;
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

export function ClassesDayView({
  classes,
  onSelectClass,
  onAddNewClass,
}: ClassesDayViewProps) {
  const todayDayIdx = (new Date().getDay() + 1) % 7;
  const todayDayName = DAYS[todayDayIdx] || "چهارشنبه";
  const [activeDay, setActiveDay] = useState<DayOfWeek>(todayDayName);

  const normalizeDay = (d?: string) => (d || "").replace(/[\u200C\s]/g, "").trim();
  const dayClasses = classes
    .filter((c) => normalizeDay(c.day) === normalizeDay(activeDay))
    .sort((a, b) => a.time.localeCompare(b.time));

  const getThemeStyles = (theme: ClassSession["theme"]) => {
    switch (theme) {
      case "cyan":
        return {
          badge: "bg-[rgba(14,165,233,0.15)] text-[#0369A1]",
          bar: "bg-gradient-to-r from-cyan to-blue-500",
          border: "border-cyan/40",
        };
      case "amber":
        return {
          badge: "bg-[#FFFBEB] text-[#B45309]",
          bar: "bg-gradient-to-r from-[#F59E0B] to-[#EF4444]",
          border: "border-[#F59E0B]/40",
        };
      case "emerald":
      default:
        return {
          badge: "bg-tint text-primary-dark",
          bar: "bg-gradient-to-r from-primary to-cyan",
          border: "border-primary/40",
        };
    }
  };

  return (
    <div className="rounded-[16px] border border-border bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      {/* Day Selector Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-[14px] border-b border-border p-[18px_22px]">
        <div>
          <h3 className="text-[16px] font-extrabold text-ink">برنامه روزانه کلاس‌ها</h3>
          <div className="mt-[2px] text-[12.5px] text-ink-faint">
            مشاهده جزئیات جلسات به تفکیک ساعت و سالن
          </div>
        </div>

        {/* Day Tabs */}
        <div className="flex flex-wrap items-center gap-[6px] rounded-[12px] bg-bg p-[4px]">
          {DAYS.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setActiveDay(day)}
              className={cn(
                "rounded-[9px] px-[14px] py-[7px] text-[13px] font-bold transition-all duration-180",
                activeDay === day
                  ? "bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
                  : "text-ink-faint hover:text-ink",
              )}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Day Classes List */}
      <div className="p-[20px] min-[640px]:p-[24px]">
        {dayClasses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[48px] text-center">
            <div className="flex h-[56px] w-[56px] items-center justify-center rounded-[16px] bg-tint text-primary-dark">
              <Clock className="h-[28px] w-[28px]" />
            </div>
            <h4 className="mt-[16px] text-[16px] font-extrabold text-ink">
              هیچ کلاسی برای روز {activeDay} ثبت نشده است
            </h4>
            <p className="mt-[6px] text-[13px] text-ink-faint">
              می‌توانید برای این روز یک کلاس جدید اضافه کنید.
            </p>
            <button
              type="button"
              onClick={onAddNewClass}
              className="mt-[18px] inline-flex items-center gap-[8px] rounded-[12px] btn-ink-gradient px-[18px] py-[10px] text-[13.5px] font-bold text-white transition-all"
            >
              افزودن کلاس جدید
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-[16px] min-[768px]:grid-cols-2 min-[1200px]:grid-cols-3">
            {dayClasses.map((cls) => {
              const styles = getThemeStyles(cls.theme);
              const percent = Math.round((cls.enrolled / cls.capacity) * 100);
              const isFull = cls.enrolled >= cls.capacity;

              return (
                <div
                  key={cls.id}
                  onClick={() => onSelectClass(cls)}
                  className={cn(
                    "cursor-pointer rounded-[14px] border border-border bg-bg p-[18px] transition-all duration-200 hover:-translate-y-[2px] hover:border-primary/60 hover:bg-surface hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-[8px]">
                        <span
                          className={cn(
                            "rounded-[8px] px-[9px] py-[3px] text-[11.5px] font-extrabold",
                            styles.badge,
                          )}
                        >
                          {cls.category}
                        </span>
                        <span className="text-[12px] font-bold text-ink-faint">
                          {cls.level}
                        </span>
                      </div>
                      <h4 className="mt-[8px] text-[16px] font-black text-ink">
                        {cls.name}
                      </h4>
                    </div>

                    <div className="rounded-[10px] bg-surface px-[10px] py-[6px] text-center font-extrabold text-ink shadow-xs border border-border">
                      <div className="text-[14px] text-ink">{toPersianDigits(cls.time)}</div>
                      <div className="text-[10px] text-ink-faint">
                        {cls.endTime ? `تا ${toPersianDigits(cls.endTime)}` : "۹۰ دقیقه"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-[16px] space-y-[8px] text-[12.5px] text-ink-soft">
                    <div className="flex items-center gap-[8px]">
                      <Users className="h-[15px] w-[15px] text-ink-faint shrink-0" />
                      <span>
                        مربی:{" "}
                        <strong className="font-bold text-ink">{cls.coach}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-[8px]">
                      <MapPin className="h-[15px] w-[15px] text-ink-faint shrink-0" />
                      <span>{cls.room}</span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-[16px] border-t border-border pt-[12px]">
                    <div className="flex items-center justify-between text-[11.5px] font-bold">
                      <span className="text-ink-faint">ظرفیت کلاس:</span>
                      <span
                        className={
                          isFull
                            ? "text-[#DC2626]"
                            : percent >= 80
                              ? "text-[#D97706]"
                              : "text-primary-dark"
                        }
                      >
                        {toPersianDigits(cls.enrolled)} از {toPersianDigits(cls.capacity)} نفر ({toPersianDigits(percent)}٪)
                      </span>
                    </div>
                    <div className="mt-[6px] h-[6px] overflow-hidden rounded-full bg-border">
                      <div
                        className={cn("h-full rounded-full transition-all duration-300", styles.bar)}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
