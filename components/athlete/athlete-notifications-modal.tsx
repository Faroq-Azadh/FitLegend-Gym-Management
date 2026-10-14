"use client";

import { useState, useEffect } from "react";
import { toPersianDigits } from "@/lib/persian-digits";

export interface NotificationItem {
  id: number;
  type: "training" | "message" | "payment" | "class" | "alert";
  text: string;
  time: string;
  read: boolean;
  category: "training" | "payment";
}

// Backward compatibility type alias
export type AthleteNotificationItem = NotificationItem;

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    type: "training",
    text: "مربی <b>آرش رستمی</b> برنامه‌ی تمرین این هفته را به‌روزرسانی کرد",
    time: "۱۰ دقیقه پیش",
    read: false,
    category: "training",
  },
  {
    id: 2,
    type: "message",
    text: "پیام جدید از <b>آرش رستمی</b>: «عالی پیش می‌ری، ادامه بده!»",
    time: "۱ ساعت پیش",
    read: false,
    category: "training",
  },
  {
    id: 3,
    type: "payment",
    text: "پرداخت عضویت <b>۳ ماهه</b> با موفقیت ثبت شد",
    time: "دیروز",
    read: false,
    category: "payment",
  },
  {
    id: 4,
    type: "class",
    text: "کلاس <b>یوگا</b> فردا ساعت ۱۰:۰۰ رزرو شد",
    time: "دیروز",
    read: true,
    category: "training",
  },
  {
    id: 5,
    type: "alert",
    text: "عضویت شما تا <b>۵ روز دیگر</b> به پایان می‌رسد",
    time: "۲ روز پیش",
    read: true,
    category: "payment",
  },
  {
    id: 6,
    type: "training",
    text: "رکورد جدید! اسکوات <b>۸۰ کیلو</b> ثبت شد 🎉",
    time: "۳ روز پیش",
    read: true,
    category: "training",
  },
];

interface AthleteNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: NotificationItem[];
  onNotificationsChange?: (notes: NotificationItem[]) => void;
}

export function AthleteNotificationsModal({
  isOpen,
  onClose,
  notifications: externalNotifications,
  onNotificationsChange,
}: AthleteNotificationsModalProps) {
  const [internalNotifications, setInternalNotifications] =
    useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const notifications = externalNotifications ?? internalNotifications;

  const updateNotifications = (notes: NotificationItem[]) => {
    if (onNotificationsChange) {
      onNotificationsChange(notes);
    } else {
      setInternalNotifications(notes);
    }
  };

  const [filter, setFilter] = useState<"all" | "unread" | "training" | "payment">("all");

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMarkAllAsRead = () => {
    updateNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleToggleRead = (id: number) => {
    updateNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const filteredList = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.category === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "training":
        return {
          colorClass: "",
          path: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
        };
      case "message":
        return {
          colorClass: "amber",
          path: (
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          ),
        };
      case "payment":
        return {
          colorClass: "cyan",
          path: (
            <>
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </>
          ),
        };
      case "class":
        return {
          colorClass: "",
          path: (
            <>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </>
          ),
        };
      case "alert":
        return {
          colorClass: "rose",
          path: (
            <>
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <path d="M12 9v4M12 17h.01" />
            </>
          ),
        };
      default:
        return {
          colorClass: "",
          path: <circle cx="12" cy="12" r="8" />,
        };
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 backdrop-blur-[4px] p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[840px] max-h-[90vh] overflow-y-auto rounded-[24px] border border-border bg-bg shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <main className="content p-5 sm:p-7">
          {/* Page Head */}
          <div className="page-head">
            <div>
              <h1>مرکز اعلان‌ها</h1>
              <div className="sub">همه‌ی رویدادها و یادآوری‌های شما</div>
            </div>
            <div className="page-head-actions">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleMarkAllAsRead}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m5 12 5 5L20 7" />
                </svg>
                علامت‌زدن همه به‌عنوان خوانده‌شده
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-[10px] text-ink-faint transition-colors hover:bg-surface hover:text-ink"
                aria-label="بستن"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="h-5 w-5"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar">
            <div className="tabs-inline" id="nTabs">
              <button
                type="button"
                className={`tab ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                همه
              </button>
              <button
                type="button"
                className={`tab ${filter === "unread" ? "active" : ""}`}
                onClick={() => setFilter("unread")}
              >
                خوانده‌نشده
              </button>
              <button
                type="button"
                className={`tab ${filter === "training" ? "active" : ""}`}
                onClick={() => setFilter("training")}
              >
                تمرین
              </button>
              <button
                type="button"
                className={`tab ${filter === "payment" ? "active" : ""}`}
                onClick={() => setFilter("payment")}
              >
                پرداخت
              </button>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="card">
            <div className="card-head">
              <div>
                <h3>اعلان‌ها</h3>
                <div className="hint" id="nInfo">
                  {toPersianDigits(filteredList.length)} اعلان
                </div>
              </div>
              <span className="pill" id="unreadPill">
                {unreadCount > 0
                  ? `${toPersianDigits(unreadCount)} خوانده‌نشده`
                  : "همه خوانده شد"}
              </span>
            </div>

            <div id="nList">
              {filteredList.length > 0 ? (
                filteredList.map((n) => {
                  const ico = getIcon(n.type);
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleToggleRead(n.id)}
                      className={`notif-item ${n.read ? "" : "unread"}`}
                    >
                      <div className={`ni-ico ${ico.colorClass}`}>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {ico.path}
                        </svg>
                      </div>
                      <div className="ni-body">
                        <div
                          className="t"
                          dangerouslySetInnerHTML={{ __html: n.text }}
                        />
                        <div className="time">{n.time}</div>
                      </div>
                      {!n.read && <span className="ni-dot" />}
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <div className="es-ico neutral">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                    </svg>
                  </div>
                  <div className="es-title">اعلانی نیست</div>
                  <div className="es-sub">
                    در این دسته اعلان خوانده‌نشده‌ای وجود ندارد.
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
