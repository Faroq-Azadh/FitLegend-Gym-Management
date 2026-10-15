"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, LayoutGrid, Table as TableIcon } from "lucide-react";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { useSystemPlans } from "@/lib/hooks/queries/use-plans";
import { toPersianDigits } from "@/lib/persian-digits";

export function LandingPricing() {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const { data: backendSystemPlans } = useSystemPlans();

  const plans = [
    {
      code: "FREE",
      name: "رایگان",
      price: "۰",
      period: "تومان / ۱۴ روز",
      desc: "برای باشگاه‌های کوچک که می‌خواهند فیتلجند را بدون هزینه امتحان کنند",
      btnText: "شروع رایگان",
      btnClass:
        "border-[1.5px] border-border bg-surface text-ink hover:border-primary hover:bg-tint",
      cardClass: "bg-tint border-[#C6F1E1]",
      featured: false,
      isFree: true,
      features: [
        "تا ۵۰ عضو",
        "تا ۲ مربی",
        "مدیریت اعضا و رزرو کلاس",
        "بدون نیاز به کارت بانکی",
      ],
      comparison: {
        priceFormatted: "رایگان (۱۴ روز)",
        members: "تا ۵۰ عضو",
        coaches: "تا ۲ مربی",
        trial: "۱۴ روز رایگان",
        memberManagement: true,
        classBooking: "پایه",
        financialReports: "محدود",
        support: "تیکت عادی",
        customBranding: false,
      },
    },
    {
      code: "BASIC",
      name: "پایه",
      price: "۱.۲",
      period: "میلیون تومان / ماه",
      desc: "برای باشگاه‌های تک‌شعبه‌ای با تا ۲۰۰ عضو",
      btnText: "انتخاب پلن پایه",
      btnClass:
        "border-[1.5px] border-border bg-surface text-ink hover:border-primary hover:bg-tint",
      cardClass: "bg-surface border-border",
      featured: false,
      isFree: false,
      features: [
        "تا ۲۰۰ عضو",
        "تا ۵ مربی",
        "مدیریت اعضا و عضویت",
        "رزرو کلاس آنلاین",
        "پرداخت آنلاین پایه",
      ],
      comparison: {
        priceFormatted: "۱.۲ میلیون تومان / ماه",
        members: "تا ۲۰۰ عضو",
        coaches: "تا ۵ مربی",
        trial: "امکان تست",
        memberManagement: true,
        classBooking: "کامل",
        financialReports: "گزارشات پایه",
        support: "تیکت و تلفنی",
        customBranding: false,
      },
    },
    {
      code: "PRO",
      name: "حرفه‌ای",
      price: "۲.۹",
      period: "میلیون تومان / ماه",
      desc: "برای باشگاه‌های چندشعبه‌ای تا ۱۰۰۰ عضو",
      btnText: "انتخاب پلن حرفه‌ای",
      btnClass: "bg-ink text-white hover:bg-primary-dark hover:shadow-emerald",
      cardClass: "bg-surface border-primary shadow-emerald relative min-[981px]:-translate-y-3",
      featured: true,
      isFree: false,
      features: [
        "تا ۱۰۰۰ عضو",
        "تا ۲۰ مربی",
        "همه امکانات پلن پایه",
        "داشبورد تحلیلی پیشرفته",
        "پشتیبانی اولویت‌دار",
      ],
      comparison: {
        priceFormatted: "۲.۹ میلیون تومان / ماه",
        members: "تا ۱,۰۰۰ عضو",
        coaches: "تا ۲۰ مربی",
        trial: "امکان تست",
        memberManagement: true,
        classBooking: "پیشرفته و پیامکی",
        financialReports: "داشبورد تحلیلی کامل",
        support: "پشتیبانی اولویت‌دار ۲۴/۷",
        customBranding: true,
      },
    },
    {
      code: "ENTERPRISE",
      name: "سازمانی",
      price: "سفارشی",
      period: "",
      desc: "برای زنجیره‌های باشگاه با نیازهای خاص",
      btnText: "تماس با فروش",
      btnClass:
        "border-[1.5px] border-border bg-surface text-ink hover:border-primary hover:bg-tint",
      cardClass: "bg-surface border-border",
      featured: false,
      isFree: false,
      features: [
        "اعضای نامحدود",
        "مربیان نامحدود",
        "یکپارچه‌سازی اختصاصی",
        "مدیر حساب اختصاصی",
        "قرارداد سطح خدمات",
      ],
      comparison: {
        priceFormatted: "سفارشی / توافقی",
        members: "نامحدود",
        coaches: "نامحدود",
        trial: "دموی اختصاصی",
        memberManagement: true,
        classBooking: "شخصی‌سازی شده",
        financialReports: "اتصال به ERP و حسابداری",
        support: "مدیر حساب اختصاصی + SLA",
        customBranding: true,
      },
    },
  ];

  // If backend plans are loaded, override with exact numbers from Django
  const dynamicPlans = plans.map((p) => {
    const found = Array.isArray(backendSystemPlans)
      ? backendSystemPlans.find((sp) => sp.code?.toUpperCase() === p.code)
      : undefined;

    if (found) {
      const priceNum = found.price ? parseFloat(found.price) : 0;
      const formattedPrice =
        priceNum === 0
          ? "۰"
          : priceNum >= 1_000_000
            ? (priceNum / 1_000_000).toLocaleString("fa-IR")
            : priceNum.toLocaleString("fa-IR");

      const period =
        found.code === "FREE"
          ? `تومان / ${toPersianDigits(found.trial_days || 14)} روز آزمایشی`
          : priceNum >= 1_000_000
            ? "میلیون تومان / ماه"
            : "تومان / ماه";

      const features = [...p.features];
      const comparison = { ...p.comparison };

      if (found.member_limit !== undefined) {
        features[0] = found.member_limit
          ? `تا ${toPersianDigits(found.member_limit)} عضو`
          : "اعضای نامحدود";
        comparison.members = found.member_limit
          ? `تا ${toPersianDigits(found.member_limit)} عضو`
          : "نامحدود";
      }
      if (found.coach_limit !== undefined && features.length > 1) {
        features[1] = found.coach_limit
          ? `تا ${toPersianDigits(found.coach_limit)} مربی`
          : "مربیان نامحدود";
        comparison.coaches = found.coach_limit
          ? `تا ${toPersianDigits(found.coach_limit)} مربی`
          : "نامحدود";
      }
      if (found.price !== undefined) {
        comparison.priceFormatted =
          found.code === "FREE"
            ? `رایگان (${toPersianDigits(found.trial_days || 14)} روز)`
            : found.price === null
              ? "سفارشی"
              : `${formattedPrice} ${period}`;
      }

      return {
        ...p,
        name: found.name || p.name,
        price: formattedPrice,
        period,
        features,
        comparison,
      };
    }

    return p;
  });

  return (
    <section
      id="pricing"
      className="border-y border-border bg-surface py-20 min-[640px]:py-[110px]"
    >
      <div className="mx-auto max-w-[1240px] px-5 min-[640px]:px-8">
        <ScrollReveal className="mx-auto mb-10 max-w-[640px] text-center">
          <span className="mb-3.5 inline-block text-[13px] font-bold tracking-wide text-primary-dark">
            تعرفه‌ها
          </span>
          <h2 className="mb-4 text-[28px] font-extrabold leading-[1.3] text-ink min-[640px]:text-[36px] min-[981px]:text-[42px]">
            تعرفه‌ای متناسب با اندازه باشگاه‌تان
          </h2>
          <p className="text-[16px] leading-[1.8] text-ink-soft">
            با پلن رایگان شروع کنید و هر زمان خواستید ارتقا دهید. بدون قرارداد
            بلندمدت.
          </p>
        </ScrollReveal>

        {/* View Mode Switcher */}
        <div className="mx-auto mb-10 flex w-fit items-center rounded-[14px] border border-border bg-bg p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`flex items-center gap-2 rounded-[10px] px-5 py-2 text-[13.5px] font-bold transition-all duration-200 ${
              viewMode === "cards"
                ? "bg-surface text-ink shadow-sm"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            <span>نمایش کارتی</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-2 rounded-[10px] px-5 py-2 text-[13.5px] font-bold transition-all duration-200 ${
              viewMode === "table"
                ? "bg-surface text-ink shadow-sm"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <TableIcon className="h-4 w-4" />
            <span>جدول مقایسه تعرفه‌ها</span>
          </button>
        </div>

        {/* Mode 1: Cards View */}
        {viewMode === "cards" && (
          <div className="grid grid-cols-1 gap-5 min-[640px]:grid-cols-2 min-[981px]:grid-cols-4 animate-in fade-in duration-300">
            {dynamicPlans.map((p, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.1}>
                <div
                  className={`rounded-[20px] border-[1.5px] p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md min-[640px]:p-8 ${p.cardClass}`}
                >
                  {p.featured && (
                    <span className="absolute -top-3.5 right-7 rounded-full bg-ink px-3.5 py-1 text-[12px] font-bold text-white">
                      محبوب‌ترین
                    </span>
                  )}
                  <div className="mb-3 text-[15px] font-bold text-ink-soft">
                    {p.name}
                  </div>
                  <div className="mb-1.5 flex items-baseline gap-1.5">
                    <span className="font-black text-ink text-[34px]">
                      {p.price}
                    </span>
                    {p.period && (
                      <span className="text-[14px] text-ink-faint">{p.period}</span>
                    )}
                  </div>

                  <div className="mb-6 min-h-[44px] text-[13px] leading-[1.75] text-ink-faint">
                    {p.desc}
                  </div>

                  <Link
                    href="/register-gym"
                    className={`mb-6 flex w-full items-center justify-center gap-2 rounded-[12px] py-3 text-[15px] font-bold transition-all ${p.btnClass}`}
                  >
                    {p.btnText}
                  </Link>

                  <ul className="flex flex-col gap-3">
                    {p.features.map((feat, fIdx) => (
                      <li
                        key={fIdx}
                        className="flex items-start gap-2.5 text-[13.5px] font-medium leading-[1.7] text-ink-soft"
                      >
                        <Check className="mt-1 h-3.5 w-3.5 shrink-0 stroke-primary-dark stroke-[3]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* Mode 2: Detailed Comparison Table View */}
        {viewMode === "table" && (
          <div className="overflow-hidden rounded-[20px] border border-border bg-surface shadow-sm animate-in fade-in duration-300">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-right text-[13.5px]">
                <thead>
                  <tr className="border-b border-border bg-bg/60">
                    <th className="p-4 font-bold text-ink-soft min-w-[180px]">امکانات و ویژگی‌ها</th>
                    {dynamicPlans.map((p) => (
                      <th
                        key={p.code}
                        className={`p-4 text-center font-black ${
                          p.featured ? "bg-tint/70 text-ink border-x border-primary/30" : "text-ink"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[15px]">{p.name}</span>
                          {p.featured && (
                            <span className="rounded-full bg-ink px-2.5 py-0.5 text-[10.5px] font-bold text-white">
                              پیشنهادی
                            </span>
                          )}
                          <span className="mt-1 text-[13px] font-bold text-primary-dark">
                            {p.comparison.priceFormatted}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-bg/40 transition-colors">
                    <td className="p-4 font-medium text-ink-soft">سقف تعداد اعضا</td>
                    {dynamicPlans.map((p) => (
                      <td
                        key={p.code}
                        className={`p-4 text-center font-bold text-ink ${
                          p.featured ? "bg-tint/30 border-x border-primary/20" : ""
                        }`}
                      >
                        {p.comparison.members}
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-bg/40 transition-colors">
                    <td className="p-4 font-medium text-ink-soft">سقف مربیان</td>
                    {dynamicPlans.map((p) => (
                      <td
                        key={p.code}
                        className={`p-4 text-center font-bold text-ink ${
                          p.featured ? "bg-tint/30 border-x border-primary/20" : ""
                        }`}
                      >
                        {p.comparison.coaches}
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-bg/40 transition-colors">
                    <td className="p-4 font-medium text-ink-soft">دوره تست رایگان</td>
                    {dynamicPlans.map((p) => (
                      <td
                        key={p.code}
                        className={`p-4 text-center text-ink ${
                          p.featured ? "bg-tint/30 border-x border-primary/20" : ""
                        }`}
                      >
                        {p.comparison.trial}
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-bg/40 transition-colors">
                    <td className="p-4 font-medium text-ink-soft">سیستم مدیریت اعضا و عضویت</td>
                    {dynamicPlans.map((p) => (
                      <td
                        key={p.code}
                        className={`p-4 text-center ${
                          p.featured ? "bg-tint/30 border-x border-primary/20" : ""
                        }`}
                      >
                        <Check className="mx-auto h-4 w-4 text-primary-dark stroke-[3]" />
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-bg/40 transition-colors">
                    <td className="p-4 font-medium text-ink-soft">رزرو آنلاین کلاس و سانس‌ها</td>
                    {dynamicPlans.map((p) => (
                      <td
                        key={p.code}
                        className={`p-4 text-center text-ink-soft ${
                          p.featured ? "bg-tint/30 border-x border-primary/20 font-semibold" : ""
                        }`}
                      >
                        {p.comparison.classBooking}
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-bg/40 transition-colors">
                    <td className="p-4 font-medium text-ink-soft">گزارشات مالی و درآمد</td>
                    {dynamicPlans.map((p) => (
                      <td
                        key={p.code}
                        className={`p-4 text-center text-ink-soft ${
                          p.featured ? "bg-tint/30 border-x border-primary/20 font-semibold" : ""
                        }`}
                      >
                        {p.comparison.financialReports}
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-bg/40 transition-colors">
                    <td className="p-4 font-medium text-ink-soft">سطح پشتیبانی</td>
                    {dynamicPlans.map((p) => (
                      <td
                        key={p.code}
                        className={`p-4 text-center text-ink-soft ${
                          p.featured ? "bg-tint/30 border-x border-primary/20 font-semibold" : ""
                        }`}
                      >
                        {p.comparison.support}
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-bg/40 transition-colors">
                    <td className="p-4 font-medium text-ink-soft">شخصی‌سازی و برندینگ اختصاصی</td>
                    {dynamicPlans.map((p) => (
                      <td
                        key={p.code}
                        className={`p-4 text-center ${
                          p.featured ? "bg-tint/30 border-x border-primary/20" : ""
                        }`}
                      >
                        {p.comparison.customBranding ? (
                          <Check className="mx-auto h-4 w-4 text-primary-dark stroke-[3]" />
                        ) : (
                          <Minus className="mx-auto h-4 w-4 text-ink-faint" />
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* CTA row in table */}
                  <tr className="bg-bg/40">
                    <td className="p-4 font-bold text-ink">اقدام</td>
                    {dynamicPlans.map((p) => (
                      <td
                        key={p.code}
                        className={`p-4 text-center ${
                          p.featured ? "bg-tint/50 border-x border-primary/30" : ""
                        }`}
                      >
                        <Link
                          href="/register-gym"
                          className={`inline-flex items-center justify-center rounded-[10px] px-4 py-2 text-[12.5px] font-bold transition-all ${
                            p.featured
                              ? "bg-ink text-white hover:bg-primary-dark"
                              : "border border-border bg-surface text-ink hover:border-primary hover:bg-tint"
                          }`}
                        >
                          {p.btnText}
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
