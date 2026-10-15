"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  authService,
  type User,
  type LoginPayload,
  type GoogleLoginPayload,
  type LoginResponse,
  type OTPRequestPayload,
  type OTPVerifyPayload,
  type DetailResponse,
} from "@/lib/api/services/auth.service";
import { tokenStorage } from "@/lib/api/token";
import { getQueryClient } from "@/lib/react-query/query-client";
import {
  getSavedManagerAvatar,
  saveManagerAvatar,
  AVATAR_UPDATED_EVENT,
} from "@/lib/manager-avatar";
import { purgeLegacyGlobalStores } from "@/lib/session-scope";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  status: AuthStatus;
  isAuthenticated: boolean;
  loginWithPassword: (payload: LoginPayload) => Promise<LoginResponse>;
  loginWithGoogle: (payload: GoogleLoginPayload) => Promise<LoginResponse>;
  requestOtp: (payload: OTPRequestPayload) => Promise<DetailResponse>;
  verifyOtp: (payload: OTPVerifyPayload) => Promise<LoginResponse | DetailResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  updateUser: (payload: Partial<User>) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize cached user & verify session on mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      // 1. Check if token exists and session is valid
      const hasSession = tokenStorage.hasValidSession();

      if (!hasSession) {
        // Drop any stale cached user session, but preserve manager profile picture
        if (typeof window !== "undefined") {
          localStorage.removeItem("fitlegend_user");
        }
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      // Purge legacy global un-scoped stores
      purgeLegacyGlobalStores();

      // 2. Hydrate cached user only if session is valid
      if (typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem("fitlegend_user");
          if (cached && isMounted) {
            const parsed = JSON.parse(cached);
            const localAvatar = getSavedManagerAvatar(parsed?.email || (parsed?.id ? String(parsed.id) : null));
            if (localAvatar) parsed.avatar = localAvatar;
            setUser(parsed);
          }
        } catch {
          // Ignore parse errors
        }
      }

      // 3. Sync latest profile from backend
      try {
        const freshUser = await authService.getMe();
        const localAvatar = getSavedManagerAvatar(freshUser.email || String(freshUser.id));
        if (localAvatar && (!freshUser.avatar || freshUser.avatar === "")) {
          freshUser.avatar = localAvatar;
        } else if (freshUser.avatar) {
          saveManagerAvatar(freshUser.avatar, freshUser.email || String(freshUser.id));
        }
        if (isMounted) {
          setUser(freshUser);
        }
      } catch {
        // Token might be invalid or expired and refresh failed
        if (isMounted && !tokenStorage.hasValidSession()) {
          setUser(null);
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen to global logout events
    const handleLogoutEvent = () => {
      if (typeof window !== "undefined") {
        try {
          getQueryClient().clear();
        } catch {}
      }
      if (isMounted) {
        setUser(null);
      }
    };
    window.addEventListener("fitlegend:auth-logout", handleLogoutEvent);

    // Listen to avatar updates
    const handleAvatarUpdate = (e: any) => {
      const newAvatar = e.detail?.avatar;
      if (newAvatar && isMounted) {
        setUser((prev) => (prev ? { ...prev, avatar: newAvatar } : prev));
      }
    };
    window.addEventListener(AVATAR_UPDATED_EVENT, handleAvatarUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("fitlegend:auth-logout", handleLogoutEvent);
      window.removeEventListener(AVATAR_UPDATED_EVENT, handleAvatarUpdate);
    };
  }, []);

  const loginWithPassword = useCallback(async (payload: LoginPayload) => {
    const res = await authService.login(payload);
    if (res.user) {
      try {
        getQueryClient().clear();
      } catch {}
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("fitlegend_user", JSON.stringify(res.user));
        } catch {}
      }
      purgeLegacyGlobalStores();

      const savedAvatar = getSavedManagerAvatar(res.user.email || String(res.user.id));
      if (savedAvatar && (!res.user.avatar || res.user.avatar === "")) {
        res.user.avatar = savedAvatar;
      } else if (res.user.avatar) {
        saveManagerAvatar(res.user.avatar, res.user.email || String(res.user.id));
      }
      setUser(res.user);
    }
    return res;
  }, []);

  const loginWithGoogle = useCallback(async (payload: GoogleLoginPayload) => {
    const res = await authService.googleLogin(payload);
    if (res.user) {
      try {
        getQueryClient().clear();
      } catch {}
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("fitlegend_user", JSON.stringify(res.user));
        } catch {}
      }
      purgeLegacyGlobalStores();

      const savedAvatar = getSavedManagerAvatar(res.user.email || String(res.user.id));
      if (savedAvatar && (!res.user.avatar || res.user.avatar === "")) {
        res.user.avatar = savedAvatar;
      } else if (res.user.avatar) {
        saveManagerAvatar(res.user.avatar, res.user.email || String(res.user.id));
      }
      setUser(res.user);
    }
    return res;
  }, []);

  const requestOtp = useCallback(async (payload: OTPRequestPayload) => {
    return authService.requestOtp(payload);
  }, []);

  const verifyOtp = useCallback(async (payload: OTPVerifyPayload) => {
    const res = await authService.verifyOtp(payload);
    if ("user" in res && res.user) {
      try {
        getQueryClient().clear();
      } catch {}
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("fitlegend_user", JSON.stringify(res.user));
        } catch {}
      }
      purgeLegacyGlobalStores();

      const savedAvatar = getSavedManagerAvatar(res.user.email || String(res.user.id));
      if (savedAvatar && (!res.user.avatar || res.user.avatar === "")) {
        res.user.avatar = savedAvatar;
      } else if (res.user.avatar) {
        saveManagerAvatar(res.user.avatar, res.user.email || String(res.user.id));
      }
      setUser(res.user);
    }
    return res;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    try {
      getQueryClient().clear();
    } catch {}
    try {
      purgeLegacyGlobalStores();
    } catch {}
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const u = await authService.getMe();
      if (u) {
        const savedAvatar = getSavedManagerAvatar(u.email || String(u.id));
        if (savedAvatar && (!u.avatar || u.avatar === "")) {
          u.avatar = savedAvatar;
        } else if (u.avatar) {
          saveManagerAvatar(u.avatar, u.email || String(u.id));
        }
      }
      setUser(u);
      return u;
    } catch {
      return null;
    }
  }, []);

  const updateUser = useCallback(async (payload: Partial<User>) => {
    if (payload.avatar) {
      saveManagerAvatar(payload.avatar, user?.email || (user ? String(user.id) : null));
    }

    let updated: User | null = null;
    try {
      updated = await authService.updateMe(payload);
    } catch {
      // Backend might fail or reject large avatar base64 string; try updating rest
      if (payload.avatar) {
        try {
          const { avatar: _av, ...rest } = payload;
          updated = await authService.updateMe(rest);
        } catch {}
      }
    }

    setUser((prev) => {
      const effectiveAvatar =
        payload.avatar ||
        updated?.avatar ||
        getSavedManagerAvatar(prev?.email || (prev ? String(prev.id) : null)) ||
        prev?.avatar ||
        null;

      const merged: User = {
        ...(prev || ({} as User)),
        ...(updated || {}),
        ...payload,
        avatar: effectiveAvatar,
      };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("fitlegend_user", JSON.stringify(merged));
        } catch {}
      }
      return merged;
    });

    return (updated || payload) as User;
  }, [user]);

  const status: AuthStatus =
    isLoading || (!user && tokenStorage.hasValidSession())
      ? "loading"
      : user && tokenStorage.hasValidSession()
        ? "authenticated"
        : "unauthenticated";
  const isAuthenticated = Boolean(user && tokenStorage.hasValidSession());

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        status,
        isAuthenticated,
        loginWithPassword,
        loginWithGoogle,
        requestOtp,
        verifyOtp,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
