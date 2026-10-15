/**
 * Centralized Query Keys factory for TanStack React Query.
 * Ensures predictable cache invalidation and strong typing across FitLegend Gym.
 */

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  profile: {
    all: ["profile"] as const,
    current: () => [...queryKeys.profile.all, "current"] as const,
    notifications: () => [...queryKeys.profile.all, "notifications"] as const,
  },
  members: {
    all: ["members"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.members.all, "list", filters ?? {}] as const,
    detail: (id: string | number) => [...queryKeys.members.all, "detail", id] as const,
    stats: () => [...queryKeys.members.all, "stats"] as const,
  },
  coaches: {
    all: ["coaches"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.coaches.all, "list", filters ?? {}] as const,
    detail: (id: string | number) => [...queryKeys.coaches.all, "detail", id] as const,
  },
  classes: {
    all: ["classes"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.classes.all, "list", filters ?? {}] as const,
    detail: (id: string | number) => [...queryKeys.classes.all, "detail", id] as const,
  },
  finance: {
    all: ["finance"] as const,
    payments: (filters?: Record<string, unknown>) =>
      [...queryKeys.finance.all, "payments", filters ?? {}] as const,
    summary: () => [...queryKeys.finance.all, "summary"] as const,
    plans: () => [...queryKeys.finance.all, "plans"] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    kpis: () => [...queryKeys.dashboard.all, "kpis"] as const,
    activity: () => [...queryKeys.dashboard.all, "activity"] as const,
    revenue: (range?: string) => [...queryKeys.dashboard.all, "revenue", range ?? "month"] as const,
  },
} as const;
