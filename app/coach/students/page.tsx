"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { CoachSidebar } from "@/components/coach/coach-sidebar";
import { CoachTopbar } from "@/components/coach/coach-topbar";
import { useAuth } from "@/lib/auth-context";
import { useCoachMe, useCoachStudents } from "@/lib/hooks/queries/use-coaches";
import { coachesService } from "@/lib/api/services/coaches.service";
import { useQueryClient } from "@tanstack/react-query";
import {
  CoachAddMemberModal,
  type NewStudentPayload,
} from "@/components/coach/coach-add-member-modal";
import {
  getCoachStudentsStore,
  removeStudentFromCoach,
  updateCoachStudentOverride,
  addCustomCoachStudent,
  sanitizeCustomStudents,
  useCoachStudentsSync,
  type StudentOverride,
} from "@/lib/coach-students-store";
import { toPersianDigits } from "@/lib/persian-digits";
import { cn } from "@/lib/utils";
import {
  X,
  Check,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
  Phone,
  Calendar,
  Activity,
  FileText,
  User as UserIcon,
  Upload,
} from "lucide-react";

interface StudentItem {
  id: string;
  name: string;
  program: string;
  status: "active" | "expiring" | "expired";
  attendanceRate: number;
  lastSession: string;
  dueDate: string;
  phone?: string;
  notes?: string;
  avatarColor: string;
  avatarUrl?: string;
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

const STATUS_MAP = {
  active: { cls: "active", label: "فعال" },
  expiring: { cls: "expiring", label: "رو به اتمام" },
  expired: { cls: "expired", label: "منقضی" },
};

const ITEMS_PER_PAGE = 8;

function formatPersianDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const fmt = new Intl.DateTimeFormat("fa-IR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return fmt.format(date);
  } catch {
    return dateStr;
  }
}

export default function CoachStudentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "expiring" | "expired">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [removingStudent, setRemovingStudent] = useState<StudentItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [pendingRemovedIds, setPendingRemovedIds] = useState<string[]>([]);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState<{
    name: string;
    phone: string;
    program: string;
    status: "active" | "expiring" | "expired";
    attendanceRate: number;
    lastSession: string;
    dueDate: string;
    notes: string;
    avatarUrl?: string;
  }>({
    name: "",
    phone: "",
    program: "",
    status: "active",
    attendanceRate: 0,
    lastSession: "",
    dueDate: "",
    notes: "",
    avatarUrl: "",
  });

  const { user } = useAuth();
  const { data: coachMe } = useCoachMe();
  const queryClient = useQueryClient();
  const coachName = user?.full_name?.trim() || coachMe?.full_name?.trim() || "مربی باشگاه";

  // Real students from Django backend: GET /coaches/my-students/
  const { data: backendStudents, isLoading: isStudentsLoading } = useCoachStudents();
  const storeVersion = useCoachStudentsSync();

  // Automatically sanitize store if backend students exist
  useEffect(() => {
    if (Array.isArray(backendStudents) && backendStudents.length > 0) {
      sanitizeCustomStudents(backendStudents);
    }
  }, [backendStudents]);

  // Combine Django students with local overrides and custom additions, strictly deduplicating
  const students = useMemo<StudentItem[]>(() => {
    const store = getCoachStudentsStore();
    const result: StudentItem[] = [];
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();

    // 1. Process real Django backend students first (primary source of truth)
    // Any student returned by Django IS assigned to this coach and must be displayed!
    if (Array.isArray(backendStudents)) {
      for (let i = 0; i < backendStudents.length; i++) {
        const b = backendStudents[i];
        if (pendingRemovedIds.includes(b.id)) continue;
        if (seenIds.has(b.id)) continue;

        const ovr = store.overrides[b.id] || {};
        const rawStatus = b.status?.toLowerCase();
        const baseStatus: "active" | "expiring" | "expired" =
          rawStatus === "expiring" || rawStatus === "expired" ? rawStatus : "active";

        const studentName = (ovr.name ?? b.full_name ?? (b as any).name ?? "شاگرد باشگاه").trim();
        const normName = studentName.toLowerCase();

        const student: StudentItem = {
          id: b.id,
          name: studentName,
          program: ovr.program ?? (b.current_plan?.name || "برنامه اختصاصی"),
          status: (ovr.status ?? baseStatus) as "active" | "expiring" | "expired",
          attendanceRate: ovr.attendanceRate ?? (b.attendance_rate ?? 0),
          lastSession:
            ovr.lastSession ??
            (b.last_session ? formatPersianDate(b.last_session) : "بدون جلسه اخیر"),
          dueDate:
            ovr.dueDate ??
            (b.membership_end_date ? formatPersianDate(b.membership_end_date) : "—"),
          phone: ovr.phone ?? ((b as any).phone_number || (b as any).phone || ""),
          notes: ovr.notes ?? "",
          avatarColor: AVATAR_COLORS[result.length % AVATAR_COLORS.length],
          avatarUrl: ovr.avatarUrl ?? (b as any).profile_picture_url ?? (b as any).avatar,
        };

        seenIds.add(b.id);
        if (normName) seenNames.add(normName);
        result.push(student);
      }
    }

    // 2. Process custom students added locally, skipping duplicates
    if (Array.isArray(store.customStudents)) {
      for (let i = 0; i < store.customStudents.length; i++) {
        const cs = store.customStudents[i];
        if (store.removedIds.includes(cs.id)) continue;
        if (seenIds.has(cs.id)) continue;

        const ovr = store.overrides[cs.id] || {};
        const studentName = (ovr.name ?? cs.name ?? "").trim();
        const normName = studentName.toLowerCase();

        // If a student with this ID or normalized name was already added from backend, skip it!
        if (normName && seenNames.has(normName)) continue;

        const student: StudentItem = {
          id: cs.id,
          name: studentName,
          program: ovr.program ?? cs.program,
          status: (ovr.status ?? cs.status) as "active" | "expiring" | "expired",
          attendanceRate: ovr.attendanceRate ?? cs.attendanceRate,
          lastSession: ovr.lastSession ?? cs.lastSession,
          dueDate: ovr.dueDate ?? cs.dueDate,
          phone: ovr.phone ?? cs.phone,
          notes: ovr.notes ?? cs.notes,
          avatarColor: cs.avatarColor || AVATAR_COLORS[result.length % AVATAR_COLORS.length],
          avatarUrl: ovr.avatarUrl ?? cs.avatarUrl,
        };

        seenIds.add(cs.id);
        if (normName) seenNames.add(normName);
        result.push(student);
      }
    }

    return result;
  }, [backendStudents, storeVersion]);

  // Dynamic KPI counts computed from real students
  const totalStudentsCount = students.length;
  const activeCount = useMemo(
    () => students.filter((s) => s.status === "active").length,
    [students]
  );
  const expiringCount = useMemo(
    () => students.filter((s) => s.status === "expiring").length,
    [students]
  );
  const expiredCount = useMemo(
    () => students.filter((s) => s.status === "expired").length,
    [students]
  );

  // Filtered rows
  const filteredStudents = useMemo(() => {
    return students.filter((item) => {
      const matchFilter = filter === "all" || item.status === filter;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        q === "" ||
        item.name.toLowerCase().includes(q) ||
        item.program.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.phone && item.phone.includes(q));
      return matchFilter && matchSearch;
    });
  }, [students, filter, searchQuery]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  // Paginated rows
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE));
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] || "") + (parts[1][0] || "");
    }
    return name.slice(0, 2);
  };

  // Open Edit Modal
  const handleOpenEdit = (stu: StudentItem) => {
    setEditingStudent(stu);
    setEditForm({
      name: stu.name,
      phone: stu.phone || "",
      program: stu.program,
      status: stu.status,
      attendanceRate: stu.attendanceRate,
      lastSession: stu.lastSession,
      dueDate: stu.dueDate,
      notes: stu.notes || "",
      avatarUrl: stu.avatarUrl || "",
    });
    setSelectedStudent(null);
  };

  // Avatar file input handler for Edit modal
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setEditForm((prev) => ({ ...prev, avatarUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Edit Form
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const override: StudentOverride = {
      name: editForm.name.trim() || editingStudent.name,
      phone: editForm.phone.trim(),
      program: editForm.program.trim() || editingStudent.program,
      status: editForm.status,
      attendanceRate: Number(editForm.attendanceRate) || 0,
      lastSession: editForm.lastSession.trim() || editingStudent.lastSession,
      dueDate: editForm.dueDate.trim() || editingStudent.dueDate,
      notes: editForm.notes.trim(),
      avatarUrl: editForm.avatarUrl !== undefined ? editForm.avatarUrl : editingStudent.avatarUrl,
    };

    updateCoachStudentOverride(editingStudent.id, override);
    setEditingStudent(null);
  };

  // Open Remove Modal
  const handleOpenRemove = (stu: StudentItem) => {
    setRemovingStudent(stu);
    setSelectedStudent(null);
    setEditingStudent(null);
  };

  // Confirm Removal from Coach Roster: sets assigned_coach = null in Django backend and updates local store
  const handleConfirmRemove = async () => {
    if (!removingStudent) return;
    const studentIdToRemove = removingStudent.id;
    setIsRemoving(true);
    setPendingRemovedIds((prev) => [...prev, studentIdToRemove]);
    try {
      if (!studentIdToRemove.startsWith("cs-")) {
        await coachesService.unassignStudent(studentIdToRemove);
      }
    } catch (err) {
      console.error("Backend unassignStudent call failed:", err);
    } finally {
      removeStudentFromCoach(studentIdToRemove);
      await queryClient.invalidateQueries({ queryKey: ["coach-students"] });
      await queryClient.refetchQueries({ queryKey: ["coach-students"] });
      await queryClient.invalidateQueries({ queryKey: ["coach-dashboard"] });
      await queryClient.refetchQueries({ queryKey: ["coach-dashboard"] });
      setPendingRemovedIds((prev) => prev.filter((id) => id !== studentIdToRemove));
      setIsRemoving(false);
      setRemovingStudent(null);
    }
  };

  // Handle student added from modal: synchronizes with Django POST /api/coach/add-student
  const handleStudentAdded = async (payload: NewStudentPayload) => {
    const fullName = `${payload.firstName} ${payload.lastName}`.trim();
    const genderMapped = payload.gender === "زن" ? "FEMALE" : "MALE";
    const levelMapped =
      payload.level === "مبتدی"
        ? "BEGINNER"
        : payload.level === "پیشرفته"
        ? "ADVANCED"
        : "INTERMEDIATE";
    const todayIso = new Date().toISOString().slice(0, 10);

    let backendSuccess = false;
    // 1. Send to Next.js API route which adds member in Django and assigns coach
    try {
      await coachesService.addMyStudent({
        first_name: payload.firstName,
        last_name: payload.lastName,
        phone_number: payload.phone,
        email: payload.email || undefined,
        gender: genderMapped,
        goal: payload.goal,
        level: levelMapped,
        start_date: todayIso,
        coach_notes: payload.notes,
        is_active: payload.instantActive,
        coachId: coachMe?.id,
      });
      backendSuccess = true;
      await queryClient.invalidateQueries({ queryKey: ["coach-students"] });
      await queryClient.refetchQueries({ queryKey: ["coach-students"] });
      await queryClient.invalidateQueries({ queryKey: ["coach-dashboard"] });
      await queryClient.refetchQueries({ queryKey: ["coach-dashboard"] });
    } catch (err) {
      console.warn("Backend addMyStudent call failed or timed out:", err);
    }

    // 2. Only add custom student if backend call was NOT successful (fallback)
    if (!backendSuccess) {
      const newId = `cs-${Date.now().toString().slice(-6)}`;
      addCustomCoachStudent({
        id: newId,
        name: fullName,
        program: `${payload.goal} — ${payload.programType}`,
        status: "active",
        attendanceRate: 100,
        lastSession: "امروز",
        dueDate: payload.duration ? `${payload.duration} آینده` : "۳۰ روز آینده",
        phone: payload.phone,
        notes: payload.notes,
        avatarColor: AVATAR_COLORS[students.length % AVATAR_COLORS.length],
        avatarUrl: payload.avatarUrl,
      });
    }
  };

  const handleExport = () => {
    const BOM = "\uFEFF";
    const headers = [
      "ردیف",
      "شناسه شاگرد",
      "نام و نام خانوادگی",
      "شماره تماس",
      "برنامه تمرینی",
      "وضعیت عضویت",
      "درصد حضور",
      "آخرین جلسه",
      "سررسید عضویت",
    ];

    const escapeCsv = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const exportData =
      filter === "all" && !searchQuery.trim()
        ? students
        : filteredStudents.length > 0
        ? filteredStudents
        : students;

    const rows = exportData.map((s, index) => {
      const statusLabel = STATUS_MAP[s.status]?.label || s.status;
      return [
        escapeCsv(index + 1),
        escapeCsv(`#${s.id}`),
        escapeCsv(s.name),
        escapeCsv(s.phone || "—"),
        escapeCsv(s.program),
        escapeCsv(statusLabel),
        escapeCsv(`${s.attendanceRate}٪`),
        escapeCsv(s.lastSession),
        escapeCsv(s.dueDate),
      ].join(",");
    });

    const csvContent =
      BOM + [headers.map(escapeCsv).join(","), ...rows].join("\r\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `لیست_شاگردان_مربی_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app flex min-h-screen">
      {/* Sidebar Navigation */}
      <CoachSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="main flex flex-1 flex-col min-w-0">
        {/* Topbar */}
        <CoachTopbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          searchPlaceholder="جستجو…"
        />

        {/* Content */}
        <main className="content flex-1 p-[18px] min-[640px]:p-[28px]">
          {/* Page Head */}
          <div className="page-head flex flex-wrap items-end justify-between gap-[16px] mb-[24px]">
            <div>
              <h1 className="text-[22px] min-[640px]:text-[26px] font-extrabold text-ink tracking-[-0.01em]">
                شاگردان من
              </h1>
              <div className="sub text-[14px] text-ink-faint mt-[5px]">
                مدیریت، پیگیری و همگام‌سازی شاگردان مربی
              </div>
            </div>

            <div className="page-head-actions flex items-center gap-[10px]">
              <button
                type="button"
                onClick={handleExport}
                className="btn btn-outline btn-sm"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-[17px] w-[17px]"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="M7 10l5 5 5-5M12 15V3" />
                </svg>
                <span>خروجی</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="btn btn-primary btn-sm"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-[17px] w-[17px]"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>افزودن شاگرد</span>
              </button>
            </div>
          </div>

          {/* KPI cards Grid */}
          <div className="kpi-grid grid grid-cols-1 gap-[18px] min-[641px]:grid-cols-2 min-[1101px]:grid-cols-4 mb-[18px]">
            {/* Card 1: کل شاگردان */}
            <div className="card kpi p-[20px] flex flex-col gap-[14px] bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
              <div className="kpi-top flex items-center justify-between">
                <span className="kpi-ico flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-tint text-primary-dark kpi-c-orange">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-[22px] w-[22px]"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  </svg>
                </span>
              </div>
              <div className="v text-[28px] font-extrabold leading-none text-ink">
                {toPersianDigits(totalStudentsCount)}
              </div>
              <div className="l text-[13.5px] font-medium text-ink-soft">
                کل شاگردان
              </div>
            </div>

            {/* Card 2: فعال */}
            <div className="card kpi p-[20px] flex flex-col gap-[14px] bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
              <div className="kpi-top flex items-center justify-between">
                <span className="kpi-ico flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-tint text-primary-dark kpi-c-sky">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-[22px] w-[22px]"
                  >
                    <path d="m9 12 2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </span>
              </div>
              <div className="v text-[28px] font-extrabold leading-none text-ink">
                {toPersianDigits(activeCount)}
              </div>
              <div className="l text-[13.5px] font-medium text-ink-soft">
                عضویت فعال
              </div>
            </div>

            {/* Card 3: رو به اتمام */}
            <div className="card kpi p-[20px] flex flex-col gap-[14px] bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
              <div className="kpi-top flex items-center justify-between">
                <span className="kpi-ico flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-tint text-primary-dark kpi-c-violet">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-[22px] w-[22px]"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </span>
              </div>
              <div className="v text-[28px] font-extrabold leading-none text-ink">
                {toPersianDigits(expiringCount)}
              </div>
              <div className="l text-[13.5px] font-medium text-ink-soft">
                رو به اتمام
              </div>
            </div>

            {/* Card 4: منقضی */}
            <div className="card kpi p-[20px] flex flex-col gap-[14px] bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
              <div className="kpi-top flex items-center justify-between">
                <span className="kpi-ico flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-tint text-primary-dark kpi-c-emerald">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-[22px] w-[22px]"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </span>
              </div>
              <div className="v text-[28px] font-extrabold leading-none text-ink">
                {toPersianDigits(expiredCount)}
              </div>
              <div className="l text-[13.5px] font-medium text-ink-soft">
                منقضی‌شده
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar flex items-center gap-[12px] mb-[18px] flex-wrap">
            <div className="tabs-inline flex gap-[4px] bg-bg p-[4px] rounded-[10px] flex-wrap" id="statusTabs">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={cn("tab", filter === "all" && "active")}
              >
                همه
              </button>
              <button
                type="button"
                onClick={() => setFilter("active")}
                className={cn("tab", filter === "active" && "active")}
              >
                فعال
              </button>
              <button
                type="button"
                onClick={() => setFilter("expiring")}
                className={cn("tab", filter === "expiring" && "active")}
              >
                رو به اتمام
              </button>
              <button
                type="button"
                onClick={() => setFilter("expired")}
                className={cn("tab", filter === "expired" && "active")}
              >
                منقضی
              </button>
            </div>

            <div className="filter-search flex items-center gap-[10px] bg-surface border border-border rounded-[12px] p-[9px_14px] min-w-[240px] flex-1 max-w-[360px]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="h-[17px] w-[17px] text-ink-faint shrink-0"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                id="stuSearch"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی نام، شناسه یا شماره…"
                className="w-full border-none bg-transparent text-[14px] text-ink outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-[12px] text-ink-faint hover:text-ink"
                  aria-label="پاک کردن"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Students List Card */}
          <div className="card bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
            <div className="card-head flex items-center justify-between p-[20px_22px] border-b border-border">
              <div>
                <h3 className="text-[16px] font-extrabold text-ink">فهرست شاگردان مربی</h3>
                <div className="hint text-[12.5px] text-ink-faint mt-[3px]" id="rowInfo">
                  نمایش {toPersianDigits(filteredStudents.length)} شاگرد از {toPersianDigits(totalStudentsCount)}
                </div>
              </div>
            </div>

            <div className="table-wrap overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-right text-[13.5px] font-extrabold text-ink-faint p-[14px_22px_14px] border-b border-border whitespace-nowrap">
                      شاگرد
                    </th>
                    <th className="text-right text-[13.5px] font-extrabold text-ink-faint p-[14px_22px_14px] border-b border-border whitespace-nowrap">
                      برنامه
                    </th>
                    <th className="text-right text-[13.5px] font-extrabold text-ink-faint p-[14px_22px_14px] border-b border-border whitespace-nowrap">
                      وضعیت
                    </th>
                    <th className="text-right text-[13.5px] font-extrabold text-ink-faint p-[14px_22px_14px] border-b border-border whitespace-nowrap">
                      نرخ حضور
                    </th>
                    <th className="text-right text-[13.5px] font-extrabold text-ink-faint p-[14px_22px_14px] border-b border-border whitespace-nowrap">
                      آخرین جلسه
                    </th>
                    <th className="text-right text-[13.5px] font-extrabold text-ink-faint p-[14px_22px_14px] border-b border-border whitespace-nowrap">
                      سررسید عضویت
                    </th>
                    <th className="text-right text-[13.5px] font-extrabold text-ink-faint p-[14px_22px_14px] border-b border-border whitespace-nowrap">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody id="stuBody">
                  {isStudentsLoading && students.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-ink-faint p-[40px] text-[14px]">
                        در حال بارگذاری شاگردان از سرور...
                      </td>
                    </tr>
                  ) : paginatedStudents.length > 0 ? (
                    paginatedStudents.map((stu) => {
                      const stat = STATUS_MAP[stu.status] || STATUS_MAP.active;
                      return (
                        <tr
                          key={stu.id}
                          className="border-b border-border last:border-b-0 hover:bg-bg transition-colors duration-150"
                        >
                          <td className="p-[15px_22px] text-[13.5px] text-ink-soft whitespace-nowrap">
                            <div className="member-cell flex items-center gap-[11px]">
                              {stu.avatarUrl ? (
                                <img
                                  src={stu.avatarUrl}
                                  alt={stu.name}
                                  className="av w-[36px] h-[36px] rounded-[10px] shrink-0 object-cover border border-border"
                                />
                              ) : (
                                <span
                                  className="av w-[36px] h-[36px] rounded-[10px] shrink-0 flex items-center justify-center font-bold text-[13px] text-white"
                                  style={{ background: stu.avatarColor }}
                                >
                                  {getInitials(stu.name)}
                                </span>
                              )}
                              <div>
                                <div className="nm text-[13.5px] font-bold text-ink">{stu.name}</div>
                                <div className="em text-[12px] text-ink-faint">
                                  {stu.phone ? toPersianDigits(stu.phone) : `شناسه #${toPersianDigits(stu.id.slice(0, 8))}`}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-[15px_22px] text-[13.5px] text-ink-soft whitespace-nowrap">
                            {stu.program}
                          </td>
                          <td className="p-[15px_22px] text-[13.5px] text-ink-soft whitespace-nowrap">
                            <span className={cn("status", stat.cls)}>
                              <span className="d"></span>
                              {stat.label}
                            </span>
                          </td>
                          <td className="p-[15px_22px] text-[13.5px] text-ink-soft whitespace-nowrap">
                            ٪{toPersianDigits(stu.attendanceRate)}
                          </td>
                          <td className="p-[15px_22px] text-[13.5px] text-ink-soft whitespace-nowrap">
                            {stu.lastSession}
                          </td>
                          <td className="p-[15px_22px] text-[13.5px] text-ink-soft whitespace-nowrap">
                            {stu.dueDate}
                          </td>
                          <td className="p-[15px_22px] text-[13.5px] text-ink-soft whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {/* View detail button */}
                              <button
                                type="button"
                                onClick={() => setSelectedStudent(stu)}
                                className="row-action text-ink-faint w-[32px] h-[32px] rounded-[8px] inline-flex items-center justify-center transition-all duration-150 hover:bg-tint hover:text-primary-dark cursor-pointer"
                                title="مشاهده جزئیات"
                                aria-label="مشاهده"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              {/* Edit student button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(stu)}
                                className="row-action text-ink-faint w-[32px] h-[32px] rounded-[8px] inline-flex items-center justify-center transition-all duration-150 hover:bg-tint hover:text-primary-dark cursor-pointer"
                                title="ویرایش اطلاعات شاگرد"
                                aria-label="ویرایش"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              {/* Remove student button */}
                              <button
                                type="button"
                                onClick={() => handleOpenRemove(stu)}
                                className="row-action text-ink-faint w-[32px] h-[32px] rounded-[8px] inline-flex items-center justify-center transition-all duration-150 hover:bg-rose-500/10 hover:text-rose-600 cursor-pointer"
                                title="حذف از شاگردان من"
                                aria-label="حذف"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr className="empty-row">
                      <td
                        colSpan={7}
                        className="text-center text-ink-faint p-[40px] text-[14px]"
                      >
                        شاگردی با این مشخصات پیدا نشد
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pager */}
            <div className="pager flex items-center gap-[6px] justify-center p-[18px]">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                قبلی
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={cn(currentPage === pageNum && "active")}
                >
                  {toPersianDigits(pageNum)}
                </button>
              ))}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                بعدی
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* 1. Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-[4px] transition-opacity"
            onClick={() => setSelectedStudent(null)}
          />
          <div className="relative z-10 w-full max-w-[460px] rounded-[20px] border border-border bg-surface p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div className="flex items-center gap-3">
                {selectedStudent.avatarUrl ? (
                  <img
                    src={selectedStudent.avatarUrl}
                    alt={selectedStudent.name}
                    className="h-11 w-11 rounded-[12px] object-cover border border-border shrink-0"
                  />
                ) : (
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] font-bold text-white text-[15px]"
                    style={{ background: selectedStudent.avatarColor }}
                  >
                    {getInitials(selectedStudent.name)}
                  </span>
                )}
                <div>
                  <h3 className="text-[16px] font-extrabold text-ink">{selectedStudent.name}</h3>
                  <p className="text-[12px] text-ink-faint">
                    {selectedStudent.phone ? toPersianDigits(selectedStudent.phone) : `شناسه #${toPersianDigits(selectedStudent.id.slice(0, 8))}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-bg hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 py-2 text-[13.5px]">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-ink-faint">برنامه تمرینی:</span>
                <span className="font-bold text-ink">{selectedStudent.program}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-ink-faint">وضعیت عضویت:</span>
                <span className={cn("status", STATUS_MAP[selectedStudent.status]?.cls)}>
                  <span className="d"></span>
                  {STATUS_MAP[selectedStudent.status]?.label || selectedStudent.status}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-ink-faint">نرخ حضور:</span>
                <span className="font-bold text-primary-dark">٪{toPersianDigits(selectedStudent.attendanceRate)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-ink-faint">آخرین جلسه:</span>
                <span className="font-semibold text-ink">{selectedStudent.lastSession}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-ink-faint">سررسید عضویت:</span>
                <span className="font-semibold text-ink">{selectedStudent.dueDate}</span>
              </div>
              {selectedStudent.phone && (
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <span className="text-ink-faint">شماره تماس:</span>
                  <span className="font-semibold text-ink">{toPersianDigits(selectedStudent.phone)}</span>
                </div>
              )}
              {selectedStudent.notes && (
                <div className="flex flex-col gap-1 border-b border-border pb-2.5">
                  <span className="text-ink-faint">یادداشت مربی:</span>
                  <span className="text-[13px] text-ink bg-bg p-2.5 rounded-[10px] leading-relaxed">
                    {selectedStudent.notes}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleOpenRemove(selectedStudent)}
                className="btn btn-outline text-rose-600 hover:bg-rose-500/10 btn-sm"
              >
                <Trash2 className="h-4 w-4" />
                <span>حذف از شاگردان</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(selectedStudent)}
                  className="btn btn-outline btn-sm"
                >
                  <Pencil className="h-4 w-4" />
                  <span>ویرایش</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="btn btn-primary btn-sm"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-ink/50 backdrop-blur-[4px] transition-opacity"
            onClick={() => setEditingStudent(null)}
          />
          <div className="relative z-10 w-full max-w-[500px] rounded-[20px] border border-border bg-surface p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary/10 text-primary-dark">
                  <Pencil className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-[16px] font-extrabold text-ink">ویرایش اطلاعات شاگرد</h3>
                  <p className="text-[12px] text-ink-faint">به‌روزرسانی جزئیات، برنامه و وضعیت</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-bg hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 text-[13.5px]">
              {/* Profile Picture Change Section */}
              <div className="flex items-center gap-4 p-3 bg-bg rounded-[14px] border border-border">
                <div className="relative shrink-0">
                  {editForm.avatarUrl ? (
                    <img
                      src={editForm.avatarUrl}
                      alt={editForm.name}
                      className="w-16 h-16 rounded-[14px] object-cover border border-border shadow-sm"
                    />
                  ) : (
                    <span
                      className="flex w-16 h-16 items-center justify-center rounded-[14px] font-bold text-white text-[20px] shadow-sm"
                      style={{ background: editingStudent.avatarColor }}
                    >
                      {getInitials(editForm.name || editingStudent.name)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-ink">تصویر پروفایل شاگرد</div>
                  <div className="text-[11.5px] text-ink-faint">
                    تصویر جدید را انتخاب کرده یا در صورت تمایل تصویر فعلی را حذف کنید
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="file"
                      ref={avatarInputRef}
                      onChange={handleAvatarFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="btn btn-outline btn-sm text-[12px] h-[30px] px-3 flex items-center gap-1.5"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>تغییر تصویر</span>
                    </button>
                    {editForm.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditForm((prev) => ({ ...prev, avatarUrl: "" }));
                          if (avatarInputRef.current) avatarInputRef.current.value = "";
                        }}
                        className="btn btn-sm text-[12px] h-[30px] px-2.5 text-rose-600 hover:bg-rose-500/10 border border-rose-200 dark:border-rose-900"
                      >
                        حذف تصویر
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-bold text-ink-soft mb-1.5 block">
                  نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-[12px] border border-border bg-bg px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-bold text-ink-soft mb-1.5 block">
                    شماره تماس
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    className="w-full rounded-[12px] border border-border bg-bg px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-bold text-ink-soft mb-1.5 block">
                    وضعیت عضویت
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        status: e.target.value as "active" | "expiring" | "expired",
                      })
                    }
                    className="w-full rounded-[12px] border border-border bg-bg px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-primary"
                  >
                    <option value="active">فعال</option>
                    <option value="expiring">رو به اتمام</option>
                    <option value="expired">منقضی</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-bold text-ink-soft mb-1.5 block">
                  برنامه تمرینی
                </label>
                <input
                  type="text"
                  required
                  value={editForm.program}
                  onChange={(e) => setEditForm({ ...editForm, program: e.target.value })}
                  placeholder="مثال: حجم و هایپرتروفی — هفته ۳"
                  className="w-full rounded-[12px] border border-border bg-bg px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-bold text-ink-soft mb-1.5 block">
                    درصد حضور (٪)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editForm.attendanceRate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, attendanceRate: Number(e.target.value) })
                    }
                    className="w-full rounded-[12px] border border-border bg-bg px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-bold text-ink-soft mb-1.5 block">
                    سررسید عضویت
                  </label>
                  <input
                    type="text"
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    placeholder="مثال: ۱۴ آبان ۱۴۰۵"
                    className="w-full rounded-[12px] border border-border bg-bg px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-[13px] font-bold text-ink-soft mb-1.5 block">
                  آخرین جلسه
                </label>
                <input
                  type="text"
                  value={editForm.lastSession}
                  onChange={(e) => setEditForm({ ...editForm, lastSession: e.target.value })}
                  placeholder="مثال: امروز، دیروز، ۲ روز پیش"
                  className="w-full rounded-[12px] border border-border bg-bg px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[13px] font-bold text-ink-soft mb-1.5 block">
                  یادداشت‌های اختصاصی مربی
                </label>
                <textarea
                  rows={3}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="توضیحات تکمیلی درباره آسیب‌دیدگی، اهداف یا تغییر رژیم..."
                  className="w-full rounded-[12px] border border-border bg-bg p-3 text-[13.5px] text-ink outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="btn btn-outline btn-sm"
                >
                  انصراف
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  ذخیره تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Remove Confirmation Modal */}
      {removingStudent && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-ink/50 backdrop-blur-[4px] transition-opacity"
            onClick={() => setRemovingStudent(null)}
          />
          <div className="relative z-10 w-full max-w-[420px] rounded-[20px] border border-border bg-surface p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-rose-500/10 text-rose-600">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-[16px] font-extrabold text-ink">حذف از شاگردان من</h3>
                <p className="text-[12px] text-ink-faint">خروج شاگرد از لیست مربیگری</p>
              </div>
            </div>

            <p className="text-[13.5px] text-ink-soft leading-relaxed mb-6">
              آیا از حذف شاگرد{" "}
              <strong className="text-ink font-bold">«{removingStudent.name}»</strong> از لیست
              شاگردان خود اطمینان دارید؟ این عمل او را از لیست مربیگری شما خارج کرده و کارت‌های
              آمار داشبورد را به‌روزرسانی می‌کند.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRemovingStudent(null)}
                className="btn btn-outline btn-sm"
              >
                انصراف
              </button>
              <button
                type="button"
                disabled={isRemoving}
                onClick={handleConfirmRemove}
                className="btn btn-sm bg-rose-600 hover:bg-rose-700 text-white border-none flex items-center gap-1.5 disabled:opacity-50"
              >
                {isRemoving ? (
                  <span>در حال لغو انتساب...</span>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>بله، حذف کن</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Add Student Modal Window (calls Django POST /members/my-students/) */}
      <CoachAddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onStudentAdded={handleStudentAdded}
        coachName={coachName}
      />
    </div>
  );
}
