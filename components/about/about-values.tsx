import { Zap, ShieldCheck, TrendingUp, Users } from "lucide-react";

export function AboutValues() {
  const values = [
    {
      icon: Zap,
      title: "سادگی، نه کم‌کاری",
      desc: "هر صفحه باید در نگاه اول قابل فهم باشد. اگر برای استفاده از بخشی از فیتلجند به آموزش نیاز باشد، آن بخش را بد طراحی کرده‌ایم و دوباره می‌سازیمش.",
    },
    {
      icon: ShieldCheck,
      title: "داده‌ی شما، مال شماست",
      desc: "اطلاعات اعضا و مالی باشگاه شما رمزنگاری می‌شود و هرگز فروخته یا با کسی به اشتراک گذاشته نمی‌شود. هر زمان بخواهید می‌توانید خروجی کامل بگیرید.",
    },
    {
      icon: TrendingUp,
      title: "تصمیم با داده، نه با حدس",
      desc: "هر عددی که در فیتلجند می‌بینید باید به یک تصمیم مشخص ختم شود. گزارشی که فقط قشنگ است و کاری با آن نمی‌شود کرد، گزارش نیست.",
    },
    {
      icon: Users,
      title: "کنار باشگاه‌دار، نه روبه‌رویش",
      desc: "پشتیبانی ما بخشی از محصول است، نه هزینه‌ای که باید کم شود. مسیر محصول را هم بر اساس چیزی می‌چینیم که باشگاه‌ها واقعاً از ما می‌خواهند.",
    },
  ];

  return (
    <section className="border-y border-border bg-surface py-20 min-[640px]:py-[110px]">
      <div className="mx-auto max-w-[1240px] px-5 min-[640px]:px-8">
        <div className="mx-auto mb-16 max-w-[640px] text-center">
          <span className="mb-3.5 inline-block text-[13px] font-bold tracking-wide text-primary-dark">
            اصول ما
          </span>
          <h2 className="mb-4 text-[28px] font-extrabold leading-[1.3] text-ink min-[640px]:text-[36px] min-[981px]:text-[42px]">
            چهار چیزی که سر آن‌ها کوتاه نمی‌آییم
          </h2>
          <p className="text-[16px] leading-[1.8] text-ink-soft">
            این‌ها شعار نیستند؛ معیارهایی هستند که با آن‌ها تصمیم می‌گیریم چه چیزی
            را بسازیم و چه چیزی را نسازیم.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 min-[640px]:grid-cols-2">
          {values.map((v, idx) => {
            const Icon = v.icon;
            return (
              <div
                key={idx}
                className="rounded-[20px] border-[1.5px] border-border bg-surface p-7 transition-all duration-200 hover:border-primary hover:shadow-md min-[640px]:p-[32px_28px]"
              >
                <div className="mb-[18px] flex h-[46px] w-[46px] items-center justify-center rounded-[13px] bg-tint text-primary-dark">
                  <Icon className="h-[22px] w-[22px] stroke-[2]" />
                </div>
                <h3 className="mb-[10px] text-[17px] font-extrabold text-ink">
                  {v.title}
                </h3>
                <p className="text-[14px] leading-[1.9] text-ink-soft">
                  {v.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
