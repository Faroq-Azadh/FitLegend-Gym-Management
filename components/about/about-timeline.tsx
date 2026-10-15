export function AboutTimeline() {
  const timeline = [
    {
      num: "۱",
      year: "۱۴۰۲",
      title: "شروع با یک باشگاه",
      desc: "اولین نسخه‌ی فیتلجند فقط عضویت و تمدید را مدیریت می‌کرد و در یک باشگاه در تهران استفاده می‌شد. همان‌جا فهمیدیم چه چیزهایی واقعاً لازم است و چه چیزهایی فقط به‌نظر لازم می‌آیند.",
      now: false,
    },
    {
      num: "۲",
      year: "۱۴۰۳",
      title: "رزرو کلاس و پرداخت آنلاین",
      desc: "باشگاه‌ها خواستند اعضا خودشان کلاس رزرو کنند و شهریه را آنلاین بپردازند. فیتلجند از یک ابزار داخلی به سیستمی تبدیل شد که ورزشکاران هم مستقیم با آن کار می‌کنند.",
      now: false,
    },
    {
      num: "۳",
      year: "۱۴۰۴",
      title: "پنل مربی و برنامه‌ی تمرینی",
      desc: "مربیان توانستند برنامه بسازند، پیشرفت شاگردان را دنبال کنند و بازخورد بدهند — بدون واسطه و بدون کاغذ.",
      now: false,
    },
    {
      num: "۴",
      year: "امروز",
      title: "پلن رایگان برای باشگاه‌های کوچک",
      desc: "باور داریم اندازه‌ی باشگاه نباید تعیین کند چه کسی به ابزار درست دسترسی دارد. حالا هر باشگاهی می‌تواند بدون هیچ هزینه‌ای شروع کند و فقط وقتی رشد کرد، هزینه بدهد.",
      now: true,
    },
  ];

  return (
    <section className="py-20 min-[640px]:py-[110px]">
      <div className="mx-auto max-w-[1240px] px-5 min-[640px]:px-8">
        <div className="mx-auto mb-16 max-w-[640px] text-center">
          <span className="mb-3.5 inline-block text-[13px] font-bold tracking-wide text-primary-dark">
            مسیر ما
          </span>
          <h2 className="text-[28px] font-extrabold leading-[1.3] text-ink min-[640px]:text-[36px] min-[981px]:text-[42px]">
            چطور به اینجا رسیدیم
          </h2>
        </div>

        <div className="relative mx-auto max-w-[760px]">
          {/* Vertical Line */}
          <div className="absolute right-[19px] top-2 bottom-2 w-0.5 bg-border" />

          <div className="flex flex-col gap-9">
            {timeline.map((item, idx) => (
              <div key={idx} className="relative pr-[52px] min-[640px]:pr-[60px]">
                <div
                  className={`absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-[12px] text-[14px] font-extrabold z-10 ${
                    item.now
                      ? "bg-primary text-ink"
                      : "bg-ink text-white"
                  }`}
                >
                  {item.num}
                </div>
                <div className="mb-1.5 text-[12.5px] font-bold text-primary-dark">
                  {item.year}
                </div>
                <h3 className="mb-2 text-[16.5px] font-extrabold text-ink">
                  {item.title}
                </h3>
                <p className="text-[14px] leading-[1.9] text-ink-soft">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
