"use client";

import { useState } from "react";
import Link from "next/link";
import { toPersianDigits } from "@/lib/persian-digits";
import { AthleteSidebar } from "@/components/athlete/athlete-sidebar";
import { AthleteTopbar } from "@/components/athlete/athlete-topbar";

interface ChatMessage {
  id: string;
  sender: "coach" | "me";
  text: string;
  time: string;
}

const INITIAL_CHAT: ChatMessage[] = [
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

export default function AthleteMessagesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [inputVal, setInputVal] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const newMsg: ChatMessage = {
      id: String(Date.now()),
      sender: "me",
      text: inputVal.trim(),
      time: "همین الان",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal("");

    // Simulate coach auto-reply
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
    <div className="app">
      <AthleteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <AthleteTopbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="content">
          <div className="page-head">
            <div>
              <h1>پیام با مربی</h1>
              <div className="sub">گفتگوی مستقیم با مربی اختصاصی شما (آرش رستمی)</div>
            </div>
          </div>

          <div className="card flex flex-col h-[650px] max-h-[75vh]">
            {/* Chat Header */}
            <div className="card-head py-3.5">
              <div className="flex items-center gap-3">
                <span className="avatar">آر</span>
                <div>
                  <h3 className="text-[15px] font-bold text-ink">آرش رستمی</h3>
                  <div className="text-[12px] text-primary-dark font-medium">آنلاین · پاسخگویی سریع</div>
                </div>
              </div>
              <span className="pill text-[11px]">مربی ارشد تیتان</span>
            </div>

            {/* Chat Stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.sender === "me";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-start" : "items-end"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-[16px] p-3.5 text-[14px] leading-relaxed shadow-sm ${
                        isMe
                          ? "bg-primary text-slate-900 rounded-br-xs font-medium"
                          : "bg-bg text-ink border border-border rounded-bl-xs"
                      }`}
                    >
                      {toPersianDigits(msg.text)}
                    </div>
                    <span className="text-[11px] text-ink-faint mt-1 px-1">
                      {toPersianDigits(msg.time)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSend} className="p-3.5 border-t border-border flex items-center gap-2 bg-surface">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="پیام خود را برای مربی بنویسید…"
                className="flex-1 bg-bg border border-border rounded-[12px] px-4 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-primary"
              />
              <button type="submit" className="btn btn-primary btn-sm px-5">
                ارسال
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
