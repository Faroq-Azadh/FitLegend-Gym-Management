"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { CoachesKpi } from "@/components/admin/coaches/coaches-kpi";
import { CoachesTable } from "@/components/admin/coaches/coaches-table";
import { AddEmployeeModal } from "@/components/admin/coaches/add-employee-modal";
import { Briefcase } from "lucide-react";

export default function AdminCoachesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);

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
                مربیان و کارکنان
              </h1>
              <div className="mt-[5px] text-[14px] text-ink-faint">
                مدیریت تیم مربیان و دسترسی‌ها
              </div>
            </div>

            <div className="flex items-center gap-[10px]">
              {/* Add Employee Button */}
              <button
                type="button"
                onClick={() => setIsAddEmployeeModalOpen(true)}
                className="inline-flex cursor-pointer items-center justify-center gap-[8px] whitespace-nowrap rounded-[10px] border border-border bg-surface px-[14px] py-[8px] text-[13px] font-semibold text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-bg hover:text-primary-dark"
              >
                <Briefcase className="h-[16px] w-[16px] text-primary" />
                <span>افزودن کارمند</span>
              </button>

              {/* Add Coach Button */}
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex cursor-pointer items-center justify-center gap-[8px] whitespace-nowrap rounded-[10px] btn-ink-gradient px-[14px] py-[8px] text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-[1px] hover:shadow-emerald"
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
                <span>افزودن مربی</span>
              </button>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <CoachesKpi />

          {/* Team Table */}
          <CoachesTable
            isAddModalOpen={isAddModalOpen}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onCloseAddModal={() => setIsAddModalOpen(false)}
            onOpenAddEmployeeModal={() => setIsAddEmployeeModalOpen(true)}
          />

          {/* Add Employee Modal */}
          <AddEmployeeModal
            isOpen={isAddEmployeeModalOpen}
            onClose={() => setIsAddEmployeeModalOpen(false)}
          />
        </main>
      </div>
    </div>
  );
}
