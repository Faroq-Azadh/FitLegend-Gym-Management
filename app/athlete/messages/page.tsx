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

          <div
            className="card"
            style={{
              display: "flex",
              flexDirection: "column",
              height: "650px",
              maxHeight: "75vh",
              overflow: "hidden",
            }}
          >
            {/* Chat Header */}
            <div
              className="card-head"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className="avatar">آر</span>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--ink)", margin: 0 }}>
                    آرش رستمی
                  </h3>
                  <div style={{ fontSize: "12px", color: "var(--primary-dark)", fontWeight: 600, marginTop: "2px" }}>
                    آنلاین · پاسخگویی سریع
                  </div>
                </div>
              </div>
              <span className="pill">مربی ارشد فیتلجند</span>
            </div>

            {/* Chat Stream */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
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
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "80%",
                        borderRadius: "16px",
                        padding: "12px 16px",
                        fontSize: "14px",
                        lineHeight: 1.6,
                        boxShadow: "var(--shadow-sm)",
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
                        marginTop: "4px",
                        padding: "0 4px",
                      }}
                    >
                      {toPersianDigits(msg.time)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={handleSend}
              style={{
                padding: "14px 18px",
                borderTop: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "var(--surface)",
              }}
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
                  borderRadius: "12px",
                  padding: "10px 16px",
                  fontSize: "14px",
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                style={{ padding: "10px 20px" }}
              >
                ارسال
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
