"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toPersianDigits, normalizeDigits } from "@/lib/persian-digits";
import { cn } from "@/lib/utils";
import {
  useCoaches,
  useAddCoach,
  useUpdateCoach,
  useDeleteCoach,
} from "@/lib/hooks/queries/use-coaches";
import { useMembers } from "@/lib/hooks/queries/use-members";
import {
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Check,
  Award,
  Briefcase,
  Calendar,
  Phone,
  Mail,
  User as UserIcon,
  Clock,
  Camera,
} from "lucide-react";
import { logActivity } from "@/lib/activities-store";
import { normalizePersianName, getPhoneLookupKeys } from "@/lib/members-store";
import {
  addDeletedCoachId,
  getDeletedCoachIds,
  COACHES_UPDATED_EVENT,
  getLocalTeamMembers,
  removeLocalTeamMember,
  type LocalTeamMember,
} from "@/lib/coaches-store";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  type: "coach" | "staff";
  students: string;
  rating: string;
  status: "active" | "inactive";
  avatar?: string;
  phone?: string;
  email?: string;
}

const PRESET_SPECIALTIES = [
  "بدنسازی",
  "فیتنس",
  "کراس‌فیت",
  "پیلاتس",
  "تی‌آر‌ایکس (TRX)",
  "یوگا",
  "پاورلیفتینگ",
  "آمادگی جسمانی",
  "ایروبیک",
  "بوکس",
];

const WORKING_DAYS_OPTIONS = [
  { key: "sat", label: "شنبه" },
  { key: "sun", label: "۱‌شنبه" },
  { key: "mon", label: "۲‌شنبه" },
  { key: "tue", label: "۳‌شنبه" },
  { key: "wed", label: "۴‌شنبه" },
  { key: "thu", label: "۵‌شنبه" },
  { key: "fri", label: "جمعه" },
];

const AVATAR_COLORS = [
  "#16E0A0",
  "#22D3EE",
  "#6366F1",
  "#F59E0B",
  "#EC4899",
  "#0EA5E9",
];

interface CoachesTableProps {
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
  onOpenAddModal?: () => void;
  onOpenAddEmployeeModal?: () => void;
}

export function CoachesTable({
  isAddModalOpen,
  onCloseAddModal,
  onOpenAddModal,
  onOpenAddEmployeeModal,
}: CoachesTableProps) {
  const [filter, setFilter] = useState<"all" | "coach" | "staff">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const queryClient = useQueryClient();
  const { data: coachesData, isLoading: isQueryLoading } = useCoaches();
  const { data: membersResponse } = useMembers();
  const addCoachMutation = useAddCoach();
  const updateCoachMutation = useUpdateCoach();
  const deleteCoachMutation = useDeleteCoach();

  // Local coach overrides for immediate UI reflection and persistence
  const [localCoachOverrides, setLocalCoachOverrides] = useState<Record<string, any>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("fitlegend_gym_coaches_overrides");
        if (saved) return JSON.parse(saved);
      } catch { }
    }
    return {};
  });

  // Local member overrides to synchronize assigned coaches accurately
  const [localMemberOverrides, setLocalMemberOverrides] = useState<Record<string, any>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("fitlegend_gym_members_overrides");
        if (saved) return JSON.parse(saved);
      } catch { }
    }
    return {};
  });

  // Track deleted coach IDs locally to immediately remove from UI and keep in sync
  const [deletedCoachIds, setDeletedCoachIds] = useState<string[]>(() => getDeletedCoachIds());

  // Track locally registered team members (staff/coaches) to keep in sync with AddEmployeeModal
  const [localTeamMembers, setLocalTeamMembers] = useState<LocalTeamMember[]>(() => getLocalTeamMembers());

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
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

  const saveLocalCoachOverride = (id: string, override: any) => {
    if (typeof window === "undefined" || !id) return;
    try {
      const raw = localStorage.getItem("fitlegend_gym_coaches_overrides");
      const current = raw ? JSON.parse(raw) : {};
      current[id] = { ...(current[id] || {}), ...override };
      setLocalCoachOverrides(current);
      localStorage.setItem("fitlegend_gym_coaches_overrides", JSON.stringify(current));
      window.dispatchEvent(new Event("fitlegend_coaches_updated"));
    } catch { }
  };

  const saveLocalCoachOverridesBatch = (entries: Record<string, any>) => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("fitlegend_gym_coaches_overrides");
      const current = raw ? JSON.parse(raw) : {};
      for (const [key, val] of Object.entries(entries)) {
        if (key) {
          current[key] = { ...(current[key] || {}), ...val };
        }
      }
      setLocalCoachOverrides(current);
      localStorage.setItem("fitlegend_gym_coaches_overrides", JSON.stringify(current));
      window.dispatchEvent(new Event("fitlegend_coaches_updated"));
    } catch { }
  };

  useEffect(() => {
    const handleSync = () => {
      try {
        const savedCoaches = localStorage.getItem("fitlegend_gym_coaches_overrides");
        if (savedCoaches) setLocalCoachOverrides(JSON.parse(savedCoaches));
        const savedMembers = localStorage.getItem("fitlegend_gym_members_overrides");
        if (savedMembers) setLocalMemberOverrides(JSON.parse(savedMembers));
        setDeletedCoachIds(getDeletedCoachIds());
        setLocalTeamMembers(getLocalTeamMembers());
      } catch { }
    };
    window.addEventListener(COACHES_UPDATED_EVENT, handleSync);
    window.addEventListener("fitlegend_members_updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener(COACHES_UPDATED_EVENT, handleSync);
      window.removeEventListener("fitlegend_members_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Compute active members in system
  const activeMembersList = useMemo(() => {
    let list: any[] = [];
    if (Array.isArray(membersResponse)) {
      list = membersResponse;
    } else if (membersResponse && typeof membersResponse === "object") {
      const b = membersResponse as any;
      list = Array.isArray(b.results)
        ? b.results
        : Array.isArray(b.members)
          ? b.members
          : [];
    }

    let deletedIds: string[] = [];
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("gym_deleted_member_ids");
        if (raw) deletedIds = JSON.parse(raw);
      } catch { }
    }

    return list.filter((m: any) => {
      const idStr = String(m.id);
      if (deletedIds.includes(idStr)) return false;
      return m.is_active !== false;
    });
  }, [membersResponse]);

  // Compute live student count for each coach based on real active members in the system
  const liveStudentCount = useMemo(() => {
    return (coachName: string, coachId: string) => {
      const cleanCoachName = coachName.trim();
      let count = 0;

      for (const m of activeMembersList) {
        const memberId = String(m.id);
        const override = localMemberOverrides[memberId];

        // 1. Check local override first
        if (override && override.coach !== undefined) {
          const overrideCoach = (override.coach || "").trim();
          if (overrideCoach && overrideCoach !== "بدون مربی") {
            if (
              overrideCoach === cleanCoachName ||
              overrideCoach === coachId ||
              cleanCoachName.includes(overrideCoach) ||
              overrideCoach.includes(cleanCoachName)
            ) {
              count++;
            }
          }
          continue;
        }

        // 2. Check backend member assigned coach
        const mCoachName = (m.coach_name || m.assigned_coach_name || m.coach || "").trim();
        const mCoachId = String(m.assigned_coach_id || m.assigned_coach || "").trim();

        if (
          (mCoachName &&
            (mCoachName === cleanCoachName ||
              cleanCoachName.includes(mCoachName) ||
              mCoachName.includes(cleanCoachName))) ||
          (mCoachId && (mCoachId === coachId))
        ) {
          count++;
        }
      }

      return count;
    };
  }, [activeMembersList, localMemberOverrides]);

  const team: TeamMember[] = useMemo(() => {
    let list: any[] = [];
    if (Array.isArray(coachesData)) {
      list = coachesData;
    } else if (coachesData && typeof coachesData === "object") {
      const b = coachesData as any;
      list = Array.isArray(b.coaches)
        ? b.coaches
        : Array.isArray(b.results)
          ? b.results
          : Array.isArray(b.data?.coaches)
            ? b.data.coaches
            : Array.isArray(b.data?.results)
              ? b.data.results
              : Array.isArray(b.data)
                ? b.data
                : Array.isArray(b.team)
                  ? b.team
                  : Array.isArray(b.staff)
                    ? b.staff
                    : [];
    }

    const seenIds = new Set(list.map((c: any) => String(c.id)));
    const seenPhones = new Set(
      list.map((c: any) => normalizeDigits(c.phone || c.phone_number || "")).filter(Boolean)
    );
    const seenNames = new Set(
      list.map((c: any) => {
        const cName = (
          c.full_name ||
          (c.user && (c.user.full_name || `${c.user.first_name || ""} ${c.user.last_name || ""}`.trim())) ||
          `${c.first_name || ""} ${c.last_name || ""}`.trim() ||
          c.name ||
          ""
        ).trim();
        return normalizePersianName(cName);
      }).filter(Boolean)
    );

    // 1. Merge locally created team members (like employees added via AddEmployeeModal)
    const localList = getLocalTeamMembers();
    for (const lm of localList) {
      const idStr = String(lm.id);
      const phoneNorm = normalizeDigits(lm.phone || "");
      const nameNorm = normalizePersianName(lm.full_name || `${lm.first_name || ""} ${lm.last_name || ""}`);
      if (seenIds.has(idStr)) continue;
      if (phoneNorm && seenPhones.has(phoneNorm)) continue;
      if (nameNorm && seenNames.has(nameNorm)) continue;
      seenIds.add(idStr);
      if (phoneNorm) seenPhones.add(phoneNorm);
      if (nameNorm) seenNames.add(nameNorm);
      list.push({
        ...lm,
        id: idStr,
        name: lm.full_name || `${lm.first_name || ""} ${lm.last_name || ""}`.trim(),
      });
    }

    // 2. Synthesize any staff recorded in localCoachOverrides (guarantees newly added staff always show)
    Object.entries(localCoachOverrides).forEach(([key, val]: [string, any]) => {
      if (val?.type === "staff" && val?.name && val?.status !== "deleted" && !val?.is_deleted) {
        const nameNorm = normalizePersianName(val.name);
        const phoneNorm = normalizeDigits(val.phone || "");
        if (nameNorm && !seenNames.has(nameNorm) && (!phoneNorm || !seenPhones.has(phoneNorm))) {
          seenNames.add(nameNorm);
          if (phoneNorm) seenPhones.add(phoneNorm);
          const syntheticId = key.startsWith("name_") || key.startsWith("normname_") || key.startsWith("phone_")
            ? `staff-${nameNorm}`
            : key;
          list.push({
            id: syntheticId,
            full_name: val.name,
            name: val.name,
            role: val.role || "پذیرش / اداری",
            position: "reception",
            type: "staff",
            phone: val.phone,
            email: val.email,
            avatar: val.avatar,
            is_active: val.status !== "inactive" && val.status !== "deleted",
          });
        }
      }
    });

    return list
      .filter((c: any) => {
        const coachId = String(c.id);
        if (deletedCoachIds.includes(coachId)) return false;

        const rawPhone = c.phone || c.phone_number || "";
        const phoneKeys = getPhoneLookupKeys(rawPhone);
        const cName = (
          c.full_name ||
          (c.user &&
            (c.user.full_name ||
              `${c.user.first_name || ""} ${c.user.last_name || ""}`.trim() ||
              c.user.username)) ||
          `${c.first_name || ""} ${c.last_name || ""}`.trim() ||
          c.name ||
          ""
        ).trim();
        const normCName = normalizePersianName(cName);

        let override = localCoachOverrides[coachId] || {};
        for (const pk of phoneKeys) {
          if (localCoachOverrides[`phone_${pk}`]) {
            override = { ...localCoachOverrides[`phone_${pk}`], ...override };
            break;
          }
        }
        if (cName && localCoachOverrides[`name_${cName}`]) {
          override = { ...localCoachOverrides[`name_${cName}`], ...override };
        }
        if (normCName && localCoachOverrides[`normname_${normCName}`]) {
          override = { ...localCoachOverrides[`normname_${normCName}`], ...override };
        }
        if (localCoachOverrides[coachId]) {
          override = { ...localCoachOverrides[coachId], ...override };
        }

        if (override.is_deleted || override.status === "deleted") return false;
        // If deactivated in Django backend and not explicitly forced active in local override
        if (c.is_active === false && override.status !== "active") return false;

        return true;
      })
      .map((c: any) => {
        const coachId = String(c.id);
        const rawPhone = c.phone || c.phone_number || "";
        const phoneKeys = getPhoneLookupKeys(rawPhone);

        const cName = (
          c.full_name ||
          (c.user &&
            (c.user.full_name ||
              `${c.user.first_name || ""} ${c.user.last_name || ""}`.trim() ||
              c.user.username)) ||
          `${c.first_name || ""} ${c.last_name || ""}`.trim() ||
          c.name ||
          "مربی"
        ).trim();
        const normCName = normalizePersianName(cName);

        let override = localCoachOverrides[coachId] || {};
        for (const pk of phoneKeys) {
          if (localCoachOverrides[`phone_${pk}`]) {
            override = { ...localCoachOverrides[`phone_${pk}`], ...override };
            break;
          }
        }
        if (localCoachOverrides[`name_${cName}`]) {
          override = { ...localCoachOverrides[`name_${cName}`], ...override };
        }
        if (localCoachOverrides[`normname_${normCName}`]) {
          override = { ...localCoachOverrides[`normname_${normCName}`], ...override };
        }
        if (localCoachOverrides[coachId]) {
          override = { ...localCoachOverrides[coachId], ...override };
        }

        const fullName = (override.name || cName).trim();

        // Real live student count synchronized with members
        const realStudentCount = liveStudentCount(fullName, coachId);
        const students = String(realStudentCount);
        const rating = override.rating || (c.rating ? String(c.rating) : "۵٫۰");

        let role = override.role || c.role;
        if (!role) {
          if (c.position === "head_coach") {
            role = "سرمربی";
          } else if (c.position === "reception") {
            role = "پذیرش / اداری";
          } else if (Array.isArray(c.specialties) && c.specialties.length > 0) {
            role = `مربی ${c.specialties.join("، ")}`;
          } else if (typeof c.specialties === "string" && c.specialties) {
            role = `مربی ${c.specialties}`;
          } else {
            role = "مربی";
          }
        }

        const type: "coach" | "staff" = override.type || (c.position === "reception" || c.position === "staff" || c.type === "staff" ? "staff" : "coach");
        const status: "active" | "inactive" = override.status || (c.is_active !== false ? "active" : "inactive");
        const avatar = override.avatar || c.avatar || c.profile_picture || c.photo || c.image || undefined;

        return {
          id: coachId,
          name: fullName,
          role,
          type,
          students: type === "staff" ? "—" : toPersianDigits(students),
          rating: type === "staff" ? "—" : toPersianDigits(rating),
          status,
          avatar,
          phone: override.phone || rawPhone || undefined,
          email: override.email || c.email || undefined,
        };
      });
  }, [coachesData, localCoachOverrides, liveStudentCount, deletedCoachIds, localTeamMembers]);

  // Edit states for existing rows
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    role: string;
    type: "coach" | "staff";
    students: string;
    rating: string;
    status: "active" | "inactive";
    avatar: string;
  }>({
    name: "",
    role: "",
    type: "coach",
    students: "",
    rating: "۵٫۰",
    status: "active",
    avatar: "",
  });

  // Dedicated Add Coach Form State matching FitLegend_Gym_OS_API.yaml CoachCreate
  const [addFormData, setAddFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    avatar: "",
    gender: "male" as "male" | "female" | "",
    birth_date: "",
    address: "",
    position: "coach" as "coach" | "head_coach" | "reception",
    specialties: ["بدنسازی"] as string[],
    customSpecialty: "",
    experience_years: 1 as number | "",
    primary_certification: "",
    student_capacity: 30 as number | "",
    work_shift: "full_time" as "morning" | "evening" | "morning_evening" | "full_time" | "",
    start_date: new Date().toISOString().slice(0, 10),
    working_days: ["sat", "mon", "wed"] as string[],
    send_invite: true,
    instant_activation: true,
  });

  const [showExtraDetails, setShowExtraDetails] = useState(false);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [addSubmitError, setAddSubmitError] = useState<string | null>(null);

  const toggleSpecialty = (item: string) => {
    setAddFormData((prev) => {
      const exists = prev.specialties.includes(item);
      if (exists) {
        const next = prev.specialties.filter((s) => s !== item);
        return { ...prev, specialties: next.length > 0 ? next : prev.specialties };
      }
      return { ...prev, specialties: [...prev.specialties, item] };
    });
  };

  const handleAddCustomSpecialty = () => {
    const val = addFormData.customSpecialty.trim();
    if (!val) return;
    if (!addFormData.specialties.includes(val)) {
      setAddFormData((prev) => ({
        ...prev,
        specialties: [...prev.specialties, val],
        customSpecialty: "",
      }));
    } else {
      setAddFormData((prev) => ({ ...prev, customSpecialty: "" }));
    }
  };

  const toggleWorkingDay = (day: string) => {
    setAddFormData((prev) => {
      const exists = prev.working_days.includes(day);
      if (exists) {
        return { ...prev, working_days: prev.working_days.filter((d) => d !== day) };
      }
      return { ...prev, working_days: [...prev.working_days, day] };
    });
  };

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("");
  };

  const filteredTeam = useMemo(() => {
    const rawQ = searchQuery.trim();
    const q = normalizePersianName(rawQ);
    return team.filter((item) => {
      const matchesFilter = filter === "all" || item.type === filter;
      if (!matchesFilter) return false;
      if (!rawQ) return true;
      const nameNorm = normalizePersianName(item.name);
      const roleNorm = normalizePersianName(item.role);
      const phoneDigits = normalizeDigits(item.phone || "");
      return (
        item.name.includes(rawQ) ||
        nameNorm.includes(q) ||
        roleNorm.includes(q) ||
        phoneDigits.includes(rawQ)
      );
    });
  }, [team, filter, searchQuery]);

  const [deletingCoachId, setDeletingCoachId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const coachToDelete = team.find((m) => String(m.id) === String(id));
    const coachName = coachToDelete?.name || "عضو تیم";
    if (typeof window !== "undefined" && !window.confirm(`آیا از حذف «${coachName}» اطمینان دارید؟`)) {
      return;
    }

    setDeletingCoachId(id);

    try {
      // 1. Immediately track as deleted locally to remove from UI instantly
      addDeletedCoachId(id);
      removeLocalTeamMember(id);
      setDeletedCoachIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setLocalTeamMembers(getLocalTeamMembers());

      const deleteOverride = {
        status: "inactive" as const,
        is_active: false,
        is_deleted: true,
      };
      const batch: Record<string, any> = {
        [id]: deleteOverride,
      };
      if (coachToDelete?.name) {
        batch[`name_${coachToDelete.name}`] = deleteOverride;
        batch[`normname_${normalizePersianName(coachToDelete.name)}`] = deleteOverride;
      }
      if (coachToDelete?.phone) {
        for (const pk of getPhoneLookupKeys(coachToDelete.phone)) {
          batch[`phone_${pk}`] = deleteOverride;
        }
      }
      saveLocalCoachOverridesBatch(batch);
      window.dispatchEvent(new Event(COACHES_UPDATED_EVENT));

      // 2. Send delete / deactivation command to Django backend
      await deleteCoachMutation.mutateAsync(id);

      logActivity({
        type: "ALERT",
        text: `حذف مربی: ${coachName}`,
      });

      // 3. Invalidate and refetch queries to synchronize with Django backend
      await queryClient.invalidateQueries({ queryKey: ["coaches"] });
      await queryClient.refetchQueries({ queryKey: ["coaches"] });
      await queryClient.invalidateQueries({ queryKey: ["members"] });
      await queryClient.invalidateQueries({ queryKey: ["owner-dashboard"] });
    } catch (err: any) {
      console.error("Failed to delete coach on Django:", err);
      const msg =
        err?.detail ||
        err?.message ||
        (typeof err === "string" ? err : "خطا در حذف مربی از سامانه.");
      if (typeof window !== "undefined") {
        window.alert(`خطا در حذف مربی:\n${msg}`);
      }
    } finally {
      setDeletingCoachId(null);
    }
  };

  const handleOpenEdit = (item: TeamMember) => {
    setEditingMember(item);
    setFormData({
      name: item.name,
      role: item.role,
      type: item.type,
      students: item.students,
      rating: item.rating,
      status: item.status,
      avatar: item.avatar || "",
    });
  };

  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    const parts = formData.name.trim().split(/\s+/);
    const first_name = parts[0] || "";
    const last_name = parts.slice(1).join(" ") || "";
    const is_active = formData.status === "active";
    const editNormName = normalizePersianName(formData.name);
    const editPhoneKeys = getPhoneLookupKeys(editingMember.phone);

    const updatedOverride = {
      status: formData.status,
      name: formData.name.trim(),
      role: formData.role.trim(),
      type: formData.type,
      students: formData.students,
      rating: formData.rating,
      avatar: formData.avatar?.trim() || undefined,
    };

    const editBatch: Record<string, any> = {
      [editingMember.id]: updatedOverride,
      [`name_${formData.name.trim()}`]: updatedOverride,
      [`name_${editingMember.name}`]: updatedOverride,
      [`normname_${editNormName}`]: updatedOverride,
    };
    for (const pk of editPhoneKeys) {
      editBatch[`phone_${pk}`] = updatedOverride;
    }
    saveLocalCoachOverridesBatch(editBatch);

    setIsSubmittingEdit(true);

    try {
      // 2. Send PATCH request to Django backend (updates is_active, names, specialties)
      await updateCoachMutation.mutateAsync({
        id: editingMember.id,
        payload: {
          first_name,
          last_name,
          is_active,
        } as any,
      });

      await queryClient.invalidateQueries({ queryKey: ["coaches"] });
      await queryClient.refetchQueries({ queryKey: ["coaches"] });
      await queryClient.invalidateQueries({ queryKey: ["owner-dashboard"] });

      logActivity({
        type: "EDIT",
        text: `ویرایش اطلاعات مربی: ${formData.name.trim()}`,
      });
    } catch (err) {
      console.error("Error updating coach in Django:", err);
    } finally {
      setIsSubmittingEdit(false);
      setEditingMember(null);
    }
  };

  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormData.first_name.trim() || !addFormData.last_name.trim()) {
      setAddSubmitError("نام و نام خانوادگی مربی الزامی است.");
      return;
    }

    const rawPhone = addFormData.phone
      ? addFormData.phone
        .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString())
        .replace(/[^\d]/g, "")
      : "";

    if (!rawPhone || rawPhone.length < 10) {
      setAddSubmitError("شماره همراه معتبر (مثلاً ۰۹۱۲۳۴۵۶۷۸۹) الزامی است.");
      return;
    }

    const finalSpecialties = [...addFormData.specialties];
    if (addFormData.customSpecialty.trim() && !finalSpecialties.includes(addFormData.customSpecialty.trim())) {
      finalSpecialties.push(addFormData.customSpecialty.trim());
    }
    if (finalSpecialties.length === 0) {
      finalSpecialties.push("بدنسازی");
    }

    setIsSubmittingNew(true);
    setAddSubmitError(null);

    try {
      const coachFullName = `${addFormData.first_name.trim()} ${addFormData.last_name.trim()}`;
      const normName = normalizePersianName(coachFullName);
      const phoneKeys = getPhoneLookupKeys(rawPhone);
      const avatarData = addFormData.avatar?.trim() || undefined;

      const roleDesc = finalSpecialties.length > 0 ? `مربی ${finalSpecialties.join("، ")}` : "مربی";
      const newOverride = {
        name: coachFullName,
        role: addFormData.position === "reception" ? "پذیرش / اداری" : roleDesc,
        type: addFormData.position === "reception" ? "staff" : "coach",
        status: "active",
        avatar: avatarData,
        phone: rawPhone,
        email: addFormData.email.trim() || undefined,
      };

      const batchToSave: Record<string, any> = {
        [`name_${coachFullName}`]: newOverride,
        [`normname_${normName}`]: newOverride,
      };
      for (const pk of phoneKeys) {
        batchToSave[`phone_${pk}`] = newOverride;
      }

      // 1. Immediately persist batch override
      saveLocalCoachOverridesBatch(batchToSave);

      // 2. Submit to Django backend
      const created = await addCoachMutation.mutateAsync({
        first_name: addFormData.first_name.trim(),
        last_name: addFormData.last_name.trim(),
        phone: rawPhone,
        specialties: finalSpecialties,
        position: addFormData.position,
        gender: addFormData.gender || undefined,
        birth_date: addFormData.birth_date || undefined,
        email: addFormData.email.trim() || undefined,
        avatar: avatarData,
        address: addFormData.address.trim() || undefined,
        experience_years: typeof addFormData.experience_years === "number" ? addFormData.experience_years : 0,
        primary_certification: addFormData.primary_certification.trim() || undefined,
        student_capacity: addFormData.student_capacity ? Number(addFormData.student_capacity) : undefined,
        work_shift: addFormData.work_shift || undefined,
        start_date: addFormData.start_date || new Date().toISOString().slice(0, 10),
        working_days: addFormData.working_days.length > 0 ? addFormData.working_days : undefined,
        send_invite: addFormData.send_invite,
        instant_activation: addFormData.instant_activation,
      });

      const createdId = (created as any)?.id || (created as any)?.data?.id;
      const effectiveId = createdId ? String(createdId) : "";
      if (effectiveId) {
        saveLocalCoachOverride(effectiveId, newOverride);
      }

      // 3. Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["coaches"] });
      await queryClient.refetchQueries({ queryKey: ["coaches"] });
      await queryClient.invalidateQueries({ queryKey: ["members"] });
      await queryClient.invalidateQueries({ queryKey: ["owner-dashboard"] });

      // 4. Find coach in fresh list and bind ID override
      try {
        const freshData: any = queryClient.getQueryData(["coaches"]);
        let freshList: any[] = [];
        if (Array.isArray(freshData)) {
          freshList = freshData;
        } else if (freshData && typeof freshData === "object") {
          freshList = Array.isArray(freshData.coaches)
            ? freshData.coaches
            : Array.isArray(freshData.results)
              ? freshData.results
              : [];
        }
        const foundCoach = freshList.find((c: any) => {
          if (effectiveId && String(c.id) === effectiveId) return true;
          const cName = c.full_name || `${c.first_name || ""} ${c.last_name || ""}`.trim() || c.name || "";
          if (normalizePersianName(cName) === normName) return true;
          const cPhoneKeys = getPhoneLookupKeys(c.phone || c.phone_number);
          if (phoneKeys.some((k) => cPhoneKeys.includes(k))) return true;
          return false;
        });
        if (foundCoach && foundCoach.id) {
          saveLocalCoachOverride(String(foundCoach.id), newOverride);
        }
      } catch (e) {
        console.error("Failed to associate coach id:", e);
      }

      logActivity({
        type: "COACH",
        text: `ثبت مربی جدید: ${coachFullName} (${finalSpecialties.slice(0, 2).join("، ")})`,
      });

      // Reset form
      setAddFormData({
        first_name: "",
        last_name: "",
        phone: "",
        email: "",
        avatar: "",
        gender: "male",
        birth_date: "",
        address: "",
        position: "coach",
        specialties: ["بدنسازی"],
        customSpecialty: "",
        experience_years: 1,
        primary_certification: "",
        student_capacity: 30,
        work_shift: "full_time",
        start_date: new Date().toISOString().slice(0, 10),
        working_days: ["sat", "mon", "wed"],
        send_invite: true,
        instant_activation: true,
      });

      if (onCloseAddModal) onCloseAddModal();
    } catch (err: any) {
      console.error("Failed to add coach in Django:", err);
      let msg = "خطا در ثبت مربی در سامانه. لطفاً اطلاعات ارسالی را بررسی کنید.";
      if (err?.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        const parts: string[] = [];
        for (const [field, errors] of Object.entries(err.fieldErrors)) {
          const fieldNameFa =
            field === "working_days"
              ? "روزهای کاری"
              : field === "phone" || field === "phone_number"
                ? "شماره همراه"
                : field === "first_name"
                  ? "نام"
                  : field === "last_name"
                    ? "نام خانوادگی"
                    : field === "specialties"
                      ? "تخصص‌ها"
                      : field === "email"
                        ? "ایمیل"
                        : field === "work_shift"
                          ? "شیفت کاری"
                          : field;
          parts.push(`${fieldNameFa}: ${(errors as string[]).join("، ")}`);
        }
        msg = parts.join(" | ");
      } else if (err?.detail) {
        msg = err.detail;
      } else if (err?.message) {
        msg = err.message;
      }
      setAddSubmitError(msg);
    } finally {
      setIsSubmittingNew(false);
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
            onClick={() => setFilter("coach")}
            className={cn(
              "cursor-pointer rounded-[8px] px-[14px] py-[8px] text-[13px] font-bold transition-all duration-180",
              filter === "coach"
                ? "bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                : "text-ink-faint hover:text-ink"
            )}
          >
            مربی
          </button>
          <button
            type="button"
            onClick={() => setFilter("staff")}
            className={cn(
              "cursor-pointer rounded-[8px] px-[14px] py-[8px] text-[13px] font-bold transition-all duration-180",
              filter === "staff"
                ? "bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                : "text-ink-faint hover:text-ink"
            )}
          >
            کارمند
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
            id="coSearch"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی نام…"
            className="w-full border-none bg-transparent text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
          />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-[16px] border border-border bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        {/* Card Head */}
        <div className="flex items-center justify-between border-b border-border px-[22px] py-[20px]">
          <div>
            <h3 className="text-[16px] font-extrabold text-ink">فهرست تیم</h3>
            <div className="mt-[3px] text-[12.5px] text-ink-faint" id="rowInfo">
              نمایش {toPersianDigits(filteredTeam.length)} نفر
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="font-bold">
              <tr>
                <th className="border-b border-border px-[22px] pt-[14px] pb-[14px] text-right text-[13.5px] font-bold whitespace-nowrap text-ink-faint">
                  عضو تیم
                </th>
                <th className="border-b border-border px-[22px] pt-[14px] pb-[14px] text-right text-[13.5px] font-bold whitespace-nowrap text-ink-faint">
                  نقش / تخصص
                </th>
                <th className="border-b border-border px-[22px] pt-[14px] pb-[14px] text-right text-[13.5px] font-bold whitespace-nowrap text-ink-faint">
                  شاگردان
                </th>
                <th className="border-b border-border px-[22px] pt-[14px] pb-[14px] text-right text-[13.5px] font-bold whitespace-nowrap text-ink-faint">
                  امتیاز
                </th>
                <th className="border-b border-border px-[22px] pt-[14px] pb-[14px] text-right text-[13.5px] font-bold whitespace-nowrap text-ink-faint">
                  وضعیت
                </th>
                <th className="border-b border-border px-[22px] pt-[14px] pb-[14px] text-right text-[13.5px] font-bold whitespace-nowrap text-ink-faint" />
              </tr>
            </thead>
            <tbody id="coBody">
              {filteredTeam.length > 0 ? (
                filteredTeam.map((item, index) => {
                  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
                  const isActive = item.status === "active";
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
                              {item.type === "coach" ? "مربی" : "کارمند"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-[22px] py-[15px] text-[13.5px] whitespace-nowrap text-ink-soft">
                        {item.role}
                      </td>
                      <td className="px-[22px] py-[15px] text-[13.5px] whitespace-nowrap text-ink-soft">
                        {item.students}
                      </td>
                      <td className="px-[22px] py-[15px] text-[13.5px] whitespace-nowrap text-ink-soft">
                        {item.type === "coach" && item.rating !== "—" ? `⭐ ${item.rating}` : "—"}
                      </td>
                      <td className="px-[22px] py-[15px] text-[13.5px] whitespace-nowrap text-ink-soft">
                        <span
                          className={cn(
                            "inline-flex items-center gap-[6px] rounded-[100px] px-[11px] py-[5px] text-[12px] font-bold",
                            isActive
                              ? "bg-tint text-primary-dark"
                              : "bg-[#FFF1F2] text-[#9F1239]"
                          )}
                        >
                          <span
                            className={cn(
                              "h-[6px] w-[6px] rounded-full",
                              isActive ? "bg-primary" : "bg-[#F43F5E]"
                            )}
                          />
                          {isActive ? "فعال" : "غیرفعال"}
                        </span>
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
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingCoachId === item.id}
                            className={cn(
                              "inline-flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[8px] text-ink-faint transition-all duration-150 hover:bg-[#FFF1F2] hover:text-[#E11D48]",
                              deletingCoachId === item.id && "cursor-not-allowed opacity-50"
                            )}
                            aria-label="حذف"
                          >
                            {deletingCoachId === item.id ? (
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
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="p-[40px] text-center text-[14px] text-ink-faint"
                  >
                    <div>عضوی در تیم پیدا نشد</div>
                    {onOpenAddModal && (
                      <button
                        type="button"
                        onClick={onOpenAddModal}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-[8px] bg-tint px-3 py-1.5 text-[12.5px] font-bold text-primary-dark hover:bg-primary/20 cursor-pointer"
                      >
                        + افزودن عضو جدید به تیم
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[4px]">
          <div className="w-full max-w-[480px] rounded-[16px] border border-border bg-surface p-[24px] shadow-[0_20px_60px_rgba(15,23,42,0.15)]">
            <div className="mb-[20px] flex items-center justify-between border-b border-border pb-[14px]">
              <h3 className="text-[17px] font-extrabold text-ink">
                ویرایش اطلاعات — {editingMember.name}
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
              {/* Profile Picture in Edit Coach Modal */}
              <div className="flex items-center gap-[14px] rounded-[14px] border border-dashed border-border bg-bg/50 p-[12px]">
                <div className="relative shrink-0">
                  <div className="flex h-[56px] w-[56px] items-center justify-center overflow-hidden rounded-[14px] border-2 border-border bg-surface shadow-2xs">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt={formData.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-[24px] w-[24px] text-ink-faint" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-bold text-ink">تصویر پروفایل مربی</div>
                  <div className="mt-[4px] flex items-center gap-[8px]">
                    <label className="inline-flex cursor-pointer items-center gap-[5px] rounded-[8px] bg-surface border border-border px-[10px] py-[4px] text-[11.5px] font-bold text-ink shadow-2xs hover:border-primary hover:bg-tint hover:text-primary-dark transition-all">
                      <Camera className="h-[13px] w-[13px]" />
                      <span>{formData.avatar ? "تغییر تصویر" : "افزودن تصویر"}</span>
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
                          } catch { }
                        }}
                      />
                    </label>
                    {formData.avatar && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, avatar: "" }))}
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[10px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary focus:bg-tint"
                />
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                <div>
                  <label className="mb-[6px] block text-[13px] font-bold text-ink">
                    نوع عضویت
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as "coach" | "staff" })}
                    className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[10px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary"
                  >
                    <option value="coach">مربی</option>
                    <option value="staff">کارمند</option>
                  </select>
                </div>
                <div>
                  <label className="mb-[6px] block text-[13px] font-bold text-ink">
                    نقش / تخصص
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[10px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary focus:bg-tint"
                  />
                </div>
              </div>

              {formData.type === "coach" && (
                <div className="grid grid-cols-2 gap-[12px]">
                  <div>
                    <label className="mb-[6px] block text-[13px] font-bold text-ink">
                      تعداد شاگردان
                    </label>
                    <input
                      type="text"
                      value={formData.students}
                      onChange={(e) => setFormData({ ...formData, students: e.target.value })}
                      className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[10px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary focus:bg-tint"
                    />
                  </div>
                  <div>
                    <label className="mb-[6px] block text-[13px] font-bold text-ink">
                      امتیاز
                    </label>
                    <input
                      type="text"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[10px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary focus:bg-tint"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-[6px] block text-[13px] font-bold text-ink">
                  وضعیت
                </label>
                <div className="flex gap-[10px]">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: "active" })}
                    className={cn(
                      "flex-1 rounded-[10px] border py-[8px] text-[12.5px] font-bold transition-all",
                      formData.status === "active"
                        ? "border-primary bg-tint text-primary-dark"
                        : "border-border bg-surface text-ink-soft"
                    )}
                  >
                    فعال
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: "inactive" })}
                    className={cn(
                      "flex-1 rounded-[10px] border py-[8px] text-[12.5px] font-bold transition-all",
                      formData.status === "inactive"
                        ? "border-[#F43F5E] bg-[#FFF1F2] text-[#9F1239]"
                        : "border-border bg-surface text-ink-soft"
                    )}
                  >
                    غیرفعال
                  </button>
                </div>
              </div>

              <div className="mt-[10px] flex justify-end gap-[10px]">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="rounded-[10px] border border-border px-[16px] py-[9px] text-[13.5px] font-semibold text-ink hover:bg-bg"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-ink px-[20px] py-[9px] text-[13.5px] font-semibold text-white transition-all hover:bg-primary-dark cursor-pointer disabled:opacity-70"
                >
                  {isSubmittingEdit ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span>در حال ذخیره...</span>
                    </>
                  ) : (
                    <span>ذخیره تغییرات</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Coach Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[4px] animate-in fade-in duration-200">
          <div className="w-full max-w-[600px] max-h-[92vh] overflow-y-auto rounded-[16px] border border-border bg-surface p-[22px] shadow-[0_20px_60px_rgba(15,23,42,0.15)] sm:p-[26px]">
            {/* Modal Header */}
            <div className="mb-[18px] flex items-center justify-between border-b border-border pb-[14px]">
              <div>
                <h3 className="text-[17px] font-extrabold text-ink sm:text-[19px]">
                  افزودن مربی جدید
                </h3>
                <p className="mt-1 text-[12.5px] text-ink-soft">
                  ثبت مربی در سامانه بر اساس استاندارد فیتلجند جیم
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseAddModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition hover:bg-bg hover:text-ink cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Message */}
            {addSubmitError && (
              <div className="mb-[16px] flex items-start gap-2.5 rounded-[12px] border border-rose-200 bg-rose-50 p-[12px] text-[13px] text-rose-700 animate-in fade-in duration-150">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-relaxed font-medium">{addSubmitError}</span>
              </div>
            )}

            <form onSubmit={handleSaveNew} className="flex flex-col gap-[14px]">
              {/* Profile Picture Upload Section */}
              <div className="flex items-center gap-[16px] rounded-[14px] border border-dashed border-border bg-bg/50 p-[14px] transition-colors hover:border-primary/50">
                <div className="relative group shrink-0">
                  <div className="relative flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-[18px] border-2 border-border bg-surface shadow-xs">
                    {addFormData.avatar ? (
                      <img
                        src={addFormData.avatar}
                        alt="تصویر پروفایل مربی"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-ink-faint">
                        <UserIcon className="h-[28px] w-[28px]" />
                      </div>
                    )}
                  </div>
                  {addFormData.avatar && (
                    <button
                      type="button"
                      onClick={() => setAddFormData((prev) => ({ ...prev, avatar: "" }))}
                      className="absolute -top-[6px] -left-[6px] flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#E11D48] text-white shadow-xs transition-transform hover:scale-110 cursor-pointer"
                      title="حذف تصویر"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-ink">
                    تصویر پروفایل مربی
                  </div>
                  <div className="mt-[2px] text-[11.5px] text-ink-faint">
                    فرمت‌های JPG، PNG یا WEBP (اختیاری)
                  </div>
                  <div className="mt-[8px] flex items-center gap-[8px]">
                    <label className="inline-flex cursor-pointer items-center gap-[6px] rounded-[9px] bg-surface border border-border px-[11px] py-[5px] text-[12px] font-bold text-ink shadow-2xs transition-all hover:border-primary hover:bg-tint hover:text-primary-dark">
                      <Camera className="h-[14px] w-[14px]" />
                      <span>{addFormData.avatar ? "تغییر تصویر" : "بارگذاری تصویر"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const dataUrl = await compressImage(file);
                            setAddFormData((prev) => ({ ...prev, avatar: dataUrl }));
                          } catch (err) {
                            console.error("Failed to load coach avatar:", err);
                          }
                        }}
                      />
                    </label>
                    {addFormData.avatar && (
                      <button
                        type="button"
                        onClick={() => setAddFormData((prev) => ({ ...prev, avatar: "" }))}
                        className="text-[11.5px] font-bold text-[#E11D48] hover:underline cursor-pointer"
                      >
                        حذف
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* First & Last Name */}
              <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2">
                <div>
                  <label className="mb-[6px] block text-[13px] font-bold text-ink">
                    نام <span className="text-[#F43F5E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثلاً: کامران"
                    value={addFormData.first_name}
                    onChange={(e) => setAddFormData({ ...addFormData, first_name: e.target.value })}
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
                    placeholder="مثلاً: مولایی"
                    value={addFormData.last_name}
                    onChange={(e) => setAddFormData({ ...addFormData, last_name: e.target.value })}
                    className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[9.5px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary focus:bg-tint"
                  />
                </div>
              </div>

              {/* Phone & Position */}
              <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2">
                <div>
                  <label className="mb-[6px] block text-[13px] font-bold text-ink">
                    شماره همراه <span className="text-[#F43F5E]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={11}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    value={addFormData.phone}
                    onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                    className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[9.5px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary focus:bg-tint"
                  />
                </div>
                <div>
                  <label className="mb-[6px] block text-[13px] font-bold text-ink">
                    سمت سازمانی (Position)
                  </label>
                  <select
                    value={addFormData.position}
                    onChange={(e) => setAddFormData({ ...addFormData, position: e.target.value as any })}
                    className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[9.5px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary"
                  >
                    <option value="coach">مربی ورزشی (Coach)</option>
                    <option value="head_coach">سرمربی باشگاه (Head Coach)</option>
                    <option value="reception">مسئول پذیرش و اداری (Reception)</option>
                  </select>
                </div>
              </div>

              {/* Specialties */}
              <div>
                <label className="mb-[6px] block text-[13px] font-bold text-ink">
                  رشته‌ها و تخصص‌ها <span className="text-[#F43F5E]">*</span>
                </label>
                <div className="mb-2.5 flex flex-wrap gap-[6px]">
                  {PRESET_SPECIALTIES.map((spec) => {
                    const isSelected = addFormData.specialties.includes(spec);
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleSpecialty(spec)}
                        className={cn(
                          "cursor-pointer rounded-[8px] border px-[10px] py-[5px] text-[12px] font-medium transition",
                          isSelected
                            ? "border-primary bg-tint text-primary-dark font-bold shadow-xs"
                            : "border-border bg-surface text-ink-soft hover:bg-bg"
                        )}
                      >
                        {isSelected && <Check className="ml-1 inline-block h-3.5 w-3.5" />}
                        {spec}
                      </button>
                    );
                  })}
                </div>

                {/* Custom specialty adder */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="افزودن تخصص دیگر (مثلاً: کیک‌بوکسینگ)..."
                    value={addFormData.customSpecialty}
                    onChange={(e) => setAddFormData({ ...addFormData, customSpecialty: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomSpecialty();
                      }
                    }}
                    className="flex-1 rounded-[10px] border border-border bg-surface px-[12px] py-[7px] text-[12.5px] text-ink outline-none transition focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSpecialty}
                    className="inline-flex items-center gap-1 rounded-[10px] border border-border bg-bg px-[12px] py-[7px] text-[12.5px] font-semibold text-ink hover:bg-surface cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>افزودن</span>
                  </button>
                </div>

                {/* Non-preset custom tags */}
                {addFormData.specialties.filter((s) => !PRESET_SPECIALTIES.includes(s)).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {addFormData.specialties
                      .filter((s) => !PRESET_SPECIALTIES.includes(s))
                      .map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11.5px] font-medium text-primary-dark"
                        >
                          {s}
                          <button
                            type="button"
                            onClick={() => toggleSpecialty(s)}
                            className="cursor-pointer hover:text-rose-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {/* Work Shift & Experience */}
              <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2">
                <div>
                  <label className="mb-[6px] block text-[13px] font-bold text-ink">
                    شیفت کاری (Work Shift)
                  </label>
                  <select
                    value={addFormData.work_shift}
                    onChange={(e) => setAddFormData({ ...addFormData, work_shift: e.target.value as any })}
                    className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[9.5px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary"
                  >
                    <option value="full_time">تمام وقت (Full Time)</option>
                    <option value="morning">شیفت صبح (Morning)</option>
                    <option value="evening">شیفت عصر (Evening)</option>
                    <option value="morning_evening">صبح و عصر (Split Shift)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-[6px] block text-[13px] font-bold text-ink">
                    سابقه کاری (سال)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="مثلاً: ۳"
                    value={addFormData.experience_years}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        experience_years: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[9.5px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary focus:bg-tint"
                  />
                </div>
              </div>

              {/* Certification & Student Capacity */}
              <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2">
                <div>
                  <label className="mb-[6px] block text-[13px] font-bold text-ink">
                    مدرک مربیگری اصلی
                  </label>
                  <input
                    type="text"
                    placeholder="مثلاً: درجه ۱ فدراسیون بدنسازی"
                    value={addFormData.primary_certification}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, primary_certification: e.target.value })
                    }
                    className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[9.5px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary focus:bg-tint"
                  />
                </div>
                <div>
                  <label className="mb-[6px] block text-[13px] font-bold text-ink">
                    ظرفیت پذیرش شاگرد
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="مثلاً: ۳۰"
                    value={addFormData.student_capacity}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        student_capacity: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[9.5px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary focus:bg-tint"
                  />
                </div>
              </div>

              {/* Gender & Start Date */}
              <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2">
                <div>
                  <label className="mb-[6px] block text-[13px] font-bold text-ink">
                    جنسیت
                  </label>
                  <select
                    value={addFormData.gender}
                    onChange={(e) => setAddFormData({ ...addFormData, gender: e.target.value as any })}
                    className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[9.5px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary"
                  >
                    <option value="male">مرد</option>
                    <option value="female">زن</option>
                  </select>
                </div>
                <div>
                  <label className="mb-[6px] block text-[13px] font-bold text-ink">
                    تاریخ شروع همکاری
                  </label>
                  <input
                    type="date"
                    value={addFormData.start_date}
                    onChange={(e) => setAddFormData({ ...addFormData, start_date: e.target.value })}
                    className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[9.5px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary focus:bg-tint"
                  />
                </div>
              </div>

              {/* Working Days */}
              <div>
                <label className="mb-[6px] block text-[13px] font-bold text-ink">
                  روزهای کاری هفتگی
                </label>
                <div className="grid grid-cols-4 gap-[6px] sm:grid-cols-7">
                  {WORKING_DAYS_OPTIONS.map((d) => {
                    const isSelected = addFormData.working_days.includes(d.key);
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => toggleWorkingDay(d.key)}
                        className={cn(
                          "cursor-pointer rounded-[8px] border py-[7px] text-[12px] font-medium transition text-center",
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
                          آدرس ایمیل
                        </label>
                        <input
                          type="email"
                          placeholder="coach@example.com"
                          value={addFormData.email}
                          onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                          className="w-full rounded-[10px] border border-border bg-surface px-[12px] py-[8px] text-[12.5px] text-ink outline-none transition focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="mb-[5px] block text-[12px] font-semibold text-ink-soft">
                          تاریخ تولد
                        </label>
                        <input
                          type="date"
                          value={addFormData.birth_date}
                          onChange={(e) =>
                            setAddFormData({ ...addFormData, birth_date: e.target.value })
                          }
                          className="w-full rounded-[10px] border border-border bg-surface px-[12px] py-[8px] text-[12.5px] text-ink outline-none transition focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-[5px] block text-[12px] font-semibold text-ink-soft">
                        آدرس محل سکونت
                      </label>
                      <input
                        type="text"
                        placeholder="تهران، خیابان..."
                        value={addFormData.address}
                        onChange={(e) => setAddFormData({ ...addFormData, address: e.target.value })}
                        className="w-full rounded-[10px] border border-border bg-surface px-[12px] py-[8px] text-[12.5px] text-ink outline-none transition focus:border-primary"
                      />
                    </div>

                    <div className="flex flex-col gap-2 rounded-[10px] border border-border/80 bg-surface p-2.5">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          id="coach_send_invite"
                          checked={addFormData.send_invite}
                          onChange={(e) =>
                            setAddFormData({ ...addFormData, send_invite: e.target.checked })
                          }
                          className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                        />
                        <label
                          htmlFor="coach_send_invite"
                          className="text-[12.5px] font-medium text-ink cursor-pointer select-none"
                        >
                          ارسال دعوت‌نامه پیامکی جهت ورود به پنل مربی (send_invite)
                        </label>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          id="coach_instant_activation"
                          checked={addFormData.instant_activation}
                          onChange={(e) =>
                            setAddFormData({
                              ...addFormData,
                              instant_activation: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                        />
                        <label
                          htmlFor="coach_instant_activation"
                          className="text-[12.5px] font-medium text-ink cursor-pointer select-none"
                        >
                          فعال‌سازی آنی حساب و پروفایل مربی (instant_activation)
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="mt-[6px] flex items-center justify-end gap-[10px] border-t border-border pt-[14px]">
                <button
                  type="button"
                  disabled={isSubmittingNew}
                  onClick={onCloseAddModal}
                  className="rounded-[10px] border border-border px-[16px] py-[9px] text-[13.5px] font-semibold text-ink hover:bg-bg cursor-pointer disabled:opacity-50 transition"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-ink px-[22px] py-[9px] text-[13.5px] font-bold text-white transition-all hover:bg-primary-dark hover:shadow-emerald cursor-pointer disabled:opacity-70"
                >
                  {isSubmittingNew ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span>در حال ثبت اطلاعات...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 text-primary" />
                      <span>افزودن و ثبت مربی</span>
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
