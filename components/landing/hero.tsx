import Link from "next/link";
import { Check } from "lucide-react";

export function LandingHero() {
  return (
    <section className="overflow-hidden pt-16 min-[981px]:pt-[88px]">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-6 px-5 min-[640px]:px-8 min-[981px]:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-tint px-3.5 py-1.5 text-[13px] font-bold text-primary-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            پلتفرم مدیریت باشگاه نسل جدید
          </div>

          <h1 className="mb-[22px] text-[36px] font-black leading-[1.18] tracking-tight text-ink min-[640px]:text-[48px] min-[981px]:text-[60px]">
            باشگاهت را با <span className="text-primary-dark">داده</span> اداره
            کن، نه با حدس
          </h1>

          <p className="mb-9 max-w-[480px] text-[18px] leading-[1.8] text-ink-soft">
            فیتلجند همه‌چیز را برای باشگاه‌داران، مربیان و مدیران در یک سیستم
            واحد جمع می‌کند؛ از رزرو و عضویت تا تحلیل عملکرد ورزشکاران، در لحظه و
            دقیق.
          </p>

          <div className="mb-11 flex flex-col items-stretch gap-4 min-[640px]:flex-row min-[640px]:items-center">
            <Link
              href="/register-gym"
              className="flex items-center justify-center rounded-[14px] bg-ink px-[30px] py-[15px] text-[16px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-emerald"
            >
              شروع رایگان ۴۵ روزه
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-7">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[24px] font-extrabold text-ink">۵۰۰+</span>
              <span className="text-[13px] font-medium text-ink-faint">
                باشگاه فعال
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[24px] font-extrabold text-ink">۵۰هزار+</span>
              <span className="text-[13px] font-medium text-ink-faint">
                ورزشکار
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[24px] font-extrabold text-ink">۹۹.۹٪</span>
              <span className="text-[13px] font-medium text-ink-faint">
                پایداری سیستم
              </span>
            </div>
          </div>
        </div>

        {/* HERO VISUAL */}
        <div className="relative h-[380px] min-[981px]:h-[520px]">
          {/* Glow Halo */}
          <div
            className="pointer-events-none absolute -right-[60px] top-0 h-[420px] w-[420px] rounded-full blur-[40px]"
            style={{
              background:
                "radial-gradient(circle, rgba(22,224,160,0.35), transparent 70%)",
            }}
          />

          {/* Main Dash Card */}
          <div className="absolute right-[10px] top-[18px] z-10 w-[300px] rounded-[16px] border border-border bg-surface p-[22px] shadow-lg min-[981px]:right-[30px] min-[981px]:w-[340px]">
            <div className="mb-[18px] flex items-center justify-between">
              <span className="text-[14px] font-bold text-ink">
                عملکرد هفتگی باشگاه
              </span>
              <span className="rounded-full bg-tint px-2.5 py-1 text-[11px] font-bold text-primary-dark">
                +۱۸٪
              </span>
            </div>

            <svg
              className="mb-[14px] h-[90px] w-full"
              viewBox="0 0 300 90"
              fill="none"
            >
              <path
                d="M0 60 L30 60 L42 30 L54 70 L66 20 L78 55 L96 45 L114 65 L132 25 L150 50 L168 15 L186 58 L204 35 L222 60 L240 28 L258 50 L276 18 L300 40"
                stroke="#16E0A0"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M0 60 L30 60 L42 30 L54 70 L66 20 L78 55 L96 45 L114 65 L132 25 L150 50 L168 15 L186 58 L204 35 L222 60 L240 28 L258 50 L276 18 L300 40 L300 90 L0 90 Z"
                fill="url(#pulseGradHero)"
                opacity="0.5"
              />
              <defs>
                <linearGradient id="pulseGradHero" x1="0" y1="0" x2="0" y2="90">
                  <stop offset="0%" stopColor="#16E0A0" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#16E0A0" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            <div className="flex gap-3">
              <div className="flex-1 rounded-[10px] bg-bg p-3">
                <div className="text-[18px] font-extrabold text-ink">۱,۲۴۰</div>
                <div className="mt-0.5 text-[11px] text-ink-faint">
                  ورود این هفته
                </div>
              </div>
              <div className="flex-1 rounded-[10px] bg-bg p-3">
                <div className="text-[18px] font-extrabold text-ink">۸۶٪</div>
                <div className="mt-0.5 text-[11px] text-ink-faint">
                  نرخ تمدید
                </div>
              </div>
            </div>
          </div>

          {/* Floating Card 1 */}
          <div className="absolute -left-[10px] bottom-[30px] z-10 w-[200px] rounded-[16px] border border-border bg-surface p-4 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2 space-x-reverse">
                <div className="h-[30px] w-[30px] rounded-full border-2 border-surface bg-gradient-to-br from-cyan to-primary" />
                <div className="h-[30px] w-[30px] rounded-full border-2 border-surface bg-gradient-to-br from-primary to-primary-dark" />
                <div className="h-[30px] w-[30px] rounded-full border-2 border-surface bg-gradient-to-br from-cyan to-emerald-400" />
              </div>
            </div>
            <p className="mt-2.5 text-[12px] font-semibold text-ink-soft">
              <b className="text-ink">۱۲ نفر</b> امروز کلاس رزرو کردند
            </p>
          </div>

          {/* Floating Card 2 */}
          <div className="absolute left-[20px] top-[60px] z-10 flex w-[170px] items-center gap-2.5 rounded-[16px] border border-border bg-surface p-[14px] shadow-lg">
            <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-primary">
              <Check className="h-4 w-4 stroke-white stroke-[3]" />
            </div>
            <div>
              <div className="text-[12px] font-bold text-ink">پرداخت موفق</div>
              <div className="text-[11px] text-ink-faint">عضویت طلایی</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
