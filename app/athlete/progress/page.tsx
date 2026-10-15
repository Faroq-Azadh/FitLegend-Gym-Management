"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { toPersianDigits, normalizeDigits } from "@/lib/persian-digits";
import { AthleteSidebar } from "@/components/athlete/athlete-sidebar";
import { AthleteTopbar } from "@/components/athlete/athlete-topbar";

export interface MeasurementEntry {
  date: string; // YYYY-MM-DD
  weight: number;
  bmi?: number | null;
  fat?: number | null;
  chest?: number | null;
  waist?: number | null;
  arm?: number | null;
  thigh?: number | null;
}

const INITIAL_ENTRIES: MeasurementEntry[] = [
  { date: "2026-04-02", weight: 74, bmi: 24.2, fat: 24, chest: 99, waist: 86, arm: 34, thigh: 56 },
  { date: "2026-04-20", weight: 72.5, bmi: 23.7, fat: 23, chest: 100, waist: 84, arm: 34.5, thigh: 56.5 },
  { date: "2026-05-08", weight: 71, bmi: 23.2, fat: 21.5, chest: 100, waist: 82, arm: 35, thigh: 57 },
  { date: "2026-05-28", weight: 70, bmi: 22.9, fat: 20, chest: 101, waist: 80, arm: 35.5, thigh: 57.5 },
  { date: "2026-06-15", weight: 69, bmi: 22.5, fat: 19, chest: 101.5, waist: 79, arm: 36, thigh: 58 },
  { date: "2026-06-28", weight: 68, bmi: 22.2, fat: 18, chest: 102, waist: 78, arm: 36, thigh: 58 },
];

type MetricKey = "weight" | "bmi" | "fat" | "chest" | "waist" | "arm";

interface MetricConfig {
  label: string;
  unit: string;
  betterDown: boolean;
}

const METRICS_CONFIG: Record<MetricKey, MetricConfig> = {
  weight: { label: "وزن (کیلوگرم)", unit: "کیلو", betterDown: true },
  bmi: { label: "شاخص توده بدنی (BMI)", unit: "واحد", betterDown: true },
  fat: { label: "چربی بدن (٪)", unit: "٪", betterDown: true },
  chest: { label: "دور سینه (سانتی‌متر)", unit: "سانتی‌متر", betterDown: false },
  waist: { label: "دور کمر (سانتی‌متر)", unit: "سانتی‌متر", betterDown: true },
  arm: { label: "دور بازو (سانتی‌متر)", unit: "سانتی‌متر", betterDown: false },
};

function formatPersianDate(isoDate: string) {
  try {
    const d = new Date(isoDate + "T00:00:00");
    const formatted = new Intl.DateTimeFormat("fa-IR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
    return toPersianDigits(formatted);
  } catch {
    return toPersianDigits(isoDate);
  }
}

function formatPersianShortDate(isoDate: string) {
  try {
    const d = new Date(isoDate + "T00:00:00");
    const formatted = new Intl.DateTimeFormat("fa-IR", {
      day: "numeric",
      month: "short",
    }).format(d);
    return toPersianDigits(formatted);
  } catch {
    return toPersianDigits(isoDate);
  }
}

function formatPersianMonth(isoDate: string) {
  try {
    const d = new Date(isoDate + "T00:00:00");
    const formatted = new Intl.DateTimeFormat("fa-IR", {
      month: "long",
    }).format(d);
    return toPersianDigits(formatted);
  } catch {
    return toPersianDigits(isoDate);
  }
}

function parseNum(val: string): number | null {
  if (!val || !val.trim()) return null;
  const normalized = normalizeDigits(val).replace(/٫/g, ".").replace(/,/g, ".").trim();
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? null : parsed;
}

function getBmi(weight: number, heightCm: number): number {
  if (!weight || !heightCm) return 0;
  const h = heightCm / 100;
  return Number((weight / (h * h)).toFixed(1));
}

function getBmiInfo(bmi: number) {
  if (bmi <= 0) {
    return {
      category: "نامشخص",
      statusClass: "neutral",
      badgeText: "نامشخص",
      isGood: false,
      goodVerdict: "—",
      description: "لطفاً وزن و قد معتبر وارد نمایید.",
    };
  }
  if (bmi < 18.5) {
    return {
      category: "کمبود وزن",
      statusClass: "underweight",
      badgeText: "کمبود وزن",
      isGood: false,
      goodVerdict: "نیاز به تقویت و افزایش وزن سالم",
      description:
        "شاخص توده بدنی شما کمتر از ۱۸٫۵ است که بر اساس استاندارد جهانی بهداشت (WHO) نشان‌دهنده کمبود وزن است. برای رسیدن به محدوده سلامت، تمرینات هایپرتروفی قدرتی همراه با رژیم غذایی پرکالری و غنی از پروتئین توصیه می‌شود.",
    };
  }
  if (bmi <= 24.9) {
    return {
      category: "وزن نرمال و ایده‌آل",
      statusClass: "ideal",
      badgeText: "عالی و ایده‌آل",
      isGood: true,
      goodVerdict: "بسیار عالی و استاندارد (محدوده سلامت کامل)",
      description:
        "وضعیت شما بسیار عالی است! بر اساس استانداردهای سازمان جهانی بهداشت (WHO)، شاخص شما در بازه وزن سلامت ایده‌آل (۱۸٫۵ تا ۲۴٫۹) قرار دارد که با کمترین خطر قلبی-عروقی و بالاترین کارایی بدنی همراه است. ادامه تمرینات فعلی و تغذیه سالم برای تثبیت پیشنهاد می‌شود.",
    };
  }
  if (bmi <= 29.9) {
    return {
      category: "اضافه وزن ملایم",
      statusClass: "overweight",
      badgeText: "اضافه وزن",
      isGood: false,
      goodVerdict: "قابل قبول (نیازمند کنترل چربی و کالری)",
      description:
        "شاخص در بازه ۲۵ تا ۲۹٫۹ (اضافه وزن ملایم) قرار دارد. در صورت داشتن حجم عضلانی بالا این عدد در ورزشکاران طبیعی است؛ در غیر این صورت افزودن تمرینات هوازی و کاهش کالری مازاد برای بازگشت به محدوده ایده‌آل پیشنهاد می‌شود.",
    };
  }
  return {
    category: "چاقی",
    statusClass: "obese",
    badgeText: "چاقی",
    isGood: false,
    goodVerdict: "نامناسب (نیازمند برنامه کاهش وزن زیر نظر مربی)",
    description:
      "شاخص ۳۰ یا بیشتر بیانگر چاقی است. برای حفظ سلامت مفاصل و سلامت عمومی، کاهش تدریجی و اصولی وزن زیر نظر مربیان فیتلجند و اصلاح تغذیه اکیداً توصیه می‌شود.",
  };
}

export interface MonthlyBmiItem {
  monthKey: string;
  monthName: string;
  date: string;
  weight: number;
  fat: number | null;
  bmi: number;
  deltaText: string;
  deltaNum: number;
  trendGood: boolean;
  healthyRangeText: string;
  idealDiffText: string;
  idealStatusBadge: string;
  idealStatusColor: string;
  recommendation: string;
  info: ReturnType<typeof getBmiInfo>;
}

export default function AthleteProgressPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [entries, setEntries] = useState<MeasurementEntry[]>(INITIAL_ENTRIES);
  const [activeRange, setActiveRange] = useState<number>(90);
  const [activeMetric, setActiveMetric] = useState<MetricKey>("weight");
  const [heightCm, setHeightCm] = useState<number>(175);

  // Selected month key for BMI modal (reactive to height changes)
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);

  // Success / Error alerts for form
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const formCardRef = useRef<HTMLDivElement>(null);

  // Form states
  const [fDate, setFDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [fWeight, setFWeight] = useState<string>("");
  const [fBmi, setFBmi] = useState<string>("");
  const [fFat, setFFat] = useState<string>("");
  const [fChest, setFChest] = useState<string>("");
  const [fWaist, setFWaist] = useState<string>("");
  const [fArm, setFArm] = useState<string>("");
  const [fThigh, setFThigh] = useState<string>("");
  const [editingDate, setEditingDate] = useState<string | null>(null);

  // BMI Calculator Modal states
  const [showBmiCalcModal, setShowBmiCalcModal] = useState<boolean>(false);
  const [bmiCalcWeight, setBmiCalcWeight] = useState<string>("");
  const [bmiCalcHeight, setBmiCalcHeight] = useState<string>("175");

  // Real-time calculated BMI inside calculator modal
  const liveCalcBmi = useMemo(() => {
    const w = parseNum(bmiCalcWeight);
    const h = parseNum(bmiCalcHeight);
    if (!w || !h || h <= 0) return null;
    const hM = h / 100;
    const val = Number((w / (hM * hM)).toFixed(1));
    return {
      bmi: val,
      info: getBmiInfo(val),
    };
  }, [bmiCalcWeight, bmiCalcHeight]);

  const applyCalculatedBmi = () => {
    if (liveCalcBmi) {
      setFBmi(String(liveCalcBmi.bmi));
      if (!fWeight && bmiCalcWeight) {
        setFWeight(bmiCalcWeight);
      }
      const h = parseNum(bmiCalcHeight);
      if (h && h > 0) {
        setHeightCm(h);
      }
    }
    setShowBmiCalcModal(false);
  };

  // Chronologically sorted entries
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }, [entries]);

  // Entries filtered by time range (90, 180, 365 days)
  const rangeFilteredEntries = useMemo(() => {
    if (!sortedEntries.length) return [];
    const lastDate = new Date(sortedEntries[sortedEntries.length - 1].date + "T00:00:00").getTime();
    const cutoff = lastDate - activeRange * 86400000;
    const filtered = sortedEntries.filter(
      (e) => new Date(e.date + "T00:00:00").getTime() >= cutoff
    );
    return filtered.length >= 2 ? filtered : sortedEntries;
  }, [sortedEntries, activeRange]);

  // Computed KPIs
  const kpiData = useMemo(() => {
    const wEntries = sortedEntries.filter((e) => e.weight !== null && e.weight !== undefined);
    const firstW = wEntries.length ? wEntries[0].weight : null;
    const lastW = wEntries.length ? wEntries[wEntries.length - 1].weight : null;
    const wDelta = firstW !== null && lastW !== null ? lastW - firstW : null;

    let lastFat: number | null = null;
    for (let i = sortedEntries.length - 1; i >= 0; i--) {
      if (sortedEntries[i].fat !== null && sortedEntries[i].fat !== undefined) {
        lastFat = sortedEntries[i].fat as number;
        break;
      }
    }

    const lastDate = sortedEntries.length ? sortedEntries[sortedEntries.length - 1].date : null;

    const trend = (delta: number | null, betterDown = true) => {
      if (delta === null || delta === 0) {
        return { cls: "flat", txt: "بدون تغییر", isUp: false };
      }
      const good = betterDown ? delta < 0 : delta > 0;
      return {
        cls: good ? "up" : "down",
        txt: `${delta > 0 ? "+" : ""}${toPersianDigits(delta.toFixed(1))} کیلو`,
        isUp: delta < 0,
      };
    };

    const wTrend = trend(wDelta, true);

    return {
      lastW,
      wDelta,
      wTrend,
      lastFat,
      lastDate,
      totalCount: sortedEntries.length,
    };
  }, [sortedEntries]);

  // Monthly BMI aggregation & rich data
  const monthlyBmiData: MonthlyBmiItem[] = useMemo(() => {
    const monthGroups: Record<string, MeasurementEntry[]> = {};
    sortedEntries.forEach((e) => {
      const ym = e.date.slice(0, 7);
      if (!monthGroups[ym]) monthGroups[ym] = [];
      monthGroups[ym].push(e);
    });

    const months = Object.keys(monthGroups).sort();
    let prevBmi: number | null = null;

    const hM = heightCm / 100;
    const minHealthyWeight = (18.5 * hM * hM).toFixed(1);
    const maxHealthyWeight = (24.9 * hM * hM).toFixed(1);
    const healthyRangeText = `${toPersianDigits(minHealthyWeight)} تا ${toPersianDigits(maxHealthyWeight)} کیلو`;

    return months.map((ym) => {
      const group = monthGroups[ym];
      const latestInMonth = group[group.length - 1];
      const w = latestInMonth.weight;
      const latestFat = latestInMonth.fat ?? null;
      const bmi = latestInMonth.bmi ?? getBmi(w, heightCm);
      const info = getBmiInfo(bmi);

      let deltaText = "—";
      let deltaNum = 0;
      let trendGood = true;

      if (prevBmi !== null) {
        deltaNum = Number((bmi - prevBmi).toFixed(1));
        if (deltaNum === 0) {
          deltaText = "بدون تغییر";
        } else {
          deltaText = `${deltaNum > 0 ? "+" : ""}${toPersianDigits(deltaNum.toFixed(1))}`;
          trendGood = deltaNum < 0;
        }
      }

      prevBmi = bmi;

      const minHW = Number(minHealthyWeight);
      const maxHW = Number(maxHealthyWeight);

      let idealDiffText = "";
      let idealStatusBadge = "";
      let idealStatusColor = "";
      let recommendation = "";

      if (bmi < 18.5) {
        const diff = (minHW - w).toFixed(1);
        idealDiffText = `${toPersianDigits(diff)} کیلو تا حداقل سلامت`;
        idealStatusBadge = "زیر حد نرمال";
        idealStatusColor = "#0284C7";
        recommendation = "تمرکز بر رژیم پرکالری غنی از پروتئین همراه با تمرینات هایپرتروفی قدرتی برای افزایش توده عضلانی";
      } else if (bmi <= 24.9) {
        idealDiffText = "در محدوده سلامت کامل و بهینه";
        idealStatusBadge = "کاملاً ایده‌آل";
        idealStatusColor = "#059669";
        recommendation = "ادامه برنامه تمرینی ترکیبی و تثبیت وضعیت عالی تغذیه‌ای برای حفظ نسبت چربی به عضله";
      } else if (bmi <= 29.9) {
        const diff = (w - maxHW).toFixed(1);
        idealDiffText = `${toPersianDigits(diff)} کیلو بالاتر از حد سلامت`;
        idealStatusBadge = "اضافه وزن ملایم";
        idealStatusColor = "#D97706";
        recommendation = "کنترل کالری مازاد، تنظیم کربوهیدرات و افزودن جلسات هوازی (کاردیو و HIIT) ۲ الی ۳ جلسه در هفته";
      } else {
        const diff = (w - maxHW).toFixed(1);
        idealDiffText = `${toPersianDigits(diff)} کیلو مازاد وزن`;
        idealStatusBadge = "چاقی (نیازمند اصلاح)";
        idealStatusColor = "#E11D48";
        recommendation = "اجرای برنامه کاهش وزن تدریجی زیر نظر مستقیم مربی فیتلجند، کاهش چربی اشباع و پیاده‌روی روزانه";
      }

      return {
        monthKey: ym,
        monthName: formatPersianMonth(latestInMonth.date),
        date: latestInMonth.date,
        weight: w,
        fat: latestFat,
        bmi,
        deltaText,
        deltaNum,
        trendGood,
        healthyRangeText,
        idealDiffText,
        idealStatusBadge,
        idealStatusColor,
        recommendation,
        info,
      };
    });
  }, [sortedEntries, heightCm]);

  // Active selected BMI item for modal (reactive to heightCm changes)
  const activeSelectedBmi = useMemo(() => {
    if (!selectedMonthKey) return null;
    return monthlyBmiData.find((m) => m.monthKey === selectedMonthKey) || null;
  }, [selectedMonthKey, monthlyBmiData]);

  // Chart data extraction
  const chartPoints = useMemo(() => {
    return rangeFilteredEntries
      .map((e) => {
        let val: number | null = null;
        if (activeMetric === "bmi") {
          val = e.bmi ?? getBmi(e.weight, heightCm);
        } else {
          const v = e[activeMetric];
          val = v !== null && v !== undefined ? Number(v) : null;
        }
        return {
          date: e.date,
          val,
        };
      })
      .filter((p) => p.val !== null) as { date: string; val: number }[];
  }, [rangeFilteredEntries, activeMetric, heightCm]);

  // Dynamic Persian summary for chart hint
  const chartSummaryHint = useMemo(() => {
    if (chartPoints.length < 2) {
      return `روند تغییرات ${METRICS_CONFIG[activeMetric].label} در طول زمان`;
    }
    const first = chartPoints[0].val;
    const last = chartPoints[chartPoints.length - 1].val;
    const diff = last - first;
    const sign = diff > 0 ? "+" : "";
    const unit = METRICS_CONFIG[activeMetric].unit;
    return `از ${toPersianDigits(first.toFixed(1))} به ${toPersianDigits(last.toFixed(1))} ${unit} · تغییر کل: ${toPersianDigits(sign + diff.toFixed(1))} ${unit}`;
  }, [chartPoints, activeMetric]);

  // Form submit handler
  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!fDate) {
      setFormError("لطفاً تاریخ را وارد کنید.");
      return;
    }
    const weightNum = parseNum(fWeight);
    if (weightNum === null || weightNum <= 0) {
      setFormError("لطفاً وزن معتبر را وارد کنید (مثال: ۶۸٫۰).");
      return;
    }

    const explicitBmi = parseNum(fBmi);
    const finalBmi = explicitBmi !== null && explicitBmi > 0 ? explicitBmi : getBmi(weightNum, heightCm);

    const newRecord: MeasurementEntry = {
      date: fDate,
      weight: weightNum,
      bmi: finalBmi,
      fat: parseNum(fFat),
      chest: parseNum(fChest),
      waist: parseNum(fWaist),
      arm: parseNum(fArm),
      thigh: parseNum(fThigh),
    };

    setEntries((prev) => {
      if (editingDate) {
        const idx = prev.findIndex((item) => item.date === editingDate);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = newRecord;
          return updated;
        }
      }
      const idx = prev.findIndex((item) => item.date === fDate);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newRecord;
        return updated;
      }
      return [...prev, newRecord];
    });

    const wasEditing = !!editingDate;
    setEditingDate(null);

    // Reset fields except date
    setFWeight("");
    setFBmi("");
    setFFat("");
    setFChest("");
    setFWaist("");
    setFArm("");
    setFThigh("");

    setFormSuccess(
      wasEditing
        ? "تغییرات اندازه‌گیری با موفقیت ذخیره شد ✓"
        : "اندازه‌گیری جدید با موفقیت در پرونده ثبت شد ✓"
    );
  };

  useEffect(() => {
    if (formSuccess) {
      const t = setTimeout(() => setFormSuccess(null), 3500);
      return () => clearTimeout(t);
    }
  }, [formSuccess]);

  const handleResetForm = () => {
    setEditingDate(null);
    setFWeight("");
    setFBmi("");
    setFFat("");
    setFChest("");
    setFWaist("");
    setFArm("");
    setFThigh("");
    setFormError(null);
    setFDate(new Date().toISOString().slice(0, 10));
  };

  const handleEditEntry = (entry: MeasurementEntry) => {
    setEditingDate(entry.date);
    setFDate(entry.date);
    setFWeight(String(entry.weight));
    setFBmi(entry.bmi ? String(entry.bmi) : "");
    setFFat(entry.fat !== null && entry.fat !== undefined ? String(entry.fat) : "");
    setFChest(entry.chest !== null && entry.chest !== undefined ? String(entry.chest) : "");
    setFWaist(entry.waist !== null && entry.waist !== undefined ? String(entry.waist) : "");
    setFArm(entry.arm !== null && entry.arm !== undefined ? String(entry.arm) : "");
    setFThigh(entry.thigh !== null && entry.thigh !== undefined ? String(entry.thigh) : "");
    setFormError(null);
    setFormSuccess(`اطلاعات ثبت‌شده برای تاریخ ${formatPersianDate(entry.date)} در فرم بارگذاری شد؛ می‌توانید ویرایش کرده و دکمه ثبت را بزنید.`);
    if (formCardRef.current) {
      formCardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      const weightInput = document.getElementById("fWeight");
      if (weightInput) weightInput.focus();
    }
  };

  const handleDeleteEntry = (date: string) => {
    if (entries.length <= 1) {
      alert("حداقل یک رکورد باید در تاریخچه باقی بماند.");
      return;
    }
    if (window.confirm(`آیا از حذف اندازه‌گیری تاریخ ${formatPersianDate(date)} مطمئن هستید؟`)) {
      setEntries((prev) => prev.filter((item) => item.date !== date));
      if (editingDate === date) {
        handleResetForm();
      }
      setFormSuccess("اندازه‌گیری موردنظر با موفقیت حذف شد.");
    }
  };

  const scrollToForm = () => {
    if (formCardRef.current) {
      formCardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      const weightInput = document.getElementById("fWeight");
      if (weightInput) weightInput.focus();
    }
  };

  // SVG Chart Dimensions & Math
  const W = 720;
  const H = 220;
  const padT = 24;
  const padB = 20;

  const chartMath = useMemo(() => {
    if (chartPoints.length < 2) return null;
    const vals = chartPoints.map((p) => p.val);
    let min = Math.min(...vals);
    let max = Math.max(...vals);
    if (min === max) {
      min -= 1;
      max += 1;
    }
    const span = max - min;
    const pad = span * 0.15;
    min -= pad;
    max += pad;

    const getX = (i: number) =>
      chartPoints.length === 1 ? W / 2 : (i / (chartPoints.length - 1)) * W;
    const getY = (v: number) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);

    let linePath = "";
    let areaPath = "";

    chartPoints.forEach((p, i) => {
      const px = getX(i).toFixed(1);
      const py = getY(p.val).toFixed(1);
      linePath += (i === 0 ? "M" : " L ") + px + " " + py;
      areaPath += (i === 0 ? "M" : " L ") + px + " " + py;
    });

    areaPath += ` L ${W} ${H} L 0 ${H} Z`;

    const gridLines = [0.25, 0.5, 0.75].map((frac) => padT + frac * (H - padT - padB));

    return {
      min,
      max,
      linePath,
      areaPath,
      gridLines,
      getX,
      getY,
    };
  }, [chartPoints]);

  return (
    <div className="app">
      <AthleteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <AthleteTopbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="content">
          {/* Page Head */}
          <div className="page-head">
            <div>
              <h1>روند پیشرفت من</h1>
              <div className="sub">
                وزن و اندازه‌های بدنی‌ات رو در هر تاریخ ثبت کن و نمودار پیشرفتت رو ببین
              </div>
            </div>
            <div className="page-head-actions">
              <div className="seg" id="rangeSeg">
                <button
                  type="button"
                  className={activeRange === 365 ? "active" : ""}
                  onClick={() => setActiveRange(365)}
                >
                  سال
                </button>
                <button
                  type="button"
                  className={activeRange === 180 ? "active" : ""}
                  onClick={() => setActiveRange(180)}
                >
                  ۶ ماه
                </button>
                <button
                  type="button"
                  className={activeRange === 90 ? "active" : ""}
                  onClick={() => setActiveRange(90)}
                >
                  ۳ ماه
                </button>
              </div>
              <button
                type="button"
                onClick={scrollToForm}
                className="btn btn-primary btn-sm"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: 16, height: 16 }}
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                ثبت اندازه‌گیری جدید
              </button>
            </div>
          </div>

          {/* Computed KPIs */}
          <div className="kpi-grid">
            {/* Card 1: Current Weight */}
            <div className="card kpi">
              <div className="kpi-top">
                <span className="kpi-ico">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </span>
                <span className={`kpi-trend ${kpiData.wTrend.cls}`}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {kpiData.wTrend.isUp ? (
                      <path d="m6 9 6 6 6-6" />
                    ) : (
                      <path d="m6 15 6-6 6 6" />
                    )}
                  </svg>
                  {kpiData.wTrend.txt}
                </span>
              </div>
              <div className="v">
                {kpiData.lastW !== null ? (
                  <>
                    {toPersianDigits(kpiData.lastW)}{" "}
                    <span style={{ fontSize: "15px", color: "var(--ink-faint)", fontWeight: 600 }}>
                      کیلو
                    </span>
                  </>
                ) : (
                  "—"
                )}
              </div>
              <div className="l">وزن فعلی</div>
            </div>

            {/* Card 2: Total Weight Change */}
            <div className="card kpi">
              <div className="kpi-top">
                <span className="kpi-ico">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </span>
                <span
                  className={`kpi-trend ${kpiData.wDelta !== null && kpiData.wDelta < 0 ? "up" : "down"
                    }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {kpiData.wDelta !== null && kpiData.wDelta < 0 ? (
                      <path d="m6 9 6 6 6-6" />
                    ) : (
                      <path d="m6 15 6-6 6 6" />
                    )}
                  </svg>
                  {kpiData.wDelta !== null
                    ? `${kpiData.wDelta > 0 ? "+" : ""}${toPersianDigits(
                      kpiData.wDelta.toFixed(1)
                    )}`
                    : "—"}
                </span>
              </div>
              <div className="v">
                {kpiData.wDelta !== null ? (
                  <>
                    {kpiData.wDelta > 0 ? "+" : ""}
                    {toPersianDigits(kpiData.wDelta.toFixed(1))}{" "}
                    <span style={{ fontSize: "15px", color: "var(--ink-faint)", fontWeight: 600 }}>
                      کیلو
                    </span>
                  </>
                ) : (
                  "—"
                )}
              </div>
              <div className="l">تغییر کل وزن</div>
            </div>

            {/* Card 3: Body Fat */}
            <div className="card kpi">
              <div className="kpi-top">
                <span className="kpi-ico" style={{ background: "#FFFBEB", color: "#D97706" }}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />
                  </svg>
                </span>
                <span className="kpi-trend up">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                  رو به کاهش
                </span>
              </div>
              <div className="v">
                {kpiData.lastFat !== null ? `٪${toPersianDigits(kpiData.lastFat)}` : "—"}
              </div>
              <div className="l">چربی بدن</div>
            </div>

            {/* Card 4: Last Record */}
            <div className="card kpi">
              <div className="kpi-top">
                <span className="kpi-ico">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </span>
                <span className="kpi-trend up">
                  {toPersianDigits(kpiData.totalCount)} رکورد
                </span>
              </div>
              <div className="v" style={{ fontSize: "18px" }}>
                {kpiData.lastDate ? formatPersianDate(kpiData.lastDate) : "—"}
              </div>
              <div className="l">آخرین ثبت</div>
            </div>
          </div>

          {/* Chart + Entry Form Grid */}
          <div className="grid-2" style={{ marginBottom: "18px", alignItems: "start" }}>
            {/* Chart Card */}
            <div className="card chart-card">
              <div className="card-head" style={{ flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h3>نمودار پیشرفت</h3>
                  <div className="hint" id="chartHint">
                    {chartSummaryHint}
                  </div>
                </div>
                <div className="seg" id="metricSeg" style={{ flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className={activeMetric === "weight" ? "active" : ""}
                    onClick={() => setActiveMetric("weight")}
                  >
                    وزن
                  </button>
                  <button
                    type="button"
                    className={activeMetric === "bmi" ? "active font-bold text-primary-dark" : ""}
                    onClick={() => setActiveMetric("bmi")}
                  >
                    شاخص BMI
                  </button>
                  <button
                    type="button"
                    className={activeMetric === "fat" ? "active" : ""}
                    onClick={() => setActiveMetric("fat")}
                  >
                    چربی
                  </button>
                  <button
                    type="button"
                    className={activeMetric === "chest" ? "active" : ""}
                    onClick={() => setActiveMetric("chest")}
                  >
                    دور سینه
                  </button>
                  <button
                    type="button"
                    className={activeMetric === "waist" ? "active" : ""}
                    onClick={() => setActiveMetric("waist")}
                  >
                    دور کمر
                  </button>
                  <button
                    type="button"
                    className={activeMetric === "arm" ? "active" : ""}
                    onClick={() => setActiveMetric("arm")}
                  >
                    دور بازو
                  </button>
                </div>
              </div>

              <div className="card-body">
                <div className="chart-legend">
                  <div className="li">
                    <span className="swatch" style={{ background: "#0FBF87" }} />
                    <span id="legendLabel">{METRICS_CONFIG[activeMetric].label}</span>
                  </div>
                </div>

                <div className="chart-wrap" id="chartWrap">
                  {chartMath ? (
                    <>
                      <svg
                        viewBox={`0 0 ${W} ${H}`}
                        preserveAspectRatio="none"
                        style={{ width: "100%", height: "100%", overflow: "visible" }}
                      >
                        <defs>
                          <linearGradient id="fillG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#16E0A0" stopOpacity="0.28" />
                            <stop offset="100%" stopColor="#16E0A0" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {chartMath.gridLines.map((gy, idx) => (
                          <line
                            key={idx}
                            x1="0"
                            y1={gy}
                            x2={W}
                            y2={gy}
                            stroke="#E7E5E4"
                            strokeWidth="1"
                            strokeDasharray="4 6"
                          />
                        ))}
                        <path d={chartMath.areaPath} fill="url(#fillG)" />
                        <path
                          d={chartMath.linePath}
                          fill="none"
                          stroke="#0FBF87"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {chartPoints.map((p, i) => {
                          const px = chartMath.getX(i);
                          const py = chartMath.getY(p.val);
                          const isLast = i === chartPoints.length - 1;
                          return (
                            <circle
                              key={i}
                              cx={px}
                              cy={py}
                              r={isLast ? 6 : 4}
                              fill={isLast ? "#0FBF87" : "#16E0A0"}
                              stroke="#ffffff"
                              strokeWidth="1.5"
                              style={{ cursor: "pointer" }}
                            >
                              <title>{`${formatPersianShortDate(p.date)}: ${toPersianDigits(p.val.toFixed(1))} ${METRICS_CONFIG[activeMetric].unit}`}</title>
                            </circle>
                          );
                        })}
                      </svg>
                      <div className="chart-y-lbl" style={{ top: `${padT}px` }}>
                        {toPersianDigits(chartMath.max.toFixed(1))}
                      </div>
                      <div className="chart-y-lbl" style={{ top: `${(H + padT - padB) / 2}px` }}>
                        {toPersianDigits(((chartMath.max + chartMath.min) / 2).toFixed(1))}
                      </div>
                      <div className="chart-y-lbl" style={{ top: `${H - padB}px` }}>
                        {toPersianDigits(chartMath.min.toFixed(1))}
                      </div>
                    </>
                  ) : (
                    <div className="chart-empty">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 3v18h18" />
                        <path d="m19 9-5 5-4-4-3 3" />
                      </svg>
                      <div className="t">داده‌ی کافی برای این شاخص نیست</div>
                      <div className="s">حداقل دو اندازه‌گیری ثبت کنید تا نمودار رسم شود</div>
                    </div>
                  )}
                </div>

                {chartPoints.length >= 2 && (
                  <div className="chart-x">
                    {chartPoints.map((p, idx) => (
                      <span key={idx}>{formatPersianShortDate(p.date)}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Entry Form Card */}
            <div className="card" ref={formCardRef} id="formCard">
              <div className="card-head">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3>{editingDate ? "ویرایش اندازه‌گیری" : "ثبت اندازه‌گیری"}</h3>
                    {editingDate && (
                      <span className="pill" style={{ background: "#FEF3C7", color: "#D97706" }}>
                        حالت ویرایش
                      </span>
                    )}
                  </div>
                  <div className="hint">
                    {editingDate
                      ? `در حال تغییر مقادیر تاریخ ${formatPersianDate(editingDate)}`
                      : "مقادیر را برای تاریخ موردنظر وارد کن"}
                  </div>
                </div>
              </div>
              <div className="card-body">
                {formSuccess && (
                  <div
                    style={{
                      background: "var(--tint)",
                      color: "var(--primary-dark)",
                      border: "1px solid rgba(22, 224, 160, 0.4)",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: 700,
                      marginBottom: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      style={{ width: 16, height: 16 }}
                    >
                      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {formSuccess}
                  </div>
                )}
                {formError && (
                  <div
                    style={{
                      background: "#FFF1F2",
                      color: "#E11D48",
                      border: "1px solid #FECDD3",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: 700,
                      marginBottom: "14px",
                    }}
                  >
                    {formError}
                  </div>
                )}
                <form onSubmit={handleSaveEntry}>
                  <div className="form-grid">
                    {/* Row 1: تاریخ & وزن */}
                    <div className="field">
                      <label htmlFor="fDate">
                        تاریخ <span className="opt">(لازم)</span>
                      </label>
                      <input
                        type="date"
                        id="fDate"
                        value={fDate}
                        onChange={(e) => setFDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="fWeight">
                        وزن <span className="opt">(لازم)</span>
                      </label>
                      <div className="input-wrap">
                        <span className="unit">کیلوگرم</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          id="fWeight"
                          placeholder="۶۸٫۰"
                          value={fWeight}
                          onChange={(e) => {
                            setFWeight(e.target.value);
                            if (formError) setFormError(null);
                          }}
                          required
                        />
                      </div>
                    </div>

                    {/* Row 2: شاخص BMI & چربی بدن */}
                    <div className="field">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <label htmlFor="fBmi" style={{ margin: 0 }}>
                          شاخص BMI <span className="opt">(اختیاری)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setBmiCalcWeight(fWeight || (entries.length ? String(entries[entries.length - 1].weight) : ""));
                            setBmiCalcHeight(String(heightCm));
                            setShowBmiCalcModal(true);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            fontSize: "11px",
                            color: "var(--primary-dark)",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}>
                            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                          <span>محاسبه آنلاین</span>
                        </button>
                      </div>
                      <div className="input-wrap">
                        <span className="unit">واحد</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          id="fBmi"
                          placeholder="۲۲٫۲"
                          value={fBmi}
                          onChange={(e) => setFBmi(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="field">
                      <label htmlFor="fFat">چربی بدن</label>
                      <div className="input-wrap">
                        <span className="unit">٪</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          id="fFat"
                          placeholder="۱۸"
                          value={fFat}
                          onChange={(e) => setFFat(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Row 3: دور سینه & دور کمر */}
                    <div className="field">
                      <label htmlFor="fChest">دور سینه</label>
                      <div className="input-wrap">
                        <span className="unit">سانتی‌متر</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          id="fChest"
                          placeholder="۱۰۲"
                          value={fChest}
                          onChange={(e) => setFChest(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="field">
                      <label htmlFor="fWaist">دور کمر</label>
                      <div className="input-wrap">
                        <span className="unit">سانتی‌متر</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          id="fWaist"
                          placeholder="۷۸"
                          value={fWaist}
                          onChange={(e) => setFWaist(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Row 4: دور بازو & دور ران */}
                    <div className="field">
                      <label htmlFor="fArm">دور بازو</label>
                      <div className="input-wrap">
                        <span className="unit">سانتی‌متر</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          id="fArm"
                          placeholder="۳۶"
                          value={fArm}
                          onChange={(e) => setFArm(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="field">
                      <label htmlFor="fThigh">دور ران</label>
                      <div className="input-wrap">
                        <span className="unit">سانتی‌متر</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          id="fThigh"
                          placeholder="۵۸"
                          value={fThigh}
                          onChange={(e) => setFThigh(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-foot">
                    <div className="form-note">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4M12 8h.01" />
                      </svg>
                      فقط وزن و تاریخ لازم است؛ بقیه اختیاری‌اند.
                    </div>
                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={handleResetForm}
                      >
                        {editingDate ? "انصراف" : "پاک کردن"}
                      </button>
                      <button type="submit" className="btn btn-primary btn-sm">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                          <path d="M17 21v-8H7v8M7 3v5h8" />
                        </svg>
                        {editingDate ? "ثبت تغییرات" : "ثبت"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* DEDICATED BMI SECTION: TABLE ONLY WITH RICH INFO + CLICK FOR DETAILS */}
          <div className="card" style={{ marginBottom: "18px" }}>
            <div
              className="card-head"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <h3>جدول مقایسه شاخص توده بدنی (BMI)</h3>
                <div className="hint">
                  مقایسه تغییرات شاخص توده بدنی در ماه‌های مختلف — برای مشاهده تحلیل کامل، گیج سلامت و توصیه‌های مربی روی هر ردیف کلیک کنید
                </div>
              </div>
              <span className="pill" style={{ color: "var(--primary-dark)" }}>
                روی هر ردیف کلیک کنید ↗
              </span>
            </div>

            <div className="card-body" style={{ padding: "16px 20px" }}>
              <div className="bmi-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ماه و تاریخ</th>
                      <th>وزن و قد</th>
                      <th>چربی</th>
                      <th>شاخص BMI و رده‌بندی</th>
                      <th>تغییرات</th>
                      <th>ارزیابی سلامت (WHO)</th>
                      <th>وضعیت ایده‌آل</th>
                      <th style={{ textAlign: "center" }}>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyBmiData.map((row, idx) => (
                      <tr
                        key={idx}
                        onClick={() => setSelectedMonthKey(row.monthKey)}
                        style={{ cursor: "pointer" }}
                        className="hover:bg-bg transition-colors"
                      >
                        <td style={{ fontWeight: 800, color: "var(--ink)", whiteSpace: "nowrap" }}>
                          <div>{row.monthName}</div>
                          <div style={{ fontSize: "11px", color: "var(--ink-faint)", fontWeight: 500 }}>
                            {formatPersianDate(row.date)}
                          </div>
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <span style={{ fontWeight: 700 }}>{toPersianDigits(row.weight)} کیلو</span>
                          <span style={{ fontSize: "11px", color: "var(--ink-faint)", display: "block" }}>
                            قد: {toPersianDigits(heightCm)} سانت
                          </span>
                        </td>
                        <td>
                          {row.fat !== null ? (
                            <span style={{ fontWeight: 700, color: "var(--ink)" }}>
                              ٪{toPersianDigits(row.fat)}
                            </span>
                          ) : (
                            <span style={{ color: "var(--ink-faint)" }}>—</span>
                          )}
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <span className={`bmi-badge ${row.info.statusClass}`} style={{ marginLeft: "6px" }}>
                            {toPersianDigits(row.bmi.toFixed(1))}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: "12px" }}>{row.info.category}</span>
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {row.deltaText === "—" ? (
                            <span style={{ color: "var(--ink-faint)", fontSize: "12px" }}>مبنا</span>
                          ) : (
                            <span
                              className={`kpi-trend ${row.trendGood ? "up" : "down"}`}
                              style={{ display: "inline-flex", fontSize: "11px", padding: "2px 6px" }}
                            >
                              {row.deltaText}
                            </span>
                          )}
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: row.info.isGood ? "#059669" : "#D97706",
                            }}
                          >
                            {row.info.goodVerdict}
                          </span>
                          <div style={{ fontSize: "11px", color: "var(--ink-faint)", marginTop: "2px" }}>
                            بازه سلامت: {row.healthyRangeText}
                          </div>
                        </td>
                        <td style={{ fontSize: "11.5px", fontWeight: 700, color: row.idealStatusColor }}>
                          {row.idealDiffText}
                        </td>
                        <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMonthKey(row.monthKey);
                            }}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: "11.5px", padding: "4px 10px" }}
                          >
                            تحلیل کامل ↗
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Body composition + strength records (verbatim from fitlegend-gym-os-track-progress.html) */}
          <div className="grid-2" style={{ marginBottom: "18px" }}>
            {/* Composition Donut */}
            <div className="card">
              <div className="card-head">
                <div>
                  <h3>ترکیب بدن</h3>
                  <div className="hint">آخرین اندازه‌گیری</div>
                </div>
              </div>
              <div className="card-body">
                <div className="donut-wrap">
                  <div className="donut">
                    <svg
                      viewBox="0 0 42 42"
                      style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}
                    >
                      <circle
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="none"
                        stroke="var(--bg)"
                        strokeWidth="5"
                      />
                      <circle
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="none"
                        stroke="#16E0A0"
                        strokeWidth="5"
                        strokeDasharray="42 58"
                        strokeDashoffset="0"
                      />
                      <circle
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="none"
                        stroke="#22D3EE"
                        strokeWidth="5"
                        strokeDasharray="40 60"
                        strokeDashoffset="-42"
                      />
                      <circle
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="5"
                        strokeDasharray="18 82"
                        strokeDashoffset="-82"
                      />
                    </svg>
                    <div className="center">
                      <div className="v">٪{toPersianDigits(kpiData.lastFat ?? 18)}</div>
                      <div className="l">چربی بدن</div>
                    </div>
                  </div>

                  <div className="donut-legend">
                    <div className="row">
                      <span className="dot" style={{ background: "#16E0A0" }} />
                      <span className="nm">عضله</span>
                      <span className="pc">٪۴۲</span>
                    </div>
                    <div className="row">
                      <span className="dot" style={{ background: "#22D3EE" }} />
                      <span className="nm">آب بدن</span>
                      <span className="pc">٪۴۰</span>
                    </div>
                    <div className="row">
                      <span className="dot" style={{ background: "#F59E0B" }} />
                      <span className="nm">چربی</span>
                      <span className="pc">٪{toPersianDigits(kpiData.lastFat ?? 18)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Strength Records */}
            <div className="card">
              <div className="card-head">
                <div>
                  <h3>رکوردهای قدرتی</h3>
                  <div className="hint">بیشترین وزن در هر حرکت</div>
                </div>
              </div>
              <div className="card-body">
                <div className="top-list">
                  <div className="top-row">
                    <div className="top-head">
                      <span className="nm">اسکوات هالتر</span>
                      <span className="val">۸۰ کیلو</span>
                    </div>
                    <div className="hbar">
                      <div className="hbar-fill" style={{ width: "80%" }} />
                    </div>
                  </div>

                  <div className="top-row">
                    <div className="top-head">
                      <span className="nm">ددلیفت</span>
                      <span className="val">۹۰ کیلو</span>
                    </div>
                    <div className="hbar">
                      <div className="hbar-fill" style={{ width: "90%" }} />
                    </div>
                  </div>

                  <div className="top-row">
                    <div className="top-head">
                      <span className="nm">پرس سینه</span>
                      <span className="val">۶۰ کیلو</span>
                    </div>
                    <div className="hbar">
                      <div className="hbar-fill" style={{ width: "60%" }} />
                    </div>
                  </div>

                  <div className="top-row">
                    <div className="top-head">
                      <span className="nm">پرس پا</span>
                      <span className="val">۱۲۰ کیلو</span>
                    </div>
                    <div className="hbar">
                      <div className="hbar-fill" style={{ width: "100%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="card">
            <div className="card-head">
              <div>
                <h3>تاریخچه‌ی ثبت‌ها</h3>
                <div className="hint">همه‌ی اندازه‌گیری‌های ثبت‌شده</div>
              </div>
              <span className="pill">{toPersianDigits(sortedEntries.length)} رکورد</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>تاریخ</th>
                    <th>وزن</th>
                    <th>شاخص BMI</th>
                    <th>چربی</th>
                    <th>دور سینه</th>
                    <th>دور کمر</th>
                    <th>دور بازو</th>
                    <th>دور ران</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {[...sortedEntries].reverse().map((e, idx) => {
                    const entryBmi = e.bmi ?? (e.weight && heightCm ? getBmi(e.weight, heightCm) : null);
                    const bmiInfo = entryBmi ? getBmiInfo(entryBmi) : null;
                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight: 800, color: "var(--ink)", whiteSpace: "nowrap" }}>
                          {formatPersianDate(e.date)}
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>{toPersianDigits(e.weight)} کیلو</td>
                        <td>
                          {entryBmi && bmiInfo ? (
                            <span
                              className={`bmi-badge ${bmiInfo.statusClass}`}
                              style={{ fontSize: "11px", padding: "2px 7px", whiteSpace: "nowrap" }}
                            >
                              {toPersianDigits(entryBmi.toFixed(1))}
                            </span>
                          ) : (
                            <span style={{ color: "var(--ink-faint)" }}>—</span>
                          )}
                        </td>
                        <td>{e.fat !== null && e.fat !== undefined ? `٪${toPersianDigits(e.fat)}` : "—"}</td>
                        <td>{e.chest !== null && e.chest !== undefined ? `${toPersianDigits(e.chest)} سانت` : "—"}</td>
                        <td>{e.waist !== null && e.waist !== undefined ? `${toPersianDigits(e.waist)} سانت` : "—"}</td>
                        <td>{e.arm !== null && e.arm !== undefined ? `${toPersianDigits(e.arm)} سانت` : "—"}</td>
                        <td>{e.thigh !== null && e.thigh !== undefined ? `${toPersianDigits(e.thigh)} سانت` : "—"}</td>
                        <td>
                          <div className="tbl-actions">
                            <button
                              type="button"
                              className="tbl-btn edit"
                              onClick={() => handleEditEntry(e)}
                              title="ویرایش این رکورد"
                              aria-label="ویرایش رکورد"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="tbl-btn delete"
                              onClick={() => handleDeleteEntry(e.date)}
                              title="حذف این رکورد"
                              aria-label="حذف رکورد"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* BMI DETAILS MODAL (Opens on clicking BMI table row) */}
      {activeSelectedBmi && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-[3px] transition-opacity"
            onClick={() => setSelectedMonthKey(null)}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-[20px] border border-border bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-[18px_22px] sticky top-0 bg-surface z-20">
              <div>
                <h3 className="text-[17px] font-extrabold text-ink">
                  تحلیل جامع شاخص توده بدنی (BMI) — {activeSelectedBmi.monthName}
                </h3>
                <div className="text-[12px] text-ink-faint mt-0.5">
                  ارزیابی وضعیت سلامت بر اساس استانداردهای بین‌المللی WHO و توصیه‌های باشگاه فیتلجند
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMonthKey(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-bg hover:text-ink transition-colors"
                aria-label="بستن"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-[22px] space-y-5">
              {/* Score Display Card */}
              <div
                style={{
                  background: "var(--bg)",
                  borderRadius: "16px",
                  padding: "18px",
                  textAlign: "center",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ fontSize: "13px", color: "var(--ink-faint)", fontWeight: 700 }}>
                  شاخص توده بدنی محاسبه‌شده در این دوره
                </div>
                <div
                  style={{
                    fontSize: "44px",
                    fontWeight: 900,
                    color: "var(--ink)",
                    margin: "6px 0",
                    lineHeight: 1,
                  }}
                >
                  {toPersianDigits(activeSelectedBmi.bmi.toFixed(1))}
                </div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--primary-dark)" }}>
                  {activeSelectedBmi.info.category}
                </div>
                <div style={{ fontSize: "12px", color: "var(--ink-faint)", marginTop: "6px" }}>
                  بر اساس وزن {toPersianDigits(activeSelectedBmi.weight)} کیلوگرم و قد مبنای {toPersianDigits(heightCm)} سانتی‌متر
                </div>
              </div>

              {/* Visual Gauge */}
              <div>
                <div className="bmi-gauge">
                  <div
                    className="bmi-pointer"
                    style={{
                      right: `${Math.min(
                        100,
                        Math.max(0, ((activeSelectedBmi.bmi - 15) / (35 - 15)) * 100)
                      )}%`,
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    color: "var(--ink-faint)",
                    fontWeight: 700,
                  }}
                >
                  <span style={{ color: "#0284C7" }}>کمتر از ۱۸٫۵</span>
                  <span style={{ color: "#059669" }}>۱۸٫۵ - ۲۴٫۹ (ایده‌آل)</span>
                  <span style={{ color: "#D97706" }}>۲۵ - ۲۹٫۹</span>
                  <span style={{ color: "#E11D48" }}>۳۰ به بالا</span>
                </div>
              </div>

              {/* Is it good or not? */}
              <div
                style={{
                  background: activeSelectedBmi.info.isGood ? "var(--tint)" : "#FFFBEB",
                  borderRadius: "14px",
                  padding: "16px",
                  border: `1px solid ${activeSelectedBmi.info.isGood ? "rgba(22, 224, 160, 0.4)" : "#FDE68A"}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 800,
                      color: activeSelectedBmi.info.isGood ? "var(--primary-dark)" : "#B45309",
                    }}
                  >
                    آیا این وضعیت خوب است؟
                  </span>
                  <span
                    className={`bmi-badge ${activeSelectedBmi.info.statusClass}`}
                    style={{ fontSize: "11.5px" }}
                  >
                    {activeSelectedBmi.info.goodVerdict}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.8,
                    color: "var(--ink)",
                    margin: 0,
                  }}
                >
                  {activeSelectedBmi.info.description}
                </p>
              </div>

              {/* Diagnostic Metrics Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "12px",
                  fontSize: "12.5px",
                }}
              >
                <div
                  style={{
                    background: "var(--bg)",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ color: "var(--ink-faint)", fontWeight: 600 }}>بازه وزن سلامت شما</div>
                  <div style={{ fontWeight: 800, color: "var(--ink)", marginTop: "4px" }}>
                    {activeSelectedBmi.healthyRangeText}
                  </div>
                </div>

                <div
                  style={{
                    background: "var(--bg)",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ color: "var(--ink-faint)", fontWeight: 600 }}>وضعیت نسبت به حد سلامت</div>
                  <div style={{ fontWeight: 800, color: activeSelectedBmi.idealStatusColor, marginTop: "4px" }}>
                    {activeSelectedBmi.idealDiffText}
                  </div>
                </div>

                <div
                  style={{
                    background: "var(--bg)",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ color: "var(--ink-faint)", fontWeight: 600 }}>چربی ثبت‌شده این ماه</div>
                  <div style={{ fontWeight: 800, color: "var(--ink)", marginTop: "4px" }}>
                    {activeSelectedBmi.fat !== null ? `٪${toPersianDigits(activeSelectedBmi.fat)}` : "ثبت نشده"}
                  </div>
                </div>

                <div
                  style={{
                    background: "var(--bg)",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ color: "var(--ink-faint)", fontWeight: 600 }}>فرمول محاسبه علمی</div>
                  <div style={{ fontWeight: 800, color: "var(--ink)", marginTop: "4px" }}>
                    وزن ÷ (قد به متر)²
                  </div>
                </div>
              </div>

              {/* Coach Advice */}
              <div
                style={{
                  background: "var(--bg)",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--ink)", marginBottom: "6px" }}>
                  💡 توصیه تخصصی مربی و تمرین فیتلجند:
                </div>
                <div style={{ fontSize: "12.5px", color: "var(--ink-soft)", lineHeight: 1.8 }}>
                  {activeSelectedBmi.recommendation}
                </div>
              </div>

              {/* Height adjustment inside modal */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "var(--bg)",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                }}
              >
                <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--ink-soft)" }}>
                  تنظیم قد مبنا (سانتی‌متر):
                </span>
                <div style={{ width: "90px" }}>
                  <input
                    type="number"
                    min="120"
                    max="230"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value) || 175)}
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                      fontSize: "13px",
                      fontWeight: 700,
                      textAlign: "center",
                    }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setSelectedMonthKey(null)}
                  className="btn btn-primary btn-sm min-w-[100px]"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BMI CALCULATOR MODAL / WINDOW */}
      {showBmiCalcModal && (
        <div className="fixed inset-0 z-80 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-ink/50 backdrop-blur-[4px] transition-opacity"
            onClick={() => setShowBmiCalcModal(false)}
            aria-hidden="true"
          />

          <div className="relative z-10 w-full max-w-[460px] overflow-hidden rounded-[20px] border border-border bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border p-[16px_20px]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-tint text-primary-dark">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 18, height: 18 }}>
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-[16px] font-extrabold text-ink">
                    محاسبه آنلاین شاخص توده بدنی (BMI)
                  </h3>
                  <div className="text-[11.5px] text-ink-faint">
                    قد و وزن را وارد کنید تا شاخص محاسبه و در فیلد درج شود
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBmiCalcModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-bg hover:text-ink transition-colors"
                aria-label="بستن"
              >
                ✕
              </button>
            </div>

            <div className="p-[20px] space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="field">
                  <label htmlFor="modalWeight">وزن (کیلوگرم)</label>
                  <div className="input-wrap">
                    <span className="unit">کیلو</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      id="modalWeight"
                      placeholder="۶۸٫۰"
                      value={bmiCalcWeight}
                      onChange={(e) => setBmiCalcWeight(e.target.value)}
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="modalHeight">قد (سانتی‌متر)</label>
                  <div className="input-wrap">
                    <span className="unit">سانت</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      id="modalHeight"
                      placeholder="۱۷۵"
                      value={bmiCalcHeight}
                      onChange={(e) => setBmiCalcHeight(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Live result */}
              <div
                style={{
                  background: "var(--bg)",
                  borderRadius: "14px",
                  padding: "16px",
                  textAlign: "center",
                  border: "1px solid var(--border)",
                }}
              >
                {liveCalcBmi ? (
                  <>
                    <div style={{ fontSize: "12px", color: "var(--ink-faint)", fontWeight: 700 }}>
                      شاخص محاسبه‌شده شما
                    </div>
                    <div
                      style={{
                        fontSize: "38px",
                        fontWeight: 900,
                        color: "var(--ink)",
                        margin: "4px 0",
                        lineHeight: 1,
                      }}
                    >
                      {toPersianDigits(liveCalcBmi.bmi.toFixed(1))}
                    </div>
                    <div style={{ marginTop: "6px" }}>
                      <span className={`bmi-badge ${liveCalcBmi.info.statusClass}`}>
                        {liveCalcBmi.info.category}
                      </span>
                    </div>
                    <div style={{ fontSize: "11.5px", color: "var(--ink-soft)", marginTop: "8px", lineHeight: 1.6 }}>
                      {liveCalcBmi.info.goodVerdict}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: "12.5px", color: "var(--ink-faint)", padding: "10px 0" }}>
                    لطفاً مقادیر وزن و قد را وارد کنید تا محاسبه شود
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowBmiCalcModal(false)}
                  className="btn btn-outline btn-sm"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  disabled={!liveCalcBmi}
                  onClick={applyCalculatedBmi}
                  className="btn btn-primary btn-sm"
                  style={{ opacity: liveCalcBmi ? 1 : 0.5 }}
                >
                  درج در فرم ثبت اندازه‌گیری ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
