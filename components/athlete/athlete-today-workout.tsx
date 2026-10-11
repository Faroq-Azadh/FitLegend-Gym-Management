"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/persian-digits";

interface WorkoutItem {
  id: string;
  name: string;
  group: string;
  sets: string;
  reps: string;
  done: boolean;
}

const DEFAULT_WORKOUT_ITEMS: WorkoutItem[] = [
  {
    id: "1",
    name: "پرس سینه هالتر",
    group: "سینه · گرم‌کردن دقیق",
    sets: "۴",
    reps: "۸-۱۰",
    done: true,
  },
  {
    id: "2",
    name: "پرس بالاسینه دمبل",
    group: "سینه",
    sets: "۳",
    reps: "۱۰-۱۲",
    done: true,
  },
  {
    id: "3",
    name: "قفسه سینه سیم‌کش",
    group: "سینه",
    sets: "۳",
    reps: "۱۲-۱۵",
    done: false,
  },
  {
    id: "4",
    name: "پشت‌بازو سیم‌کش",
    group: "پشت‌بازو",
    sets: "۴",
    reps: "۱۲",
    done: false,
  },
  {
    id: "5",
    name: "نشر از جانب",
    group: "سرشانه",
    sets: "۳",
    reps: "۱۵",
    done: false,
  },
];

export function AthleteTodayWorkout() {
  const [exercises, setExercises] = useState<WorkoutItem[]>(DEFAULT_WORKOUT_ITEMS);

  const toggleDone = (id: string) => {
    setExercises((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  };

  const completedCount = exercises.filter((e) => e.done).length;
  const totalCount = exercises.length;

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3>تمرین امروز</h3>
          <div className="hint">سینه، پشت‌بازو و سرشانه</div>
        </div>
        <span className="pill">
          {toPersianDigits(completedCount)} از {toPersianDigits(totalCount)} انجام شد
        </span>
      </div>
      <div className="card-body" style={{ paddingTop: "8px" }}>
        {exercises.map((item) => (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => toggleDone(item.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleDone(item.id);
              }
            }}
            className={cn("wk-row", item.done && "done")}
            style={{ cursor: "pointer", userSelect: "none" }}
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
