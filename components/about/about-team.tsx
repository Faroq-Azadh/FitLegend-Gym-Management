import { ScrollReveal } from "@/components/shared/scroll-reveal";

export function AboutTeam() {
  const team = [
    {
      initials: "ا و",
      name: "اشکان وکیلی",
      role: "بنیان‌گذار و مدیرعامل بک‌ند",
    },
    {
      initials: "ف آ",
      name: "فاروق آزاده",
      role: "معاون اجرایی فرانت‌ند",
    },
    {
      initials: "س ج",
      name: "سهیل جوانمردی",
      role: "توسعه‌دهنده بک‌ند",
    },
  ];

  return (
    <section className="border-y border-border bg-surface py-20 min-[640px]:py-[110px]">
      <div className="mx-auto max-w-[1240px] px-5 min-[640px]:px-8">
        <ScrollReveal className="mx-auto mb-16 max-w-[640px] text-center">
          <span className="mb-3.5 inline-block text-[13px] font-bold tracking-wide text-primary-dark">
            تیم ما
          </span>
          <h2 className="mb-4 text-[28px] font-extrabold leading-[1.3] text-ink min-[640px]:text-[36px] min-[981px]:text-[42px]">
            آدم‌هایی که پشت فیتلجند هستند
          </h2>
          <p className="text-[16px] leading-[1.8] text-ink-soft">
            تیمی کوچک از مهندس، طراح و آدم‌هایی که خودشان سال‌ها در باشگاه کار
            کرده‌اند.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-5 min-[640px]:grid-cols-3 min-[981px]:grid-cols-3 min-[981px]:gap-[22px]">
          {team.map((m, idx) => (
            <ScrollReveal key={idx} delay={idx * 0.1}>
              <div className="rounded-[20px] border-[1.5px] border-border bg-surface p-[30px_22px] text-center transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-md">
                <div className="mx-auto mb-4 flex h-[74px] w-[74px] items-center justify-center rounded-full bg-gradient-to-br from-cyan to-primary text-[24px] font-black text-ink">
                  {m.initials}
                </div>
                <div className="mb-1 text-[15.5px] font-extrabold text-ink">
                  {m.name}
                </div>
                <div className="text-[13px] font-semibold text-ink-faint">
                  {m.role}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
