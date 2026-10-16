import Link from "next/link";

export function AboutCTA() {
  return (
    <section className="pb-20 min-[640px]:pb-[110px]">
      <div className="mx-auto max-w-[1240px] px-5 min-[640px]:px-8">
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#D94A10] via-[#F25C1F] to-[#0EA5E9] p-[56px_24px] text-center min-[640px]:p-[80px_60px]">
          <h2 className="relative z-10 mb-[18px] text-[28px] font-black text-white min-[640px]:text-[36px] min-[981px]:text-[44px]">
            باشگاه‌تان را همین امروز روی فیتلجند بیاورید
          </h2>
          <p className="relative z-10 mx-auto mb-[36px] max-w-[540px] text-[16px] text-white/95">
            با پلن رایگان شروع کنید. بدون کارت بانکی، بدون تماس فروش — حساب شما در
            همان لحظه ساخته می‌شود.
          </p>
          <Link
            href="/register-gym"
            className="relative z-10 inline-flex items-center justify-center rounded-[14px] btn-ink-gradient-soft px-[30px] py-[15px] text-[16px] font-bold text-white transition-all duration-200 hover:shadow-2xl"
          >
            ساخت حساب باشگاه
          </Link>
        </div>
      </div>
    </section>
  );
}
