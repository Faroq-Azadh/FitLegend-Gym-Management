"use client";

import { useState, useMemo } from "react";
import {
  usePlans,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
  useSystemPlans,
} from "@/lib/hooks/queries/use-plans";
import { useGymMe } from "@/lib/hooks/queries/use-gym-me";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { PlansGrid } from "@/components/admin/plans/plans-grid";
import { PlansTable } from "@/components/admin/plans/plans-table";
import { PlanModal } from "@/components/admin/plans/plan-modal";
import { UpgradePlanModal } from "@/components/admin/plans/upgrade-plan-modal";
import { PlanItem } from "@/components/admin/plans/types";
import { Shield, Sparkles, Check, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";
import { toPersianDigits } from "@/lib/persian-digits";
import { SystemPlan } from "@/lib/api/services/plans.service";
import { logActivity } from "@/lib/activities-store";
import { getCurrentUserScope } from "@/lib/session-scope";

export default function AdminPlansPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [tableActiveTab, setTableActiveTab] = useState<"member_plans" | "system_plans">("member_plans");
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const { data: gym, isLoading: isGymLoading } = useGymMe();
  const { data: backendPlans, isLoading: isPlansLoading } = usePlans();
  const { data: systemPlans, isLoading: isSystemPlansLoading } = useSystemPlans();
  const createPlanMutation = useCreatePlan();
  const updatePlanMutation = useUpdatePlan();
  const deletePlanMutation = useDeletePlan();

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const plans: PlanItem[] = useMemo(() => {
    const list: any[] = Array.isArray(backendPlans)
      ? backendPlans
      : Array.isArray((backendPlans as any)?.results)
        ? (backendPlans as any).results
        : Array.isArray((backendPlans as any)?.plans)
          ? (backendPlans as any).plans
          : [];

    return list.map((p) => {
      const priceNum = typeof p.price === "string" ? parseFloat(p.price) : (p.price || 0);
      const formattedPrice = priceNum ? priceNum.toLocaleString("fa-IR") : "۰";
      const days = p.duration_days || 30;
      const durationMonths = Math.max(1, Math.round(days / 30));
      const durationText = `${durationMonths.toLocaleString("fa-IR")} ماهه (${days.toLocaleString("fa-IR")} روز)`;

      return {
        id: String(p.id),
        name: p.name,
        hint: p.description || (p.is_active ? "پلن فعال" : "پلن غیرفعال"),
        price: formattedPrice,
        priceRaw: priceNum,
        priceUnit: "تومان",
        duration: durationText,
        durationDays: days,
        activeMembers: p.active_members || 0,
        status: p.is_active ? ("active" as const) : ("inactive" as const),
        features: Array.isArray(p.features) && p.features.length > 0 ? p.features : ["دسترسی به سالن بدنسازی", "کمد اختصاصی"],
        description: p.description || "",
      };
    });
  }, [backendPlans]);

  const handleSavePlan = async (planData: Omit<PlanItem, "id">, editId?: string) => {
    const rawPrice = planData.priceRaw || parseFloat(String(planData.price).replace(/[^\d.-]/g, "")) || 0;
    const durationDays = planData.durationDays || 30;

    try {
      if (editId) {
        await updatePlanMutation.mutateAsync({
          id: editId,
          payload: {
            name: planData.name,
            duration_days: durationDays,
            price: rawPrice,
            description: planData.description || planData.hint,
            features: planData.features,
            is_active: planData.status === "active",
          },
        });
        showToast(`پلن عضویت «${planData.name}» با موفقیت ویرایش شد.`, "success");
        logActivity({ type: "EDIT", text: `ویرایش پلن عضویت باشگاه: ${planData.name}` });
      } else {
        await createPlanMutation.mutateAsync({
          name: planData.name,
          duration_days: durationDays,
          price: rawPrice,
          description: planData.description || planData.hint,
          features: planData.features,
          is_active: planData.status === "active",
        });
        showToast(`پلن عضویت جدید «${planData.name}» با موفقیت ذخیره و فعال گردید.`, "success");
        logActivity({ type: "EDIT", text: `تعریف پلن عضویت جدید باشگاه: ${planData.name}` });
      }
      setIsModalOpen(false);
      setEditingPlan(null);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || "خطا در ذخیره پلن در سامانه";
      showToast(msg, "error");
      throw err;
    }
  };

  const handleDeletePlan = async (id: string) => {
    const targetPlan = plans.find((p) => p.id === id);
    const planName = targetPlan?.name || "پلن";
    if (typeof window !== "undefined" && window.confirm(`آیا از غیرفعال‌سازی پلن «${planName}» اطمینان دارید؟`)) {
      try {
        await deletePlanMutation.mutateAsync(id);
        showToast(`پلن «${planName}» با موفقیت غیرفعال و بازنشسته شد.`, "success");
        logActivity({ type: "ALERT", text: `غیرفعال‌سازی پلن عضویت باشگاه: ${planName}` });
      } catch (err: any) {
        showToast(err?.message || "خطا در غیرفعال‌سازی پلن", "error");
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    const plan = plans.find((p) => p.id === id);
    if (!plan) return;
    const nextStatus = plan.status !== "active";
    try {
      await updatePlanMutation.mutateAsync({
        id,
        payload: {
          is_active: nextStatus,
        },
      });
      showToast(`وضعیت پلن «${plan.name}» به ${nextStatus ? "فعال" : "غیرفعال"} تغییر یافت.`, "success");
    } catch (err: any) {
      showToast(err?.message || "خطا در تغییر وضعیت پلن", "error");
    }
  };

  // Gym's own platform subscription data with local upgrade override fallback
  const userScope = getCurrentUserScope();
  let localOverrideCode: string | null = null;
  if (typeof window !== "undefined") {
    try {
      const rawOverride = localStorage.getItem(`fitlegend_gym_plan_override_${userScope}`);
      if (rawOverride) {
        const parsed = JSON.parse(rawOverride);
        localOverrideCode = parsed.code || null;
      }
    } catch {}
  }

  const currentSub = gym?.subscription;
  const rawPlanProp = currentSub?.plan;
  const serverPlanCode =
    typeof rawPlanProp === "string"
      ? rawPlanProp
      : (rawPlanProp as any)?.code || (gym as any)?.plan || "FREE";

  const currentPlanCode = (localOverrideCode || serverPlanCode || "FREE").toUpperCase();

  const planLabels: Record<string, string> = {
    FREE: "آزمایشی رایگان",
    BASIC: "پلن پایه",
    PRO: "پلن حرفه‌ای",
    ENTERPRISE: "پلن سازمانی",
  };
  const currentPlanName = planLabels[currentPlanCode] || "آزمایشی رایگان";

  const defaultSystemPlans: SystemPlan[] = [
    { code: "FREE", name: "رایگان / دمو", price: null, trial_days: 90, member_limit: 50, coach_limit: 3 },
    { code: "BASIC", name: "پایه", price: "1200000", trial_days: 0, member_limit: 200, coach_limit: 5 },
    { code: "PRO", name: "حرفه‌ای", price: "2900000", trial_days: 0, member_limit: 1000, coach_limit: 20 },
    { code: "ENTERPRISE", name: "سازمانی", price: null, trial_days: 0, member_limit: null, coach_limit: null },
  ];

  const allSystemPlans: SystemPlan[] =
    systemPlans && systemPlans.length > 0 ? systemPlans : defaultSystemPlans;

  return (
    <div className="flex min-h-screen bg-bg text-ink">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 z-110 -translate-x-1/2 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center gap-2.5 rounded-[14px] px-5 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.18)] ${
              toastMessage.type === "success"
                ? "bg-ink text-white border border-primary/40"
                : "bg-red-600 text-white border border-red-700"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-primary stroke-[2.5]" />
            ) : (
              <AlertCircle className="h-5 w-5 text-white stroke-[2.5]" />
            )}
            <span className="text-[13.5px] font-bold">{toastMessage.text}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="mr-2 text-white/70 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar Header */}
        <AdminTopbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          searchPlaceholder="جستجو در تعرفه‌ها و پلن‌های عضویت…"
        />

        {/* Page Content */}
        <main className="flex-1 p-[18px] min-[640px]:p-[28px]">
          {/* Page Head */}
          <div className="mb-[24px] flex flex-wrap items-end justify-between gap-[16px]">
            <div>
              <h1 className="text-[22px] font-extrabold tracking-[-0.01em] text-ink min-[640px]:text-[26px]">
                پلن‌ها و تعرفه‌ها
              </h1>
              <div className="mt-[5px] text-[14px] text-ink-faint">
                مدیریت پلن‌های عضویت ورزشکاران و ارتقای اشتراک پلتفرم فیتلجند جیم
              </div>
            </div>

            <div className="flex items-center gap-[10px]">
              <button
                type="button"
                onClick={() => {
                  setEditingPlan(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-[8px] rounded-[10px] bg-ink px-[16px] py-[9px] text-[13px] font-bold text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary-dark hover:shadow-[0_20px_50px_rgba(22,224,160,0.25)] active:translate-y-0 cursor-pointer shadow-xs"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-[16px] w-[16px]"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>تعریف پلن عضویت جدید</span>
              </button>
            </div>
          </div>

          {/* Gym Current Subscription Banner (from Django GET /gyms/me/) */}
          <div className="mb-[24px] overflow-hidden rounded-[18px] border border-primary/40 bg-gradient-to-l from-tint via-surface to-surface p-[22px] shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-[16px]">
              <div className="flex items-center gap-[14px]">
                <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[16px] bg-primary/20 text-primary-dark shadow-xs">
                  <Shield className="h-[26px] w-[26px]" />
                </span>
                <div>
                  <div className="flex items-center gap-[10px]">
                    <span className="text-[17px] font-black text-ink">
                      اشتراک فعال پلتفرم: {currentPlanName}
                    </span>
                    <span className="rounded-full bg-tint px-[10px] py-[2.5px] text-[11.5px] font-bold text-primary-dark border border-primary/30">
                      {currentPlanCode !== "FREE" || currentSub?.is_active ? "فعال و بدون محدودیت زمانی" : "دوره آزمایشی (۹۰ روز)"}
                    </span>
                  </div>
                  <p className="mt-[4px] text-[13px] text-ink-faint">
                    سقف اعضا: {currentPlanCode === "FREE" ? "۵۰ نفر" : currentPlanCode === "BASIC" ? "۲۰۰ نفر" : currentPlanCode === "PRO" ? "۱,۰۰۰ نفر" : "نامحدود"} · سقف مربیان: {currentPlanCode === "FREE" ? "۳ نفر" : currentPlanCode === "BASIC" ? "۵ نفر" : "نامحدود"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-[12px] bg-ink px-[18px] py-[10px] text-[13.5px] font-bold text-white transition-all hover:bg-primary-dark cursor-pointer shadow-xs"
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>ارتقای اشتراک و پرداخت آنلاین</span>
                </button>
              </div>
            </div>
          </div>

          {/* Featured Plan Cards Grid (Shown only if there are active plans) */}
          {plans.length > 0 && (
            <PlansGrid
              plans={plans}
              onEditPlan={(plan) => {
                setEditingPlan(plan);
                setIsModalOpen(true);
              }}
            />
          )}

          {/* All Plans & Tariffs Table Card */}
          <PlansTable
            plans={plans}
            systemPlans={allSystemPlans}
            currentPlanCode={currentPlanCode}
            activeTab={tableActiveTab}
            onTabChange={setTableActiveTab}
            onEditPlan={(plan) => {
              setEditingPlan(plan);
              setIsModalOpen(true);
            }}
            onDeletePlan={handleDeletePlan}
            onToggleStatus={handleToggleStatus}
            onOpenCreateModal={() => {
              setEditingPlan(null);
              setIsModalOpen(true);
            }}
            onUpgradeSystemPlan={(sp) => {
              setIsUpgradeModalOpen(true);
            }}
          />
        </main>
      </div>

      {/* Plan Add / Edit Modal (Django MembershipPlan) */}
      <PlanModal
        isOpen={isModalOpen}
        editPlan={editingPlan}
        isSubmitting={createPlanMutation.isPending || updatePlanMutation.isPending}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlan(null);
        }}
        onSave={handleSavePlan}
      />

      {/* FitLegend SaaS Subscription Upgrade & Simulated Gateway Modal */}
      <UpgradePlanModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        systemPlans={allSystemPlans}
        currentPlanCode={currentPlanCode}
        gymName={gym?.name || "باشگاه"}
        onUpgradeSuccess={(upgradedPlan, refId) => {
          showToast(`اشتراک باشگاه با موفقیت به پلن «${upgradedPlan.name}» ارتقا یافت. (کد پیگیری: ${refId})`, "success");
        }}
      />
    </div>
  );
}
