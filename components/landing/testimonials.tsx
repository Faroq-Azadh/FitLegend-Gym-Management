export function LandingTestimonials() {
  const testimonials = [
    {
      id: 1,
      quote:
        "از وقتی فیتلجند را راه‌اندازی کردیم، نرخ تمدید عضویت‌مان ۲۰ درصد بالا رفت. دیگر هیچ مشتری به خاطر فراموشی تمدید از دست نمی‌رود و تیم ما وقتش را صرف کارهای مهم‌تر می‌کند.",
      name: "سامان رادمنش",
      role: "مدیر باشگاه پاورهاوس",
      lg: true,
    },
    {
      id: 2,
      quote:
        "داشبورد تحلیلی فیتلجند به من نشان می‌دهد کدام کلاس‌ها واقعاً سودآورند.",
      name: "نگار احمدی",
      role: "مدیر آیرون‌فیت",
      lg: false,
    },
    {
      id: 3,
      quote:
        "مربیان ما دیگر تداخل برنامه ندارند؛ همه‌چیز در یک تقویم هماهنگ است.",
      name: "آرش کریمی",
      role: "سرمربی اپکس کلاب",
      lg: false,
    },
    {
      id: 4,
      quote:
        "راه‌اندازی فقط نیم‌روز طول کشید و تیم بدون آموزش خاصی شروع به کار کرد.",
      name: "مریم توکلی",
      role: "مدیر نووا جیم",
      lg: false,
    },
    {
      id: 5,
      quote:
        "پرداخت آنلاین باعث شد دیگر هیچ معطلی برای دریافت شهریه نداشته باشیم.",
      name: "رضا یوسفی",
      role: "مدیر فیت‌لاین",
      lg: false,
    },
  ];

  return (
    <section id="testimonials" className="py-20 min-[640px]:py-[110px]">
      <div className="mx-auto max-w-[1240px] px-5 min-[640px]:px-8">
        <div className="mb-16 max-w-[640px]">
          <span className="mb-3.5 inline-block text-[13px] font-bold tracking-wide text-primary-dark">
            نظرات مشتریان
          </span>
          <h2 className="text-[28px] font-extrabold leading-[1.3] text-ink min-[640px]:text-[36px] min-[981px]:text-[42px]">
            باشگاه‌دارانی که با فیتلجند رشد کردند
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 min-[640px]:grid-cols-2 min-[981px]:grid-cols-[1.2fr_1fr_1fr]">
          {/* Main Large Card */}
          <div className="flex flex-col justify-between rounded-[16px] border border-[#D8F5E8] bg-tint p-7 shadow-sm min-[981px]:row-span-2 min-[981px]:p-[30px]">
            <div>
              <div className="mb-3.5 text-[36px] font-black leading-none text-primary">
                ”
              </div>
              <p className="mb-[22px] text-[17px] font-medium leading-[1.85] text-ink">
                {testimonials[0].quote}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-[42px] w-[42px] shrink-0 rounded-full bg-gradient-to-br from-cyan to-primary" />
              <div>
                <div className="text-[14px] font-bold text-ink">
                  {testimonials[0].name}
                </div>
                <div className="text-[12.5px] text-ink-faint">
                  {testimonials[0].role}
                </div>
              </div>
            </div>
          </div>

          {/* Standard Cards */}
          {testimonials.slice(1).map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-[16px] border border-border bg-surface p-7 shadow-sm min-[981px]:p-[30px]"
            >
              <div>
                <div className="mb-3.5 text-[36px] font-black leading-none text-primary">
                  ”
                </div>
                <p className="mb-[22px] text-[15px] font-medium leading-[1.85] text-ink">
                  {item.quote}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-[42px] w-[42px] shrink-0 rounded-full bg-gradient-to-br from-cyan to-primary" />
                <div>
                  <div className="text-[14px] font-bold text-ink">
                    {item.name}
                  </div>
                  <div className="text-[12.5px] text-ink-faint">
                    {item.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
