"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toPersianDigits } from "@/lib/persian-digits";
import { AthleteSidebar } from "@/components/athlete/athlete-sidebar";
import { AthleteTopbar } from "@/components/athlete/athlete-topbar";

interface InvoiceItem {
  id: string;
  planName: string;
  date: string;
  amount: string;
  status: "paid" | "pending" | "failed";
  statusText: string;
}

interface PaymentCard {
  id: string;
  bankName: string;
  cardNumber: string;
  maskedNumber: string;
  expiry: string;
  isDefault: boolean;
}

interface PlanOption {
  id: "bronze" | "gold" | "platinum";
  title: string;
  duration: string;
  totalDays: number;
  price: string;
  rawPrice: number;
  desc: string;
  features: string[];
}

function formatPersianDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return date.toLocaleDateString("fa-IR");
  }
}

const PLANS: PlanOption[] = [
  {
    id: "bronze",
    title: "اشتراک برنزی باشگاه تیتان (۱ ماهه)",
    duration: "۱ ماهه",
    totalDays: 30,
    price: "۹۵۰٬۰۰۰ تومان",
    rawPrice: 950000,
    desc: "دسترسی به سالن بدنسازی در روزهای زوج",
    features: ["سالن بدنسازی", "کمد عمومی", "مشاوره اولیه"],
  },
  {
    id: "gold",
    title: "عضویت طلایی باشگاه تیتان (۳ ماهه)",
    duration: "۳ ماهه",
    totalDays: 90,
    price: "۲٬۸۵۰٬۰۰۰ تومان",
    rawPrice: 2850000,
    desc: "دسترسی کامل به همه‌ی سالن‌ها، مربی اختصاصی و رزرو ۲ کلاس گروهی در هفته",
    features: ["سالن بدنسازی و هوازی", "مربی اختصاصی (آرش رستمی)", "کمد اختصاصی شماره ۴۲ (VIP)", "رزرو ۲ کلاس در هفته"],
  },
  {
    id: "platinum",
    title: "عضویت VIP پلاتینیوم (۶ ماهه)",
    duration: "۶ ماهه",
    totalDays: 180,
    price: "۵٬۲۰۰٬۰۰۰ تومان",
    rawPrice: 5200000,
    desc: "دسترسی ۲۴ ساعته + مربی ارشد + استخر و سونا + بوفه رایگان + پارکینگ اختصاصی",
    features: ["دسترسی ۲۴/۷ بدون محدودیت", "مربی ارشد + ماساژ ماهانه", "استخر، سونا و جکوزی", "پارکینگ و بوفه اختصاصی"],
  },
];

const INITIAL_INVOICES: InvoiceItem[] = [
  {
    id: "TXN-۹۸۴۲",
    planName: "عضویت طلایی · ۳ ماهه",
    date: "۱ خرداد ۱۴۰۴",
    amount: "۱٬۸۰۰٬۰۰۰",
    status: "paid",
    statusText: "موفق",
  },
  {
    id: "TXN-۹۵۱۰",
    planName: "عضویت طلایی · ماهانه",
    date: "۱ اردیبهشت ۱۴۰۴",
    amount: "۱٬۸۰۰٬۰۰۰",
    status: "paid",
    statusText: "موفق",
  },
  {
    id: "TXN-۹۲۰۳",
    planName: "عضویت طلایی · ماهانه",
    date: "۱ فروردین ۱۴۰۴",
    amount: "۱٬۸۰۰٬۰۰۰",
    status: "paid",
    statusText: "موفق",
  },
  {
    id: "TXN-۸۹۷۱",
    planName: "کلاس خصوصی · تک‌جلسه",
    date: "۲۴ اسفند ۱۴۰۳",
    amount: "۴۵۰٬۰۰۰",
    status: "paid",
    statusText: "موفق",
  },
  {
    id: "TXN-۸۸۰۲",
    planName: "تمدید عضویت",
    date: "۱۱ مرداد ۱۴۰۴",
    amount: "۱٬۸۰۰٬۰۰۰",
    status: "pending",
    statusText: "در انتظار",
  },
  {
    id: "TXN-۸۶۴۵",
    planName: "کلاس فانکشنال · پکیج",
    date: "۵ اسفند ۱۴۰۳",
    amount: "۹۰۰٬۰۰۰",
    status: "failed",
    statusText: "ناموفق",
  },
  {
    id: "TXN-۸۴۱۰",
    planName: "عضویت طلایی · ماهانه",
    date: "۱ بهمن ۱۴۰۳",
    amount: "۱٬۸۰۰٬۰۰۰",
    status: "paid",
    statusText: "موفق",
  },
  {
    id: "TXN-۸۱۲۰",
    planName: "کلاس فیتنس · پکیج",
    date: "۱۵ دی ۱۴۰۳",
    amount: "۶۰۰٬۰۰۰",
    status: "paid",
    statusText: "موفق",
  },
];

type TabType = "all" | "paid" | "pending" | "failed";

export default function AthleteMembershipPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);

  // Active plan state
  const [selectedPlanId, setSelectedPlanId] = useState<"bronze" | "gold" | "platinum">("gold");
  const [activePlan, setActivePlan] = useState<PlanOption>(PLANS[1]); // Gold default
  const [daysRemaining, setDaysRemaining] = useState(25);
  const [startDate, setStartDate] = useState("۱۵ شهریور ۱۴۰۳");
  const [endDate, setEndDate] = useState("۵ آبان ۱۴۰۳");

  // Real-time subscription timestamps for dynamic progress calculation
  const [startDateTime, setStartDateTime] = useState<number>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 65); // 65 days elapsed (90 total - 25 remaining)
    return d.getTime();
  });
  const [endDateTime, setEndDateTime] = useState<number>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 25); // 25 days remaining
    return d.getTime();
  });
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());

  // Real-time synchronization of remaining days and current timestamp
  useEffect(() => {
    const updateTimeAndStatus = () => {
      const now = Date.now();
      setCurrentTime(now);
      const diffMs = endDateTime - now;
      const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      setDaysRemaining(days);
    };

    updateTimeAndStatus();
    const interval = setInterval(updateTimeAndStatus, 60000);
    return () => clearInterval(interval);
  }, [endDateTime]);

  // Dynamic progress calculation:
  // - Starts at 0% when renewed (reset)
  // - Fills up dynamically as time elapses and remaining days decrease
  // - Fills up completely (100%) when subscription expires
  const totalDays = activePlan.totalDays || 90;
  const totalDurationMs = Math.max(1, endDateTime - startDateTime);
  const elapsedMs = Math.max(0, Math.min(totalDurationMs, currentTime - startDateTime));
  const timeProgress = Math.min(100, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)));
  const daysElapsed = Math.max(0, totalDays - daysRemaining);
  const daysProgress = Math.min(100, Math.max(0, Math.round((daysElapsed / totalDays) * 100)));

  const isExpired = daysRemaining <= 0 || (endDateTime > 0 && currentTime >= endDateTime);
  const progressPercent = isExpired ? 100 : Math.max(timeProgress, daysProgress);

  // Invoices & Tab Filtering
  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_INVOICES);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [openStatusMenuId, setOpenStatusMenuId] = useState<string | null>(null);

  // Cards State
  const [cards, setCards] = useState<PaymentCard[]>([
    {
      id: "card-1",
      bankName: "بانک ملت",
      cardNumber: "6104337890128821",
      maskedNumber: "۶۱۰۴ ···· ···· ۸۸۲۱",
      expiry: "۰۶/۰۸",
      isDefault: true,
    },
    {
      id: "card-2",
      bankName: "بانک سامان",
      cardNumber: "6219861055434503",
      maskedNumber: "۶۲۱۹ ···· ···· ۴۵۰۳",
      expiry: "۰۴/۰۷",
      isDefault: false,
    },
  ]);
  const [gatewaySelectedCardId, setGatewaySelectedCardId] = useState<string>("card-1");

  // Add Card Inputs
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardBank, setNewCardBank] = useState("");
  const [newCardExp, setNewCardExp] = useState("");

  // Gateway Simulation State
  const [gatewayStep, setGatewayStep] = useState<"input" | "processing" | "success">("input");
  const [dynamicOtp, setDynamicOtp] = useState<string>("");
  const [otpTimer, setOtpTimer] = useState<number>(0);
  const [gatewayCvv2, setGatewayCvv2] = useState<string>("529");
  const [gatewayCaptcha, setGatewayCaptcha] = useState<string>("7394");
  const [gatewayInputCaptcha, setGatewayInputCaptcha] = useState<string>("7394");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Select card as default
  const handleSelectCard = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) => ({
        ...c,
        isDefault: c.id === cardId,
      }))
    );
    setGatewaySelectedCardId(cardId);
    const target = cards.find((c) => c.id === cardId);
    if (target) {
      showToast(`کارت ${target.bankName} به عنوان کارت پیش‌فرض انتخاب شد.`);
    }
  };

  // Add new card
  const handleAddNewCard = () => {
    if (!newCardNumber.trim() || !newCardBank.trim()) {
      showToast("لطفاً شماره کارت و نام بانک را وارد کنید.");
      return;
    }
    const cleanNum = newCardNumber.replace(/\D/g, "");
    const masked = `${cleanNum.slice(0, 4)} ···· ···· ${cleanNum.slice(-4) || "۹۹۹۹"}`;
    const newCard: PaymentCard = {
      id: `card-${Date.now()}`,
      bankName: newCardBank.trim(),
      cardNumber: cleanNum,
      maskedNumber: toPersianDigits(masked),
      expiry: toPersianDigits(newCardExp.trim() || "۰۷/۰۹"),
      isDefault: false,
    };
    setCards((prev) => [...prev, newCard]);
    setShowAddCardModal(false);
    setNewCardNumber("");
    setNewCardBank("");
    setNewCardExp("");
    showToast(`کارت ${newCard.bankName} با موفقیت اضافه شد.`);
  };

  // Change payment status of an invoice
  const handleUpdateStatus = (id: string, newStatus: "paid" | "pending" | "failed", newStatusText: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? { ...inv, status: newStatus, statusText: newStatusText }
          : inv
      )
    );
    setOpenStatusMenuId(null);
    showToast(`وضعیت فاکتور ${id} با موفقیت به "${newStatusText}" تغییر یافت.`);
  };

  // OTP Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Request Dynamic OTP in Gateway
  const handleRequestOtp = () => {
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setDynamicOtp(toPersianDigits(randomOtp));
    setOtpTimer(120);
    showToast(`رمز پویا (${toPersianDigits(randomOtp)}) به شماره همراه شما پیامک شد.`);
  };

  // Proceed to Gateway from Plan Modal
  const handleProceedToGateway = () => {
    const chosen = PLANS.find((p) => p.id === selectedPlanId) || PLANS[1];
    setShowChangePlanModal(false);
    setGatewayStep("input");
    setDynamicOtp("");
    setOtpTimer(0);
    setShowGatewayModal(true);
  };

  // Complete Payment in Gateway
  const handlePayInGateway = () => {
    setGatewayStep("processing");
    setTimeout(() => {
      setGatewayStep("success");
      const chosen = PLANS.find((p) => p.id === selectedPlanId) || PLANS[1];
      setActivePlan(chosen);

      // Add new invoice to history
      const now = new Date();
      const planDurationDays = chosen.totalDays;
      const newStartDate = new Date(now);
      const newEndDate = new Date(now.getTime() + planDurationDays * 24 * 60 * 60 * 1000);

      const newInvoice: InvoiceItem = {
        id: `TXN-${toPersianDigits(Math.floor(1000 + Math.random() * 9000))}`,
        planName: `${chosen.title} · پرداخت آنلاین`,
        date: `امروز · ${toPersianDigits(formatPersianDate(now))}`,
        amount: chosen.price.replace(" تومان", ""),
        status: "paid",
        statusText: "موفق",
      };
      setInvoices((prev) => [newInvoice, ...prev]);

      // Reset subscription progress and update timestamps
      setStartDateTime(newStartDate.getTime());
      setEndDateTime(newEndDate.getTime());
      setCurrentTime(now.getTime());
      setDaysRemaining(planDurationDays);
      setStartDate(formatPersianDate(newStartDate));
      setEndDate(formatPersianDate(newEndDate));

      showToast(`پرداخت با موفقیت انجام شد و ${chosen.title} فعال گردید.`);
    }, 1200);
  };

  // Tab counts
  const countAll = invoices.length;
  const countPaid = invoices.filter((i) => i.status === "paid").length;
  const countPending = invoices.filter((i) => i.status === "pending").length;
  const countFailed = invoices.filter((i) => i.status === "failed").length;

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    if (activeTab === "all") return true;
    return inv.status === activeTab;
  });

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const displayedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setOpenStatusMenuId(null);
  };

  const handleDownloadInvoice = (id: string) => {
    showToast(`فاکتور ${toPersianDigits(id)} با موفقیت دریافت و ذخیره شد.`);
  };

  return (
    <div className="app">
      <AthleteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <AthleteTopbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="content">
          {/* Page Head - Note: "تمدید عضویت" button at top was removed per user request */}
          <div className="page-head">
            <div>
              <h1>عضویت و پرداخت</h1>
              <div className="sub">وضعیت اشتراک و تاریخچه‌ی پرداخت‌های شما</div>
            </div>
          </div>

          {/* Membership hero + summary */}
          <div className="grid-2b mb-6">
            {/* Combined Golden Subscribe Card */}
            <div className="mem-hero">
              <div className="top">
                <div>
                  <div className="plan">{activePlan.title}</div>
                  <div className="sub">{activePlan.desc}</div>
                </div>
                <span className="chip">
                  <span className={`w-2 h-2 rounded-full inline-block ${!isExpired ? "bg-[#16E0A0] animate-pulse" : "bg-[#EF4444]"}`}></span>
                  {!isExpired ? "اشتراک فعال" : "اشتراک منقضی شده"}
                </span>
              </div>

              <div className="big">
                {!isExpired ? (
                  <>
                    {toPersianDigits(daysRemaining)} <span>روز باقی‌مانده تا پایان اعتبار دوره</span>
                  </>
                ) : (
                  <span className="text-[#F87171] font-bold">اعتبار اشتراک به پایان رسیده است</span>
                )}
              </div>

              <div
                className="mem-bar"
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="میزان پیشرفت دوره اعتبار اشتراک"
              >
                <div
                  className="mem-bar-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="foot">
                <span>شروع دوره: {toPersianDigits(startDate)}</span>
                <span>انقضا: {toPersianDigits(endDate)}</span>
              </div>

              {/* Combined Athlete Details from panel card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10 relative z-1">
                <div className="p-3 rounded-[12px] bg-white/[0.06] border border-white/10 backdrop-blur-sm">
                  <div className="text-[11.5px] text-[#94A3B8]">تاریخ شروع</div>
                  <div className="text-[13.5px] font-bold text-white mt-1">{toPersianDigits(startDate)}</div>
                </div>
                <div className="p-3 rounded-[12px] bg-white/[0.06] border border-white/10 backdrop-blur-sm">
                  <div className="text-[11.5px] text-[#94A3B8]">تاریخ پایان</div>
                  <div className="text-[13.5px] font-bold text-white mt-1">{toPersianDigits(endDate)}</div>
                </div>
                <div className="p-3 rounded-[12px] bg-white/[0.06] border border-white/10 backdrop-blur-sm">
                  <div className="text-[11.5px] text-[#94A3B8]">مربی اختصاصی</div>
                  <div className="text-[13.5px] font-bold text-white mt-1">آرش رستمی</div>
                </div>
                <div className="p-3 rounded-[12px] bg-white/[0.06] border border-white/10 backdrop-blur-sm">
                  <div className="text-[11.5px] text-[#94A3B8]">کمد اختصاصی</div>
                  <div className="text-[13.5px] font-bold text-white mt-1">شماره ۴۲ (VIP)</div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="card">
              <div className="card-head">
                <div>
                  <h3>خلاصه‌ی پرداخت</h3>
                  <div className="hint">جزئیات مالی و سررسید دوره</div>
                </div>
              </div>
              <div className="card-body">
                <div
                  className="top-row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "var(--ink-soft)", fontWeight: 600 }}>
                    مبلغ دوره ({activePlan.duration})
                  </span>
                  <span className="amount">
                    {toPersianDigits(activePlan.price.replace(" تومان", ""))} <span className="cur">تومان</span>
                  </span>
                </div>
                <div
                  className="top-row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "var(--ink-soft)", fontWeight: 600 }}>
                    مجموع پرداختی امسال
                  </span>
                  <span className="amount">
                    ۵٬۴۰۰٬۰۰۰ <span className="cur">تومان</span>
                  </span>
                </div>
                <div
                  className="top-row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 0",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "var(--ink-soft)", fontWeight: 600 }}>
                    پرداخت بعدی
                  </span>
                  <span className="tag">{toPersianDigits(endDate)}</span>
                </div>
                <div style={{ marginTop: "14px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlanId(activePlan.id);
                      setShowChangePlanModal(true);
                    }}
                    className="btn btn-outline btn-sm w-full"
                  >
                    تغییر پلن عضویت
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Payment methods - With Selectable Cards */}
          <div className="card mb-6">
            <div className="card-head">
              <div>
                <h3>روش‌های پرداخت</h3>
                <div className="hint">برای انتخاب کارت پیش‌فرض روی آن کلیک کنید</div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCardModal(true)}
                className="btn btn-outline btn-sm"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="w-4 h-4 ml-1"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                افزودن کارت
              </button>
            </div>
            <div className="card-body">
              {cards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleSelectCard(card.id)}
                  className={`pm-card cursor-pointer transition-all hover:border-primary/60 ${card.isDefault ? "default" : ""
                    }`}
                  title={card.isDefault ? "کارت پیش‌فرض فعال" : "برای انتخاب به عنوان پیش‌فرض کلیک کنید"}
                >
                  <span className="pm-ico">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                  </span>
                  <div>
                    <div className="nm">{card.bankName} · {card.maskedNumber}</div>
                    <div className="ex">انقضا {card.expiry}</div>
                  </div>
                  {card.isDefault ? (
                    <span className="df">پیش‌فرض</span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCard(card.id);
                      }}
                      className="mr-auto text-[11.5px] font-bold text-ink-faint hover:text-primary-dark transition-colors px-2.5 py-1 rounded-lg border border-border hover:border-primary/50 hover:bg-tint/40"
                    >
                      انتخاب به عنوان پیش‌فرض
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment History - With Editable Status and Project Thead Styling */}
          <div className="card">
            <div className="card-head">
              <div>
                <h3>تاریخچه‌ی پرداخت</h3>
                <div className="hint">{toPersianDigits(filteredInvoices.length)} فاکتور</div>
              </div>
              <div className="tabs" id="invTabs">
                <button
                  type="button"
                  className={`tab ${activeTab === "all" ? "active" : ""}`}
                  onClick={() => handleTabChange("all")}
                >
                  همه <span className="cnt">{toPersianDigits(countAll)}</span>
                </button>
                <button
                  type="button"
                  className={`tab ${activeTab === "paid" ? "active" : ""}`}
                  onClick={() => handleTabChange("paid")}
                >
                  موفق <span className="cnt">{toPersianDigits(countPaid)}</span>
                </button>
                <button
                  type="button"
                  className={`tab ${activeTab === "pending" ? "active" : ""}`}
                  onClick={() => handleTabChange("pending")}
                >
                  در انتظار <span className="cnt">{toPersianDigits(countPending)}</span>
                </button>
                <button
                  type="button"
                  className={`tab ${activeTab === "failed" ? "active" : ""}`}
                  onClick={() => handleTabChange("failed")}
                >
                  ناموفق <span className="cnt">{toPersianDigits(countFailed)}</span>
                </button>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th className="text-right text-[13.5px] font-extrabold text-ink-soft p-[14px_22px] border-b border-border whitespace-nowrap">
                      شناسه فاکتور
                    </th>
                    <th className="text-right text-[13.5px] font-extrabold text-ink-soft p-[14px_22px] border-b border-border whitespace-nowrap">
                      پلن
                    </th>
                    <th className="text-right text-[13.5px] font-extrabold text-ink-soft p-[14px_22px] border-b border-border whitespace-nowrap">
                      تاریخ
                    </th>
                    <th className="text-right text-[13.5px] font-extrabold text-ink-soft p-[14px_22px] border-b border-border whitespace-nowrap">
                      مبلغ
                    </th>
                    <th className="text-right text-[13.5px] font-extrabold text-ink-soft p-[14px_22px] border-b border-border whitespace-nowrap">
                      وضعیت (کلیک برای تغییر)
                    </th>
                    <th className="text-right text-[13.5px] font-extrabold text-ink-soft p-[14px_22px] border-b border-border whitespace-nowrap"></th>
                  </tr>
                </thead>
                <tbody>
                  {displayedInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <span className="txid">{inv.id}</span>
                      </td>
                      <td>{inv.planName}</td>
                      <td>{inv.date}</td>
                      <td>
                        <span className="amount">
                          {inv.amount} <span className="cur">تومان</span>
                        </span>
                      </td>

                      {/* Status Column with Dropdown to Change Status */}
                      <td className="relative">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenStatusMenuId(openStatusMenuId === inv.id ? null : inv.id)
                            }
                            className={`status ${inv.status} cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-primary/40 transition-all flex items-center gap-1.5`}
                            title="برای تغییر وضعیت کلیک کنید"
                          >
                            <span className="d"></span>
                            <span>{inv.statusText}</span>
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-3 h-3 opacity-60 ml-0.5"
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </button>

                          {/* Status Popover Menu */}
                          {openStatusMenuId === inv.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setOpenStatusMenuId(null)}
                              />
                              <div className="absolute right-0 top-full mt-1.5 z-50 w-38 bg-surface rounded-xl border border-border shadow-xl p-1.5 text-[12px] font-bold animate-in fade-in zoom-in-95 duration-150">
                                <div className="text-[10px] text-ink-faint px-2 py-1 border-b border-border mb-1">
                                  تغییر وضعیت فاکتور:
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(inv.id, "paid", "موفق")}
                                  className="w-full text-right px-2.5 py-1.5 rounded-lg hover:bg-tint hover:text-primary-dark flex items-center gap-2 transition-colors mb-0.5"
                                >
                                  <span className="w-2 h-2 rounded-full bg-primary" />
                                  <span>موفق</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(inv.id, "pending", "در انتظار")}
                                  className="w-full text-right px-2.5 py-1.5 rounded-lg hover:bg-[#FFFBEB] hover:text-[#B45309] flex items-center gap-2 transition-colors mb-0.5"
                                >
                                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                                  <span>در انتظار</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(inv.id, "failed", "ناموفق")}
                                  className="w-full text-right px-2.5 py-1.5 rounded-lg hover:bg-[#FFF1F2] hover:text-[#9F1239] flex items-center gap-2 transition-colors"
                                >
                                  <span className="w-2 h-2 rounded-full bg-[#F43F5E]" />
                                  <span>ناموفق</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="row-action"
                          onClick={() => handleDownloadInvoice(inv.id)}
                          aria-label="دانلود فاکتور"
                          title="دانلود فاکتور"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <path d="m7 10 5 5 5-5M12 15V3" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {displayedInvoices.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--ink-faint)" }}>
                        هیچ فاکتوری در این وضعیت یافت نشد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="table-foot">
              <div className="info">
                نمایش {toPersianDigits(displayedInvoices.length)} فاکتور از {toPersianDigits(filteredInvoices.length)}
              </div>
              <div className="pager">
                <button
                  type="button"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-label="صفحه قبل"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      className={safeCurrentPage === pNum ? "active" : ""}
                      onClick={() => setCurrentPage(pNum)}
                    >
                      {toPersianDigits(pNum)}
                    </button>
                  );
                })}
                <button
                  type="button"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="صفحه بعد"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Change Plan Modal with Card Selection and Gateway Link */}
      {showChangePlanModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-ink/50 backdrop-blur-[4px]"
            onClick={() => setShowChangePlanModal(false)}
          />
          <div className="relative z-10 w-full max-w-[540px] rounded-[24px] bg-surface p-6 border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-[19px] font-extrabold text-ink">تغییر پلن عضویت</h3>
                <p className="text-[12.5px] text-ink-soft mt-0.5">
                  پلن جدید را انتخاب کرده و برای پرداخت به درگاه شتاب متصل شوید
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowChangePlanModal(false)}
                className="w-8 h-8 rounded-full bg-bg flex items-center justify-center text-ink-faint hover:text-ink transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Plan Options */}
            <div className="space-y-3 mb-5">
              {PLANS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                const isCurrent = activePlan.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-4 rounded-[16px] border-2 cursor-pointer transition-all ${isSelected
                      ? "border-primary bg-tint/30 shadow-sm"
                      : "border-border hover:border-primary/40 bg-surface"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-primary-dark" : "border-ink-faint"
                            }`}
                        >
                          {isSelected && <span className="w-2 h-2 rounded-full bg-primary-dark" />}
                        </span>
                        <span className="font-extrabold text-[14.5px] text-ink">{plan.title}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold bg-primary-dark text-white px-2 py-0.5 rounded-full">
                            پلن فعلی
                          </span>
                        )}
                      </div>
                      <div className="font-extrabold text-[15px] text-ink">{toPersianDigits(plan.price)}</div>
                    </div>
                    <div className="text-[12.5px] text-ink-soft mt-1.5 mr-6">{plan.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* Select Payment Card inside Modal */}
            <div className="p-3.5 rounded-[16px] bg-bg border border-border mb-5">
              <div className="text-[12.5px] font-bold text-ink mb-2 flex items-center justify-between">
                <span>کارت پرداخت شتاب:</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePlanModal(false);
                    setShowAddCardModal(true);
                  }}
                  className="text-primary-dark hover:underline text-[11.5px]"
                >
                  + افزودن کارت جدید
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cards.map((c) => (
                  <label
                    key={c.id}
                    className={`flex items-center gap-2 p-2.5 rounded-[12px] border cursor-pointer transition-colors ${gatewaySelectedCardId === c.id
                      ? "border-primary bg-surface font-bold text-ink"
                      : "border-border bg-surface/60 text-ink-soft"
                      }`}
                  >
                    <input
                      type="radio"
                      name="modalCardSelect"
                      checked={gatewaySelectedCardId === c.id}
                      onChange={() => setGatewaySelectedCardId(c.id)}
                      className="accent-primary"
                    />
                    <div className="text-[12px] min-w-0 truncate">
                      <div>{c.bankName}</div>
                      <div className="text-[11px] font-mono text-ink-faint">{c.maskedNumber}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowChangePlanModal(false)}
                className="btn btn-outline btn-sm"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleProceedToGateway}
                className="btn btn-primary btn-sm flex items-center gap-2"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="w-4 h-4 ml-1"
                >
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M2 10h20" />
                </svg>
                تایید و انتقال به درگاه پرداخت
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Realistic Simulated Payment Gateway Modal (درگاه پرداخت شاپرک) */}
      {showGatewayModal && (
        <div className="fixed inset-0 z-80 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-[6px]" />
          <div className="relative z-10 w-full max-w-[500px] rounded-[24px] bg-surface border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Gateway Header */}
            <div className="bg-[#1E293B] text-white p-5 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-dark to-[#22D3EE] flex items-center justify-center font-black text-ink text-[16px]">
                  TITAN
                </div>
                <div>
                  <div className="text-[15px] font-extrabold">درگاه پرداخت الکترونیک شاپرک</div>
                  <div className="text-[11.5px] text-[#94A3B8]">به‌پرداخت ملت · ارتباط امن SSL</div>
                </div>
              </div>
              <span className="text-[11px] font-mono bg-white/10 px-2.5 py-1 rounded-full text-white/80">
                پایانه: ۹۴۸۲۱۰۳
              </span>
            </div>

            {/* Gateway Content based on step */}
            {gatewayStep === "input" && (
              <div className="p-6">
                {/* Transaction Info Box */}
                <div className="bg-bg p-3.5 rounded-[16px] border border-border mb-5">
                  <div className="flex justify-between text-[13px] text-ink-soft mb-1.5">
                    <span>پذیرنده:</span>
                    <span className="font-bold text-ink">باشگاه ورزشی و بدنسازی تیتان</span>
                  </div>
                  <div className="flex justify-between text-[13px] text-ink-soft mb-1.5">
                    <span>پلن درخواستی:</span>
                    <span className="font-bold text-ink">
                      {PLANS.find((p) => p.id === selectedPlanId)?.title}
                    </span>
                  </div>
                  <div className="flex justify-between text-[15px] font-extrabold pt-2 border-t border-border">
                    <span>مبلغ قابل پرداخت:</span>
                    <span className="text-primary-dark font-black">
                      {toPersianDigits(
                        PLANS.find((p) => p.id === selectedPlanId)?.price || "۲٬۸۵۰٬۰۰۰ تومان"
                      )}
                    </span>
                  </div>
                </div>

                {/* Card selection toggle in gateway */}
                <div className="mb-4">
                  <label className="block text-[12.5px] font-bold text-ink mb-1.5">
                    کارت مبدأ برای پرداخت:
                  </label>
                  <select
                    value={gatewaySelectedCardId}
                    onChange={(e) => setGatewaySelectedCardId(e.target.value)}
                    className="w-full h-[42px] px-3 rounded-[12px] border border-border bg-bg text-[13.5px] font-bold text-ink outline-none focus:border-primary"
                  >
                    {cards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.bankName} — {c.maskedNumber}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CVV2 and Expiry */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-[12px] font-bold text-ink mb-1">کد شناسایی (CVV2)</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={gatewayCvv2}
                      onChange={(e) => setGatewayCvv2(e.target.value)}
                      className="w-full h-[40px] px-3 rounded-[10px] border border-border bg-bg text-[14px] font-mono text-center outline-none focus:border-primary"
                      placeholder="۳ یا ۴ رقم"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-ink mb-1">تاریخ انقضا</label>
                    <input
                      type="text"
                      value="۰۶ / ۰۸"
                      readOnly
                      className="w-full h-[40px] px-3 rounded-[10px] border border-border bg-bg/50 text-[13.5px] font-mono text-center outline-none text-ink-soft cursor-not-allowed"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Dynamic Password OTP with Countdown */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[12px] font-bold text-ink">رمز اینترنتی (رمز پویا)</label>
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={otpTimer > 0}
                      className="text-[11.5px] font-bold text-primary-dark hover:underline disabled:opacity-50 disabled:no-underline"
                    >
                      {otpTimer > 0 ? `درخواست مجدد (${otpTimer} ثانیه)` : "دریافت رمز پویا ⚡"}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={dynamicOtp}
                      onChange={(e) => setDynamicOtp(e.target.value)}
                      placeholder="رمز ۶ رقمی پیامک شده"
                      className="flex-1 h-[42px] px-3 rounded-[10px] border border-border bg-bg text-[14px] font-mono text-center outline-none focus:border-primary tracking-widest"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Security Captcha */}
                <div className="mb-6">
                  <label className="block text-[12px] font-bold text-ink mb-1">کد امنیتی</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={gatewayInputCaptcha}
                      onChange={(e) => setGatewayInputCaptcha(e.target.value)}
                      className="flex-1 h-[40px] px-3 rounded-[10px] border border-border bg-bg text-[14px] font-mono text-center outline-none focus:border-primary"
                      dir="ltr"
                    />
                    <div className="w-24 h-[40px] rounded-[10px] bg-[#E2E8F0] text-ink font-mono font-extrabold text-[16px] tracking-widest flex items-center justify-center select-none border border-border">
                      {toPersianDigits(gatewayCaptcha)}
                    </div>
                  </div>
                </div>

                {/* Gateway Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowGatewayModal(false)}
                    className="btn btn-outline btn-sm flex-1"
                  >
                    انصراف و بازگشت
                  </button>
                  <button
                    type="button"
                    onClick={handlePayInGateway}
                    className="btn btn-primary btn-sm flex-1 font-bold text-[14px]"
                  >
                    پرداخت وجه
                  </button>
                </div>
              </div>
            )}

            {/* Processing State */}
            {gatewayStep === "processing" && (
              <div className="p-12 text-center">
                <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h4 className="text-[17px] font-extrabold text-ink mb-1">در حال ارتباط با سوئیچ شاپرک...</h4>
                <p className="text-[13px] text-ink-faint">لطفاً شکیبا باشید و صفحه را نبندید.</p>
              </div>
            )}

            {/* Success State */}
            {gatewayStep === "success" && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-tint text-primary-dark flex items-center justify-center mx-auto mb-4 text-[30px] font-black border-2 border-primary">
                  ✓
                </div>
                <h4 className="text-[19px] font-black text-ink mb-1">پرداخت با موفقیت انجام شد!</h4>
                <p className="text-[13px] text-ink-soft mb-5">
                  پلن {PLANS.find((p) => p.id === selectedPlanId)?.title} با موفقیت برای حساب کاربری شما فعال شد.
                </p>

                <div className="p-3.5 bg-bg rounded-[14px] text-[12.5px] border border-border mb-6 text-right space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-ink-faint">کد رهگیری بانکی (RRN):</span>
                    <span className="font-mono font-bold text-ink">
                      {toPersianDigits(Math.floor(10000000 + Math.random() * 90000000))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-faint">شماره ارجاع شاپرک:</span>
                    <span className="font-mono font-bold text-ink">
                      {toPersianDigits(Math.floor(100000 + Math.random() * 900000))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-faint">وضعیت تراکنش:</span>
                    <span className="font-bold text-primary-dark">تایید شده توسط بانک مرکزی</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowGatewayModal(false)}
                  className="btn btn-primary btn-sm w-full font-bold"
                >
                  بازگشت به پنل ورزشکار
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-[3px]"
            onClick={() => setShowAddCardModal(false)}
          />
          <div className="relative z-10 w-full max-w-[440px] rounded-[20px] bg-surface p-6 border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-[18px] font-extrabold text-ink mb-2">افزودن کارت بانکی</h3>
            <p className="text-[13px] text-ink-soft mb-4">
              اطلاعات کارت شتاب خود را جهت پرداخت و تمدید سریع وارد نمایید:
            </p>
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-[12.5px] font-bold text-ink mb-1.5">شماره کارت (۱۶ رقمی)</label>
                <input
                  type="text"
                  placeholder="۶۰۳۷-۹۹۷۱-XXXX-XXXX"
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  className="w-full h-[42px] px-3 rounded-[10px] border border-border bg-bg text-[14px] font-mono text-center outline-none focus:border-primary"
                  dir="ltr"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12.5px] font-bold text-ink mb-1.5">نام بانک</label>
                  <input
                    type="text"
                    placeholder="مثلاً بانک پاسارگاد"
                    value={newCardBank}
                    onChange={(e) => setNewCardBank(e.target.value)}
                    className="w-full h-[42px] px-3 rounded-[10px] border border-border bg-bg text-[13.5px] outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-bold text-ink mb-1.5">تاریخ انقضا</label>
                  <input
                    type="text"
                    placeholder="۰۸/۰۶"
                    value={newCardExp}
                    onChange={(e) => setNewCardExp(e.target.value)}
                    className="w-full h-[42px] px-3 rounded-[10px] border border-border bg-bg text-[13.5px] font-mono text-center outline-none focus:border-primary"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowAddCardModal(false)}
                className="btn btn-outline btn-sm"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleAddNewCard}
                className="btn btn-primary btn-sm"
              >
                ثبت کارت
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-90 bg-ink text-white px-5 py-3 rounded-[14px] shadow-2xl flex items-center gap-3 text-[13.5px] font-bold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
