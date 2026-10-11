"use client";

import { useState } from "react";
import Link from "next/link";
import { toPersianDigits } from "@/lib/persian-digits";
import { AthleteSidebar } from "@/components/athlete/athlete-sidebar";
import { AthleteTopbar } from "@/components/athlete/athlete-topbar";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  date: string;
  type: "class" | "coach" | "workout" | "billing";
  isRead: boolean;
}

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "یادآوری کلاس TRX",
    body: "کلاس TRX و کاهش وزن شما امروز ساعت ۱۷:۳۰ در سالن هوازی برگزار می‌شود. لطفاً ۱۰ دقیقه زودتر حضور داشته باشید.",
    date: "۱ ساعت پیش",
    type: "class",
    isRead: false,
  },
  {
    id: "2",
    title: "پیام جدید از مربی آرش رستمی",
    body: "«این هفته ۵ کیلو به اسکوات اضافه کن ولی روی فرم تمرکز کن. عالی پیش می‌ری 💪»",
    date: "۱۰:۲۳ امروز",
    type: "coach",
    isRead: false,
  },
  {
    id: "3",
    title: "بروزرسانی برنامه تمرینی دوره جدید",
    body: "برنامه تمرینی فاز دوم شامل تمرینات سینه و پشت‌بازو توسط مربی در حساب شما بارگذاری شد.",
    date: "دیروز",
    type: "workout",
    isRead: true,
  },
  {
    id: "4",
    title: "تأیید رزرو کلاس فانکشنال",
    body: "رزرو شما برای کلاس فانکشنال و کراس در روز چهارشنبه ساعت ۰۹:۳۰ با موفقیت تأیید گردید.",
    date: "۲ روز پیش",
    type: "class",
    isRead: true,
  },
  {
    id: "5",
    title: "رسید پرداخت اشتراک طلایی",
    body: "پرداخت فاکتور INV-1092 به مبلغ ۲,۸۵۰,۰۰۰ تومان با موفقیت ثبت شد و فاکتور صادر گردید.",
    date: "۱۵ شهریور",
    type: "billing",
    isRead: true,
  },
];

export default function AthleteNotificationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>(NOTIFICATIONS);

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  return (
    <div className="app">
      <AthleteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <AthleteTopbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="content">
          <div className="page-head">
            <div>
              <h1>اعلان‌ها و پیام‌ها</h1>
              <div className="sub">رویدادها، یادآوری کلاس‌ها و هشدارهای سیستم</div>
            </div>
            <div className="page-head-actions">
              <button
                type="button"
                onClick={markAllRead}
                className="btn btn-outline btn-sm"
              >
                علامت‌گذاری همه به عنوان خوانده شده
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-body divide-y divide-border">
              {items.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 flex items-start gap-4 transition-colors ${
                    n.isRead ? "" : "bg-tint/30"
                  }`}
                >
                  <div className="feed-ico shrink-0 mt-0.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-[14.5px] text-ink">{toPersianDigits(n.title)}</div>
                      <div className="text-[12px] text-ink-faint">{toPersianDigits(n.date)}</div>
                    </div>
                    <div className="text-[13.5px] text-ink-soft mt-1 leading-relaxed">{toPersianDigits(n.body)}</div>
                  </div>
                  {!n.isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
