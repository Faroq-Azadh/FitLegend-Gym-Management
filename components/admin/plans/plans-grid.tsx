"use client";

import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/persian-digits";
import { PlanItem } from "./types";

interface PlansGridProps {
  plans: PlanItem[];
  onEditPlan: (plan: PlanItem) => void;
}

export function PlansGrid({ plans, onEditPlan }: PlansGridProps) {
  // We showcase the top featured / primary cards (e.g. Monthly, 3-Months, VIP)
  const displayPlans = plans.filter((p) => p.status === "active").slice(0, 3);

  return (
    <div className="mb-[24px] grid grid-cols-1 gap-[18px] min-[768px]:grid-cols-2 min-[1080px]:grid-cols-3">
      {displayPlans.map((plan) => {
        const isFeatured = plan.featured;

        return (
          <div
            key={plan.id}
            className={cn(
              "relative flex flex-col gap-[16px] rounded-[16px] border bg-surface p-[24px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-[2px]",
              isFeatured
                ? "border-primary shadow-[0_20px_50px_rgba(242,92,31,0.25)]"
                : "border-border hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]",
            )}
          >
            {/* Ribbon if featured */}
            {isFeatured && (
              <span className="absolute left-[16px] top-[16px] rounded-full bg-primary px-[10px] py-[4px] text-[11px] font-extrabold text-white">
                {plan.ribbonText || "محبوب"}
              </span>
            )}

            {/* Plan Head */}
            <div>
              <div className="text-[16px] font-extrabold text-ink">{plan.name}</div>
              <div className="mt-[4px] text-[12.5px] text-ink-faint">
                {plan.hint}
              </div>
            </div>

            {/* Plan Price */}
            <div className="text-[30px] font-extrabold text-ink">
              {toPersianDigits(plan.price)}
              <small className="mr-[4px] text-[13px] font-semibold text-ink-faint">
                {" "}
                {plan.priceUnit}
              </small>
            </div>

            {/* Features List */}
            <ul className="flex flex-col gap-[11px]">
              {plan.features.map((feat, index) => (
                <li
                  key={index}
                  className="flex items-center gap-[9px] text-[13.5px] text-ink-soft"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-[17px] w-[17px] shrink-0 text-primary-dark"
                  >
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            {/* Card Footer Actions */}
            <div className="mt-auto flex items-center gap-[8px] pt-[8px]">
              <button
                type="button"
                onClick={() => onEditPlan(plan)}
                className={cn(
                  "flex-1 rounded-[10px] px-[14px] py-[8px] text-[13px] font-semibold transition-all duration-180",
                  isFeatured
                    ? "btn-ink-gradient text-white hover:shadow-[0_20px_50px_rgba(242,92,31,0.25)]"
                    : "border-[1.5px] border-border bg-surface text-ink hover:border-primary hover:bg-tint",
                )}
              >
                ویرایش
              </button>
              <span className="self-center rounded-full bg-tint px-[10px] py-[4px] text-[12px] font-bold text-primary-dark">
                {toPersianDigits(plan.activeMembers)} عضو
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
