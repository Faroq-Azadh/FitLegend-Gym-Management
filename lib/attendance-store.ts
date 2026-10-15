"use client";

import { useState, useEffect } from "react";
import { tokenStorage } from "@/lib/api/token";
import { getCurrentGymScope } from "@/lib/session-scope";

export const ATTENDANCE_STORAGE_KEY = "fitlegend_gym_daily_attendance";
export const ATTENDANCE_UPDATED_EVENT = "fitlegend_gym_attendance_updated";

export interface DailyAttendanceRecord {
  date: string; // YYYY-MM-DD
  count: number;
  entries: string[]; // unique account or identifier tags
}

export function getTodayIsoString(offsetDays = 0): string {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getAttendanceKey(scope?: string): string {
  const s = scope || getCurrentGymScope();
  return `fitlegend_gym_daily_attendance_${s}`;
}

export function getWeeklyAttendanceKey(scope?: string): string {
  const s = scope || getCurrentGymScope();
  return `fitlegend_gym_weekly_attendance_${s}`;
}

export function getStoredWeeklyAttendance(scope?: string): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const s = scope || getCurrentGymScope();
    const raw = localStorage.getItem(getWeeklyAttendanceKey(s));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredWeeklyAttendance(record: Record<string, number>, scope?: string): void {
  if (typeof window === "undefined") return;
  try {
    const s = scope || getCurrentGymScope();
    localStorage.setItem(getWeeklyAttendanceKey(s), JSON.stringify(record));
  } catch {}
}

/**
 * Get stored daily attendance record for today (scoped per gym)
 */
export function getStoredTodayAttendance(scope?: string): DailyAttendanceRecord {
  const today = getTodayIsoString();
  const s = scope || getCurrentGymScope();
  if (typeof window === "undefined") {
    return { date: today, count: 1, entries: ["admin_session"] };
  }

  try {
    const key = getAttendanceKey(s);
    const raw =
      localStorage.getItem(key) ||
      (s === "gym_flex" || s.includes("farooq") ? localStorage.getItem(ATTENDANCE_STORAGE_KEY) : null);
    if (raw) {
      const parsed = JSON.parse(raw) as DailyAttendanceRecord;
      if (parsed && parsed.date === today) {
        // Ensure that if user is currently logged in, count is at least 1
        const hasToken = !!tokenStorage.getAccessToken();
        if (hasToken && (!parsed.count || parsed.count < 1)) {
          parsed.count = 1;
          if (!parsed.entries || parsed.entries.length === 0) {
            parsed.entries = ["current_account"];
          }
          localStorage.setItem(key, JSON.stringify(parsed));
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading attendance storage:", err);
  }

  // Initial record for today: if user is authenticated/in panel, start with 1 entry
  const hasToken = typeof window !== "undefined" ? !!tokenStorage.getAccessToken() : true;
  const initialRecord: DailyAttendanceRecord = {
    date: today,
    count: hasToken ? 1 : 1,
    entries: ["current_account"],
  };

  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(getAttendanceKey(s), JSON.stringify(initialRecord));
    }
  } catch {}

  return initialRecord;
}

/**
 * Record a new account entry / check-in for today
 */
export function recordTodayEntry(identifier?: string, scope?: string): number {
  if (typeof window === "undefined") return 1;
  const today = getTodayIsoString();
  const s = scope || getCurrentGymScope();
  const current = getStoredTodayAttendance(s);

  const idTag = identifier || `account_${Date.now()}`;
  const existingEntries = Array.isArray(current.entries) ? current.entries : [];

  let newEntries = existingEntries;
  if (!existingEntries.includes(idTag)) {
    newEntries = [...existingEntries, idTag];
  }

  const newCount = Math.max(current.count, newEntries.length, 1);

  const updated: DailyAttendanceRecord = {
    date: today,
    count: newCount,
    entries: newEntries,
  };

  try {
    localStorage.setItem(getAttendanceKey(s), JSON.stringify(updated));
    // Also record in weekly attendance map
    const weeklyMap = getStoredWeeklyAttendance(s);
    weeklyMap[today] = newCount;
    saveStoredWeeklyAttendance(weeklyMap, s);

    window.dispatchEvent(
      new CustomEvent(ATTENDANCE_UPDATED_EVENT, { detail: updated }),
    );
  } catch (err) {
    console.error("Error saving attendance:", err);
  }

  return newCount;
}

/**
 * Hook to get today's attendance count, synchronizing backend data with local account entries
 */
export function useTodayAttendance(backendTodayCheckins?: number | null) {
  const gymScope = getCurrentGymScope();
  const [localCount, setLocalCount] = useState<number>(() => {
    return getStoredTodayAttendance(gymScope).count;
  });
  const [weeklyMap, setWeeklyMap] = useState<Record<string, number>>(() => {
    return getStoredWeeklyAttendance(gymScope);
  });

  useEffect(() => {
    setLocalCount(getStoredTodayAttendance(gymScope).count);
    setWeeklyMap(getStoredWeeklyAttendance(gymScope));

    const handleUpdate = () => {
      setLocalCount(getStoredTodayAttendance(gymScope).count);
      setWeeklyMap(getStoredWeeklyAttendance(gymScope));
    };

    window.addEventListener(ATTENDANCE_UPDATED_EVENT, handleUpdate);
    window.addEventListener("fitlegend:gym-changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(ATTENDANCE_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("fitlegend:gym-changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [gymScope]);

  const backendVal = typeof backendTodayCheckins === "number" ? backendTodayCheckins : 0;
  const effectiveTodayCheckins = Math.max(backendVal, localCount, 1);

  return {
    todayCheckins: effectiveTodayCheckins,
    weeklyCheckins: weeklyMap,
    recordEntry: (id?: string) => recordTodayEntry(id, gymScope),
  };
}
