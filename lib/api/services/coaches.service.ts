import apiClient from "../client";
import { ENDPOINTS } from "../endpoints";
import { tokenStorage } from "../token";

export interface CoachItem {
  id: string;
  user_id?: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  phone_number?: string;
  email?: string;
  avatar?: string | null;
  specialties: string[];
  experience_years: number;
  primary_certification?: string;
  student_capacity?: number;
  active_students_count?: number;
  students_count?: number;
  work_shift?: "MORNING" | "EVENING" | "FULL_TIME" | "FLEXIBLE" | string;
  is_active: boolean;
  rating?: number;
  start_date?: string;
  bio?: string;
}

export interface CoachesResponse {
  coaches: CoachItem[];
  total_coaches: number;
  active_coaches: number;
  total_students: number;
  avg_rating: number;
}

export interface AddCoachPayload {
  first_name: string;
  last_name: string;
  phone: string;
  specialties: string[];
  gender?: "male" | "female" | "";
  birth_date?: string | null;
  email?: string;
  avatar?: string | null;
  address?: string;
  experience_years?: number;
  primary_certification?: string;
  student_capacity?: number | null;
  work_shift?: "morning" | "evening" | "morning_evening" | "full_time" | string;
  start_date?: string | null;
  working_days?: string[];
  position?: "coach" | "head_coach" | "reception" | string;
  send_invite?: boolean;
  instant_activation?: boolean;
  password?: string;
  password_confirm?: string;
  is_active?: boolean;
}

export const DAY_CODE_TO_NAME: Record<string, string> = {
  sat: "شنبه",
  sun: "یکشنبه",
  mon: "دوشنبه",
  tue: "سه‌شنبه",
  wed: "چهارشنبه",
  thu: "پنج‌شنبه",
  fri: "جمعه",
};

export const DAY_INDEX_TO_NAME = DAY_CODE_TO_NAME;

const DAY_MAP_TO_CODE: Record<string, string> = {
  "شنبه": "sat",
  "یکشنبه": "sun",
  "۱شنبه": "sun",
  "1شنبه": "sun",
  "دوشنبه": "mon",
  "۲شنبه": "mon",
  "2شنبه": "mon",
  "سه‌شنبه": "tue",
  "سه شنبه": "tue",
  "۳شنبه": "tue",
  "3شنبه": "tue",
  "چهارشنبه": "wed",
  "۴شنبه": "wed",
  "4شنبه": "wed",
  "پنج‌شنبه": "thu",
  "پنجشنبه": "thu",
  "۵شنبه": "thu",
  "5شنبه": "thu",
  "جمعه": "fri",
  "0": "sat",
  "1": "sun",
  "2": "mon",
  "3": "tue",
  "4": "wed",
  "5": "thu",
  "6": "fri",
  sat: "sat",
  sun: "sun",
  mon: "mon",
  tue: "tue",
  wed: "wed",
  thu: "thu",
  fri: "fri",
};

export function normalizeWorkingDays(days?: (string | number)[]): string[] {
  if (!Array.isArray(days)) return [];
  const normalized: string[] = [];
  const validCodes = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"];
  for (const d of days) {
    const key = String(d).trim().toLowerCase();
    const mapped = DAY_MAP_TO_CODE[key] ?? key;
    if (validCodes.includes(mapped) && !normalized.includes(mapped)) {
      normalized.push(mapped);
    }
  }
  return normalized;
}

export const coachesService = {
  /**
   * Get all coaches and KPI stats
   */
  async getCoaches(): Promise<CoachesResponse | CoachItem[]> {
    try {
      const res = await apiClient.get<any>(ENDPOINTS.COACHES.LIST, { requiresAuth: true });
      // In case Django separates /coaches/ and /coaches/?type=staff
      try {
        const staffRes = await apiClient.get<any>("/coaches/?type=staff", { requiresAuth: true });
        const staffList: any[] = Array.isArray(staffRes)
          ? staffRes
          : Array.isArray(staffRes?.coaches)
            ? staffRes.coaches
            : Array.isArray(staffRes?.results)
              ? staffRes.results
              : [];
        if (staffList.length > 0) {
          if (Array.isArray(res)) {
            const seen = new Set(res.map((c: any) => String(c.id)));
            for (const s of staffList) {
              if (!seen.has(String(s.id))) {
                res.push({ ...s, type: "staff", position: s.position || "reception" });
              }
            }
          } else if (res && typeof res === "object") {
            const targetArray = Array.isArray(res.coaches)
              ? res.coaches
              : Array.isArray(res.results)
                ? res.results
                : null;
            if (targetArray) {
              const seen = new Set(targetArray.map((c: any) => String(c.id)));
              for (const s of staffList) {
                if (!seen.has(String(s.id))) {
                  targetArray.push({ ...s, type: "staff", position: s.position || "reception" });
                }
              }
            }
          }
        }
      } catch (staffErr) {
        console.warn("Could not fetch /coaches/?type=staff:", staffErr);
      }
      return res;
    } catch (err) {
      console.warn("Error fetching /coaches/, attempting fallback /coaches/?type=coach:", err);
      try {
        return await apiClient.get<CoachesResponse | CoachItem[]>("/coaches/?type=coach", { requiresAuth: true });
      } catch (err2) {
        console.error("Failed to fetch coaches from backend:", err2);
        return [] as any;
      }
    }
  },

  /**
   * Get single coach details
   */
  async getCoach(id: string | number): Promise<CoachItem> {
    return apiClient.get<CoachItem>(ENDPOINTS.COACHES.DETAIL(id), { requiresAuth: true });
  },

  /**
   * Add a new coach (creates User + CoachProfile in Django)
   * Matches CoachCreate schema in FitLegend_Gym_OS_API.yaml
   */
  async addCoach(payload: AddCoachPayload): Promise<CoachItem> {
    const body: Record<string, unknown> = {
      first_name: payload.first_name.trim(),
      last_name: payload.last_name.trim(),
      phone: payload.phone.trim(),
      specialties:
        Array.isArray(payload.specialties) && payload.specialties.length > 0
          ? payload.specialties
          : ["بدنسازی"],
    };

    if (payload.gender) body.gender = payload.gender;
    if (payload.birth_date) body.birth_date = payload.birth_date;
    if (payload.email?.trim()) body.email = payload.email.trim();
    if (payload.address?.trim()) body.address = payload.address.trim();
    if (payload.experience_years !== undefined) {
      body.experience_years = Number(payload.experience_years) || 0;
    }
    if (payload.primary_certification?.trim()) {
      body.primary_certification = payload.primary_certification.trim();
    }
    if (payload.student_capacity !== undefined && payload.student_capacity !== null) {
      body.student_capacity = Number(payload.student_capacity);
    }


    if (payload.work_shift) body.work_shift = payload.work_shift;
    if (payload.start_date) body.start_date = payload.start_date;
    if (Array.isArray(payload.working_days) && payload.working_days.length > 0) {
      const normalizedDays = normalizeWorkingDays(payload.working_days);
      if (normalizedDays.length > 0) {
        body.working_days = normalizedDays;
      }
    }
    if (payload.position) body.position = payload.position;
    if (payload.send_invite !== undefined) body.send_invite = payload.send_invite;
    if (payload.instant_activation !== undefined) body.instant_activation = payload.instant_activation;
    if (payload.password) body.password = payload.password;
    if (payload.password_confirm) body.password_confirm = payload.password_confirm;

    return apiClient.post<CoachItem>("/coaches/add_coach/", body, { requiresAuth: true });
  },

  /**
   * Update an existing coach
   */
  async updateCoach(id: string | number, payload: Partial<AddCoachPayload>): Promise<CoachItem> {
    return apiClient.patch<CoachItem>(ENDPOINTS.COACHES.DETAIL(id), payload, { requiresAuth: true });
  },

  /**
   * Delete or deactivate a coach in Django backend
   * Per OpenAPI spec: "No DELETE — attendance history, plans and members reference the coach; deactivate instead."
   */
  async deleteCoach(id: string | number): Promise<void> {
    try {
      // 1. Attempt HTTP DELETE /coaches/{id}/
      await apiClient.delete(ENDPOINTS.COACHES.DETAIL(id), { requiresAuth: true });
      return;
    } catch (err: any) {
      const status = err?.status || err?.response?.status || err?.statusCode;
      // 2. If DELETE is not supported by DRF (405 Method Not Allowed) or other error, soft-deactivate via PATCH is_active: false
      if (status === 405 || status === 404 || status === 403 || status === 400 || status === 500 || !status) {
        try {
          await apiClient.patch(
            ENDPOINTS.COACHES.DETAIL(id),
            { is_active: false },
            { requiresAuth: true }
          );
          return;
        } catch (patchErr) {
          console.warn("Deactivation PATCH failed:", patchErr);
          throw patchErr;
        }
      }
      throw err;
    }
  },

  /**
   * Get Coach Dashboard data via GET /coaches/dashboard/
   */
  async getCoachDashboard(): Promise<CoachDashboardData> {
    try {
      const res = await apiClient.get<Partial<CoachDashboardData>>(ENDPOINTS.COACHES.DASHBOARD, {
        requiresAuth: true,
      });

      if (res && typeof res === "object") {
        return {
          ...INITIAL_COACH_DASHBOARD_DATA,
          ...res,
          today_sessions: Array.isArray(res.today_sessions) && res.today_sessions.length > 0
            ? res.today_sessions
            : INITIAL_COACH_DASHBOARD_DATA.today_sessions,
          needs_attention: Array.isArray(res.needs_attention) && res.needs_attention.length > 0
            ? res.needs_attention
            : INITIAL_COACH_DASHBOARD_DATA.needs_attention,
          weekly_attendance: Array.isArray(res.weekly_attendance) && res.weekly_attendance.length > 0
            ? res.weekly_attendance
            : INITIAL_COACH_DASHBOARD_DATA.weekly_attendance,
          top_students: Array.isArray(res.top_students) && res.top_students.length > 0
            ? res.top_students
            : INITIAL_COACH_DASHBOARD_DATA.top_students,
          recent_activity: Array.isArray(res.recent_activity) && res.recent_activity.length > 0
            ? res.recent_activity
            : INITIAL_COACH_DASHBOARD_DATA.recent_activity,
        };
      }
      return INITIAL_COACH_DASHBOARD_DATA;
    } catch {
      // In offline / preview / demo / dev mode, return the rich dashboard data matching the reference HTML
      return INITIAL_COACH_DASHBOARD_DATA;
    }
  },

  /**
   * Get authenticated coach's own profile via GET /coaches/me/
   */
  async getCoachMe(): Promise<CoachDetail> {
    return apiClient.get<CoachDetail>(ENDPOINTS.COACHES.ME, {
      requiresAuth: true,
    });
  },

  /**
   * Update authenticated coach's own profile via PATCH /coaches/me/
   */
  async updateCoachMe(payload: PatchedCoachSelfUpdate): Promise<CoachDetail> {
    return apiClient.patch<CoachDetail>(ENDPOINTS.COACHES.ME, payload, {
      requiresAuth: true,
    });
  },

  /**
   * Get coach's students table via GET /coaches/my-students/
   */
  async getMyStudents(params?: { status?: string; search?: string }): Promise<CoachStudentRow[]> {
    return apiClient.get<CoachStudentRow[]>(ENDPOINTS.COACHES.MY_STUDENTS, {
      requiresAuth: true,
      params,
    });
  },

  /**
   * Add a new student assigned to the authenticated coach via POST /api/coach/add-student
   */
  async addMyStudent(payload: {
    first_name: string;
    last_name: string;
    phone_number: string;
    email?: string;
    date_of_birth?: string | null;
    gender?: "MALE" | "FEMALE" | "";
    address?: string;
    goal?: string;
    level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | string;
    training_days?: string[] | Record<string, unknown>;
    coach_notes?: string;
    start_date: string;
    is_active?: boolean;
    coachId?: string;
  }): Promise<any> {
    const token = typeof window !== "undefined" ? tokenStorage.getAccessToken() : null;
    const res = await fetch("/api/coach/add-student", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || "خطا در ثبت شاگرد در سرور.");
    }
    return res.json();
  },

  /**
   * Get coach performance report via GET /coaches/performance/?days={days}
   */
  async getCoachPerformance(days: number = 30): Promise<CoachPerformance> {
    return apiClient.get<CoachPerformance>(ENDPOINTS.COACHES.PERFORMANCE, {
      requiresAuth: true,
      params: { days },
    });
  },

  /**
   * Unassign coach from student in Django backend (sets assigned_coach to null in Django panel)
   */
  async unassignStudent(studentId: string): Promise<any> {
    const res = await fetch("/api/coach/unassign-student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || "خطا در لغو انتساب شاگرد");
    }
    return res.json();
  },
};

export interface CoachDetail {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  gender?: "male" | "female" | "";
  birth_date?: string | null;
  address?: string;
  position: "coach" | "head_coach" | "reception" | string;
  bio?: string;
  specialties?: string[] | Record<string, unknown>;
  experience_years?: number;
  primary_certification?: string;
  student_capacity?: number | null;
  work_shift?: "morning" | "evening" | "morning_evening" | "full_time" | string;
  start_date?: string | null;
  working_days?: string[] | Record<string, unknown>;
  is_active: boolean;
}

export interface PatchedCoachSelfUpdate {
  bio?: string;
  specialties?: string[] | Record<string, unknown>;
  experience_years?: number;
  primary_certification?: string;
  student_capacity?: number | null;
  work_shift?: "morning" | "evening" | "morning_evening" | "full_time" | string;
  working_days?: string[] | Record<string, unknown>;
  email?: string;
}

export interface CoachStudentPlan {
  id: string;
  name: string;
}

export interface CoachStudentRow {
  id: string;
  full_name: string;
  current_plan: CoachStudentPlan | null;
  status: "active" | "expiring" | "expired" | string;
  attendance_rate: number;
  last_session: string | null;
  membership_end_date: string | null;
}

export interface MonthlySessionsPoint {
  month: string;
  sessions: number;
}

export interface GoalMix {
  goal: string;
  percentage: number;
  count: number;
}

export interface PerformanceTopStudent {
  rank: number;
  name: string;
  score: number;
}

export interface ClassAttendance {
  class_name: string;
  rate: number;
}

export interface GoalProgress {
  goal: string;
  progress_pct: number;
}

export interface CoachPerformance {
  days: number;
  sessions_held: number;
  sessions_trend_pct: number | null;
  avg_attendance_rate: number | null;
  active_students: number;
  satisfaction_score: number | null;
  monthly_sessions: MonthlySessionsPoint[];
  goal_mix: GoalMix[];
  top_students: PerformanceTopStudent[];
  class_attendance: ClassAttendance[];
  goal_progress: GoalProgress[];
}

export interface CoachTodaySession {
  id: string;
  member_id: string;
  member_name: string;
  workout_title: string;
  program_name: string;
  time: string;
  duration_minutes: number;
  status: "attended" | "pending";
}

export interface CoachNeedsAttentionItem {
  id: string;
  member_id: string;
  member_name: string;
  text: string;
  time_hint: string;
  badge_type: "amber" | "cyan" | "default";
}

export interface CoachWeeklyAttendanceBar {
  day: string;
  checkins: number;
  percentage: number;
  is_muted?: boolean;
}

export interface CoachTopStudent {
  id: string;
  rank: number;
  name: string;
  rate: number;
}

export interface CoachRecentActivity {
  id: string;
  type: "checkin" | "weight" | "program" | "new_student";
  student_name: string;
  action_text: string;
  time: string;
}

export interface CoachDashboardData {
  active_students: number;
  new_students_this_month: number;
  checkins_today: number;
  sessions_today_total: number;
  sessions_today_remaining: number;
  weekly_attendance_rate: number;
  weekly_attendance_rate_trend: number;
  unanswered_messages_count: number;
  today_sessions: CoachTodaySession[];
  needs_attention: CoachNeedsAttentionItem[];
  weekly_attendance: CoachWeeklyAttendanceBar[];
  top_students: CoachTopStudent[];
  recent_activity: CoachRecentActivity[];
}

export const INITIAL_COACH_DASHBOARD_DATA: CoachDashboardData = {
  active_students: 0,
  new_students_this_month: 0,
  checkins_today: 0,
  sessions_today_total: 0,
  sessions_today_remaining: 0,
  weekly_attendance_rate: 0,
  weekly_attendance_rate_trend: 0,
  unanswered_messages_count: 0,
  today_sessions: [],
  needs_attention: [],
  weekly_attendance: [],
  top_students: [],
  recent_activity: [],
};

