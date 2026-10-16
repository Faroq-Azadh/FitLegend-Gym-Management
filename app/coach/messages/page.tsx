"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { CoachSidebar } from "@/components/coach/coach-sidebar";
import { CoachTopbar } from "@/components/coach/coach-topbar";
import { toPersianDigits } from "@/lib/persian-digits";

interface ChatMessage {
  id: string;
  type: "day" | "in" | "out";
  text: string;
  time?: string;
  attachment?: {
    type: "program" | "image" | "doc";
    title: string;
    detail?: string;
  };
}

interface ConversationItem {
  id: string;
  studentId?: string;
  name: string;
  initials: string;
  avatarGradient: string;
  phone: string;
  program: string;
  status: "online" | "offline";
  statusText: string;
  unread: number;
  lastTime: string;
  lastPreview: string;
  messages: ChatMessage[];
  attendanceRate?: number;
  dueDate?: string;
}

interface StudentRosterItem {
  id: string;
  name: string;
  phone: string;
  program: string;
  status: "active" | "expiring" | "expired";
  statusLabel: string;
  attendanceRate: number;
  avatarGradient: string;
  initials: string;
}

const ROSTER_STUDENTS: StudentRosterItem[] = [
  {
    id: "1024",
    name: "سارا محمدی",
    phone: "۰۹۱۲۳۴۵۶۷۸۱",
    program: "حجم — هفته ۳",
    status: "active",
    statusLabel: "فعال",
    attendanceRate: 98,
    avatarGradient: "linear-gradient(135deg, #F25C1F, #0EA5E9)",
    initials: "سم",
  },
  {
    id: "1025",
    name: "امیر صادقی",
    phone: "۰۹۱۸۲۳۴۵۶۷۲",
    program: "قدرت — هفته ۵",
    status: "active",
    statusLabel: "فعال",
    attendanceRate: 94,
    avatarGradient: "linear-gradient(135deg, #D94A10, #6366F1)",
    initials: "اص",
  },
  {
    id: "1026",
    name: "رضا کریمی",
    phone: "۰۹۳۵۱۲۳۴۵۶۳",
    program: "چربی‌سوزی — هفته ۱",
    status: "active",
    statusLabel: "فعال",
    attendanceRate: 89,
    avatarGradient: "linear-gradient(135deg, #F59E0B, #EF4444)",
    initials: "رک",
  },
  {
    id: "1027",
    name: "مینا تهرانی",
    phone: "۰۹۱۹۸۷۶۵۴۳۴",
    program: "شروع — هفته ۲",
    status: "active",
    statusLabel: "فعال",
    attendanceRate: 82,
    avatarGradient: "linear-gradient(135deg, #EC4899, #8B5CF6)",
    initials: "مت",
  },
  {
    id: "1028",
    name: "نیما اکبری",
    phone: "۰۹۳۶۷۸۹۰۱۲۵",
    program: "حجم — هفته ۴",
    status: "expired",
    statusLabel: "منقضی شده",
    attendanceRate: 54,
    avatarGradient: "linear-gradient(135deg, #EF4444, #F59E0B)",
    initials: "نا",
  },
  {
    id: "1029",
    name: "مهدی نوری",
    phone: "۰۹۱۲۵۶۷۸۹۰۶",
    program: "قدرت — هفته ۴",
    status: "active",
    statusLabel: "فعال",
    attendanceRate: 76,
    avatarGradient: "linear-gradient(135deg, #6366F1, #0EA5E9)",
    initials: "من",
  },
  {
    id: "1030",
    name: "نگار احمدی",
    phone: "۰۹۳۰۴۵۶۷۸۹۷",
    program: "چربی‌سوزی — هفته ۶",
    status: "active",
    statusLabel: "فعال",
    attendanceRate: 91,
    avatarGradient: "linear-gradient(135deg, #F43F5E, #F59E0B)",
    initials: "نا",
  },
  {
    id: "1031",
    name: "بهراد یوسفی",
    phone: "۰۹۱۱۱۱۲۳۴۵۸",
    program: "قدرت — هفته ۲",
    status: "active",
    statusLabel: "فعال",
    attendanceRate: 88,
    avatarGradient: "linear-gradient(135deg, #8B5CF6, #0EA5E9)",
    initials: "بی",
  },
  {
    id: "1032",
    name: "علی پوراحمد",
    phone: "۰۹۱۲۳۳۳۴۴۵۵",
    program: "حجم — هفته ۵",
    status: "active",
    statusLabel: "فعال",
    attendanceRate: 95,
    avatarGradient: "linear-gradient(135deg, #10B981, #0EA5E9)",
    initials: "عپ",
  },
  {
    id: "1033",
    name: "فاطمه حسینی",
    phone: "۰۹۱۹۴۴۴۵۵۶۶",
    program: "فیتنس — هفته ۳",
    status: "active",
    statusLabel: "فعال",
    attendanceRate: 90,
    avatarGradient: "linear-gradient(135deg, #EC4899, #F59E0B)",
    initials: "فح",
  },
  {
    id: "1034",
    name: "سینا داوودی",
    phone: "۰۹۳۵۵۵۵۶۶۷۷",
    program: "آمادگی جسمانی — هفته ۱",
    status: "active",
    statusLabel: "فعال",
    attendanceRate: 84,
    avatarGradient: "linear-gradient(135deg, #0EA5E9, #6366F1)",
    initials: "سد",
  },
];

const INITIAL_CONVERSATIONS: ConversationItem[] = [
  {
    id: "conv-sara",
    studentId: "1024",
    name: "سارا محمدی",
    initials: "سم",
    avatarGradient: "linear-gradient(135deg, #F25C1F, #0EA5E9)",
    phone: "۰۹۱۲۳۴۵۶۷۸۱",
    program: "حجم — هفته ۳",
    status: "online",
    statusText: "آنلاین",
    unread: 2,
    lastTime: "۱۰:۲۴",
    lastPreview: "ممنون مربی، برنامه رو دیدم 🙏",
    attendanceRate: 98,
    dueDate: "۱۵ مرداد",
    messages: [
      { id: "m1", type: "day", text: "دیروز" },
      {
        id: "m2",
        type: "out",
        text: "سلام سارا 👋 برنامه‌ی تمرینی هفته‌ی جدیدت رو آماده کردم و برات فرستادم.",
        time: "۲۰:۱۰",
      },
      {
        id: "m3",
        type: "in",
        text: "سلام مربی، ممنونم! الان نگاه می‌کنم.",
        time: "۲۰:۱۴",
      },
      { id: "m4", type: "day", text: "امروز" },
      {
        id: "m5",
        type: "in",
        text: "برنامه رو دیدم، خیلی خوب بود 🙏 فقط یه سوال داشتم درباره‌ی روز پا.",
        time: "۱۰:۱۸",
      },
      {
        id: "m6",
        type: "out",
        text: "بگو عزیزم، در خدمتم.",
        time: "۱۰:۲۰",
      },
      {
        id: "m7",
        type: "in",
        text: "برای اسکوات، با همون وزن قبلی ادامه بدم یا اضافه کنم؟",
        time: "۱۰:۲۱",
      },
      {
        id: "m8",
        type: "out",
        text: "این هفته ۵ کیلو اضافه کن ولی روی فرم تمرکز کن. اگه سخت بود، تعداد تکرار رو کم کن نه وزن رو.",
        time: "۱۰:۲۳",
      },
      {
        id: "m9",
        type: "in",
        text: "ممنون مربی، برنامه رو دیدم 🙏 حتماً همین‌طور پیش می‌رم.",
        time: "۱۰:۲۴",
      },
    ],
  },
  {
    id: "conv-reza",
    studentId: "1026",
    name: "رضا کریمی",
    initials: "رک",
    avatarGradient: "linear-gradient(135deg, #F59E0B, #EF4444)",
    phone: "۰۹۳۵۱۲۳۴۵۶۳",
    program: "چربی‌سوزی — هفته ۱",
    status: "online",
    statusText: "آنلاین",
    unread: 1,
    lastTime: "۰۹:۴۰",
    lastPreview: "میشه جلسه دوشنبه رو جابه‌جا کنیم؟",
    attendanceRate: 89,
    dueDate: "۲ تیر",
    messages: [
      { id: "m10", type: "day", text: "امروز" },
      {
        id: "m11",
        type: "in",
        text: "سلام مربی خسته نباشید. دوشنبه ساعت ۶ امتحان دانشگاه دارم.",
        time: "۰۹:۳۸",
      },
      {
        id: "m12",
        type: "in",
        text: "میشه جلسه دوشنبه رو جابه‌جا کنیم؟ مثلاً سه‌شنبه صبح یا چهارشنبه؟",
        time: "۰۹:۴۰",
      },
    ],
  },
  {
    id: "conv-mehdi",
    studentId: "1029",
    name: "مهدی نوری",
    initials: "من",
    avatarGradient: "linear-gradient(135deg, #6366F1, #0EA5E9)",
    phone: "۰۹۱۲۵۶۷۸۹۰۶",
    program: "قدرت — هفته ۴",
    status: "offline",
    statusText: "آخرین بازدید دیروز",
    unread: 0,
    lastTime: "دیروز",
    lastPreview: "تمرین امروز عالی بود!",
    attendanceRate: 76,
    dueDate: "۱۰ شهریور",
    messages: [
      { id: "m13", type: "day", text: "دیروز" },
      {
        id: "m14",
        type: "out",
        text: "مهدی جان امروز حرکت فیله کمر رو کنترل‌شده بزن.",
        time: "۱۶:۴۰",
      },
      {
        id: "m15",
        type: "in",
        text: "چشم مربی، دقیقاً همین کارو کردم و اصلاً فشاری به ستون فقرات نیومد.",
        time: "۱۸:۱۵",
      },
      {
        id: "m16",
        type: "in",
        text: "تمرین امروز عالی بود!",
        time: "۱۸:۱۶",
      },
    ],
  },
  {
    id: "conv-negar",
    studentId: "1030",
    name: "نگار احمدی",
    initials: "نا",
    avatarGradient: "linear-gradient(135deg, #F43F5E, #F59E0B)",
    phone: "۰۹۳۰۴۵۶۷۸۹۷",
    program: "چربی‌سوزی — هفته ۶",
    status: "offline",
    statusText: "آخرین بازدید ۲ ساعت پیش",
    unread: 0,
    lastTime: "دیروز",
    lastPreview: "باشه حتماً جبران می‌کنم",
    attendanceRate: 91,
    dueDate: "۵ تیر",
    messages: [
      { id: "m17", type: "day", text: "دیروز" },
      {
        id: "m18",
        type: "out",
        text: "نگار خانم جلسه دیروز غیبت داشتید، برای حفظ روند پیشرفت مهمه مرتب باشید.",
        time: "۱۴:۰۰",
      },
      {
        id: "m19",
        type: "in",
        text: "سلام استاد، متاسفانه سر کار شیفت اضافه داشتم و نرسیدم.",
        time: "۱۵:۳۰",
      },
      {
        id: "m20",
        type: "in",
        text: "باشه حتماً جبران می‌کنم",
        time: "۱۵:۳۱",
      },
    ],
  },
  {
    id: "conv-amir",
    studentId: "1025",
    name: "امیر صادقی",
    initials: "اص",
    avatarGradient: "linear-gradient(135deg, #D94A10, #6366F1)",
    phone: "۰۹۱۸۲۳۴۵۶۷۲",
    program: "قدرت — هفته ۵",
    status: "offline",
    statusText: "آخرین بازدید دیروز",
    unread: 0,
    lastTime: "۲ روز پیش",
    lastPreview: "سلام مربی، از کجا شروع کنم؟",
    attendanceRate: 94,
    dueDate: "۲ شهریور",
    messages: [
      { id: "m21", type: "day", text: "۳ روز پیش" },
      {
        id: "m22",
        type: "out",
        text: "سلام امیر جان، به خانواده فیتلجند خوش اومدی! برنامه اولیه‌ت در پنل قرار گرفت.",
        time: "۱۱:۰۰",
      },
      {
        id: "m23",
        type: "in",
        text: "سلام مربی، از کجا شروع کنم؟",
        time: "۱۱:۲۵",
      },
    ],
  },
  {
    id: "conv-group",
    name: "گروه کلاس فانکشنال",
    initials: "کف",
    avatarGradient: "linear-gradient(135deg, #0EA5E9, #F25C1F)",
    phone: "۰۹۱۲۳۴۵۶۷۰۰",
    program: "کلاس گروهی فانکشنال",
    status: "online",
    statusText: "۱۴ عضو",
    unread: 0,
    lastTime: "۳ روز پیش",
    lastPreview: "علی: فردا کلاس برقراره؟",
    messages: [
      { id: "m24", type: "day", text: "۳ روز پیش" },
      {
        id: "m25",
        type: "in",
        text: "علی: فردا کلاس برقراره؟",
        time: "۲۱:۳۰",
      },
      {
        id: "m26",
        type: "out",
        text: "بله بچه‌ها، فردا ساعت ۱۸ سر وقت در سالن اصلی حاضر باشید.",
        time: "۲۱:۴۵",
      },
    ],
  },
];

export default function CoachMessagesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationItem[]>(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>("conv-sara");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");

  // Modals state
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [newStudentSearch, setNewStudentSearch] = useState("");
  const [copiedPhoneToast, setCopiedPhoneToast] = useState(false);

  const chatBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Active conversation object
  const activeConv = useMemo(() => {
    return (
      conversations.find((c) => c.id === activeConvId) ||
      conversations[0] ||
      null
    );
  }, [conversations, activeConvId]);

  // Filtered conversation list based on search
  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.lastPreview.toLowerCase().includes(q) ||
        c.program.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  // Filtered students in New Message modal
  const filteredRosterStudents = useMemo(() => {
    const q = newStudentSearch.trim().toLowerCase();
    if (!q) return ROSTER_STUDENTS;
    return ROSTER_STUDENTS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.id.includes(q) ||
        s.program.toLowerCase().includes(q)
    );
  }, [newStudentSearch]);

  // Auto-scroll chat body when active thread or messages change
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [activeConvId, conversations]);

  // Select conversation & mark as read
  const handleSelectConv = (id: string) => {
    setActiveConvId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Send message
  const handleSendMessage = (customText?: string, attachmentData?: ChatMessage["attachment"]) => {
    const textToSend = customText !== undefined ? customText : inputText;
    if (!textToSend.trim() && !attachmentData) return;

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const tm = toPersianDigits(`${hh}:${mm}`);

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: "out",
      text: textToSend.trim(),
      time: tm,
      attachment: attachmentData,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConvId) {
          return {
            ...c,
            lastTime: tm,
            lastPreview: textToSend.trim() || (attachmentData?.title ?? "پیوست جدید"),
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    if (customText === undefined) {
      setInputText("");
    }

    // Realistic smart reply simulation after 1.5 seconds
    const targetConvId = activeConvId;
    setTimeout(() => {
      const replies = [
        "ممنون مربی جان 🙏 بررسی می‌کنم.",
        "چشم استاد، حتماً با همین برنامه پیش می‌رم.",
        "خیلی ممنون از راهنماییتون مربی ⚡",
        "ثبت شد استاد، فردا اول وقت گزارش تمرین رو می‌فرستم.",
        "سپاس مربی، فرم حرکت رو هم براتون ویدیو می‌گیرم.",
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const replyTime = new Date();
      const rhh = String(replyTime.getHours()).padStart(2, "0");
      const rmm = String(replyTime.getMinutes()).padStart(2, "0");
      const rtm = toPersianDigits(`${rhh}:${rmm}`);

      const replyMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        type: "in",
        text: randomReply,
        time: rtm,
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetConvId) {
            return {
              ...c,
              lastTime: rtm,
              lastPreview: randomReply,
              messages: [...c.messages, replyMsg],
            };
          }
          return c;
        })
      );
    }, 1500);
  };

  // Start new conversation from modal
  const handleStartConversationWithStudent = (student: StudentRosterItem) => {
    setIsNewMessageModalOpen(false);
    // Check if conversation already exists
    const existing = conversations.find(
      (c) => c.studentId === student.id || c.name === student.name
    );
    if (existing) {
      handleSelectConv(existing.id);
      return;
    }

    // Create new conversation
    const newConvId = `conv-${student.id}`;
    const newConv: ConversationItem = {
      id: newConvId,
      studentId: student.id,
      name: student.name,
      initials: student.initials,
      avatarGradient: student.avatarGradient,
      phone: student.phone,
      program: student.program,
      status: "online",
      statusText: "آنلاین",
      unread: 0,
      lastTime: toPersianDigits("۱۰:۰۰"),
      lastPreview: "شروع گفتگو",
      attendanceRate: student.attendanceRate,
      dueDate: "۳۰ روز آینده",
      messages: [
        { id: `day-${Date.now()}`, type: "day", text: "امروز" },
        {
          id: `m-welcome-${Date.now()}`,
          type: "out",
          text: `سلام ${student.name} عزیز 👋 چطور پیش می‌ره؟ اگر سوالی درباره‌ی برنامه‌ت داری این‌جا بپرس.`,
          time: toPersianDigits("۱۰:۰۰"),
        },
      ],
    };

    setConversations([newConv, ...conversations]);
    setActiveConvId(newConvId);
  };

  // Copy phone number helper
  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhoneToast(true);
    setTimeout(() => setCopiedPhoneToast(false), 2000);
  };

  return (
    <div className="app flex h-screen max-h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <CoachSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Container */}
      <div className="main flex flex-1 flex-col min-w-0 h-screen max-h-screen overflow-hidden">
        {/* Topbar: Matching fitlegend-gym-os-messages.html with title and "پیام جدید" action */}
        <CoachTopbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          title="پیام‌ها"
          customAction={
            <button
              type="button"
              onClick={() => setIsNewMessageModalOpen(true)}
              className="btn btn-primary btn-sm"
              title="ارسال پیام به شاگرد جدید"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[17px] w-[17px]"
              >
                <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
              <span>پیام جدید</span>
            </button>
          }
        />

        {/* Content Shell: Exactly matching fitlegend-gym-os-messages.html with strict independent scroll */}
        <div className="content msg-content flex-1 flex flex-col p-0 min-h-0 h-[calc(100vh-72px)] max-h-[calc(100vh-72px)] overflow-hidden">
          <div className="msg-shell flex flex-1 min-h-0 h-full max-h-full overflow-hidden bg-surface">
            {/* Conversation List Sidebar */}
            <aside className="conv-list w-[320px] shrink-0 border-l border-border flex flex-col min-h-0 h-full max-h-full overflow-hidden bg-surface">
              <div className="conv-search shrink-0">
                <div className="search">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="h-[17px] w-[17px] text-ink-faint shrink-0"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجوی گفتگو…"
                    className="w-full border-none bg-transparent text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-ink-faint hover:text-ink text-[12px]"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div className="conv-scroll flex-1 min-h-0 overflow-y-auto overscroll-contain">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <p className="text-[13px] text-ink-faint">گفتگویی یافت نشد</p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mt-2 text-[12px] font-bold text-primary-dark hover:underline"
                    >
                      پاک کردن جستجو
                    </button>
                  </div>
                ) : (
                  filteredConversations.map((c) => {
                    const isActive = c.id === activeConvId;
                    return (
                      <div
                        key={c.id}
                        onClick={() => handleSelectConv(c.id)}
                        className={`conv ${isActive ? "active" : ""}`}
                      >
                        <span
                          className="av"
                          style={{ background: c.avatarGradient }}
                        >
                          {c.initials}
                        </span>
                        <div className="meta">
                          <div className="top">
                            <span className="nm">{c.name}</span>
                            <span className="tm">{c.lastTime}</span>
                          </div>
                          <div className="top">
                            <span className="pv">{c.lastPreview}</span>
                            {c.unread > 0 && (
                              <span className="unread">
                                {toPersianDigits(c.unread)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </aside>

            {/* Active Chat Thread */}
            {activeConv ? (
              <section className="chat-pane flex-1 flex flex-col min-w-0 min-h-0 h-full max-h-full overflow-hidden bg-bg">
                {/* Chat Header */}
                <div className="chat-head shrink-0">
                  <span
                    className="av"
                    style={{ background: activeConv.avatarGradient }}
                  >
                    {activeConv.initials}
                  </span>
                  <div>
                    <div className="nm">{activeConv.name}</div>
                    <div className="st">
                      {activeConv.status === "online" && <span className="d" />}
                      {activeConv.statusText}
                    </div>
                  </div>
                  <div className="acts">
                    {/* Call Button */}
                    <button
                      type="button"
                      onClick={() => setIsCallModalOpen(true)}
                      className="icon-btn"
                      aria-label="تماس"
                      title="تماس تلفنی"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-[19px] w-[19px]"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
                      </svg>
                    </button>

                    {/* Student Profile Button */}
                    <button
                      type="button"
                      onClick={() => setIsProfileModalOpen(true)}
                      className="icon-btn"
                      aria-label="پروفایل شاگرد"
                      title="مشاهده اطلاعات و پرونده شاگرد"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-[19px] w-[19px]"
                      >
                        <circle cx="12" cy="8" r="4" />
                        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Chat Body */}
                <div className="chat-body flex-1 min-h-0 overflow-y-auto overscroll-contain" ref={chatBodyRef}>
                  {activeConv.messages.map((m) => {
                    if (m.type === "day") {
                      return (
                        <div key={m.id} className="day-div">
                          {m.text}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={m.id}
                        className={`msg ${m.type === "out" ? "out" : "in"}`}
                      >
                        <div className="bubble">
                          {m.attachment && (
                            <div className="mb-2 p-2.5 rounded-lg bg-surface/10 border border-current/20 flex items-center gap-2 text-[12px] font-bold">
                              <span>📎</span>
                              <div>
                                <div>{m.attachment.title}</div>
                                {m.attachment.detail && (
                                  <div className="text-[10.5px] opacity-80 font-normal">
                                    {m.attachment.detail}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {m.text}
                        </div>
                        {m.time && <span className="tm">{m.time}</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Chat Input Bar */}
                <div className="chat-input shrink-0 relative">
                  {/* Attachment Popover */}
                  {isAttachmentMenuOpen && (
                    <div className="absolute bottom-[66px] right-4 bg-surface border border-border rounded-xl shadow-lg p-2 flex flex-col gap-1 z-30 min-w-[200px] animate-in fade-in slide-in-from-bottom-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAttachmentMenuOpen(false);
                          handleSendMessage("برنامه‌ی تمرینی ۴ هفته‌ای اختصاصی ضمیمه شد 📄", {
                            type: "program",
                            title: `برنامه تمرینی ${activeConv.name}`,
                            detail: "شامل ۴ روز تمرین و ست‌های وزنه",
                          });
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold text-ink hover:bg-tint hover:text-primary-dark rounded-lg transition-colors text-right"
                      >
                        <span className="text-[16px]">📋</span>
                        <span>ارسال برنامه تمرینی</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAttachmentMenuOpen(false);
                          handleSendMessage("تصویر تحلیل فرم اجرای اسکوات 🏋️‍♂️", {
                            type: "image",
                            title: "تحلیل فرم و زاویه زانوها",
                            detail: "وضعیت پاها در انتهای فاز منفی صحیح است",
                          });
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold text-ink hover:bg-tint hover:text-primary-dark rounded-lg transition-colors text-right"
                      >
                        <span className="text-[16px]">📷</span>
                        <span>ارسال تصویر آنالیز حرکت</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAttachmentMenuOpen(false);
                          handleSendMessage("فایل PDF برنامه رژیم و مکمل‌ها 🥗", {
                            type: "doc",
                            title: "دستور مصرف مکمل و تغذیه",
                            detail: "فایل PDF حجم ۱.۲ مگابایت",
                          });
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold text-ink hover:bg-tint hover:text-primary-dark rounded-lg transition-colors text-right"
                      >
                        <span className="text-[16px]">📄</span>
                        <span>ارسال فایل رژیم و مکمل</span>
                      </button>
                    </div>
                  )}

                  {/* Attachment Button */}
                  <button
                    type="button"
                    onClick={() => setIsAttachmentMenuOpen((prev) => !prev)}
                    className="att"
                    aria-label="پیوست"
                    title="پیوست فایل یا برنامه"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-[19px] w-[19px]"
                    >
                      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </button>

                  {/* Text Input */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="پیام خود را بنویسید…"
                    autoComplete="off"
                  />

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    className="send-btn"
                    aria-label="ارسال"
                    title="ارسال پیام"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                  </button>
                </div>
              </section>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-bg p-8 text-center text-ink-faint">
                یک گفتگو را از فهرست سمت راست انتخاب کنید.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== MODAL: New Message / Select Student ===== */}
      {isNewMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-[500px] overflow-hidden rounded-[20px] border border-border bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h3 className="text-[17px] font-extrabold text-ink">
                  ارسال پیام به شاگرد
                </h3>
                <p className="text-[12.5px] text-ink-faint mt-1">
                  شاگرد مورد نظر را جهت باز کردن صفحه چت انتخاب کنید
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewMessageModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-bg hover:text-ink"
              >
                ✕
              </button>
            </div>

            <div className="p-4 border-b border-border bg-bg/50">
              <div className="search w-full flex items-center gap-2 bg-surface px-3 py-2 rounded-xl border border-border">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4 text-ink-faint"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  value={newStudentSearch}
                  onChange={(e) => setNewStudentSearch(e.target.value)}
                  placeholder="جستجوی نام یا کد شاگرد…"
                  className="w-full bg-transparent text-[13.5px] outline-none text-ink placeholder:text-ink-faint"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-[380px] overflow-y-auto p-3 flex flex-col gap-1">
              {filteredRosterStudents.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleStartConversationWithStudent(s)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-tint/70 cursor-pointer transition-all border border-transparent hover:border-primary/30"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-white text-[13px]"
                      style={{ background: s.avatarGradient }}
                    >
                      {s.initials}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-ink">
                          {s.name}
                        </span>
                        <span className="text-[11px] text-ink-faint">
                          #{toPersianDigits(s.id)}
                        </span>
                      </div>
                      <div className="text-[12px] text-ink-soft mt-0.5">
                        {s.program}
                      </div>
                    </div>
                  </div>

                  <div className="text-left">
                    <span className="text-[11.5px] font-bold text-primary-dark bg-tint px-2 py-0.5 rounded-full">
                      گفتگو
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-4 bg-bg flex justify-between items-center">
              <span className="text-[12px] text-ink-faint">
                تعداد شاگردان: {toPersianDigits(filteredRosterStudents.length)}
              </span>
              <button
                type="button"
                onClick={() => setIsNewMessageModalOpen(false)}
                className="btn btn-outline btn-sm"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: Call / Contact Information ===== */}
      {isCallModalOpen && activeConv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-[420px] overflow-hidden rounded-[20px] border border-border bg-surface p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-[20px] font-black text-white mb-4" style={{ background: activeConv.avatarGradient }}>
              {activeConv.initials}
            </div>

            <h3 className="text-[18px] font-extrabold text-ink">
              تماس با {activeConv.name}
            </h3>
            <p className="text-[13px] text-ink-faint mt-1">
              {activeConv.program}
            </p>

            <div className="my-6 rounded-2xl bg-tint/60 border border-primary/20 p-4">
              <div className="text-[11.5px] font-bold text-primary-dark">شماره همراه شاگرد</div>
              <div className="text-[20px] font-extrabold text-ink mt-1 tracking-wider dir-ltr" dir="ltr">
                {activeConv.phone}
              </div>
            </div>

            {copiedPhoneToast && (
              <div className="mb-4 text-[12.5px] font-bold text-primary-dark bg-tint py-1 px-3 rounded-lg inline-block">
                ✓ شماره در حافظه کپی شد!
              </div>
            )}

            <div className="flex gap-2">
              <a
                href={`tel:${activeConv.phone.replace(/[^0-9]/g, "")}`}
                className="btn btn-primary flex-1 text-center"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
                </svg>
                برقراری تماس
              </a>

              <button
                type="button"
                onClick={() => handleCopyPhone(activeConv.phone)}
                className="btn btn-outline"
                title="کپی شماره"
              >
                کپی شماره
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsCallModalOpen(false)}
              className="mt-3 text-[13px] text-ink-faint hover:text-ink"
            >
              بستن
            </button>
          </div>
        </div>
      )}

      {/* ===== MODAL: Student Profile Details ===== */}
      {isProfileModalOpen && activeConv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-[460px] overflow-hidden rounded-[20px] border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl font-black text-white text-[16px]"
                  style={{ background: activeConv.avatarGradient }}
                >
                  {activeConv.initials}
                </span>
                <div>
                  <h3 className="text-[17px] font-extrabold text-ink">
                    {activeConv.name}
                  </h3>
                  <div className="text-[12px] text-primary-dark font-semibold">
                    {activeConv.statusText}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-bg hover:text-ink"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-bg border border-border">
                <div className="text-[11.5px] text-ink-faint font-semibold">برنامه جاری</div>
                <div className="text-[13.5px] font-bold text-ink mt-1">
                  {activeConv.program}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-bg border border-border">
                <div className="text-[11.5px] text-ink-faint font-semibold">درصد حضور</div>
                <div className="text-[13.5px] font-bold text-primary-dark mt-1">
                  {toPersianDigits(activeConv.attendanceRate ?? 95)}٪
                </div>
              </div>

              <div className="p-3 rounded-xl bg-bg border border-border">
                <div className="text-[11.5px] text-ink-faint font-semibold">سررسید عضویت</div>
                <div className="text-[13.5px] font-bold text-ink mt-1">
                  {activeConv.dueDate ?? "۱۵ مرداد"}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-bg border border-border">
                <div className="text-[11.5px] text-ink-faint font-semibold">شماره تماس</div>
                <div className="text-[13.5px] font-bold text-ink mt-1 dir-ltr text-right" dir="ltr">
                  {activeConv.phone}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href="/coach/students"
                className="btn btn-outline flex-1 text-center"
              >
                مشاهده در لیست شاگردان
              </Link>
              <Link
                href="/coach/programs"
                className="btn btn-primary flex-1 text-center"
              >
                ویرایش برنامه تمرینی
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
