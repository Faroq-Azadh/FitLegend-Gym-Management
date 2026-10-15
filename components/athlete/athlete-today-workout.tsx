"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/persian-digits";

interface WorkoutItem {
  id: string;
  programId: string;
  name: string;
  group: string;
  sets: string;
  reps: string;
  done: boolean;
}

const DEFAULT_WORKOUT_ITEMS: WorkoutItem[] = [
  {
    id: "1",
    programId: "d1-ex1",
    name: "پرس سینه هالتر",
    group: "سینه · گرم‌کردن دقیق",
    sets: "۴",
    reps: "۸-۱۰",
    done: true,
  },
  {
    id: "2",
    programId: "d1-ex2",
    name: "پرس بالاسینه دمبل",
    group: "سینه",
    sets: "۳",
    reps: "۱۰-۱۲",
    done: true,
  },
  {
    id: "3",
    programId: "d1-ex3",
    name: "قفسه سینه سیم‌کش",
    group: "سینه",
    sets: "۳",
    reps: "۱۲-۱۵",
    done: false,
  },
  {
    id: "4",
    programId: "d1-ex4",
    name: "پشت‌بازو سیم‌کش",
    group: "پشت‌بازو",
    sets: "۴",
    reps: "۱۲",
    done: false,
  },
  {
    id: "5",
    programId: "d1-ex5",
    name: "نشر از جانب",
    group: "سرشانه",
    sets: "۳",
    reps: "۱۵",
    done: false,
  },
];

export function AthleteTodayWorkout() {
  const [exercises, setExercises] = useState<WorkoutItem[]>(DEFAULT_WORKOUT_ITEMS);

  // Sync with global program completed exercises in localStorage
  useEffect(() => {
    const syncFromStorage = () => {
      try {
        const saved = localStorage.getItem("fitlegend_program_completed");
        if (saved) {
          const completedMap: Record<string, boolean> = JSON.parse(saved);
          setExercises((prev) =>
            prev.map((item) => ({
              ...item,
              done: Boolean(completedMap[item.programId] ?? completedMap[item.id]),
            }))
          );
        }
      } catch {
        // Ignore localStorage parsing errors
      }
    };

    syncFromStorage();

    const handleSync = () => syncFromStorage();
    window.addEventListener("workout-progress-updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("workout-progress-updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const toggleDone = (item: WorkoutItem) => {
    const nextDone = !item.done;

    setExercises((prev) =>
      prev.map((ex) => (ex.id === item.id ? { ...ex, done: nextDone } : ex))
    );

    try {
      const saved = localStorage.getItem("fitlegend_program_completed");
      const completedMap: Record<string, boolean> = saved ? JSON.parse(saved) : {};
      completedMap[item.programId] = nextDone;
      completedMap[item.id] = nextDone;
      localStorage.setItem("fitlegend_program_completed", JSON.stringify(completedMap));
      window.dispatchEvent(new Event("workout-progress-updated"));
    } catch {
      // Ignore localStorage errors
    }
  };

  const completedCount = exercises.filter((e) => e.done).length;
  const totalCount = exercises.length;
  const isAllCompleted = completedCount === totalCount && totalCount > 0;

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3>تمرین امروز</h3>
          <div className="hint">سینه، پشت‌بازو و سرشانه</div>
        </div>
        <span
          className="pill"
          style={{
            background: isAllCompleted ? "var(--tint)" : undefined,
            color: isAllCompleted ? "var(--primary-dark)" : undefined,
            fontWeight: 700,
            transition: "all 0.2s ease",
          }}
        >
          {isAllCompleted
            ? `✓ تمام حرکات انجام شد (${toPersianDigits(completedCount)} از ${toPersianDigits(totalCount)})`
            : `${toPersianDigits(completedCount)} از ${toPersianDigits(totalCount)} انجام شد`}
        </span>
      </div>
      <div className="card-body" style={{ paddingTop: "8px" }}>
        {exercises.map((item) => (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => toggleDone(item)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleDone(item);
              }
            }}
            className={cn("wk-row", item.done && "done")}
            style={{ cursor: "pointer", userSelect: "none" }}
            title={item.done ? "برای لغو انجام حرکت کلیک کنید" : "برای علامت‌گذاری انجام حرکت کلیک کنید"}
          >
            <span className="wk-check" style={{ pointerEvents: "none" }}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m5 12 5 5L20 7" />
              </svg>
            </span>
            <div className="wk-info" style={{ pointerEvents: "none" }}>
              <div className="nm">{item.name}</div>
              <div className="gr">{item.group}</div>
            </div>
            <div className="wk-meta" style={{ pointerEvents: "none" }}>
              <div className="s">{toPersianDigits(item.sets)} × {toPersianDigits(item.reps)}</div>
              <div className="l">ست × تکرار</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
