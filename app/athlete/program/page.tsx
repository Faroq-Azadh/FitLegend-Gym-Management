"use client";

import { useState } from "react";
import Link from "next/link";
import { toPersianDigits } from "@/lib/persian-digits";
import { AthleteSidebar } from "@/components/athlete/athlete-sidebar";
import { AthleteTopbar } from "@/components/athlete/athlete-topbar";

interface ProgramDay {
  id: string;
  dayName: string;
  focus: string;
  exercisesCount: number;
  duration: string;
  exercises: {
    name: string;
    target: string;
    sets: string;
    reps: string;
    rest: string;
    notes?: string;
  }[];
}

const PROGRAM_DAYS: ProgramDay[] = [
  {
    id: "1",
    dayName: "شنبه",
    focus: "سینه، سرشانه و پشت‌بازو",
    exercisesCount: 5,
    duration: "۶۰ دقیقه",
    exercises: [
      { name: "پرس سینه هالتر", target: "سینه", sets: "۴", reps: "۸-۱۰", rest: "۹۰ ثانیه", notes: "گرم‌کردن دقیق قبل از ست اصلی" },
      { name: "پرس بالاسینه دمبل", target: "بالاسینه", sets: "۳", reps: "۱۰-۱۲", rest: "۶۰ ثانیه" },
      { name: "قفسه سینه سیم‌کش", target: "سینه", sets: "۳", reps: "۱۲-۱۵", rest: "۶۰ ثانیه" },
      { name: "پشت‌بازو سیم‌کش", target: "پشت‌بازو", sets: "۴", reps: "۱۲", rest: "۶۰ ثانیه" },
      { name: "نشر از جانب با دمبل", target: "سرشانه", sets: "۳", reps: "۱۵", rest: "۴۵ ثانیه" },
    ],
  },
  {
    id: "2",
    dayName: "دوشنبه",
    focus: "پا و میان‌تنه (عضلات Core)",
    exercisesCount: 5,
    duration: "۶۵ دقیقه",
    exercises: [
      { name: "اسکوات با هالتر", target: "چهارسر ران", sets: "۴", reps: "۸-۱۰", rest: "۱۲۰ ثانیه", notes: "روی فرم تمرکز کن" },
      { name: "پرس پا با دستگاه", target: "چهارسر و باسن", sets: "۳", reps: "۱۲", rest: "۹۰ ثانیه" },
      { name: "پشت پا دستگاه", target: "همسترینگ", sets: "۳", reps: "۱۲-۱۵", rest: "۶۰ ثانیه" },
      { name: "ساق پا ایستاده", target: "ساق", sets: "۴", reps: "۱۵-۲۰", rest: "۴۵ ثانیه" },
      { name: "پلانک ایزومتریک", target: "شکم", sets: "۳", reps: "۶۰ ثانیه", rest: "۴۵ ثانیه" },
    ],
  },
  {
    id: "3",
    dayName: "چهارشنبه",
    focus: "زیربغل، جلو‌بازو و فیله",
    exercisesCount: 5,
    duration: "۵۵ دقیقه",
    exercises: [
      { name: "لت سیم‌کش دست باز", target: "زیربغل", sets: "۴", reps: "۱۰", rest: "۷۵ ثانیه" },
      { name: "زیربغل قایقی سیم‌کش", target: "پشت", sets: "۳", reps: "۱۰-۱۲", rest: "۶۰ ثانیه" },
      { name: "جلو‌بازو هالتر EZ", target: "جلو‌بازو", sets: "۴", reps: "۱۰-۱۲", rest: "۶۰ ثانیه" },
      { name: "جلو‌بازو دمبل چکشی", target: "ساعد و بازو", sets: "۳", reps: "۱۲", rest: "۴۵ ثانیه" },
      { name: "فیله کمر روی میز", target: "پایین کمر", sets: "۳", reps: "۱۵", rest: "۴۵ ثانیه" },
    ],
  },
];

export default function AthleteProgramPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string>("1");

  const currentDay = PROGRAM_DAYS.find((d) => d.id === selectedDayId) || PROGRAM_DAYS[0];

  return (
    <div className="app">
      <AthleteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <AthleteTopbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="content">
          <div className="page-head">
            <div>
              <h1>برنامه‌ی تمرین من</h1>
              <div className="sub">طراحی شده توسط مربی آرش رستمی · دوره هیپرتروفی فاز ۲</div>
            </div>
            <div className="page-head-actions">
              <Link href="/athlete" className="btn btn-outline btn-sm">
                بازگشت به داشبورد
              </Link>
            </div>
          </div>

          {/* Days Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {PROGRAM_DAYS.map((day) => {
              const isActive = day.id === selectedDayId;
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => setSelectedDayId(day.id)}
                  className={`btn btn-sm ${
                    isActive ? "btn-primary" : "btn-outline"
                  }`}
                >
                  <span>{day.dayName}</span>
                  <span className="text-[12px] opacity-75">({day.focus})</span>
                </button>
              );
            })}
          </div>

          {/* Active Day Card */}
          <div className="card">
            <div className="card-head">
              <div>
                <h3>{currentDay.dayName}: {currentDay.focus}</h3>
                <div className="hint">{toPersianDigits(currentDay.exercisesCount)} حرکت · زمان تخمینی: {toPersianDigits(currentDay.duration)}</div>
              </div>
              <span className="pill">برنامه فعال</span>
            </div>
            <div className="card-body">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>نام حرکت</th>
                      <th>عضله هدف</th>
                      <th>ست‌ها</th>
                      <th>تکرار</th>
                      <th>استراحت</th>
                      <th>توضیحات مربی</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDay.exercises.map((ex, idx) => (
                      <tr key={idx}>
                        <td className="font-bold text-ink">{ex.name}</td>
                        <td>{ex.target}</td>
                        <td className="font-bold text-ink">{toPersianDigits(ex.sets)}</td>
                        <td>{toPersianDigits(ex.reps)}</td>
                        <td>{toPersianDigits(ex.rest)}</td>
                        <td className="text-ink-faint text-[12.5px]">{toPersianDigits(ex.notes || "—")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
