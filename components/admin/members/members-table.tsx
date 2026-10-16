"use client";

import React, { useState, useMemo } from "react";
import { toPersianDigits } from "@/lib/persian-digits";
import { cn } from "@/lib/utils";

export interface MemberItem {
  id: string;
  code: number;
  name: string;
  plan: string;
  coach: string;
  status: "active" | "expiring" | "expired";
  joinDate: string;
  dueDate: string;
  email?: string;
  phone?: string;
  avatar?: string;
}



const AVATAR_COLORS = [
  "#F25C1F",
  "#0EA5E9",
  "#6366F1",
  "#F59E0B",
  "#EC4899",
  "#0EA5E9",
  "#10B981",
  "#8B5CF6",
];

const STATUS_CONFIG: Record<
  MemberItem["status"],
  { label: string; bgClass: string; dotClass: string; textClass: string }
> = {
  active: {
    label: "فعال",
    bgClass: "bg-[#E0F2FE]",
    dotClass: "bg-[#0EA5E9]",
    textClass: "text-[#0284C7]",
  },
  expiring: {
    label: "رو به اتمام",
    bgClass: "bg-[#FFFBEB]",
    dotClass: "bg-[#F59E0B]",
    textClass: "text-[#B45309]",
  },
  expired: {
    label: "منقضی",
    bgClass: "bg-[#FFF1F2]",
    dotClass: "bg-[#F43F5E]",
    textClass: "text-[#9F1239]",
  },
};

interface MembersTableProps {
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
  onOpenAddModal?: () => void;
}

import { useQueryClient } from "@tanstack/react-query";
import {
  useMembers,
  useCreateMember,
  useUpdateMember,
  useDeleteMember,
} from "@/lib/hooks/queries/use-members";
import { usePlans } from "@/lib/hooks/queries/use-plans";
import { useCoaches } from "@/lib/hooks/queries/use-coaches";
import { plansService } from "@/lib/api/services/plans.service";
import {
  isStaffMember,
  getLocalCoachOverrides,
  getDeletedCoachIds,
} from "@/lib/coaches-store";
import Link from "next/link";
import {
  Loader2,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ExternalLink,
  Target,
  Dumbbell,
  ShieldCheck,
  Check,
  Camera,
} from "lucide-react";
import {
  getLocalMemberOverrides,
  saveLocalMemberOverride,
  saveLocalMemberOverridesBatch,
  getPhoneLookupKeys,
  normalizePersianName,
  deriveMemberStatus,
  markMemberAsDeleted,
  isDeletedMember,
  MEMBERS_UPDATED_EVENT,
  type MemberOverride,
} from "@/lib/members-store";
import { removeMemberFromAllClassRosters } from "@/components/admin/classes/roster-store";
import { logActivity } from "@/lib/activities-store";

interface PlanOption {
  id?: string;
  name: string;
  durationDays: number;
  price: number;
  label: string;
}

const DEFAULT_PLANS: PlanOption[] = [
  { name: "ماهانه", durationDays: 30, price: 980000, label: "ماهانه (۳۰ روزه) - ۹۸۰,۰۰۰ تومان" },
  { name: "۳ ماهه", durationDays: 90, price: 2500000, label: "۳ ماهه (۹۰ روزه) - ۲,۵۰۰,۰۰۰ تومان" },
  { name: "۶ ماهه", durationDays: 180, price: 4800000, label: "۶ ماهه (۱۸۰ روزه) - ۴,۸۰۰,۰۰۰ تومان" },
  { name: "VIP سالانه", durationDays: 365, price: 8900000, label: "VIP سالانه (۳۶۵ روزه) - ۸,۹۰۰,۰۰۰ تومان" },
];



const WEEK_DAYS = [
  { key: "شنبه", label: "شنبه" },
  { key: "یکشنبه", label: "۱‌شنبه" },
  { key: "دوشنبه", label: "۲‌شنبه" },
  { key: "سه‌شنبه", label: "۳‌شنبه" },
  { key: "چهارشنبه", label: "۴‌شنبه" },
  { key: "پنج‌شنبه", label: "۵‌شنبه" },
  { key: "جمعه", label: "جمعه" },
];

const LEVEL_OPTIONS: { id: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"; label: string }[] = [
  { id: "BEGINNER", label: "مبتدی" },
  { id: "INTERMEDIATE", label: "متوسط" },
  { id: "ADVANCED", label: "پیشرفته" },
];

function getTodayIso(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDaysIso(isoDate: string, days: number): string {
  try {
    const parts = isoDate.split("-").map(Number);
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      d.setDate(d.getDate() + days);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    const d = new Date(isoDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  } catch {
    return isoDate;
  }
}

function formatPersianDateDisplay(dateStr?: string | null): string {
  if (!dateStr || dateStr === "—") return "—";
  try {
    const parts = dateStr.split("-").map(Number);
    let d: Date;
    if (parts.length === 3) {
      d = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      d = new Date(dateStr);
    }
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("fa-IR", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatPersianDateFull(dateStr?: string | null): string {
  if (!dateStr || dateStr === "—") return "—";
  try {
    const parts = dateStr.split("-").map(Number);
    let d: Date;
    if (parts.length === 3) {
      d = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      d = new Date(dateStr);
    }
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function isUuid(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export function MembersTable({
  isAddModalOpen,
  onCloseAddModal,
  onOpenAddModal,
}: MembersTableProps) {
  const [filter, setFilter] = useState<"all" | "active" | "expiring" | "expired">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState("1");

  const { data: membersResponse, isLoading: isQueryLoading } = useMembers({
    search: searchQuery || undefined,
  });

  const { data: backendPlans } = usePlans();
  const { data: backendCoaches } = useCoaches();

  const plansList: any[] = Array.isArray(backendPlans)
    ? backendPlans
    : Array.isArray((backendPlans as any)?.results)
      ? (backendPlans as any).results
      : Array.isArray((backendPlans as any)?.plans)
        ? (backendPlans as any).plans
        : [];

  const coachesList: any[] = useMemo(() => {
    if (!backendCoaches) return [];
    if (Array.isArray(backendCoaches)) return backendCoaches;
    const b = backendCoaches as any;
    if (Array.isArray(b.coaches)) return b.coaches;
    if (Array.isArray(b.results)) return b.results;
    if (Array.isArray(b.data)) return b.data;
    if (Array.isArray(b.data?.coaches)) return b.data.coaches;
    if (Array.isArray(b.data?.results)) return b.data.results;
    if (Array.isArray(b.team)) return b.team;
    if (Array.isArray(b.staff)) return b.staff;
    return [];
  }, [backendCoaches]);

  const planOptions: PlanOption[] = useMemo(() => {
    if (plansList && plansList.length > 0) {
      return plansList.map((p: any) => {
        const priceNum = typeof p.price === "string" ? parseFloat(p.price) : (p.price || 0);
        const days = p.duration_days || 30;
        return {
          id: String(p.id),
          name: p.name,
          durationDays: days,
          price: priceNum,
          label: `${p.name} (${toPersianDigits(days)} روزه)${priceNum ? ` - ${priceNum.toLocaleString("fa-IR")} تومان` : ""}`,
        };
      });
    }
    return DEFAULT_PLANS;
  }, [plansList]);

  const coachOptions = useMemo(() => {
    const list: { id?: string; name: string; label: string }[] = [];
    const seenNames = new Set<string>();

    const overrides = getLocalCoachOverrides();
    const deletedCoachIds = getDeletedCoachIds();

    // 1. Coaches returned from Django backend /coaches/
    if (coachesList && coachesList.length > 0) {
      coachesList.forEach((c: any) => {
        const coachId = c.id ? String(c.id) : "";
        if (coachId && deletedCoachIds.includes(coachId)) return;

        const coachName = (
          c.full_name ||
          (c.user && (c.user.full_name || `${c.user.first_name || ""} ${c.user.last_name || ""}`.trim() || c.user.username)) ||
          `${c.first_name || ""} ${c.last_name || ""}`.trim() ||
          c.name ||
          ""
        ).trim();

        if (!coachName || coachName === "بدون مربی" || coachName === "ندارد") return;

        const normName = normalizePersianName(coachName);
        const override =
          (coachId ? overrides[coachId] : undefined) ||
          overrides[`name_${coachName}`] ||
          overrides[`normname_${normName}`] ||
          {};

        if (override.is_deleted || override.status === "deleted") return;
        if (c.is_active === false && override.status !== "active") return;

        // CRITICAL: Do NOT show employees / staff when picking coaches for members
        if (isStaffMember(c, override)) return;

        if (!seenNames.has(coachName)) {
          seenNames.add(coachName);
          const spec = Array.isArray(c.specialties) && c.specialties.length > 0
            ? ` (${c.specialties.join("، ")})`
            : typeof c.specialties === "string" && c.specialties && !c.specialties.includes("پذیرش")
              ? ` (${c.specialties})`
              : "";
          list.push({
            id: coachId || undefined,
            name: coachName,
            label: `${coachName}${spec}`,
          });
        }
      });
    }

    // 2. Also harvest any coaches assigned to members from the Django panel (/members/)
    const rawMembers: any[] = Array.isArray(membersResponse)
      ? membersResponse
      : Array.isArray(membersResponse?.results)
        ? membersResponse.results
        : Array.isArray((membersResponse as any)?.members)
          ? (membersResponse as any).members
          : [];

    rawMembers.forEach((m: any) => {
      const coachName = (
        m.coach_name ||
        m.assigned_coach_name ||
        (m.assigned_coach_details &&
          (m.assigned_coach_details.full_name ||
            `${m.assigned_coach_details.first_name || ""} ${m.assigned_coach_details.last_name || ""}`.trim())) ||
        ""
      ).trim();

      if (coachName && coachName !== "بدون مربی" && coachName !== "ندارد" && !seenNames.has(coachName)) {
        const norm = normalizePersianName(coachName);
        const override = overrides[`name_${coachName}`] || overrides[`normname_${norm}`] || {};
        if (override.is_deleted || isStaffMember({}, override)) return;

        seenNames.add(coachName);
        list.push({
          id: m.assigned_coach_id || m.assigned_coach ? String(m.assigned_coach_id || m.assigned_coach) : undefined,
          name: coachName,
          label: coachName,
        });
      }
    });

    return list;
  }, [coachesList, membersResponse]);

  const queryClient = useQueryClient();
  const createMemberMutation = useCreateMember();
  const updateMemberMutation = useUpdateMember();
  const deleteMemberMutation = useDeleteMember();

  React.useEffect(() => {
    const handleSync = () => {
      try {
        setLocalOverrides(getLocalMemberOverrides());
      } catch { }
    };
    window.addEventListener(MEMBERS_UPDATED_EVENT, handleSync);
    window.addEventListener("fitlegend:gym-changed", handleSync);
    window.addEventListener("fitlegend:auth-logout", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener(MEMBERS_UPDATED_EVENT, handleSync);
      window.removeEventListener("fitlegend:gym-changed", handleSync);
      window.removeEventListener("fitlegend:auth-logout", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const [localOverrides, setLocalOverrides] = useState<Record<string, MemberOverride>>(() => {
    return getLocalMemberOverrides();
  });

  const members: MemberItem[] = useMemo(() => {
    const list: any[] = Array.isArray(membersResponse)
      ? membersResponse
      : Array.isArray(membersResponse?.results)
        ? membersResponse.results
        : Array.isArray((membersResponse as any)?.members)
          ? (membersResponse as any).members
          : [];

    // Auto-deactivate any deleted member (e.g. Maryam Rezaei) in Django backend if still returned active
    if (typeof window !== "undefined") {
      for (const m of list) {
        const fullName =
          m.full_name ||
          `${m.first_name || ""} ${m.last_name || ""}`.trim() ||
          m.name ||
          "";
        if (isDeletedMember(String(m.id), fullName) && m.is_active !== false) {
          deleteMemberMutation.mutate(m.id);
        }
      }
    }

    return list
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
        const fullName =
          m.full_name ||
          `${m.first_name || ""} ${m.last_name || ""}`.trim() ||
          m.name ||
          "ورزشکار";

        const rawPhone = m.phone_number || m.phone || "";
        const phoneKeys = getPhoneLookupKeys(rawPhone);
        const normName = normalizePersianName(fullName);

        let override: MemberOverride = localOverrides[String(m.id)] || {};
        for (const pk of phoneKeys) {
          if (localOverrides[`phone_${pk}`]) {
            override = { ...localOverrides[`phone_${pk}`], ...override };
            break;
          }
        }
        if (localOverrides[`name_${fullName}`]) {
          override = { ...localOverrides[`name_${fullName}`], ...override };
        }
        if (localOverrides[`normname_${normName}`]) {
          override = { ...localOverrides[`normname_${normName}`], ...override };
        }
        if (localOverrides[String(m.id)]) {
          override = { ...localOverrides[String(m.id)], ...override };
        }

        const dueDate =
          override.dueDate ||
          formatPersianDateDisplay(m.due_date || m.membership_expiry_date);

        const status = deriveMemberStatus(
          m.membership_status || m.status,
          m.is_active,
          m.due_date || m.membership_expiry_date,
          override.status
        );

        const joinDate =
          override.joinDate ||
          formatPersianDateDisplay(m.start_date || m.membership_start_date || m.created_at);

        const plan =
          override.plan ||
          m.plan_name ||
          m.current_plan_name ||
          "ماهانه";

        const coach =
          override.coach ||
          m.coach_name ||
          m.assigned_coach_name ||
          "بدون مربی";

        return {
          id: String(m.id),
          code: 1000 + idx,
          name: fullName,
          plan,
          coach,
          status,
          joinDate,
          dueDate,
          email: override.email || m.email || "",
          phone: override.phone || m.phone_number || "",
          avatar: override.avatar || m.avatar || m.profile_picture || m.photo || m.image || undefined,
        };
      });
  }, [membersResponse, localOverrides]);

  // Edit & Add Member states
  const [editingMember, setEditingMember] = useState<MemberItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    avatar: string;
    start_date: string;
    membership_plan_id: string;
    assigned_coach_id: string;
    gender: "MALE" | "FEMALE" | "";
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "";
    goal: string;
    training_days: string[];
    date_of_birth: string;
    address: string;
    coach_notes: string;
    create_login_account: boolean;
  }>({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    avatar: "",
    start_date: getTodayIso(),
    membership_plan_id: "",
    assigned_coach_id: "",
    gender: "MALE",
    level: "BEGINNER",
    goal: "",
    training_days: [],
    date_of_birth: "",
    address: "",
    coach_notes: "",
    create_login_account: false,
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    plan: "",
    coach: "",
    joinDate: "",
    dueDate: "",
    status: "active" as MemberItem["status"],
    email: "",
    avatar: "",
  });

  const compressImage = (file: File): Promise<string> => {
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
          const maxDim = 320;
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
            resolve(canvas.toDataURL("image/jpeg", 0.85));
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
  };

  const [showExtraDetails, setShowExtraDetails] = useState(false);

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("");
  };

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesFilter = filter === "all" || member.status === filter;
      const matchesSearch = member.name.includes(searchQuery.trim());
      return matchesFilter && matchesSearch;
    });
  }, [members, filter, searchQuery]);

  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const memberToDelete = members.find((m) => String(m.id) === String(id));
    const memberName = memberToDelete?.name || "عضو";

    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `آیا از حذف «${memberName}» اطمینان دارید؟`
      )
    ) {
      return;
    }

    setDeletingMemberId(id);

    try {
      // 1. Delete or deactivate directly on Django
      await deleteMemberMutation.mutateAsync(id);

      // 2. Mark as deleted in persistent storage
      markMemberAsDeleted(id, memberName);

      // 3. Purge member from ALL class rosters immediately
      removeMemberFromAllClassRosters(id, memberName);

      logActivity({
        type: "ALERT",
        text: `حذف عضو: ${memberName}`,
      });

      // 4. Refetch directly from Django to keep frontend and backend in 100% sync
      await queryClient.invalidateQueries({ queryKey: ["members"] });
      await queryClient.refetchQueries({ queryKey: ["members"] });
    } catch (err: any) {
      console.error("Failed to delete member on Django:", err);
      const msg =
        err?.detail ||
        err?.message ||
        (typeof err === "string" ? err : "خطا در حذف عضو از سامانه. لطفاً وضعیت ورود یا دسترسی را بررسی نمایید.");
      if (typeof window !== "undefined") {
        window.alert(`خطا در حذف عضو:\n${msg}`);
      }
    } finally {
      setDeletingMemberId(null);
    }
  };

  const handleOpenEdit = (member: MemberItem) => {
    setEditingMember(member);
    setEditFormData({
      name: member.name,
      plan: member.plan,
      coach: member.coach === "بدون مربی" ? "" : member.coach,
      joinDate: member.joinDate,
      dueDate: member.dueDate,
      status: member.status,
      email: member.email || "",
      avatar: member.avatar || "",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    const parts = editFormData.name.trim().split(/\s+/);
    const first_name = parts[0] || "";
    const last_name = parts.slice(1).join(" ") || "عضو";

    const chosenCoach = editFormData.coach.trim();
    const selectedCoachObj = coachOptions.find((c) => c.name === chosenCoach);
    const coachIdToSend = selectedCoachObj?.id && isUuid(selectedCoachObj.id) ? selectedCoachObj.id : null;

    try {
      if (isUuid(editingMember.id)) {
        const payload: any = {
          first_name,
          last_name,
        };
        if (chosenCoach === "" || chosenCoach === "بدون مربی") {
          payload.assigned_coach = null;
          payload.assigned_coach_id = null;
        } else if (coachIdToSend) {
          payload.assigned_coach = coachIdToSend;
          payload.assigned_coach_id = coachIdToSend;
        }

        await updateMemberMutation.mutateAsync({
          id: editingMember.id,
          payload,
        });

        await queryClient.invalidateQueries({ queryKey: ["members"] });
        await queryClient.refetchQueries({ queryKey: ["members"] });
        await queryClient.invalidateQueries({ queryKey: ["owner-dashboard"] });
      }

      const updatedOverride: MemberOverride = {
        plan: editFormData.plan,
        coach: chosenCoach || "بدون مربی",
        status: editFormData.status,
        joinDate: editFormData.joinDate,
        dueDate: editFormData.dueDate,
        email: editFormData.email?.trim() || undefined,
        avatar: editFormData.avatar?.trim() || undefined,
      };

      const editNormName = normalizePersianName(editFormData.name);
      const editPhoneKeys = getPhoneLookupKeys(editingMember.phone);
      const editBatch: Record<string, MemberOverride> = {
        [editingMember.id]: updatedOverride,
        [`name_${editFormData.name.trim()}`]: updatedOverride,
        [`name_${editingMember.name}`]: updatedOverride,
        [`normname_${editNormName}`]: updatedOverride,
      };
      for (const pk of editPhoneKeys) {
        editBatch[`phone_${pk}`] = updatedOverride;
      }
      saveLocalMemberOverridesBatch(editBatch);

      setLocalOverrides((prev) => ({
        ...prev,
        ...editBatch,
      }));

      logActivity({
        type: "EDIT",
        text: `ویرایش اطلاعات عضو: ${editFormData.name.trim() || editingMember.name}`,
      });
    } catch (err) {
      console.error("Error editing member:", err);
    }
    setEditingMember(null);
  };

  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setSubmitError("نام و نام خانوادگی الزامی هستند.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    // Clean phone number (convert Persian numbers to English digits)
    const rawPhone = formData.phone_number
      ? formData.phone_number
        .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString())
        .replace(/[^\d]/g, "")
      : "";

    const start_date = formData.start_date || getTodayIso();

    // Prepare membership_plan_id (only valid UUID)
    let planIdToSend: string | undefined = undefined;
    if (isUuid(formData.membership_plan_id)) {
      planIdToSend = formData.membership_plan_id;
    }

    // Prepare assigned_coach_id (only valid UUID)
    let coachIdToSend: string | undefined = undefined;
    if (isUuid(formData.assigned_coach_id)) {
      coachIdToSend = formData.assigned_coach_id;
    }

    // Prepare payload matching MemberCreate in FitLegend_Gym_OS_API.yaml
    const payload = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      start_date,
      phone_number: rawPhone || undefined,
      email: formData.email.trim() || undefined,
      gender: formData.gender || undefined,
      level: formData.level || undefined,
      goal: formData.goal.trim() || undefined,
      training_days: formData.training_days.length > 0 ? formData.training_days : undefined,
      date_of_birth: formData.date_of_birth || undefined,
      address: formData.address.trim() || undefined,
      coach_notes: formData.coach_notes.trim() || undefined,
      create_login_account: formData.create_login_account,
      membership_plan_id: planIdToSend || null,
      assigned_coach_id: coachIdToSend || null,
    };

    try {
      const memberFullName = `${formData.first_name.trim()} ${formData.last_name.trim()}`;
      const normName = normalizePersianName(memberFullName);
      const phoneKeys = getPhoneLookupKeys(rawPhone);
      const avatarData = formData.avatar?.trim() || undefined;

      const selectedPlanObj = planOptions.find((p) => p.id === formData.membership_plan_id);
      const planName = selectedPlanObj ? selectedPlanObj.name : "ماهانه";
      const chosenCoachObj = coachOptions.find((c) => c.id === formData.assigned_coach_id);
      const coachName = chosenCoachObj ? chosenCoachObj.name : "بدون مربی";

      const newOverride: MemberOverride = {
        plan: planName,
        coach: coachName,
        email: formData.email.trim() || undefined,
        phone: rawPhone || undefined,
        avatar: avatarData,
        status: "active",
      };

      const batchToSave: Record<string, MemberOverride> = {
        [`name_${memberFullName}`]: newOverride,
        [`normname_${normName}`]: newOverride,
      };
      for (const pk of phoneKeys) {
        batchToSave[`phone_${pk}`] = newOverride;
      }

      // 1. Immediately persist and update local state
      saveLocalMemberOverridesBatch(batchToSave);
      setLocalOverrides((prev) => ({
        ...prev,
        ...batchToSave,
      }));

      // 2. Submit to Django API
      const created = await createMemberMutation.mutateAsync(payload);
      const createdId = (created as any)?.id || (created as any)?.data?.id || (created as any)?.member?.id;
      const effectiveId = createdId ? String(createdId) : "";

      if (effectiveId) {
        saveLocalMemberOverride(effectiveId, newOverride);
        setLocalOverrides((prev) => ({ ...prev, [effectiveId]: newOverride }));
      }

      // 3. Invalidate and refetch immediately so real Django UUID and member data are loaded
      await queryClient.invalidateQueries({ queryKey: ["members"] });
      await queryClient.refetchQueries({ queryKey: ["members"] });
      await queryClient.invalidateQueries({ queryKey: ["owner-dashboard"] });

      // 4. Resolve the newly created member from the fresh cache query data and bind the ID override
      try {
        const freshData: any = queryClient.getQueryData(["members"]);
        const freshList: any[] = Array.isArray(freshData)
          ? freshData
          : Array.isArray(freshData?.results)
            ? freshData.results
            : Array.isArray(freshData?.members)
              ? freshData.members
              : [];

        const foundMember = freshList.find((m: any) => {
          if (effectiveId && String(m.id) === effectiveId) return true;
          const mName = m.full_name || `${m.first_name || ""} ${m.last_name || ""}`.trim() || m.name || "";
          if (normalizePersianName(mName) === normName) return true;
          const mPhoneKeys = getPhoneLookupKeys(m.phone_number || m.phone);
          if (phoneKeys.some((k) => mPhoneKeys.includes(k))) return true;
          return false;
        });

        if (foundMember && foundMember.id) {
          saveLocalMemberOverride(String(foundMember.id), newOverride);
          setLocalOverrides((prev) => ({
            ...prev,
            [String(foundMember.id)]: newOverride,
          }));
        }
      } catch (e) {
        console.error("Failed to associate fresh member id:", e);
      }

      logActivity({
        type: "MEMBER",
        text: `ثبت‌نام عضو جدید: ${memberFullName} (${planName})`,
      });

      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        phone_number: "",
        email: "",
        avatar: "",
        start_date: getTodayIso(),
        membership_plan_id: "",
        assigned_coach_id: "",
        gender: "MALE",
        level: "BEGINNER",
        goal: "",
        training_days: [],
        date_of_birth: "",
        address: "",
        coach_notes: "",
        create_login_account: false,
      });

      if (onCloseAddModal) onCloseAddModal();
    } catch (err: any) {
      console.error("Failed to create member in Django:", err);
      let msg = "خطا در ثبت عضو در سامانه. لطفاً اطلاعات را بررسی کنید.";
      if (err?.detail && typeof err.detail === "string") {
        msg = err.detail;
      } else if (err?.message && typeof err.message === "string") {
        msg = err.message;
      } else if (typeof err === "object") {
        const parts: string[] = [];
        for (const [k, v] of Object.entries(err)) {
          if (Array.isArray(v)) parts.push(`${k}: ${v.join(", ")}`);
          else if (typeof v === "string") parts.push(`${k}: ${v}`);
        }
        if (parts.length > 0) msg = parts.join(" | ");
      }
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Filter Bar */}
      <div className="mb-[18px] flex flex-wrap items-center gap-[12px]">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-[4px] rounded-[10px] bg-bg p-[4px]" id="statusTabs">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "cursor-pointer rounded-[8px] px-[14px] py-[8px] text-[13px] font-bold transition-all duration-180",
              filter === "all"
                ? "bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                : "text-ink-faint hover:text-ink"
            )}
          >
            همه
          </button>
          <button
            type="button"
            onClick={() => setFilter("active")}
            className={cn(
              "cursor-pointer rounded-[8px] px-[14px] py-[8px] text-[13px] font-bold transition-all duration-180",
              filter === "active"
                ? "bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                : "text-ink-faint hover:text-ink"
            )}
          >
            فعال
          </button>
          <button
            type="button"
            onClick={() => setFilter("expiring")}
            className={cn(
              "cursor-pointer rounded-[8px] px-[14px] py-[8px] text-[13px] font-bold transition-all duration-180",
              filter === "expiring"
                ? "bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                : "text-ink-faint hover:text-ink"
            )}
          >
            رو به اتمام
          </button>
          <button
            type="button"
            onClick={() => setFilter("expired")}
            className={cn(
              "cursor-pointer rounded-[8px] px-[14px] py-[8px] text-[13px] font-bold transition-all duration-180",
              filter === "expired"
                ? "bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                : "text-ink-faint hover:text-ink"
            )}
          >
            منقضی
          </button>
        </div>

        {/* Search Field */}
        <div className="flex min-w-[240px] flex-1 max-w-[360px] items-center gap-[10px] rounded-[12px] border border-border bg-surface px-[14px] py-[9px] transition-colors focus-within:border-primary">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[17px] w-[17px] shrink-0 text-ink-faint"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            id="memSearch"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی نام عضو…"
            className="w-full border-none bg-transparent text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
          />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-[16px] border border-border bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        {/* Card Head */}
        <div className="flex items-center justify-between border-b border-border px-[22px] py-[20px]">
          <div>
            <h3 className="text-[16px] font-extrabold text-ink">فهرست اعضا</h3>
            <div className="mt-[3px] text-[12.5px] text-ink-faint" id="rowInfo">
              نمایش {toPersianDigits(filteredMembers.length)} عضو از {toPersianDigits(members.length)}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="font-bold">
              <tr>
                <th className="border-b border-border px-[22px] pt-[14px] pb-[14px] text-right text-[13.5px] font-bold whitespace-nowrap text-ink-faint">
                  عضو
                </th>
                <th className="border-b border-border px-[22px] pt-[14px] pb-[14px] text-right text-[13.5px] font-bold whitespace-nowrap text-ink-faint">
                  پلن
                </th>
                <th className="border-b border-border px-[22px] pt-[14px] pb-[14px] text-right text-[13.5px] font-bold whitespace-nowrap text-ink-faint">
                  مربی
                </th>
                <th className="border-b border-border px-[22px] pt-[14px] pb-[14px] text-right text-[13.5px] font-bold whitespace-nowrap text-ink-faint">
                  وضعیت
                </th>
                <th className="border-b border-border px-[22px] pt-[14px] pb-[14px] text-right text-[13.5px] font-bold whitespace-nowrap text-ink-faint">
                  تاریخ عضویت
                </th>
                <th className="border-b border-border px-[22px] pt-[14px] pb-[14px] text-right text-[13.5px] font-bold whitespace-nowrap text-ink-faint">
                  سررسید
                </th>
                <th className="border-b border-border px-[22px] pt-[14px] pb-[14px] text-right text-[13.5px] font-bold whitespace-nowrap text-ink-faint" />
              </tr>
            </thead>
            <tbody id="memBody">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((item, index) => {
                  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
                  const statusConf = STATUS_CONFIG[item.status];
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-border transition-colors duration-150 last:border-b-0 hover:bg-bg"
                    >
                      <td className="px-[22px] py-[15px] text-[13.5px] whitespace-nowrap text-ink-soft">
                        <div className="flex items-center gap-[11px]">
                          {item.avatar ? (
                            <img
                              src={item.avatar}
                              alt={item.name}
                              className="h-[36px] w-[36px] shrink-0 rounded-[10px] object-cover shadow-xs border border-border"
                            />
                          ) : (
                            <span
                              className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[10px] text-[13px] font-bold text-white shadow-xs"
                              style={{ backgroundColor: avatarColor }}
                            >
                              {getInitials(item.name)}
                            </span>
                          )}
                          <div>
                            <div className="text-[13.5px] font-bold text-ink">
                              {item.name}
                            </div>
                            <div className="text-[12px] text-ink-faint">
                              #{toPersianDigits(item.code)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-[22px] py-[15px] text-[13.5px] whitespace-nowrap text-ink-soft">
                        {item.plan}
                      </td>
                      <td className="px-[22px] py-[15px] text-[13.5px] whitespace-nowrap text-ink-soft">
                        {item.coach}
                      </td>
                      <td className="px-[22px] py-[15px] text-[13.5px] whitespace-nowrap text-ink-soft">
                        <span
                          className={cn(
                            "inline-flex items-center gap-[6px] rounded-[100px] px-[11px] py-[5px] text-[12px] font-bold",
                            statusConf.bgClass,
                            statusConf.textClass
                          )}
                        >
                          <span
                            className={cn("h-[6px] w-[6px] rounded-full", statusConf.dotClass)}
                          />
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="px-[22px] py-[15px] text-[13.5px] whitespace-nowrap text-ink-soft">
                        {item.joinDate}
                      </td>
                      <td className="px-[22px] py-[15px] text-[13.5px] whitespace-nowrap text-ink-soft">
                        {item.dueDate}
                      </td>
                      <td className="px-[22px] py-[15px] text-[13.5px] whitespace-nowrap text-ink-soft">
                        <div className="flex items-center gap-[4px]">
                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="inline-flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[8px] text-ink-faint transition-all duration-150 hover:bg-tint hover:text-primary-dark"
                            aria-label="ویرایش"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-[16px] w-[16px]"
                            >
                              <path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            </svg>
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            disabled={deletingMemberId === item.id}
                            onClick={() => handleDelete(item.id)}
                            className="inline-flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[8px] text-ink-faint transition-all duration-150 hover:bg-[#FFF1F2] hover:text-[#E11D48] disabled:opacity-50"
                            aria-label="حذف"
                            title="حذف و غیرفعال‌سازی عضو"
                          >
                            {deletingMemberId === item.id ? (
                              <Loader2 className="h-[15px] w-[15px] animate-spin text-[#E11D48]" />
                            ) : (
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-[16px] w-[16px]"
                              >
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : isQueryLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-[44px] text-center text-[14px] text-ink-faint"
                  >
                    <div className="flex items-center justify-center gap-2 font-semibold">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span>در حال دریافت اطلاعات اعضا...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="p-[44px] text-center text-[14px] text-ink-faint"
                  >
                    <div className="text-[15px] font-bold text-ink">
                      هنوز عضوی در سیستم ثبت نشده است
                    </div>
                    <div className="mt-1 text-[12.5px] text-ink-faint">
                      اعضای جدید را از طریق دکمه «افزودن عضو» ثبت کنید تا مستقیماً در سامانه ذخیره شوند.
                    </div>
                    {onOpenAddModal && (
                      <button
                        type="button"
                        onClick={onOpenAddModal}
                        className="mt-3.5 inline-flex items-center gap-1.5 rounded-[10px] bg-tint px-4 py-2 text-[13px] font-bold text-primary-dark transition-all hover:bg-primary/20 cursor-pointer"
                      >
                        + افزودن اولین عضو
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pager Pagination - Only shown if multiple pages exist */}
        {filteredMembers.length > 10 && (
          <div className="flex items-center justify-center gap-[6px] p-[18px]">
            <button
              type="button"
              disabled
              className="min-w-[36px] h-[36px] cursor-default rounded-[10px] border border-border bg-surface px-[10px] text-[13.5px] font-bold text-ink-soft opacity-45 transition-all duration-150"
            >
              قبلی
            </button>
            {Array.from({ length: Math.ceil(filteredMembers.length / 10) }).map((_, idx) => {
              const pNum = String(idx + 1);
              return (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => setCurrentPage(pNum)}
                  className={cn(
                    "min-w-[36px] h-[36px] cursor-pointer rounded-[10px] border px-[10px] text-[13.5px] font-bold transition-all duration-150",
                    currentPage === pNum
                      ? "border-ink btn-ink-gradient text-white"
                      : "border-border bg-surface text-ink-soft hover:border-primary hover:bg-tint hover:text-primary-dark"
                  )}
                >
                  {toPersianDigits(pNum)}
                </button>
              );
            })}
            <button
              type="button"
              disabled={currentPage === String(Math.ceil(filteredMembers.length / 10))}
              onClick={() => setCurrentPage((prev) => String(Number(prev) + 1))}
              className="min-w-[36px] h-[36px] cursor-pointer rounded-[10px] border border-border bg-surface px-[10px] text-[13.5px] font-bold text-ink-soft transition-all duration-150 hover:border-primary hover:bg-tint hover:text-primary-dark disabled:opacity-45 disabled:pointer-events-none"
            >
              بعدی
            </button>
          </div>
        )}
      </div>

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[4px]">
          <div className="w-full max-w-[480px] rounded-[16px] border border-border bg-surface p-[24px] shadow-[0_20px_60px_rgba(15,23,42,0.15)]">
            <div className="mb-[20px] flex items-center justify-between border-b border-border pb-[14px]">
              <h3 className="text-[17px] font-extrabold text-ink">
                ویرایش عضو — {editingMember.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="text-ink-faint hover:text-ink"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="flex flex-col gap-[14px]">
              {/* Profile Picture in Edit Modal */}
              <div className="flex items-center gap-[14px] rounded-[14px] border border-dashed border-border bg-bg/50 p-[12px]">
                <div className="relative shrink-0">
                  <div className="flex h-[56px] w-[56px] items-center justify-center overflow-hidden rounded-[14px] border-2 border-border bg-surface shadow-2xs">
                    {editFormData.avatar ? (
                      <img
                        src={editFormData.avatar}
                        alt={editFormData.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-[24px] w-[24px] text-ink-faint" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-bold text-ink">تصویر پروفایل</div>
                  <div className="mt-[4px] flex items-center gap-[8px]">
                    <label className="inline-flex cursor-pointer items-center gap-[5px] rounded-[8px] bg-surface border border-border px-[10px] py-[4px] text-[11.5px] font-bold text-ink shadow-2xs hover:border-primary hover:bg-tint hover:text-primary-dark transition-all">
                      <Camera className="h-[13px] w-[13px]" />
                      <span>{editFormData.avatar ? "تغییر تصویر" : "افزودن تصویر"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const dataUrl = await compressImage(file);
                            setEditFormData((prev) => ({ ...prev, avatar: dataUrl }));
                          } catch { }
                        }}
                      />
                    </label>
                    {editFormData.avatar && (
                      <button
                        type="button"
                        onClick={() => setEditFormData((prev) => ({ ...prev, avatar: "" }))}
                        className="text-[11px] font-bold text-[#E11D48] hover:underline cursor-pointer"
                      >
                        حذف
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-[6px] block text-[13px] font-bold text-ink">
                  نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[10px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary focus:bg-tint"
                />
              </div>

              <div className="grid grid-cols-1 gap-[12px] min-[500px]:grid-cols-2">
                <div>
                  <label className="mb-[6px] block text-[13px] font-bold text-ink">
                    پلن عضویت
                  </label>
                  <select
                    value={editFormData.plan}
                    onChange={(e) => setEditFormData({ ...editFormData, plan: e.target.value })}
                    className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[10px] text-[13px] text-ink outline-none transition-all duration-200 focus:border-primary"
                  >
                    {planOptions.map((p) => (
                      <option key={p.id || p.name} value={p.name}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-[6px] block text-[13px] font-bold text-ink">
                    مربی اختصاصی
                  </label>
                  <select
                    value={editFormData.coach}
                    onChange={(e) => setEditFormData({ ...editFormData, coach: e.target.value })}
                    className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[10px] text-[13px] text-ink outline-none transition-all duration-200 focus:border-primary"
                  >
                    <option value="">بدون مربی</option>
                    {coachOptions.map((c) => (
                      <option key={c.id || c.name} value={c.name}>
                        {c.label}
                      </option>
                    ))}
                    {editFormData.coach &&
                      editFormData.coach !== "بدون مربی" &&
                      !coachOptions.some((c) => c.name === editFormData.coach) && (
                        <option value={editFormData.coach}>{editFormData.coach}</option>
                      )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-[12px] min-[500px]:grid-cols-2">
                <div>
                  <label className="mb-[6px] block text-[13px] font-bold text-ink">
                    تاریخ عضویت
                  </label>
                  <input
                    type="text"
                    placeholder="مثلا: ۱۵ اردیبهشت"
                    value={editFormData.joinDate}
                    onChange={(e) => setEditFormData({ ...editFormData, joinDate: e.target.value })}
                    className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[10px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary focus:bg-tint"
                  />
                </div>
                <div>
                  <label className="mb-[6px] block text-[13px] font-bold text-ink">
                    تاریخ سررسید
                  </label>
                  <input
                    type="text"
                    placeholder="مثلا: ۱۵ مرداد"
                    value={editFormData.dueDate}
                    onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                    className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[10px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary focus:bg-tint"
                  />
                </div>
              </div>

              <div>
                <label className="mb-[6px] block text-[13px] font-bold text-ink">
                  ایمیل (اختیاری)
                </label>
                <input
                  type="email"
                  placeholder="مثلا: user@example.com"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[10px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary focus:bg-tint"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="mb-[6px] block text-[13px] font-bold text-ink">
                  وضعیت
                </label>
                <div className="flex gap-[10px]">
                  {(["active", "expiring", "expired"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, status: st })}
                      className={cn(
                        "flex-1 rounded-[10px] border py-[8px] text-[12.5px] font-bold transition-all cursor-pointer",
                        editFormData.status === st
                          ? cn(STATUS_CONFIG[st].bgClass, STATUS_CONFIG[st].textClass, "border-current shadow-xs")
                          : "border-border bg-surface text-ink-soft hover:bg-bg"
                      )}
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        <span className={cn("h-2 w-2 rounded-full", STATUS_CONFIG[st].dotClass)} />
                        {STATUS_CONFIG[st].label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-[10px] flex justify-end gap-[10px]">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="rounded-[10px] border border-border px-[16px] py-[9px] text-[13.5px] font-semibold text-ink hover:bg-bg cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="rounded-[10px] btn-ink-gradient px-[20px] py-[9px] text-[13.5px] font-semibold text-white transition-all cursor-pointer"
                >
                  ذخیره تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-[580px] my-auto max-h-[92vh] overflow-y-auto rounded-[20px] border border-border bg-surface p-[24px] shadow-[0_25px_70px_rgba(15,23,42,0.22)] animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-[18px] flex items-center justify-between border-b border-border pb-[14px]">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-tint text-primary-dark font-extrabold text-[15px]">
                    +
                  </div>
                  <h3 className="text-[17px] font-extrabold text-ink">
                    افزودن عضو جدید به باشگاه
                  </h3>
                </div>
                <p className="mt-1 text-[12px] text-ink-faint">
                  ثبت مشخصات و اختصاص پلن عضویت در سامانه فیتلجند جیم
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseAddModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-bg hover:text-ink cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            {submitError && (
              <div className="mb-4 rounded-[12px] border border-[#F43F5E]/30 bg-[#FFF1F2] p-3.5 text-[12.5px] font-medium text-[#9F1239]">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-5 w-5 shrink-0 text-[#E11D48] mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">{submitError}</p>
                    {(submitError.includes("token") || submitError.includes("توکن") || submitError.includes("ورود")) && (
                      <div className="mt-2.5 flex items-center gap-3">
                        <Link
                          href="/login"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#E11D48] px-3 py-1.5 text-[12px] font-bold text-white transition hover:bg-[#BE123C]"
                        >
                          <span>ورود مجدد به سامانه</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <span className="text-[11.5px] text-[#9F1239]/80">
                          (نشست کاربری شما منقضی شده است)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveNew} className="flex flex-col gap-[14px]">
              {/* Profile Picture Upload Section */}
              <div className="flex items-center gap-[16px] rounded-[14px] border border-dashed border-border bg-bg/50 p-[14px] transition-colors hover:border-primary/50">
                <div className="relative group shrink-0">
                  <div className="relative flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-[18px] border-2 border-border bg-surface shadow-xs">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="تصویر پروفایل عضو"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-ink-faint">
                        <User className="h-[28px] w-[28px]" />
                      </div>
                    )}
                  </div>
                  {formData.avatar && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, avatar: "" }))}
                      className="absolute -top-[6px] -left-[6px] flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#E11D48] text-white shadow-xs transition-transform hover:scale-110 cursor-pointer"
                      title="حذف تصویر"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-ink">
                    تصویر پروفایل عضو
                  </div>
                  <div className="mt-[2px] text-[11.5px] text-ink-faint">
                    فرمت‌های JPG، PNG یا WEBP (اختیاری)
                  </div>
                  <div className="mt-[8px] flex items-center gap-[8px]">
                    <label className="inline-flex cursor-pointer items-center gap-[6px] rounded-[9px] bg-surface border border-border px-[11px] py-[5px] text-[12px] font-bold text-ink shadow-2xs transition-all hover:border-primary hover:bg-tint hover:text-primary-dark">
                      <Camera className="h-[14px] w-[14px]" />
                      <span>{formData.avatar ? "تغییر تصویر" : "بارگذاری تصویر"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const dataUrl = await compressImage(file);
                            setFormData((prev) => ({ ...prev, avatar: dataUrl }));
                          } catch (err) {
                            console.error("Failed to load image:", err);
                          }
                        }}
                      />
                    </label>
                    {formData.avatar && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, avatar: "" }))}
                        className="text-[11.5px] font-bold text-[#E11D48] hover:underline cursor-pointer"
                      >
                        حذف
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2">
                <div>
                  <label className="mb-[6px] block text-[13px] font-bold text-ink">
                    نام <span className="text-[#F43F5E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً: علی"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[9.5px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary focus:bg-tint"
                  />
                </div>
                <div>
                  <label className="mb-[6px] block text-[13px] font-bold text-ink">
                    نام خانوادگی <span className="text-[#F43F5E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً: محمدی"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[9.5px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary focus:bg-tint"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2">
                <div>
                  <label className="mb-[6px] block text-[13px] font-bold text-ink">
                    شماره موبایل
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    placeholder="09123456789"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[9.5px] text-[13.5px] text-ink text-left outline-none transition-all duration-200 focus:border-primary focus:bg-tint font-mono"
                  />
                </div>
                <div>
                  <label className="mb-[6px] block text-[13px] font-bold text-ink">
                    پست الکترونیک (ایمیل)
                  </label>
                  <input
                    type="email"
                    dir="ltr"
                    placeholder="member@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[9.5px] text-[13.5px] text-ink text-left outline-none transition-all duration-200 focus:border-primary focus:bg-tint"
                  />
                </div>
              </div>

              {/* Gender & Start Date */}
              <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2">
                <div>
                  <label className="mb-[6px] block text-[13px] font-bold text-ink">
                    جنسیت
                  </label>
                  <div className="flex gap-[8px]">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: "MALE" })}
                      className={cn(
                        "flex-1 rounded-[10px] border py-[9px] text-[12.5px] font-bold transition-all cursor-pointer",
                        formData.gender === "MALE"
                          ? "border-primary bg-tint text-primary-dark shadow-xs"
                          : "border-border bg-surface text-ink-soft hover:bg-bg"
                      )}
                    >
                      آقا
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: "FEMALE" })}
                      className={cn(
                        "flex-1 rounded-[10px] border py-[9px] text-[12.5px] font-bold transition-all cursor-pointer",
                        formData.gender === "FEMALE"
                          ? "border-primary bg-tint text-primary-dark shadow-xs"
                          : "border-border bg-surface text-ink-soft hover:bg-bg"
                      )}
                    >
                      خانم
                    </button>
                  </div>
                </div>

                <div>
                  <div className="mb-[6px] flex items-center justify-between">
                    <label className="text-[13px] font-bold text-ink">
                      تاریخ شروع عضویت <span className="text-[#F43F5E]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, start_date: getTodayIso() })}
                      className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      امروز
                    </button>
                  </div>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[8.5px] text-[13px] text-ink outline-none transition-all duration-200 focus:border-primary"
                  />
                  <div className="mt-1 text-[11px] font-semibold text-primary-dark">
                    تاریخ: {formatPersianDateFull(formData.start_date)}
                  </div>
                </div>
              </div>

              {/* Plan & Coach Selection */}
              <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2">
                <div>
                  <label className="mb-[6px] block text-[13px] font-bold text-ink">
                    پلن عضویت
                  </label>
                  <select
                    value={formData.membership_plan_id}
                    onChange={(e) => setFormData({ ...formData, membership_plan_id: e.target.value })}
                    className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[12px] py-[9.5px] text-[13px] text-ink outline-none transition-all duration-200 focus:border-primary"
                  >
                    <option value="">بدون پلن (یا بعداً ثبت شود)</option>
                    {planOptions.filter((p) => p.id).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-[6px] block text-[13px] font-bold text-ink">
                    مربی اختصاصی
                  </label>
                  <select
                    value={formData.assigned_coach_id}
                    onChange={(e) => setFormData({ ...formData, assigned_coach_id: e.target.value })}
                    className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[12px] py-[9.5px] text-[13px] text-ink outline-none transition-all duration-200 focus:border-primary"
                  >
                    <option value="">بدون مربی</option>
                    {coachOptions.filter((c) => c.id).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fitness Level */}
              <div>
                <label className="mb-[6px] block text-[13px] font-bold text-ink">
                  سطح آمادگی ورزشی
                </label>
                <div className="flex gap-[8px]">
                  {LEVEL_OPTIONS.map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, level: lvl.id })}
                      className={cn(
                        "flex-1 rounded-[10px] border py-[8px] text-[12.5px] font-bold transition-all cursor-pointer",
                        formData.level === lvl.id
                          ? "border-primary bg-tint text-primary-dark shadow-xs"
                          : "border-border bg-surface text-ink-soft hover:bg-bg"
                      )}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Workout Goal */}
              <div>
                <label className="mb-[6px] block text-[13px] font-bold text-ink">
                  هدف ورزشی
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: کاهش وزن، افزایش حجم عضلانی، بهبود استقامت قلبی..."
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[9.5px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary focus:bg-tint"
                />
              </div>

              {/* Training Days */}
              <div>
                <div className="mb-[6px] flex items-center justify-between">
                  <label className="text-[13px] font-bold text-ink">
                    روزهای تمرین در هفته
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          training_days: ["شنبه", "دوشنبه", "چهارشنبه"],
                        }))
                      }
                      className="hover:underline cursor-pointer"
                    >
                      زوج
                    </button>
                    <span className="text-ink-faint">|</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          training_days: ["یکشنبه", "سه‌شنبه", "پنج‌شنبه"],
                        }))
                      }
                      className="hover:underline cursor-pointer"
                    >
                      فرد
                    </button>
                    <span className="text-ink-faint">|</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          training_days:
                            prev.training_days.length === WEEK_DAYS.length
                              ? []
                              : WEEK_DAYS.map((d) => d.key),
                        }))
                      }
                      className="hover:underline cursor-pointer"
                    >
                      {formData.training_days.length === WEEK_DAYS.length ? "پاک کردن" : "همه"}
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-[6px]">
                  {WEEK_DAYS.map((d) => {
                    const isSelected = formData.training_days.includes(d.key);
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            training_days: isSelected
                              ? prev.training_days.filter((x) => x !== d.key)
                              : [...prev.training_days, d.key],
                          }))
                        }
                        className={cn(
                          "rounded-[8px] border px-[12px] py-[6px] text-[12px] font-bold transition-all cursor-pointer",
                          isSelected
                            ? "border-primary bg-tint text-primary-dark font-extrabold shadow-xs"
                            : "border-border bg-surface text-ink-soft hover:bg-bg"
                        )}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Extra Optional Details (Accordion) */}
              <div className="rounded-[12px] border border-border bg-bg/40 p-[12px]">
                <button
                  type="button"
                  onClick={() => setShowExtraDetails(!showExtraDetails)}
                  className="flex w-full items-center justify-between text-[13px] font-bold text-ink hover:text-primary cursor-pointer transition"
                >
                  <span className="flex items-center gap-1.5">
                    <span>اطلاعات تکمیلی و حساب کاربری</span>
                    <span className="text-[11px] font-normal text-ink-faint">(اختیاری)</span>
                  </span>
                  {showExtraDetails ? (
                    <ChevronUp className="h-4 w-4 text-ink-faint" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-ink-faint" />
                  )}
                </button>

                {showExtraDetails && (
                  <div className="mt-3 flex flex-col gap-[12px] border-t border-border pt-3 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2">
                      <div>
                        <label className="mb-[5px] block text-[12px] font-semibold text-ink-soft">
                          تاریخ تولد
                        </label>
                        <input
                          type="date"
                          value={formData.date_of_birth}
                          onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                          className="w-full rounded-[10px] border border-border bg-surface px-[12px] py-[8px] text-[12.5px] text-ink outline-none transition focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="mb-[5px] block text-[12px] font-semibold text-ink-soft">
                          آدرس محل سکونت
                        </label>
                        <input
                          type="text"
                          placeholder="مثلاً: تهران، خیابان..."
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full rounded-[10px] border border-border bg-surface px-[12px] py-[8px] text-[12.5px] text-ink outline-none transition focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-[5px] block text-[12px] font-semibold text-ink-soft">
                        یادداشت و نکات مربی
                      </label>
                      <textarea
                        rows={2}
                        placeholder="نکات آسیب‌دیدگی، تجویزهای تمرینی، ملاحظات سلامت..."
                        value={formData.coach_notes}
                        onChange={(e) => setFormData({ ...formData, coach_notes: e.target.value })}
                        className="w-full resize-none rounded-[10px] border border-border bg-surface px-[12px] py-[8px] text-[12.5px] text-ink outline-none transition focus:border-primary"
                      />
                    </div>

                    <div className="flex items-center gap-2.5 rounded-[10px] bg-surface p-2.5 border border-border/80">
                      <input
                        type="checkbox"
                        id="create_login_account"
                        checked={formData.create_login_account}
                        onChange={(e) =>
                          setFormData({ ...formData, create_login_account: e.target.checked })
                        }
                        className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                      />
                      <label
                        htmlFor="create_login_account"
                        className="text-[12.5px] font-medium text-ink cursor-pointer select-none"
                      >
                        ایجاد حساب کاربری جهت ورود عضو به اپلیکیشن (با شماره موبایل / ایمیل)
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="mt-[6px] flex items-center justify-end gap-[10px] border-t border-border pt-[14px]">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onCloseAddModal}
                  className="rounded-[10px] border border-border px-[16px] py-[9px] text-[13.5px] font-semibold text-ink hover:bg-bg cursor-pointer disabled:opacity-50 transition"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] btn-ink-gradient px-[22px] py-[9px] text-[13.5px] font-bold text-white transition-all hover:shadow-emerald cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span>در حال ثبت اطلاعات...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 text-primary" />
                      <span>افزودن و ثبت عضو</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
