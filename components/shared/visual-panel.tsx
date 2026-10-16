import { Logo } from "@/components/ui/logo";
import { StatsCard } from "@/components/shared/stats-card";
import {
  TrustRow,
  loginTrustItems,
  registerTrustItems,
} from "@/components/shared/trust-row";
import { Lock, ShieldCheck, Bell } from "lucide-react";

interface Step {
  num: string;
  title: string;
  description: string;
}

const registerSteps: Step[] = [
  {
    num: "۱",
    title: "فرم را پر کنید",
    description: "اطلاعات باشگاه، حساب مدیر و رمز عبور خودتان.",
  },
  {
    num: "۲",
    title: "باشگاه بلافاصله ساخته می‌شود",
    description: "بدون بررسی دستی و بدون معطلی — همان لحظه فعال است.",
  },
  {
    num: "۳",
    title: "مستقیم وارد پنل مدیریت شوید",
    description: "مربیان و اعضا را خودتان اضافه کنید و کار را شروع کنید.",
  },
];

interface VisualPanelProps {
  variant: "login" | "register" | "forgot-password";
}

export function VisualPanel({ variant }: VisualPanelProps) {
  const trustItems =
    variant === "register" ? registerTrustItems : loginTrustItems;

  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 min-[981px]:flex">
      <div
        className="pointer-events-none absolute -left-40 -top-40 z-0 h-[520px] w-[520px]"
        style={{
          background:
            "radial-gradient(circle, rgba(242,92,31,0.22), transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-[140px] -right-[100px] z-0 h-[420px] w-[420px]"
        style={{
          background:
            "radial-gradient(circle, rgba(14,165,233,0.14), transparent 70%)",
        }}
      />

      <div className="relative z-[1]">
        <Logo href="/" />
      </div>

      <div
        className={`relative z-[1] ${
          variant === "register" ? "max-w-[440px]" : "max-w-[420px]"
        }`}
      >
        {variant === "login" && (
          <>
            <h2 className="mb-4 text-[30px] font-extrabold leading-[1.5] text-white">
              مدیریت باشگاه، ساده و دقیق
            </h2>
            <p className="mb-7 text-[15px] leading-[1.8] text-[#CBD5E1]">
              به پلتفرمی وارد شوید که عضویت، رزرو، پرداخت و عملکرد باشگاه‌تان را
              در یک داشبورد زنده نشان می‌دهد.
            </p>
            <StatsCard />
          </>
        )}

        {variant === "register" && (
          <>
            <h2 className="mb-4 text-[30px] font-extrabold leading-[1.5] text-white">
              باشگاه خود را روی فیتلجند راه‌اندازی کنید
            </h2>
            <p className="mb-[30px] text-[15px] leading-[1.8] text-[#CBD5E1]">
              فرم زیر را پر کنید تا باشگاه و حساب مدیر شما همین حالا ساخته شود. بدون
              بررسی دستی، مستقیم وارد پنل مدیریت می‌شوید و مربیان و اعضا را
              خودتان اضافه می‌کنید.
            </p>
            <div className="flex flex-col gap-4">
              {registerSteps.map((step) => (
                <div key={step.num} className="flex items-start gap-3.5">
                  <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-primary/15 text-[15px] font-extrabold text-primary">
                    {step.num}
                  </span>
                  <div>
                    <div className="text-[14.5px] font-bold text-white">
                      {step.title}
                    </div>
                    <div className="mt-[3px] text-[13px] leading-[1.7] text-[#94A3B8]">
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {variant === "forgot-password" && (
          <>
            <h2 className="mb-4 text-[30px] font-extrabold leading-[1.5] text-white">
              رمز عبورتان را فراموش کرده‌اید؟
            </h2>
            <p className="mb-[28px] text-[15px] leading-[1.8] text-[#CBD5E1]">
              نگران نباشید. هویت خود را در سه مرحله تأیید کنید و رمز تازه‌ای بسازید.
              دسترسی شما به باشگاه و اطلاعات اعضا دست‌نخورده باقی می‌ماند.
            </p>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-[22px] backdrop-blur-[6px]">
              <div className="mb-[18px] flex items-center justify-between">
                <span className="text-[13px] font-bold text-white">
                  امنیت حساب
                </span>
                <span className="rounded-full bg-primary/15 px-[10px] py-[4px] text-[11px] font-bold text-primary">
                  رمزنگاری‌شده
                </span>
              </div>
              <div className="flex flex-col gap-[14px]">
                <div className="flex items-start gap-[10px] text-[13px] leading-[1.7] text-[#CBD5E1]">
                  <Lock className="mt-[3px] h-[17px] w-[17px] shrink-0 stroke-primary" />
                  <span>کد تأیید فقط چند دقیقه اعتبار دارد</span>
                </div>
                <div className="flex items-start gap-[10px] text-[13px] leading-[1.7] text-[#CBD5E1]">
                  <ShieldCheck className="mt-[3px] h-[17px] w-[17px] shrink-0 stroke-primary" />
                  <span>رمز قبلی شما هرگز نمایش داده نمی‌شود</span>
                </div>
                <div className="flex items-start gap-[10px] text-[13px] leading-[1.7] text-[#CBD5E1]">
                  <Bell className="mt-[3px] h-[17px] w-[17px] shrink-0 stroke-primary" />
                  <span>پس از تغییر رمز، به شما اطلاع داده می‌شود</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="relative z-[1]">
        <TrustRow items={trustItems} />
      </div>
    </div>
  );
}
