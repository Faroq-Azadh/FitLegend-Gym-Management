"use client";

import { useState, useEffect } from "react";
import { useCreateClass, useUpdateClass, useDeleteClass } from "@/lib/hooks/queries/use-classes";
import { useGymClasses, saveLocalClassMeta, DAYS_REV_MAP } from "@/lib/hooks/use-gym-classes";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { ClassesKpi } from "@/components/admin/classes/classes-kpi";
import { ClassesTimetable } from "@/components/admin/classes/classes-timetable";
import { ClassesDayView } from "@/components/admin/classes/classes-day-view";
import { ClassesListView } from "@/components/admin/classes/classes-list-view";
import { ClassDetailModal } from "@/components/admin/classes/class-detail-modal";
import { NewClassModal } from "@/components/admin/classes/new-class-modal";
import {
  ClassSession,
  ClassMember,
  DayOfWeek,
  TimeSlot,
} from "@/components/admin/classes/types";
import {
  saveClassRoster,
  purgeDisallowedMembersFromAllClassRosters,
  ROSTER_UPDATED_EVENT,
} from "@/components/admin/classes/roster-store";
import {
  markClassAsDeleted,
  unmarkClassAsDeleted,
} from "@/lib/api/services/classes.service";
import { cn } from "@/lib/utils";

import { toPersianDigits, normalizeDigits } from "@/lib/persian-digits";
import { logActivity } from "@/lib/activities-store";

type ViewMode = "month" | "week" | "day";

export default function AdminClassesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSession | null>(null);
  const [defaultSlot, setDefaultSlot] = useState<{
    day: DayOfWeek;
    time: TimeSlot;
  }>({ day: "شنبه", time: "۰۸:۰۰" });

  const { classes, allGymMembers, refetch } = useGymClasses();
  const createClassMutation = useCreateClass();
  const updateClassMutation = useUpdateClass();
  const deleteClassMutation = useDeleteClass();

  // Keep class rosters synchronized with live gym members list
  useEffect(() => {
    if (allGymMembers && allGymMembers.length > 0) {
      purgeDisallowedMembersFromAllClassRosters(allGymMembers);
    } else {
      purgeDisallowedMembersFromAllClassRosters();
    }
  }, [allGymMembers]);

  const handleUpdateMembers = (classId: string, updatedMembers: ClassMember[]) => {
    saveClassRoster(classId, updatedMembers);
    setSelectedClass((prev) => {
      if (!prev || prev.id !== classId) return prev;
      return {
        ...prev,
        enrolled: updatedMembers.length,
        members: updatedMembers,
      };
    });
  };

  // KPIs Calculations
  const activeClassesCount = classes.length;
  const uniqueCoaches = new Set(classes.map((c) => c.coach)).size;
  const totalCapacity = classes.reduce((sum, c) => sum + c.capacity, 0);
  const totalEnrolled = classes.reduce((sum, c) => sum + c.enrolled, 0);
  const avgCapacityPercent =
    totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;
  const fullClassesCount = classes.filter((c) => c.enrolled >= c.capacity).length;

  const handleSaveClass = async (
    classData: Omit<ClassSession, "id">,
    editId?: string,
  ) => {
    const day_of_week = DAYS_REV_MAP[classData.day] ?? 0;

    // Normalize start_time to HH:MM:SS
    const cleanTime = normalizeDigits(classData.time || "08:00").trim();
    const parts = cleanTime.split(":");
    const hh = (parts[0] || "08").padStart(2, "0");
    const mm = (parts[1] || "00").padStart(2, "0");
    const startTimeFormatted = `${hh}:${mm}:00`;

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validCoachId = classData.coachId && UUID_REGEX.test(classData.coachId) ? classData.coachId : null;

    const payload = {
      title: classData.name.trim(),
      coach: validCoachId,
      day_of_week,
      start_time: startTimeFormatted,
      duration_minutes: classData.durationMinutes || 60,
      capacity: classData.capacity || 20,
      is_active: true,
    };

    if (editId) {
      unmarkClassAsDeleted(editId);
      saveLocalClassMeta(editId, {
        category: classData.category,
        coachName: classData.coach,
        theme: classData.theme,
        room: classData.room,
        level: classData.level,
        description: classData.description,
      });

      await updateClassMutation.mutateAsync({
        id: editId,
        payload,
      });

      if (selectedClass?.id === editId || editingClass?.id === editId) {
        setSelectedClass({ ...classData, id: editId });
      }
    } else {
      const res = await createClassMutation.mutateAsync(payload);
      if (res?.id) {
        unmarkClassAsDeleted(String(res.id));
        saveLocalClassMeta(String(res.id), {
          category: classData.category,
          coachName: classData.coach,
          theme: classData.theme,
          room: classData.room,
          level: classData.level,
          description: classData.description,
        });
      }
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (typeof window !== "undefined" && window.confirm("آیا از حذف این کلاس اطمینان دارید؟")) {
      const clsToDelete = classes.find((c) => c.id === id);
      markClassAsDeleted(id);
      try {
        localStorage.removeItem(`fitlegend_gym_class_roster_${id}`);
      } catch {}
      try {
        await deleteClassMutation.mutateAsync(id);
        logActivity({
          type: "ALERT",
          text: `حذف کلاس «${clsToDelete?.name || "ورزشی"}» از برنامه هفتگی`,
        });
      } catch {
        // Handled
      }
      if (selectedClass?.id === id) {
        setSelectedClass(null);
      }
    }
  };

  const handleAddAtSlot = (day: DayOfWeek, time: TimeSlot) => {
    setEditingClass(null);
    setDefaultSlot({ day, time });
    setIsAddModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-bg text-ink">
      {/* Sidebar Navigation */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar Header */}
        <AdminTopbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          searchPlaceholder="جستجو در کلاس‌ها، مربیان…"
        />

        {/* Page Content */}
        <main className="flex-1 p-[18px] min-[640px]:p-[28px]">
          {/* Page Head */}
          <div className="mb-[24px] flex flex-wrap items-end justify-between gap-[16px]">
            <div>
              <h1 className="text-[22px] font-extrabold tracking-[-0.01em] text-ink min-[640px]:text-[26px]">
                کلاس‌ها و تقویم
              </h1>
              <div className="mt-[5px] text-[14px] text-ink-faint">
                برنامه‌ی هفتگی کلاس‌های گروهی باشگاه
              </div>
            </div>

            <div className="flex items-center gap-[10px]">
              {/* Segmented control: ماه / هفته / روز */}
              <div className="inline-flex rounded-[10px] border border-border bg-bg p-[3px]">
                <button
                  type="button"
                  onClick={() => setViewMode("month")}
                  className={cn(
                    "rounded-[7px] px-[14px] py-[6px] text-[13px] font-bold transition-all duration-150",
                    viewMode === "month"
                      ? "bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                      : "text-ink-soft hover:text-ink",
                  )}
                >
                  ماه
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("week")}
                  className={cn(
                    "rounded-[7px] px-[14px] py-[6px] text-[13px] font-bold transition-all duration-150",
                    viewMode === "week"
                      ? "bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                      : "text-ink-soft hover:text-ink",
                  )}
                >
                  هفته
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("day")}
                  className={cn(
                    "rounded-[7px] px-[14px] py-[6px] text-[13px] font-bold transition-all duration-150",
                    viewMode === "day"
                      ? "bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                      : "text-ink-soft hover:text-ink",
                  )}
                >
                  روز
                </button>
              </div>

              {/* Add class button */}
              <button
                type="button"
                onClick={() => {
                  setEditingClass(null);
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-[8px] rounded-[10px] bg-ink px-[14px] py-[8px] text-[13px] font-bold text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary-dark hover:shadow-[0_20px_50px_rgba(22,224,160,0.25)] active:translate-y-0"
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
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>کلاس جدید</span>
              </button>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <ClassesKpi
            activeClassesCount={activeClassesCount}
            activeCoachesCount={uniqueCoaches}
            avgCapacityPercent={avgCapacityPercent}
            fullClassesCount={fullClassesCount}
          />

          {/* Active View: Week Timetable, Day View, or List/Month View */}
          {viewMode === "week" && (
            <ClassesTimetable
              classes={classes}
              onSelectClass={(cls) => setSelectedClass(cls)}
              onAddClassAtSlot={handleAddAtSlot}
            />
          )}

          {viewMode === "day" && (
            <ClassesDayView
              classes={classes}
              onSelectClass={(cls) => setSelectedClass(cls)}
              onAddNewClass={() => {
                setEditingClass(null);
                setIsAddModalOpen(true);
              }}
            />
          )}

          {viewMode === "month" && (
            <ClassesListView
              classes={classes}
              onSelectClass={(cls) => setSelectedClass(cls)}
              onEditClass={(cls) => {
                setEditingClass(cls);
                setIsAddModalOpen(true);
              }}
              onDeleteClass={handleDeleteClass}
            />
          )}
        </main>
      </div>

      {/* Class Detail Modal */}
      <ClassDetailModal
        cls={selectedClass}
        isOpen={Boolean(selectedClass)}
        onClose={() => setSelectedClass(null)}
        onEdit={(cls) => {
          setEditingClass(cls);
          setIsAddModalOpen(true);
        }}
        onDelete={handleDeleteClass}
        onUpdateMembers={handleUpdateMembers}
      />

      {/* New / Edit Class Modal */}
      <NewClassModal
        isOpen={isAddModalOpen}
        editClass={editingClass}
        defaultDay={defaultSlot.day}
        defaultTime={defaultSlot.time}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingClass(null);
        }}
        onSave={handleSaveClass}
      />
    </div>
  );
}
