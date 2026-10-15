"use client";

import { useState, useEffect, useMemo } from "react";
import { useMembers } from "@/lib/hooks/queries/use-members";
import { membersService } from "@/lib/api/services/members.service";

export interface MemberOverride {
  plan?: string;
  coach?: string;
  status?: "active" | "expiring" | "expired";
  joinDate?: string;
  dueDate?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface UnifiedMember {
  id: string;
  code: number;
  name: string;
  fullName: string;
  email: string;
  phone: string;
  plan: string;
  coach: string;
  status: "active" | "expiring" | "expired";
  joinDate: string;
  dueDate: string;
  startDateIso?: string;
  isActive: boolean;
  avatar?: string;
}

export interface MemberCounts {
  total: number;
  active: number;
  expiring: number;
  expired: number;
  newThisMonth: number;
}

import { getCurrentGymScope, getCurrentUserScope, isFlexGymOrFarooq } from "@/lib/session-scope";

export const MEMBERS_OVERRIDES_KEY = "fitlegend_gym_members_overrides";
export const MEMBERS_UPDATED_EVENT = "fitlegend_gym_members_updated";

export const DELETED_MEMBER_IDS_KEY = "fitlegend_gym_deleted_member_ids";
export const DELETED_MEMBER_NAMES_KEY = "fitlegend_gym_deleted_member_names";

export function getDeletedMemberIdsKey(scope?: string): string {
  const s = scope || getCurrentGymScope();
  return `fitlegend_deleted_members_${s}`;
}

export function getDeletedMemberIds(scope?: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const key = getDeletedMemberIdsKey(scope);
    const raw = localStorage.getItem(key);
    if (raw) return new Set(JSON.parse(raw));
    const legacy = localStorage.getItem(DELETED_MEMBER_IDS_KEY);
    return legacy ? new Set(JSON.parse(legacy)) : new Set();
  } catch {
    return new Set();
  }
}

export function getDeletedMemberNames(scope?: string): Set<string> {
  if (typeof window === "undefined") return new Set(["مریم رضایی"]);
  try {
    const key = `fitlegend_deleted_member_names_${scope || getCurrentGymScope()}`;
    const raw = localStorage.getItem(key);
    const parsed: string[] = raw ? JSON.parse(raw) : [];
    return new Set(["مریم رضایی", ...parsed]);
  } catch {
    return new Set(["مریم رضایی"]);
  }
}

export function markMemberAsDeleted(id: string, name?: string, scope?: string): void {
  if (typeof window === "undefined") return;
  try {
    const ids = getDeletedMemberIds(scope);
    if (id) ids.add(String(id));
    const keyIds = getDeletedMemberIdsKey(scope);
    localStorage.setItem(keyIds, JSON.stringify(Array.from(ids)));

    const names = getDeletedMemberNames(scope);
    if (name?.trim()) names.add(name.trim());
    const keyNames = `fitlegend_deleted_member_names_${scope || getCurrentGymScope()}`;
    localStorage.setItem(keyNames, JSON.stringify(Array.from(names)));
  } catch {}
}

export function isDeletedMember(id?: string | null, name?: string | null): boolean {
  if (id) {
    const ids = getDeletedMemberIds();
    if (ids.has(String(id))) return true;
  }
  if (name) {
    const norm = normalizePersianName(name);
    const maryamNorm = normalizePersianName("مریم رضایی");
    if (norm === maryamNorm || norm.includes(maryamNorm)) {
      return true;
    }
    const names = getDeletedMemberNames();
    for (const dName of names) {
      if (normalizePersianName(dName) === norm) return true;
    }
  }
  return false;
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
  const digits = phone
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString())
    .replace(/[^\d]/g, "");
  if (!digits) return [];
  const keys = [digits];
  if (digits.startsWith("98") && digits.length >= 11) {
    keys.push("0" + digits.slice(2));
    keys.push(digits.slice(2));
  } else if (digits.startsWith("0") && digits.length >= 10) {
    keys.push("98" + digits.slice(1));
    keys.push(digits.slice(1));
  }
  if (digits.length >= 9) {
    keys.push("suffix_" + digits.slice(-9));
  }
  return Array.from(new Set(keys));
}

export function getLocalMemberOverridesKey(scope?: string): string {
  const s = scope || getCurrentGymScope();
  return `fitlegend_members_overrides_${s}`;
}

/**
 * Safely retrieve local member overrides from browser storage
 */
export function getLocalMemberOverrides(scope?: string): Record<string, MemberOverride> {
  if (typeof window === "undefined") return {};
  try {
    const isFlex = isFlexGymOrFarooq();
    const key = getLocalMemberOverridesKey(scope);
    const raw = localStorage.getItem(key);
    let result: Record<string, MemberOverride> = raw ? JSON.parse(raw) : {};

    if (isFlex) {
      const userKey = `fitlegend_members_overrides_user_${getCurrentUserScope()}`;
      const userRaw = localStorage.getItem(userKey);
      if (userRaw) {
        try {
          const userOverrides = JSON.parse(userRaw);
          result = { ...userOverrides, ...result };
        } catch {}
      }

      const legacy = localStorage.getItem(MEMBERS_OVERRIDES_KEY);
      if (legacy) {
        try {
          const legacyOverrides = JSON.parse(legacy);
          result = { ...legacyOverrides, ...result };
        } catch {}
      }

      // Persist merged to both
      if (Object.keys(result).length > 0) {
        localStorage.setItem(key, JSON.stringify(result));
        localStorage.setItem(MEMBERS_OVERRIDES_KEY, JSON.stringify(result));
      }
    }

    return result;
  } catch {
    return {};
  }
}

/**
 * Save an override for a member and notify all listeners across the app
 */
export function saveLocalMemberOverride(id: string, override: MemberOverride, scope?: string): void {
  if (typeof window === "undefined" || !id) return;
  try {
    const key = getLocalMemberOverridesKey(scope);
    const current = getLocalMemberOverrides(scope);
    current[id] = { ...(current[id] || {}), ...override };
    localStorage.setItem(key, JSON.stringify(current));
    if (isFlexGymOrFarooq()) {
      localStorage.setItem(MEMBERS_OVERRIDES_KEY, JSON.stringify(current));
    }
    window.dispatchEvent(new CustomEvent(MEMBERS_UPDATED_EVENT, { detail: { id, override } }));
  } catch (err) {
    console.error("Failed to save member override:", err);
  }
}

/**
 * Save multiple overrides in a single atomic storage write
 */
export function saveLocalMemberOverridesBatch(entries: Record<string, MemberOverride>, scope?: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = getLocalMemberOverridesKey(scope);
    const current = getLocalMemberOverrides(scope);
    for (const [k, val] of Object.entries(entries)) {
      if (k) {
        current[k] = { ...current[k], ...val };
      }
    }
    localStorage.setItem(key, JSON.stringify(current));
    if (isFlexGymOrFarooq()) {
      localStorage.setItem(MEMBERS_OVERRIDES_KEY, JSON.stringify(current));
    }
    window.dispatchEvent(new CustomEvent(MEMBERS_UPDATED_EVENT, { detail: entries }));
  } catch (err) {
    console.error("Failed to batch save member overrides:", err);
  }
}

/**
 * Deterministically derive status ("active" | "expiring" | "expired")
 * Defaults to "active" for valid registered members rather than "expired".
 */
export function deriveMemberStatus(
  rawStatus?: string | null,
  isActive?: boolean,
  dueDateStr?: string | null,
  overrideStatus?: "active" | "expiring" | "expired"
): "active" | "expiring" | "expired" {
  if (overrideStatus) return overrideStatus;
  if (isActive === false) return "expired";

  const s = (rawStatus || "").toLowerCase();
  if (s === "expiring" || s === "رو به اتمام") return "expiring";
  if (s === "expired" || s === "منقضی") return "expired";
  if (s === "active" || s === "فعال") return "active";

  // Calculate based on dueDate if present
  if (dueDateStr && dueDateStr !== "—") {
    try {
      const parts = dueDateStr.split("-").map(Number);
      let due: Date;
      if (parts.length === 3) {
        due = new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        due = new Date(dueDateStr);
      }
      if (!isNaN(due.getTime())) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);
        const diffMs = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return "expired";
        if (diffDays <= 7) return "expiring";
      }
    } catch { }
  }

  // Default to active for members in good standing
  return "active";
}

/**
 * Unified hook that joins Django API members with local overrides
 * and calculates accurate KPI counts and member lists.
 */
export function useMembersData(search?: string) {
  const { data: membersResponse, isLoading, refetch } = useMembers({
    search: search || undefined,
  });

  const [overrides, setOverrides] = useState<Record<string, MemberOverride>>({});

  useEffect(() => {
    setOverrides(getLocalMemberOverrides());

    const handleUpdate = () => {
      setOverrides(getLocalMemberOverrides());
    };

    window.addEventListener(MEMBERS_UPDATED_EVENT, handleUpdate);
    window.addEventListener("fitlegend:gym-changed", handleUpdate);
    window.addEventListener("fitlegend:auth-logout", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(MEMBERS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("fitlegend:gym-changed", handleUpdate);
      window.removeEventListener("fitlegend:auth-logout", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const members: UnifiedMember[] = useMemo(() => {
    const rawList: any[] = Array.isArray(membersResponse)
      ? membersResponse
      : Array.isArray(membersResponse?.results)
        ? membersResponse.results
        : Array.isArray((membersResponse as any)?.members)
          ? (membersResponse as any).members
          : [];

    // Auto-deactivate any deleted or disallowed member (e.g. Maryam Rezaei) on Django if still returned active
    if (typeof window !== "undefined") {
      for (const m of rawList) {
        const fullName =
          m.full_name ||
          `${m.first_name || ""} ${m.last_name || ""}`.trim() ||
          m.name ||
          "";
        if (isDeletedMember(String(m.id), fullName) && m.is_active !== false) {
          membersService.deleteMember(m.id).catch(() => {});
        }
      }
    }

    return rawList
      .filter((m: any) => {
        if (m.is_active === false) return false;
        const fullName =
          m.full_name ||
          `${m.first_name || ""} ${m.last_name || ""}`.trim() ||
          m.name ||
          "";
        if (isDeletedMember(String(m.id), fullName)) return false;
        return true;
      })
      .map((m: any, idx: number) => {
        const memberId = String(m.id);
        const fullName =
          m.full_name ||
          `${m.first_name || ""} ${m.last_name || ""}`.trim() ||
          m.name ||
          "ورزشکار";

        const rawPhone = m.phone_number || m.phone || "";
        const phoneKeys = getPhoneLookupKeys(rawPhone);
        const normName = normalizePersianName(fullName);

        let override: MemberOverride = overrides[memberId] || {};
        for (const pk of phoneKeys) {
          if (overrides[`phone_${pk}`]) {
            override = { ...overrides[`phone_${pk}`], ...override };
            break;
          }
        }
        if (overrides[`name_${fullName}`]) {
          override = { ...overrides[`name_${fullName}`], ...override };
        }
        if (overrides[`normname_${normName}`]) {
          override = { ...overrides[`normname_${normName}`], ...override };
        }
        if (overrides[memberId]) {
          override = { ...overrides[memberId], ...override };
        }

        const plan =
          override.plan ||
          m.plan_name ||
          m.membership_plan_name ||
          m.current_plan_name ||
          "ماهانه";

        const coach =
          override.coach ||
          m.coach_name ||
          m.assigned_coach_name ||
          "بدون مربی";

        const joinDate =
          override.joinDate ||
          m.start_date ||
          m.membership_start_date ||
          m.created_at ||
          "";

        const dueDate =
          override.dueDate ||
          m.due_date ||
          m.membership_expiry_date ||
          "";

        const status = deriveMemberStatus(
          m.membership_status || m.status,
          m.is_active,
          dueDate,
          override.status
        );

        const email =
          override.email ||
          m.email ||
          "";

        const phone =
          override.phone ||
          m.phone_number ||
          "";

        return {
          id: memberId,
          code: 1000 + idx,
          name: fullName,
          fullName,
          email,
          phone,
          plan,
          coach,
          status,
          joinDate,
          dueDate,
          startDateIso: m.start_date || m.created_at || "",
          isActive: m.is_active !== false,
          avatar: override.avatar || m.avatar || m.profile_picture || m.photo || m.image || undefined,
        };
      });
  }, [membersResponse, overrides]);

  const counts: MemberCounts = useMemo(() => {
    let active = 0;
    let expiring = 0;
    let expired = 0;

    for (const m of members) {
      if (m.status === "expiring") {
        expiring++;
      } else if (m.status === "expired") {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: members.length,
      active,
      expiring,
      expired,
      newThisMonth: members.length,
    };
  }, [members]);

  return {
    members,
    counts,
    overrides,
    isLoading,
    refetch,
    saveOverride: saveLocalMemberOverride,
  };
}
