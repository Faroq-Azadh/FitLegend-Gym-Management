"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CoachSidebar } from "@/components/coach/coach-sidebar";
import { CoachTopbar } from "@/components/coach/coach-topbar";
import { toPersianDigits } from "@/lib/persian-digits";
import { cn } from "@/lib/utils";
import {
  Check,
  Search,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Calendar,
} from "lucide-react";

interface AttendanceClass {
  id: number;
  name: string;
  days: number[]; // 0=Sat, 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu
  time: string;
  dur: number;
  cap: number;
  enrolled: number;
  off: number;
}

interface Member {
  id: number;
  name: string;
  flag: "warn" | "bad" | "";
}

interface SessionAttendanceState {
  marks: Record<number, "p" | "l" | "a">;
  note: string;
  saved: boolean;
}

const DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه"];
const COL = ["#0F172A", "#0FBF87", "#0891B2", "#D97706", "#E11D48", "#6366F1"];
const NAMES = [
  "سارا محمدی", "امیر صادقی", "رضا کاظمی", "مینا تهرانی", "کیان راد", "نیلوفر عباسی",
  "پارسا نوری", "الهام فرهادی", "دانیال کریمی", "سحر مرادی", "بهار حسینی", "علی زارعی",
  "هانیه صالحی", "محمدرضا ایزدی", "ملیکا رحیمی", "آریا طاهری", "یگانه سعیدی", "ماهان قاسمی",
  "نگار شفیعی", "سینا بهرامی", "ترانه کیانی", "احسان فتحی", "پریسا جعفری", "وحید منصوری"
];

const INITIAL_CLASSES: AttendanceClass[] = [
  { id: 1, name: "بدنسازی صبحگاهی", days: [0, 2, 4], time: "08:00", dur: 60, cap: 20, enrolled: 12, off: 0 },
  { id: 2, name: "قدرتی پیشرفته", days: [0, 3], time: "10:00", dur: 45, cap: 10, enrolled: 10, off: 5 },
  { id: 3, name: "TRX", days: [2, 5], time: "17:00", dur: 50, cap: 12, enrolled: 8, off: 9 },
  { id: 4, name: "بدنسازی شبانه", days: [1, 3], time: "19:30", dur: 75, cap: 20, enrolled: 14, off: 2 },
  { id: 5, name: "کراس‌فیت مبتدی", days: [5], time: "09:00", dur: 60, cap: 16, enrolled: 11, off: 13 },
];

const getRoster = (c: AttendanceClass): Member[] => {
  return Array.from({ length: c.enrolled }, (_, i) => {
    const idx = (c.off + i) % NAMES.length;
    return {
      id: idx,
      name: NAMES[idx],
      flag: idx % 11 === 4 ? "warn" : idx % 17 === 7 ? "bad" : "",
    };
  });
};

const seed = (m: number, d: number, c: number): "p" | "l" | "a" => {
  const r = (m * 7 + d * 3 + c * 5) % 10;
  return r < 7 ? "p" : r < 8 ? "l" : "a";
};

const endTime = (t: string, d: number) => {
  const [h, m] = t.split(":").map(Number);
  const e = h * 60 + m + d;
  return String(Math.floor(e / 60) % 24).padStart(2, "0") + ":" + String(e % 60).padStart(2, "0");
};

function AttendanceInner() {
  const searchParams = useSearchParams();

  // Current day index in Saturday=0 system
  const todayIdx = useMemo(() => {
    return Math.min((new Date().getDay() + 1) % 7, 5);
  }, []);
  const isFriday = useMemo(() => new Date().getDay() === 5, []);

  const [selectedDay, setSelectedDay] = useState<number>(todayIdx);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  // Attendance state map: `${dayIndex}|${classId}` -> SessionAttendanceState
  const [attendanceState, setAttendanceState] = useState<Record<string, SessionAttendanceState>>(() => {
    const initialMap: Record<string, SessionAttendanceState> = {};
    // Pre-populate past days with realistic deterministic seeds
    for (let d = 0; d < 6; d++) {
      INITIAL_CLASSES.forEach((cls) => {
        if (cls.days.includes(d)) {
          const k = `${d}|${cls.id}`;
          const marks: Record<number, "p" | "l" | "a"> = {};
          if (d < todayIdx) {
            getRoster(cls).forEach((m) => {
              marks[m.id] = seed(m.id, d, cls.id);
            });
          }
          initialMap[k] = {
            marks,
            note: "",
            saved: d < todayIdx,
          };
        }
      });
    }
    return initialMap;
  });

  // Calculate day date string and day long string
  const weekStart = useMemo(() => {
    const ws = new Date();
    ws.setDate(ws.getDate() - ((new Date().getDay() + 1) % 7));
    return ws;
  }, []);

  const getDayNum = (dayIdx: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + dayIdx);
    try {
      return new Intl.DateTimeFormat("fa-IR", { day: "numeric" }).format(d);
    } catch {
      return toPersianDigits(d.getDate());
    }
  };

  const getDayLong = (dayIdx: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + dayIdx);
    try {
      return new Intl.DateTimeFormat("fa-IR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(d);
    } catch {
      return DAYS[dayIdx];
    }
  };

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToastMessage({ msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Sessions for currently selected day
  const sessionsOfSelectedDay = useMemo(() => {
    return INITIAL_CLASSES.filter((c) => c.days.includes(selectedDay)).sort((a, b) =>
      a.time.localeCompare(b.time)
    );
  }, [selectedDay]);

  // Handle deep-linking via ?class=ID
  useEffect(() => {
    try {
      const classParam = searchParams.get("class");
      if (classParam) {
        const id = parseInt(classParam, 10);
        const targetClass = INITIAL_CLASSES.find((c) => c.id === id);
        if (targetClass) {
          if (!targetClass.days.includes(selectedDay)) {
            const bestDay = targetClass.days.filter((d) => d <= todayIdx).pop() ?? targetClass.days[0];
            setSelectedDay(bestDay);
          }
          setSelectedClassId(targetClass.id);
        }
      }
    } catch {
      // ignore
    }
  }, [searchParams, todayIdx, selectedDay]);

  // Ensure an active class is selected when day changes
  useEffect(() => {
    if (sessionsOfSelectedDay.length > 0) {
      if (!selectedClassId || !sessionsOfSelectedDay.some((c) => c.id === selectedClassId)) {
        setSelectedClassId(sessionsOfSelectedDay[0].id);
      }
    } else {
      setSelectedClassId(null);
    }
  }, [selectedDay, sessionsOfSelectedDay, selectedClassId]);

  const activeClass = useMemo(() => {
    return INITIAL_CLASSES.find((c) => c.id === selectedClassId) || null;
  }, [selectedClassId]);

  const currentSessionStateKey = activeClass ? `${selectedDay}|${activeClass.id}` : "";
  const currentSessionState: SessionAttendanceState = useMemo(() => {
    if (!currentSessionStateKey) return { marks: {}, note: "", saved: false };
    return (
      attendanceState[currentSessionStateKey] || {
        marks: {},
        note: "",
        saved: selectedDay < todayIdx,
      }
    );
  }, [attendanceState, currentSessionStateKey, selectedDay, todayIdx]);

  const dayStatus = selectedDay < todayIdx ? "past" : selectedDay === todayIdx ? "today" : "future";
  const isLocked = dayStatus === "future";

  // Counts for current session
  const activeRoster = useMemo(() => {
    if (!activeClass) return [];
    return getRoster(activeClass);
  }, [activeClass]);

  const counts = useMemo(() => {
    const marks = currentSessionState.marks;
    let p = 0;
    let l = 0;
    let a = 0;
    activeRoster.forEach((m) => {
      const v = marks[m.id];
      if (v === "p") p++;
      else if (v === "l") l++;
      else if (v === "a") a++;
    });
    const u = activeRoster.length - p - l - a;
    return { p, l, a, u, total: activeRoster.length };
  }, [activeRoster, currentSessionState.marks]);

  const attendanceRate = counts.total
    ? Math.round(((counts.p + counts.l) / counts.total) * 100)
    : 0;

  // Toggle or select mark
  const handleToggleMark = (memberId: number, val: "p" | "l" | "a") => {
    if (isLocked || !currentSessionStateKey) return;
    setAttendanceState((prev) => {
      const cur = prev[currentSessionStateKey] || { marks: {}, note: "", saved: false };
      const currentVal = cur.marks[memberId];
      const nextMarks = { ...cur.marks };
      if (currentVal === val) {
        delete nextMarks[memberId];
      } else {
        nextMarks[memberId] = val;
      }
      return {
        ...prev,
        [currentSessionStateKey]: {
          ...cur,
          marks: nextMarks,
          saved: false,
        },
      };
    });
  };

  // Mark all present (except bad flags)
  const handleMarkAllPresent = () => {
    if (isLocked || !currentSessionStateKey || !activeClass) return;
    setAttendanceState((prev) => {
      const cur = prev[currentSessionStateKey] || { marks: {}, note: "", saved: false };
      const nextMarks = { ...cur.marks };
      activeRoster.forEach((m) => {
        if (m.flag !== "bad") {
          nextMarks[m.id] = "p";
        }
      });
      return {
        ...prev,
        [currentSessionStateKey]: {
          ...cur,
          marks: nextMarks,
          saved: false,
        },
      };
    });
    showToast("همه (به‌جز عضویت‌های منقضی) حاضر ثبت شدند");
  };

  // Clear all marks
  const handleClearAll = () => {
    if (isLocked || !currentSessionStateKey) return;
    setAttendanceState((prev) => {
      const cur = prev[currentSessionStateKey] || { marks: {}, note: "", saved: false };
      return {
        ...prev,
        [currentSessionStateKey]: {
          ...cur,
          marks: {},
          saved: false,
        },
      };
    });
  };

  // Update note
  const handleUpdateNote = (val: string) => {
    if (isLocked || !currentSessionStateKey) return;
    setAttendanceState((prev) => {
      const cur = prev[currentSessionStateKey] || { marks: {}, note: "", saved: false };
      return {
        ...prev,
        [currentSessionStateKey]: {
          ...cur,
          note: val,
          saved: false,
        },
      };
    });
  };

  // Save session attendance
  const handleSaveAttendance = () => {
    if (!activeClass || !currentSessionStateKey) return;
    if (counts.u > 0) {
      showToast(`هنوز ${toPersianDigits(counts.u)} نفر را مشخص نکرده‌ای`, "err");
      return;
    }
    setAttendanceState((prev) => {
      const cur = prev[currentSessionStateKey] || { marks: {}, note: "", saved: false };
      return {
        ...prev,
        [currentSessionStateKey]: {
          ...cur,
          saved: true,
        },
      };
    });
    showToast(`حضور و غیاب «${activeClass.name}» ثبت شد`);
  };

  // Filtered members list
  const filteredRoster = useMemo(() => {
    if (!filterQuery.trim()) return activeRoster;
    return activeRoster.filter((m) => m.name.includes(filterQuery.trim()));
  }, [activeRoster, filterQuery]);

  // History bars for active class (seeded deterministic % of last 6 sessions)
  const historyBars = useMemo(() => {
    if (!activeClass) return [];
    return Array.from({ length: 6 }, (_, i) => {
      const n = activeRoster.filter((m) => seed(m.id, i + 11, activeClass.id) !== "a").length;
      return activeRoster.length ? Math.round((n / activeRoster.length) * 100) : 0;
    });
  }, [activeClass, activeRoster]);

  // Absentees across this week's recorded days for this class
  const recentAbsentees = useMemo(() => {
    if (!activeClass) return [];
    const absMap: Record<number, number> = {};
    activeRoster.forEach((m) => {
      DAYS.forEach((_, d) => {
        if (INITIAL_CLASSES.filter((c) => c.days.includes(d)).some((c) => c.id === activeClass.id) && d <= todayIdx) {
          const s = attendanceState[`${d}|${activeClass.id}`];
          if (s && s.marks[m.id] === "a") {
            absMap[m.id] = (absMap[m.id] || 0) + 1;
          }
        }
      });
    });
    return activeRoster
      .filter((m) => absMap[m.id])
      .sort((a, b) => (absMap[b.id] || 0) - (absMap[a.id] || 0))
      .slice(0, 4)
      .map((m) => ({
        ...m,
        absCount: absMap[m.id] || 0,
      }));
  }, [activeClass, activeRoster, attendanceState, todayIdx]);

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-wrap" aria-live="polite">
          <div className={cn("toast", toastMessage.type === "err" && "err")}>
            {toastMessage.type === "err" ? (
              <AlertCircle className="h-[18px] w-[18px] text-[#FB7185] shrink-0" />
            ) : (
              <Check className="h-[18px] w-[18px] text-primary shrink-0 stroke-[2.2]" />
            )}
            <span>{toastMessage.msg}</span>
          </div>
        </div>
      )}

      {/* Page Head */}
      <div className="page-head flex flex-wrap items-end justify-between gap-[16px] mb-[24px]">
        <div>
          <h1 className="text-[22px] min-[640px]:text-[26px] font-extrabold text-ink tracking-tight">
            حضور و غیاب
          </h1>
          <div className="sub text-[14px] text-ink-faint mt-[5px]">
            ثبت حضور شاگردان · {getDayLong(todayIdx)}
          </div>
        </div>

        {/* Action Button: renamed to "برگشت به کلاسها" as requested */}
        <div className="page-head-actions flex items-center gap-[10px]">
          <Link href="/coach/classes" className="btn btn-outline btn-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[17px] w-[17px]"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span>برگشت به کلاسها</span>
          </Link>
        </div>
      </div>

      {/* Day Strip (Saturday to Thursday) */}
      <div className="day-strip" role="tablist" aria-label="روزهای هفته">
        {DAYS.map((dName, dIdx) => {
          const sessionsCount = INITIAL_CLASSES.filter((c) => c.days.includes(dIdx)).length;
          const isSelected = dIdx === selectedDay;
          const isToday = dIdx === todayIdx && !isFriday;
          return (
            <button
              key={dName}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => {
                setSelectedDay(dIdx);
              }}
              className={cn(
                "day-btn",
                isSelected && "active",
                isToday && "today"
              )}
            >
              <div className="dn">{dName}</div>
              <div className="dd">{getDayNum(dIdx)}</div>
              <div className="dc">
                {sessionsCount > 0
                  ? `${toPersianDigits(sessionsCount)} جلسه`
                  : "بدون کلاس"}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Attendance Layout: Left sessions sidebar + Right roster card & side stats */}
      <div className="att-layout">
        {/* Left Card: Sessions of this day */}
        <aside className="card bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
          <div className="card-head flex items-center justify-between p-[20px_22px] border-b border-border">
            <div>
              <h3 className="text-[16px] font-extrabold text-ink">جلسات این روز</h3>
              <div className="hint text-[12.5px] text-ink-faint mt-[3px]">
                {getDayLong(selectedDay)}
              </div>
            </div>
          </div>

          <div className="sess-list">
            {sessionsOfSelectedDay.length > 0 ? (
              sessionsOfSelectedDay.map((cls) => {
                const s = attendanceState[`${selectedDay}|${cls.id}`] || {
                  marks: {},
                  note: "",
                  saved: selectedDay < todayIdx,
                };
                const doneCount = Object.keys(s.marks).length;
                const isSelected = activeClass?.id === cls.id;

                let tagNode = null;
                if (dayStatus === "future") {
                  tagNode = <span className="tag gray">برنامه‌ریزی‌شده</span>;
                } else if (s.saved) {
                  tagNode = <span className="tag">ثبت‌شده</span>;
                } else if (doneCount > 0) {
                  tagNode = <span className="tag amber">ثبت‌نشده</span>;
                } else {
                  tagNode = <span className="tag amber">در انتظار ثبت</span>;
                }

                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => setSelectedClassId(cls.id)}
                    className={cn("sess", isSelected && "active")}
                  >
                    <div className="t">
                      <div className="h">{toPersianDigits(cls.time)}</div>
                      <div className="m">{toPersianDigits(cls.dur)} د</div>
                    </div>
                    <div className="i">
                      <div className="nm">{cls.name}</div>
                      <div className="sb">
                        {toPersianDigits(cls.enrolled)} ثبت‌نام‌شده
                      </div>
                    </div>
                    {tagNode}
                  </button>
                );
              })
            ) : (
              <div className="empty">
                <div className="eico">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="h-6 w-6"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </div>
                <b>کلاسی نداری</b>
                <span>برای این روز جلسه‌ای برنامه‌ریزی نشده است.</span>
              </div>
            )}
          </div>
        </aside>

        {/* Right Section: Roster Card + Bottom Statistics */}
        {activeClass ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", minWidth: 0 }}>
            {/* Roster Card */}
            <div
              className="card bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
              id="rosterCard"
            >
              {/* Card Header */}
              <div className="card-head flex items-center justify-between p-[20px_22px] border-b border-border">
                <div>
                  <h3 className="text-[16px] font-extrabold text-ink">{activeClass.name}</h3>
                  <div className="hint text-[12.5px] text-ink-faint mt-[3px]">
                    {getDayLong(selectedDay)} · {toPersianDigits(activeClass.time)} تا{" "}
                    {toPersianDigits(endTime(activeClass.time, activeClass.dur))}
                  </div>
                </div>
                <div>
                  {isLocked ? (
                    <span className="tag gray">هنوز برگزار نشده</span>
                  ) : currentSessionState.saved ? (
                    <span className="tag">ثبت‌شده</span>
                  ) : (
                    <span className="tag amber">ثبت‌نشده</span>
                  )}
                </div>
              </div>

              {/* 4-Box Attendance Summary */}
              <div className="att-sum">
                <div className="s">
                  <div className="v">{toPersianDigits(counts.p)}</div>
                  <div className="l">
                    <span className="dot" style={{ background: "var(--primary)" }} />
                    حاضر
                  </div>
                </div>
                <div className="s">
                  <div className="v">{toPersianDigits(counts.l)}</div>
                  <div className="l">
                    <span className="dot" style={{ background: "#F59E0B" }} />
                    تأخیر
                  </div>
                </div>
                <div className="s">
                  <div className="v">{toPersianDigits(counts.a)}</div>
                  <div className="l">
                    <span className="dot" style={{ background: "#F43F5E" }} />
                    غایب
                  </div>
                </div>
                <div className="s">
                  <div className="v">{toPersianDigits(counts.u)}</div>
                  <div className="l">
                    <span className="dot" style={{ background: "#CBD5E1" }} />
                    ثبت‌نشده
                  </div>
                </div>
              </div>

              {/* Stack Progress Bar */}
              <div className="stack" aria-hidden="true">
                <i
                  style={{
                    width: `${counts.total ? (counts.p / counts.total) * 100 : 0}%`,
                    background: "var(--primary)",
                  }}
                />
                <i
                  style={{
                    width: `${counts.total ? (counts.l / counts.total) * 100 : 0}%`,
                    background: "#F59E0B",
                  }}
                />
                <i
                  style={{
                    width: `${counts.total ? (counts.a / counts.total) * 100 : 0}%`,
                    background: "#F43F5E",
                  }}
                />
              </div>

              {/* Roster Tools: Filter search + Quick Buttons */}
              <div className="roster-tools">
                <label className="filter-search flex items-center gap-2">
                  <Search className="h-4 w-4 text-ink-faint shrink-0" />
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="جستجوی شاگرد…"
                    aria-label="جستجوی شاگرد"
                    className="outline-none text-[13px] text-ink bg-transparent w-full"
                  />
                </label>
                <div className="sp">
                  <button
                    type="button"
                    onClick={handleMarkAllPresent}
                    disabled={isLocked}
                    className="btn btn-outline btn-sm cursor-pointer disabled:opacity-50"
                  >
                    <Check className="h-4 w-4 stroke-[2.2]" />
                    <span>همه حاضر</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    disabled={isLocked}
                    className="btn btn-outline btn-sm cursor-pointer disabled:opacity-50"
                  >
                    پاک‌کردن
                  </button>
                </div>
              </div>

              {/* Roster Members List */}
              <div id="roster">
                {filteredRoster.length > 0 ? (
                  filteredRoster.map((m) => {
                    const currentMark = currentSessionState.marks[m.id];
                    return (
                      <div key={m.id} className="roster-row">
                        <div className="who">
                          <span
                            className="av"
                            style={{ background: COL[m.id % COL.length] }}
                          >
                            {m.name[0]}
                          </span>
                          <div>
                            <div className="nm">
                              <span>{m.name}</span>
                              {m.flag === "warn" && (
                                <span className="mini warn">عضویت رو به پایان</span>
                              )}
                              {m.flag === "bad" && (
                                <span className="mini bad">عضویت منقضی</span>
                              )}
                            </div>
                            <div className="sb">
                              {m.flag === "bad"
                                ? "برای حضور، عضویت باید تمدید شود"
                                : "عضو فعال باشگاه"}
                            </div>
                          </div>
                        </div>

                        {/* Segment Buttons (حاضر، تأخیر، غایب) */}
                        <div
                          className="att-seg"
                          role="group"
                          aria-label={`وضعیت ${m.name}`}
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleMark(m.id, "p")}
                            aria-pressed={currentMark === "p"}
                            disabled={isLocked}
                            className="p"
                          >
                            حاضر
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleMark(m.id, "l")}
                            aria-pressed={currentMark === "l"}
                            disabled={isLocked}
                            className="l"
                          >
                            تأخیر
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleMark(m.id, "a")}
                            aria-pressed={currentMark === "a"}
                            disabled={isLocked}
                            className="a"
                          >
                            غایب
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty">
                    <b>شاگردی پیدا نشد</b>
                    <span>عبارت جستجو را تغییر بده.</span>
                  </div>
                )}
              </div>

              {/* Note Area */}
              <div className="note-area">
                <div className="field">
                  <label htmlFor="note">
                    یادداشت جلسه{" "}
                    <span style={{ color: "var(--ink-faint)", fontWeight: 500 }}>
                      (اختیاری)
                    </span>
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    value={currentSessionState.note}
                    onChange={(e) => handleUpdateNote(e.target.value)}
                    disabled={isLocked}
                    placeholder="مثلاً: دستگاه پرس پا خراب بود، جلسه ۱۰ دقیقه کوتاه‌تر شد"
                    className="input"
                  />
                </div>
              </div>

              {/* Save Bar */}
              <div
                className="save-bar"
                style={{ padding: "14px 22px", margin: 0 }}
              >
                <div
                  className="hint"
                  id="saveHint"
                  style={{ fontSize: "13px", color: "var(--ink-faint)" }}
                >
                  {isLocked
                    ? "ثبت حضور برای جلسه‌های آینده ممکن نیست"
                    : counts.u > 0
                    ? `${toPersianDigits(counts.u)} نفر هنوز مشخص نشده‌اند`
                    : currentSessionState.saved
                    ? `ثبت شد · نرخ حضور ٪${toPersianDigits(attendanceRate)}`
                    : `همه مشخص شدند · نرخ حضور ٪${toPersianDigits(attendanceRate)} — آماده‌ی ثبت`}
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={handleSaveAttendance}
                    disabled={isLocked}
                    className="btn btn-primary btn-sm cursor-pointer disabled:opacity-50"
                  >
                    <Check className="h-4 w-4 stroke-[2.2]" />
                    <span>ثبت حضور و غیاب</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom 2 Cards Grid: Attendance Trend + Recent Absentees */}
            <div className="grid-2b" style={{ marginBottom: 0 }}>
              {/* Card 1: 6 Sessions Attendance Trend Bar Chart */}
              <div className="card bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                <div className="card-head flex items-center justify-between p-[20px_22px] border-b border-border">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-ink">
                      روند حضور این کلاس
                    </h3>
                    <div className="hint text-[12.5px] text-ink-faint mt-[3px]">
                      ۶ جلسه‌ی اخیر
                    </div>
                  </div>
                </div>
                <div className="card-body p-[22px]">
                  <div className="hist">
                    {historyBars.map((val, i) => (
                      <div key={i} className="c">
                        <div
                          className="b"
                          style={{ height: `${Math.max(val, 8)}%` }}
                          title={`٪${toPersianDigits(val)}`}
                        />
                        <div className="lb">{toPersianDigits(i + 1)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 2: Recent Absentees this week */}
              <div className="card bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                <div className="card-head flex items-center justify-between p-[20px_22px] border-b border-border">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-ink">
                      غیبت‌های اخیر
                    </h3>
                    <div className="hint text-[12.5px] text-ink-faint mt-[3px]">
                      شاگردانی که این هفته غایب بوده‌اند
                    </div>
                  </div>
                </div>
                <div className="card-body p-[22px]">
                  <div id="absList">
                    {recentAbsentees.length > 0 ? (
                      recentAbsentees.map((m) => (
                        <div key={m.id} className="abs-row">
                          <span
                            className="av"
                            style={{ background: COL[m.id % COL.length] }}
                          >
                            {m.name[0]}
                          </span>
                          <div>
                            <div className="nm">{m.name}</div>
                            <div className="sb">
                              {toPersianDigits(m.absCount)} غیبت این هفته
                            </div>
                          </div>
                          <Link
                            href="/coach/messages"
                            className="btn btn-outline btn-sm cursor-pointer"
                          >
                            پیام
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="empty" style={{ padding: "22px 10px" }}>
                        <b>غیبتی ثبت نشده</b>
                        <span>این هفته همه حاضر بوده‌اند.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default function CoachAttendancePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app flex min-h-screen">
      <CoachSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main flex flex-1 flex-col min-w-0">
        <CoachTopbar onToggleSidebar={() => setSidebarOpen((p) => !p)} />
        <main className="content flex-1 p-[18px] min-[640px]:p-[28px]">
          <Suspense
            fallback={
              <div className="p-8 text-center text-ink-faint">
                در حال بارگذاری اطلاعات حضور و غیاب...
              </div>
            }
          >
            <AttendanceInner />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
