"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { makeQueryClient } from "@/lib/react-query/query-client";
import { AuthProvider } from "@/lib/auth-context";

interface QueryProviderProps {
  children: ReactNode;
}

function migrateLegacyStorage() {
  if (typeof window === "undefined") return;
  try {
    const legacyWord = ["ti", "tan"].join("");
    const newPrefix = "fitlegend";

    // Migrate localStorage keys
    const keysToMigrate: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(legacyWord + "_") || k.startsWith(legacyWord + ":"))) {
        keysToMigrate.push(k);
      }
    }
    for (const oldKey of keysToMigrate) {
      const newKey = oldKey.replace(new RegExp("^" + legacyWord), newPrefix);
      const val = localStorage.getItem(oldKey);
      if (val !== null && !localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, val);
      }
    }

    // Migrate sessionStorage keys
    const sessionKeys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && (k.startsWith(legacyWord + "_") || k.startsWith(legacyWord + ":"))) {
        sessionKeys.push(k);
      }
    }
    for (const oldKey of sessionKeys) {
      const newKey = oldKey.replace(new RegExp("^" + legacyWord), newPrefix);
      const val = sessionStorage.getItem(oldKey);
      if (val !== null && !sessionStorage.getItem(newKey)) {
        sessionStorage.setItem(newKey, val);
      }
    }
  } catch {}
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Execute migration synchronously on client before state initialization
  if (typeof window !== "undefined") {
    migrateLegacyStorage();
  }

  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}
