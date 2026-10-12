"use client";

import { useMemo } from "react";
import Link from "next/link";
import { MoreVertical } from "lucide-react";
import { useOwnerDashboard } from "@/lib/hooks/queries/use-owner-dashboard";
import { useMembersData } from "@/lib/members-store";
import type { RecentMemberRow } from "@/lib/api/services/gyms.service";
import { cn } from "@/lib/utils";

interface RecentMembersTableProps {
  members?: RecentMemberRow[];
  isLoading?: boolean;
}

const GRADIENTS = [
  "linear-gradient(135deg, #16E0A0, #22D3EE)",
  "linear-gradient(135deg, #6366F1, #22D3EE)",
  "linear-gradient(135deg, #F59E0B, #EF4444)",
  "linear-gradient(135deg, #0EA5E9, #16E0A0)",
  "linear-gradient(135deg, #8B5CF6, #EC4899)",
];

function getInitials(name?: string): string {
  if (!name) return "ع";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] || "") + (parts[1][0] || "");
  }
  return name.slice(0, 2);
}

function formatPersianDate(dateStr?: string | null): string {
  if (!dateStr || dateStr === "—") return "—";
  try {
    const parts = dateStr.split("-").map(Number);
    let d: Date;
    if (parts.length === 3) {
      d = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      d = new Date(dateStr);
    }
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("fa-IR", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getStatusDetails(status?: string) {
  const s = (status || "").toLowerCase();
  if (s === "expiring" || s === "رو به اتمام") {
    return { status: "expiring", label: "رو به اتمام" };
  }
  if (s === "expired" || s === "منقضی") {
    return { status: "expired", label: "منقضی" };
  }
  return { status: "active", label: "فعال" };
}

export function RecentMembersTable({ members: propMembers, isLoading: propLoading }: RecentMembersTableProps) {
  const { data: dashboard, isLoading: queryLoading } = useOwnerDashboard();
  const { members: liveMembers, isLoading: membersLoading } = useMembersData();

  const members = useMemo(() => {
    if (propMembers) return propMembers;
    if (liveMembers && liveMembers.length > 0) {
      return liveMembers.slice(0, 5).map((m) => ({
        id: m.id,
        full_name: m.fullName,
        email: m.email,
        phone: m.phone,
        plan_name: m.plan,
        expiry_date: m.dueDate,
        status: m.status,
      }));
    }
    return dashboard?.recent_members ?? [];
  }, [propMembers, liveMembers, dashboard?.recent_members]);

  const isLoading = propLoading ?? (queryLoading && membersLoading);
  const items = members && members.length > 0 ? members : [];

  if (isLoading && !members) {
    return (
      <div className="rounded-[16px] border border-border bg-surface p-[22px] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between border-b border-border pb-[16px]">
          <div className="h-[20px] w-[120px] animate-pulse rounded bg-bg" />
          <div className="h-[32px] w-[80px] animate-pulse rounded-[10px] bg-bg" />
        </div>
        <div className="flex flex-col gap-[12px] pt-[16px]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex h-[45px] animate-pulse items-center rounded bg-bg/40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[16px] border border-border bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between border-b border-border px-[22px] py-[20px]">
        <div>
          <h3 className="text-[16px] font-extrabold text-ink">اعضای اخیر</h3>
          <div className="mt-[3px] text-[12.5px] text-ink-faint">
            آخرین عضویت‌ها و وضعیت اعضا
          </div>
        </div>
        <Link
          href="/admin/members"
          className="inline-flex items-center justify-center gap-[8px] whitespace-nowrap rounded-[10px] border-[1.5px] border-border bg-surface px-[14px] py-[8px] text-[13px] font-semibold text-ink transition-all duration-200 hover:border-primary hover:bg-tint"
        >
          مشاهده همه
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="font-bold">
            <tr>
              <th className="border-b border-border px-[22px] pt-[14px] pb-[14px] text-right text-[13.5px] font-bold whitespace-nowrap text-ink-faint">
                عضو
              </th>
              <th className="border-b border-border px-[22px] pt-[14px] pb-[14px] text-right text-[13.5px] font-bold whitespace-nowrap text-ink-faint">
                پلن
              </th>
              <th className="border-b border-border px-[22px] pt-[14px] pb-[14px] text-right text-[13.5px] font-bold whitespace-nowrap text-ink-faint">
                تاریخ انقضا
              </th>
              <th className="border-b border-border px-[22px] pt-[14px] pb-[14px] text-right text-[13.5px] font-bold whitespace-nowrap text-ink-faint">
                وضعیت
              </th>
              <th className="border-b border-border px-[22px] pt-[14px] pb-[14px] text-right text-[13.5px] font-bold whitespace-nowrap text-ink-faint" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[13.5px] text-ink-faint">
                  عضوی یافت نشد.
                </td>
              </tr>
            ) : (
              items.map((member, index) => {
                const initials = getInitials(member.full_name);
                const gradient = GRADIENTS[index % GRADIENTS.length];
                const statusInfo = getStatusDetails(member.status);
                const expiryFormatted = formatPersianDate(member.expiry_date);

                return (
                  <tr
                    key={member.id || index}
                    className={cn(
                      "transition-colors duration-150 hover:bg-bg",
                      index < items.length - 1 && "border-b border-border",
                    )}
                  >
                    <td className="px-[22px] py-[15px] text-[13.5px] whitespace-nowrap text-ink-soft">
                      <div className="flex items-center gap-[11px]">
                        {(member as any).avatar ? (
                          <img
                            src={(member as any).avatar}
                            alt={member.full_name}
                            className="h-[36px] w-[36px] shrink-0 rounded-[10px] object-cover shadow-xs border border-border"
                          />
                        ) : (
                          <span
                            className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[10px] text-[13px] font-bold text-white"
                            style={{ background: gradient }}
                          >
                            {initials}
                          </span>
                        )}
                        <div>
                          <div className="text-[13.5px] font-bold text-ink">
                            {member.full_name}
                          </div>
                          <div className="text-[12px] text-ink-faint" dir="ltr">
                            {member.email && member.email.trim() && !member.email.includes("@gym.ir")
                              ? member.email
                              : (member as any).phone || "—"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-[22px] py-[15px] text-[13.5px] whitespace-nowrap text-ink-soft">
                      {member.plan_name || "—"}
                    </td>

                    <td className="px-[22px] py-[15px] text-[13.5px] whitespace-nowrap text-ink-soft">
                      {expiryFormatted}
                    </td>

                    <td className="px-[22px] py-[15px] text-[13.5px] whitespace-nowrap text-ink-soft">
                      <span
                        className={cn(
                          "inline-flex items-center gap-[6px] rounded-full px-[11px] py-[5px] text-[12px] font-bold",
                          statusInfo.status === "active" && "bg-tint text-primary-dark",
                          statusInfo.status === "expiring" && "bg-[#FFFBEB] text-[#B45309]",
                          statusInfo.status === "expired" && "bg-[#FFF1F2] text-[#9F1239]",
                        )}
                      >
                        <span
                          className={cn(
                            "h-[6px] w-[6px] rounded-full",
                            statusInfo.status === "active" && "bg-primary",
                            statusInfo.status === "expiring" && "bg-[#F59E0B]",
                            statusInfo.status === "expired" && "bg-[#F43F5E]",
                          )}
                        />
                        {statusInfo.label}
                      </span>
                    </td>

                    <td className="px-[22px] py-[15px] text-[13.5px] whitespace-nowrap text-ink-soft">
                      <button
                        type="button"
                        className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-[8px] text-ink-faint transition-colors duration-150 hover:bg-tint hover:text-primary-dark"
                        aria-label="عملیات بیشتر"
                      >
                        <MoreVertical className="h-[18px] w-[18px] stroke-[2]" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

