"use client";

import { useState } from "react";
import Link from "next/link";
import { toPersianDigits } from "@/lib/persian-digits";
import { AthleteSidebar } from "@/components/athlete/athlete-sidebar";
import { AthleteTopbar } from "@/components/athlete/athlete-topbar";

interface InvoiceItem {
  id: string;
  planName: string;
  date: string;
  amount: string;
  status: "PAID" | "PENDING";
  refId: string;
}

const INVOICES: InvoiceItem[] = [
  {
    id: "INV-1092",
    planName: "اشتراک طلایی ۳ ماهه باشگاه",
    date: "۱۴۰۳/۰۶/۱۵",
    amount: "۲,۸۵۰,۰۰۰ تومان",
    status: "PAID",
    refId: "TRX-8829104",
  },
  {
    id: "INV-0941",
    planName: "بسته تمرین خصوصی با مربی (۱۰ جلسه)",
    date: "۱۴۰۳/۰۵/۰۱",
    amount: "۳,۵۰۰,۰۰۰ تومان",
    status: "PAID",
    refId: "TRX-7410294",
  },
  {
    id: "INV-0820",
    planName: "اشتراک نقره‌ای ۱ ماهه باشگاه",
    date: "۱۴۰۳/۰۴/۰۱",
    amount: "۱,۱۰۰,۰۰۰ تومان",
    status: "PAID",
    refId: "TRX-6102947",
  },
];

export default function AthleteMembershipPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);

  return (
    <div className="app">
      <AthleteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <AthleteTopbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="content">
          <div className="page-head">
            <div>
              <h1>عضویت و پرداخت</h1>
              <div className="sub">مدیریت اشتراک باشگاه، تمدید دوره و سوابق تراکنش‌ها</div>
            </div>
            <div className="page-head-actions">
              <button
                type="button"
                onClick={() => setShowRenewModal(true)}
                className="btn btn-primary btn-sm"
              >
                تمدید اشتراک
              </button>
            </div>
          </div>

          {/* Current Membership Card */}
          <div className="card p-6 mb-6 bg-gradient-to-br from-surface to-tint/30 border-primary/20">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="pill mb-2 inline-block">اشتراک فعال</span>
                <h2 className="text-[22px] font-extrabold text-ink mt-1">عضویت طلایی باشگاه تیتان (۳ ماهه)</h2>
                <div className="text-[13.5px] text-ink-soft mt-1">
                  شامل دسترسی به سالن بدنسازی، هوازی و رزرو ۲ کلاس گروهی در هفته
                </div>
              </div>
              <div className="text-left shrink-0">
                <div className="text-[28px] font-extrabold text-primary-dark">۲۵ روز</div>
                <div className="text-[12px] text-ink-faint">تا پایان اعتبار (انقضا: ۵ آبان ۱۴۰۳)</div>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-surface rounded-[12px] border border-border">
                <div className="text-[11.5px] text-ink-faint">تاریخ شروع</div>
                <div className="text-[14px] font-bold text-ink mt-1">۱۵ شهریور ۱۴۰۳</div>
              </div>
              <div className="p-3 bg-surface rounded-[12px] border border-border">
                <div className="text-[11.5px] text-ink-faint">مربی اختصاصی</div>
                <div className="text-[14px] font-bold text-ink mt-1">آرش رستمی</div>
              </div>
              <div className="p-3 bg-surface rounded-[12px] border border-border">
                <div className="text-[11.5px] text-ink-faint">کمد اختصاصی</div>
                <div className="text-[14px] font-bold text-ink mt-1">شماره ۴۲ (VIP)</div>
              </div>
            </div>
          </div>

          {/* Payment Invoices */}
          <div className="card">
            <div className="card-head">
              <div>
                <h3>سوابق پرداخت و فاکتورها</h3>
                <div className="hint">لیست پرداخت‌های انجام شده توسط شما</div>
              </div>
            </div>
            <div className="card-body">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>شماره فاکتور</th>
                      <th>شرح خدمت</th>
                      <th>تاریخ پرداخت</th>
                      <th>مبلغ</th>
                      <th>شماره پیگیری</th>
                      <th>وضعیت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INVOICES.map((inv) => (
                      <tr key={inv.id}>
                        <td className="font-bold text-ink">{toPersianDigits(inv.id)}</td>
                        <td>{toPersianDigits(inv.planName)}</td>
                        <td>{toPersianDigits(inv.date)}</td>
                        <td className="font-bold text-ink">{toPersianDigits(inv.amount)}</td>
                        <td className="font-mono text-[12.5px] text-ink-faint">{toPersianDigits(inv.refId)}</td>
                        <td>
                          <span className="kpi-trend up">پرداخت موفق</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showRenewModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-[3px]" onClick={() => setShowRenewModal(false)} />
          <div className="relative z-10 w-full max-w-[460px] rounded-[20px] bg-surface p-6 border border-border shadow-2xl">
            <h3 className="text-[18px] font-extrabold text-ink mb-2">تمدید عضویت باشگاه</h3>
            <p className="text-[13px] text-ink-soft mb-5">
              اشتراک شما با همان تعرفه طلایی به مدت ۳ ماه دیگر تمدید خواهد شد.
            </p>
            <div className="p-4 bg-bg rounded-[14px] mb-5 border border-border">
              <div className="flex justify-between text-[14px] mb-2">
                <span>تعرفه اشتراک ۳ ماهه</span>
                <span className="font-bold">۲,۸۵۰,۰۰۰ تومان</span>
              </div>
              <div className="flex justify-between text-[14px] text-primary-dark">
                <span>تخفیف تمدید زودهنگام</span>
                <span className="font-bold">−۱۵۰,۰۰۰ تومان</span>
              </div>
              <div className="border-t border-border mt-3 pt-3 flex justify-between font-extrabold text-[15px]">
                <span>مبلغ قابل پرداخت</span>
                <span className="text-primary-dark">۲,۷۰۰,۰۰۰ تومان</span>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowRenewModal(false)} className="btn btn-outline btn-sm">
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  alert("هدایت به درگاه پرداخت شتاب...");
                  setShowRenewModal(false);
                }}
                className="btn btn-primary btn-sm"
              >
                پرداخت و تمدید
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
