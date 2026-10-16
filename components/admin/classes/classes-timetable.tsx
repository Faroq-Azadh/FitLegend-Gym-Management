"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { toPersianDigits, normalizeDigits } from "@/lib/persian-digits";
import { ClassSession, DayOfWeek, TimeSlot } from "./types";

interface ClassesTimetableProps {
  classes: ClassSession[];
  onSelectClass: (cls: ClassSession) => void;
  onAddClassAtSlot?: (day: DayOfWeek, time: TimeSlot) => void;
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

export function ClassesTimetable({
  classes,
  onSelectClass,
  onAddClassAtSlot,
}: ClassesTimetableProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeCellId, setActiveCellId] = useState<string | null>(null);

  const timeSlots = useMemo(() => {
    const defaultSlots = ["۰۸:۰۰", "۱۰:۰۰", "۱۱:۰۰", "۱۷:۰۰", "۱۹:۳۰"];
    const set = new Set<string>(defaultSlots);
    classes.forEach((c) => {
      if (c.time) set.add(c.time);
    });
    return Array.from(set).sort((a, b) => {
      const aEng = normalizeDigits(a);
      const bEng = normalizeDigits(b);
      return aEng.localeCompare(bEng);
    });
  }, [classes]);

  const categories = [
    { id: "all", label: "همه رشته‌ها" },
    { id: "بدنسازی", label: "بدنسازی" },
    { id: "یوگا", label: "یوگا" },
    { id: "فیتنس", label: "فیتنس" },
    { id: "کراس‌فیت", label: "کراس‌فیت" },
    { id: "TRX", label: "TRX" },
  ];

  const filteredClasses = classes.filter((cls) => {
    if (selectedCategory === "all") return true;
    return cls.category === selectedCategory;
  });

  const getClassForSlot = (day: DayOfWeek, time: TimeSlot) => {
    return filteredClasses.find((c) => c.day === day && c.time === time);
  };

  const getThemeClasses = (theme: ClassSession["theme"]) => {
    switch (theme) {
      case "cyan":
        return {
          container:
            "bg-[rgba(14,165,233,0.12)] border-[#0EA5E9] hover:bg-[rgba(14,165,233,0.2)]",
          title: "text-[#0369A1]",
          meta: "text-ink-soft",
        };
      case "amber":
        return {
          container: "bg-[#FFFBEB] border-[#F59E0B] hover:bg-[#FEF3C7]",
          title: "text-[#B45309]",
          meta: "text-ink-soft",
        };
      case "emerald":
      default:
        return {
          container: "bg-tint border-primary hover:bg-[#FFE8DA]",
          title: "text-primary-dark",
          meta: "text-ink-soft",
        };
    }
  };

  return (
    <div className="rounded-[16px] border border-border bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-[14px] border-b border-border p-[20px_22px]">
        <div className="flex items-center gap-[12px]">
          <div>
            <h3 className="text-[16px] font-extrabold text-ink">تقویم هفتگی</h3>
            <div className="mt-[2px] text-[12.5px] text-ink-faint">
              شنبه تا پنجشنبه
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-[10px]">
          {/* Category Filter Pills */}
          <div className="hidden items-center gap-[4px] rounded-[10px] bg-bg p-[4px] min-[768px]:flex">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "rounded-[7px] px-[10px] py-[5px] text-[12px] font-bold transition-all duration-150",
                  selectedCategory === cat.id
                    ? "bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                    : "text-ink-faint hover:text-ink",
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <span className="inline-flex items-center gap-[6px] rounded-full bg-tint px-[10px] py-[4px] text-[12px] font-bold text-primary-dark">
            <span className="h-[6px] w-[6px] rounded-full bg-primary-dark animate-pulse" />
            هفته‌ی جاری
          </span>
        </div>
      </div>

      {/* Mobile Category Filters */}
      <div className="flex overflow-x-auto border-b border-border p-[12px_16px] min-[768px]:hidden">
        <div className="flex gap-[6px]">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "shrink-0 rounded-[8px] px-[12px] py-[6px] text-[12px] font-bold transition-all",
                selectedCategory === cat.id
                  ? "btn-ink-gradient text-white"
                  : "bg-bg text-ink-soft hover:bg-tint",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Card Body - Timetable */}
      <div className="p-[16px] min-[640px]:p-[22px]">
        <div className="overflow-x-auto">
          <div className="grid min-w-[780px] grid-cols-[64px_repeat(7,1fr)] gap-[8px]">
            {/* Header Row */}
            <div className="flex items-center justify-center text-[11.5px] font-bold text-ink-faint">
              زمان
            </div>
            {DAYS.map((day) => (
              <div
                key={day}
                className="py-[8px] text-center text-[12px] font-extrabold text-ink"
              >
                {day}
              </div>
            ))}

            {/* Time Slot Rows */}
            {timeSlots.map((time) => (
              <div key={time} className="contents">
                {/* Time column */}
                <div className="flex items-center justify-center text-[11.5px] font-bold text-ink-faint">
                  {toPersianDigits(time)}
                </div>

                {/* Day cells for this time */}
                {DAYS.map((day) => {
                  const classItem = getClassForSlot(day, time);
                  const isSelected = classItem && activeCellId === classItem.id;

                  return (
                    <div
                      key={`${day}-${time}`}
                      className="group relative min-h-[64px] rounded-[10px] bg-bg p-[6px] transition-colors hover:bg-[#F3F4F6]"
                    >
                      {classItem ? (
                        (() => {
                          const themeStyles = getThemeClasses(classItem.theme);
                          const isFull = classItem.enrolled >= classItem.capacity;

                          return (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveCellId(classItem.id);
                                onSelectClass(classItem);
                              }}
                              className={cn(
                                "flex h-full w-full flex-col justify-center rounded-[9px] border p-[7px_8px] text-right transition-all duration-150 active:scale-[0.98]",
                                themeStyles.container,
                                isSelected
                                  ? "ring-2 ring-primary-dark ring-offset-1"
                                  : "hover:-translate-y-[1px] hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)]",
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div
                                  className={cn(
                                    "text-[11.5px] font-extrabold",
                                    themeStyles.title,
                                  )}
                                >
                                  {classItem.name}
                                </div>
                                {isFull && (
                                  <span className="rounded-[4px] bg-[#FEF2F2] px-[4px] py-[1px] text-[9.5px] font-black text-[#DC2626]">
                                    تکمیل
                                  </span>
                                )}
                              </div>
                              <div
                                className={cn(
                                  "mt-[2px] text-[10.5px]",
                                  themeStyles.meta,
                                )}
                              >
                                {classItem.coachShort} · {toPersianDigits(classItem.enrolled)}/
                                {toPersianDigits(classItem.capacity)}
                              </div>
                            </button>
                          );
                        })()
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAddClassAtSlot?.(day, time)}
                          className="flex h-full w-full items-center justify-center rounded-[8px] border border-dashed border-transparent text-ink-faint/40 opacity-0 transition-all group-hover:border-border group-hover:opacity-100 hover:text-primary-dark"
                          title="افزودن کلاس در این ساعت"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-[16px] w-[16px]"
                          >
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Footnote / Legend */}
        <div className="mt-[20px] flex flex-wrap items-center justify-between gap-[12px] border-t border-border pt-[16px] text-[12px] text-ink-faint">
          <div className="flex flex-wrap items-center gap-[16px]">
            <div className="flex items-center gap-[6px]">
              <span className="h-[10px] w-[10px] rounded-full border border-primary bg-tint" />
              <span>بدنسازی و قدرتی</span>
            </div>
            <div className="flex items-center gap-[6px]">
              <span className="h-[10px] w-[10px] rounded-full border border-[#0EA5E9] bg-[rgba(14,165,233,0.2)]" />
              <span>یوگا و فیتنس</span>
            </div>
            <div className="flex items-center gap-[6px]">
              <span className="h-[10px] w-[10px] rounded-full border border-[#F59E0B] bg-[#FFFBEB]" />
              <span>کراس‌فیت و TRX</span>
            </div>
          </div>
          <div className="text-[11.5px] text-ink-faint">
            برای مشاهده جزئیات و اعضای هر کلاس، روی آن کلیک کنید.
          </div>
        </div>
      </div>
    </div>
  );
}
