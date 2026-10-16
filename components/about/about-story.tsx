export function AboutStory() {
  return (
    <section className="py-20 min-[640px]:py-[110px]">
      <div className="mx-auto max-w-[1240px] px-5 min-[640px]:px-8">
        <div className="grid grid-cols-1 items-center gap-10 min-[981px]:grid-cols-[1.05fr_0.95fr] min-[981px]:gap-[60px]">
          <div>
            <span className="mb-3.5 inline-block text-[13px] font-bold tracking-wide text-primary-dark">
              داستان ما
            </span>
            <h2 className="mb-5 text-[26px] font-extrabold leading-[1.35] text-ink min-[640px]:text-[32px] min-[981px]:text-[38px]">
              از یک دفترچه‌ی مچاله تا سیستمی که هزاران باشگاه به آن تکیه می‌کنند
            </h2>
            <p className="mb-4 text-[15.5px] leading-[2] text-ink-soft">
              سال‌ها پیش، یکی از ما مسئول پذیرش یک باشگاه بدنسازی بود. تمدید
              عضویت‌ها روی یک دفترچه ثبت می‌شد، برنامه‌های تمرینی روی کاغذ دست‌نویس
              بودند و هر ماه چند نفر بی‌سروصدا می‌رفتند، بی‌آنکه کسی متوجه شود.
            </p>
            <p className="mb-4 text-[15.5px] leading-[2] text-ink-soft">
              مشکل کمبود تلاش نبود. مشکل این بود که{" "}
              <strong className="font-bold text-ink">
                هیچ‌کس نمی‌دانست چه اتفاقی دارد می‌افتد
              </strong>
              . کدام عضو دو هفته است نیامده؟ کدام کلاس همیشه خالی است؟ درآمد این ماه
              نسبت به ماه قبل بهتر شده یا بدتر؟ پاسخ همه‌ی این سؤال‌ها جایی وجود
              داشت — فقط پراکنده بین چند دفتر، چند فایل اکسل و حافظه‌ی چند نفر.
            </p>
            <p className="text-[15.5px] leading-[2] text-ink-soft">
              فیتلجند را ساختیم تا این پراکندگی تمام شود. عضویت، رزرو کلاس، پرداخت،
              برنامه‌ی تمرینی و گزارش عملکرد، همه در یک جا — و مهم‌تر از همه، قابل
              فهم برای کسی که وقت ندارد با نرم‌افزار کلنجار برود.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[24px] bg-ink p-8 min-[640px]:p-[44px_38px]">
            {/* Glow */}
            <div
              className="pointer-events-none absolute -left-[100px] -top-[120px] h-[340px] w-[340px] rounded-full blur-[40px]"
              style={{
                background:
                  "radial-gradient(circle, rgba(242,92,31,0.22), transparent 70%)",
              }}
            />
            <div className="relative z-10 text-[52px] font-black leading-none text-primary">
              ”
            </div>
            <blockquote className="relative z-10 mb-6 text-[17px] font-bold leading-[1.95] text-white min-[640px]:text-[19px]">
              ما نرم‌افزار نمی‌فروشیم. وقتی را به باشگاه‌دار برمی‌گردانیم که
              قبلاً صرف کاغذبازی می‌شد.
            </blockquote>
            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan to-primary text-[14px] font-extrabold text-ink">
                ت
              </div>
              <div>
                <div className="text-[14px] font-bold text-white">تیم فیتلجند</div>
                <div className="text-[12.5px] text-ink-faint">کردستان، ایران</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
