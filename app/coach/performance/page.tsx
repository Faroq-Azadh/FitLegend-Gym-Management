"use client";

import { useState, useEffect } from "react";
import { CoachSidebar } from "@/components/coach/coach-sidebar";
import { CoachTopbar } from "@/components/coach/coach-topbar";
import { LogoMark } from "@/components/ui/logo";
import { useAuth } from "@/lib/auth-context";
import { useCoachMe, useCoachPerformance } from "@/lib/hooks/queries/use-coaches";

type TimeRange = "30d" | "90d" | "year";

interface RangeMetrics {
  label: string;
  pdfLabel: string;
  sessions: string;
  sessionsTrend: string;
  attendance: string;
  attendanceTrend: string;
  students: string;
  studentsTrend: string;
  score: string;
  scoreTrend: string;
  bars: { label: string; height: string }[];
  donut: {
    total: string;
    dash1: string;
    dash2: string;
    dash3: string;
    dashOffset2: string;
    dashOffset3: string;
    weightPct: string;
    musclePct: string;
    fitnessPct: string;
  };
}

const RANGE_DATA: Record<TimeRange, RangeMetrics> = {
  "30d": {
    label: "۳۰ روز",
    pdfLabel: "۳۰ روز گذشته",
    sessions: "۹۲",
    sessionsTrend: "۱۲٪",
    attendance: "٪۹۲",
    attendanceTrend: "۳٪",
    students: "۳۸",
    studentsTrend: "۴ نفر",
    score: "۴٫۹",
    scoreTrend: "۰٫۲",
    bars: [
      { label: "فروردین", height: "55%" },
      { label: "اردیبهشت", height: "62%" },
      { label: "خرداد", height: "70%" },
      { label: "تیر", height: "68%" },
      { label: "مرداد", height: "78%" },
      { label: "شهریور", height: "84%" },
      { label: "مهر", height: "92%" },
    ],
    donut: {
      total: "۳۸",
      dash1: "45 55",
      dash2: "32 68",
      dash3: "23 77",
      dashOffset2: "-45",
      dashOffset3: "-77",
      weightPct: "٪۴۵",
      musclePct: "٪۳۲",
      fitnessPct: "٪۲۳",
    },
  },
  "90d": {
    label: "۹۰ روز",
    pdfLabel: "۹۰ روز گذشته (فصلی)",
    sessions: "۲۷۴",
    sessionsTrend: "۱۸٪",
    attendance: "٪۹۱",
    attendanceTrend: "۵٪",
    students: "۴۲",
    studentsTrend: "۷ نفر",
    score: "۴٫۸",
    scoreTrend: "۰٫۳",
    bars: [
      { label: "تیر", height: "68%" },
      { label: "مرداد", height: "78%" },
      { label: "شهریور", height: "84%" },
      { label: "مهر", height: "92%" },
      { label: "آبان", height: "88%" },
      { label: "آذر", height: "94%" },
    ],
    donut: {
      total: "۴۲",
      dash1: "42 58",
      dash2: "35 65",
      dash3: "23 77",
      dashOffset2: "-42",
      dashOffset3: "-77",
      weightPct: "٪۴۲",
      musclePct: "٪۳۵",
      fitnessPct: "٪۲۳",
    },
  },
  year: {
    label: "سال",
    pdfLabel: "یک سال گذشته (سالانه)",
    sessions: "۱,۰۸۰",
    sessionsTrend: "۲۴٪",
    attendance: "٪۸۹",
    attendanceTrend: "۸٪",
    students: "۵۴",
    studentsTrend: "۱۵ نفر",
    score: "۴٫۹",
    scoreTrend: "۰٫۴",
    bars: [
      { label: "فروردین", height: "55%" },
      { label: "اردیبهشت", height: "62%" },
      { label: "خرداد", height: "70%" },
      { label: "تیر", height: "68%" },
      { label: "مرداد", height: "78%" },
      { label: "شهریور", height: "84%" },
      { label: "مهر", height: "92%" },
    ],
    donut: {
      total: "۵۴",
      dash1: "40 60",
      dash2: "38 62",
      dash3: "22 78",
      dashOffset2: "-40",
      dashOffset3: "-78",
      weightPct: "٪۴۰",
      musclePct: "٪۳۸",
      fitnessPct: "٪۲۲",
    },
  },
};

export default function CoachPerformancePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [range, setRange] = useState<TimeRange>("30d");
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [modalSelectedRange, setModalSelectedRange] = useState<TimeRange>("30d");
  const [persianDate, setPersianDate] = useState("");

  const { user } = useAuth();
  const { data: coachMe } = useCoachMe();
  const days = range === "year" ? 365 : range === "90d" ? 90 : 30;
  const { data: performanceData } = useCoachPerformance(days);

  const coachName = user?.full_name?.trim() || coachMe?.full_name?.trim() || "مربی باشگاه";

  useEffect(() => {
    try {
      const today = new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date());
      setPersianDate(today);
    } catch {
      setPersianDate("امروز");
    }
  }, []);

  const currentMetrics = RANGE_DATA[range];

  // Open modal with currently selected range preselected
  const handleOpenPdfModal = () => {
    setModalSelectedRange(range);
    setIsPdfModalOpen(true);
  };

  // Close modal
  const handleClosePdfModal = () => {
    setIsPdfModalOpen(false);
  };

  // Trigger PDF print with selected timeframe
  const handleConfirmDownloadPdf = () => {
    const selected = modalSelectedRange;
    setRange(selected);
    setIsPdfModalOpen(false);

    const rangeConfig = RANGE_DATA[selected];
    const originalTitle = document.title;
    document.title = `گزارش_عملکرد_فیتلجند_${rangeConfig.label.replace(/\s+/g, "_")}`;

    setTimeout(() => {
      window.print();
      document.title = originalTitle;
    }, 200);
  };

  const topStudents = [
    { rank: "۱", name: "مهدی نوری", val: "٪۹۸", width: "98%" },
    { rank: "۲", name: "سارا محمدی", val: "٪۹۴", width: "94%" },
    { rank: "۳", name: "رضا کریمی", val: "٪۸۹", width: "89%" },
    { rank: "۴", name: "امیر صادقی", val: "٪۸۲", width: "82%" },
    { rank: "۵", name: "نگار احمدی", val: "٪۶۵", width: "65%" },
  ];

  const classAttendance = [
    { name: "فانکشنال", val: "٪۹۵", width: "95%" },
    { name: "بدنسازی پیشرفته", val: "٪۹۰", width: "90%" },
    { name: "TRX و کاهش وزن", val: "٪۸۷", width: "87%" },
    { name: "کراس‌فیت", val: "٪۷۸", width: "78%" },
    { name: "بدنسازی مقدماتی", val: "٪۷۰", width: "70%" },
  ];

  const goalProgress = [
    { name: "کاهش وزن", val: "٪۸۸", width: "88%" },
    { name: "عضله‌سازی", val: "٪۷۶", width: "76%" },
    { name: "تناسب اندام", val: "٪۹۲", width: "92%" },
    { name: "افزایش قدرت", val: "٪۸۱", width: "81%" },
    { name: "استقامت", val: "٪۷۴", width: "74%" },
  ];

  return (
    <div className="app flex min-h-screen">
      {/* Sidebar Navigation */}
      <CoachSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="main flex flex-1 flex-col min-w-0">
        {/* Topbar: Exactly like other coach dashboard pages */}
        <CoachTopbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Content */}
        <main className="content">
          {/* Printable Official Header (visible only when generating PDF / printing) */}
          <div className="hidden print:flex items-center justify-between pb-4 mb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <LogoMark size="lg" />
              <div>
                <div className="text-[18px] font-extrabold text-ink">
                  باشگاه ورزشی فیتلجند — گزارش عملکرد مربی
                </div>
                <div className="text-[12px] text-ink-faint">
                  مربی: {coachName} | بازه گزارش: {currentMetrics.pdfLabel} | تاریخ تولید: {persianDate}
                </div>
              </div>
            </div>
            <div className="text-left text-[11px] text-ink-faint">
              <div className="font-bold text-ink">سامانه مدیریت باشگاه فیتلجند</div>
              <div>خروجی رسمی عملکرد مربیگری</div>
            </div>
          </div>

          {/* Page Head */}
          <div className="page-head">
            <div>
              <h1>گزارش عملکرد</h1>
              <div className="sub">تحلیل فعالیت، حضور و رضایت شاگردان شما</div>
            </div>

            {/* Actions: Segmented range buttons + Download Report button */}
            <div className="page-head-actions print:hidden">
              <div className="seg">
                <button
                  type="button"
                  className={range === "year" ? "active" : ""}
                  onClick={() => setRange("year")}
                >
                  سال
                </button>
                <button
                  type="button"
                  className={range === "90d" ? "active" : ""}
                  onClick={() => setRange("90d")}
                >
                  ۹۰ روز
                </button>
                <button
                  type="button"
                  className={range === "30d" ? "active" : ""}
                  onClick={() => setRange("30d")}
                >
                  ۳۰ روز
                </button>
              </div>

              {/* Download Report Button placed under Topbar */}
              <button
                type="button"
                onClick={handleOpenPdfModal}
                className="btn btn-primary btn-sm flex items-center gap-2"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-[17px] h-[17px]"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="m7 10 5 5 5-5M12 15V3" />
                </svg>
                <span>دانلود گزارش</span>
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="kpi-grid">
            <div className="card kpi">
              <div className="kpi-top">
                <span className="kpi-ico kpi-c-orange">
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
                  {currentMetrics.sessionsTrend}
                </span>
              </div>
              <div className="v">{currentMetrics.sessions}</div>
              <div className="l">جلسات برگزارشده</div>
            </div>

            <div className="card kpi">
              <div className="kpi-top">
                <span className="kpi-ico kpi-c-sky">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="m9 11 3 3L22 4" />
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
                  {currentMetrics.attendanceTrend}
                </span>
              </div>
              <div className="v">{currentMetrics.attendance}</div>
              <div className="l">نرخ حضور میانگین</div>
            </div>

            <div className="card kpi">
              <div className="kpi-top">
                <span className="kpi-ico kpi-c-violet">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
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
                  {currentMetrics.studentsTrend}
                </span>
              </div>
              <div className="v">{currentMetrics.students}</div>
              <div className="l">شاگردان فعال</div>
            </div>

            <div className="card kpi">
              <div className="kpi-top">
                <span className="kpi-ico kpi-c-emerald">
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
                  {currentMetrics.scoreTrend}
                </span>
              </div>
              <div className="v">{currentMetrics.score}</div>
              <div className="l">امتیاز رضایت</div>
            </div>
          </div>

          {/* Bars + Donut */}
          <div className="grid-2">
            <div className="card">
              <div className="card-head">
                <div>
                  <h3>جلسات برگزارشده ماهانه</h3>
                  <div className="hint">روند رشد جلسات تمرینی شما</div>
                </div>
                <span className="pill">رو به رشد</span>
              </div>
              <div className="card-body">
                <div className="bars">
                  {currentMetrics.bars.map((b, idx) => (
                    <div className="bar-col" key={idx}>
                      <div className="bar" style={{ height: b.height }}></div>
                      <div className="bar-lbl">{b.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <div>
                  <h3>ترکیب اهداف شاگردان</h3>
                  <div className="hint">{currentMetrics.donut.total} شاگرد فعال</div>
                </div>
              </div>
              <div className="card-body">
                <div className="donut-wrap">
                  <div className="donut">
                    <svg
                      viewBox="0 0 42 42"
                      style={{
                        width: "100%",
                        height: "100%",
                        transform: "rotate(-90deg)",
                      }}
                    >
                      <circle
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="none"
                        stroke="var(--bg)"
                        strokeWidth="5"
                      />
                      <circle
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="none"
                        stroke="#F25C1F"
                        strokeWidth="5"
                        strokeDasharray={currentMetrics.donut.dash1}
                        strokeDashoffset="0"
                      />
                      <circle
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="none"
                        stroke="#0EA5E9"
                        strokeWidth="5"
                        strokeDasharray={currentMetrics.donut.dash2}
                        strokeDashoffset={currentMetrics.donut.dashOffset2}
                      />
                      <circle
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="5"
                        strokeDasharray={currentMetrics.donut.dash3}
                        strokeDashoffset={currentMetrics.donut.dashOffset3}
                      />
                    </svg>
                    <div className="center">
                      <div className="v">{currentMetrics.donut.total}</div>
                      <div className="l">شاگرد</div>
                    </div>
                  </div>
                  <div className="donut-legend">
                    <div className="row">
                      <span className="dot" style={{ background: "#F25C1F" }}></span>
                      <span className="nm">کاهش وزن</span>
                      <span className="pc">{currentMetrics.donut.weightPct}</span>
                    </div>
                    <div className="row">
                      <span className="dot" style={{ background: "#0EA5E9" }}></span>
                      <span className="nm">عضله‌سازی</span>
                      <span className="pc">{currentMetrics.donut.musclePct}</span>
                    </div>
                    <div className="row">
                      <span className="dot" style={{ background: "#F59E0B" }}></span>
                      <span className="nm">تناسب اندام</span>
                      <span className="pc">{currentMetrics.donut.fitnessPct}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analytic detail (grid-3) */}
          <div className="grid-3">
            <div className="card">
              <div className="card-head">
                <div>
                  <h3>پرتلاش‌ترین شاگردان</h3>
                  <div className="hint">بر اساس نرخ حضور</div>
                </div>
              </div>
              <div className="card-body">
                <div className="top-list">
                  {topStudents.map((s, idx) => (
                    <div className="top-row" key={idx}>
                      <div className="top-head">
                        <div className="head-l">
                          <span className="rank">{s.rank}</span>
                          <span className="nm">{s.name}</span>
                        </div>
                        <span className="val">{s.val}</span>
                      </div>
                      <div className="hbar">
                        <div className="hbar-fill" style={{ width: s.width }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <div>
                  <h3>نرخ حضور به تفکیک کلاس</h3>
                  <div className="hint">میانگین این ماه</div>
                </div>
              </div>
              <div className="card-body">
                <div className="top-list">
                  {classAttendance.map((c, idx) => (
                    <div className="top-row" key={idx}>
                      <div className="top-head">
                        <div className="head-l">
                          <span className="nm">{c.name}</span>
                        </div>
                        <span className="val">{c.val}</span>
                      </div>
                      <div className="hbar">
                        <div className="hbar-fill" style={{ width: c.width }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <div>
                  <h3>پیشرفت اهداف</h3>
                  <div className="hint">میانگین تحقق هدف شاگردان</div>
                </div>
              </div>
              <div className="card-body">
                <div className="top-list">
                  {goalProgress.map((g, idx) => (
                    <div className="top-row" key={idx}>
                      <div className="top-head">
                        <div className="head-l">
                          <span className="nm">{g.name}</span>
                        </div>
                        <span className="val">{g.val}</span>
                      </div>
                      <div className="hbar">
                        <div className="hbar-fill" style={{ width: g.width }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* PDF Timeframe Selection Modal */}
      {isPdfModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[4px] p-4 print:hidden"
          onClick={handleClosePdfModal}
        >
          <div
            className="w-full max-w-[460px] rounded-[20px] border border-border bg-surface p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-tint text-primary-dark">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[17px] font-extrabold text-ink">
                    دانلود گزارش عملکرد (PDF)
                  </h3>
                  <p className="mt-1 text-[12.5px] text-ink-faint">
                    بازه زمانی مورد نظر را برای تولید گزارش انتخاب کنید
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClosePdfModal}
                className="flex h-8 w-8 items-center justify-center rounded-[8px] text-ink-faint transition-colors hover:bg-bg hover:text-ink"
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

            {/* Timeframe Options */}
            <div className="my-5 flex flex-col gap-3">
              {/* Option 1: 30 days */}
              <label
                className={`relative flex cursor-pointer items-center justify-between rounded-[14px] border p-4 transition-all duration-180 ${modalSelectedRange === "30d"
                    ? "border-primary bg-tint/40 shadow-xs"
                    : "border-border bg-surface hover:border-slate-300"
                  }`}
                onClick={() => setModalSelectedRange("30d")}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${modalSelectedRange === "30d"
                        ? "border-primary bg-primary text-white"
                        : "border-slate-300 bg-white"
                      }`}
                  >
                    {modalSelectedRange === "30d" && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-ink">
                      ۳۰ روز گذشته (یک‌ماهه)
                    </div>
                    <div className="mt-0.5 text-[12px] text-ink-faint">
                      تحلیل جلسات ماه جاری (۹۲ جلسه و ۳۸ شاگرد)
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-tint px-2.5 py-0.5 text-[11px] font-bold text-primary-dark">
                  پیش‌فرض
                </span>
              </label>

              {/* Option 2: 90 days */}
              <label
                className={`relative flex cursor-pointer items-center justify-between rounded-[14px] border p-4 transition-all duration-180 ${modalSelectedRange === "90d"
                    ? "border-primary bg-tint/40 shadow-xs"
                    : "border-border bg-surface hover:border-slate-300"
                  }`}
                onClick={() => setModalSelectedRange("90d")}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${modalSelectedRange === "90d"
                        ? "border-primary bg-primary text-white"
                        : "border-slate-300 bg-white"
                      }`}
                  >
                    {modalSelectedRange === "90d" && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-ink">
                      ۹۰ روز گذشته (فصلی)
                    </div>
                    <div className="mt-0.5 text-[12px] text-ink-faint">
                      روند رشد فصلی (۲۷۴ جلسه، نرخ حضور ۹۱٪)
                    </div>
                  </div>
                </div>
              </label>

              {/* Option 3: 1 Year */}
              <label
                className={`relative flex cursor-pointer items-center justify-between rounded-[14px] border p-4 transition-all duration-180 ${modalSelectedRange === "year"
                    ? "border-primary bg-tint/40 shadow-xs"
                    : "border-border bg-surface hover:border-slate-300"
                  }`}
                onClick={() => setModalSelectedRange("year")}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${modalSelectedRange === "year"
                        ? "border-primary bg-primary text-white"
                        : "border-slate-300 bg-white"
                      }`}
                  >
                    {modalSelectedRange === "year" && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-ink">
                      یک سال گذشته (سالانه)
                    </div>
                    <div className="mt-0.5 text-[12px] text-ink-faint">
                      گزارش کامل سالانه (۱,۰۸۰ جلسه، ۵۴ شاگرد)
                    </div>
                  </div>
                </div>
              </label>
            </div>

            {/* Note */}
            <div className="rounded-[12px] bg-bg p-3 text-[12px] leading-relaxed text-ink-soft">
              فایل خروجی با فرمت استاندارد PDF حاوی جدول شاخص‌ها، نمودارهای تفکیکی و نرخ حضور شاگردان ذخیره خواهد شد.
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClosePdfModal}
                className="btn btn-outline btn-sm text-[13.5px]"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleConfirmDownloadPdf}
                className="btn btn-primary btn-sm flex items-center gap-2 text-[13.5px]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="m7 10 5 5 5-5M12 15V3" />
                </svg>
                دریافت فایل PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
