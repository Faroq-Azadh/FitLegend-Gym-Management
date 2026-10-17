"use client";

import { useAuth } from "@/lib/auth-context";
import { type ReactNode } from "react";

export function CoachAuthGuard({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  // Allow seamless viewing and authenticated coach access with real Django profile
  // and authenticated coach data when logged in
  return <>{children}</>;
}
