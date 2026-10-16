"use client";

import { useState } from "react";
import { useCoachDashboard } from "@/lib/hooks/queries/use-coach-dashboard";
import { toPersianDigits } from "@/lib/persian-digits";
import { cn } from "@/lib/utils";

export function CoachTodaySessions() {
  const { data: dashboard } = useCoachDashboard();
  const [sessions, setSessions] = useState(dashboard?.today_sessions ?? []);

  // Sync if dashboard sessions change and local state hasn't been edited
  const currentSessions = sessions.length > 0 ? sessions : (dashboard?.today_sessions ?? []);

  const toggleStatus = (id: string) => {
    setSessions((prev) =>
      (prev.length > 0 ? prev : (dashboard?.today_sessions ?? [])).map((s) => {
        if (s.id === id) {
          const nextStatus = s.status === "attended" ? "pending" : "attended";
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  return (
    <div className="card bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      {/* Card Head */}
      <div className="flex items-center justify-between p-[20px_22px] border-b border-border">
        <div>
          <h3 className="text-[16px] font-extrabold text-ink">تمرین‌های امروز</h3>
          <div className="text-[12.5px] text-ink-faint mt-[3px]">
            جلسات برنامه‌ریزی‌شده برای امروز
          </div>
        </div>
        <span className="pill text-[11.5px] font-bold text-primary-dark bg-tint px-[11px] py-[5px] rounded-full">
          {toPersianDigits(currentSessions.length)} جلسه
        </span>
      </div>

      {/* Card Body */}
      <div className="p-[22px]">
        {currentSessions.map((session) => {
          const isAttended = session.status === "attended";
          return (
            <div
              key={session.id}
              className="class-row flex items-center gap-[14px] py-[14px] border-b border-border last:border-b-0 last:pb-0 first:pt-0"
            >
              {/* Time Block */}
              <div className="class-time shrink-0 w-[58px] text-center bg-bg rounded-[10px] p-[8px_4px]">
                <div className="h text-[15px] font-extrabold text-ink">
                  {toPersianDigits(session.time)}
                </div>
                <div className="m text-[11px] text-ink-faint">
                  {toPersianDigits(session.duration_minutes)} دقیقه
                </div>
              </div>

              {/* Session Info */}
              <div className="class-info flex-1 min-w-0">
                <div className="nm text-[14px] font-bold text-ink truncate">
                  {session.workout_title} · {session.member_name}
                </div>
                <div className="coach text-[12.5px] text-ink-faint mt-[2px] truncate">
                  {session.program_name}
                </div>
              </div>

              {/* Status Badge with interactive toggle */}
              <button
                type="button"
                onClick={() => toggleStatus(session.id)}
                title="برای تغییر وضعیت کلیک کنید"
                className={cn(
                  "status-badge inline-flex items-center gap-[6px] text-[12px] font-bold px-[11px] py-[5px] rounded-full transition-transform active:scale-95 cursor-pointer",
                  isAttended ? "active bg-[#E0F2FE] text-[#0284C7]" : "expiring bg-[#FFFBEB] text-[#B45309]"
                )}
              >
                <span
                  className={cn(
                    "d h-[6px] w-[6px] rounded-full",
                    isAttended ? "bg-[#0EA5E9]" : "bg-[#F59E0B]"
                  )}
                />
                <span>{isAttended ? "حاضر" : "در انتظار"}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
