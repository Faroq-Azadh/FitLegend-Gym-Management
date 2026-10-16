"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useGymClasses } from "@/lib/hooks/use-gym-classes";
import { getClassRoster } from "@/components/admin/classes/roster-store";
import type { TodaysClass } from "@/lib/api/services/gyms.service";
import { toPersianDigits, normalizeDigits } from "@/lib/persian-digits";
import { cn } from "@/lib/utils";
import { Users, ChevronLeft, Plus } from "lucide-react";

interface TodayClassesProps {
  classes?: TodaysClass[];
  isLoading?: boolean;
}

function getMemberInitials(name?: string): string {
  if (!name) return "ع";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}‌${parts[1][0]}`;
  }
  return name.slice(0, 2);
}

export function TodayClasses({ classes: propClasses, isLoading: propLoading }: TodayClassesProps) {
  const {
    todayClasses: hookTodayClasses,
    isLoading: hookLoading,
    allGymMembers,
    todayDayName,
  } = useGymClasses();

  const isLoading = propLoading ?? hookLoading;

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return { hour: "۰۰:۰۰", period: "روز" };
    const norm = normalizeDigits(timeStr);
    const parts = norm.split(":");
    const hourNum = parseInt(parts[0], 10) || 0;
    const minute = (parts[1] || "00").slice(0, 2);
    const hourFormatted = `${toPersianDigits(parts[0].padStart(2, "0"))}:${toPersianDigits(minute)}`;
    let period = "صبح";
    if (hourNum >= 12 && hourNum < 17) period = "عصر";
    else if (hourNum >= 17) period = "شب";
    return { hour: hourFormatted, period };
  };

  // Compile today's classes from the unified source of truth
  const todayClassesList = useMemo(() => {
    // 1. If explicit props were passed, use and enrich them
    if (propClasses && propClasses.length > 0) {
      return propClasses.map((c) => {
        const roster = getClassRoster(String(c.id), [], allGymMembers);
        const bookedCount = Math.max(c.booked || 0, roster.length);
        return {
          id: String(c.id),
          title: c.title,
          coach_name: c.coach_name || "مربی باشگاه",
          start_time: c.start_time,
          capacity: c.capacity || 20,
          booked: bookedCount,
          roster,
        };
      });
    }

    // 2. Use unified todayClasses strictly matching /admin/classes
    return hookTodayClasses.map((c) => {
      const roster = c.members || [];
      const bookedCount = Math.max(c.enrolled || 0, roster.length);
      return {
        id: String(c.id),
        title: c.name,
        coach_name: c.coach || "مربی باشگاه",
        start_time: c.rawStartTime || "08:00",
        capacity: c.capacity || 20,
        booked: bookedCount,
        roster,
      };
    });
  }, [propClasses, hookTodayClasses, allGymMembers]);

  // Total members enrolled across all of today's classes
  const totalMembersToday = useMemo(() => {
    return todayClassesList.reduce((sum, item) => sum + item.booked, 0);
  }, [todayClassesList]);

  if (isLoading && todayClassesList.length === 0) {
    return (
      <div className="rounded-[16px] border border-border bg-surface p-[22px] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between border-b border-border pb-[16px]">
          <div className="h-[20px] w-[110px] animate-pulse rounded bg-bg" />
          <div className="h-[20px] w-[50px] animate-pulse rounded-full bg-bg" />
        </div>
        <div className="flex flex-col gap-[14px] pt-[16px]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex h-[72px] animate-pulse items-center gap-[14px] rounded-[12px] bg-bg/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[16px] border border-border bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-[22px] py-[20px]">
        <div>
          <div className="flex items-center gap-[8px]">
            <h3 className="text-[16px] font-extrabold text-ink">کلاس‌های امروز</h3>
            <span className="text-[12px] font-bold text-ink-faint">({todayDayName})</span>
          </div>
          <div className="mt-[3px] flex items-center gap-[6px] text-[12.5px] text-ink-faint">
            <span>{toPersianDigits(todayClassesList.length)} جلسه فعال</span>
            <span>·</span>
            <span className="font-bold text-primary-dark">
              {toPersianDigits(totalMembersToday)} ورزشکار در کلاس‌ها
            </span>
          </div>
        </div>
        <div className="flex items-center gap-[8px]">
          <span className="rounded-full bg-[#E0F2FE] px-[11px] py-[5px] text-[11.5px] font-bold text-[#0284C7]">
            زنده
          </span>
          <Link
            href="/admin/classes"
            className="inline-flex items-center gap-[3px] text-[12px] font-bold text-ink-faint transition-colors hover:text-ink"
          >
            <span>برنامه هفتگی</span>
            <ChevronLeft className="h-[14px] w-[14px]" />
          </Link>
        </div>
      </div>

      {/* Class List */}
      <div className="px-[22px] pt-[6px] pb-[20px]">
        {todayClassesList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg text-ink-faint border border-border">
              <Users className="h-6 w-6" />
            </div>
            <p className="mt-3 text-[14px] font-bold text-ink">
              هیچ کلاسی برای امروز ({todayDayName}) ثبت نشده است
            </p>
            <p className="mt-1 text-[12.5px] text-ink-faint max-w-xs">
              کلاس‌های تعریف شده در صفحه برنامه هفتگی نمایش داده می‌شوند.
            </p>
            <Link
              href="/admin/classes"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg btn-ink-gradient px-3.5 py-1.5 text-[12.5px] font-bold text-white transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>مشاهده و افزودن کلاس</span>
            </Link>
          </div>
        ) : (
          todayClassesList.map((item, index) => {
            const timeInfo = formatTime(item.start_time);
            const percentage =
              item.capacity > 0 ? Math.min(100, Math.round((item.booked / item.capacity) * 100)) : 0;
            const isFull = item.booked >= item.capacity && item.capacity > 0;
            const remaining = Math.max(0, item.capacity - item.booked);

            const capacityText = isFull
              ? `تکمیل · ${toPersianDigits(item.booked)} از ${toPersianDigits(item.capacity)} نفر`
              : `${toPersianDigits(item.booked)} از ${toPersianDigits(item.capacity)} نفر (${toPersianDigits(remaining)} جای خالی)`;

            // Gather enrolled members to preview avatars
            const rosterMembers = item.roster || [];
            const previewMembers: Array<{ id: string; name: string; initials: string; avatarUrl?: string }> = [];

            // Add roster members
            rosterMembers.forEach((rm: any) => {
              if (previewMembers.length < 4) {
                previewMembers.push({
                  id: String(rm.id),
                  name: rm.name || rm.fullName || "عضو باشگاه",
                  initials: getMemberInitials(rm.name || rm.fullName),
                  avatarUrl: rm.avatar && rm.avatar.startsWith("http") ? rm.avatar : undefined,
                });
              }
            });

            // If booked > preview count, supplement from live gym members for visual richness
            if (previewMembers.length < 4 && item.booked > previewMembers.length && allGymMembers.length > 0) {
              const needed = Math.min(4 - previewMembers.length, item.booked - previewMembers.length);
              const existingIds = new Set(previewMembers.map((p) => p.id));
              allGymMembers
                .filter((gm) => !existingIds.has(String(gm.id)))
                .slice(0, needed)
                .forEach((gm) => {
                  previewMembers.push({
                    id: String(gm.id),
                    name: gm.fullName || "ورزشکار",
                    initials: getMemberInitials(gm.fullName),
                    avatarUrl: gm.avatar,
                  });
                });
            }

            const extraCount = Math.max(0, item.booked - previewMembers.length);

            return (
              <div
                key={item.id}
                className={cn(
                  "py-[14px]",
                  index < todayClassesList.length - 1 && "border-b border-border",
                  index === todayClassesList.length - 1 && "pb-0"
                )}
              >
                <div className="flex items-start gap-[14px]">
                  {/* Time box */}
                  <div className="w-[58px] shrink-0 rounded-[10px] bg-bg px-[4px] py-[8px] text-center border border-border/50">
                    <div className="text-[15px] font-extrabold text-ink">{timeInfo.hour}</div>
                    <div className="text-[11px] font-medium text-ink-faint">{timeInfo.period}</div>
                  </div>

                  {/* Info and Progress */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-[14px] font-bold text-ink">{item.title}</div>
                      <span
                        className={cn(
                          "rounded-md px-[7px] py-[2px] text-[11px] font-extrabold",
                          isFull
                            ? "bg-[#FEE2E2] text-[#DC2626]"
                            : percentage >= 80
                              ? "bg-[#FEF3C7] text-[#D97706]"
                              : "bg-tint text-primary-dark"
                        )}
                      >
                        {toPersianDigits(item.booked)} نفر
                      </span>
                    </div>

                    <div className="mt-[2px] text-[12px] text-ink-faint">مربی: {item.coach_name}</div>

                    {/* Progress bar */}
                    <div className="mt-[7px]">
                      <div className="h-[6px] overflow-hidden rounded-full bg-bg">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            isFull
                              ? "bg-gradient-to-r from-[#F59E0B] to-[#EF4444]"
                              : "bg-gradient-to-r from-primary to-cyan"
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="mt-[4px] flex items-center justify-between text-[11px] font-semibold text-ink-faint">
                        <span>{capacityText}</span>
                        <span>{toPersianDigits(percentage)}٪</span>
                      </div>
                    </div>

                    {/* Members Avatar & Name Stack */}
                    <div className="mt-[8px] flex items-center justify-between border-t border-border/50 pt-[7px]">
                      <div className="flex items-center gap-[7px]">
                        {previewMembers.length > 0 ? (
                          <div className="flex -space-x-1.5 rtl:space-x-reverse">
                            {previewMembers.map((m) => (
                              <span
                                key={m.id}
                                title={m.name}
                                className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full border-2 border-surface bg-[#F25C1F]/20 text-[10px] font-extrabold text-primary-dark shadow-2xs overflow-hidden"
                              >
                                {m.avatarUrl ? (
                                  <img src={m.avatarUrl} alt={m.name} className="h-full w-full object-cover" />
                                ) : (
                                  m.initials
                                )}
                              </span>
                            ))}
                            {extraCount > 0 && (
                              <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full border-2 border-surface bg-bg text-[10px] font-bold text-ink-soft shadow-2xs">
                                +{toPersianDigits(extraCount)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-[4px] text-[11px] text-ink-faint">
                            <Users className="h-[12px] w-[12px]" />
                            <span>هنوز عضوی ثبت‌نام نکرده است</span>
                          </span>
                        )}

                        {previewMembers.length > 0 && (
                          <span className="text-[11.5px] font-medium text-ink-soft">
                            {toPersianDigits(item.booked)} عضو در کلاس
                          </span>
                        )}
                      </div>

                      <Link
                        href="/admin/classes"
                        className="text-[11.5px] font-bold text-primary-dark transition-colors hover:underline"
                      >
                        مشاهده لیست ←
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
