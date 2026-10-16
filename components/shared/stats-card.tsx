export function StatsCard() {
  return (
    <div className="rounded-[var(--radius)] border border-white/10 bg-white/[0.06] p-[22px] backdrop-blur-[6px]">
      <div className="mb-[18px] flex items-center justify-between">
        <span className="text-[13px] font-bold text-white">عملکرد هفتگی</span>
        <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-bold text-primary">
          +۱۸٪
        </span>
      </div>

      <svg className="mb-3.5 h-20 w-full" viewBox="0 0 300 80" fill="none">
        <path
          d="M0 55 L30 55 L42 28 L54 62 L66 18 L78 50 L96 40 L114 58 L132 22 L150 45 L168 14 L186 52 L204 32 L222 55 L240 25 L258 45 L276 16 L300 36"
          stroke="#F25C1F"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M0 55 L30 55 L42 28 L54 62 L66 18 L78 50 L96 40 L114 58 L132 22 L150 45 L168 14 L186 52 L204 32 L222 55 L240 25 L258 45 L276 16 L300 36 L300 80 L0 80 Z"
          fill="url(#pulseGrad)"
          opacity="0.5"
        />
        <defs>
          <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="80">
            <stop offset="0%" stopColor="#F25C1F" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F25C1F" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex gap-2.5">
        <div className="flex-1 rounded-[10px] bg-white/[0.04] p-[11px]">
          <div className="text-base font-extrabold text-white">۱,۲۴۰</div>
          <div className="mt-0.5 text-[10.5px] text-[#94A3B8]">ورود این هفته</div>
        </div>
        <div className="flex-1 rounded-[10px] bg-white/[0.04] p-[11px]">
          <div className="text-base font-extrabold text-white">۸۶٪</div>
          <div className="mt-0.5 text-[10.5px] text-[#94A3B8]">نرخ تمدید</div>
        </div>
      </div>
    </div>
  );
}
