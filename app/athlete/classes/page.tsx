"use client";

import { useState } from "react";
import { toPersianDigits } from "@/lib/persian-digits";
import { AthleteSidebar } from "@/components/athlete/athlete-sidebar";
import { AthleteTopbar } from "@/components/athlete/athlete-topbar";
import { AthleteBookClassModal } from "@/components/athlete/athlete-book-class-modal";

interface ClassItem {
  id: string;
  name: string;
  coach: string;
  day: string;
  time: string;
  cap: number;
  booked: number;
  isBooked: boolean;
  kind: "" | "cyan" | "amber";
}

const INITIAL_CLASSES: ClassItem[] = [
  {
    id: "1",
    name: "بدنسازی",
    coach: "آرش رستمی",
    day: "شنبه",
    time: "۰۸:۰۰",
    cap: 20,
    booked: 18,
    isBooked: false,
    kind: "",
  },
  {
    id: "2",
    name: "یوگا",
    coach: "سپیده نوری",
    day: "شنبه",
    time: "۱۰:۰۰",
    cap: 15,
    booked: 12,
    isBooked: true,
    kind: "cyan",
  },
  {
    id: "3",
    name: "کراس‌فیت",
    coach: "بهنام راد",
    day: "شنبه",
    time: "۱۷:۰۰",
    cap: 16,
    booked: 16,
    isBooked: false,
    kind: "amber",
  },
  {
    id: "4",
    name: "فیتنس",
    coach: "نگار سالاری",
    day: "یکشنبه",
    time: "۱۰:۰۰",
    cap: 18,
    booked: 10,
    isBooked: false,
    kind: "cyan",
  },
  {
    id: "5",
    name: "بدنسازی",
    coach: "آرش رستمی",
    day: "دوشنبه",
    time: "۰۸:۰۰",
    cap: 20,
    booked: 15,
    isBooked: false,
    kind: "",
  },
  {
    id: "6",
    name: "یوگا",
    coach: "سپیده نوری",
    day: "سه‌شنبه",
    time: "۱۰:۰۰",
    cap: 15,
    booked: 9,
    isBooked: true,
    kind: "cyan",
  },
  {
    id: "7",
    name: "TRX و کاهش وزن",
    coach: "کاوه احمدی",
    day: "چهارشنبه",
    time: "۱۷:۰۰",
    cap: 12,
    booked: 8,
    isBooked: false,
    kind: "amber",
  },
  {
    id: "8",
    name: "فیتنس",
    coach: "نگار سالاری",
    day: "چهارشنبه",
    time: "۱۹:۳۰",
    cap: 18,
    booked: 11,
    isBooked: false,
    kind: "cyan",
  },
  {
    id: "9",
    name: "پیلاتس پیشرفته",
    coach: "مهسا نظری",
    day: "پنجشنبه",
    time: "۱۰:۰۰",
    cap: 12,
    booked: 8,
    isBooked: false,
    kind: "cyan",
  },
  {
    id: "10",
    name: "اسپینینگ استقامتی",
    coach: "کامران صادقی",
    day: "پنجشنبه",
    time: "۱۸:۰۰",
    cap: 16,
    booked: 10,
    isBooked: false,
    kind: "amber",
  },
  {
    id: "11",
    name: "فانکشنال و کراس",
    coach: "آرش رستمی",
    day: "چهارشنبه",
    time: "۰۹:۳۰",
    cap: 20,
    booked: 19,
    isBooked: true,
    kind: "amber",
  },
];

const DAYS = [
  { id: "all", label: "همه" },
  { id: "شنبه", label: "شنبه" },
  { id: "یکشنبه", label: "یکشنبه" },
  { id: "دوشنبه", label: "دوشنبه" },
  { id: "سه‌شنبه", label: "سه‌شنبه" },
  { id: "چهارشنبه", label: "چهارشنبه" },
  { id: "پنجشنبه", label: "پنجشنبه" },
];

export default function AthleteClassesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classesList, setClassesList] = useState<ClassItem[]>(INITIAL_CLASSES);
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [dayFilter, setDayFilter] = useState<string>("all");

  // KPIs
  const kFree = classesList.filter((c) => !c.isBooked && c.booked < c.cap).length;
  const kMine = classesList.filter((c) => c.isBooked).length;
  const kAttended = 8; // From design reference

  // Book class handler
  const handleBook = (id: string) => {
    setClassesList((prev) =>
      prev.map((c) => {
        if (c.id === id && !c.isBooked && c.booked < c.cap) {
          return {
            ...c,
            isBooked: true,
            booked: c.booked + 1,
          };
        }
        return c;
      })
    );
  };

  // Cancel reservation handler
  const handleCancel = (id: string) => {
    setClassesList((prev) =>
      prev.map((c) => {
        if (c.id === id && c.isBooked) {
          return {
            ...c,
            isBooked: false,
            booked: Math.max(0, c.booked - 1),
          };
        }
        return c;
      })
    );
  };

  // Filtered classes for "همه کلاس‌ها" tab by selected day
  const filteredClasses = classesList.filter((c) => {
    return dayFilter === "all" || c.day === dayFilter;
  });

  // Athlete's reserved classes for "رزروهای من" tab
  const myReservedClasses = classesList.filter((c) => c.isBooked);

  return (
    <div className="app">
      <AthleteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <AthleteTopbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onBookClassClick={() => setIsModalOpen(true)}
        />

        <main className="content">
          {/* Page Head */}
          <div className="page-head">
            <div>
              <h1>کلاس‌ها و رزرو</h1>
              <div className="sub">کلاس‌های گروهی این هفته را رزرو کن</div>
            </div>
            <div className="page-head-actions">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary btn-sm"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: 16, height: 16 }}
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                رزرو کلاس جدید
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="kpi-grid kpi-3">
            <div className="card kpi">
              <div className="kpi-top">
                <span className="kpi-ico kpi-c-orange">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </span>
              </div>
              <div className="v">{toPersianDigits(kFree)}</div>
              <div className="l">کلاس باز برای رزرو</div>
            </div>

            <div className="card kpi">
              <div className="kpi-top">
                <span className="kpi-ico kpi-c-sky">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 12 2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </span>
              </div>
              <div className="v">{toPersianDigits(kMine)}</div>
              <div className="l">رزروهای فعال من</div>
            </div>

            <div className="card kpi">
              <div className="kpi-top">
                <span
                  className="kpi-ico kpi-c-amber"
                  style={{ background: "#FFFBEB", color: "#D97706" }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2 15.09 8.26 22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2Z" />
                  </svg>
                </span>
              </div>
              <div className="v">{toPersianDigits(kAttended)}</div>
              <div className="l">کلاس حاضرشده این ماه</div>
            </div>
          </div>

          {/* Tabs Switcher: All Classes vs My Reservations */}
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
            <div className="seg">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={activeTab === "all" ? "active" : ""}
              >
                همه کلاس‌ها ({toPersianDigits(classesList.length)})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("mine")}
                className={activeTab === "mine" ? "active" : ""}
              >
                رزروهای من ({toPersianDigits(kMine)})
              </button>
            </div>
          </div>

          {/* TAB 1: ALL AVAILABLE CLASSES */}
          {activeTab === "all" && (
            <div className="card" style={{ marginBottom: "18px" }}>
              <div
                className="card-head"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "14px",
                }}
              >
                <div>
                  <h3>کلاس‌های موجود</h3>
                  <div className="hint">{toPersianDigits(filteredClasses.length)} کلاس</div>
                </div>

                {/* Day Filter Segment (purely next to classes title) */}
                <div className="seg" id="daySeg">
                  {DAYS.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDayFilter(d.id)}
                      className={dayFilter === d.id ? "active" : ""}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card-body">
                {filteredClasses.length === 0 ? (
                  <div className="empty-state">
                    <div className="es-ico neutral">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                    </div>
                    <div className="es-title">کلاسی در این روز برگزار نمی‌شود</div>
                    <div className="es-sub">روز دیگری را از گزینه‌های بالا انتخاب کنید.</div>
                    <div className="es-actions">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setDayFilter("all")}
                      >
                        مشاهده همه روزها
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid-3" id="clsGrid">
                    {filteredClasses.map((c) => {
                      const full = c.booked >= c.cap;
                      const p = Math.min(100, Math.round((c.booked / c.cap) * 100));

                      return (
                        <div
                          key={c.id}
                          className="card"
                          style={{
                            boxShadow: "none",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <div
                            className="card-body"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "12px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <span className={c.kind ? `tag ${c.kind}` : "tag"}>
                                {c.name}
                              </span>
                              <span
                                style={{
                                  fontSize: "12.5px",
                                  color: "var(--ink-faint)",
                                  fontWeight: 700,
                                }}
                              >
                                {c.day} · {toPersianDigits(c.time)}
                              </span>
                            </div>

                            <div
                              style={{
                                fontSize: "13.5px",
                                color: "var(--ink-soft)",
                                fontWeight: 600,
                              }}
                            >
                              مربی: {c.coach}
                            </div>

                            <div className="cap">
                              <div className="cap-bar">
                                <div
                                  className={`cap-fill ${full ? "full" : ""}`}
                                  style={{ width: `${p}%` }}
                                />
                              </div>
                              <div className="cap-txt">
                                {toPersianDigits(c.booked)} از {toPersianDigits(c.cap)} نفر{" "}
                                {full ? "· تکمیل" : ""}
                              </div>
                            </div>

                            {c.isBooked ? (
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                style={{ color: "#E11D48", borderColor: "#FECDD3" }}
                                onClick={() => handleCancel(c.id)}
                              >
                                لغو رزرو
                              </button>
                            ) : full ? (
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                disabled
                                style={{ opacity: 0.6, cursor: "not-allowed" }}
                              >
                                لیست انتظار
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => handleBook(c.id)}
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  style={{ width: 17, height: 17 }}
                                >
                                  <path d="m5 12 5 5L20 7" />
                                </svg>
                                رزرو
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MY RESERVATIONS */}
          {activeTab === "mine" && (
            <div className="card">
              <div className="card-head">
                <div>
                  <h3>رزروهای من</h3>
                  <div className="hint">کلاس‌هایی که تا کنون رزرو کرده‌اید</div>
                </div>
                <span className="pill">{toPersianDigits(myReservedClasses.length)} رزرو</span>
              </div>
              <div id="mineList" className="card-body" style={{ padding: "14px 22px 22px" }}>
                {myReservedClasses.length === 0 ? (
                  <div className="empty-state">
                    <div className="es-ico neutral">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                    </div>
                    <div className="es-title">هنوز کلاسی رزرو نکرده‌ای</div>
                    <div className="es-sub">از تب «همه کلاس‌ها» یک کلاس انتخاب و رزرو کن.</div>
                    <div className="es-actions">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setActiveTab("all")}
                      >
                        مشاهده کلاس‌ها
                      </button>
                    </div>
                  </div>
                ) : (
                  myReservedClasses.map((c) => (
                    <div
                      key={c.id}
                      className="class-row"
                      style={{
                        padding: "16px 4px",
                        borderBottom: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div className="class-time">
                          <div className="h">{toPersianDigits(c.time)}</div>
                          <div className="m">{c.day}</div>
                        </div>
                        <div className="class-info">
                          <div
                            className="nm"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span>{c.name}</span>
                            <span className={c.kind ? `tag ${c.kind}` : "tag"}>
                              {c.name}
                            </span>
                          </div>
                          <div className="coach">مربی {c.coach}</div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span className="status active">
                          <span className="d" />
                          رزرو شده
                        </span>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ color: "#E11D48", borderColor: "#FECDD3" }}
                          onClick={() => handleCancel(c.id)}
                        >
                          لغو رزرو
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Book Class Modal with integrated Search */}
      <AthleteBookClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        classes={classesList.map((c) => ({
          id: c.id,
          name: c.name,
          coach: c.coach,
          time: c.time,
          day: c.day,
          hall: "سالن ورزشی",
          capacityText: `${toPersianDigits(c.booked)} از ${toPersianDigits(c.cap)} نفر (${toPersianDigits(Math.max(0, c.cap - c.booked))} جای خالی)`,
          filledPercent: Math.min(100, Math.round((c.booked / c.cap) * 100)),
        }))}
        onSuccess={(bookedName) => {
          setClassesList((prev) => {
            const index = prev.findIndex(
              (c) => c.name.includes(bookedName) || bookedName.includes(c.name)
            );
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = {
                ...updated[index],
                isBooked: true,
                booked: Math.min(updated[index].cap, updated[index].booked + 1),
              };
              return updated;
            }
            return [
              {
                id: String(Date.now()),
                name: bookedName,
                coach: "آرش رستمی",
                day: "امروز",
                time: "۱۷:۳۰",
                cap: 15,
                booked: 14,
                isBooked: true,
                kind: "cyan",
              },
              ...prev,
            ];
          });
        }}
      />
    </div>
  );
}
