"use client";

import { useMemo } from "react";
import { useGymClasses } from "@/lib/hooks/use-gym-classes";
import { toPersianDigits } from "@/lib/persian-digits";

interface TopClassItem {
  rank: string;
  name: string;
  coach: string;
  enrolled: number;
  capacity: number;
  percent: number;
}

export function TopClassesList() {
  const { classes, isLoading } = useGymClasses();

  const topClasses: TopClassItem[] = useMemo(() => {
    if (!classes || classes.length === 0) return [];

    const listWithStats = classes.map((cls) => {
      const name = cls.name || "کلاس ورزشی";
      const coach = cls.coach || "";
      const capacity = cls.capacity || 20;
      const enrolled = cls.enrolled || 0;
      const percent = capacity > 0 ? Math.min(100, Math.round((enrolled / capacity) * 100)) : 0;

      return {
        name,
        coach,
        enrolled,
        capacity,
        percent,
      };
    });

    // Sort by percent desc, then enrolled desc
    listWithStats.sort((a, b) => b.percent - a.percent || b.enrolled - a.enrolled);

    // Take top 5
    const persianRanks = ["۱", "۲", "۳", "۴", "۵"];
    return listWithStats.slice(0, 5).map((item, idx) => ({
      ...item,
      rank: persianRanks[idx] || String(idx + 1),
    }));
  }, [classes]);

  return (
    <div className="rounded-[16px] border border-border bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.04)] print-avoid-break">
      <div className="flex items-center justify-between border-b border-border p-[20px_22px]">
        <div>
          <h3 className="text-[16px] font-extrabold text-ink">
            پرطرفدارترین کلاس‌ها
          </h3>
          <div className="mt-[3px] text-[12.5px] text-ink-faint">
            بر اساس درصد تکمیل ظرفیت و اعضا
          </div>
        </div>
        <span className="rounded-full bg-tint px-[11px] py-[5px] text-[11.5px] font-bold text-primary-dark">
          زنده
        </span>
      </div>

      <div className="p-[22px]">
        {isLoading && classes.length === 0 ? (
          <div className="flex flex-col gap-[14px] py-[10px]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex animate-pulse flex-col gap-[8px]">
                <div className="flex justify-between">
                  <div className="h-[14px] w-[120px] rounded-[6px] bg-bg" />
                  <div className="h-[14px] w-[60px] rounded-[6px] bg-bg" />
                </div>
                <div className="h-[7px] w-full rounded-full bg-bg" />
              </div>
            ))}
          </div>
        ) : topClasses.length === 0 ? (
          <div className="py-[32px] text-center">
            <div className="text-[13.5px] font-bold text-ink">
              هیچ کلاسی ثبت نشده است
            </div>
            <div className="mt-[4px] text-[12px] text-ink-faint">
              برای تعریف کلاس‌ها به بخش کلاس‌ها و تقویم مراجعه نمایید
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-[16px]">
            {topClasses.map((cls, index) => (
              <div key={index} className="flex flex-col">
                <div className="mb-[7px] flex items-center justify-between">
                  <div className="flex items-center gap-[9px] min-w-0">
                    <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] bg-tint text-[12px] font-extrabold text-primary-dark">
                      {cls.rank}
                    </span>
                    <div className="min-w-0 truncate">
                      <span className="text-[13.5px] font-bold text-ink truncate block">
                        {cls.name}
                      </span>
                      {cls.coach && (
                        <span className="text-[11px] text-ink-faint block truncate">
                          مربی: {cls.coach}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-[6px] shrink-0">
                    <span className="text-[11.5px] font-medium text-ink-faint">
                      ({toPersianDigits(cls.enrolled)}/{toPersianDigits(cls.capacity)})
                    </span>
                    <span className="text-[12.5px] font-bold text-ink-soft">
                      {toPersianDigits(cls.percent)}٪
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-[7px] overflow-hidden rounded-full bg-bg">
                  <div
                    style={{ width: `${cls.percent}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-[#0EA5E9] transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
