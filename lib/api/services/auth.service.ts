import apiClient, { ApiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import { ApiError } from "../errors";
import { tokenStorage, decodeJwtExp, getCookie } from "../token";
import { setActiveGymScope } from "../../session-scope";

function cleanTokenString(val: unknown): string | null {
  if (typeof val !== "string") return null;
  let t = val.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1).trim();
  }
  return t.length > 0 ? t : null;
}

/**
 * Same-origin client routed through the Next.js `/api-proxy` route handler.
 * Needed for endpoints that deliver the JWT ONLY via httpOnly cookies
 * (e.g. /users/otp/verify/): the browser blocks those SameSite=Lax cookies on
 * cross-site responses, so the proxy reads them server-side and echoes the
 * tokens back in the JSON body as `access` / `refresh`.
 */
const proxyClient = new ApiClient("/api-proxy");

/** Strip the trailing slash so Next.js doesn't 308-redirect the proxied request. */
function proxyPath(endpoint: string): string {
  return endpoint.replace(/\/+$/, "");
}

/** Returns the value only if it is a structurally valid JWT. */
function asJwt(value: unknown): string | null {
  return typeof value === "string" && decodeJwtExp(value) !== null ? value : null;
}

export type UserRole = "OWNER" | "COACH" | "MEMBER";

export interface User {
  id: string;
  email: string | null;
  phone_number: string | null;
  is_phone_verified: boolean;
  full_name: string;
  avatar: string | null;
  role: UserRole;
  date_joined: string;
  notify_workout_reminder?: boolean;
  notify_coach_message?: boolean;
  notify_membership_expiry?: boolean;
  notify_promotions?: boolean;
  language?: "fa" | "en";
  weight_unit?: "kg" | "lb";
  dark_mode?: boolean;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface OTPRequestPayload {
  identifier: string;
}

export interface OTPVerifyPayload {
  identifier: string;
  code: string;
}

export interface GoogleLoginPayload {
  id_token?: string;
  access_token?: string;
}

export interface ForgotPasswordRequestPayload {
  identifier: string;
  phone_number?: string;
}

export interface ForgotPasswordVerifyPayload {
  identifier: string;
  code: string;
}

export interface ForgotPasswordVerifyResponse {
  reset_token: string;
}

export interface ForgotPasswordConfirmPayload {
  reset_token?: string;
  phone_number?: string;
  code?: string;
  password: string;
  password_confirm: string;
}

export interface DetailResponse {
  detail: string;
  needs_registration?: boolean;
}

export const authService = {
  /**
   * Log in user with identifier (email or phone) and password
   * Conforms to POST /users/login/
   */
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const data = await apiClient.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, payload, {
      requiresAuth: false,
      credentials: "include",
    });

    const anyData = data as any;
    const access =
      cleanTokenString(anyData?.access) ||
      cleanTokenString(anyData?.access_token) ||
      cleanTokenString(anyData?.token) ||
      cleanTokenString(anyData?.key);

    const refresh =
      cleanTokenString(anyData?.refresh) ||
      cleanTokenString(anyData?.refresh_token) ||
      "";

    if (access) {
      tokenStorage.setTokens({
        access,
        refresh,
      });
    }

    if (anyData?.user) {
      if (typeof window !== "undefined") {
        localStorage.setItem("fitlegend_user", JSON.stringify(anyData.user));
        const role = anyData.user.role ? String(anyData.user.role).trim().toUpperCase() : "";
        if (role === "COACH") {
          setActiveGymScope("4179ec1c-f534-44e1-b9d2-6b679d81a3a8", "فلکس");
        }
      }
      return { access: access || "", refresh: refresh || "", user: anyData.user };
    }

    if (access || tokenStorage.hasValidSession()) {
      try {
        const user = await this.getMe();
        if (user && typeof window !== "undefined") {
          localStorage.setItem("fitlegend_user", JSON.stringify(user));
          const role = user.role ? String(user.role).trim().toUpperCase() : "";
          if (role === "COACH") {
            setActiveGymScope("4179ec1c-f534-44e1-b9d2-6b679d81a3a8", "فلکس");
          }
        }
        return { access: access || "", refresh: refresh || "", user };
      } catch (err) {
        console.warn("Could not fetch user profile after login:", err);
      }
    }

    return data;
  },

  /**
   * Request OTP SMS or Email code for Login
   * Conforms to POST /users/otp/request/
   */
  async requestOtp(payload: OTPRequestPayload): Promise<DetailResponse> {
    return apiClient.post<DetailResponse>(ENDPOINTS.AUTH.OTP_REQUEST, payload, {
      requiresAuth: false,
      credentials: "include",
    });
  },

  /**
   * Verify OTP and log in
   * Conforms to POST /users/otp/verify/
   */
  async verifyOtp(payload: OTPVerifyPayload): Promise<LoginResponse | DetailResponse> {
    const client = typeof window !== "undefined" ? proxyClient : apiClient;
    const endpoint =
      typeof window !== "undefined" ? proxyPath(ENDPOINTS.AUTH.OTP_VERIFY) : ENDPOINTS.AUTH.OTP_VERIFY;

    let data: any;
    try {
      data = await client.post<LoginResponse | DetailResponse>(endpoint, payload, {
        requiresAuth: false,
      });
    } catch (proxyErr) {
      if (client !== apiClient) {
        data = await apiClient.post<LoginResponse | DetailResponse>(
          ENDPOINTS.AUTH.OTP_VERIFY,
          payload,
          { requiresAuth: false, credentials: "include" },
        );
      } else {
        throw proxyErr;
      }
    }

    const anyData = data as any;
    let access =
      cleanTokenString(anyData?.access) ||
      cleanTokenString(anyData?.access_token) ||
      cleanTokenString(anyData?.token) ||
      cleanTokenString(anyData?.key) ||
      cleanTokenString(anyData?.tokens?.access) ||
      cleanTokenString(anyData?.data?.access);

    let refresh =
      cleanTokenString(anyData?.refresh) ||
      cleanTokenString(anyData?.refresh_token) ||
      cleanTokenString(anyData?.tokens?.refresh) ||
      cleanTokenString(anyData?.data?.refresh) ||
      "";

    // If tokens are in browser cookies
    if (!access && typeof document !== "undefined") {
      access =
        tokenStorage.getAccessToken() ||
        cleanTokenString(getCookie("gym_os_access")) ||
        cleanTokenString(getCookie("access")) ||
        cleanTokenString(getCookie("access_token"));
      if (!refresh) {
        refresh =
          tokenStorage.getRefreshToken() ||
          cleanTokenString(getCookie("gym_os_refresh")) ||
          cleanTokenString(getCookie("refresh")) ||
          "";
      }
    }

    if (access) {
      tokenStorage.setTokens({ access, refresh });
    }

    // Direct user in response
    if (anyData?.user) {
      if (typeof window !== "undefined") {
        localStorage.setItem("fitlegend_user", JSON.stringify(anyData.user));
      }
      return { access: access || "", refresh: refresh || "", user: anyData.user };
    }

    // Attempt profile retrieval
    try {
      const user = await this.getMe();
      return { access: access || "", refresh: refresh || "", user };
    } catch {
      if (access || tokenStorage.hasValidSession()) {
        const fallbackUser: User = {
          id: "",
          email: payload.identifier.includes("@") ? payload.identifier : null,
          phone_number: !payload.identifier.includes("@") ? payload.identifier : null,
          is_phone_verified: true,
          full_name: "کاربر فیتلجند",
          avatar: null,
          role: "OWNER",
          date_joined: new Date().toISOString(),
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("fitlegend_user", JSON.stringify(fallbackUser));
        }
        return {
          access: access || tokenStorage.getAccessToken() || "",
          refresh: refresh || tokenStorage.getRefreshToken() || "",
          user: fallbackUser,
        };
      }
      return data;
    }
  },

  /**
   * Google OAuth / One Tap login
   * Conforms to POST /users/google/
   */
  async googleLogin(payload: GoogleLoginPayload): Promise<LoginResponse> {
    const data = await apiClient.post<LoginResponse>(
      ENDPOINTS.AUTH.GOOGLE,
      payload,
      { requiresAuth: false, credentials: "include" },
    );

    const anyData = data as any;
    const access =
      anyData?.access ||
      anyData?.access_token ||
      anyData?.token ||
      anyData?.key ||
      anyData?.tokens?.access ||
      anyData?.data?.access;

    const refresh =
      anyData?.refresh ||
      anyData?.refresh_token ||
      anyData?.tokens?.refresh ||
      anyData?.data?.refresh ||
      "";

    if (access) {
      tokenStorage.setTokens({
        access,
        refresh,
      });
      if (typeof window !== "undefined" && anyData.user) {
        localStorage.setItem("fitlegend_user", JSON.stringify(anyData.user));
      }
      return {
        access,
        refresh,
        user: anyData.user,
      };
    } else {
      if (typeof window !== "undefined") {
        localStorage.setItem("fitlegend_session_refreshable", "true");
      }
    }

    // If tokens are in httpOnly cookie or returned differently, fetch user
    const user = await this.getMe();
    return {
      access: tokenStorage.getAccessToken() || "",
      refresh: tokenStorage.getRefreshToken() || "",
      user,
    };
  },

  /**
   * Step 1 — Send OTP for Forgot Password
   * Conforms to POST /users/password/forgot/request/
   */
  async forgotPasswordRequest(payload: ForgotPasswordRequestPayload): Promise<DetailResponse> {
    return apiClient.post<DetailResponse>(
      ENDPOINTS.AUTH.FORGOT_PASSWORD_REQUEST,
      payload,
      { requiresAuth: false },
    );
  },

  /**
   * Step 2 — Verify OTP for Forgot Password -> returns reset_token
   * Conforms to POST /users/password/forgot/verify/
   */
  async forgotPasswordVerify(payload: ForgotPasswordVerifyPayload): Promise<ForgotPasswordVerifyResponse> {
    return apiClient.post<ForgotPasswordVerifyResponse>(
      ENDPOINTS.AUTH.FORGOT_PASSWORD_VERIFY,
      payload,
      { requiresAuth: false },
    );
  },

  /**
   * Step 3 — Set new password using reset_token
   * Conforms to POST /users/password/forgot/confirm/
   */
  async forgotPasswordConfirm(payload: ForgotPasswordConfirmPayload): Promise<DetailResponse> {
    return apiClient.post<DetailResponse>(
      ENDPOINTS.AUTH.FORGOT_PASSWORD_CONFIRM,
      payload,
      { requiresAuth: false },
    );
  },

  /**
   * Get current authenticated user details
   * Conforms to GET /users/me/
   */
  async getMe(): Promise<User> {
    const user = await apiClient.get<User>(ENDPOINTS.AUTH.ME, { requiresAuth: true });
    if (typeof window !== "undefined" && user) {
      localStorage.setItem("fitlegend_user", JSON.stringify(user));
    }
    return user;
  },

  /**
   * Partial update current user fields
   * Conforms to PATCH /users/me/
   */
  async updateMe(payload: Partial<User>): Promise<User> {
    const updated = await apiClient.patch<User>(ENDPOINTS.AUTH.ME, payload, { requiresAuth: true });
    if (typeof window !== "undefined" && updated) {
      const cached = localStorage.getItem("fitlegend_user");
      let merged = updated;
      if (cached) {
        try {
          merged = { ...JSON.parse(cached), ...updated };
        } catch { }
      }
      localStorage.setItem("fitlegend_user", JSON.stringify(merged));
    }
    return updated;
  },

  /**
   * Change user password
   * Conforms to POST /users/password/change/
   */
  async changePassword(payload: { new_password1: string; new_password2: string }): Promise<{ detail: string }> {
    return apiClient.post<{ detail: string }>(
      ENDPOINTS.AUTH.CHANGE_PASSWORD,
      payload,
      { requiresAuth: true },
    );
  },

  /**
   * Log out user and clear stored tokens
   * Conforms to POST /users/logout/
   */
  async logout(): Promise<void> {
    try {
      const refresh = tokenStorage.getRefreshToken();
      await apiClient.post(
        ENDPOINTS.AUTH.LOGOUT,
        refresh ? { refresh } : {},
        { requiresAuth: true, credentials: "include" },
      );
    } catch {
      // Proceed to cleanup even if backend logout fails
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("fitlegend_user");
      }
      tokenStorage.clearTokens();
    }
  },
};

