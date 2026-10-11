"use client";
 
import { toPersianDigits } from "@/lib/persian-digits";

interface UpcomingClassItem {
  id: string;
  timeHour: string;
  timeDay: string;
  name: string;
  coachAndVenue: string;
  capacityText: string;
  fillPercent: number;
  isFull?: boolean;
}

const DEFAULT_UPCOMING_CLASSES: UpcomingClassItem[] = [
  {
    id: "1",
    timeHour: "۱۷:۳۰",
    timeDay: "امروز",
    name: "TRX و کاهش وزن",
    coachAndVenue: "مربی: آرش رستمی · سالن هوازی",
    capacityText: "۱۳ از ۱۵ نفر",
    fillPercent: 87,
  },
  {
    id: "2",
    timeHour: "۰۹:۳۰",
    timeDay: "چهارشنبه",
    name: "فانکشنال",
    coachAndVenue: "مربی: آرش رستمی · سالن کراس",
    capacityText: "۱۹ از ۲۰ نفر",
    fillPercent: 95,
  },
  {
    id: "3",
    timeHour: "۱۶:۰۰",
    timeDay: "پنجشنبه",
    name: "جلسه خصوصی",
    coachAndVenue: "مربی: آرش رستمی · سالن وزنه",
    capacityText: "۱ از ۱ نفر · رزرو شد",
    fillPercent: 100,
    isFull: true,
  },
];

export function AthleteUpcomingClasses() {
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3>کلاس‌های پیش‌رو</h3>
          <div className="hint">رزروهای فعال شما</div>
        </div>
        <span className="pill">{toPersianDigits(DEFAULT_UPCOMING_CLASSES.length)} رزرو</span>
      </div>
      <div className="card-body" style={{ paddingTop: "6px" }}>
        {DEFAULT_UPCOMING_CLASSES.map((item) => (
          <div key={item.id} className="class-row">
            <div className="class-time">
              <div className="h">{toPersianDigits(item.timeHour)}</div>
              <div className="m">{item.timeDay}</div>
            </div>
            <div className="class-info">
              <div className="nm">{item.name}</div>
              <div className="coach">{item.coachAndVenue}</div>
              <div className="cap">
                <div className="cap-bar">
                  <div
                    className={`cap-fill ${item.isFull ? "full" : ""}`}
                    style={{ width: `${item.fillPercent}%` }}
                  />
                </div>
                <div className="cap-txt">{toPersianDigits(item.capacityText)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
