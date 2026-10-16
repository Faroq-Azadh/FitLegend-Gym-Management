"use client";

import React, { useState, useMemo, useEffect } from "react";
import { toPersianDigits } from "@/lib/persian-digits";
import { cn } from "@/lib/utils";
import { useClasses } from "@/lib/hooks/queries/use-classes";
import { useMembers } from "@/lib/hooks/queries/use-members";

export interface BookingItem {
  id: string;
  name: string;
  className: string;
  coach: string;
  time: string;
  status: "confirmed" | "pending" | "cancelled";
  member_id?: string;
  class_id?: string;
  date?: string;
}

export interface AddBookingFormValues {
  member_id?: string;
  member_name: string;
  class_id: string;
  class_title: string;
  coach_name: string;
  day_name: string;
  start_time: string;
  date: string;
  status: "confirmed" | "pending";
}

const AVATAR_COLORS = [
  "#F25C1F",
  "#0EA5E9",
  "#6366F1",
  "#F59E0B",
  "#EC4899",
  "#0EA5E9",
  "#10B981",
  "#8B5CF6",
];

const STATUS_CONFIG: Record<
  BookingItem["status"],
  { label: string; bgClass: string; dotClass: string; textClass: string }
> = {
  confirmed: {
    label: "تأییدشده",
    bgClass: "bg-[#E0F2FE]",
    dotClass: "bg-[#0EA5E9]",
    textClass: "text-[#0284C7]",
  },
  pending: {
    label: "در انتظار",
    bgClass: "bg-[#FFFBEB]",
    dotClass: "bg-[#F59E0B]",
    textClass: "text-[#B45309]",
  },
  cancelled: {
    label: "لغوشده",
    bgClass: "bg-[#FFF1F2]",
    dotClass: "bg-[#F43F5E]",
    textClass: "text-[#9F1239]",
  },
};

interface BookingsTableProps {
  bookings: BookingItem[];
  onUpdateStatus: (id: string, newStatus: BookingItem["status"]) => void;
  onAddBooking: (booking: AddBookingFormValues) => void;
  onDeleteBooking: (id: string) => void;
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
  onOpenAddModal?: () => void;
}

export function BookingsTable({
  bookings,
  onUpdateStatus,
  onAddBooking,
  onDeleteBooking,
  isAddModalOpen,
  onCloseAddModal,
  onOpenAddModal,
}: BookingsTableProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Queries for real backend data
  const { data: gymClasses } = useClasses();
  const { data: membersData } = useMembers();

  const membersList = useMemo(() => {
    return membersData?.results || [];
  }, [membersData]);

  // Modal Form State
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [customMemberName, setCustomMemberName] = useState("");
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [bookingStatus, setBookingStatus] = useState<"confirmed" | "pending">("confirmed");

  // When classes load, set initial selection if empty
  useEffect(() => {
    if (gymClasses && gymClasses.length > 0 && !selectedClassId) {
      setSelectedClassId(String(gymClasses[0].id));
    }
  }, [gymClasses, selectedClassId]);

  // When members load, set initial selection if empty
  useEffect(() => {
    if (membersList.length > 0 && !selectedMemberId && !customMemberName) {
      setSelectedMemberId(String(membersList[0].id));
    }
  }, [membersList, selectedMemberId, customMemberName]);

  const selectedClass = useMemo(() => {
    return gymClasses?.find((c) => String(c.id) === String(selectedClassId));
  }, [gymClasses, selectedClassId]);

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("");
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((item) => {
      const matchesFilter = filter === "all" || item.status === filter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.className.toLowerCase().includes(q) ||
        item.coach.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [bookings, filter, searchQuery]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    let finalMemberName = customMemberName.trim();
    let finalMemberId: string | undefined = undefined;

    if (selectedMemberId && selectedMemberId !== "custom") {
      const m = membersList.find((mem) => String(mem.id) === String(selectedMemberId));
      if (m) {
        finalMemberName = m.full_name || `${(m as any).first_name || ""} ${(m as any).last_name || ""}`.trim() || "ورزشکار";
        finalMemberId = String(m.id);
      }
    }

    if (!finalMemberName) {
      setSubmitError("لطفاً نام یا عضو رزروکننده را مشخص کنید.");
      return;
    }

    const classItem = selectedClass;
    const finalClassId = classItem ? String(classItem.id) : selectedClassId || "class_default";
    const finalClassTitle = classItem ? classItem.title : "کلاس ورزشی";
    const finalCoachName = classItem?.coach_name || "مربی باشگاه";
    const finalDayName = classItem?.day_name || "شنبه";
    const finalStartTime = classItem?.start_time ? classItem.start_time.slice(0, 5) : "18:00";

    try {
      setIsSubmitting(true);
      await onAddBooking({
        member_id: finalMemberId,
        member_name: finalMemberName,
        class_id: finalClassId,
        class_title: finalClassTitle,
        coach_name: finalCoachName,
        day_name: finalDayName,
        start_time: finalStartTime,
        date: bookingDate,
        status: bookingStatus,
      });

      if (onCloseAddModal) onCloseAddModal();
    } catch (err: any) {
      console.error("Booking error:", err);
      const detailMsg = err?.response?.data?.detail || err?.data?.detail || err?.message || "خطا در ثبت رزرو در سرور";
      setSubmitError(typeof detailMsg === "string" ? detailMsg : JSON.stringify(detailMsg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Filter Bar */}
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-[12px]">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-[4px] rounded-[10px] bg-bg p-[4px]" id="statusTabs">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "cursor-pointer rounded-[8px] px-[14px] py-[8px] text-[13px] font-bold transition-all duration-180",
              filter === "all"
                ? "bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                : "text-ink-faint hover:text-ink"
            )}
          >
            همه
          </button>
          <button
            type="button"
            onClick={() => setFilter("pending")}
            className={cn(
              "cursor-pointer rounded-[8px] px-[14px] py-[8px] text-[13px] font-bold transition-all duration-180",
              filter === "pending"
                ? "bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                : "text-ink-faint hover:text-ink"
            )}
          >
            در انتظار
          </button>
          <button
            type="button"
            onClick={() => setFilter("confirmed")}
            className={cn(
              "cursor-pointer rounded-[8px] px-[14px] py-[8px] text-[13px] font-bold transition-all duration-180",
              filter === "confirmed"
                ? "bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                : "text-ink-faint hover:text-ink"
            )}
          >
            تأییدشده
          </button>
          <button
            type="button"
            onClick={() => setFilter("cancelled")}
            className={cn(
              "cursor-pointer rounded-[8px] px-[14px] py-[8px] text-[13px] font-bold transition-all duration-180",
              filter === "cancelled"
                ? "bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                : "text-ink-faint hover:text-ink"
            )}
          >
            لغوشده
          </button>
        </div>

        {/* Search Field & Add Button */}
        <div className="flex flex-wrap items-center gap-[10px]">
          <div className="flex min-w-[240px] items-center gap-[10px] rounded-[12px] border border-border bg-surface px-[14px] py-[9px] transition-colors focus-within:border-primary">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[17px] w-[17px] shrink-0 text-ink-faint"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              id="bSearch"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام، کلاس یا مربی…"
              className="w-full border-none bg-transparent text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </div>

          {onOpenAddModal && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex cursor-pointer items-center justify-center gap-[8px] rounded-[10px] bg-primary px-[16px] py-[9px] text-[13px] font-bold text-ink shadow-sm transition-all hover:bg-primary-dark hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[16px] w-[16px]"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>ثبت رزرو جدید</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-[16px] border border-border bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        {/* Card Head */}
        <div className="flex items-center justify-between border-b border-border px-[22px] py-[20px]">
          <div>
            <h3 className="text-[16px] font-extrabold text-ink">فهرست رزروها</h3>
            <div className="mt-[3px] text-[12.5px] text-ink-faint" id="rowInfo">
              نمایش {toPersianDigits(filteredBookings.length)} رزرو در باشگاه
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="font-bold">
              <tr>
                <th className="border-b border-border px-[22px] pt-[14px] pb-[14px] text-right text-[13.5px] font-bold whitespace-nowrap text-ink-faint">
                  عضو
                </th>
                <th className="border-b border-border px-[22px] pt-[14px] pb-[14px] text-right text-[13.5px] font-bold whitespace-nowrap text-ink-faint">
                  کلاس
                </th>
                <th className="border-b border-border px-[22px] pt-[14px] pb-[14px] text-right text-[13.5px] font-bold whitespace-nowrap text-ink-faint">
                  مربی
                </th>
                <th className="border-b border-border px-[22px] pt-[14px] pb-[14px] text-right text-[13.5px] font-bold whitespace-nowrap text-ink-faint">
                  زمان و تاریخ
                </th>
                <th className="border-b border-border px-[22px] pt-[14px] pb-[14px] text-right text-[13.5px] font-bold whitespace-nowrap text-ink-faint">
                  وضعیت
                </th>
                <th className="border-b border-border px-[22px] pt-[14px] pb-[14px] text-left text-[13.5px] font-bold whitespace-nowrap text-ink-faint">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody id="bBody">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((item, index) => {
                  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
                  const statusConf = STATUS_CONFIG[item.status];
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-border transition-colors duration-150 last:border-b-0 hover:bg-bg"
                    >
                      <td className="px-[22px] py-[15px] text-[13.5px] whitespace-nowrap text-ink-soft">
                        <div className="flex items-center gap-[11px]">
                          <span
                            className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[10px] text-[13px] font-bold text-white shadow-xs"
                            style={{ backgroundColor: avatarColor }}
                          >
                            {getInitials(item.name)}
                          </span>
                          <div>
                            <div className="text-[13.5px] font-bold text-ink">
                              {item.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-[22px] py-[15px] text-[13.5px] whitespace-nowrap font-medium text-ink">
                        {item.className}
                      </td>
                      <td className="px-[22px] py-[15px] text-[13.5px] whitespace-nowrap text-ink-soft">
                        {item.coach || "-"}
                      </td>
                      <td className="px-[22px] py-[15px] text-[13.5px] whitespace-nowrap text-ink-soft" dir="ltr">
                        <span className="inline-block text-right">{item.time}</span>
                      </td>
                      <td className="px-[22px] py-[15px] text-[13.5px] whitespace-nowrap text-ink-soft">
                        <span
                          className={cn(
                            "inline-flex items-center gap-[6px] rounded-[100px] px-[11px] py-[5px] text-[12px] font-bold",
                            statusConf.bgClass,
                            statusConf.textClass
                          )}
                        >
                          <span
                            className={cn("h-[6px] w-[6px] rounded-full", statusConf.dotClass)}
                          />
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="px-[22px] py-[15px] text-[13.5px] whitespace-nowrap text-ink-soft">
                        <div className="flex items-center justify-end gap-[6px]">
                          {item.status === "pending" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => onUpdateStatus(item.id, "confirmed")}
                                className="inline-flex cursor-pointer items-center justify-center rounded-[8px] bg-primary px-[10px] py-[6px] text-[12.5px] font-bold text-ink transition-all hover:bg-primary-dark hover:text-white"
                              >
                                تأیید
                              </button>
                              <button
                                type="button"
                                onClick={() => onUpdateStatus(item.id, "cancelled")}
                                className="inline-flex cursor-pointer items-center justify-center rounded-[8px] border border-border bg-surface px-[10px] py-[6px] text-[12.5px] font-semibold text-ink transition-all hover:border-[#F43F5E] hover:bg-[#FFF1F2] hover:text-[#9F1239]"
                              >
                                رد
                              </button>
                            </>
                          ) : item.status === "confirmed" ? (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(item.id, "cancelled")}
                              className="inline-flex cursor-pointer items-center justify-center rounded-[8px] border border-border bg-surface px-[10px] py-[6px] text-[12px] font-semibold text-ink-faint transition-all hover:border-[#F43F5E] hover:bg-[#FFF1F2] hover:text-[#9F1239]"
                              title="لغو رزرو"
                            >
                              لغو رزرو
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(item.id, "confirmed")}
                              className="inline-flex cursor-pointer items-center justify-center rounded-[8px] border border-border bg-surface px-[10px] py-[6px] text-[12px] font-semibold text-ink-faint transition-all hover:border-primary hover:bg-tint hover:text-primary-dark"
                              title="تأیید مجدد"
                            >
                              تأیید مجدد
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (typeof window !== "undefined" && window.confirm("آیا از حذف این رزرو اطمینان دارید؟")) {
                                onDeleteBooking(item.id);
                              }
                            }}
                            className="inline-flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[8px] text-ink-faint transition-all duration-150 hover:bg-[#FFF1F2] hover:text-[#E11D48]"
                            aria-label="حذف"
                            title="حذف"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-[16px] w-[16px]"
                            >
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="p-[48px] text-center text-[14px] text-ink-faint"
                  >
                    <div className="mb-2 font-medium">هیچ رزروی در فهرست وجود ندارد</div>
                    {onOpenAddModal && (
                      <button
                        type="button"
                        onClick={onOpenAddModal}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-[8px] bg-primary px-3 py-1.5 text-[12.5px] font-bold text-ink hover:bg-primary-dark hover:text-white cursor-pointer transition-colors"
                      >
                        + ثبت اولین رزرو
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Booking Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[4px]">
          <div className="w-full max-w-[500px] rounded-[16px] border border-border bg-surface p-[24px] shadow-[0_20px_60px_rgba(15,23,42,0.15)] animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-[20px] flex items-center justify-between border-b border-border pb-[14px]">
              <div>
                <h3 className="text-[17px] font-extrabold text-ink">
                  ثبت رزرو جدید کلاس
                </h3>
                <p className="text-[12px] text-ink-faint mt-1">
                  انتخاب کلاس و عضو بر اساس اطلاعات سامانه
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseAddModal}
                className="text-ink-faint hover:text-ink cursor-pointer p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            {submitError && (
              <div className="mb-[14px] rounded-[10px] border border-[#F43F5E]/30 bg-[#FFF1F2] p-[12px] text-[13px] font-medium text-[#9F1239]">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <span>⚠️</span>
                  <span>پیام سرور:</span>
                </div>
                <div>{submitError}</div>
              </div>
            )}

            <form onSubmit={handleSaveNew} className="flex flex-col gap-[14px]">
              {/* Member Selection */}
              <div>
                <label className="mb-[6px] block text-[13px] font-bold text-ink">
                  عضو متقاضی رزرو <span className="text-[#F43F5E]">*</span>
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => {
                    setSelectedMemberId(e.target.value);
                    if (e.target.value !== "custom") {
                      setCustomMemberName("");
                    }
                  }}
                  className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[10px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary"
                >
                  {membersList.length > 0 ? (
                    membersList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} ({m.phone_number || "بدون شماره"})
                      </option>
                    ))
                  ) : (
                    <option value="">در حال دریافت لیست اعضا…</option>
                  )}
                  <option value="custom">+ عضو آزاد یا نام دیگر…</option>
                </select>

                {selectedMemberId === "custom" && (
                  <input
                    type="text"
                    required
                    placeholder="نام و نام خانوادگی عضو آزاد"
                    value={customMemberName}
                    onChange={(e) => setCustomMemberName(e.target.value)}
                    className="mt-2 w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[10px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary"
                  />
                )}
              </div>

              {/* Class Selection */}
              <div>
                <label className="mb-[6px] block text-[13px] font-bold text-ink">
                  انتخاب کلاس ورزشی <span className="text-[#F43F5E]">*</span>
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[10px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary"
                  required
                >
                  {gymClasses && gymClasses.length > 0 ? (
                    gymClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} — {c.day_name || "شنبه"} ساعت {c.start_time?.slice(0, 5)} {c.coach_name ? `(مربی: ${c.coach_name})` : ""}
                      </option>
                    ))
                  ) : (
                    <option value="">در حال دریافت کلاس‌ها از سرور…</option>
                  )}
                </select>

                {selectedClass && (
                  <div className="mt-2 flex flex-wrap gap-2 text-[12px] text-ink-soft bg-bg p-2.5 rounded-[10px] border border-border/60">
                    <span>مربی: <b>{selectedClass.coach_name || "بدون مربی"}</b></span>
                    <span>•</span>
                    <span>روز: <b>{selectedClass.day_name || "شنبه"}</b></span>
                    <span>•</span>
                    <span>ساعت: <b>{selectedClass.start_time?.slice(0, 5)}</b></span>
                    <span>•</span>
                    <span>ظرفیت: <b>{toPersianDigits(selectedClass.capacity || 0)} نفر</b></span>
                  </div>
                )}
              </div>

              {/* Date and Initial Status */}
              <div className="grid grid-cols-2 gap-[12px]">
                <div>
                  <label className="mb-[6px] block text-[13px] font-bold text-ink">
                    تاریخ برگزاری <span className="text-[#F43F5E]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[10px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-[6px] block text-[13px] font-bold text-ink">
                    وضعیت اولیه رزرو
                  </label>
                  <select
                    value={bookingStatus}
                    onChange={(e) => setBookingStatus(e.target.value as "confirmed" | "pending")}
                    className="w-full rounded-[12px] border-[1.5px] border-border bg-surface px-[14px] py-[10px] text-[13.5px] text-ink outline-none transition-all duration-200 focus:border-primary"
                  >
                    <option value="confirmed">تأییدشده (CONFIRMED)</option>
                    <option value="pending">در انتظار تأیید (PENDING)</option>
                  </select>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="mt-[12px] flex justify-end gap-[10px] border-t border-border pt-4">
                <button
                  type="button"
                  onClick={onCloseAddModal}
                  className="rounded-[10px] border border-border px-[16px] py-[9px] text-[13.5px] font-semibold text-ink hover:bg-bg cursor-pointer transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-[10px] bg-primary px-[20px] py-[9px] text-[13.5px] font-bold text-ink transition-all hover:bg-primary-dark hover:text-white cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "در حال ثبت اطلاعات…" : "ثبت نهایی رزرو"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
