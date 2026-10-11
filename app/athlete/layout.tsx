import type { Metadata } from "next";
import { AthleteAuthGuard } from "@/components/athlete/athlete-auth-guard";
import "@/styles/athlete.css";

export const metadata: Metadata = {
  title: "داشبورد ورزشکار — تیتان",
  description: "پنل اختصاصی ورزشکار، برنامه تمرین، پیشرفت و رزرو کلاس‌های باشگاه تیتان",
};

export default function AthleteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AthleteAuthGuard>
      {children}
    </AthleteAuthGuard>
  );
}
