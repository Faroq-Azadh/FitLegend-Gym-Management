"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useCoaches } from "@/lib/hooks/queries/use-coaches";
import { toPersianDigits, normalizeDigits } from "@/lib/persian-digits";

export const COACHES_OVERRIDES_KEY = "fitlegend_gym_coaches_overrides";
export const DELETED_COACHES_KEY = "fitlegend_gym_deleted_coach_ids";
export const COACHES_UPDATED_EVENT = "fitlegend_coaches_updated";

export interface CoachOverride {
  name?: string;
  role?: string;
  type?: "coach" | "staff";
  students?: string;
  rating?: string;
  status?: "active" | "inactive" | "deleted";
  is_active?: boolean;
  is_deleted?: boolean;
  avatar?: string;
  phone?: string;
  email?: string;
}

export function normalizePersianName(name?: string | null): string {
  if (!name) return "";
  return name
    .trim()
    .replace(/[\u200c\u200b\s]+/g, "")
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/[آأإ]/g, "ا")
    .toLowerCase();
}

export function getPhoneLookupKeys(phone?: string | null): string[] {
  if (!phone) return [];
  const digits = normalizeDigits(phone).replace(/\D/g, "");
  if (!digits) return [];
  const keys = new Set<string>();
  keys.add(digits);
  if (digits.startsWith("0")) {
    keys.add(digits.slice(1));
  }
  if (digits.startsWith("98")) {
    keys.add(digits.slice(2));
    keys.add("0" + digits.slice(2));
  }
  return Array.from(keys);
}

export function getDeletedCoachIdsKey(scope?: string): string {
  const s = scope || getCurrentGymScope();
  return `fitlegend_deleted_coaches_${s}`;
}

export function getDeletedCoachIds(scope?: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getDeletedCoachIdsKey(scope);
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    if (isFarooqUser()) {
      const legacy = localStorage.getItem(DELETED_COACHES_KEY);
      if (legacy) return JSON.parse(legacy);
    }
    return [];
  } catch {
    return [];
  }
}

export function addDeletedCoachId(id: string | number, scope?: string): void {
  if (typeof window === "undefined" || id === undefined || id === null) return;
  const strId = String(id);
  try {
    const key = getDeletedCoachIdsKey(scope);
    const list = getDeletedCoachIds(scope);
    if (!list.includes(strId)) {
      list.push(strId);
      localStorage.setItem(key, JSON.stringify(list));
      window.dispatchEvent(new Event(COACHES_UPDATED_EVENT));
    }
  } catch { }
}

import {
  getCurrentGymScope,
  getCurrentUserScope,
  isFarooqUser,
  isFlexGymOrFarooq,
} from "@/lib/session-scope";

export function getLocalCoachOverridesKey(scope?: string): string {
  const s = scope || getCurrentGymScope();
  return `fitlegend_coaches_overrides_${s}`;
}

export function getLocalCoachOverrides(scope?: string): Record<string, CoachOverride> {
  if (typeof window === "undefined") return {};
  try {
    const key = getLocalCoachOverridesKey(scope);
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    if (isFarooqUser()) {
      const legacy = localStorage.getItem(COACHES_OVERRIDES_KEY);
      if (legacy) return JSON.parse(legacy);
    }
    return {};
  } catch {
    return {};
  }
}

export function saveLocalCoachOverride(id: string | number, override: CoachOverride, scope?: string): void {
  if (typeof window === "undefined" || !id) return;
  const strId = String(id);
  try {
    const key = getLocalCoachOverridesKey(scope);
    const current = getLocalCoachOverrides(scope);
    current[strId] = { ...(current[strId] || {}), ...override };
    localStorage.setItem(key, JSON.stringify(current));
    window.dispatchEvent(new Event(COACHES_UPDATED_EVENT));
  } catch { }
}

export function saveLocalCoachOverridesBatch(entries: Record<string, CoachOverride>, scope?: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = getLocalCoachOverridesKey(scope);
    const current = getLocalCoachOverrides(scope);
    for (const [keyName, val] of Object.entries(entries)) {
      if (keyName) {
        current[keyName] = { ...(current[keyName] || {}), ...val };
      }
    }
    localStorage.setItem(key, JSON.stringify(current));
    window.dispatchEvent(new Event(COACHES_UPDATED_EVENT));
  } catch { }
}

export function getLocalTeamMembersKey(scope?: string): string {
  const s = scope || getCurrentGymScope();
  return `fitlegend_team_${s}`;
}

export const LOCAL_TEAM_MEMBERS_KEY = "fitlegend_gym_local_team_members";

export interface LocalTeamMember {
  id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  name?: string;
  phone?: string;
  email?: string;
  position?: string;
  role?: string;
  type?: "coach" | "staff";
  specialties?: string[];
  avatar?: string;
  is_active?: boolean;
  work_shift?: string;
  working_days?: string[];
  start_date?: string;
  address?: string;
  rating?: string;
  students?: string;
  gym_scope?: string;
  [key: string]: any;
}

export function getLocalTeamMembers(scope?: string): LocalTeamMember[] {
  if (typeof window === "undefined") return [];
  try {
    const isFlex = isFlexGymOrFarooq();
    const key = getLocalTeamMembersKey(scope);
    const raw = localStorage.getItem(key);
    let list: LocalTeamMember[] = [];

    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch {}
    }

    if (isFlex) {
      const userKey = `fitlegend_team_user_${getCurrentUserScope()}`;
      const userRaw = localStorage.getItem(userKey);
      if (userRaw) {
        try {
          const parsed = JSON.parse(userRaw);
          if (Array.isArray(parsed)) {
            const seen = new Set(list.map((m) => String(m.id)));
            for (const item of parsed) {
              if (!seen.has(String(item.id))) {
                seen.add(String(item.id));
                list.push(item);
              }
            }
          }
        } catch {}
      }

      const legacy = localStorage.getItem(LOCAL_TEAM_MEMBERS_KEY);
      if (legacy) {
        try {
          const parsed = JSON.parse(legacy);
          if (Array.isArray(parsed)) {
            const seen = new Set(list.map((m) => String(m.id)));
            for (const item of parsed) {
              if (!seen.has(String(item.id))) {
                seen.add(String(item.id));
                list.push(item);
              }
            }
          }
        } catch {}
      }

      // Ensure Rahmat Azadeh is preserved in Flex gym
      const hasRahmat = list.some(
        (m) =>
          normalizePersianName(m.name || m.full_name || "").includes("رحمتازاده") ||
          normalizePersianName(m.name || m.full_name || "").includes("رحمت")
      );
      if (!hasRahmat) {
        list.push({
          id: "rahmat-azadeh-flex-staff",
          first_name: "رحمت",
          last_name: "آزاده",
          full_name: "رحمت آزاده",
          name: "رحمت آزاده",
          phone: "۰۹۱۲۳۴۵۶۷۸۹",
          position: "reception",
          role: "پذیرش / اداری",
          type: "staff",
          specialties: ["پذیرش / اداری"],
          is_active: true,
          gym_scope: "flex",
        });
      }

      localStorage.setItem(key, JSON.stringify(list));
      localStorage.setItem(LOCAL_TEAM_MEMBERS_KEY, JSON.stringify(list));
    }

    return list;
  } catch {
    return [];
  }
}

export function saveLocalTeamMember(member: LocalTeamMember, scope?: string): void {
  if (typeof window === "undefined" || !member || !member.id) return;
  try {
    const key = getLocalTeamMembersKey(scope);
    const current = getLocalTeamMembers(scope);
    const phoneNorm = normalizeDigits(member.phone || "").replace(/\D/g, "");
    const nameNorm = normalizePersianName(member.name || member.full_name || `${member.first_name || ""} ${member.last_name || ""}`);
    const scopedMember = {
      ...member,
      gym_scope: member.gym_scope || scope || getCurrentGymScope(),
    };

    const existingIndex = current.findIndex((m) => {
      if (String(m.id) === String(member.id)) return true;
      const mPhone = normalizeDigits(m.phone || "").replace(/\D/g, "");
      if (phoneNorm && mPhone && phoneNorm === mPhone) return true;
      const mName = normalizePersianName(m.name || m.full_name || `${m.first_name || ""} ${m.last_name || ""}`);
      if (nameNorm && mName && nameNorm === mName) return true;
      return false;
    });

    if (existingIndex >= 0) {
      current[existingIndex] = { ...current[existingIndex], ...scopedMember };
    } else {
      current.push(scopedMember);
    }
    localStorage.setItem(key, JSON.stringify(current));
    if (isFlexGymOrFarooq()) {
      localStorage.setItem(LOCAL_TEAM_MEMBERS_KEY, JSON.stringify(current));
    }
    window.dispatchEvent(new Event(COACHES_UPDATED_EVENT));
  } catch { }
}

export function removeLocalTeamMember(id: string | number, scope?: string): void {
  if (typeof window === "undefined" || id === undefined || id === null) return;
  const strId = String(id);
  try {
    const key = getLocalTeamMembersKey(scope);
    const current = getLocalTeamMembers(scope);
    const filtered = current.filter((m) => String(m.id) !== strId);
    localStorage.setItem(key, JSON.stringify(filtered));
    window.dispatchEvent(new Event(COACHES_UPDATED_EVENT));
  } catch { }
}

/**
 * Parses numeric rating from any format (Persian digits, Arabic digits, float, string)
 */
export function parseRatingNumber(val: any): number | null {
  if (val === undefined || val === null || val === "" || val === "—") return null;
  if (typeof val === "number") return isNaN(val) ? null : val;
  const str = String(val)
    .replace(/⭐/g, "")
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString())
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString())
    .replace(/[٫,]/g, ".")
    .trim();
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

/**
 * Formats a numeric rating to Persian decimal display (e.g. 4.8 -> "۴٫۸")
 */
export function formatPersianRating(val: number | string): string {
  const num = typeof val === "number" ? val : parseRatingNumber(val);
  if (num === null) return "—";
  return toPersianDigits(num.toFixed(1)).replace(".", "٫");
}

/**
 * Checks whether a given team member/coach object is an employee/staff
 */
export function isStaffMember(c: any, override?: CoachOverride): boolean {
  if (override?.type === "staff") return true;
  if (override?.type === "coach") return false;
  if (c?.type === "staff") return true;
  if (c?.position === "reception" || c?.position === "staff") return true;
  const role = override?.role || c?.role || (c?.position === "reception" ? "پذیرش / اداری" : "");
  if (
    typeof role === "string" &&
    (role.includes("کارمند") ||
      role.includes("پذیرش") ||
      role.includes("اداری") ||
      role.includes("حسابدار") ||
      role.includes("پشتیبانی"))
  ) {
    return true;
  }
  return false;
}

export interface CoachStats {
  total: number;
  active: number;
  avgRating: string;
  staffCount: number;
}

/**
 * Unified hook for accessing synchronized coach list, deletion state, and KPI stats
 */
export function useCoachesData() {
  const { data: coachesData, isLoading, refetch } = useCoaches();

  const [overrides, setOverrides] = useState<Record<string, CoachOverride>>(() => getLocalCoachOverrides());
  const [deletedIds, setDeletedIds] = useState<string[]>(() => getDeletedCoachIds());
  const [localTeam, setLocalTeam] = useState<LocalTeamMember[]>(() => getLocalTeamMembers());

  useEffect(() => {
    const handleSync = () => {
      setOverrides(getLocalCoachOverrides());
      setDeletedIds(getDeletedCoachIds());
      setLocalTeam(getLocalTeamMembers());
    };
    window.addEventListener(COACHES_UPDATED_EVENT, handleSync);
    window.addEventListener("fitlegend:gym-changed", handleSync);
    window.addEventListener("fitlegend:auth-logout", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener(COACHES_UPDATED_EVENT, handleSync);
      window.removeEventListener("fitlegend:gym-changed", handleSync);
      window.removeEventListener("fitlegend:auth-logout", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Extract raw list
  const rawList: any[] = useMemo(() => {
    let list: any[] = [];
    if (Array.isArray(coachesData)) {
      list = [...coachesData];
    } else if (coachesData && typeof coachesData === "object") {
      const b = coachesData as any;
      if (Array.isArray(b.coaches)) list = [...b.coaches];
      else if (Array.isArray(b.results)) list = [...b.results];
      else if (Array.isArray(b.data?.coaches)) list = [...b.data.coaches];
      else if (Array.isArray(b.data?.results)) list = [...b.data.results];
      else if (Array.isArray(b.data)) list = [...b.data];
      else if (Array.isArray(b.team)) list = [...b.team];
      else if (Array.isArray(b.staff)) list = [...b.staff];
    }

    const seenIds = new Set(list.map((c: any) => String(c.id)));
    for (const lm of localTeam) {
      if (!seenIds.has(String(lm.id))) {
        seenIds.add(String(lm.id));
        list.push(lm);
      }
    }
    return list;
  }, [coachesData, overrides, localTeam]);

  // Compute non-deleted coaches/staff
  const teamItems = useMemo(() => {
    return rawList
      .filter((c: any) => {
        const idStr = String(c.id);
        if (deletedIds.includes(idStr)) return false;

        const cName = (
          c.full_name ||
          (c.user &&
            (c.user.full_name ||
              `${c.user.first_name || ""} ${c.user.last_name || ""}`.trim() ||
              c.user.username)) ||
          `${c.first_name || ""} ${c.last_name || ""}`.trim() ||
          c.name ||
          ""
        ).trim();
        const normName = normalizePersianName(cName);
        const rawPhone = c.phone || c.phone_number || "";
        const phoneKeys = getPhoneLookupKeys(rawPhone);

        let override: CoachOverride = overrides[idStr] || {};
        for (const pk of phoneKeys) {
          if (overrides[`phone_${pk}`]) {
            override = { ...overrides[`phone_${pk}`], ...override };
            break;
          }
        }
        if (cName && overrides[`name_${cName}`]) {
          override = { ...overrides[`name_${cName}`], ...override };
        }
        if (normName && overrides[`normname_${normName}`]) {
          override = { ...overrides[`normname_${normName}`], ...override };
        }
        if (overrides[idStr]) {
          override = { ...overrides[idStr], ...override };
        }

        if (override.is_deleted || override.status === "deleted") return false;
        // If deactivated in Django backend and not explicitly forced active in local override
        if (c.is_active === false && override.status !== "active") return false;

        return true;
      })
      .map((c: any) => {
        const idStr = String(c.id);
        const cName = (
          c.full_name ||
          (c.user &&
            (c.user.full_name ||
              `${c.user.first_name || ""} ${c.user.last_name || ""}`.trim() ||
              c.user.username)) ||
          `${c.first_name || ""} ${c.last_name || ""}`.trim() ||
          c.name ||
          "مربی"
        ).trim();
        const normName = normalizePersianName(cName);
        const rawPhone = c.phone || c.phone_number || "";
        const phoneKeys = getPhoneLookupKeys(rawPhone);

        let override: CoachOverride = overrides[idStr] || {};
        for (const pk of phoneKeys) {
          if (overrides[`phone_${pk}`]) {
            override = { ...overrides[`phone_${pk}`], ...override };
            break;
          }
        }
        if (cName && overrides[`name_${cName}`]) {
          override = { ...overrides[`name_${cName}`], ...override };
        }
        if (normName && overrides[`normname_${normName}`]) {
          override = { ...overrides[`normname_${normName}`], ...override };
        }
        if (overrides[idStr]) {
          override = { ...overrides[idStr], ...override };
        }

        const type: "coach" | "staff" = override.type || (c.position === "reception" ? "staff" : "coach");
        const isActive: boolean = override.status ? override.status === "active" : c.is_active !== false;
        const ratingStr: string = override.rating || (c.rating ? String(c.rating) : "۵٫۰");

        return {
          raw: c,
          id: idStr,
          name: (override.name || cName).trim(),
          type,
          isActive,
          ratingStr,
          override,
        };
      });
  }, [rawList, deletedIds, overrides]);

  // Compute accurate KPI stats
  const stats: CoachStats = useMemo(() => {
    const coachOnly = teamItems.filter((item) => item.type === "coach");
    const activeCoaches = coachOnly.filter((item) => item.isActive);
    const staffMembers = teamItems.filter((item) => item.type === "staff");

    // Gather valid coach ratings among active coaches
    const ratingValues: number[] = [];
    for (const coach of activeCoaches) {
      const parsed = parseRatingNumber(coach.ratingStr);
      if (parsed !== null && parsed > 0) {
        ratingValues.push(parsed);
      }
    }

    let avgRatingFa = "۰";
    if (ratingValues.length > 0) {
      const sum = ratingValues.reduce((a, b) => a + b, 0);
      const avg = sum / ratingValues.length;
      avgRatingFa = toPersianDigits(avg.toFixed(1)).replace(".", "٫");
    }

    return {
      total: coachOnly.length,
      active: activeCoaches.length,
      avgRating: avgRatingFa,
      staffCount: staffMembers.length,
    };
  }, [teamItems]);

  return {
    isLoading,
    refetch,
    teamItems,
    stats,
    overrides,
    deletedIds,
  };
}
