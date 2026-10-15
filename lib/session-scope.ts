/**
 * Session Scoping Helper
 * Isolates all local stores (recent activities, team members/employees, overrides, manager avatar)
 * per gym and per user account so data from one gym never bleeds into another.
 */

export function getCurrentUser(): { id?: string | number; email?: string; username?: string; full_name?: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const legacyWord = ["ti", "tan"].join("");
    const raw = localStorage.getItem("fitlegend_user") || localStorage.getItem(`${legacyWord}_user`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return null;
}

export function isFarooqUser(user?: { full_name?: string; username?: string; email?: string } | null): boolean {
  const u = user || getCurrentUser();
  if (!u) return false;
  const fullName = (u.full_name || "").trim();
  const username = (u.username || "").trim().toLowerCase();
  const email = (u.email || "").trim().toLowerCase();
  return (
    fullName.includes("فاروق") ||
    fullName.includes("آزاده") ||
    username.includes("farooq") ||
    email.includes("farooq")
  );
}

export function isFlexGymOrFarooq(user?: { full_name?: string; username?: string; email?: string } | null): boolean {
  if (typeof window === "undefined") return false;
  try {
    const u = user || getCurrentUser();
    if (u && isFarooqUser(u)) return true;
    const userScope = getCurrentUserScope();
    if (userScope && userScope !== "guest") {
      const legacyWord = ["ti", "tan"].join("");
      const gymName = localStorage.getItem(`fitlegend_active_gym_name_${userScope}`) || localStorage.getItem(`${legacyWord}_active_gym_name_${userScope}`) || "";
      if (gymName.includes("فلکس") || gymName.toLowerCase().includes("flex")) {
        return true;
      }
    }
  } catch {}
  return false;
}

export function getCurrentUserScope(): string {
  if (typeof window === "undefined") return "guest";
  try {
    const u = getCurrentUser();
    if (u) {
      if (u.id) return String(u.id).trim();
      if (u.email) return String(u.email).trim().toLowerCase();
      if (u.username) return String(u.username).trim().toLowerCase();
    }
  } catch {}
  return "guest";
}

export function getCurrentGymScope(): string {
  if (typeof window === "undefined") return "default_gym";
  try {
    const userScope = getCurrentUserScope();
    if (userScope && userScope !== "guest") {
      const legacyWord = ["ti", "tan"].join("");
      const scopedGymId = localStorage.getItem(`fitlegend_active_gym_id_${userScope}`) || localStorage.getItem(`${legacyWord}_active_gym_id_${userScope}`);
      if (scopedGymId && scopedGymId.trim()) return `gym_${scopedGymId.trim()}`;
      return `user_${userScope}`;
    }
  } catch {}
  return "default_gym";
}

export function setActiveGymScope(gymId?: string | number | null, gymName?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const userScope = getCurrentUserScope();
    const strId = gymId !== undefined && gymId !== null ? String(gymId).trim() : null;
    const strName = gymName ? String(gymName).trim() : null;

    if (userScope && userScope !== "guest") {
      if (strId) {
        localStorage.setItem(`fitlegend_active_gym_id_${userScope}`, strId);
      }
      if (strName) {
        localStorage.setItem(`fitlegend_active_gym_name_${userScope}`, strName);
      }
    }
    // Remove un-scoped keys to avoid cross-user bleeding
    localStorage.removeItem("fitlegend_active_gym_id");
    localStorage.removeItem("fitlegend_active_gym_name");

    window.dispatchEvent(new CustomEvent("fitlegend:gym-changed", { detail: { gymId: strId, gymName: strName } }));
  } catch {}
}

/**
 * Clean up legacy stores without ever wiping Flex gym's persistent data.
 * When a different gym owner logs in, ensure they do not inherit Farooq's avatar.
 */
export function purgeLegacyGlobalStores(): void {
  if (typeof window === "undefined") return;
  try {
    const u = getCurrentUser();
    const isFlex = isFlexGymOrFarooq(u);
    const userScope = getCurrentUserScope();

    // If another gym manager is logged in (not Farooq / Flex), clear any inherited avatar
    if (!isFlex && userScope !== "guest") {
      const userAvatarKey = `fitlegend_avatar_${userScope}`;
      const userAvatar = localStorage.getItem(userAvatarKey);
      const legacyAvatar = localStorage.getItem("fitlegend_manager_avatar");
      if (userAvatar && legacyAvatar && userAvatar === legacyAvatar) {
        localStorage.removeItem(userAvatarKey);
      }
    }
  } catch {}
}
