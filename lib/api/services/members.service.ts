import apiClient from "../client";
import { ENDPOINTS } from "../endpoints";

export interface MemberListItem {
  id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone_number?: string;
  email?: string | null;
  gender?: string;
  address?: string;
  assigned_coach_name?: string | null;
  assigned_coach_id?: string | null;
  coach_name?: string | null;
  current_plan_name?: string | null;
  plan_name?: string | null;
  status?: "active" | "expiring" | "expired" | "no_membership" | string;
  membership_status?: string;
  membership_start_date?: string | null;
  membership_expiry_date?: string | null;
  start_date?: string | null;
  due_date?: string | null;
  created_at?: string;
  days_left?: number;
  is_active?: boolean;
  avatar?: string | null;
  profile_picture?: string | null;
  photo?: string | null;
  image?: string | null;
}

export interface PaginatedMembersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MemberListItem[];
}

export interface CreateMemberPayload {
  first_name: string;
  last_name: string;
  start_date: string;
  phone_number?: string;
  email?: string;
  avatar?: string | null;
  gender?: "MALE" | "FEMALE" | "";
  date_of_birth?: string | null;
  address?: string;
  assigned_coach_id?: string | null;
  membership_plan_id?: string | null;
  goal?: string;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "";
  training_days?: string[];
  coach_notes?: string;
  create_login_account?: boolean;
}

export const membersService = {
  /**
   * List members with optional query filters (status, search, pagination)
   */
  async getMembers(params?: {
    status?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedMembersResponse> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== "all") query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", String(params.page));
    if (params?.page_size) query.set("page_size", String(params.page_size));

    const qs = query.toString();
    const endpoint = `${ENDPOINTS.MEMBERS.LIST}${qs ? `?${qs}` : ""}`;
    return apiClient.get<PaginatedMembersResponse>(endpoint, { requiresAuth: true });
  },

  /**
   * Get single member details
   */
  async getMember(id: string | number): Promise<MemberListItem> {
    return apiClient.get<MemberListItem>(ENDPOINTS.MEMBERS.DETAIL(id), { requiresAuth: true });
  },

  /**
   * Create a new member in the gym (POST /members/)
   * Conforms exactly to MemberCreate schema in FitLegend_Gym_OS_API.yaml
   */
  async createMember(payload: CreateMemberPayload): Promise<MemberListItem> {
    const today = new Date().toISOString().slice(0, 10);
    const body: Record<string, unknown> = {
      first_name: payload.first_name.trim(),
      last_name: payload.last_name.trim(),
      start_date: payload.start_date || today,
    };

    if (payload.phone_number?.trim()) {
      body.phone_number = payload.phone_number.trim();
    }
    if (payload.email?.trim()) {
      body.email = payload.email.trim();
    }
    if (payload.gender) {
      body.gender = payload.gender;
    }
    if (payload.date_of_birth) {
      body.date_of_birth = payload.date_of_birth;
    }
    if (payload.address?.trim()) {
      body.address = payload.address.trim();
    }
    if (payload.assigned_coach_id) {
      body.assigned_coach_id = payload.assigned_coach_id;
    }
    if (payload.membership_plan_id) {
      body.membership_plan_id = payload.membership_plan_id;
    }
    if (payload.goal?.trim()) {
      body.goal = payload.goal.trim();
    }
    if (payload.level) {
      body.level = payload.level;
    }
    if (Array.isArray(payload.training_days) && payload.training_days.length > 0) {
      body.training_days = payload.training_days;
    }
    if (payload.coach_notes?.trim()) {
      body.coach_notes = payload.coach_notes.trim();
    }
    if (payload.create_login_account !== undefined) {
      body.create_login_account = payload.create_login_account;
    }

    return apiClient.post<MemberListItem>(ENDPOINTS.MEMBERS.CREATE, body, { requiresAuth: true });
  },

  /**
   * Update an existing member
   */
  async updateMember(id: string | number, payload: Partial<CreateMemberPayload>): Promise<MemberListItem> {
    return apiClient.patch<MemberListItem>(ENDPOINTS.MEMBERS.UPDATE(id), payload, { requiresAuth: true });
  },

  /**
   * Delete or deactivate a member in Django backend
   */
  async deleteMember(id: string | number): Promise<void> {
    try {
      // 1. Attempt HTTP DELETE /members/{id}/
      await apiClient.delete(ENDPOINTS.MEMBERS.DELETE(id), { requiresAuth: true });
      return;
    } catch (err: any) {
      // 2. If DELETE fails or is not supported by DRF (405), deactivate via PATCH is_active: false
      try {
        await apiClient.patch(
          ENDPOINTS.MEMBERS.UPDATE(id),
          { is_active: false },
          { requiresAuth: true }
        );
        return;
      } catch (patchErr) {
        throw patchErr || err;
      }
    }
  },
};
