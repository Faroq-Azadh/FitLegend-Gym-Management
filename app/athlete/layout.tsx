import type { Metadata } from "next";
import { AthleteAuthGuard } from "@/components/athlete/athlete-auth-guard";
import "@/styles/athlete.css";

export const metadata: Metadata = {
  title: "داشبورد ورزشکار — فیتلجند",
  description: "پنل اختصاصی ورزشکار، برنامه تمرین، پیشرفت و رزرو کلاس‌های باشگاه فیتلجند",
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
