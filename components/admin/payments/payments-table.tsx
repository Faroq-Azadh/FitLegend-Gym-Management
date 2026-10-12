"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/persian-digits";
import { Search } from "lucide-react";
import { PaymentItem, PaymentStatus, PaymentMethod } from "./types";

interface PaymentsTableProps {
  payments: PaymentItem[];
  onSelectPayment: (payment: PaymentItem) => void;
}

export function PaymentsTable({
  payments,
  onSelectPayment,
}: PaymentsTableProps) {
  const [selectedTab, setSelectedTab] = useState<"all" | PaymentStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest">("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // Status Counts
  const totalCount = payments.length;
  const paidCount = payments.filter((p) => p.status === "paid").length;
  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const failedCount = payments.filter((p) => p.status === "failed").length;
  const refundedCount = payments.filter((p) => p.status === "refunded").length;

  const tabs = [
    { id: "all", label: "همه", count: totalCount },
    { id: "paid", label: "موفق", count: paidCount },
    { id: "pending", label: "در انتظار", count: pendingCount },
    { id: "failed", label: "ناموفق", count: failedCount },
    { id: "refunded", label: "بازگشت‌خورده", count: refundedCount },
  ];

  // Filtering
  const filtered = payments.filter((item) => {
    const matchesTab = selectedTab === "all" || item.status === selectedTab;

    const matchesSearch =
      searchQuery === "" ||
      item.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.memberEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.txId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.forTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod =
      methodFilter === "all" ||
      (methodFilter === "online" && item.method === "online") ||
      (methodFilter === "card" && item.method === "card") ||
      (methodFilter === "cash" && item.method === "cash");

    return matchesTab && matchesSearch && matchesMethod;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "highest") {
      return b.amount - a.amount;
    }
    if (sortBy === "oldest") {
      return a.date.localeCompare(b.date);
    }
    // newest default
    return b.date.localeCompare(a.date);
  });

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "online":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[15px] w-[15px]"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
          </svg>
        );
      case "card":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[15px] w-[15px]"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M6 15h4M16 15h2" />
          </svg>
        );
      case "cash":
      default:
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[15px] w-[15px]"
          >
            <path d="M2 7h20v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" />
            <path d="M16 11h2" />
          </svg>
        );
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-[6px] rounded-full bg-tint px-[11px] py-[5px] text-[12px] font-bold text-primary-dark">
            <span className="h-[6px] w-[6px] rounded-full bg-primary" />
            موفق
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-[6px] rounded-full bg-[#FFFBEB] px-[11px] py-[5px] text-[12px] font-bold text-[#B45309]">
            <span className="h-[6px] w-[6px] rounded-full bg-[#F59E0B]" />
            در انتظار
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-[6px] rounded-full bg-[#FFF1F2] px-[11px] py-[5px] text-[12px] font-bold text-[#9F1239]">
            <span className="h-[6px] w-[6px] rounded-full bg-[#F43F5E]" />
            ناموفق
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center gap-[6px] rounded-full bg-[#F1F5F9] px-[11px] py-[5px] text-[12px] font-bold text-[#475569]">
            <span className="h-[6px] w-[6px] rounded-full bg-[#94A3B8]" />
            بازگشت‌خورده
          </span>
        );
    }
  };

  return (
    <div className="rounded-[16px] border border-border bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-[14px] border-b border-border p-[16px_20px]">
        {/* Status Tabs */}
        <div className="flex gap-[4px] rounded-[12px] bg-bg p-[5px]">
          {tabs.map((tab) => {
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
                className={cn(
                  "inline-flex items-center gap-[7px] whitespace-nowrap rounded-[9px] px-[14px] py-[8px] text-[13px] font-bold transition-all duration-180",
                  isActive
                    ? "bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                    : "text-ink-faint hover:text-ink",
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "rounded-full px-[7px] py-[1px] text-[11px] font-bold",
                    isActive
                      ? "bg-tint text-primary-dark"
                      : "bg-border text-ink-soft",
                  )}
                >
                  {toPersianDigits(tab.count)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Toolbar End (Search & Filters) */}
        <div className="mr-auto flex flex-wrap items-center gap-[10px]">
          {/* Search Box */}
          <div className="flex w-[240px] max-w-[50vw] items-center gap-[9px] rounded-[11px] border border-border bg-bg p-[8px_13px] transition-colors focus-within:border-primary focus-within:bg-surface">
            <Search className="h-[16px] w-[16px] shrink-0 text-ink-faint" />
            <input
              type="text"
              placeholder="جستجوی عضو یا شناسه…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-none bg-transparent text-[13.5px] text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </div>

          {/* Method Filter */}
          <div className="relative inline-flex items-center rounded-[11px] border border-border bg-surface transition-colors hover:border-primary">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="select-input cursor-pointer border-none bg-transparent p-[9px_36px_9px_14px] text-[13.5px] font-semibold text-ink focus:outline-none"
            >
              <option value="all">همه روش‌ها</option>
              <option value="online">درگاه آنلاین</option>
              <option value="card">کارت بانکی</option>
              <option value="cash">نقدی</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="relative inline-flex items-center rounded-[11px] border border-border bg-surface transition-colors hover:border-primary">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="select-input cursor-pointer border-none bg-transparent p-[9px_36px_9px_14px] text-[13.5px] font-semibold text-ink focus:outline-none"
            >
              <option value="newest">جدیدترین</option>
              <option value="oldest">قدیمی‌ترین</option>
              <option value="highest">بیشترین مبلغ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-right">
          <thead className="font-bold">
            <tr className="border-b border-border bg-surface text-[13.5px] font-bold text-ink-faint">
              <th className="whitespace-nowrap p-[16px_20px] font-bold">شناسه تراکنش</th>
              <th className="whitespace-nowrap p-[16px_20px] font-bold">عضو</th>
              <th className="whitespace-nowrap p-[16px_20px] font-bold">مبلغ</th>
              <th className="whitespace-nowrap p-[16px_20px] font-bold">روش پرداخت</th>
              <th className="whitespace-nowrap p-[16px_20px] font-bold">بابت</th>
              <th className="whitespace-nowrap p-[16px_20px] font-bold">تاریخ</th>
              <th className="whitespace-nowrap p-[16px_20px] font-bold">وضعیت</th>
              <th className="w-[48px] p-[16px_20px] font-bold"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-[48px] text-center text-[13.5px] text-ink-faint">
                  {payments.length === 0
                    ? "هنوز هیچ تراکنشی در سامانه ثبت نشده است. برای ثبت اولین واریزی روی دکمه «ثبت پرداخت» کلیک نمایید."
                    : "هیچ تراکنشی با فیلترهای انتخابی یافت نشد."}
                </td>
              </tr>
            ) : (
              sorted.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border/70 transition-colors hover:bg-bg"
                >
                  {/* TxID */}
                  <td className="whitespace-nowrap p-[14px_20px]">
                    <span className="font-semibold text-ink text-[13.5px] tracking-[0.02em]">
                      {toPersianDigits(item.txId)}
                    </span>
                  </td>

                  {/* Member Cell */}
                  <td className="whitespace-nowrap p-[14px_20px]">
                    <div className="flex items-center gap-[11px]">
                      {item.avatarUrl ? (
                        <img
                          src={item.avatarUrl}
                          alt={item.memberName}
                          className="h-[36px] w-[36px] shrink-0 rounded-[10px] object-cover shadow-xs border border-border"
                        />
                      ) : (
                        <span
                          className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[10px] text-[12.5px] font-bold text-white shadow-xs"
                          style={{ background: item.avatarGradient }}
                        >
                          {item.memberAvatar}
                        </span>
                      )}
                      <div>
                        <div className="text-[13.5px] font-bold text-ink">
                          {item.memberName}
                        </div>
                        <div className="text-[12px] text-ink-faint">
                          {item.memberEmail}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="whitespace-nowrap p-[14px_20px]">
                    <span
                      className={cn(
                        "text-[14px] font-extrabold",
                        item.isNegative ? "text-[#9F1239]" : "text-ink",
                      )}
                    >
                      {toPersianDigits(item.amountFormatted)}
                      <span className="mr-[3px] text-[11.5px] font-semibold text-ink-faint">
                        تومان
                      </span>
                    </span>
                  </td>

                  {/* Payment Method */}
                  <td className="whitespace-nowrap p-[14px_20px]">
                    <span className="inline-flex items-center gap-[8px] text-[13px] font-semibold text-ink-soft">
                      <span className="flex h-[28px] w-[28px] items-center justify-center rounded-[8px] bg-bg text-ink-soft">
                        {getMethodIcon(item.method)}
                      </span>
                      {item.methodLabel}
                    </span>
                  </td>

                  {/* For Title */}
                  <td className="whitespace-nowrap p-[14px_20px] text-[13.5px] text-ink-soft">
                    {item.forTitle}
                  </td>

                  {/* Date */}
                  <td className="whitespace-nowrap p-[14px_20px] text-[13.5px] text-ink-soft">
                    {toPersianDigits(item.date)}
                  </td>

                  {/* Status */}
                  <td className="whitespace-nowrap p-[14px_20px]">
                    {getStatusBadge(item.status)}
                  </td>

                  {/* Row Action */}
                  <td className="p-[14px_20px] text-left">
                    <div className="flex items-center justify-end gap-[4px]">
                      <button
                        type="button"
                        onClick={() => onSelectPayment(item)}
                        className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] text-ink-faint transition-all hover:bg-tint hover:text-primary-dark"
                        title="مشاهده جزئیات تراکنش"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Foot & Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-[14px] p-[16px_20px]">
        <div className="text-[13px] font-medium text-ink-faint">
          نمایش {toPersianDigits(1)} تا {toPersianDigits(sorted.length)} از{" "}
          {toPersianDigits(totalCount)} تراکنش
        </div>

        <div className="flex items-center gap-[6px]">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="flex h-[36px] min-w-[36px] items-center justify-center rounded-[10px] border border-border bg-surface px-[10px] text-[13.5px] font-bold text-ink-soft transition-all hover:border-primary hover:bg-tint hover:text-primary-dark disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="قبلی"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[16px] w-[16px]"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            className={cn(
              "h-[36px] min-w-[36px] rounded-[10px] border px-[10px] text-[13.5px] font-bold transition-all",
              currentPage === 1
                ? "border-ink bg-ink text-white"
                : "border-border bg-surface text-ink-soft hover:border-primary hover:bg-tint hover:text-primary-dark",
            )}
          >
            {toPersianDigits(1)}
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(2)}
            className={cn(
              "h-[36px] min-w-[36px] rounded-[10px] border px-[10px] text-[13.5px] font-bold transition-all",
              currentPage === 2
                ? "border-ink bg-ink text-white"
                : "border-border bg-surface text-ink-soft hover:border-primary hover:bg-tint hover:text-primary-dark",
            )}
          >
            {toPersianDigits(2)}
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(3)}
            className={cn(
              "h-[36px] min-w-[36px] rounded-[10px] border px-[10px] text-[13.5px] font-bold transition-all",
              currentPage === 3
                ? "border-ink bg-ink text-white"
                : "border-border bg-surface text-ink-soft hover:border-primary hover:bg-tint hover:text-primary-dark",
            )}
          >
            {toPersianDigits(3)}
          </button>

          <button
            type="button"
            className="h-[36px] min-w-[36px] rounded-[10px] border border-border bg-surface px-[10px] text-[13.5px] font-bold text-ink-soft"
          >
            …
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage(180)}
            className={cn(
              "h-[36px] min-w-[36px] rounded-[10px] border px-[10px] text-[13.5px] font-bold transition-all",
              currentPage === 180
                ? "border-ink bg-ink text-white"
                : "border-border bg-surface text-ink-soft hover:border-primary hover:bg-tint hover:text-primary-dark",
            )}
          >
            {toPersianDigits(180)}
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => p + 1)}
            className="flex h-[36px] min-w-[36px] items-center justify-center rounded-[10px] border border-border bg-surface px-[10px] text-[13.5px] font-bold text-ink-soft transition-all hover:border-primary hover:bg-tint hover:text-primary-dark"
            aria-label="بعدی"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[16px] w-[16px]"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
