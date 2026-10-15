/**
 * Persistent manager avatar storage & image compression helper
 * Scoped strictly per-user to prevent avatar leakage across different gym managers.
 */

import { isFlexGymOrFarooq } from "@/lib/session-scope";

export const AVATAR_UPDATED_EVENT = "fitlegend:avatar-updated";

/**
 * Retrieve the saved avatar for the manager strictly scoped to that user's identity
 */
export function getSavedManagerAvatar(identifier?: string | null): string | null {
  if (typeof window === "undefined") return null;
  try {
    let cleanId = identifier ? String(identifier).trim().toLowerCase() : null;
    let rawUserObj: any = null;
    const rawUser = localStorage.getItem("fitlegend_user");
    if (rawUser) {
      try {
        rawUserObj = JSON.parse(rawUser);
      } catch {}
    }

    if (!cleanId && rawUserObj) {
      cleanId = (rawUserObj.email || (rawUserObj.id ? String(rawUserObj.id) : null))?.trim().toLowerCase() || null;
    }

    const legacyGlobal = localStorage.getItem("fitlegend_manager_avatar");
    const isFarooq = isFlexGymOrFarooq(rawUserObj);

    if (cleanId) {
      const specific = localStorage.getItem(`fitlegend_avatar_${cleanId}`);
      if (specific) {
        if (!isFarooq && legacyGlobal && specific === legacyGlobal) {
          localStorage.removeItem(`fitlegend_avatar_${cleanId}`);
          return null;
        }
        return specific;
      }
    }

    // If active user is Farooq / Flex manager, fall back to legacy global avatar
    if (isFarooq && legacyGlobal) {
      if (cleanId) {
        localStorage.setItem(`fitlegend_avatar_${cleanId}`, legacyGlobal);
      }
      return legacyGlobal;
    }
  } catch {}
  return null;
}

/**
 * Persist the manager's avatar strictly in that specific manager's storage key
 */
export function saveManagerAvatar(avatar: string, identifier?: string | null): void {
  if (typeof window === "undefined" || !avatar) return;
  try {
    let cleanId = identifier ? String(identifier).trim().toLowerCase() : null;
    let rawUserObj: any = null;
    const rawUser = localStorage.getItem("fitlegend_user");
    if (rawUser) {
      try {
        rawUserObj = JSON.parse(rawUser);
      } catch {}
    }

    if (!cleanId && rawUserObj) {
      cleanId = (rawUserObj.email || (rawUserObj.id ? String(rawUserObj.id) : null))?.trim().toLowerCase() || null;
    }

    if (cleanId) {
      localStorage.setItem(`fitlegend_avatar_${cleanId}`, avatar);
    }

    if (isFlexGymOrFarooq(rawUserObj)) {
      localStorage.setItem("fitlegend_manager_avatar", avatar);
    }

    window.dispatchEvent(new CustomEvent(AVATAR_UPDATED_EVENT, { detail: { avatar } }));
  } catch (err) {
    console.warn("Failed to persist manager avatar:", err);
  }
}

/**
 * Compress an image file to a lightweight data URL for responsive loading and storage
 */
export function compressAvatarImage(file: File, maxDim = 320, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}
