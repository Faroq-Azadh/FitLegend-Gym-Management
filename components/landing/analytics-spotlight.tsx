import { Check } from "lucide-react";

export function LandingAnalyticsSpotlight() {
  const points = [
    "پیش‌بینی نرخ ریزش اعضا پیش از وقوع",
    "مقایسه عملکرد شعبه‌های مختلف در یک نگاه",
    "گزارش درآمد لحظه‌ای، بدون تأخیر در داده",
  ];

  return (
    <section id="analytics" className="py-20 min-[640px]:py-[110px]">
      <div className="mx-auto max-w-[1240px] px-5 min-[640px]:px-8">
        <div className="relative overflow-hidden rounded-[28px] bg-ink px-7 py-14 text-white min-[640px]:px-14 min-[981px]:p-[80px_60px]">
          {/* Background Radial Glow */}
          <div
            className="pointer-events-none absolute -left-[150px] -top-[150px] h-[500px] w-[500px] rounded-full blur-[40px]"
            style={{
              background:
                "radial-gradient(circle, rgba(22,224,160,0.18), transparent 70%)",
            }}
          />

          <div className="relative z-10 grid grid-cols-1 items-center gap-10 min-[981px]:grid-cols-2 min-[981px]:gap-[60px]">
            <div>
              <span className="mb-3.5 inline-block text-[13px] font-bold tracking-wide text-primary">
                تحلیل داده
              </span>
              <h2 className="mb-[18px] text-[26px] font-extrabold leading-[1.35] min-[640px]:text-[32px] min-[981px]:text-[38px]">
                عددها همه‌چیز را درباره باشگاه‌تان می‌گویند
              </h2>
              <p className="mb-[32px] text-[15.5px] leading-[1.8] text-[#CBD5E1]">
                فیتلجند هر رزرو، پرداخت و ورود را به یک تصویر روشن از سلامت باشگاه‌تان
                تبدیل می‌کند؛ بدون نیاز به اکسل یا تحلیل دستی.
              </p>
              <div className="flex flex-col gap-4">
                {points.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-primary/15">
                      <Check className="h-[11px] w-[11px] stroke-primary stroke-[3]" />
                    </span>
                    <span className="text-[14.5px] text-[#E2E8F0]">{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[18px] border border-white/10 bg-white/[0.04] p-7">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-[13px] font-bold text-white">
                  روند درآمد ماهانه
                </span>
                <span className="text-[20px] font-extrabold text-primary">
                  +۲۴٪
                </span>
              </div>
              <svg
                className="h-[140px] w-full"
                viewBox="0 0 400 140"
                fill="none"
              >
                <path
                  d="M0 100 L40 95 L60 60 L80 110 L100 50 L130 80 L150 40 L180 90 L210 30 L240 70 L270 25 L300 65 L330 20 L360 55 L400 15"
                  stroke="#16E0A0"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M0 100 L40 95 L60 60 L80 110 L100 50 L130 80 L150 40 L180 90 L210 30 L240 70 L270 25 L300 65 L330 20 L360 55 L400 15 L400 140 L0 140 Z"
                  fill="url(#bigPulseGrad)"
                />
                <defs>
                  <linearGradient id="bigPulseGrad" x1="0" y1="0" x2="0" y2="140">
                    <stop offset="0%" stopColor="#16E0A0" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#16E0A0" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
