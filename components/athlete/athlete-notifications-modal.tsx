"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/persian-digits";

export interface AthleteNotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "workout" | "class" | "coach" | "system";
}

const INITIAL_NOTIFICATIONS: AthleteNotificationItem[] = [
  {
    id: "1",
    title: "یادآوری کلاس TRX",
    description: "کلاس TRX و کاهش وزن شما امروز ساعت ۱۷:۳۰ در سالن هوازی برگزار می‌شود.",
    time: "۱ ساعت پیش",
    read: false,
    type: "class",
  },
  {
    id: "2",
    title: "پیام جدید از مربی",
    description: "آرش رستمی: این هفته ۵ کیلو به اسکوات اضافه کن ولی روی فرم تمرکز کن.",
    time: "۱۰:۲۳ امروز",
    read: false,
    type: "coach",
  },
  {
    id: "3",
    title: "بروزرسانی برنامه تمرین",
    description: "برنامه تمرینی دوره جدید سینه و سرشانه برای شما فعال گردید.",
    time: "دیروز",
    read: true,
    type: "workout",
  },
  {
    id: "4",
    title: "تأیید رزرو کلاس فانکشنال",
    description: "رزرو شما برای کلاس فانکشنال چهارشنبه ساعت ۰۹:۳۰ با موفقیت تأیید شد.",
    time: "۲ روز پیش",
    read: true,
    type: "class",
  },
];

interface AthleteNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AthleteNotificationsModal({
  isOpen,
  onClose,
}: AthleteNotificationsModalProps) {
  const [notifications, setNotifications] = useState<AthleteNotificationItem[]>(INITIAL_NOTIFICATIONS);

  if (!isOpen) return null;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-[3px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-[480px] overflow-hidden rounded-[20px] border border-border bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-[18px_22px]">
          <div className="flex items-center gap-2">
            <h3 className="text-[17px] font-extrabold text-ink">اعلان‌های شما</h3>
            <span className="rounded-full bg-tint px-2.5 py-0.5 text-[11.5px] font-bold text-primary-dark">
              {toPersianDigits(notifications.filter((n) => !n.read).length)} جدید
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-[12.5px] font-semibold text-primary-dark hover:underline"
            >
              خوانده شدن همه
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-bg hover:text-ink"
              aria-label="بستن"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[420px] overflow-y-auto divide-y divide-border p-2">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleRead(item.id)}
              className={cn(
                "flex items-start gap-3.5 p-3.5 rounded-[12px] transition-colors cursor-pointer",
                item.read ? "hover:bg-bg" : "bg-tint/40 hover:bg-tint/70"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]",
                  item.type === "coach"
                    ? "bg-cyan/15 text-cyan-600"
                    : item.type === "class"
                    ? "bg-tint text-primary-dark"
                    : "bg-[#FFFBEB] text-[#D97706]"
                )}
              >
                {item.type === "coach" && (
                  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                )}
                {item.type === "class" && (
                  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                )}
                {item.type === "workout" && (
                  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 2h6a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2V3a1 1 0 0 1 1-1Z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="text-[13.5px] font-bold text-ink">{item.title}</div>
                  <div className="text-[11px] text-ink-faint">{toPersianDigits(item.time)}</div>
                </div>
                <div className="text-[12.5px] text-ink-soft leading-relaxed mt-1">
                  {toPersianDigits(item.description)}
                </div>
              </div>
              {!item.read && (
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
