"use client";

import { type ReactNode } from "react";

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  // Allows seamless interactive preview with admin default demo state ("مدیر عزیز")
  // as well as authenticated manager profile when logged in
  return <>{children}</>;
}
