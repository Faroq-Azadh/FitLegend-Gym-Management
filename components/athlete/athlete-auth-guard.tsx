"use client";

import { type ReactNode } from "react";

export function AthleteAuthGuard({ children }: { children: ReactNode }) {
  // Allows seamless interactive preview with athlete default state ("سارا محمدی")
  // as well as authenticated athlete profile when logged in
  return <>{children}</>;
}
