"use client";

import { toPersianDigits } from "@/lib/persian-digits";

interface AthleteKpiGridProps {
  sessionsCompleted?: number;
  sessionsTarget?: number;
  streakDays?: number;
  goalPercent?: number;
  currentWeight?: number;
}

export function AthleteKpiGrid({
  sessionsCompleted = 3,
  sessionsTarget = 4,
  streakDays = 12,
  goalPercent = 80,
  currentWeight = 68,
}: AthleteKpiGridProps) {
  return (
    <div className="kpi-grid">
      {/* 1. Sessions Completed */}
      <div className="card kpi">
        <div className="kpi-top">
          <span className="kpi-ico">
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
          <span className="kpi-trend up">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 15 6-6 6 6" />
            </svg>
            ۷۵٪
          </span>
        </div>
        <div className="v">
          {toPersianDigits(sessionsCompleted)}{" "}
          <span style={{ fontSize: "16px", color: "var(--ink-faint)", fontWeight: 600 }}>
            / {toPersianDigits(sessionsTarget)}
          </span>
        </div>
        <div className="l">جلسات این هفته</div>
      </div>

      {/* 2. Workout Streak */}
      <div className="card kpi">
        <div className="kpi-top">
          <span className="kpi-ico warning" style={{ background: "#FFFBEB", color: "#D97706" }}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />
            </svg>
          </span>
          <span className="kpi-trend up">عالی!</span>
        </div>
        <div className="v">{toPersianDigits(streakDays)}</div>
        <div className="l">روزهای متوالی تمرین</div>
      </div>

      {/* 3. Goal Progress */}
      <div className="card kpi">
        <div className="kpi-top">
          <span className="kpi-ico">
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
          <span className="kpi-trend up">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 15 6-6 6 6" />
            </svg>
            ۵٪
          </span>
        </div>
        <div className="v">٪{toPersianDigits(goalPercent)}</div>
        <div className="l">پیشرفت به سوی هدف</div>
      </div>

      {/* 4. Current Weight */}
      <div className="card kpi">
        <div className="kpi-top">
          <span className="kpi-ico">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </span>
          <span className="kpi-trend up">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
            ۲ کیلو
          </span>
        </div>
        <div className="v">
          {toPersianDigits(currentWeight)}{" "}
          <span style={{ fontSize: "15px", color: "var(--ink-faint)", fontWeight: 600 }}>
            کیلو
          </span>
        </div>
        <div className="l">وزن فعلی</div>
      </div>
    </div>
  );
}
