"use client";

import { useState, useEffect, useMemo } from "react";
import { PaymentItem, PaymentMethod, PaymentStatus } from "./types";
import { toPersianDigits, extractDigitsOnly, formatPriceToWords } from "@/lib/persian-digits";
import { useMembersData, normalizePersianName } from "@/lib/members-store";
import { X, CheckCircle2, AlertCircle, Loader2, UserCheck } from "lucide-react";

interface NewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    paymentData: Omit<PaymentItem, "id"> & {
      memberId?: string;
      memberName?: string;
      memberEmail?: string;
    }
  ) => Promise<any> | any;
}

const COMMON_PURPOSES = [
  "عضویت ماهانه",
  "عضویت طلایی",
  "تمدید نقره‌ای",
  "کلاس خصوصی",
  "بوفه و مکمل",
];

export function NewPaymentModal({
  isOpen,
  onClose,
  onSave,
}: NewPaymentModalProps) {
  const { members, isLoading: isMembersLoading } = useMembersData();

  const activeMembers = useMemo(() => {
    return members.filter((m) => m.isActive !== false);
  }, [members]);

  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("online");
  const [forTitle, setForTitle] = useState("عضویت ماهانه");
  const [status, setStatus] = useState<PaymentStatus>("paid");
  const [date, setDate] = useState(() =>
    new Date().toLocaleDateString("fa-IR", { year: "numeric", month: "2-digit", day: "2-digit" })
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize selected member when opened or members change
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      if (activeMembers.length > 0) {
        // If current selection is empty or not in active members, pick the first one
        if (!selectedMemberId || !activeMembers.some((m) => m.id === selectedMemberId)) {
          const first = activeMembers[0];
          setSelectedMemberId(first.id);
          setMemberName(first.fullName || first.name);
          setMemberEmail(first.email || "");
          if (first.plan) {
            setForTitle(`عضویت ${first.plan}`);
          }
        }
      }
    }
  }, [isOpen, activeMembers, selectedMemberId]);

  if (!isOpen) return null;

  const handleMemberSelect = (id: string) => {
    setSelectedMemberId(id);
    if (!id) {
      return;
    }
    const found = activeMembers.find((m) => m.id === id);
    if (found) {
      setMemberName(found.fullName || found.name);
      setMemberEmail(found.email || "");
      if (found.plan) {
        setForTitle(`عضویت ${found.plan}`);
      }
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = extractDigitsOnly(e.target.value);
    if (!rawDigits) {
      setAmount("");
      return;
    }
    const num = parseInt(rawDigits, 10);
    setAmount(toPersianDigits(num.toLocaleString("en-US")));
  };

  const rawAmountNum = parseInt(extractDigitsOnly(amount), 10) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = memberName.trim();
    if (!selectedMemberId && !trimmedName) {
      setErrorMessage("لطفاً عضو مورد نظر را از لیست اعضا انتخاب نموده یا نام او را وارد نمایید.");
      return;
    }

    if (rawAmountNum <= 0) {
      setErrorMessage("لطفاً مبلغ پرداختی را به صورت معتبر وارد نمایید.");
      return;
    }

    const formattedAmount = toPersianDigits(rawAmountNum.toLocaleString("en-US"));
    const initials = (trimmedName || "عض")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2);

    const methodLabels: Record<PaymentMethod, string> = {
      online: "درگاه آنلاین",
      card: "کارت‌خوان / کارت بانکی",
      cash: "نقدی",
    };

    const statusLabels: Record<PaymentStatus, string> = {
      paid: "موفق",
      pending: "در انتظار",
      failed: "ناموفق",
      refunded: "بازگشت‌خورده",
    };

    const randomTx = Math.floor(10000 + Math.random() * 90000);

    let effectiveMemberId = selectedMemberId;
    if (!effectiveMemberId && trimmedName && activeMembers.length > 0) {
      const normTyped = normalizePersianName(trimmedName);
      const match = activeMembers.find(
        (m) =>
          normalizePersianName(m.fullName) === normTyped ||
          normalizePersianName(m.name) === normTyped ||
          normalizePersianName(m.fullName).includes(normTyped)
      );
      if (match) {
        effectiveMemberId = match.id;
      }
    }

    setIsSubmitting(true);
    try {
      await onSave({
        memberId: effectiveMemberId || undefined,
        memberName: trimmedName || "عضو باشگاه",
        memberEmail: memberEmail.trim(),
        txId: `TXN-${toPersianDigits(randomTx)}`,
        memberAvatar: initials || "عض",
        avatarGradient: "linear-gradient(135deg,#F25C1F,#0EA5E9)",
        amount: rawAmountNum,
        amountFormatted: formattedAmount,
        method,
        methodLabel: methodLabels[method],
        forTitle: forTitle.trim() || "پرداخت شهریه",
        date,
        status,
        statusLabel: statusLabels[status],
      });

      setSuccessMessage("پرداخت با موفقیت در سامانه ثبت گردید.");
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setIsSubmitting(false);
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.member_id?.[0] ||
        err?.response?.data?.amount?.[0] ||
        err?.message ||
        "خطایی در ثبت پرداخت رخ داد. لطفاً دوباره تلاش نمایید.";
      setErrorMessage(detail);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-[16px]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-[540px] overflow-hidden rounded-[20px] border border-border bg-surface shadow-[0_20px_60px_rgba(15,23,42,0.15)] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-bg/60 p-[20px_24px]">
          <div>
            <h3 className="text-[18px] font-black text-ink">ثبت پرداخت جدید</h3>
            <p className="mt-[2px] text-[12.5px] text-ink-faint">
              ثبت تراکنش و واریزی جدید در پرونده مالی باشگاه
            </p>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] text-ink-faint transition-colors hover:bg-surface hover:text-ink disabled:opacity-50"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="flex items-center gap-[8px] border-b border-[#FECDD3] bg-[#FFF1F2] p-[12px_24px] text-[13px] font-semibold text-[#9F1239]">
            <AlertCircle className="h-[16px] w-[16px] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-[8px] border-b border-[#A7F3D0] bg-[#ECFDF5] p-[12px_24px] text-[13px] font-semibold text-[#065F46]">
            <CheckCircle2 className="h-[16px] w-[16px] shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="max-h-[72vh] space-y-[18px] overflow-y-auto p-[24px]">
            {/* Member Selector */}
            <div>
              <label className="mb-[6px] flex items-center justify-between text-[12.5px] font-bold text-ink">
                <span>
                  انتخاب عضو باشگاه <span className="text-[#DC2626]">*</span>
                </span>
                {selectedMemberId && (
                  <span className="flex items-center gap-[4px] text-[11px] font-normal text-primary-dark">
                    <UserCheck className="h-[13px] w-[13px]" />
                    متصل به سامانه
                  </span>
                )}
              </label>

              {activeMembers.length > 0 ? (
                <select
                  value={selectedMemberId}
                  onChange={(e) => handleMemberSelect(e.target.value)}
                  className="select-input w-full rounded-[12px] border border-border bg-surface p-[10px_14px] text-[13.5px] font-medium text-ink focus:border-primary focus:bg-tint focus:outline-none"
                >
                  {activeMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName || m.name} {m.phone ? `(${toPersianDigits(m.phone)})` : m.email ? `(${m.email})` : ""}
                    </option>
                  ))}
                  <option value="">-- عضو دیگر / ثبت دستی --</option>
                </select>
              ) : (
                <div className="rounded-[12px] border border-border bg-bg p-[10px_14px] text-[12.5px] text-ink-soft">
                  {isMembersLoading
                    ? "در حال بارگذاری لیست اعضا..."
                    : "عضوی از قبل ثبت نشده است؛ با درج نام عضو، پرونده ایشان به صورت خودکار ایجاد و متصل خواهد شد."}
                </div>
              )}
            </div>

            {/* Member Details */}
            <div className="grid grid-cols-1 gap-[14px] min-[480px]:grid-cols-2">
              <div>
                <label className="mb-[6px] block text-[12.5px] font-bold text-ink">
                  نام و نام‌خانوادگی عضو <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: پریا احمدی"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full rounded-[12px] border border-border bg-surface p-[10px_14px] text-[13.5px] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-[6px] block text-[12.5px] font-bold text-ink">
                  ایمیل یا شماره تماس
                </label>
                <input
                  type="text"
                  placeholder="paria@mail.com"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="w-full rounded-[12px] border border-border bg-surface p-[10px_14px] text-[13.5px] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none"
                />
              </div>
            </div>

            {/* Amount with clean digits & Persian words readout */}
            <div>
              <label className="mb-[6px] block text-[12.5px] font-bold text-ink">
                مبلغ پرداختی (تومان) <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                required
                dir="ltr"
                placeholder="۲٬۴۰۰٬۰۰۰"
                value={amount}
                onChange={handleAmountChange}
                className="w-full rounded-[12px] border border-border bg-surface p-[10px_14px] text-left text-[14px] font-bold text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none"
              />
              {rawAmountNum > 0 && (
                <p className="mt-[6px] text-[11.5px] font-semibold text-primary-dark">
                  {formatPriceToWords(rawAmountNum)}
                </p>
              )}
            </div>

            {/* Payment Method & Date */}
            <div className="grid grid-cols-1 gap-[14px] min-[480px]:grid-cols-2">
              <div>
                <label className="mb-[6px] block text-[12.5px] font-bold text-ink">
                  روش پرداخت
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                  className="select-input w-full rounded-[12px] border border-border bg-surface p-[10px_14px] text-[13.5px] text-ink focus:border-primary focus:bg-tint focus:outline-none"
                >
                  <option value="online">درگاه آنلاین</option>
                  <option value="card">کارت‌خوان / کارت بانکی</option>
                  <option value="cash">نقدی</option>
                </select>
              </div>

              <div>
                <label className="mb-[6px] block text-[12.5px] font-bold text-ink">
                  تاریخ تراکنش
                </label>
                <input
                  type="text"
                  placeholder="۱۴۰۴/۰۴/۰۹"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-[12px] border border-border bg-surface p-[10px_14px] text-[13.5px] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none"
                />
              </div>
            </div>

            {/* For Title & Quick Tags */}
            <div>
              <label className="mb-[6px] block text-[12.5px] font-bold text-ink">
                بابت / شرح تراکنش
              </label>
              <input
                type="text"
                maxLength={255}
                placeholder="عضویت طلایی"
                value={forTitle}
                onChange={(e) => setForTitle(e.target.value)}
                className="w-full rounded-[12px] border border-border bg-surface p-[10px_14px] text-[13.5px] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none"
              />
              <div className="mt-[8px] flex flex-wrap gap-[6px]">
                {COMMON_PURPOSES.map((purpose) => (
                  <button
                    key={purpose}
                    type="button"
                    onClick={() => setForTitle(purpose)}
                    className="rounded-[8px] border border-border bg-bg px-[8px] py-[4px] text-[11px] font-medium text-ink-soft transition-colors hover:border-primary hover:bg-tint hover:text-ink"
                  >
                    {purpose}
                  </button>
                ))}
              </div>
            </div>

            {/* Initial Status */}
            <div>
              <label className="mb-[6px] block text-[12.5px] font-bold text-ink">
                وضعیت اولیه تراکنش
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PaymentStatus)}
                className="select-input w-full rounded-[12px] border border-border bg-surface p-[10px_14px] text-[13.5px] text-ink focus:border-primary focus:bg-tint focus:outline-none"
              >
                <option value="paid">موفق (تایید شده)</option>
                <option value="pending">در انتظار بررسی / تسویه</option>
                <option value="failed">ناموفق</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-[10px] border-t border-border bg-bg/50 p-[16px_24px]">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-[10px] border border-border bg-surface px-[16px] py-[9px] text-[13px] font-bold text-ink-soft transition-colors hover:bg-bg hover:text-ink disabled:opacity-50"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-[6px] rounded-[10px] btn-ink-gradient px-[20px] py-[9px] text-[13.5px] font-bold text-white transition-all disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-[15px] w-[15px] animate-spin" />
                  <span>در حال ثبت...</span>
                </>
              ) : (
                <span>ثبت پرداخت</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
