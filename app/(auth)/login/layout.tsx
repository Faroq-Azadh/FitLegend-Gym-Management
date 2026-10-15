import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ورود — فیتلجند",
  description: "ورود به پنل مدیریت باشگاه فیتلجند",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
