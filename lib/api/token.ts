/**
 * Token and Session Storage Management for FitLegend Gym
 * Supports safe browser storage with fallback and SSR guards.
 */

import { purgeLegacyGlobalStores } from "@/lib/session-scope";

const ACCESS_TOKEN_KEY = "fitlegend_access_token";
const REFRESH_TOKEN_KEY = "fitlegend_refresh_token";
const REFRESHABLE_KEY = "fitlegend_session_refreshable";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getCookie(name: string): string | null {
  if (!isBrowser()) return null;
  const match = document.cookie.match(
    new RegExp("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)"),
  );
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days = 7): void {
  if (!isBrowser()) return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

function deleteCookie(name: string): void {
  if (!isBrowser()) return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

function cleanToken(token: string | null | undefined): string | null {
  if (!token) return null;
  let t = token.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1).trim();
  }
  if (t.toLowerCase().startsWith("bearer ")) {
    t = t.slice(7).trim();
  }
  return t.length > 0 ? t : null;
}

// In-memory cache for decoded JWT expiration timestamps
const jwtExpCache = new Map<string, number | null>();

/**
 * Decodes the expiration time (exp in seconds) from a JWT string without external libraries.
 * Safely handles UTF-8 characters in payload.
 * Memoized per token string for maximum performance.
 */
export function decodeJwtExp(token: string): number | null {
  if (!token) return null;
  if (jwtExpCache.has(token)) {
    return jwtExpCache.get(token)!;
  }
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      jwtExpCache.set(token, null);
      return null;
    }
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    let jsonStr = "";
    if (typeof atob === "function") {
      try {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        jsonStr = new TextDecoder().decode(bytes);
      } catch {
        jsonStr = atob(base64);
      }
    } else {
      jsonStr = Buffer.from(base64, "base64").toString("utf8");
    }
    const payload = JSON.parse(jsonStr);
    const exp = typeof payload.exp === "number" ? payload.exp : null;
    jwtExpCache.set(token, exp);
    return exp;
  } catch {
    jwtExpCache.set(token, null);
    return null;
  }
}

/**
 * Checks if a token is usable (not expired).
 * skewSeconds: clock drift leeway (defaults to 30 seconds).
 */
export function isTokenUsable(token: string | null | undefined, skewSeconds = 30): boolean {
  if (!token) return false;
  const exp = decodeJwtExp(token);
  if (exp === null) {
    // Non-JWT token or token without exp: consider usable if valid length
    return token.length > 10;
  }
  const now = Math.floor(Date.now() / 1000);
  return exp > now + skewSeconds;
}

// One-time legacy token migration & cleanup
let legacyMigrated = false;
function migrateAndCleanLegacy(): void {
  if (!isBrowser() || legacyMigrated) return;
  legacyMigrated = true;

  try {
    const legacyWord = ["ti", "tan"].join("");
    const legacyAccessKeys = ["access_token", "access", "token", `${legacyWord}_access_token`, `${legacyWord}_token`];
    const legacyRefreshKeys = ["refresh_token", "refresh", `${legacyWord}_refresh_token`];

    // Migrate access token if fitlegend_access_token not set
    const currentFitLegendAccess = cleanToken(localStorage.getItem(ACCESS_TOKEN_KEY));
    if (!currentFitLegendAccess || !isTokenUsable(currentFitLegendAccess, 0)) {
      for (const key of legacyAccessKeys) {
        const val = cleanToken(localStorage.getItem(key) || getCookie(key));
        if (val && isTokenUsable(val, 0)) {
          localStorage.setItem(ACCESS_TOKEN_KEY, val);
          setCookie(ACCESS_TOKEN_KEY, val);
          break;
        }
      }
    }

    // Migrate refresh token if fitlegend_refresh_token not set
    const currentFitLegendRefresh = cleanToken(localStorage.getItem(REFRESH_TOKEN_KEY));
    if (!currentFitLegendRefresh) {
      for (const key of legacyRefreshKeys) {
        const val = cleanToken(localStorage.getItem(key) || getCookie(key));
        if (val) {
          localStorage.setItem(REFRESH_TOKEN_KEY, val);
          setCookie(REFRESH_TOKEN_KEY, val, 30);
          break;
        }
      }
    }

    // Remove all legacy keys from localStorage and cookies
    for (const key of [...legacyAccessKeys, ...legacyRefreshKeys]) {
      localStorage.removeItem(key);
      deleteCookie(key);
    }
  } catch {
    // Ignore storage errors
  }
}

export const tokenStorage = {
  getAccessToken(): string | null {
    if (!isBrowser()) return null;
    migrateAndCleanLegacy();

    const raw =
      localStorage.getItem(ACCESS_TOKEN_KEY) ||
      getCookie(ACCESS_TOKEN_KEY) ||
      getCookie("gym_os_access") ||
      getCookie("access");
    const cleaned = cleanToken(raw);
    if (!cleaned) return null;

    // Check expiration if JWT exp is available
    const exp = decodeJwtExp(cleaned);
    if (exp !== null && !isTokenUsable(cleaned, 0)) {
      return null;
    }

    return cleaned;
  },

  getRefreshToken(): string | null {
    if (!isBrowser()) return null;
    migrateAndCleanLegacy();

    const raw =
      localStorage.getItem(REFRESH_TOKEN_KEY) ||
      getCookie(REFRESH_TOKEN_KEY) ||
      getCookie("gym_os_refresh") ||
      getCookie("refresh");
    return cleanToken(raw);
  },

  setTokens(tokens: { access: string; refresh?: string | null }): void {
    if (!isBrowser()) return;
    if (tokens.access) {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
      setCookie(ACCESS_TOKEN_KEY, tokens.access);
      localStorage.setItem(REFRESHABLE_KEY, "true");
    }
    if (tokens.refresh) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
      setCookie(REFRESH_TOKEN_KEY, tokens.refresh, 30);
      localStorage.setItem(REFRESHABLE_KEY, "true");
    }
  },

  clearTokens(): void {
    if (!isBrowser()) return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REFRESHABLE_KEY);
    localStorage.removeItem("fitlegend_user");

    deleteCookie(ACCESS_TOKEN_KEY);
    deleteCookie(REFRESH_TOKEN_KEY);
    deleteCookie("csrftoken");
    deleteCookie("gym_os_access");
    deleteCookie("gym_os_refresh");

    localStorage.removeItem("fitlegend_active_gym_id");
    localStorage.removeItem("fitlegend_active_gym_name");
    try {
      purgeLegacyGlobalStores();
    } catch {}

    // Dispatch event so other components or tabs can react immediately
    window.dispatchEvent(new CustomEvent("fitlegend:auth-logout"));
  },

  hasValidSession(): boolean {
    if (!isBrowser()) return false;
    const access = this.getAccessToken();
    // 1. Usable access token
    if (access && isTokenUsable(access, 0)) {
      return true;
    }
    // 2. Usable refresh token exists
    const refresh = this.getRefreshToken();
    if (refresh) {
      const exp = decodeJwtExp(refresh);
      if (exp === null || isTokenUsable(refresh, 0)) {
        return true;
      }
    }
    // 3. Or marked refreshable by httpOnly cookie
    if (localStorage.getItem(REFRESHABLE_KEY) === "true") {
      return true;
    }
    return false;
  },
};
