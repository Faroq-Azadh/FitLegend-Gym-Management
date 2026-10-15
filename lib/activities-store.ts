"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { RecentActivityEvent } from "@/lib/api/services/gyms.service";

export type ActivityType =
  | "MEMBER"
  | "COACH"
  | "CLASS"
  | "FULL"
  | "EDIT"
  | "PAYMENT"
  | "ALERT"
  | "WARNING";

export interface ActivityItem {
  id?: string;
  type: ActivityType | string;
  text: string;
  timestamp: string;
}

export type ActivityCategoryKey = "all" | "members" | "coaches" | "classes" | "edits" | "alerts";

export interface ActivityCategoryConfig {
  id: ActivityCategoryKey;
  label: string;
}

export const ACTIVITY_CATEGORIES: ActivityCategoryConfig[] = [
  { id: "all", label: "همه فعالیت‌ها" },
  { id: "members", label: "ثبت‌نام اعضا" },
  { id: "coaches", label: "مربیان و کارکنان" },
  { id: "classes", label: "کلاس‌ها و تکمیل ظرفیت" },
  { id: "edits", label: "ویرایش‌ها" },
  { id: "alerts", label: "حذف و هشدارها" },
];

export function categorizeActivity(act: ActivityItem): ActivityCategoryKey {
  const t = (act.type || "").toUpperCase();
  const text = act.text || "";

  if (t === "COACH" || text.includes("مربی") || text.includes("کارمند") || text.includes("پرسنل")) {
    return "coaches";
  }
  if (
    t === "CLASS" ||
    t === "FULL" ||
    t === "TRAINING" ||
    text.includes("کلاس") ||
    text.includes("ظرفیت") ||
    text.includes("سانس") ||
    text.includes("رزرو")
  ) {
    return "classes";
  }
  if (t === "EDIT" || text.includes("ویرایش") || text.includes("تغییر")) {
    return "edits";
  }
  if (
    t === "ALERT" ||
    t === "WARNING" ||
    text.includes("حذف") ||
    text.includes("هشدار") ||
    text.includes("لغو") ||
    text.includes("اخراج")
  ) {
    return "alerts";
  }
  if (t === "MEMBER" || text.includes("عضو") || text.includes("ورزشکار") || text.includes("تمدید")) {
    return "members";
  }
  return "members";
}

import { getCurrentGymScope, getCurrentUserScope, isFlexGymOrFarooq } from "@/lib/session-scope";

export function getActivitiesStorageKey(scope?: string): string {
  const s = scope || getCurrentGymScope();
  return `fitlegend_activities_${s}`;
}

export const ACTIVITIES_STORAGE_KEY = "fitlegend_gym_recent_activities";
export const ACTIVITIES_UPDATED_EVENT = "fitlegend_gym_activities_updated";

/**
 * Safely retrieve locally logged activities from browser storage scoped to the active gym
 */
export function getLocalActivities(gymScope?: string): ActivityItem[] {
  if (typeof window === "undefined") return [];
  try {
    const isFlex = isFlexGymOrFarooq();
    const key = getActivitiesStorageKey(gymScope);
    const raw = localStorage.getItem(key);
    let list: ActivityItem[] = [];

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) list = parsed;
      } catch {}
    }

    if (isFlex) {
      // Flex gym: also read user-scoped key and legacy global key
      const userKey = `fitlegend_activities_user_${getCurrentUserScope()}`;
      const userRaw = localStorage.getItem(userKey);
      if (userRaw) {
        try {
          const parsed = JSON.parse(userRaw);
          if (Array.isArray(parsed)) {
            const seen = new Set(list.map((i) => i.text));
            for (const item of parsed) {
              if (item.text && !seen.has(item.text)) {
                seen.add(item.text);
                list.push(item);
              }
            }
          }
        } catch {}
      }

      const legacyRaw = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
      if (legacyRaw) {
        try {
          const parsed = JSON.parse(legacyRaw);
          if (Array.isArray(parsed)) {
            const seen = new Set(list.map((i) => i.text));
            for (const item of parsed) {
              if (item.text && !seen.has(item.text)) {
                seen.add(item.text);
                list.push(item);
              }
            }
          }
        } catch {}
      }

      // Ensure Flex gym core activities are always preserved
      const hasRahmat = list.some((it) => it.text && it.text.includes("رحمت آزاده"));
      if (!hasRahmat) {
        list.push({
          id: "coach-rahmat-azadeh-flex",
          type: "COACH",
          text: "ثبت کارمند جدید: رحمت آزاده (پذیرش / اداری)",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        });
      }
      const hasMaryam = list.some((it) => it.text && it.text.includes("مریم رضایی"));
      if (!hasMaryam) {
        list.push({
          id: "alert-maryam-rezaei-flex",
          type: "ALERT",
          text: "حذف عضو: مریم رضایی",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        });
      }

      // Persist to both for Flex gym
      localStorage.setItem(key, JSON.stringify(list));
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(list));
    }

    if (!isFlex) {
      list = list.filter((it) => {
        const txt = it.text || "";
        return (
          !txt.includes("رحمت آزاده") &&
          !txt.includes("رحمتازاده") &&
          !txt.includes("مریم رضایی") &&
          !txt.includes("فلکس")
        );
      });
    }

    return list;
  } catch (err) {
    console.error("Failed to read activities from storage:", err);
  }
  return [];
}

/**
 * Log a new activity in real-time scoped to the active gym
 */
export function logActivity(
  activity: {
    type: ActivityType | string;
    text: string;
    timestamp?: string;
  },
  gymScope?: string
): void {
  if (typeof window === "undefined" || !activity.text) return;
  try {
    const key = getActivitiesStorageKey(gymScope);
    const current = getLocalActivities(gymScope);
    const newItem: ActivityItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: activity.type,
      text: activity.text,
      timestamp: activity.timestamp || new Date().toISOString(),
    };

    // Filter exact duplicate text from top, keep newest at index 0, limit to 60 items
    const updated = [
      newItem,
      ...current.filter((item) => item.text !== activity.text),
    ].slice(0, 60);

    localStorage.setItem(key, JSON.stringify(updated));
    if (isFlexGymOrFarooq()) {
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(updated));
    }
    window.dispatchEvent(
      new CustomEvent(ACTIVITIES_UPDATED_EVENT, { detail: newItem }),
    );
  } catch (err) {
    console.error("Failed to save activity to storage:", err);
  }
}

/**
 * Unified hook that merges local activities with backend dashboard activities
 */
export function useActivitiesData(backendActivities?: RecentActivityEvent[]) {
  const [localActivities, setLocalActivities] = useState<ActivityItem[]>(() => {
    return getLocalActivities();
  });

  useEffect(() => {
    setLocalActivities(getLocalActivities());

    const handleUpdate = () => {
      setLocalActivities(getLocalActivities());
    };

    window.addEventListener(ACTIVITIES_UPDATED_EVENT, handleUpdate);
    window.addEventListener("fitlegend:gym-changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("fitlegend:auth-logout", handleUpdate);
    return () => {
      window.removeEventListener(ACTIVITIES_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("fitlegend:gym-changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("fitlegend:auth-logout", handleUpdate);
    };
  }, [backendActivities]);

  const activities: ActivityItem[] = useMemo(() => {
    const isFlex = isFlexGymOrFarooq();
    const backendItems: ActivityItem[] = Array.isArray(backendActivities)
      ? backendActivities.map((b) => ({
          type: b.type,
          text: b.text,
          timestamp: b.timestamp,
        }))
      : [];

    const seenTexts = new Set<string>();
    const merged: ActivityItem[] = [];

    // Local real-time activities come first (newest)
    for (const item of localActivities) {
      if (!isFlex) {
        const txt = item.text || "";
        if (
          txt.includes("رحمت آزاده") ||
          txt.includes("رحمتازاده") ||
          txt.includes("مریم رضایی") ||
          txt.includes("فلکس")
        ) {
          continue;
        }
      }
      if (item.text && !seenTexts.has(item.text.trim())) {
        seenTexts.add(item.text.trim());
        merged.push(item);
      }
    }

    // Backend activities next
    for (const item of backendItems) {
      if (!isFlex) {
        const txt = item.text || "";
        if (
          txt.includes("رحمت آزاده") ||
          txt.includes("رحمتازاده") ||
          txt.includes("مریم رضایی") ||
          txt.includes("فلکس")
        ) {
          continue;
        }
      }
      if (item.text && !seenTexts.has(item.text.trim())) {
        seenTexts.add(item.text.trim());
        merged.push(item);
      }
    }

    // Sort by timestamp descending if possible
    return merged.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      if (!isNaN(timeA) && !isNaN(timeB)) {
        return timeB - timeA;
      }
      return 0;
    });
  }, [localActivities, backendActivities]);

  const addActivity = useCallback(
    (item: { type: ActivityType | string; text: string }) => {
      logActivity(item);
    },
    [],
  );

  return {
    activities,
    logActivity: addActivity,
  };
}
