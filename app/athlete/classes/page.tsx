"use client";

import { useState } from "react";
import Link from "next/link";
import { toPersianDigits } from "@/lib/persian-digits";
import { AthleteSidebar } from "@/components/athlete/athlete-sidebar";
import { AthleteTopbar } from "@/components/athlete/athlete-topbar";
import { AthleteBookClassModal } from "@/components/athlete/athlete-book-class-modal";

interface ClassSession {
  id: string;
  name: string;
  coach: string;
  day: string;
  time: string;
  venue: string;
  spotsLeft: number;
  totalSpots: number;
  isBooked?: boolean;
}

const ALL_CLASSES: ClassSession[] = [
  {
    id: "1",
    name: "TRX و کاهش وزن",
    coach: "آرش رستمی",
    day: "امروز",
    time: "۱۷:۳۰",
    venue: "سالن هوازی",
    spotsLeft: 2,
    totalSpots: 15,
    isBooked: true,
  },
  {
    id: "2",
    name: "فانکشنال و کراس",
    coach: "آرش رستمی",
    day: "چهارشنبه",
    time: "۰۹:۳۰",
    venue: "سالن کراس‌فیت",
    spotsLeft: 1,
    totalSpots: 20,
    isBooked: true,
  },
  {
    id: "3",
    name: "جلسه خصوصی بدنسازی",
    coach: "آرش رستمی",
    day: "پنجشنبه",
    time: "۱۶:۰۰",
    venue: "سالن وزنه",
    spotsLeft: 0,
    totalSpots: 1,
    isBooked: true,
  },
  {
    id: "4",
    name: "پیلاتس پیشرفته",
    coach: "مهسا نظری",
    day: "پنجشنبه",
    time: "۱۰:۰۰",
    venue: "سالن ۲",
    spotsLeft: 4,
    totalSpots: 12,
    isBooked: false,
  },
  {
    id: "5",
    name: "اسپینینگ استقامتی",
    coach: "کامران صادقی",
    day: "شنبه",
    time: "۱۸:۰۰",
    venue: "سالن اسپینینگ",
    spotsLeft: 6,
    totalSpots: 16,
    isBooked: false,
  },
  {
    id: "6",
    name: "یوگا و آرامش ذهن",
    coach: "سحر کمالی",
    day: "یکشنبه",
    time: "۰۸:۳۰",
    venue: "سالن یوگا",
    spotsLeft: 5,
    totalSpots: 14,
    isBooked: false,
  },
];

export default function AthleteClassesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classesList, setClassesList] = useState<ClassSession[]>(ALL_CLASSES);
  const [filter, setFilter] = useState<"all" | "booked">("all");

  const displayedClasses = filter === "booked"
    ? classesList.filter((c) => c.isBooked)
    : classesList;

  const toggleBook = (id: string) => {
    setClassesList((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextBooked = !c.isBooked;
          return {
            ...c,
            isBooked: nextBooked,
            spotsLeft: nextBooked ? c.spotsLeft - 1 : c.spotsLeft + 1,
          };
        }
        return c;
      })
    );
  };

  return (
    <div className="app">
      <AthleteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <AthleteTopbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onBookClassClick={() => setIsModalOpen(true)}
        />

        <main className="content">
          <div className="page-head">
            <div>
              <h1>کلاس‌ها و رزرو</h1>
              <div className="sub">برنامه هفتگی کلاس‌های گروهی و جلسات رزرو شده شما</div>
            </div>
            <div className="page-head-actions">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary btn-sm"
              >
                رزرو کلاس جدید
              </button>
            </div>
          </div>

          {/* Filter Segment */}
          <div className="flex items-center justify-between mb-6">
            <div className="seg">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={filter === "all" ? "active" : ""}
              >
                همه کلاس‌ها ({toPersianDigits(classesList.length)})
              </button>
              <button
                type="button"
                onClick={() => setFilter("booked")}
                className={filter === "booked" ? "active" : ""}
              >
                رزروهای من ({toPersianDigits(classesList.filter((c) => c.isBooked).length)})
              </button>
            </div>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedClasses.map((item) => (
              <div key={item.id} className="card p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h4 className="text-[16px] font-bold text-ink">{item.name}</h4>
                      <div className="text-[12.5px] text-ink-faint mt-1">مربی: {item.coach} · {toPersianDigits(item.venue)}</div>
                    </div>
                    {item.isBooked ? (
                      <span className="pill text-[11px] bg-tint text-primary-dark shrink-0">
                        رزرو شده
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-ink-faint bg-bg px-2.5 py-1 rounded-full shrink-0">
                        {toPersianDigits(item.spotsLeft)} ظرفیت
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[13px] text-ink-soft my-3 bg-bg p-2.5 rounded-[10px]">
                    <span className="font-bold text-ink">{item.day}</span>
                    <span>ساعت {toPersianDigits(item.time)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between mt-2">
                  <div className="text-[11.5px] text-ink-faint">
                    {toPersianDigits(item.totalSpots - item.spotsLeft)} از {toPersianDigits(item.totalSpots)} نفر
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleBook(item.id)}
                    className={`btn btn-sm ${
                      item.isBooked ? "btn-outline text-rose-600 border-rose-200 hover:bg-rose-50" : "btn-primary"
                    }`}
                  >
                    {item.isBooked ? "لغو رزرو" : "رزرو آنلاین"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <AthleteBookClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(bookedName) => {
          setClassesList((prev) =>
            prev.map((c) => (c.name.includes(bookedName) ? { ...c, isBooked: true } : c))
          );
        }}
      />
    </div>
  );
}
