"use client";

import { useMemo, useState, useEffect } from "react";
import { useClasses } from "@/lib/hooks/queries/use-classes";
import { useMembersData } from "@/lib/members-store";
import { getClassRoster, ROSTER_UPDATED_EVENT } from "@/components/admin/classes/roster-store";
import { getDeletedClassIds } from "@/lib/api/services/classes.service";
import { toPersianDigits } from "@/lib/persian-digits";
import type { ClassSession, DayOfWeek, TimeSlot } from "@/components/admin/classes/types";
import { getCurrentGymScope } from "@/lib/session-scope";

export const DAYS_MAP: Record<number, DayOfWeek> = {
  0: "شنبه",
  1: "یکشنبه",
  2: "دوشنبه",
  3: "سه‌شنبه",
  4: "چهارشنبه",
  5: "پنجشنبه",
  6: "جمعه",
};

export const DAYS_REV_MAP: Record<string, number> = {
  "شنبه": 0,
  "یکشنبه": 1,
  "دوشنبه": 2,
  "سه‌شنبه": 3,
  "سه شنبه": 3,
  "چهارشنبه": 4,
  "پنجشنبه": 5,
  "پنج‌شنبه": 5,
  "جمعه": 6,
};

export function getLocalClassesMetaKey(scope?: string): string {
  const s = scope || getCurrentGymScope();
  return `fitlegend_gym_classes_meta_${s}`;
}

export function getLocalClassesMeta(scope?: string): Record<string, any> {
  if (typeof window === "undefined") return {};
  try {
    const s = scope || getCurrentGymScope();
    const raw =
      localStorage.getItem(getLocalClassesMetaKey(s)) ||
      (s === "gym_flex" || s.includes("farooq") ? localStorage.getItem("fitlegend_gym_classes_meta") : null);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalClassMeta(id: string, meta: any, scope?: string): void {
  if (typeof window === "undefined") return;
  try {
    const s = scope || getCurrentGymScope();
    const current = getLocalClassesMeta(s);
    current[id] = { ...(current[id] || {}), ...meta };
    localStorage.setItem(getLocalClassesMetaKey(s), JSON.stringify(current));
    window.dispatchEvent(new CustomEvent(ROSTER_UPDATED_EVENT));
    window.dispatchEvent(new CustomEvent("fitlegend_gym_classes_updated"));
  } catch {}
}

function normalizeDayName(name?: string): string {
  if (!name) return "";
  return name.replace(/[\u200C\s]/g, "").trim();
}

export function useGymClasses() {
  const [revision, setRevision] = useState(0);

  const { data: backendClasses, isLoading, error, refetch } = useClasses();
  const { members: allGymMembers, isLoading: membersLoading } = useMembersData();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleUpdate = () => setRevision((p) => p + 1);
    window.addEventListener(ROSTER_UPDATED_EVENT, handleUpdate);
    window.addEventListener("fitlegend_gym_classes_updated", handleUpdate);
    window.addEventListener("fitlegend_gym_bookings_updated", handleUpdate);
    window.addEventListener("fitlegend:gym-changed", handleUpdate);
    window.addEventListener("fitlegend:auth-logout", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(ROSTER_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("fitlegend_gym_classes_updated", handleUpdate);
      window.removeEventListener("fitlegend_gym_bookings_updated", handleUpdate);
      window.removeEventListener("fitlegend:gym-changed", handleUpdate);
      window.removeEventListener("fitlegend:auth-logout", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Today's Persian day index (0=شنبه, 1=یکشنبه, ..., 4=چهارشنبه, ..., 6=جمعه)
  const todayDayIdx = useMemo(() => {
    return (new Date().getDay() + 1) % 7;
  }, []);

  const todayDayName = DAYS_MAP[todayDayIdx] || "چهارشنبه";

  const classes: (ClassSession & { rawStartTime: string; day_of_week: number })[] = useMemo(() => {
    const list: any[] = Array.isArray(backendClasses)
      ? backendClasses
      : Array.isArray((backendClasses as any)?.results)
        ? (backendClasses as any).results
        : Array.isArray((backendClasses as any)?.classes)
          ? (backendClasses as any).classes
          : [];

    const deletedIds = getDeletedClassIds();
    const activeList = list.filter(
      (c) => c && c.is_active !== false && !deletedIds.has(String(c.id))
    );

    const localMeta = getLocalClassesMeta();

    return activeList.map((c) => {
      const day = DAYS_MAP[c.day_of_week] || "شنبه";
      const rawStart = c.start_time ? c.start_time.slice(0, 5) : "08:00";
      const time = toPersianDigits(rawStart) as TimeSlot;

      // Calculate end time
      let endTime = "09:30";
      if (c.start_time && c.duration_minutes) {
        const [h, m] = c.start_time.split(":").map(Number);
        const totalEnd = (h || 0) * 60 + (m || 0) + (c.duration_minutes || 60);
        const endH = Math.floor(totalEnd / 60) % 24;
        const endM = totalEnd % 60;
        endTime = toPersianDigits(
          `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`
        );
      }

      const coachName = c.coach_name || (c.coach ? "مربی اختصاصی" : "بدون مربی");
      const meta = localMeta[String(c.id)] || {};

      let category = meta.category;
      if (!category) {
        const t = c.title || "";
        if (t.includes("یوگا")) category = "یوگا";
        else if (t.includes("فیتنس")) category = "فیتنس";
        else if (t.includes("کراس")) category = "کراس‌فیت";
        else if (t.includes("TRX") || t.includes("تی آر ایکس")) category = "TRX";
        else if (t.includes("پیلاتس")) category = "پیلاتس";
        else if (t.includes("اسپینینگ")) category = "اسپینینگ";
        else category = "بدنسازی";
      }

      let theme: ClassSession["theme"] = meta.theme;
      if (!theme) {
        if (category === "یوگا" || category === "فیتنس") theme = "cyan";
        else if (category === "کراس‌فیت" || category === "TRX") theme = "amber";
        else theme = "emerald";
      }

      // Roster strictly filtered against active gym members
      const roster = getClassRoster(String(c.id), [], allGymMembers);
      const enrolledCount = roster.length;

      return {
        id: String(c.id),
        name: c.title,
        category,
        coach: coachName,
        coachShort: coachName.split(" ")[0] || "مربی",
        coachId: c.coach || null,
        day,
        day_of_week: c.day_of_week,
        time,
        rawStartTime: rawStart,
        endTime,
        durationMinutes: c.duration_minutes || 60,
        capacity: c.capacity || 20,
        enrolled: enrolledCount,
        members: roster,
        theme,
        room: meta.room || "سالن اصلی",
        level: meta.level || "همه سطوح",
        description: meta.description || "",
        isActive: c.is_active !== false,
      };
    });
  }, [backendClasses, allGymMembers, revision]);

  // Today's classes strictly derived from the exact same mapped classes!
  const todayClasses = useMemo(() => {
    const targetNorm = normalizeDayName(todayDayName);
    return classes
      .filter(
        (c) =>
          normalizeDayName(c.day) === targetNorm ||
          Number(c.day_of_week) === todayDayIdx
      )
      .sort((a, b) => {
        const tA = (a.rawStartTime || "00:00").replace(":", "");
        const tB = (b.rawStartTime || "00:00").replace(":", "");
        return tA.localeCompare(tB);
      });
  }, [classes, todayDayName, todayDayIdx]);

  const todayMembersCount = useMemo(() => {
    return todayClasses.reduce((sum, c) => sum + (c.enrolled || 0), 0);
  }, [todayClasses]);

  return {
    classes,
    todayClasses,
    todayMembersCount,
    todayDayIdx,
    todayDayName,
    isLoading: isLoading || membersLoading,
    error,
    refetch,
    allGymMembers,
  };
}
