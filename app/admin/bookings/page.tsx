"use client";

import { useState, useMemo } from "react";
import {
  useBookings,
  useApproveBooking,
  useRejectBooking,
  useCreateBooking,
  useDeleteBooking,
} from "@/lib/hooks/queries/use-classes";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { BookingsKpi } from "@/components/admin/bookings/bookings-kpi";
import {
  BookingsTable,
  BookingItem,
  AddBookingFormValues,
} from "@/components/admin/bookings/bookings-table";
import { toPersianDigits } from "@/lib/persian-digits";

export default function AdminBookingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: bookingsData } = useBookings();
  const approveBookingMutation = useApproveBooking();
  const rejectBookingMutation = useRejectBooking();
  const createBookingMutation = useCreateBooking();
  const deleteBookingMutation = useDeleteBooking();

  const bookings: BookingItem[] = useMemo(() => {
    const list: any[] = Array.isArray(bookingsData?.bookings)
      ? bookingsData.bookings
      : Array.isArray((bookingsData as any)?.results)
        ? (bookingsData as any).results
        : Array.isArray(bookingsData)
          ? (bookingsData as any)
          : [];

    return list.map((b) => {
      const statusMap: BookingItem["status"] =
        b.status === "CONFIRMED"
          ? "confirmed"
          : b.status === "CANCELLED" || b.status === "REJECTED"
            ? "cancelled"
            : "pending";

      const timeDay = [b.day_name, b.start_time ? b.start_time.slice(0, 5) : ""].filter(Boolean).join(" ");
      const datePart = b.date ? ` (${b.date})` : "";

      return {
        id: String(b.id),
        name: b.member_name || "ورزشکار",
        className: b.class_title || "کلاس ورزشی",
        coach: b.coach_name || "-",
        time: `${timeDay}${datePart}`.trim() || "-",
        status: statusMap,
        member_id: b.member_id,
        class_id: b.class_id,
        date: b.date,
      };
    });
  }, [bookingsData]);

  const summary = bookingsData?.summary;
  const confirmedCount = summary?.confirmed_count ?? bookings.filter((b) => b.status === "confirmed").length;
  const pendingCount = summary?.pending_count ?? bookings.filter((b) => b.status === "pending").length;
  const cancelledCount = summary?.canceled_count ?? bookings.filter((b) => b.status === "cancelled").length;

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCountVal = summary?.today_count !== undefined
    ? summary.today_count
    : bookings.filter((b) => b.date === todayStr).length;

  const handleUpdateStatus = async (id: string, newStatus: BookingItem["status"]) => {
    try {
      if (newStatus === "confirmed") {
        await approveBookingMutation.mutateAsync(id);
      } else if (newStatus === "cancelled") {
        await rejectBookingMutation.mutateAsync(id);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleAddBooking = async (newBookingData: AddBookingFormValues) => {
    await createBookingMutation.mutateAsync({
      class_id: newBookingData.class_id,
      date: newBookingData.date,
      member_id: newBookingData.member_id,
      member_name: newBookingData.member_name,
      class_title: newBookingData.class_title,
      coach_name: newBookingData.coach_name,
      day_name: newBookingData.day_name,
      start_time: newBookingData.start_time,
      status: newBookingData.status === "confirmed" ? "CONFIRMED" : "PENDING",
    });
    setIsAddModalOpen(false);
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      await deleteBookingMutation.mutateAsync(id);
    } catch (err) {
      console.error("Error deleting booking:", err);
    }
  };

  const handleExport = () => {
    const headers = ["نام عضو", "کلاس", "مربی", "زمان و تاریخ", "وضعیت"];
    const statusLabels: Record<BookingItem["status"], string> = {
      confirmed: "تأییدشده",
      pending: "در انتظار تأیید",
      cancelled: "لغوشده",
    };
    const rows = bookings.map((b) => [
      b.name,
      b.className,
      b.coach,
      b.time,
      statusLabels[b.status],
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `fitlegend-bookings-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar Header */}
        <AdminTopbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          searchPlaceholder="جستجو…"
        />

        {/* Page Content */}
        <main className="flex-1 p-[18px] min-[640px]:p-[28px]">
          {/* Page Head */}
          <div className="mb-[20px] flex flex-wrap items-end justify-between gap-[16px]">
            <div>
              <div className="flex items-center gap-[10px]">
                <h1 className="text-[22px] font-extrabold tracking-[-0.01em] text-ink min-[640px]:text-[26px]">
                  رزروها
                </h1>
                <span className="rounded-[6px] border border-border bg-bg px-[8px] py-[2px] text-[11px] font-bold text-ink-faint">
                  غیرفعال در پنل
                </span>
              </div>
              <div className="mt-[5px] text-[14px] text-ink-faint">
                مدیریت و تأیید درخواست‌های رزرو کلاس (آماده‌سازی شده)
              </div>
            </div>

            <div className="flex items-center gap-[10px]">
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex cursor-pointer items-center justify-center gap-[8px] whitespace-nowrap rounded-[10px] border-[1.5px] border-border bg-surface px-[14px] py-[8px] text-[13px] font-semibold text-ink transition-all duration-200 hover:border-primary hover:bg-tint"
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
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="M7 10l5 5 5-5M12 15V3" />
                </svg>
                <span>خروجی</span>
              </button>
            </div>
          </div>

          {/* Inactive Feature Notice Banner */}
          <div className="mb-[20px] flex items-start gap-[12px] rounded-[14px] border border-amber-500/25 bg-amber-500/10 p-[16px]">
            <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[8px] bg-amber-500/20 text-amber-700 dark:text-amber-300">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[18px] w-[18px]"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-[8px]">
                <h3 className="text-[14px] font-extrabold text-amber-900 dark:text-amber-200">
                  این بخش موقتاً به عنوان قابلیت غیرفعال (Pending Feature) در پنل قرار دارد
                </h3>
                <span className="rounded-full bg-amber-500/20 px-[8px] py-[2px] text-[11px] font-bold text-amber-700 dark:text-amber-300">
                  در انتظار مجوز بک‌اند
                </span>
              </div>
              <p className="mt-[4px] text-[12.5px] leading-[20px] text-ink-soft">
                تمامی ساختارهای پیاده‌سازی‌شده (سرویس‌های API، اتصال به فهرست رزروها، فرم ثبت با انتخاب کلاس و عضو، تأیید/رد رزروها و خروجی اکسل) در پروژه به صورت کامل و آماده نگه‌داری شده است.
              </p>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <BookingsKpi
            todayCount={toPersianDigits(todayCountVal)}
            confirmedCount={confirmedCount}
            pendingCount={pendingCount}
            cancelledCount={cancelledCount}
          />

          {/* Bookings Table */}
          <BookingsTable
            bookings={bookings}
            onUpdateStatus={handleUpdateStatus}
            onAddBooking={handleAddBooking}
            onDeleteBooking={handleDeleteBooking}
            isAddModalOpen={isAddModalOpen}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onCloseAddModal={() => setIsAddModalOpen(false)}
          />
        </main>
      </div>
    </div>
  );
}
