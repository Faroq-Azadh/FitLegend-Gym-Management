"use client";

import { useState, useMemo, useEffect } from "react";
import { SystemPlan } from "@/lib/api/services/plans.service";
import {
  X,
  Sparkles,
  Check,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Lock,
  RefreshCw,
  Printer,
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toPersianDigits, normalizeDigits } from "@/lib/persian-digits";
import { logActivity } from "@/lib/activities-store";
import { useQueryClient } from "@tanstack/react-query";
import { getCurrentUserScope } from "@/lib/session-scope";

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemPlans: SystemPlan[];
  currentPlanCode: string;
  gymName?: string;
  onUpgradeSuccess?: (upgradedPlan: SystemPlan, refId: string) => void;
}

type Step = "select" | "invoice" | "gateway" | "success";

export function UpgradePlanModal({
  isOpen,
  onClose,
  systemPlans,
  currentPlanCode,
  gymName = "باشگاه ورزشی",
  onUpgradeSuccess,
}: UpgradePlanModalProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("select");
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>("PRO");
  const [billingCycle, setBillingCycle] = useState<"1_month" | "3_months" | "12_months">("3_months");
  const [gatewayProvider, setGatewayProvider] = useState<"zarinpal" | "saman" | "mellat">("zarinpal");

  // Gateway form states
  const [cardNumber, setCardNumber] = useState("۶۰۳۷-۹۹۷۴-۸۵۱۲-۴۳۹۱");
  const [cvv2, setCvv2] = useState("۷۴۲");
  const [expMonth, setExpMonth] = useState("۰۸");
  const [expYear, setExpYear] = useState("۰۶");
  const [pin2, setPin2] = useState("۴۸۲۹۰۱");
  const [otpTimer, setOtpTimer] = useState(120);
  const [otpSent, setOtpSent] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [txRefId, setTxRefId] = useState("");
  const [txDateTime, setTxDateTime] = useState("");

  const selectedPlan = useMemo(() => {
    return systemPlans.find((p) => p.code === selectedPlanCode) || systemPlans[0];
  }, [systemPlans, selectedPlanCode]);

  // Reset states on open
  useEffect(() => {
    if (isOpen) {
      setStep("select");
      setIsProcessingPayment(false);
      setOtpSent(false);
      setOtpTimer(120);
    }
  }, [isOpen]);

  // OTP Countdown
  useEffect(() => {
    if (!otpSent || otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  if (!isOpen) return null;

  // Price calculations
  const baseMonthlyPrice = selectedPlan?.price ? parseFloat(selectedPlan.price) : 0;
  const cycleMultiplier = billingCycle === "1_month" ? 1 : billingCycle === "3_months" ? 3 : 12;
  const discountRate = billingCycle === "1_month" ? 0 : billingCycle === "3_months" ? 0.1 : 0.25;

  const rawSubtotal = baseMonthlyPrice * cycleMultiplier;
  const discountAmount = Math.round(rawSubtotal * discountRate);
  const discountedSubtotal = rawSubtotal - discountAmount;
  const taxAmount = Math.round(discountedSubtotal * 0.1); // 10% VAT
  const totalPayable = discountedSubtotal + taxAmount;

  const handleStartCheckout = (plan: SystemPlan) => {
    setSelectedPlanCode(plan.code);
    if (plan.code === "ENTERPRISE") {
      alert("برای استعلام و عقد قرارداد پلن سازمانی، لطفاً با شماره ۰۲۱-۸۸۸۸۴۳۲۱ تماس حاصل فرمایید.");
      return;
    }
    setStep("invoice");
  };

  const handleSendOtp = () => {
    setOtpSent(true);
    setOtpTimer(120);
  };

  const handleSimulatePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      const generatedRefId = `TRX-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const nowStr = new Date().toLocaleDateString("fa-IR") + " - " + new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
      setTxRefId(generatedRefId);
      setTxDateTime(nowStr);
      setIsProcessingPayment(false);
      setStep("success");

      // Save upgraded plan into local session cache
      try {
        const userScope = getCurrentUserScope();
        if (selectedPlan) {
          localStorage.setItem(`fitlegend_gym_plan_override_${userScope}`, JSON.stringify({
            code: selectedPlan.code,
            name: selectedPlan.name,
            updatedAt: new Date().toISOString(),
          }));

          // Invalidate and optimistically update React Query gym-me cache
          queryClient.setQueriesData({ queryKey: ["gym-me"] }, (old: any) => {
            if (!old) return old;
            return {
              ...old,
              subscription: {
                ...old.subscription,
                plan: {
                  code: selectedPlan.code,
                  name: selectedPlan.name,
                  price: selectedPlan.price,
                  member_limit: selectedPlan.member_limit,
                  coach_limit: selectedPlan.coach_limit,
                },
                status: "ACTIVE",
                is_active: true,
                trial_ends_at: null,
              },
            };
          });
        }
      } catch {}

      // Log activity
      logActivity({
        type: "PAYMENT",
        text: `ارتقای اشتراک سامانه به «${selectedPlan?.name || "حرفه‌ای"}» - پرداخت آنلاین موفق (${toPersianDigits(totalPayable.toLocaleString("fa-IR"))} تومان)`,
      });

      if (onUpgradeSuccess && selectedPlan) {
        onUpgradeSuccess(selectedPlan, generatedRefId);
      }
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-3 min-[640px]:p-5">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/55 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (step !== "gateway" || !isProcessingPayment) {
            onClose();
          }
        }}
      />

      {/* Main Modal Container */}
      <div className="relative z-10 w-full max-w-[880px] overflow-hidden rounded-[24px] border border-border bg-surface shadow-[0_25px_70px_rgba(15,23,42,0.2)] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-border bg-bg/70 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary-dark shadow-xs">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-[17px] font-black text-ink">
                ارتقای اشتراک سامانه مدیریت فیتلجند جیم
              </h3>
              <p className="text-[12px] text-ink-faint">
                باشگاه {gymName} · دسترسی به امکانات و افزایش ظرفیت اعضا
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isProcessingPayment}
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[10px] text-ink-faint hover:bg-surface hover:text-ink transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ======================================================================== */}
        {/* STEP 1: PLAN SELECTION GRID */}
        {/* ======================================================================== */}
        {step === "select" && (
          <div className="max-h-[75vh] overflow-y-auto p-6">
            <div className="mb-5 text-center">
              <h4 className="text-[19px] font-black text-ink">
                تعرفه مناسب با وسعت باشگاه خود را انتخاب کنید
              </h4>
              <p className="mt-1 text-[13px] text-ink-faint">
                امکان تغییر یا ارتقای پلن در هر زمان با کسر مابه‌التفاوت فراهم است
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 min-[860px]:grid-cols-4">
              {systemPlans.map((sp) => {
                const isCurrent = sp.code?.toUpperCase() === currentPlanCode.toUpperCase();
                const isSelected = sp.code === selectedPlanCode;
                const priceNum = sp.price ? parseFloat(sp.price) : 0;
                const priceFormatted =
                  sp.code === "FREE"
                    ? "رایگان"
                    : sp.price === null
                      ? "سفارشی"
                      : priceNum >= 1_000_000
                        ? `${toPersianDigits((priceNum / 1_000_000).toLocaleString("fa-IR"))} م تومان`
                        : `${toPersianDigits(priceNum.toLocaleString("fa-IR"))} تومان`;

                return (
                  <div
                    key={sp.code}
                    className={`relative flex flex-col justify-between rounded-[18px] border p-5 transition-all ${
                      isSelected
                        ? "border-primary bg-tint/60 shadow-[0_12px_32px_rgba(22,224,160,0.18)] ring-2 ring-primary/60"
                        : "border-border bg-surface hover:border-border/80 hover:shadow-xs"
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute -top-2.5 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-black text-[#006633] shadow-xs">
                        اشتراک فعلی شما
                      </span>
                    )}

                    <div>
                      <div className="text-[16px] font-black text-ink">{sp.name}</div>
                      <div className="mt-2 text-[22px] font-black text-ink">
                        {priceFormatted}
                      </div>
                      <div className="mt-0.5 text-[11.5px] text-ink-faint">
                        {sp.code === "FREE" ? `${toPersianDigits(sp.trial_days || 90)} روز آزمایشی` : "ماهانه"}
                      </div>

                      <ul className="mt-4 space-y-2.5 text-[12.5px] text-ink-soft">
                        <li className="flex items-center gap-1.5">
                          <Check className="h-4 w-4 text-primary-dark shrink-0 stroke-[2.5]" />
                          <span>سقف اعضا: {sp.member_limit ? `${toPersianDigits(sp.member_limit)} نفر` : "نامحدود"}</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-4 w-4 text-primary-dark shrink-0 stroke-[2.5]" />
                          <span>سقف مربیان: {sp.coach_limit ? `${toPersianDigits(sp.coach_limit)} نفر` : "نامحدود"}</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-4 w-4 text-primary-dark shrink-0 stroke-[2.5]" />
                          <span>ثبت حضور و غیاب پرسنل</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-4 w-4 text-primary-dark shrink-0 stroke-[2.5]" />
                          <span>گزارش‌های پیشرفته مالی</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      disabled={isCurrent}
                      onClick={() => handleStartCheckout(sp)}
                      className={`mt-5 w-full rounded-[12px] py-2.5 text-[13px] font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-bg text-ink-faint cursor-default"
                          : isSelected
                            ? "bg-ink text-white hover:bg-primary-dark shadow-xs"
                            : "bg-surface border border-border text-ink hover:bg-tint hover:border-primary"
                      }`}
                    >
                      {isCurrent ? "پلن کنونی" : "انتخاب و پرداخت"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================================== */}
        {/* STEP 2: INVOICE & BILLING CYCLE BREAKDOWN */}
        {/* ======================================================================== */}
        {step === "invoice" && (
          <div className="max-h-[75vh] overflow-y-auto p-6">
            <div className="grid grid-cols-1 gap-6 min-[768px]:grid-cols-12">
              {/* Left Column: Billing Cycle Selection */}
              <div className="min-[768px]:col-span-7 space-y-4">
                <h4 className="text-[16px] font-black text-ink">
                  ۱. دوره تمدید اشتراک «{selectedPlan.name}»
                </h4>

                <div className="space-y-2.5">
                  {[
                    { key: "1_month" as const, label: "۱ ماهه (پرداخت ماهانه)", discount: null, mult: 1 },
                    { key: "3_months" as const, label: "۳ ماهه (فصلی)", discount: "۱۰٪ تخفیف ویژه", mult: 3 },
                    { key: "12_months" as const, label: "۱۲ ماهه (سالانه)", discount: "۲۵٪ تخفیف طلایی + ۲ ماه رایگان", mult: 12 },
                  ].map((cycle) => {
                    const isSelected = billingCycle === cycle.key;
                    const cyclePrice = baseMonthlyPrice * cycle.mult;
                    const finalCyclePrice = cycle.key === "1_month" ? cyclePrice : cycle.key === "3_months" ? cyclePrice * 0.9 : cyclePrice * 0.75;

                    return (
                      <div
                        key={cycle.key}
                        onClick={() => setBillingCycle(cycle.key)}
                        className={`flex items-center justify-between rounded-[14px] border p-3.5 transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary bg-tint/60 ring-2 ring-primary/40 shadow-xs"
                            : "border-border bg-surface hover:bg-bg"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="billing_cycle"
                            checked={isSelected}
                            onChange={() => setBillingCycle(cycle.key)}
                            className="h-4 w-4 accent-primary cursor-pointer"
                          />
                          <div>
                            <div className="text-[13.5px] font-bold text-ink flex items-center gap-2">
                              <span>{cycle.label}</span>
                              {cycle.discount && (
                                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[11px] font-black text-primary-dark">
                                  {cycle.discount}
                                </span>
                              )}
                            </div>
                            <div className="text-[11.5px] text-ink-faint mt-0.5">
                              {cycle.mult === 1 ? "تمدید ماه به ماه" : `معادل ماهانه ${(Math.round(finalCyclePrice / cycle.mult)).toLocaleString("fa-IR")} تومان`}
                            </div>
                          </div>
                        </div>

                        <div className="text-left font-black text-[14.5px] text-ink">
                          {toPersianDigits(finalCyclePrice.toLocaleString("fa-IR"))} تومان
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Gateway Selection */}
                <h4 className="text-[16px] font-black text-ink pt-3">
                  ۲. انتخاب درگاه پرداخت اینترنتی (شاپرک)
                </h4>

                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "zarinpal" as const, name: "زرین‌پال (ZarinPal)", desc: "کلیه کارت‌های شتاب" },
                    { id: "saman" as const, name: "سامان‌کیش (SEP)", desc: "درگاه مستقیم بانکی" },
                    { id: "mellat" as const, name: "به‌پرداخت ملت", desc: "شبکه پرداخت شاپرک" },
                  ].map((gw) => (
                    <button
                      key={gw.id}
                      type="button"
                      onClick={() => setGatewayProvider(gw.id)}
                      className={`rounded-[12px] border p-3 text-right transition-all cursor-pointer ${
                        gatewayProvider === gw.id
                          ? "border-primary bg-tint/50 ring-2 ring-primary/40"
                          : "border-border bg-surface hover:bg-bg"
                      }`}
                    >
                      <div className="text-[13px] font-extrabold text-ink">{gw.name}</div>
                      <div className="mt-1 text-[11px] text-ink-faint">{gw.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Formal Invoice Breakdown */}
              <div className="min-[768px]:col-span-5 rounded-[18px] border border-border bg-bg/50 p-5 flex flex-col justify-between">
                <div>
                  <h4 className="text-[15px] font-black text-ink pb-3 border-b border-border">
                    پیش‌فاکتور تمدید اشتراک
                  </h4>

                  <div className="mt-4 space-y-2.5 text-[13px]">
                    <div className="flex justify-between text-ink-soft">
                      <span>پلن انتخابی:</span>
                      <span className="font-bold text-ink">{selectedPlan.name}</span>
                    </div>

                    <div className="flex justify-between text-ink-soft">
                      <span>دوره زمانی:</span>
                      <span className="font-bold text-ink">
                        {billingCycle === "1_month" ? "۱ ماهه" : billingCycle === "3_months" ? "۳ ماهه" : "۱۲ ماهه (یک‌ساله)"}
                      </span>
                    </div>

                    <div className="flex justify-between text-ink-soft">
                      <span>مبلغ پایه:</span>
                      <span className="font-bold text-ink">
                        {toPersianDigits(rawSubtotal.toLocaleString("fa-IR"))} تومان
                      </span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-primary-dark font-bold">
                        <span>تخفیف دوره:</span>
                        <span>- {toPersianDigits(discountAmount.toLocaleString("fa-IR"))} تومان</span>
                      </div>
                    )}

                    <div className="flex justify-between text-ink-soft">
                      <span>مالیات بر ارزش افزوده (۱۰٪):</span>
                      <span className="font-bold text-ink">
                        {toPersianDigits(taxAmount.toLocaleString("fa-IR"))} تومان
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-border pt-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[14px] font-black text-ink">مبلغ نهایی پرداخت:</span>
                      <span className="text-[20px] font-black text-primary-dark">
                        {toPersianDigits(totalPayable.toLocaleString("fa-IR"))} تومان
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-ink-faint text-left">
                      فاکتور رسمی الکترونیکی به همراه شناسه رهگیری
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <button
                    type="button"
                    onClick={() => setStep("gateway")}
                    className="w-full rounded-[12px] bg-ink py-3 text-[13.5px] font-bold text-white transition-all hover:bg-primary-dark cursor-pointer shadow-xs flex items-center justify-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    <span>انتقال به درگاه امن پرداخت بانکی</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("select")}
                    className="w-full rounded-[12px] border border-border bg-surface py-2 text-[12.5px] font-bold text-ink-soft hover:bg-bg transition-colors cursor-pointer"
                  >
                    بازگشت به انتخاب پلن
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================== */}
        {/* STEP 3: SHAPARAK SIMULATED PAYMENT GATEWAY */}
        {/* ======================================================================== */}
        {step === "gateway" && (
          <div className="max-h-[75vh] overflow-y-auto p-6">
            <div className="mx-auto max-w-[520px] rounded-[20px] border border-border bg-surface p-6 shadow-xs">
              {/* Gateway Brand Header */}
              <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#006633]/15 text-[#006633] font-black text-[13px]">
                    شاپرک
                  </div>
                  <div>
                    <div className="text-[14px] font-black text-ink">
                      درگاه پرداخت الکترونیک شاپرک · {gatewayProvider === "zarinpal" ? "زرین‌پال" : gatewayProvider === "saman" ? "سامان‌کیش" : "به‌پرداخت"}
                    </div>
                    <div className="text-[11px] text-ink-faint">
                      پذیرنده: فیتلجند جیم او اس (FitLegend Gym OS)
                    </div>
                  </div>
                </div>

                <div className="text-left">
                  <div className="text-[11px] text-ink-faint">مبلغ تراکنش:</div>
                  <div className="text-[15px] font-black text-primary-dark">
                    {toPersianDigits(totalPayable.toLocaleString("fa-IR"))} تومان
                  </div>
                </div>
              </div>

              {/* Card Inputs */}
              <div className="space-y-4">
                {/* Card Number */}
                <div>
                  <label className="mb-1 block text-[12px] font-bold text-ink">
                    شماره کارت بانکی (۱۶ رقم)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      dir="ltr"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      className="w-full rounded-[10px] border border-border bg-bg p-2.5 text-center text-[14px] font-black tracking-widest text-ink focus:border-primary focus:outline-none"
                    />
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
                  </div>
                </div>

                {/* CVV2 & Exp Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[12px] font-bold text-ink">
                      کد شناسایی دوم (CVV2)
                    </label>
                    <input
                      type="password"
                      dir="ltr"
                      maxLength={4}
                      value={cvv2}
                      onChange={(e) => setCvv2(e.target.value)}
                      className="w-full rounded-[10px] border border-border bg-bg p-2.5 text-center text-[13.5px] font-black tracking-widest text-ink focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[12px] font-bold text-ink">
                      تاریخ انقضا (ماه / سال)
                    </label>
                    <div className="flex items-center gap-1.5" dir="ltr">
                      <input
                        type="text"
                        maxLength={2}
                        value={expMonth}
                        onChange={(e) => setExpMonth(e.target.value)}
                        placeholder="MM"
                        className="w-1/2 rounded-[10px] border border-border bg-bg p-2.5 text-center text-[13px] font-black text-ink focus:border-primary focus:outline-none"
                      />
                      <span className="text-ink-faint">/</span>
                      <input
                        type="text"
                        maxLength={2}
                        value={expYear}
                        onChange={(e) => setExpYear(e.target.value)}
                        placeholder="YY"
                        className="w-1/2 rounded-[10px] border border-border bg-bg p-2.5 text-center text-[13px] font-black text-ink focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Dynamic Pin (OTP) */}
                <div>
                  <label className="mb-1 block text-[12px] font-bold text-ink">
                    رمز دوم اینترنتی (پویا)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      dir="ltr"
                      value={pin2}
                      onChange={(e) => setPin2(e.target.value)}
                      placeholder="رمز اینترنتی"
                      className="flex-1 rounded-[10px] border border-border bg-bg p-2.5 text-center text-[13.5px] font-black tracking-widest text-ink focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={otpSent && otpTimer > 0}
                      onClick={handleSendOtp}
                      className="rounded-[10px] border border-border bg-surface px-3 py-2 text-[11.5px] font-bold text-ink-soft hover:bg-bg disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {otpSent && otpTimer > 0 ? `${toPersianDigits(otpTimer)} ثانیه` : "دریافت رمز پویا"}
                    </button>
                  </div>
                </div>

                {/* Security info */}
                <div className="flex items-center gap-2 rounded-[10px] bg-tint/40 p-2.5 text-[11.5px] text-primary-dark">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>اتصال امن SSL ۲۵۶ بیتی به شبکه تبادل اطلاعات بانکی شاپرک</span>
                </div>

                {/* Gateway Action Buttons */}
                <div className="pt-2 flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={handleSimulatePayment}
                    className="flex-1 rounded-[12px] bg-ink py-3 text-[13.5px] font-bold text-white transition-all hover:bg-primary-dark cursor-pointer shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-white" />
                        <span>در حال تایید تراکنش بانکی...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 stroke-[3]" />
                        <span>پرداخت {toPersianDigits(totalPayable.toLocaleString("fa-IR"))} تومان</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={() => setStep("invoice")}
                    className="rounded-[12px] border border-border bg-surface px-4 py-3 text-[13px] font-bold text-ink-soft hover:bg-bg cursor-pointer disabled:opacity-50"
                  >
                    انصراف
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================== */}
        {/* STEP 4: SUCCESS RECEIPT & INSTANT ACTIVATION */}
        {/* ======================================================================== */}
        {step === "success" && (
          <div className="p-8 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary-dark shadow-[0_10px_30px_rgba(22,224,160,0.3)]">
              <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
            </div>

            <h3 className="text-[20px] font-black text-ink">
              پرداخت موفق و ارتقای آنی اشتراک انجام شد!
            </h3>
            <p className="mt-1 text-[13.5px] text-ink-soft max-w-[480px] mx-auto">
              اشتراک نرم‌افزار باشگاه {gymName} با موفقیت به پلن «{selectedPlan.name}» ارتقا یافت و کلیه امکانات جدید فعال گردید.
            </p>

            {/* Receipt Box */}
            <div className="my-6 mx-auto max-w-[460px] rounded-[16px] border border-border bg-bg/60 p-4 text-[13px] space-y-2.5 text-right">
              <div className="flex justify-between border-b border-border pb-2 text-ink-soft">
                <span>کد رهگیری تراکنش شتاب:</span>
                <span className="font-mono font-black text-ink" dir="ltr">{txRefId}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2 text-ink-soft">
                <span>تاریخ و ساعت پرداخت:</span>
                <span className="font-bold text-ink">{toPersianDigits(txDateTime)}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2 text-ink-soft">
                <span>پلن فعال شده:</span>
                <span className="font-bold text-primary-dark">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2 text-ink-soft">
                <span>ظرفیت اعضا:</span>
                <span className="font-bold text-ink">{selectedPlan.member_limit ? `${toPersianDigits(selectedPlan.member_limit)} نفر` : "نامحدود"}</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>مبلغ پرداختی:</span>
                <span className="font-black text-ink">{toPersianDigits(totalPayable.toLocaleString("fa-IR"))} تومان</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.print();
                  }
                }}
                className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-surface px-4 py-2.5 text-[13px] font-bold text-ink-soft hover:bg-bg cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>چاپ رسید پرداخت</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-[10px] bg-ink px-6 py-2.5 text-[13px] font-bold text-white hover:bg-primary-dark cursor-pointer shadow-xs"
              >
                <span>مشاهده داشبورد پلن‌ها</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
