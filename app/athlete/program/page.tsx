"use client";

import { useState, useEffect } from "react";
import { toPersianDigits } from "@/lib/persian-digits";
import { AthleteSidebar } from "@/components/athlete/athlete-sidebar";
import { AthleteTopbar } from "@/components/athlete/athlete-topbar";

interface ExerciseItem {
  id: string;
  legacyId?: string;
  name: string;
  muscle: string;
  sets: string;
  reps: string;
  rest: string;
  targetWeight: string;
}

interface ProgramDayData {
  id: string;
  tabKey: "d1" | "d2" | "d3";
  title: string;
  subtitle: string;
  exercisesCountText: string;
  exercises: ExerciseItem[];
}

const PROGRAM_DAYS_DATA: ProgramDayData[] = [
  {
    id: "day-1",
    tabKey: "d1",
    title: "حرکات روز ۱",
    subtitle: "سینه، پشت‌بازو و سرشانه",
    exercisesCountText: "۵ حرکت",
    exercises: [
      {
        id: "d1-ex1",
        legacyId: "1",
        name: "پرس سینه هالتر",
        muscle: "سینه",
        sets: "۴ ست",
        reps: "۸-۱۰ تکرار",
        rest: "۹۰ ثانیه استراحت",
        targetWeight: "۶۰ کیلو",
      },
      {
        id: "d1-ex2",
        legacyId: "2",
        name: "پرس بالاسینه دمبل",
        muscle: "سینه",
        sets: "۳ ست",
        reps: "۱۰-۱۲ تکرار",
        rest: "۷۵ ثانیه استراحت",
        targetWeight: "۲۲ کیلو",
      },
      {
        id: "d1-ex3",
        legacyId: "3",
        name: "قفسه سینه سیم‌کش",
        muscle: "سینه",
        sets: "۳ ست",
        reps: "۱۲-۱۵ تکرار",
        rest: "۶۰ ثانیه استراحت",
        targetWeight: "۱۵ کیلو",
      },
      {
        id: "d1-ex4",
        legacyId: "4",
        name: "پشت‌بازو سیم‌کش",
        muscle: "پشت‌بازو",
        sets: "۴ ست",
        reps: "۱۲ تکرار",
        rest: "۶۰ ثانیه استراحت",
        targetWeight: "۲۵ کیلو",
      },
      {
        id: "d1-ex5",
        legacyId: "5",
        name: "نشر از جانب",
        muscle: "سرشانه",
        sets: "۳ ست",
        reps: "۱۵ تکرار",
        rest: "۴۵ ثانیه استراحت",
        targetWeight: "۸ کیلو",
      },
    ],
  },
  {
    id: "day-2",
    tabKey: "d2",
    title: "حرکات روز ۲",
    subtitle: "چهارسر، همسترینگ و ساق",
    exercisesCountText: "۴ حرکت",
    exercises: [
      {
        id: "d2-ex1",
        name: "اسکوات هالتر",
        muscle: "چهارسر",
        sets: "۴ ست",
        reps: "۸ تکرار",
        rest: "۱۲۰ ثانیه استراحت",
        targetWeight: "۸۰ کیلو",
      },
      {
        id: "d2-ex2",
        name: "پرس پا دستگاه",
        muscle: "چهارسر",
        sets: "۳ ست",
        reps: "۱۲ تکرار",
        rest: "۹۰ ثانیه استراحت",
        targetWeight: "۱۲۰ کیلو",
      },
      {
        id: "d2-ex3",
        name: "پشت پا خوابیده",
        muscle: "همسترینگ",
        sets: "۳ ست",
        reps: "۱۲ تکرار",
        rest: "۶۰ ثانیه استراحت",
        targetWeight: "۳۵ کیلو",
      },
      {
        id: "d2-ex4",
        name: "ساق پا ایستاده",
        muscle: "ساق",
        sets: "۴ ست",
        reps: "۱۵-۲۰ تکرار",
        rest: "۴۵ ثانیه استراحت",
        targetWeight: "۴۰ کیلو",
      },
    ],
  },
  {
    id: "day-3",
    tabKey: "d3",
    title: "حرکات روز ۳",
    subtitle: "پشت و جلوبازو",
    exercisesCountText: "۴ حرکت",
    exercises: [
      {
        id: "d3-ex1",
        name: "ددلیفت",
        muscle: "پشت",
        sets: "۴ ست",
        reps: "۶-۸ تکرار",
        rest: "۱۲۰ ثانیه استراحت",
        targetWeight: "۹۰ کیلو",
      },
      {
        id: "d3-ex2",
        name: "بارفیکس",
        muscle: "پشت",
        sets: "۳ ست",
        reps: "تا واماندگی تکرار",
        rest: "۹۰ ثانیه استراحت",
        targetWeight: "وزن بدن",
      },
      {
        id: "d3-ex3",
        name: "زیربغل سیم‌کش",
        muscle: "پشت",
        sets: "۳ ست",
        reps: "۱۰-۱۲ تکرار",
        rest: "۷۵ ثانیه استراحت",
        targetWeight: "۵۵ کیلو",
      },
      {
        id: "d3-ex4",
        name: "جلوبازو هالتر",
        muscle: "جلوبازو",
        sets: "۴ ست",
        reps: "۱۰ تکرار",
        rest: "۶۰ ثانیه استراحت",
        targetWeight: "۳۰ کیلو",
      },
    ],
  },
];

export default function AthleteProgramPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"d1" | "d2" | "d3">("d1");
  const [searchQuery, setSearchQuery] = useState("");
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});

  // Load completed exercises from localStorage on mount & listen to sync events
  useEffect(() => {
    const loadSaved = () => {
      try {
        const saved = localStorage.getItem("titan_program_completed");
        if (saved) {
          setCompletedExercises(JSON.parse(saved));
        } else {
          // Default initial state: first 2 exercises done (as in reference UI)
          const defaultState: Record<string, boolean> = {
            "d1-ex1": true,
            "1": true,
            "d1-ex2": true,
            "2": true,
          };
          setCompletedExercises(defaultState);
          localStorage.setItem("titan_program_completed", JSON.stringify(defaultState));
        }
      } catch {
        // Ignore localStorage errors
      }
    };

    loadSaved();

    const handleSync = () => loadSaved();
    window.addEventListener("workout-progress-updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("workout-progress-updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const toggleExerciseDone = (exercise: ExerciseItem) => {
    setCompletedExercises((prev) => {
      const willBeDone = !prev[exercise.id];
      const updated = {
        ...prev,
        [exercise.id]: willBeDone,
      };

      if (exercise.legacyId) {
        updated[exercise.legacyId] = willBeDone;
      }

      try {
        localStorage.setItem("titan_program_completed", JSON.stringify(updated));
        window.dispatchEvent(new Event("workout-progress-updated"));
      } catch {
        // Ignore localStorage errors
      }
      return updated;
    });
  };

  const handleDownloadPdf = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const q = searchQuery.trim().toLowerCase();

  // Dynamic progress calculation logic
  const allExercises = PROGRAM_DAYS_DATA.flatMap((d) => d.exercises);
  const totalExercisesCount = allExercises.length; // 13 exercises
  const totalCompletedCount = allExercises.filter((ex) => Boolean(completedExercises[ex.id])).length;

  const progressPercent = totalExercisesCount > 0
    ? Math.round((totalCompletedCount / totalExercisesCount) * 100)
    : 0;

  return (
    <div className="app">
      {/* Athlete Sidebar */}
      <AthleteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Scrim overlay for mobile */}
      <div
        className={`scrim ${sidebarOpen ? "show" : ""}`}
        id="scrim"
        onClick={() => setSidebarOpen(false)}
      />

      <div className="main">
        {/* Topbar: Exactly like dashboard athlete panel */}
        <AthleteTopbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onSearchChange={(val) => setSearchQuery(val)}
        />

        <main className="content">
          {/* Print only header: shows ONLY when downloading PDF/printing */}
          <div className="print-header" style={{ display: "none" }}>
            <h1>برنامه‌ی تمرینی — لیست حرکات</h1>
            <p>برنامه‌ی حجم اختصاصی تیتان · ۳ روز در هفته</p>
          </div>

          {/* Page Head (hidden in print) */}
          <div className="page-head print-hidden">
            <div>
              <h1>برنامه‌ی تمرین من</h1>
              <div className="sub">برنامه‌ی اختصاصی شما از مربی آرش رستمی</div>
            </div>
            <div className="page-head-actions">
              <button
                className="btn btn-outline btn-sm"
                type="button"
                onClick={handleDownloadPdf}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="m7 10 5 5 5-5M12 15V3" />
                </svg>
                دانلود PDF
              </button>
            </div>
          </div>

          {/* Program info Card (hidden in PDF download) */}
          <div
            className="card program-info-card print-hidden"
            style={{ marginBottom: "18px", width: "100%" }}
          >
            <div className="card-body">
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ flex: 1, minWidth: "240px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--ink)" }}>
                      برنامه‌ی حجم ۸ هفته‌ای
                    </h3>
                    <span className="tag">عضله‌سازی</span>
                    <span className="tag cyan">سطح متوسط</span>
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "var(--ink-faint)",
                      marginTop: "8px",
                    }}
                  >
                    ۳ روز در هفته · هر جلسه حدود ۶۵ دقیقه
                  </div>
                  <div style={{ maxWidth: "380px" }}>
                    {/* Dynamic Real-time Progress Bar */}
                    <div className="prog-bar">
                      <div
                        className="prog-fill"
                        style={{
                          width: `${progressPercent}%`,
                          transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--ink-faint)",
                        marginTop: "6px",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>
                        هفته ۳ از ۸ · ٪{toPersianDigits(progressPercent)} پیشرفت
                      </span>
                      <span>
                        {toPersianDigits(totalCompletedCount)} از {toPersianDigits(totalExercisesCount)} حرکت
                      </span>
                    </div>
                  </div>
                </div>
                {/* Coach card with NO border and NO underline under coach name */}
                <div
                  className="coach-card no-border"
                  style={{
                    border: "none",
                    borderBottom: "none",
                    padding: 0,
                    margin: 0,
                    textDecoration: "none",
                  }}
                >
                  <span className="av">آر</span>
                  <div>
                    <div
                      className="nm"
                      style={{
                        textDecoration: "none",
                        border: "none",
                        borderBottom: "none",
                      }}
                    >
                      آرش رستمی
                    </div>
                    <div className="rl">مربی شما</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Day tabs (hidden in PDF download) */}
          <div
            className="tabs-bar print-hidden"
            id="dayTabs"
            style={{
              width: "100%",
              maxWidth: "100%",
              margin: "0 0 18px 0",
              marginLeft: 0,
              marginRight: 0,
              boxSizing: "border-box",
            }}
          >
            {PROGRAM_DAYS_DATA.map((day) => {
              const dayDone = day.exercises.filter((ex) => Boolean(completedExercises[ex.id])).length;
              const isFullDone = dayDone === day.exercises.length && day.exercises.length > 0;
              return (
                <span
                  key={day.tabKey}
                  className={`tab ${activeTab === day.tabKey ? "active" : ""}`}
                  onClick={() => setActiveTab(day.tabKey)}
                  role="button"
                  tabIndex={0}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  {day.tabKey === "d1" && "روز ۱ — سینه و بازو"}
                  {day.tabKey === "d2" && "روز ۲ — پا"}
                  {day.tabKey === "d3" && "روز ۳ — پشت و جلوبازو"}
                  {dayDone > 0 && (
                    <span
                      style={{
                        marginRight: "6px",
                        fontSize: "11px",
                        padding: "1px 7px",
                        borderRadius: "100px",
                        background: isFullDone ? "var(--primary-dark)" : "var(--tint)",
                        color: isFullDone ? "#fff" : "var(--primary-dark)",
                        fontWeight: 800,
                        transition: "all 0.2s ease",
                      }}
                    >
                      {toPersianDigits(dayDone)}/{toPersianDigits(day.exercises.length)}
                    </span>
                  )}
                </span>
              );
            })}
          </div>

          {/* Day Panels: width of panel.active is 100% equal to card */}
          {PROGRAM_DAYS_DATA.map((dayData) => {
            const isActive = activeTab === dayData.tabKey;
            const filteredExercises = dayData.exercises.filter((ex) => {
              if (!q) return true;
              return (
                ex.name.toLowerCase().includes(q) ||
                ex.muscle.toLowerCase().includes(q) ||
                ex.targetWeight.toLowerCase().includes(q)
              );
            });

            const dayCompletedCount = dayData.exercises.filter((ex) => Boolean(completedExercises[ex.id])).length;
            const dayTotalCount = dayData.exercises.length;
            const isDayAllDone = dayCompletedCount === dayTotalCount && dayTotalCount > 0;

            return (
              <div
                key={dayData.id}
                className={`panel ${isActive ? "active" : ""}`}
                data-panel={dayData.tabKey}
                style={{ width: "100%", maxWidth: "100%", padding: 0, margin: 0 }}
              >
                <div className="card" style={{ width: "100%" }}>
                  <div className="card-head">
                    <div>
                      <h3>{dayData.title}</h3>
                      <div className="hint">{dayData.subtitle}</div>
                    </div>
                    <span
                      className="pill"
                      style={{
                        background: isDayAllDone ? "var(--tint)" : undefined,
                        color: isDayAllDone ? "var(--primary-dark)" : undefined,
                        fontWeight: 700,
                        transition: "all 0.2s ease",
                      }}
                    >
                      {q
                        ? `${toPersianDigits(filteredExercises.length)} حرکت یافت شد`
                        : isDayAllDone
                        ? `✓ تمام حرکات انجام شد (${toPersianDigits(dayCompletedCount)} از ${toPersianDigits(dayTotalCount)})`
                        : `${toPersianDigits(dayCompletedCount)} از ${toPersianDigits(dayTotalCount)} انجام شد`}
                    </span>
                  </div>
                  <div className="card-body" style={{ paddingTop: "8px" }}>
                    {filteredExercises.length === 0 ? (
                      <div
                        style={{
                          padding: "24px 0",
                          textAlign: "center",
                          color: "var(--ink-faint)",
                          fontSize: "14px",
                        }}
                      >
                        حرکتی با عبارت «{searchQuery}» در این روز یافت نشد.
                      </div>
                    ) : (
                      filteredExercises.map((exercise) => {
                        const isDone = Boolean(completedExercises[exercise.id]);

                        return (
                          <div
                            key={exercise.id}
                            className={`wk-row ${isDone ? "done" : ""}`}
                            onClick={() => toggleExerciseDone(exercise)}
                            role="button"
                            tabIndex={0}
                            title={isDone ? "برای لغو انجام حرکت کلیک کنید" : "برای علامت‌گذاری انجام حرکت کلیک کنید"}
                            style={{ cursor: "pointer", userSelect: "none" }}
                          >
                            <span className="wk-check">
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
                            <div className="wk-info">
                              <div className="nm">{exercise.name}</div>
                              <div className="det">
                                {exercise.muscle} · <b>{exercise.sets}</b> · {exercise.reps} · {exercise.rest}
                              </div>
                            </div>
                            <div className="wk-meta">
                              <div className="s">{exercise.targetWeight}</div>
                              <div className="l">وزن هدف</div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </main>
      </div>
    </div>
  );
}
