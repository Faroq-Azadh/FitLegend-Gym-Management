import type { Metadata } from "next";
import { CoachAuthGuard } from "@/components/coach/coach-auth-guard";

export const metadata: Metadata = {
  title: "داشبورد مربی — فیتلجند",
  description: "پنل مربیگری، مدیریت شاگردان و برنامه‌های تمرینی باشگاه فیتلجند",
};

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CoachAuthGuard>
      <div className="min-h-screen bg-bg text-ink font-sans antialiased">{children}</div>
    </CoachAuthGuard>
  );
}
