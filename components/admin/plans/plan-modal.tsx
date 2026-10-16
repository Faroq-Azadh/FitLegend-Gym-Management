"use client";

import { useState, useEffect } from "react";
import { PlanItem } from "./types";
import { X, Plus, Trash2, Loader2, Sparkles, Clock, DollarSign } from "lucide-react";
import {
  toPersianDigits,
  normalizeDigits,
  extractDigitsOnly,
  formatPriceToWords,
} from "@/lib/persian-digits";

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (planData: Omit<PlanItem, "id">, editId?: string) => Promise<void> | void;
  editPlan?: PlanItem | null;
  isSubmitting?: boolean;
}

export function PlanModal({
  isOpen,
  onClose,
  onSave,
  editPlan,
  isSubmitting = false,
}: PlanModalProps) {
  const [name, setName] = useState("");
  const [hint, setHint] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [durationDays, setDurationDays] = useState<number>(30);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customDays, setCustomDays] = useState("30");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [featured, setFeatured] = useState(false);
  const [ribbonText, setRibbonText] = useState("محبوب");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState<string[]>([
    "دسترسی به سالن بدنسازی",
    "کمد اختصاصی",
  ]);
  const [newFeatureText, setNewFeatureText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editPlan) {
      setName(editPlan.name);
      setHint(editPlan.hint || "");

      // Normalize price cleanly extracting digits only
      const rawDigits = extractDigitsOnly(String(editPlan.priceRaw || editPlan.price || ""));
      const rawNum = parseInt(rawDigits, 10) || 0;
      setPriceInput(rawNum ? rawNum.toLocaleString("en-US") : "");

      // Duration
      const days = editPlan.durationDays || (editPlan.duration?.match(/\d+/) ? parseInt(editPlan.duration.match(/\d+/)![0], 10) : 30);
      if ([30, 90, 180, 365].includes(days)) {
        setDurationDays(days);
        setIsCustomDuration(false);
      } else {
        setIsCustomDuration(true);
        setCustomDays(String(days));
        setDurationDays(days);
      }

      setStatus(editPlan.status);
      setFeatured(Boolean(editPlan.featured));
      setRibbonText(editPlan.ribbonText || "محبوب");
      setDescription(editPlan.description || "");
      setFeatures(editPlan.features && editPlan.features.length > 0 ? editPlan.features : ["دسترسی به سالن بدنسازی", "کمد اختصاصی"]);
    } else {
      setName("");
      setHint("");
      setPriceInput("1,200,000");
      setDurationDays(30);
      setIsCustomDuration(false);
      setCustomDays("30");
      setStatus("active");
      setFeatured(false);
      setRibbonText("محبوب");
      setDescription("");
      setFeatures([
        "دسترسی به سالن بدنسازی",
        "کمد اختصاصی",
      ]);
    }
    setNewFeatureText("");
    setErrorMsg(null);
  }, [editPlan, isOpen]);

  if (!isOpen) return null;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = extractDigitsOnly(e.target.value);
    if (!raw) {
      setPriceInput("");
      return;
    }
    const num = parseInt(raw, 10);
    setPriceInput(num.toLocaleString("en-US"));
  };

  const getCleanPriceNum = (): number => {
    const raw = extractDigitsOnly(priceInput);
    return parseInt(raw, 10) || 0;
  };

  const handleAddFeature = () => {
    if (newFeatureText.trim()) {
      setFeatures([...features, newFeatureText.trim()]);
      setNewFeatureText("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("لطفاً عنوان پلن را وارد کنید.");
      return;
    }

    const priceNum = getCleanPriceNum();
    if (!priceNum || priceNum <= 0) {
      setErrorMsg("لطفاً مبلغ معتبری برای پلن وارد کنید.");
      return;
    }

    const effectiveDays = isCustomDuration ? parseInt(normalizeDigits(customDays), 10) || 30 : durationDays;
    const durationMonths = Math.max(1, Math.round(effectiveDays / 30));
    const durationLabel = `${durationMonths.toLocaleString("fa-IR")} ماهه (${effectiveDays.toLocaleString("fa-IR")} روز)`;

    try {
      await onSave(
        {
          name: name.trim(),
          hint: hint.trim() || (status === "active" ? "پلن فعال" : "پلن غیرفعال"),
          price: priceNum.toLocaleString("fa-IR"),
          priceRaw: priceNum,
          priceUnit: "تومان",
          duration: durationLabel,
          durationDays: effectiveDays,
          status,
          featured,
          ribbonText: featured ? ribbonText : undefined,
          description: description.trim(),
          features: features.length > 0 ? features : ["دسترسی استاندارد به باشگاه"],
          activeMembers: editPlan ? editPlan.activeMembers : 0,
        },
        editPlan?.id,
      );
    } catch (err: any) {
      setErrorMsg(err?.message || "خطا در برقراری ارتباط با سرور");
    }
  };

  const PRESET_PRICES = [
    { label: "۹۵۰ هزار", val: 950000 },
    { label: "۱.۵ میلیون", val: 1500000 },
    { label: "۲.۵ میلیون", val: 2500000 },
    { label: "۴.۸ میلیون", val: 4800000 },
    { label: "۸.۹ میلیون", val: 8900000 },
  ];

  const currentPriceNum = getCleanPriceNum();

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-[16px]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-[580px] overflow-hidden rounded-[20px] border border-border bg-surface shadow-[0_20px_60px_rgba(15,23,42,0.15)] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-bg/60 p-[18px_24px]">
          <div>
            <h3 className="text-[18px] font-black text-ink">
              {editPlan ? "ویرایش پلن عضویت باشگاه" : "تعریف پلن عضویت جدید"}
            </h3>
            <p className="mt-[2px] text-[12.5px] text-ink-faint">
              تعیین قیمت، مدت اعتبار و خدمات اختصاصی پلن
            </p>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] text-ink-faint transition-colors hover:bg-surface hover:text-ink cursor-pointer disabled:opacity-50"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Error alert if any */}
        {errorMsg && (
          <div className="m-[16px_24px_0] rounded-[10px] border border-red-200 bg-red-50 p-3 text-[13px] font-bold text-red-600">
            {errorMsg}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] space-y-[18px] overflow-y-auto p-[22px_24px]">
            {/* Name & Hint */}
            <div className="grid grid-cols-1 gap-[14px] min-[480px]:grid-cols-2">
              <div>
                <label className="mb-[6px] block text-[12.5px] font-bold text-ink">
                  عنوان پلن عضویت <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ۳ ماهه طلایی"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-[12px] border border-border bg-surface p-[10px_14px] text-[13.5px] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-[6px] block text-[12.5px] font-bold text-ink">
                  توضیح کوتاه / برچسب
                </label>
                <input
                  type="text"
                  placeholder="مثال: پرطرفدارترین، دسترسی کامل"
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                  className="w-full rounded-[12px] border border-border bg-surface p-[10px_14px] text-[13.5px] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none"
                />
              </div>
            </div>

            {/* Price section */}
            <div>
              <div className="mb-[6px] flex items-center justify-between">
                <label className="block text-[12.5px] font-bold text-ink">
                  مبلغ پلن عضویت <span className="text-red-500">*</span>
                </label>
                {currentPriceNum > 0 && (
                  <span className="text-[12px] font-extrabold text-primary-dark">
                    {toPersianDigits(currentPriceNum.toLocaleString("en-US"))} تومان
                  </span>
                )}
              </div>

              {/* Input Group with separated currency addon box (no text overlap) */}
              <div className="flex items-center overflow-hidden rounded-[12px] border border-border bg-surface transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <input
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  required
                  placeholder="1,200,000"
                  value={priceInput}
                  onChange={handlePriceChange}
                  className="flex-1 bg-transparent px-[14px] py-[10px] text-left text-[15px] font-black tracking-wide text-ink placeholder:text-ink-faint focus:outline-none"
                />
                <div className="border-r border-border bg-bg/80 px-[14px] py-[10px] text-[12.5px] font-bold text-ink-soft select-none">
                  تومان
                </div>
              </div>

              {/* Amount in Persian Words (حروف) */}
              {currentPriceNum > 0 && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-ink-soft">
                  <span className="text-ink-faint">به حروف:</span>
                  <span className="font-bold text-ink">{formatPriceToWords(currentPriceNum)}</span>
                </div>
              )}

              {/* Price preset pills */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[11.5px] text-ink-faint ml-1">مبالغ پیشنهادی:</span>
                {PRESET_PRICES.map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setPriceInput(p.val.toLocaleString("en-US"))}
                    className="rounded-[8px] border border-border bg-bg px-2.5 py-1 text-[11px] font-bold text-ink-soft hover:border-primary hover:text-ink hover:bg-tint/40 transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration section */}
            <div>
              <label className="mb-[6px] block text-[12.5px] font-bold text-ink">
                مدت اعتبار پلن (روز)
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "۱ ماهه (۳۰ روز)", days: 30 },
                  { label: "۳ ماهه (۹۰ روز)", days: 90 },
                  { label: "۶ ماهه (۱۸۰ روز)", days: 180 },
                  { label: "سالانه (۳۶۵ روز)", days: 365 },
                ].map((opt) => (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => {
                      setDurationDays(opt.days);
                      setIsCustomDuration(false);
                    }}
                    className={`rounded-[10px] border p-2 text-center text-[12px] font-bold transition-all cursor-pointer ${
                      !isCustomDuration && durationDays === opt.days
                        ? "border-primary bg-tint text-primary-dark shadow-xs ring-1 ring-primary/50"
                        : "border-border bg-surface text-ink-soft hover:bg-bg"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="mt-2.5 flex items-center gap-3">
                <label className="flex items-center gap-2 text-[12px] font-bold text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCustomDuration}
                    onChange={(e) => setIsCustomDuration(e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span>مدت زمان سفارشی</span>
                </label>

                {isCustomDuration && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={3650}
                      value={customDays}
                      onChange={(e) => setCustomDays(e.target.value)}
                      className="w-24 rounded-[8px] border border-border bg-surface p-1.5 text-center text-[13px] font-bold text-ink focus:border-primary focus:outline-none"
                    />
                    <span className="text-[12px] text-ink-faint">روز</span>
                  </div>
                )}
              </div>
            </div>

            {/* Featured & Status Toggles */}
            <div className="grid grid-cols-1 gap-[14px] min-[480px]:grid-cols-2 rounded-[14px] border border-border bg-bg p-[14px]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-bold text-ink">پلن برگزیده (Featured)</div>
                  <div className="text-[11px] text-ink-faint">نمایش با حاشیه سبز و نشان ویژه</div>
                </div>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-[18px] w-[18px] accent-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-bold text-ink">وضعیت فروش در باشگاه</div>
                  <div className="text-[11px] text-ink-faint">فعال جهت ثبت‌نام اعضا</div>
                </div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                  className={`rounded-[8px] border px-[10px] py-[4px] text-[12px] font-bold focus:outline-none transition-colors ${
                    status === "active"
                      ? "border-[#0EA5E9]/40 bg-[#E0F2FE] text-[#0284C7]"
                      : "border-border bg-surface text-ink"
                  }`}
                >
                  <option value="active" className="bg-surface text-ink">فعال</option>
                  <option value="inactive" className="bg-surface text-ink">غیرفعال (آرشیو)</option>
                </select>
              </div>
            </div>

            {/* Features List */}
            <div>
              <label className="mb-[6px] block text-[12.5px] font-bold text-ink">
                ویژگی‌ها و خدمات مشمول این پلن
              </label>

              {/* Add feature input */}
              <div className="flex gap-[8px]">
                <input
                  type="text"
                  placeholder="افزودن ویژگی (مثال: دسترسی به سونا، برنامه تمرینی رایگان)"
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  className="flex-1 rounded-[10px] border border-border bg-surface p-[8px_12px] text-[13px] text-ink focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="inline-flex items-center gap-[4px] rounded-[10px] btn-ink-gradient px-[14px] py-[8px] text-[12.5px] font-bold text-white transition-colors cursor-pointer"
                >
                  <Plus className="h-[14px] w-[14px]" />
                  افزودن
                </button>
              </div>

              {/* Feature items */}
              <div className="mt-[10px] space-y-[6px]">
                {features.map((feat, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-[8px] border border-border bg-bg p-[8px_12px] text-[13px] text-ink"
                  >
                    <div className="flex items-center gap-[8px]">
                      <span className="h-[6px] w-[6px] rounded-full bg-primary-dark" />
                      <span>{feat}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="text-ink-faint hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="h-[14px] w-[14px]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-[6px] block text-[12.5px] font-bold text-ink">
                توضیحات تکمیلی (Description)
              </label>
              <textarea
                rows={2}
                placeholder="توضیحات تکمیلی پیرامون شرایط پلن، امکانات و تخفیف‌ها..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-[12px] border border-border bg-surface p-[10px_14px] text-[13px] text-ink placeholder:text-ink-faint focus:border-primary focus:bg-tint focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-[10px] border-t border-border bg-bg/50 p-[16px_24px]">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-[10px] border border-border bg-surface px-[16px] py-[9px] text-[13px] font-bold text-ink-soft transition-colors hover:bg-bg hover:text-ink cursor-pointer disabled:opacity-50"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-[6px] rounded-[10px] btn-ink-gradient px-[22px] py-[9px] text-[13.5px] font-bold text-white transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin text-white" />}
              <span>{editPlan ? "ذخیره تغییرات در سرور" : "ثبت و ایجاد پلن"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

