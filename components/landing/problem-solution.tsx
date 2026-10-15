import { AlertTriangle, Check } from "lucide-react";
import { ScrollReveal } from "@/components/shared/scroll-reveal";

export function LandingProblemSolution() {
  const problems = [
    <>
      پیگیری دستی <b>تمدید عضویت‌ها</b> در اکسل، فراموشی و ریزش مشتری
    </>,
    <>
      تداخل رزرو کلاس‌ها به دلیل <b>هماهنگ‌نبودن تقویم مربیان</b>
    </>,
    <>
      هیچ دید روشنی از <b>عملکرد مالی واقعی</b> باشگاه در هر ماه
    </>,
  ];

  const solutions = [
    <>
      یادآوری خودکار تمدید و <b>پرداخت آنلاین یکپارچه</b>؛ بدون پیگیری دستی
    </>,
    <>
      تقویم واحد برای همه مربیان با <b>جلوگیری خودکار از تداخل</b>
    </>,
    <>
      داشبورد زنده با <b>گزارش درآمد، حضور و رشد</b> در هر لحظه
    </>,
  ];

  return (
    <section className="py-20 min-[640px]:py-[110px]">
      <div className="mx-auto max-w-[1240px] px-5 min-[640px]:px-8">
        <ScrollReveal className="mb-16 max-w-[640px]">
          <span className="mb-3.5 inline-block text-[13px] font-bold tracking-wide text-primary-dark">
            چرا فیتلجند
          </span>
          <h2 className="mb-4 text-[28px] font-extrabold leading-[1.3] text-ink min-[640px]:text-[36px] min-[981px]:text-[42px]">
            مدیریت باشگاه نباید این‌قدر پیچیده باشد
          </h2>
          <p className="text-[16px] leading-[1.8] text-ink-soft">
            اکسل، کاغذ و چند اپلیکیشن جدا از هم، کار شما را کند می‌کنند. فیتلجند همه را در
            یک جا جمع می‌کند.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-12 min-[981px]:grid-cols-[0.85fr_1.15fr]">
          {/* PROBLEM COLUMN */}
          <ScrollReveal>
            <h3 className="mb-6 flex items-center gap-2.5 text-[14px] font-bold text-ink-faint">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              وضعیت فعلی
            </h3>
            <div className="flex flex-col gap-4">
              {problems.map((text, idx) => (
                <div
                  key={idx}
                  className="flex gap-3.5 rounded-[14px] bg-red-50 p-[18px]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-red-100">
                    <AlertTriangle className="h-4 w-4 stroke-red-500" />
                  </div>
                  <p className="text-[14.5px] font-medium leading-[1.7] text-ink-soft">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* SOLUTION COLUMN */}
          <ScrollReveal delay={0.15}>
            <h3 className="mb-6 flex items-center gap-2.5 text-[14px] font-bold text-ink-faint">
              <span className="h-2 w-2 rounded-full bg-primary" />
              با فیتلجند
            </h3>
            <div className="flex flex-col gap-4">
              {solutions.map((text, idx) => (
                <div
                  key={idx}
                  className="flex gap-3.5 rounded-[14px] border border-border bg-surface p-[18px] shadow-sm"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-tint">
                    <Check className="h-4 w-4 stroke-primary-dark" />
                  </div>
                  <p className="text-[14.5px] font-medium leading-[1.7] text-ink-soft">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
