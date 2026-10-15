import { ClassMember } from "./types";
import { isDeletedMember, normalizePersianName } from "@/lib/members-store";
import { getCurrentGymScope } from "@/lib/session-scope";

const CLASS_ROSTER_PREFIX = "fitlegend_gym_class_roster_";
export const ROSTER_UPDATED_EVENT = "fitlegend_gym_roster_updated";

// Only Maryam Rezaei and explicitly deleted members are disallowed
const DISALLOWED_MOCK_NAMES = new Set([
  "مریم رضایی",
  "مریم حسینی",
]);

/**
 * Checks if a member in a class is disallowed (mock, deleted, Maryam Rezaei, or not in members list)
 */
export function isDisallowedMember(m: any, validMembers?: any[]): boolean {
  if (!m) return true;
  const idStr = String(m.id || "").trim();
  if (/^class_m[1-8]$/i.test(idStr)) return true;

  const name = String(m.name || m.fullName || "").trim();
  const normName = normalizePersianName(name);
  const maryamNorm = normalizePersianName("مریم رضایی");

  if (normName === maryamNorm || normName.includes(maryamNorm)) return true;
  if (DISALLOWED_MOCK_NAMES.has(name)) return true;
  if (isDeletedMember(idStr, name)) return true;

  // If a list of active gym members is provided, ensure this member actually exists in it
  if (validMembers && Array.isArray(validMembers)) {
    if (validMembers.length === 0) {
      return true; // No members exist in this gym account!
    }
    // If it's a newly added member (ID starting with m_ or timestamp), allow it
    if (idStr.startsWith("m_")) {
      return false;
    }

    const rawPhone = String(m.phone || "").replace(/[^\d]/g, "");
    const foundInValidList = validMembers.some((vm: any) => {
      if (vm.isActive === false || vm.is_active === false) return false;
      if (String(vm.id) === idStr) return true;
      if (normalizePersianName(vm.fullName || vm.name) === normName) return true;
      if (rawPhone && rawPhone.length >= 7) {
        const vmPhone = String(vm.phone || vm.phone_number || "").replace(/[^\d]/g, "");
        if (vmPhone.endsWith(rawPhone) || rawPhone.endsWith(vmPhone)) return true;
      }
      return false;
    });

    if (!foundInValidList) {
      return true; // Not in the admin members list!
    }
  }

  return false;
}

// Backward-compatibility alias
export const isMockMember = (m: any) => isDisallowedMember(m);

/**
 * Purge disallowed / deleted members across all class rosters and local bookings
 */
export function purgeDisallowedMembersFromAllClassRosters(validMembers?: any[]): void {
  if (typeof window === "undefined") return;
  try {
    let changedAny = false;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CLASS_ROSTER_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const cleaned = parsed.filter((m) => !isDisallowedMember(m, validMembers));
              if (cleaned.length !== parsed.length) {
                localStorage.setItem(key, JSON.stringify(cleaned));
                changedAny = true;
              }
            }
          } catch {}
        }
      }
    }

    // Also clean local bookings store if Maryam Rezaei or disallowed members exist
    try {
      const rawBookings = localStorage.getItem("fitlegend_gym_bookings_local");
      if (rawBookings) {
        const parsedBookings = JSON.parse(rawBookings);
        if (Array.isArray(parsedBookings)) {
          const cleanedBookings = parsedBookings.filter((b) => {
            const bName = b.member_name || b.name || "";
            return !isDisallowedMember({ id: b.member_id || b.id, name: bName }, validMembers);
          });
          if (cleanedBookings.length !== parsedBookings.length) {
            localStorage.setItem("fitlegend_gym_bookings_local", JSON.stringify(cleanedBookings));
            changedAny = true;
          }
        }
      }
    } catch {}

    if (changedAny) {
      window.dispatchEvent(new CustomEvent(ROSTER_UPDATED_EVENT));
    }
  } catch {}
}

// Backward-compatibility alias
export const purgeMockMembersFromStorage = () => purgeDisallowedMembersFromAllClassRosters();

// Auto-purge known disallowed members when running in browser
if (typeof window !== "undefined") {
  purgeDisallowedMembersFromAllClassRosters();
}

/**
 * Specifically remove a deleted member by ID or Name from all class rosters
 */
export function removeMemberFromAllClassRosters(id: string, name?: string): void {
  if (typeof window === "undefined") return;
  try {
    const normName = name ? normalizePersianName(name) : "";
    let changed = false;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CLASS_ROSTER_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const cleaned = parsed.filter((m) => {
                if (id && String(m.id) === String(id)) return false;
                if (normName && normalizePersianName(m.name || m.fullName) === normName) return false;
                return true;
              });
              if (cleaned.length !== parsed.length) {
                localStorage.setItem(key, JSON.stringify(cleaned));
                changed = true;
              }
            }
          } catch {}
        }
      }
    }

    // Clean local bookings
    try {
      const rawBookings = localStorage.getItem("fitlegend_gym_bookings_local");
      if (rawBookings) {
        const parsed = JSON.parse(rawBookings);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((b) => {
            if (id && String(b.member_id || b.id) === String(id)) return false;
            if (normName && normalizePersianName(b.member_name) === normName) return false;
            return true;
          });
          if (cleaned.length !== parsed.length) {
            localStorage.setItem("fitlegend_gym_bookings_local", JSON.stringify(cleaned));
            changed = true;
          }
        }
      }
    } catch {}

    if (changed) {
      window.dispatchEvent(new CustomEvent(ROSTER_UPDATED_EVENT));
    }
  } catch {}
}

export function getClassRosterKey(classId: string, scope?: string): string {
  const s = scope || getCurrentGymScope();
  return `fitlegend_gym_class_roster_${s}_${classId}`;
}

/**
 * Retrieve class roster strictly filtered against active gym members
 */
export function getClassRoster(
  classId: string,
  defaultMembers: ClassMember[] = [],
  validMembers?: any[],
  scope?: string
): ClassMember[] {
  if (typeof window === "undefined" || !classId) {
    return defaultMembers.filter((m) => !isDisallowedMember(m, validMembers));
  }
  const s = scope || getCurrentGymScope();
  try {
    const key = getClassRosterKey(classId, s);
    const raw =
      localStorage.getItem(key) ||
      (s === "gym_flex" || s.includes("farooq") ? localStorage.getItem(`${CLASS_ROSTER_PREFIX}${classId}`) : null);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((m) => !isDisallowedMember(m, validMembers));
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(key, JSON.stringify(cleaned));
        }
        return cleaned;
      }
    }
  } catch (err) {
    console.error("Failed to read class roster from localStorage:", err);
  }
  return defaultMembers.filter((m) => !isDisallowedMember(m, validMembers));
}

/**
 * Save class roster to localStorage, stripping any disallowed members
 */
export function saveClassRoster(
  classId: string,
  members: ClassMember[],
  validMembers?: any[],
  scope?: string
): void {
  if (typeof window === "undefined" || !classId) return;
  const s = scope || getCurrentGymScope();
  try {
    const key = getClassRosterKey(classId, s);
    const cleaned = members.filter((m) => !isDisallowedMember(m, validMembers));
    localStorage.setItem(key, JSON.stringify(cleaned));
    window.dispatchEvent(new CustomEvent(ROSTER_UPDATED_EVENT, { detail: { classId, count: cleaned.length } }));
  } catch (err) {
    console.error("Failed to save class roster to localStorage:", err);
  }
}
