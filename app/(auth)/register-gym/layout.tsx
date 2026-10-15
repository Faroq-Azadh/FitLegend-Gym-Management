import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "درخواست ثبت باشگاه — فیتلجند",
  description: "ثبت درخواست باشگاه جدید در پلتفرم فیتلجند",
};

export default function RegisterGymLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
