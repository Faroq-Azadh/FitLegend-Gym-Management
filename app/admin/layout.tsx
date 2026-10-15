import type { Metadata } from "next";
import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";

export const metadata: Metadata = {
  title: "پنل مدیر باشگاه — فیتلجند",
  description: "داشبورد مدیریت و نظارت بر آمار، کلاس‌ها، اعضا و درآمد باشگاه ورزشی فیتلجند",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-bg text-ink">{children}</div>
    </AdminAuthGuard>
  );
}
