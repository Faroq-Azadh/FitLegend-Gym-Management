"use client";

import { useEffect, useState } from "react";
import { getCurrentUserScope } from "./session-scope";

export interface StudentOverride {
  name?: string;
  phone?: string;
  program?: string;
  status?: "active" | "expiring" | "expired";
  attendanceRate?: number;
  lastSession?: string;
  dueDate?: string;
  notes?: string;
  avatarUrl?: string;
}

export interface CustomStudent {
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

interface CoachStoreState {
  removedIds: string[];
  overrides: Record<string, StudentOverride>;
  customStudents: CustomStudent[];
}

const STORAGE_PREFIX = "fitlegend_coach_students_store_";
const SYNC_EVENT = "fitlegend_coach_students_changed";

function getStorageKey(coachScope?: string): string {
  const scope = coachScope || getCurrentUserScope() || "default";
  return `${STORAGE_PREFIX}${scope}`;
}

export function getCoachStudentsStore(coachScope?: string): CoachStoreState {
  if (typeof window === "undefined") {
    return { removedIds: [], overrides: {}, customStudents: [] };
  }
  try {
    const raw = localStorage.getItem(getStorageKey(coachScope));
    if (!raw) return { removedIds: [], overrides: {}, customStudents: [] };
    const parsed = JSON.parse(raw);
    return {
      removedIds: Array.isArray(parsed.removedIds) ? parsed.removedIds : [],
      overrides: parsed.overrides && typeof parsed.overrides === "object" ? parsed.overrides : {},
      customStudents: Array.isArray(parsed.customStudents) ? parsed.customStudents : [],
    };
  } catch {
    return { removedIds: [], overrides: {}, customStudents: [] };
  }
}

export function saveCoachStudentsStore(state: CoachStoreState, coachScope?: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(coachScope), JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  } catch (err) {
    console.error("Failed to save coach students store:", err);
  }
}

export function removeStudentFromCoach(studentId: string, coachScope?: string): void {
  const current = getCoachStudentsStore(coachScope);
  const updatedRemoved = current.removedIds.includes(studentId)
    ? current.removedIds
    : [...current.removedIds, studentId];
  const updatedCustom = current.customStudents.filter((s) => s.id !== studentId);

  saveCoachStudentsStore(
    {
      ...current,
      removedIds: updatedRemoved,
      customStudents: updatedCustom,
    },
    coachScope
  );
}

export function updateCoachStudentOverride(
  studentId: string,
  override: StudentOverride,
  coachScope?: string
): void {
  const current = getCoachStudentsStore(coachScope);
  const existingOverride = current.overrides[studentId] || {};
  const mergedOverride = { ...existingOverride, ...override };

  // Also update custom student if present
  const updatedCustom = current.customStudents.map((cs) => {
    if (cs.id === studentId) {
      return {
        ...cs,
        ...(override.name ? { name: override.name } : {}),
        ...(override.phone !== undefined ? { phone: override.phone } : {}),
        ...(override.program ? { program: override.program } : {}),
        ...(override.status ? { status: override.status } : {}),
        ...(override.attendanceRate !== undefined ? { attendanceRate: override.attendanceRate } : {}),
        ...(override.lastSession ? { lastSession: override.lastSession } : {}),
        ...(override.dueDate ? { dueDate: override.dueDate } : {}),
        ...(override.notes !== undefined ? { notes: override.notes } : {}),
        ...(override.avatarUrl !== undefined ? { avatarUrl: override.avatarUrl } : {}),
      };
    }
    return cs;
  });

  saveCoachStudentsStore(
    {
      ...current,
      overrides: {
        ...current.overrides,
        [studentId]: mergedOverride,
      },
      customStudents: updatedCustom,
    },
    coachScope
  );
}

export function addCustomCoachStudent(student: CustomStudent, coachScope?: string): void {
  const current = getCoachStudentsStore(coachScope);
  // Ensure not in removedIds
  const updatedRemoved = current.removedIds.filter((id) => id !== student.id);
  // Add to customStudents, filtering by id and normalized name to avoid duplicate records
  const normName = student.name.trim().toLowerCase();
  const filtered = current.customStudents.filter(
    (s) => s.id !== student.id && s.name.trim().toLowerCase() !== normName
  );
  const updatedCustom = [student, ...filtered];

  saveCoachStudentsStore(
    {
      ...current,
      removedIds: updatedRemoved,
      customStudents: updatedCustom,
    },
    coachScope
  );
}

export function sanitizeCustomStudents(
  backendStudents: any[] | undefined,
  coachScope?: string
): void {
  if (!Array.isArray(backendStudents)) return;
  const store = getCoachStudentsStore(coachScope);

  const backendIds = new Set(backendStudents.map((b) => b.id));
  const backendNames = new Set(
    backendStudents.map((b) => b.full_name?.trim().toLowerCase()).filter(Boolean)
  );

  // 1. Purge any backend student IDs from removedIds:
  // If Django returns this student, Django is the ground truth that they ARE assigned to this coach!
  const cleanedRemovedIds = (store.removedIds || []).filter((id) => !backendIds.has(id));

  // 2. Prune duplicate custom students that already exist in backend
  const filteredCustom = (store.customStudents || []).filter(
    (cs) =>
      !backendIds.has(cs.id) &&
      !backendNames.has(cs.name?.trim().toLowerCase())
  );

  if (
    cleanedRemovedIds.length !== (store.removedIds || []).length ||
    filteredCustom.length !== (store.customStudents || []).length
  ) {
    saveCoachStudentsStore(
      {
        ...store,
        removedIds: cleanedRemovedIds,
        customStudents: filteredCustom,
      },
      coachScope
    );
  }
}

export function useCoachStudentsSync(): number {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const handleSync = () => setVersion((v) => v + 1);
    window.addEventListener(SYNC_EVENT, handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener(SYNC_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  return version;
}
