export function LandingTrustStrip() {
  const gymLogos = [
    "پاورهاوس",
    "آیرون‌فیت",
    "اپکس کلاب",
    "نووا جیم",
    "فیت‌لاین",
  ];

  return (
    <div className="mt-16 border-y border-border bg-surface py-7">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-5 px-5 min-[640px]:px-8">
        <span className="whitespace-nowrap text-[13px] font-semibold text-ink-faint">
          باشگاه‌های پیشرو که با فیتلجند کار می‌کنند
        </span>
        <div className="flex flex-wrap items-center gap-6 min-[640px]:gap-10">
          {gymLogos.map((name) => (
            <span
              key={name}
              className="text-[15px] font-bold text-ink-faint opacity-70"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
