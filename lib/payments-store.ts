"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  usePayments as useBackendPayments,
  useRecordPayment,
  useRefundPayment,
} from "@/lib/hooks/queries/use-billing";
import { billingService } from "@/lib/api/services/billing.service";
import { membersService } from "@/lib/api/services/members.service";
import { useMembersData, normalizePersianName } from "@/lib/members-store";
import {
  type PaymentItem,
  type PaymentStatus,
  type PaymentMethod,
} from "@/components/admin/payments/types";
import { toPersianDigits } from "@/lib/persian-digits";
import { tokenStorage } from "@/lib/api/token";
import { getCurrentGymScope } from "@/lib/session-scope";

export const PAYMENTS_UPDATED_EVENT = "fitlegend_gym_payments_updated";

/**
 * Format any amount into full Persian digits with thousands separators + "تومان"
 * Example: 2400000 -> "۲٬۴۰۰٬۰۰۰ تومان"
 * NEVER uses the letter "م"
 */
export function formatFullToman(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === "") return "۰ تومان";
  const num = typeof val === "string" ? parseFloat(val.replace(/[^\d.-]/g, "")) : val;
  if (isNaN(num)) return "۰ تومان";
  return `${num.toLocaleString("fa-IR")} تومان`;
}

function isValidUuid(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export function getPaymentStatusOverridesKey(scope?: string): string {
  const s = scope || getCurrentGymScope();
  return `fitlegend_payment_status_overrides_${s}`;
}

export function getPaymentStatusOverrides(scope?: string): Record<string, PaymentStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(getPaymentStatusOverridesKey(scope));
    if (raw) return JSON.parse(raw);
  } catch { }
  return {};
}

export function savePaymentStatusOverride(id: string, status: PaymentStatus, scope?: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = getPaymentStatusOverridesKey(scope);
    const existing = getPaymentStatusOverrides(scope);
    existing[id] = status;
    localStorage.setItem(key, JSON.stringify(existing));
    window.dispatchEvent(new CustomEvent(PAYMENTS_UPDATED_EVENT));
  } catch { }
}

export function usePaymentsData() {
  const {
    data: backendPayments,
    isLoading: isBackendLoading,
    error: backendError,
    refetch,
  } = useBackendPayments();
  const { members: gymMembers } = useMembersData();
  const recordMutation = useRecordPayment();
  const refundMutation = useRefundPayment();

  const [statusOverrides, setStatusOverrides] = useState<Record<string, PaymentStatus>>(() =>
    getPaymentStatusOverrides()
  );

  useEffect(() => {
    const handleUpdate = () => {
      setStatusOverrides(getPaymentStatusOverrides());
    };
    window.addEventListener(PAYMENTS_UPDATED_EVENT, handleUpdate);
    window.addEventListener("fitlegend:gym-changed", handleUpdate);
    window.addEventListener("fitlegend:auth-logout", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(PAYMENTS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("fitlegend:gym-changed", handleUpdate);
      window.removeEventListener("fitlegend:auth-logout", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Extract and map ONLY payments that are in Django
  const payments: PaymentItem[] = useMemo(() => {
    // If not authenticated, return empty list
    if (typeof window !== "undefined" && !tokenStorage.hasValidSession()) {
      return [];
    }

    const backendList: any[] = Array.isArray(backendPayments)
      ? backendPayments
      : Array.isArray((backendPayments as any)?.results)
        ? (backendPayments as any).results
        : Array.isArray((backendPayments as any)?.payments)
          ? (backendPayments as any).payments
          : [];

    return backendList.map((p, idx) => {
      const paymentId = String(p.id || `backend-${idx}`);
      const rawUuid = String(p.id || "");

      const amt =
        typeof p.amount === "string"
          ? Math.round(parseFloat(p.amount))
          : Math.round(Number(p.amount) || 0);

      // Match payment with member from gymMembers to get their real avatar image, phone, etc.
      const matchingMember = gymMembers.find((m) => {
        if (p.member && String(m.id) === String(p.member)) return true;
        if (p.member_id && String(m.id) === String(p.member_id)) return true;
        if (m.fullName && p.member_name) {
          const normA = normalizePersianName(m.fullName);
          const normB = normalizePersianName(p.member_name);
          if (normA === normB || normA.includes(normB) || normB.includes(normA)) return true;
        }
        return false;
      });

      const memberName = p.member_name || matchingMember?.fullName || matchingMember?.name || "عضو باشگاه";
      const memberEmail = p.member_email || matchingMember?.email || "";
      const memberAvatarImg = matchingMember?.avatar || undefined;

      const initials = memberName
        .trim()
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2);

      const noteStr = (p.note || "").trim();

      // Check for status tags in note or override
      let derivedStatus: PaymentStatus;
      if (statusOverrides[paymentId]) {
        derivedStatus = statusOverrides[paymentId];
      } else if (
        p.status === "REFUNDED" ||
        noteStr.startsWith("[استرداد]") ||
        noteStr.toLowerCase().startsWith("[refunded]")
      ) {
        derivedStatus = "refunded";
      } else if (
        noteStr.startsWith("[در انتظار]") ||
        noteStr.toLowerCase().startsWith("[pending]")
      ) {
        derivedStatus = "pending";
      } else if (
        noteStr.startsWith("[ناموفق]") ||
        noteStr.toLowerCase().startsWith("[failed]") ||
        noteStr.startsWith("[منقضی]") ||
        noteStr.toLowerCase().startsWith("[expired]")
      ) {
        derivedStatus = "failed";
      } else if (
        noteStr.startsWith("[موفق]") ||
        noteStr.toLowerCase().startsWith("[paid]") ||
        noteStr.toLowerCase().startsWith("[success]") ||
        p.status === "RECORDED" ||
        p.status === "COMPLETED"
      ) {
        derivedStatus = "paid";
      } else if (p.status === "PENDING") {
        derivedStatus = "pending";
      } else {
        derivedStatus = "paid";
      }

      // Clean title by stripping any status tags
      const cleanTitle =
        noteStr
          .replace(
            /^\[(موفق|paid|success|در انتظار|pending|ناموفق|failed|منقضی|expired|استرداد|refunded)\]\s*/i,
            ""
          )
          .trim() || "پرداخت شهریه";

      const statusLabels: Record<PaymentStatus, string> = {
        paid: "موفق",
        pending: "در انتظار",
        failed: "ناموفق",
        refunded: "بازگشت‌خورده",
      };

      const dateFormatted = p.created_at
        ? new Date(p.created_at).toLocaleDateString("fa-IR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        : "—";

      const shortCode =
        rawUuid.length >= 8
          ? rawUuid.replace(/-/g, "").slice(0, 5).toUpperCase()
          : String(10000 + idx);

      const isRefunded = derivedStatus === "refunded";

      return {
        id: paymentId,
        memberId: p.member || p.member_id || matchingMember?.id,
        txId: `TXN-${toPersianDigits(shortCode)}`,
        memberName,
        memberEmail,
        memberAvatar: initials || "عض",
        avatarGradient: isRefunded
          ? "linear-gradient(135deg,#94A3B8,#64748B)"
          : "linear-gradient(135deg,#F25C1F,#0EA5E9)",
        avatarUrl: memberAvatarImg,
        forTitle: cleanTitle,
        amount: amt || 0,
        amountFormatted: (amt || 0).toLocaleString("fa-IR"),
        isNegative: isRefunded,
        date: dateFormatted,
        method: "online" as PaymentMethod,
        methodLabel: isRefunded ? "استرداد وجه" : (p.note ? "ثبت دستی" : "درگاه آنلاین"),
        status: derivedStatus,
        statusLabel: statusLabels[derivedStatus],
        recordedByName: p.recorded_by_name,
      };
    });
  }, [backendPayments, gymMembers, statusOverrides]);

  // Calculations derived directly from Django payments
  const successfulPayments = useMemo(
    () => payments.filter((p) => p.status === "paid"),
    [payments]
  );

  const totalRevenue = useMemo(() => {
    return successfulPayments.reduce((sum, p) => sum + p.amount, 0);
  }, [successfulPayments]);

  const weeklyRevenue = totalRevenue;
  const monthlyRevenue = totalRevenue;

  /**
   * Records a manual payment in Django backend
   * Encodes user's selected status into note for Django panel synchronization
   */
  const addPayment = useCallback(
    async (
      newPaymentData: Omit<PaymentItem, "id"> & {
        memberId?: string;
        memberName?: string;
        memberEmail?: string;
      }
    ) => {
      let effectiveMemberId = newPaymentData.memberId;

      // If memberId is missing or not a valid UUID, but we have memberName, auto-resolve or create member on Django
      if (!isValidUuid(effectiveMemberId) && newPaymentData.memberName) {
        try {
          const parts = newPaymentData.memberName.trim().split(/\s+/);
          const firstName = parts[0] || "ورزشکار";
          const lastName = parts.slice(1).join(" ") || "باشگاه";
          const created = await membersService.createMember({
            first_name: firstName,
            last_name: lastName,
            start_date: new Date().toISOString().slice(0, 10),
            email: newPaymentData.memberEmail || undefined,
          });
          const newId = (created as any)?.id || (created as any)?.data?.id;
          if (newId) {
            effectiveMemberId = String(newId);
          }
        } catch (memberErr) {
          console.error("Auto member creation error:", memberErr);
        }
      }

      if (!effectiveMemberId || !isValidUuid(effectiveMemberId)) {
        throw new Error("شناسه عضو برای ثبت پرداخت یافت نشد. لطفاً ابتدا عضو مورد نظر را انتخاب نمایید.");
      }

      // Encode status in note so it saves directly into Django's note column
      let cleanTitle = (newPaymentData.forTitle || "پرداخت شهریه").trim();
      cleanTitle =
        cleanTitle
          .replace(
            /^\[(موفق|paid|در انتظار|pending|ناموفق|failed|منقضی|expired|استرداد|refunded)\]\s*/i,
            ""
          )
          .trim() || "پرداخت شهریه";

      const statusTagMap: Record<PaymentStatus, string> = {
        paid: "[موفق]",
        pending: "[در انتظار]",
        failed: "[ناموفق]",
        refunded: "[استرداد]",
      };

      const tag = statusTagMap[newPaymentData.status || "paid"] || "[موفق]";
      const notePayload = `${tag} ${cleanTitle}`.trim();

      // Record directly on Django backend
      const result = await recordMutation.mutateAsync({
        member_id: effectiveMemberId,
        amount: newPaymentData.amount,
        note: notePayload.slice(0, 255),
      });

      // Save initial status override for the newly created payment
      const createdId = String((result as any)?.id || (result as any)?.payment?.id || "");
      if (createdId && newPaymentData.status) {
        savePaymentStatusOverride(createdId, newPaymentData.status);
      }

      // Refetch payments from Django to stay 100% synchronized
      await refetch();

      return result;
    },
    [recordMutation, refetch]
  );

  /**
   * Updates payment status or refunds payment in Django
   * Allows changing status to paid, pending, failed, or refunded anytime
   */
  const updatePaymentStatus = useCallback(
    async (id: string, newStatus: PaymentStatus) => {
      if (!id) return;

      const targetPayment = payments.find((p) => p.id === id);
      const cleanTitle = (targetPayment?.forTitle || "پرداخت شهریه")
        .replace(
          /^\[(موفق|paid|در انتظار|pending|ناموفق|failed|منقضی|expired|استرداد|refunded)\]\s*/i,
          ""
        )
        .trim();

      const statusTagMap: Record<PaymentStatus, string> = {
        paid: "[موفق]",
        pending: "[در انتظار]",
        failed: "[ناموفق]",
        refunded: "[استرداد]",
      };

      const newNote = `${statusTagMap[newStatus]} ${cleanTitle}`.trim();

      // 1. Save status override so status persists across sessions
      savePaymentStatusOverride(id, newStatus);
      setStatusOverrides(getPaymentStatusOverrides());

      // 2. If status changed to refunded, execute refund on Django backend
      if (newStatus === "refunded" && isValidUuid(id)) {
        try {
          await refundMutation.mutateAsync(id);
        } catch (err) {
          console.warn("Django refund call notice:", err);
        }
      }

      // 3. Attempt to update note on Django backend
      if (isValidUuid(id)) {
        try {
          await billingService.updatePayment(id, {
            note: newNote,
            status: newStatus === "refunded" ? "REFUNDED" : "RECORDED",
          });
        } catch (patchErr) {
          console.warn("Django update note notice:", patchErr);
        }
      }

      // 4. Refetch to keep everything synchronized
      await refetch();
    },
    [payments, refundMutation, refetch]
  );

  /**
   * Accounting deletion policy: marks refunded on Django backend
   */
  const deletePayment = useCallback(
    async (id: string) => {
      if (isValidUuid(id)) {
        try {
          savePaymentStatusOverride(id, "refunded");
          await refundMutation.mutateAsync(id);
          await refetch();
        } catch (err) {
          console.error("Backend refund error on delete:", err);
        }
      }
    },
    [refundMutation, refetch]
  );

  return {
    payments,
    totalRevenue,
    monthlyRevenue,
    weeklyRevenue,
    successfulCount: successfulPayments.length,
    pendingCount: payments.filter((p) => p.status === "pending").length,
    failedCount: payments.filter((p) => p.status === "failed" || p.status === "refunded").length,
    isLoading: isBackendLoading,
    isSaving: recordMutation.isPending,
    isRefunding: refundMutation.isPending,
    error: backendError,
    refetch,
    addPayment,
    updatePaymentStatus,
    deletePayment,
  };
}
