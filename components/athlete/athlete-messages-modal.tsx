"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/persian-digits";

export interface AthleteChatMessage {
  id: string;
  sender: "coach" | "me";
  text: string;
  time: string;
}

const INITIAL_MESSAGES: AthleteChatMessage[] = [
  {
    id: "1",
    sender: "coach",
    text: "سلام سارا جان، تمرین امروز چطور پیش رفت؟ احساس خستگی یا درد غیرعادی نداشتی؟",
    time: "دیروز ۱۸:۳۰",
  },
  {
    id: "2",
    sender: "me",
    text: "سلام مربی! پرس سینه عالی بود و ست‌ها رو کامل زدم، فقط ست آخر پشت‌بازو کمی سنگین بود.",
    time: "دیروز ۱۹:۰۵",
  },
  {
    id: "3",
    sender: "coach",
    text: "این هفته ۵ کیلو به اسکوات اضافه کن ولی روی فرم تمرکز کن. عالی پیش می‌ری 💪",
    time: "۱۰:۲۳ امروز",
  },
];

interface AthleteMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AthleteMessagesModal({
  isOpen,
  onClose,
}: AthleteMessagesModalProps) {
  const [messages, setMessages] = useState<AthleteChatMessage[]>(INITIAL_MESSAGES);
  const [inputVal, setInputVal] = useState("");

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const newMsg: AthleteChatMessage = {
      id: String(Date.now()),
      sender: "me",
      text: inputVal.trim(),
      time: "همین الان",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal("");

    // Simulate instant coach reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "coach",
          text: "پیامت دریافت شد، حتماً بررسی می‌کنم و در برنامه اعمال می‌کنم! 👏",
          time: "چند لحظه پیش",
        },
      ]);
    }, 1200);
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
      <div className="relative z-10 w-full max-w-[500px] overflow-hidden rounded-[20px] border border-border bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-[16px_20px] bg-surface">
          <div className="flex items-center gap-3">
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: "linear-gradient(135deg, var(--primary), var(--cyan))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 14,
                color: "var(--ink)",
              }}
            >
              آر
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-extrabold text-ink">آرش رستمی</h3>
                <span className="rounded-full bg-tint px-2 py-0.5 text-[11px] font-bold text-primary-dark">
                  آنلاین
                </span>
              </div>
              <div className="text-[12px] text-ink-faint">مربی اختصاصی شما</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/athlete/messages"
              onClick={onClose}
              className="text-[12px] font-semibold text-primary-dark hover:underline"
              title="مشاهده در صفحه تمام‌صفحه"
            >
              صفحه کامل
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-bg hover:text-ink transition-colors"
              aria-label="بستن"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3"
          style={{ minHeight: "260px", maxHeight: "380px" }}
        >
          {messages.map((msg) => {
            const isMe = msg.sender === "me";
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMe ? "flex-start" : "flex-end",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "10px 14px",
                    borderRadius: "14px",
                    fontSize: "13.5px",
                    lineHeight: "1.6",
                    background: isMe ? "var(--primary)" : "var(--bg)",
                    color: isMe ? "#0F172A" : "var(--ink)",
                    border: isMe ? "none" : "1px solid var(--border)",
                    fontWeight: isMe ? 600 : 500,
                  }}
                >
                  {toPersianDigits(msg.text)}
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--ink-faint)",
                    marginTop: "3px",
                    padding: "0 4px",
                  }}
                >
                  {toPersianDigits(msg.time)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSend}
          className="border-t border-border p-3 flex items-center gap-2 bg-surface"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="پیام خود را برای مربی بنویسید…"
            style={{
              flex: 1,
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "9px 14px",
              fontSize: "13.5px",
              color: "var(--ink)",
              outline: "none",
            }}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            style={{ padding: "9px 16px" }}
          >
            ارسال
          </button>
        </form>
      </div>
    </div>
  );
}
