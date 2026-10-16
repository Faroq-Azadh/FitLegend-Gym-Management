"use client";

import { PaymentItem, PaymentStatus } from "./types";
import { toPersianDigits } from "@/lib/persian-digits";
import { cn } from "@/lib/utils";
import { X, CheckCircle2, AlertCircle, Clock, RotateCcw, Printer, Trash2 } from "lucide-react";

interface PaymentDetailModalProps {
  payment: PaymentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: PaymentStatus) => void;
  onDelete: (id: string) => void;
}

export function PaymentDetailModal({
  payment,
  isOpen,
  onClose,
  onUpdateStatus,
  onDelete,
}: PaymentDetailModalProps) {
  if (!isOpen || !payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-[16px]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-[520px] overflow-hidden rounded-[20px] border border-border bg-surface shadow-[0_20px_60px_rgba(15,23,42,0.15)] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-bg/60 p-[20px_24px]">
          <div>
            <h3 className="text-[18px] font-black text-ink">رسید پرداخت</h3>
            <p className="mt-[2px] text-[12.5px] text-ink-faint">
              شناسه پیگیری: {toPersianDigits(payment.txId)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] text-ink-faint transition-colors hover:bg-surface hover:text-ink"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-[24px]">
          {/* Amount Banner */}
          <div className="rounded-[14px] bg-bg p-[20px] text-center">
            <div className="text-[12.5px] font-bold text-ink-faint">
              مبلغ تراکنش
            </div>
            <div
              className={cn(
                "mt-[6px] text-[28px] font-black",
                payment.isNegative ? "text-[#9F1239]" : "text-ink"
              )}
            >
              {toPersianDigits(payment.amountFormatted)}
              <span className="mr-[4px] text-[14px] font-bold text-ink-faint">
                تومان
              </span>
            </div>
            <div className="mt-[10px] inline-flex items-center justify-center">
              {payment.status === "paid" && (
                <span className="inline-flex items-center gap-[6px] rounded-full bg-[#E0F2FE] px-[12px] py-[4px] text-[12.5px] font-bold text-[#0284C7]">
                  <CheckCircle2 className="h-[14px] w-[14px]" />
                  پرداخت موفق و تاییدشده
                </span>
              )}
              {payment.status === "pending" && (
                <span className="inline-flex items-center gap-[6px] rounded-full bg-[#FFFBEB] px-[12px] py-[4px] text-[12.5px] font-bold text-[#B45309]">
                  <Clock className="h-[14px] w-[14px]" />
                  در انتظار تایید یا تسویه
                </span>
              )}
              {payment.status === "failed" && (
                <span className="inline-flex items-center gap-[6px] rounded-full bg-[#FFF1F2] px-[12px] py-[4px] text-[12.5px] font-bold text-[#9F1239]">
                  <AlertCircle className="h-[14px] w-[14px]" />
                  تراکنش ناموفق / منقضی شده
                </span>
              )}
              {payment.status === "refunded" && (
                <span className="inline-flex items-center gap-[6px] rounded-full bg-[#F1F5F9] px-[12px] py-[4px] text-[12.5px] font-bold text-[#475569]">
                  <RotateCcw className="h-[14px] w-[14px]" />
                  مبلغ عودت داده شده (استرداد)
                </span>
              )}
            </div>
          </div>

          {/* Details List */}
          <div className="mt-[18px] divide-y divide-border rounded-[14px] border border-border bg-surface p-[4px_16px]">
            <div className="flex items-center justify-between py-[12px] text-[13px]">
              <span className="text-ink-faint">عضو پرداخت‌کننده:</span>
              <div className="flex items-center gap-[8px]">
                {payment.avatarUrl ? (
                  <img
                    src={payment.avatarUrl}
                    alt={payment.memberName}
                    className="h-[28px] w-[28px] rounded-[8px] object-cover border border-border"
                  />
                ) : (
                  <span
                    className="flex h-[28px] w-[28px] items-center justify-center rounded-[8px] text-[11px] font-bold text-white"
                    style={{ background: payment.avatarGradient }}
                  >
                    {payment.memberAvatar}
                  </span>
                )}
                <span className="font-bold text-ink">{payment.memberName}</span>
              </div>
            </div>
            {payment.memberEmail && (
              <div className="flex items-center justify-between py-[12px] text-[13px]">
                <span className="text-ink-faint">ایمیل یا تماس عضو:</span>
                <span className="font-semibold text-ink-soft">{payment.memberEmail}</span>
              </div>
            )}
            <div className="flex items-center justify-between py-[12px] text-[13px]">
              <span className="text-ink-faint">بابت / طرح عضویت:</span>
              <span className="font-bold text-ink">{payment.forTitle}</span>
            </div>
            <div className="flex items-center justify-between py-[12px] text-[13px]">
              <span className="text-ink-faint">روش پرداخت:</span>
              <span className="font-bold text-ink">{payment.methodLabel}</span>
            </div>
            <div className="flex items-center justify-between py-[12px] text-[13px]">
              <span className="text-ink-faint">تاریخ تراکنش:</span>
              <span className="font-bold text-ink">{toPersianDigits(payment.date)}</span>
            </div>
            {payment.recordedByName && (
              <div className="flex items-center justify-between py-[12px] text-[13px]">
                <span className="text-ink-faint">ثبت‌شده توسط:</span>
                <span className="font-semibold text-ink">{payment.recordedByName}</span>
              </div>
            )}
          </div>

          {/* Status Changer */}
          <div className="mt-[18px] rounded-[12px] border border-border bg-bg p-[12px]">
            <div className="mb-[6px] text-[12px] font-bold text-ink-faint">
              تغییر وضعیت تراکنش:
            </div>
            <div className="grid grid-cols-2 gap-[6px] min-[420px]:grid-cols-4">
              <button
                type="button"
                onClick={() => onUpdateStatus(payment.id, "paid")}
                className={cn(
                  "rounded-[8px] p-[6px_8px] text-[11.5px] font-bold transition-all",
                  payment.status === "paid"
                    ? "bg-[#0EA5E9] text-white"
                    : "bg-surface border border-border text-ink hover:bg-tint"
                )}
              >
                موفق
              </button>
              <button
                type="button"
                onClick={() => onUpdateStatus(payment.id, "pending")}
                className={cn(
                  "rounded-[8px] p-[6px_8px] text-[11.5px] font-bold transition-all",
                  payment.status === "pending"
                    ? "bg-[#F59E0B] text-white"
                    : "bg-surface border border-border text-ink hover:bg-[#FFFBEB]"
                )}
              >
                در انتظار
              </button>
              <button
                type="button"
                onClick={() => onUpdateStatus(payment.id, "failed")}
                className={cn(
                  "rounded-[8px] p-[6px_8px] text-[11.5px] font-bold transition-all",
                  payment.status === "failed"
                    ? "bg-[#F43F5E] text-white"
                    : "bg-surface border border-border text-ink hover:bg-[#FFF1F2]"
                )}
              >
                ناموفق
              </button>
              <button
                type="button"
                onClick={() => onUpdateStatus(payment.id, "refunded")}
                className={cn(
                  "rounded-[8px] p-[6px_8px] text-[11.5px] font-bold transition-all",
                  payment.status === "refunded"
                    ? "bg-[#64748B] text-white"
                    : "bg-surface border border-border text-ink hover:bg-bg"
                )}
              >
                بازگشت
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border bg-bg/50 p-[16px_24px]">
          <button
            type="button"
            onClick={() => {
              if (confirm(`آیا از حذف تراکنش ${payment.txId} مطمئن هستید؟`)) {
                onDelete(payment.id);
                onClose();
              }
            }}
            className="inline-flex items-center gap-[6px] rounded-[10px] px-[12px] py-[8px] text-[12.5px] font-bold text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
          >
            <Trash2 className="h-[14px] w-[14px]" />
            حذف تراکنش
          </button>

          <div className="flex items-center gap-[8px]">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-[6px] rounded-[10px] border border-border bg-surface px-[14px] py-[8px] text-[13px] font-bold text-ink transition-colors hover:border-primary hover:bg-tint"
            >
              <Printer className="h-[14px] w-[14px]" />
              چاپ رسید
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-[10px] btn-ink-gradient px-[16px] py-[8px] text-[13px] font-bold text-white transition-colors"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}