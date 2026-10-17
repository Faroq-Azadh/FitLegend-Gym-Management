/**
 * Centralized API endpoints for Django REST Framework backend
 * All endpoints match the OpenAPI specification without /api/v1 prefix.
 */

export function getApiBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://ashkandev.ir";

  return url.replace(/\/+$/, "");
}

export const API_BASE_URL = getApiBaseUrl();

export const ENDPOINTS = {
  // Authentication & Session
  AUTH: {
    LOGIN: "/users/login/",
    REGISTER: "/gyms/register/",
    REFRESH: "/users/token/refresh/",
    LOGOUT: "/users/logout/",
    ME: "/users/me/",
    OTP_REQUEST: "/users/otp/request/",
    OTP_VERIFY: "/users/otp/verify/",
    GOOGLE: "/users/google/",
    CHANGE_PASSWORD: "/users/password/change/",
    FORGOT_PASSWORD_REQUEST: "/users/password/forgot/request/",
    FORGOT_PASSWORD_VERIFY: "/users/password/forgot/verify/",
    FORGOT_PASSWORD_CONFIRM: "/users/password/forgot/confirm/",
  },

  // Gym & Profile Information
  GYMS: {
    REGISTER: "/gyms/register/",
    ME: "/gyms/me/",
    SETTINGS: "/gyms/me/settings/",
    DASHBOARD: "/gyms/dashboard/",
    REPORTS: "/gyms/reports/",
    PLANS: "/gyms/plans/",
  },

  // Membership & System Plans
  PLANS: {
    MEMBERSHIP_LIST: "/members/plans/",
    MEMBERSHIP_CREATE: "/members/plans/",
    MEMBERSHIP_DETAIL: (id: string | number) => `/members/plans/${id}/`,
    SYSTEM_LIST: "/gyms/plans/",
  },

  // Profile
  PROFILE: {
    ME: "/gyms/me/",
    SETTINGS: "/gyms/me/settings/",
    CHANGE_PASSWORD: "/auth/change-password/",
  },

  // Members Management
  MEMBERS: {
    LIST: "/members/",
    DETAIL: (id: string | number) => `/members/${id}/`,
    CREATE: "/members/",
    UPDATE: (id: string | number) => `/members/${id}/`,
    DELETE: (id: string | number) => `/members/${id}/`,
    STATS: "/members/stats/",
  },

  // Coaches & Trainers
  COACHES: {
    LIST: "/coaches/",
    DETAIL: (id: string | number) => `/coaches/${id}/`,
    DASHBOARD: "/coaches/dashboard/",
    ME: "/coaches/me/",
    MY_STUDENTS: "/coaches/my-students/",
    PERFORMANCE: "/coaches/performance/",
  },

  // Classes & Schedules
  CLASSES: {
    LIST: "/classes/",
    DETAIL: (id: string | number) => `/classes/${id}/`,
    AVAILABLE: "/classes/available/",
    BOOKINGS: "/classes/bookings/",
    CALENDAR: "/classes/calendar/",
    MY_BOOKINGS: "/classes/my-bookings/",
  },

  // Payments & Finance
  BILLING: {
    PAYMENTS: "/billing/payments/",
    MY_PAYMENTS: "/billing/my-payments/",
    REFUND: (id: string | number) => `/billing/payments/${id}/refund/`,
  },

  // Attendance
  ATTENDANCE: {
    CHECK_IN: "/attendance/check-in/",
    MY_CHECKINS: "/attendance/my-checkins/",
    STAFF_CHECK_IN: "/attendance/staff-check-in/",
  },
} as const;
