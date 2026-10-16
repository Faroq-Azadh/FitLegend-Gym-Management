"use client";

import { useOwnerDashboard } from "@/lib/hooks/queries/use-owner-dashboard";
import { useMembersData } from "@/lib/members-store";
import { usePaymentsData, formatFullToman } from "@/lib/payments-store";
import { useTodayAttendance } from "@/lib/attendance-store";
import type { OwnerDashboard } from "@/lib/api/services/gyms.service";
import { cn } from "@/lib/utils";

interface KpiSectionProps {
  dashboard?: OwnerDashboard | null;
  isLoading?: boolean;
}

export function KpiSection({ dashboard: propDashboard, isLoading: propIsLoading }: KpiSectionProps) {
  const { data: queryDashboard, isLoading: queryLoading } = useOwnerDashboard();
  const { counts: membersCounts } = useMembersData();
  const { totalRevenue } = usePaymentsData();
  const dashboard = propDashboard !== undefined ? propDashboard : queryDashboard;
  const isLoading = propIsLoading !== undefined ? propIsLoading : queryLoading;
  const { todayCheckins } = useTodayAttendance(dashboard?.today_checkins);

  const formatNumber = (val: number | null | undefined, fallback = "۰"): string => {
    if (val === null || val === undefined) return fallback;
    return val.toLocaleString("fa-IR");
  };

  const activeMembers =
    membersCounts.total > 0 ? membersCounts.active : (dashboard?.active_members ?? 0);
  const activeMembersTrend = dashboard?.active_members_trend_percent ?? 0;

  const monthlyRevenue = formatFullToman(totalRevenue);
  const revenueTrend = dashboard?.revenue_trend_percent ?? 0;

  const todayBookings = dashboard?.bookings_today ?? 0;
  const todayEntries = todayCheckins + todayBookings;
  const bookingsTrend = dashboard?.bookings_trend_percent ?? 0;

  const renewalRate = dashboard?.renewal_rate_percent ?? 0;
  const renewalTrend = dashboard?.renewal_trend_percent ?? 0;

  const kpis = [
    {
      id: "active-members",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[22px] w-[22px]"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        </svg>
      ),
      trend: {
        value: `${Math.abs(activeMembersTrend).toLocaleString("fa-IR")}٪`,
        isUp: activeMembersTrend >= 0,
      },
      value: formatNumber(activeMembers),
      label: "اعضای فعال",
    },
    {
      id: "monthly-revenue",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[22px] w-[22px]"
        >
          <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      trend: {
        value: `${Math.abs(revenueTrend).toLocaleString("fa-IR")}٪`,
        isUp: revenueTrend >= 0,
      },
      value: monthlyRevenue,
      label: "درآمد این ماه",
    },
    {
      id: "today-bookings",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[22px] w-[22px]"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" />
        </svg>
      ),
      trend: {
        value: `${Math.abs(bookingsTrend).toLocaleString("fa-IR")}٪`,
        isUp: bookingsTrend >= 0,
      },
      value: formatNumber(todayEntries),
      label: "رزرو و ورود امروز",
    },
    {
      id: "retention-rate",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[22px] w-[22px]"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      ),
      trend: {
        value: `${Math.abs(renewalTrend).toLocaleString("fa-IR")}٪`,
        isUp: renewalTrend >= 0,
      },
      value: `${formatNumber(renewalRate)}٪`,
      label: "نرخ تمدید عضویت",
    },
  ];

  if (isLoading && !dashboard) {
    return (
      <section className="mb-[18px] grid grid-cols-1 gap-[18px] min-[640px]:grid-cols-2 min-[1101px]:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex h-[130px] animate-pulse flex-col justify-between rounded-[16px] border border-border bg-surface p-[20px]"
          >
            <div className="flex items-center justify-between">
              <span className="h-[40px] w-[40px] rounded-[12px] bg-bg" />
              <span className="h-[20px] w-[45px] rounded-full bg-bg" />
            </div>
            <div className="h-[28px] w-[90px] rounded-[8px] bg-bg" />
            <div className="h-[14px] w-[120px] rounded-[6px] bg-bg" />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="mb-[18px] grid grid-cols-1 gap-[18px] min-[640px]:grid-cols-2 min-[1101px]:grid-cols-4">
      {kpis.map((kpi, kpiIdx) => (
        <div
          key={kpi.id}
          className="flex flex-col gap-[14px] rounded-[16px] border border-border bg-surface p-[20px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
        >
          <div className="flex items-center justify-between">
            <span className={`flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-tint text-primary-dark kpi-c-${["orange","sky","violet","emerald"][kpiIdx % 4]}`}>
              {kpi.icon}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-[4px] rounded-full px-[9px] py-[4px] text-[12.5px] font-bold",
                kpi.trend.isUp
                  ? "bg-tint text-primary-dark"
                  : "bg-[#FFF1F2] text-[#E11D48]",
              )}
            >
              {kpi.trend.isUp ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="h-[13px] w-[13px]"
                >
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="h-[13px] w-[13px]"
                >
                  <path d="M17 7 7 17M15 17H7V9" />
                </svg>
              )}
              <span>{kpi.trend.value}</span>
            </span>
          </div>
          <div className="text-[26px] font-extrabold leading-none text-ink truncate">
            {kpi.value}
          </div>
          <div className="text-[13.5px] font-medium text-ink-soft">
            {kpi.label}
          </div>
        </div>
      ))}
    </section>
  );
}

