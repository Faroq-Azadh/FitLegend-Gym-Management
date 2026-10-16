"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { toPersianDigits } from "@/lib/persian-digits";

/* ───── Types ───── */
interface ChatMessage {
  id: string;
  sender: "coach" | "student";
  text: string;
  time: string;
}

interface StudentChat {
  id: string;
  name: string;
  initials: string;
  avatarGradient: string;
  program: string;
  status: "online" | "offline";
  statusText: string;
  unread: number;
  lastTime: string;
  lastPreview: string;
  messages: ChatMessage[];
}

/* ───── Seed Data ───── */
const INITIAL_CHATS: StudentChat[] = [
  {
    id: "c1",
    name: "سارا محمدی",
    initials: "سم",
    avatarGradient: "linear-gradient(135deg, #F25C1F, #0EA5E9)",
    program: "حجم — هفته ۳",
    status: "online",
    statusText: "آنلاین",
    unread: 2,
    lastTime: "۱۰:۲۴",
    lastPreview: "ممنون مربی، برنامه رو دیدم 🙏",
    messages: [
      { id: "m1", sender: "coach", text: "سلام سارا 👋 برنامه‌ی تمرینی هفته‌ی جدیدت رو آماده کردم.", time: "دیروز ۲۰:۱۰" },
      { id: "m2", sender: "student", text: "سلام مربی، ممنونم! الان نگاه می‌کنم.", time: "دیروز ۲۰:۱۴" },
      { id: "m3", sender: "student", text: "برنامه رو دیدم، خیلی خوب بود 🙏 فقط یه سوال داشتم درباره‌ی روز پا.", time: "۱۰:۱۸" },
      { id: "m4", sender: "coach", text: "بگو عزیزم، در خدمتم.", time: "۱۰:۲۰" },
      { id: "m5", sender: "student", text: "ممنون مربی، برنامه رو دیدم 🙏", time: "۱۰:۲۴" },
    ],
  },
  {
    id: "c2",
    name: "رضا کریمی",
    initials: "رک",
    avatarGradient: "linear-gradient(135deg, #F59E0B, #EF4444)",
    program: "چربی‌سوزی — هفته ۱",
    status: "online",
    statusText: "آنلاین",
    unread: 1,
    lastTime: "۰۹:۴۰",
    lastPreview: "میشه جلسه دوشنبه رو جابه‌جا کنیم؟",
    messages: [
      { id: "m6", sender: "student", text: "سلام مربی خسته نباشید. دوشنبه ساعت ۶ امتحان دانشگاه دارم.", time: "۰۹:۳۸" },
      { id: "m7", sender: "student", text: "میشه جلسه دوشنبه رو جابه‌جا کنیم؟ مثلاً سه‌شنبه صبح یا چهارشنبه؟", time: "۰۹:۴۰" },
    ],
  },
  {
    id: "c3",
    name: "مهدی نوری",
    initials: "من",
    avatarGradient: "linear-gradient(135deg, #6366F1, #0EA5E9)",
    program: "قدرت — هفته ۴",
    status: "offline",
    statusText: "آخرین بازدید دیروز",
    unread: 0,
    lastTime: "دیروز",
    lastPreview: "تمرین امروز عالی بود!",
    messages: [
      { id: "m8", sender: "coach", text: "مهدی جان امروز حرکت فیله کمر رو کنترل‌شده بزن.", time: "دیروز ۱۶:۴۰" },
      { id: "m9", sender: "student", text: "چشم مربی، دقیقاً همین کارو کردم.", time: "دیروز ۱۸:۱۵" },
      { id: "m10", sender: "student", text: "تمرین امروز عالی بود!", time: "دیروز ۱۸:۲۰" },
    ],
  },
  {
    id: "c4",
    name: "مینا تهرانی",
    initials: "مت",
    avatarGradient: "linear-gradient(135deg, #EC4899, #8B5CF6)",
    program: "شروع — هفته ۲",
    status: "offline",
    statusText: "آخرین بازدید ۲ ساعت پیش",
    unread: 0,
    lastTime: "دیروز",
    lastPreview: "حتماً مربی، ممنون 🙏",
    messages: [
      { id: "m11", sender: "coach", text: "مینا جان کاردیو آخر تمرین رو فراموش نکن.", time: "دیروز ۱۵:۰۰" },
      { id: "m12", sender: "student", text: "حتماً مربی، ممنون 🙏", time: "دیروز ۱۵:۱۰" },
    ],
  },
];

/* ───── Auto‑reply pool ───── */
const STUDENT_REPLIES = [
  "چشم مربی، حتماً انجام میدم 👌",
  "ممنون از راهنمایی‌تون 🙏",
  "باشه مربی، فردا اعمال می‌کنم.",
  "خیلی ممنون، متوجه شدم!",
  "حتماً، همین الان شروع می‌کنم 💪",
];

/* ───── Component ───── */
interface CoachMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CoachMessagesModal({ isOpen, onClose }: CoachMessagesModalProps) {
  const [chats, setChats] = useState<StudentChat[]>(INITIAL_CHATS);
  const [activeId, setActiveId] = useState(INITIAL_CHATS[0].id);
  const [inputVal, setInputVal] = useState("");
  const [showContacts, setShowContacts] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find((c) => c.id === activeId)!;

  // Auto‑scroll messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChat?.messages.length, activeId]);

  if (!isOpen) return null;

  const totalUnread = chats.reduce((s, c) => s + c.unread, 0);

  const selectChat = (id: string) => {
    setActiveId(id);
    setShowContacts(false);
    // Mark as read
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const newMsg: ChatMessage = {
      id: String(Date.now()),
      sender: "coach",
      text: inputVal.trim(),
      time: "همین الان",
    };

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              messages: [...c.messages, newMsg],
              lastPreview: newMsg.text,
              lastTime: "الان",
            }
          : c
      )
    );
    setInputVal("");

    // Simulate student auto‑reply
    setTimeout(() => {
      const reply: ChatMessage = {
        id: String(Date.now() + 1),
        sender: "student",
        text: STUDENT_REPLIES[Math.floor(Math.random() * STUDENT_REPLIES.length)],
        time: "چند لحظه پیش",
      };
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                messages: [...c.messages, reply],
                lastPreview: reply.text,
                lastTime: "الان",
              }
            : c
        )
      );
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

      {/* Modal */}
      <div className="relative z-10 w-full max-w-[720px] overflow-hidden rounded-[20px] border border-border bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex max-h-[85vh]">
        {/* ── Contact List (Right side in RTL) ── */}
        <div
          className={`w-full min-[520px]:w-[240px] min-[520px]:min-w-[240px] border-l border-border flex flex-col bg-surface ${
            showContacts ? "flex" : "hidden min-[520px]:flex"
          }`}
        >
          {/* Contact header */}
          <div className="flex items-center justify-between p-3.5 border-b border-border">
            <h3 className="text-[15px] font-extrabold text-ink flex items-center gap-2">
              پیام‌ها
              {totalUnread > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-ink">
                  {toPersianDigits(totalUnread)}
                </span>
              )}
            </h3>
            <div className="flex items-center gap-1.5">
              <Link
                href="/coach/messages"
                onClick={onClose}
                className="text-[11.5px] font-semibold text-primary-dark hover:underline"
                title="صفحه کامل پیام‌ها"
              >
                صفحه کامل
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint hover:bg-bg hover:text-ink transition-colors min-[520px]:flex"
                aria-label="بستن"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Contact list */}
          <div className="flex-1 overflow-y-auto">
            {chats.map((chat) => (
              <button
                key={chat.id}
                type="button"
                onClick={() => selectChat(chat.id)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-3 text-right transition-colors border-b border-border/60 ${
                  chat.id === activeId
                    ? "bg-tint/60"
                    : "hover:bg-bg/70"
                }`}
              >
                {/* Avatar */}
                <span
                  style={{
                    width: 36,
                    height: 36,
                    minWidth: 36,
                    borderRadius: 10,
                    background: chat.avatarGradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 12,
                    color: "#fff",
                  }}
                >
                  {chat.initials}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-ink truncate">
                      {chat.name}
                    </span>
                    <span className="text-[11px] text-ink-faint mr-1 whitespace-nowrap">
                      {toPersianDigits(chat.lastTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[12px] text-ink-faint truncate max-w-[130px]">
                      {toPersianDigits(chat.lastPreview)}
                    </span>
                    {chat.unread > 0 && (
                      <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-ink mr-1">
                        {toPersianDigits(chat.unread)}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Chat View (Left side in RTL) ── */}
        <div
          className={`flex-1 flex flex-col min-w-0 ${
            showContacts ? "hidden min-[520px]:flex" : "flex"
          }`}
        >
          {/* Chat header */}
          <div className="flex items-center gap-3 border-b border-border p-3.5 bg-surface">
            {/* Back button (mobile) */}
            <button
              type="button"
              onClick={() => setShowContacts(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-bg hover:text-ink transition-colors min-[520px]:hidden"
              aria-label="بازگشت"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M9 18l6-12" /><path d="M15 18l-6-12" />
              </svg>
            </button>

            <span
              style={{
                width: 36,
                height: 36,
                minWidth: 36,
                borderRadius: 10,
                background: activeChat.avatarGradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 12,
                color: "#fff",
              }}
            >
              {activeChat.initials}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-[14px] font-extrabold text-ink truncate">
                  {activeChat.name}
                </h4>
                {activeChat.status === "online" && (
                  <span className="rounded-full bg-tint px-2 py-0.5 text-[10.5px] font-bold text-primary-dark">
                    آنلاین
                  </span>
                )}
              </div>
              <p className="text-[11.5px] text-ink-faint truncate">
                {toPersianDigits(activeChat.program)}
              </p>
            </div>

            {/* Close on desktop */}
            <button
              type="button"
              onClick={onClose}
              className="hidden min-[520px]:flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint hover:bg-bg hover:text-ink transition-colors"
              aria-label="بستن"
            >
              ✕
            </button>
          </div>

          {/* Messages stream */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-2.5"
            style={{ minHeight: 260, maxHeight: 380 }}
          >
            {activeChat.messages.map((msg) => {
              const isCoach = msg.sender === "coach";
              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isCoach ? "flex-start" : "flex-end",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      maxWidth: "82%",
                      padding: "10px 14px",
                      borderRadius: 14,
                      fontSize: "13.5px",
                      lineHeight: "1.6",
                      background: isCoach ? "var(--primary)" : "var(--bg)",
                      color: isCoach ? "#0F172A" : "var(--ink)",
                      border: isCoach ? "none" : "1px solid var(--border)",
                      fontWeight: isCoach ? 600 : 500,
                    }}
                  >
                    {toPersianDigits(msg.text)}
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--ink-faint)",
                      marginTop: 3,
                      padding: "0 4px",
                    }}
                  >
                    {toPersianDigits(msg.time)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="border-t border-border p-3 flex items-center gap-2 bg-surface"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="پیام خود را بنویسید…"
              style={{
                flex: 1,
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 10,
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
    </div>
  );
}
