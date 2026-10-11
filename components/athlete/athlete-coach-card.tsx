"use client";

import Link from "next/link";
import { toPersianDigits } from "@/lib/persian-digits";

interface AthleteCoachCardProps {
  coachName?: string;
  coachRole?: string;
  recentMessage?: string;
  messageTime?: string;
}

export function AthleteCoachCard({
  coachName = "آرش رستمی",
  coachRole = "مربی بدنسازی",
  recentMessage = "این هفته ۵ کیلو به اسکوات اضافه کن ولی روی فرم تمرکز کن. عالی پیش می‌ری 💪",
  messageTime = "۱۰:۲۳ امروز",
}: AthleteCoachCardProps) {
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3>مربی شما</h3>
        </div>
      </div>
      <div className="card-body">
        <div className="coach-card">
          <span className="av">آر</span>
          <div style={{ flex: 1 }}>
            <div className="nm">{coachName}</div>
            <div className="rl">{coachRole}</div>
          </div>
          <Link href="/athlete/messages" className="btn btn-outline btn-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            پیام
          </Link>
        </div>
        <div className="feed-item" style={{ border: "none", padding: 0 }}>
          <span className="feed-ico">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <div className="feed-body">
            <div className="t">{toPersianDigits(recentMessage)}</div>
            <div className="time">{toPersianDigits(messageTime)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
