"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Mail, Star } from "lucide-react";
import {
  countdownText,
  REGISTER_CONFIG,
  type RegisterSuccess,
} from "@/lib/api/register-gym";

const btnPrimary =
  "inline-flex w-auto items-center justify-center gap-2 rounded-[12px] btn-ink-gradient px-6 py-[13px] text-[15px] font-bold text-white transition-all duration-200 ease-in-out hover:-translate-y-px hover:shadow-emerald max-[520px]:w-full";

const btnOutline =
  "inline-flex w-auto items-center justify-center gap-2 rounded-[12px] border-[1.5px] border-border bg-surface px-6 py-[13px] text-[15px] font-bold text-ink transition-all duration-200 ease-in-out hover:border-primary hover:bg-tint max-[520px]:w-full";

interface SuccessCardProps {
  success: RegisterSuccess;
}

export function SuccessCard({ success }: SuccessCardProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(
    REGISTER_CONFIG.redirectSeconds,
  );

  useEffect(() => {
    if (success.immediateRedirectMs) {
      const timeout = window.setTimeout(() => {
        window.location.href = success.redirectTarget;
      }, success.immediateRedirectMs);
      return () => window.clearTimeout(timeout);
    }

    if (!success.countdown) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 0) {
          window.clearInterval(timer);
          window.location.href = success.redirectTarget;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [success]);

  const redirectText = success.countdown
    ? countdownText(secondsLeft)
    : success.redirectText;

  return (
    <div className="rounded-[20px] border border-border bg-surface px-[34px] py-11 text-center shadow-md">
      <div className="mx-auto mb-[22px] flex h-20 w-20 items-center justify-center rounded-3xl bg-tint text-primary-dark">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-10 w-10"
          strokeWidth={2.5}
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>

      <h1 className="mb-3 text-2xl font-extrabold text-ink">{success.title}</h1>
      <p className="mx-auto mb-2 max-w-[400px] text-[14.5px] leading-[1.9] text-ink-soft">
        {success.lead}
      </p>

      <div className="my-6 rounded-[14px] border border-border bg-bg px-[18px] py-4 text-right">
        <div className="flex items-center gap-2.5 py-[7px] text-[13.5px] text-ink-soft">
          <Building2 className="h-[17px] w-[17px] shrink-0 text-primary-dark" strokeWidth={2} />
          <span>
            باشگاه <strong className="font-bold text-ink">{success.gymName}</strong> ایجاد شد.
          </span>
        </div>
        <div className="flex items-center gap-2.5 py-[7px] text-[13.5px] text-ink-soft">
          <Mail className="h-[17px] w-[17px] shrink-0 text-primary-dark" strokeWidth={2} />
          <span>
            ورود با ایمیل{" "}
            <strong className="font-bold text-ink" dir="ltr">
              {success.email}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-2.5 py-[7px] text-[13.5px] text-ink-soft">
          <Star className="h-[17px] w-[17px] shrink-0 text-primary-dark" strokeWidth={2} />
          <span>{success.planText}</span>
        </div>
      </div>

      {success.showRedirectNote && (
        <div className="mb-[18px] flex items-center justify-center gap-2 text-[13px] font-semibold text-ink-faint">
          <span className="h-[7px] w-[7px] animate-pulse-dot rounded-full bg-primary" />
          <span>{redirectText}</span>
        </div>
      )}

      <div className="mt-2 flex justify-center gap-3 max-[520px]:flex-col">
        {success.primaryHref.startsWith("http") ? (
          <a href={success.primaryHref} className={btnPrimary}>
            {success.primaryLabel}
          </a>
        ) : (
          <Link href={success.primaryHref} className={btnPrimary}>
            {success.primaryLabel}
          </Link>
        )}
        <Link href="/" className={btnOutline}>
          بازگشت به صفحه‌ی اصلی
        </Link>
      </div>
    </div>
  );
}
