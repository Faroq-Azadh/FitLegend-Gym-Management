"use client";

import { useState, useRef } from "react";
import { X, Check, Upload, User as UserIcon } from "lucide-react";

export interface NewStudentPayload {
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  goal: string;
  programType: string;
  coachName: string;
  startDate: string;
  trainingDays: string[];
  duration: string;
  level: string;
  notes: string;
  instantActive: boolean;
  sendWelcomeSms: boolean;
  avatarUrl?: string;
}

interface CoachAddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentAdded?: (payload: NewStudentPayload) => void;
  coachName?: string;
}

const ALL_DAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];

export function CoachAddMemberModal({
  isOpen,
  onClose,
  onStudentAdded,
  coachName = "آرش رستمی",
}: CoachAddMemberModalProps) {
  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("مرد");
  const [birthDate, setBirthDate] = useState("۱۳۷۵/۰۵/۱۲");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [goal, setGoal] = useState("عضله‌سازی");
  const [programType, setProgramType] = useState("خصوصی");
  const [startDate, setStartDate] = useState("۱۴۰۴/۰۴/۰۵");
  const [trainingDays, setTrainingDays] = useState<string[]>([
    "شنبه",
    "دوشنبه",
    "چهارشنبه",
  ]);
  const [duration, setDuration] = useState("۱ ماهه");
  const [level, setLevel] = useState("متوسط");
  const [notes, setNotes] = useState("");
  const [instantActive, setInstantActive] = useState(true);
  const [sendWelcomeSms, setSendWelcomeSms] = useState(true);

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Submission state
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const toggleDay = (day: string) => {
    if (trainingDays.includes(day)) {
      setTrainingDays(trainingDays.filter((d) => d !== day));
    } else {
      setTrainingDays([...trainingDays, day]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) return;

    const payload: NewStudentPayload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      birthDate,
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      goal,
      programType,
      coachName,
      startDate,
      trainingDays,
      duration,
      level,
      notes: notes.trim(),
      instantActive,
      sendWelcomeSms,
      avatarUrl: avatarPreview || undefined,
    };

    onStudentAdded?.(payload);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      // Reset form
      setFirstName("");
      setLastName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setNotes("");
      setAvatarPreview(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 min-[640px]:p-5">
      {/* Backdrop scrim */}
      <div
        className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-[4px] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Window */}
      <div className="relative z-10 flex flex-col w-full max-w-[820px] max-h-[92vh] bg-surface rounded-[22px] border border-border shadow-[0_20px_60px_rgba(15,23,42,0.18)] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Window Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface/95 px-6 py-4.5 backdrop-blur-[10px]">
          <div>
            <div className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-faint mb-1">
              <span>شاگردان من</span>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transform scale-x-[-1]"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
              <span className="text-ink-soft font-bold">افزودن شاگرد</span>
            </div>
            <h2 className="text-[20px] font-extrabold text-ink">افزودن شاگرد جدید</h2>
            <div className="text-[13px] text-ink-faint mt-0.5">
              اطلاعات شاگرد را وارد کنید تا به فهرست شما اضافه شود
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] text-ink-faint transition-colors hover:bg-bg hover:text-ink cursor-pointer"
            aria-label="بستن پنجره"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-200">
              <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-tint text-primary-dark shadow-[0_8px_24px_rgba(242,92,31,0.3)]">
                <Check className="h-8 w-8 stroke-[3]" />
              </span>
              <h3 className="text-[20px] font-extrabold text-ink">شاگرد با موفقیت افزوده شد</h3>
              <p className="mt-1.5 text-[14px] text-ink-faint">
                اطلاعات {firstName} {lastName} به لیست شاگردان شما اضافه گردید.
              </p>
            </div>
          ) : (
            <form id="addMemberForm" onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* بخش ۱: اطلاعات شخصی */}
              <div className="card bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                <div className="card-head flex items-center justify-between p-[18px_20px] border-b border-border">
                  <div>
                    <h3 className="text-[15px] font-extrabold text-ink">اطلاعات شخصی</h3>
                    <div className="hint text-[12px] text-ink-faint mt-0.5">مشخصات پایه‌ی شاگرد</div>
                  </div>
                </div>
                <div className="p-[20px]">
                  {/* آپلود عکس پروفایل */}
                  <div className="ava-up mb-5 flex items-center gap-4">
                    <span className="ava-lg w-[72px] h-[72px] rounded-[18px] shrink-0 bg-gradient-to-br from-primary to-cyan flex items-center justify-center text-ink overflow-hidden shadow-sm">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="پیش‌نمایش"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-8 h-8 text-ink" />
                      )}
                    </span>
                    <div className="meta">
                      <div className="t text-[14px] font-bold text-ink">عکس پروفایل</div>
                      <div className="d text-[12px] text-ink-faint mt-0.5 mb-2.5">
                        JPG یا PNG، حداکثر ۲ مگابایت
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/png, image/jpeg"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-outline btn-sm"
                      >
                        <Upload className="h-4 w-4" />
                        <span>آپلود عکس</span>
                      </button>
                    </div>
                  </div>

                  <div className="form-grid grid grid-cols-1 min-[640px]:grid-cols-2 gap-4">
                    <div className="field">
                      <label className="text-[13px] font-bold text-ink">
                        نام <span className="req text-[#F43F5E]">*</span>
                      </label>
                      <input
                        className="input"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="مثلاً علی"
                      />
                    </div>
                    <div className="field">
                      <label className="text-[13px] font-bold text-ink">
                        نام خانوادگی <span className="req text-[#F43F5E]">*</span>
                      </label>
                      <input
                        className="input"
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="مثلاً رضایی"
                      />
                    </div>
                    <div className="field">
                      <label className="text-[13px] font-bold text-ink">جنسیت</label>
                      <select
                        className="input"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      >
                        <option value="مرد">مرد</option>
                        <option value="زن">زن</option>
                      </select>
                    </div>
                    <div className="field">
                      <label className="text-[13px] font-bold text-ink">تاریخ تولد</label>
                      <input
                        className="input text-right"
                        type="text"
                        dir="ltr"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        placeholder="۱۳۷۵/۰۵/۱۲"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* بخش ۲: اطلاعات تماس */}
              <div className="card bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                <div className="card-head flex items-center justify-between p-[18px_20px] border-b border-border">
                  <div>
                    <h3 className="text-[15px] font-extrabold text-ink">اطلاعات تماس</h3>
                    <div className="hint text-[12px] text-ink-faint mt-0.5">
                      برای ارسال یادآوری جلسات و پیام‌ها
                    </div>
                  </div>
                </div>
                <div className="p-[20px]">
                  <div className="form-grid grid grid-cols-1 min-[640px]:grid-cols-2 gap-4">
                    <div className="field">
                      <label className="text-[13px] font-bold text-ink">
                        شماره موبایل <span className="req text-[#F43F5E]">*</span>
                      </label>
                      <input
                        className="input text-right"
                        type="tel"
                        required
                        dir="ltr"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      />
                    </div>
                    <div className="field">
                      <label className="text-[13px] font-bold text-ink">ایمیل</label>
                      <input
                        className="input text-right"
                        type="email"
                        dir="ltr"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                      />
                    </div>
                    <div className="field full min-[640px]:col-span-2">
                      <label className="text-[13px] font-bold text-ink">آدرس</label>
                      <input
                        className="input"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="آدرس محل سکونت (اختیاری)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* بخش ۳: برنامه و عضویت */}
              <div className="card bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                <div className="card-head flex items-center justify-between p-[18px_20px] border-b border-border">
                  <div>
                    <h3 className="text-[15px] font-extrabold text-ink">برنامه و عضویت</h3>
                    <div className="hint text-[12px] text-ink-faint mt-0.5">
                      نوع برنامه‌ی تمرینی و جزئیات عضویت
                    </div>
                  </div>
                </div>
                <div className="p-[20px]">
                  <div className="form-grid grid grid-cols-1 min-[640px]:grid-cols-2 gap-4">
                    <div className="field">
                      <label className="text-[13px] font-bold text-ink">
                        هدف تمرینی <span className="req text-[#F43F5E]">*</span>
                      </label>
                      <select
                        className="input"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                      >
                        <option value="کاهش وزن">کاهش وزن</option>
                        <option value="عضله‌سازی">عضله‌سازی</option>
                        <option value="تناسب اندام">تناسب اندام</option>
                        <option value="آمادگی جسمانی">آمادگی جسمانی</option>
                        <option value="توان‌بخشی">توان‌بخشی</option>
                      </select>
                    </div>
                    <div className="field">
                      <label className="text-[13px] font-bold text-ink">نوع برنامه</label>
                      <select
                        className="input"
                        value={programType}
                        onChange={(e) => setProgramType(e.target.value)}
                      >
                        <option value="خصوصی">خصوصی</option>
                        <option value="نیمه‌خصوصی">نیمه‌خصوصی</option>
                        <option value="گروهی">گروهی</option>
                      </select>
                    </div>
                    <div className="field">
                      <label className="text-[13px] font-bold text-ink">مربی مسئول</label>
                      <input className="input" type="text" value={coachName} readOnly />
                    </div>
                    <div className="field">
                      <label className="text-[13px] font-bold text-ink">تاریخ شروع</label>
                      <input
                        className="input text-right"
                        type="text"
                        dir="ltr"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="۱۴۰۴/۰۴/۰۵"
                      />
                    </div>
                    <div className="field full min-[640px]:col-span-2">
                      <label className="text-[13px] font-bold text-ink mb-1.5">روزهای تمرین</label>
                      <div className="chip-pick flex flex-wrap gap-2" id="dayPick">
                        {ALL_DAYS.map((day) => {
                          const isSelected = trainingDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDay(day)}
                              className={`cp ${isSelected ? "on" : ""}`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="field">
                      <label className="text-[13px] font-bold text-ink">مدت عضویت</label>
                      <select
                        className="input"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                      >
                        <option value="۱ ماهه">۱ ماهه</option>
                        <option value="۳ ماهه">۳ ماهه</option>
                        <option value="۶ ماهه">۶ ماهه</option>
                        <option value="۱۲ ماهه">۱۲ ماهه</option>
                      </select>
                    </div>
                    <div className="field">
                      <label className="text-[13px] font-bold text-ink">سطح</label>
                      <select
                        className="input"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                      >
                        <option value="مبتدی">مبتدی</option>
                        <option value="متوسط">متوسط</option>
                        <option value="پیشرفته">پیشرفته</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* بخش ۴: یادداشت و وضعیت */}
              <div className="card bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                <div className="card-head flex items-center justify-between p-[18px_20px] border-b border-border">
                  <div>
                    <h3 className="text-[15px] font-extrabold text-ink">یادداشت و وضعیت</h3>
                    <div className="hint text-[12px] text-ink-faint mt-0.5">
                      اطلاعات تکمیلی و تنظیمات حساب
                    </div>
                  </div>
                </div>
                <div className="p-[20px]">
                  <div className="field full mb-4">
                    <label className="text-[13px] font-bold text-ink mb-1">یادداشت مربی</label>
                    <textarea
                      className="input"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="نکات پزشکی، محدودیت‌ها یا اهداف خاص شاگرد…"
                    />
                    <div className="hint text-[11.5px] text-ink-faint mt-1">
                      این یادداشت فقط برای شما قابل مشاهده است.
                    </div>
                  </div>

                  <div className="toggle-row flex items-center gap-3.5 py-3 border-b border-border">
                    <div className="meta flex-1">
                      <div className="t text-[14px] font-bold text-ink">فعال‌سازی فوری شاگرد</div>
                      <div className="d text-[12.5px] text-ink-faint mt-0.5">
                        شاگرد بلافاصله به فهرست فعال شما اضافه می‌شود.
                      </div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={instantActive}
                        onChange={(e) => setInstantActive(e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="toggle-row flex items-center gap-3.5 py-3">
                    <div className="meta flex-1">
                      <div className="t text-[14px] font-bold text-ink">ارسال پیام خوش‌آمدگویی</div>
                      <div className="d text-[12.5px] text-ink-faint mt-0.5">
                        یک پیامک شامل برنامه و زمان جلسات ارسال می‌شود.
                      </div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={sendWelcomeSms}
                        onChange={(e) => setSendWelcomeSms(e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Modal Window Footer Actions (Sticky bar) */}
        {!isSuccess && (
          <div className="sticky bottom-0 z-20 flex items-center justify-start gap-2.5 border-t border-border bg-surface/95 px-6 py-4 backdrop-blur-[10px]">
            <button
              type="submit"
              form="addMemberForm"
              className="btn btn-primary"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[18px] w-[18px]"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M19 8v6M22 11h-6" />
              </svg>
              <span>ذخیره و افزودن شاگرد</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              انصراف
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
