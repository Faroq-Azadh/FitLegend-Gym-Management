"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { MembersKpi } from "@/components/admin/members/members-kpi";
import { MembersTable } from "@/components/admin/members/members-table";
import { useMembersData } from "@/lib/members-store";

export default function AdminMembersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { members } = useMembersData();

  const handleExportExcel = () => {
    if (!members || members.length === 0) {
      if (typeof window !== "undefined") {
        window.alert("عضوی در فهرست اعضا برای خروجی اکسل یافت نشد.");
      }
      return;
    }

    // Generate CSV content for Excel export with UTF-8 BOM
    const headers = [
      "شناسه",
      "نام و نام خانوادگی",
      "شماره تماس",
      "ایمیل",
      "پلن عضویت",
      "مربی اختصاصی",
      "وضعیت",
      "تاریخ عضویت",
      "تاریخ سررسید",
    ];

    const rows = members.map((m) => {
      const statusLabel =
        m.status === "active" ? "فعال" : m.status === "expiring" ? "رو به اتمام" : "منقضی";

      return [
        String(m.code),
        m.fullName || m.name,
        m.phone || "—",
        m.email && !m.email.includes("@gym.ir") ? m.email : "—",
        m.plan || "ماهانه",
        m.coach || "بدون مربی",
        statusLabel,
        m.joinDate || "—",
        m.dueDate || "—",
      ];
    });

    const csvContent =
      "\uFEFF" +
      [
        headers.map((h) => `"${h}"`).join(","),
        ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")),
      ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `fitlegend-members-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
          <div className="mb-[24px] flex flex-wrap items-end justify-between gap-[16px]">
            <div>
              <h1 className="text-[22px] font-extrabold tracking-[-0.01em] text-ink min-[640px]:text-[26px]">
                مدیریت اعضا
              </h1>
              <div className="mt-[5px] text-[14px] text-ink-faint">
                افزودن، ویرایش و پیگیری اعضای باشگاه
              </div>
            </div>

            <div className="flex items-center gap-[10px]">
              <button
                type="button"
                onClick={handleExportExcel}
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
                <span>خروجی اکسل</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex cursor-pointer items-center justify-center gap-[8px] whitespace-nowrap rounded-[10px] bg-ink px-[14px] py-[8px] text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary-dark hover:shadow-emerald"
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
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>افزودن عضو</span>
              </button>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <MembersKpi />

          {/* Members Table */}
          <MembersTable
            isAddModalOpen={isAddModalOpen}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onCloseAddModal={() => setIsAddModalOpen(false)}
          />
        </main>
      </div>
    </div>
  );
}
