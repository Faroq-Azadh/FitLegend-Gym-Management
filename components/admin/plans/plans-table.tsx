"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/persian-digits";
import { PlanItem } from "./types";
import { Trash2, Plus, Sparkles, Check } from "lucide-react";
import { SystemPlan } from "@/lib/api/services/plans.service";

interface PlansTableProps {
  plans: PlanItem[];
  systemPlans?: SystemPlan[];
  currentPlanCode?: string;
  activeTab?: "member_plans" | "system_plans";
  onTabChange?: (tab: "member_plans" | "system_plans") => void;
  onEditPlan: (plan: PlanItem) => void;
  onDeletePlan: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onOpenCreateModal?: () => void;
  onUpgradeSystemPlan?: (plan: SystemPlan) => void;
}

export function PlansTable({
  plans,
  systemPlans = [],
  currentPlanCode = "FREE",
  activeTab: externalActiveTab,
  onTabChange,
  onEditPlan,
  onDeletePlan,
  onToggleStatus,
  onOpenCreateModal,
  onUpgradeSystemPlan,
}: PlansTableProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<"member_plans" | "system_plans">("member_plans");
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;

  const handleTabChange = (tab: "member_plans" | "system_plans") => {
    if (onTabChange) onTabChange(tab);
    setInternalActiveTab(tab);
  };

  const defaultSystemPlans: SystemPlan[] = [
    { code: "FREE", name: "رایگان / دمو", price: "0", trial_days: 14, member_limit: 50, coach_limit: 2 },
    { code: "BASIC", name: "پایه", price: "1200000", trial_days: 0, member_limit: 200, coach_limit: 5 },
    { code: "PRO", name: "حرفه‌ای", price: "2900000", trial_days: 0, member_limit: 1000, coach_limit: 20 },
    { code: "ENTERPRISE", name: "سازمانی", price: null, trial_days: 0, member_limit: null, coach_limit: null },
  ];

  const displayedSystemPlans = systemPlans.length > 0 ? systemPlans : defaultSystemPlans;

  return (
    <div id="all-plans-table" className="rounded-[16px] border border-border bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      {/* Table Head & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-[18px_22px]">
        <div>
          <h3 className="text-[16px] font-extrabold text-ink">همه‌ی پلن‌ها و تعرفه‌ها</h3>
          <div className="mt-[2px] text-[12.5px] text-ink-faint">
            {activeTab === "member_plans"
              ? "لیست تعرفه‌های عضویت تعریف شده برای ورزشکاران باشگاه"
              : "لیست پلن‌های اشتراک نرم‌افزار و پلتفرم فیتلجند جیم"}
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center rounded-[12px] border border-border bg-bg p-1 shadow-xs">
          <button
            type="button"
            onClick={() => handleTabChange("member_plans")}
            className={cn(
              "flex items-center gap-1.5 rounded-[9px] px-3.5 py-1.5 text-[12.5px] font-bold transition-all duration-200",
              activeTab === "member_plans"
                ? "bg-surface text-ink shadow-xs"
                : "text-ink-soft hover:text-ink"
            )}
          >
            <span>پلن‌های عضویت اعضا</span>
            <span className="rounded-full bg-bg px-2 py-0.2 text-[11px] font-black text-ink-faint border border-border">
              {toPersianDigits(plans.length)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("system_plans")}
            className={cn(
              "flex items-center gap-1.5 rounded-[9px] px-3.5 py-1.5 text-[12.5px] font-bold transition-all duration-200",
              activeTab === "system_plans"
                ? "bg-surface text-ink shadow-xs"
                : "text-ink-soft hover:text-ink"
            )}
          >
            <Sparkles className="h-3.5 w-3.5 text-primary-dark" />
            <span>تعرفه‌های فیتلجند جیم</span>
            <span className="rounded-full bg-bg px-2 py-0.2 text-[11px] font-black text-ink-faint border border-border">
              {toPersianDigits(displayedSystemPlans.length)}
            </span>
          </button>
        </div>
      </div>

      {/* Tab 1: Member Plans Table */}
      {activeTab === "member_plans" && (
        <div className="overflow-x-auto">
          <table className="w-full text-right text-[13px]">
            <thead className="font-bold">
              <tr className="border-b border-border bg-bg/50 text-[13.5px] font-bold text-ink-faint">
                <th className="p-[14px_20px] font-bold">پلن</th>
                <th className="p-[14px_20px] font-bold">قیمت</th>
                <th className="p-[14px_20px] font-bold">مدت</th>
                <th className="p-[14px_20px] font-bold">اعضای فعال</th>
                <th className="p-[14px_20px] font-bold">وضعیت</th>
                <th className="p-[14px_20px] font-bold text-left">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-[48px] text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="text-[14px] font-bold text-ink">هنوز هیچ پلن عضویتی تعریف نشده است</div>
                      <p className="text-[12.5px] text-ink-faint max-w-[360px]">
                        برای ثبت نام ورزشکاران، اولین پلن عضویت باشگاه (مانند ماهانه، ۳ ماهه یا VIP) را اضافه کنید.
                      </p>
                      {onOpenCreateModal && (
                        <button
                          type="button"
                          onClick={onOpenCreateModal}
                          className="mt-2 inline-flex items-center gap-2 rounded-[10px] btn-ink-gradient px-4 py-2 text-[12.5px] font-bold text-white transition-all"
                        >
                          <Plus className="h-4 w-4" />
                          <span>تعریف اولین پلن عضویت</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                plans.map((plan) => {
                  const isActive = plan.status === "active";

                  return (
                    <tr
                      key={plan.id}
                      className="border-b border-border/70 transition-colors hover:bg-bg/50"
                    >
                      {/* Plan Name */}
                      <td className="p-[16px_20px]">
                        <div className="flex items-center gap-[8px]">
                          <span className="font-semibold text-ink text-[13.5px]">{plan.name}</span>
                          {plan.featured && (
                            <span className="rounded-full bg-tint px-[6px] py-[1px] text-[10px] font-bold text-primary-dark">
                              ویژه
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="p-[16px_20px] text-[14px] font-bold text-ink">
                        {toPersianDigits(plan.price)} {plan.priceUnit || "تومان"}
                      </td>

                      {/* Duration */}
                      <td className="p-[16px_20px] text-[13.5px] text-ink">
                        {toPersianDigits(plan.duration)}
                      </td>

                      {/* Active Members */}
                      <td className="p-[16px_20px] text-[13.5px] text-ink">
                        {toPersianDigits(plan.activeMembers)} نفر
                      </td>

                      {/* Status badge */}
                      <td className="p-[16px_20px]">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(plan.id)}
                          className={cn(
                            "inline-flex items-center gap-[6px] rounded-full px-[10px] py-[4px] text-[12px] font-bold transition-all",
                            isActive
                              ? "bg-[#E0F2FE] text-[#0284C7] hover:opacity-80"
                              : "bg-[#FEF2F2] text-[#DC2626] hover:opacity-80",
                          )}
                          title="برای تغییر وضعیت کلیک کنید"
                        >
                          <span
                            className={cn(
                              "h-[6px] w-[6px] rounded-full",
                              isActive ? "bg-[#0EA5E9]" : "bg-[#DC2626]",
                            )}
                          />
                          <span>{isActive ? "فعال" : "غیرفعال"}</span>
                        </button>
                      </td>

                      {/* Row actions */}
                      <td className="p-[16px_20px] text-left">
                        <div className="flex items-center justify-end gap-[6px]">
                          <button
                            type="button"
                            onClick={() => onEditPlan(plan)}
                            className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] text-ink-soft transition-colors hover:bg-bg hover:text-ink"
                            aria-label="ویرایش پلن"
                            title="ویرایش"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-[16px] w-[16px]"
                            >
                              <path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`آیا از غیرفعال‌سازی پلن «${plan.name}» اطمینان دارید؟`)) {
                                onDeletePlan(plan.id);
                              }
                            }}
                            className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] text-ink-faint transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                            aria-label="حذف یا غیرفعال‌سازی پلن"
                            title="حذف / غیرفعال‌سازی"
                          >
                            <Trash2 className="h-[15px] w-[15px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: System Tariffs Table (FitLegend Gym SaaS) */}
      {activeTab === "system_plans" && (
        <div className="overflow-x-auto">
          <table className="w-full text-right text-[13px]">
            <thead className="font-bold">
              <tr className="border-b border-border bg-bg/50 text-[13.5px] font-bold text-ink-faint">
                <th className="p-[14px_20px] font-bold">تعرفه</th>
                <th className="p-[14px_20px] font-bold">کد پلتفرم</th>
                <th className="p-[14px_20px] font-bold">هزینه اشتراک</th>
                <th className="p-[14px_20px] font-bold">سقف اعضا</th>
                <th className="p-[14px_20px] font-bold">سقف مربیان</th>
                <th className="p-[14px_20px] font-bold">تست رایگان</th>
                <th className="p-[14px_20px] font-bold text-center">وضعیت شما</th>
                <th className="p-[14px_20px] font-bold text-left">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {displayedSystemPlans.map((sp) => {
                const isCurrent = sp.code?.toUpperCase() === currentPlanCode.toUpperCase();
                const priceNum = sp.price ? parseFloat(sp.price) : 0;
                const priceFormatted =
                  sp.code === "FREE"
                    ? "رایگان"
                    : sp.price === null
                      ? "سفارشی"
                      : priceNum >= 1_000_000
                        ? `${(priceNum / 1_000_000).toLocaleString("fa-IR")} میلیون تومان`
                        : `${priceNum.toLocaleString("fa-IR")} تومان`;

                return (
                  <tr
                    key={sp.code}
                    className={cn(
                      "border-b border-border/70 transition-colors",
                      isCurrent ? "bg-tint/30 font-medium" : "hover:bg-bg/50"
                    )}
                  >
                    <td className="p-[16px_20px]">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-ink text-[13.5px]">{sp.name}</span>
                        {isCurrent && (
                          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10.5px] font-black text-primary-dark border border-primary/30">
                            پلن کنونی
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-[16px_20px] font-mono text-[12px] text-ink-faint">
                      {sp.code}
                    </td>
                    <td className="p-[16px_20px] font-bold text-ink">
                      {priceFormatted} {sp.price ? "/ ماه" : ""}
                    </td>
                    <td className="p-[16px_20px] text-ink">
                      {sp.member_limit ? `${toPersianDigits(sp.member_limit)} نفر` : "نامحدود"}
                    </td>
                    <td className="p-[16px_20px] text-ink">
                      {sp.coach_limit ? `${toPersianDigits(sp.coach_limit)} نفر` : "نامحدود"}
                    </td>
                    <td className="p-[16px_20px] text-ink">
                      {sp.code === "FREE" ? `${toPersianDigits(sp.trial_days || 14)} روز` : "امکان تست"}
                    </td>
                    <td className="p-[16px_20px] text-center">
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#E0F2FE] px-2.5 py-1 text-[11px] font-black text-[#0284C7]">
                          <Check className="h-3 w-3 stroke-[3]" />
                          <span>فعال</span>
                        </span>
                      ) : (
                        <span className="text-[11.5px] text-ink-faint">-</span>
                      )}
                    </td>
                    <td className="p-[16px_20px] text-left">
                      <button
                        type="button"
                        disabled={isCurrent}
                        onClick={() => {
                          if (onUpgradeSystemPlan) {
                            onUpgradeSystemPlan(sp);
                          } else {
                            alert(`درخواست ارتقا به تعرفه «${sp.name}» ثبت شد.`);
                          }
                        }}
                        className={cn(
                          "rounded-[8px] px-3.5 py-1.5 text-[12px] font-bold transition-all",
                          isCurrent
                            ? "bg-bg text-ink-faint cursor-default"
                            : "btn-ink-gradient text-white cursor-pointer"
                        )}
                      >
                        {isCurrent ? "پلن فعلی" : "ارتقا"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
