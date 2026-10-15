import Link from "next/link";
import { ScrollReveal } from "@/components/shared/scroll-reveal";

export function AboutHero() {
  return (
    <section className="pt-24 pb-16 text-center min-[981px]:pt-[150px] min-[981px]:pb-[90px]">
      <div className="mx-auto max-w-[1240px] px-5 min-[640px]:px-8">
        <ScrollReveal>
          <span className="mb-3.5 inline-block text-[13px] font-bold tracking-wide text-primary-dark">
            درباره‌ی ما
          </span>
          <h1 className="mx-auto mb-5 max-w-[800px] text-[32px] font-black leading-[1.28] text-ink min-[640px]:text-[42px] min-[981px]:text-[54px]">
            ما ابزاری ساختیم که خودمان دلمان می‌خواست داشته باشیم
          </h1>
          <p className="mx-auto mb-9 max-w-[660px] text-[17px] leading-[1.9] text-ink-soft">
            فیتلجند از یک مشاهده‌ی ساده شروع شد: باشگاه‌داران ایرانی وقت‌شان را صرف
            دفتر و اکسل و پیام‌های پراکنده می‌کنند، نه صرف چیزی که واقعاً برایشان
            مهم است — رشد باشگاه و پیشرفت ورزشکاران.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <Link
              href="/register-gym"
              className="flex items-center justify-center rounded-[14px] bg-ink px-[30px] py-[15px] text-[16px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-emerald"
            >
              شروع رایگان
            </Link>
            <Link
              href="/#pricing"
              className="flex items-center justify-center rounded-[14px] border-[1.5px] border-border bg-surface px-[30px] py-[15px] text-[16px] font-bold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-tint hover:shadow-md"
            >
              مشاهده‌ی تعرفه‌ها
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
