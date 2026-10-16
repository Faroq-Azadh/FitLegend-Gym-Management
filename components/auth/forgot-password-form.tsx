"use client";

import { useState, useRef, useEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import {
  Smartphone,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { toPersianDigits, normalizeDigits } from "@/lib/persian-digits";
import { authService } from "@/lib/api/services/auth.service";
import { ApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;

const RESEND_TIMEOUT = 120; // 2 minutes in seconds

export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>(1);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Step 2 OTP states
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [otpError, setOtpError] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [timerLeft, setTimerLeft] = useState(RESEND_TIMEOUT);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Step 3 Password states
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  // General alert error
  const [generalError, setGeneralError] = useState("");

  // Loading state
  const [isPending, startTransition] = useTransition();

  // Handle countdown timer for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timerLeft > 0) {
      interval = setInterval(() => {
        setTimerLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerLeft === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timerLeft]);

  // Mask phone number for display (e.g. 0912***5678)
  const maskedPhone = (raw: string) => {
    const norm = normalizeDigits(raw);
    if (norm.length >= 11) {
      return norm.slice(0, 4) + "***" + norm.slice(-4);
    }
    return norm;
  };

  // Helper for password strength (1 to 4)
  const getPasswordStrength = (val: string) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (val.length >= 12) score++;
    if (/[a-zA-Z]/.test(val) && /\d/.test(val)) score++;
    if (/[^a-zA-Z0-9]/.test(val)) score++;
    return Math.min(score, 4);
  };

  const strengthScore = getPasswordStrength(password);

  // Focus first OTP field when entering Step 2
  const focusFirstOtp = () => {
    setTimeout(() => {
      otpInputsRef.current[0]?.focus();
    }, 150);
  };

  // --- STEP 1 HANDLER: Request OTP ---
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError("");
    setGeneralError("");

    const normPhone = normalizeDigits(phone.trim());
    if (!normPhone) {
      setPhoneError("شماره موبایل را وارد کنید.");
      return;
    }

    if (!/^09\d{9}$/.test(normPhone)) {
      setPhoneError("شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.");
      return;
    }

    startTransition(async () => {
      try {
        await authService.forgotPasswordRequest({
          identifier: normPhone,
          phone_number: normPhone,
        });

        setTimerLeft(RESEND_TIMEOUT);
        setIsTimerActive(true);
        setStep(2);
        focusFirstOtp();
      } catch (err) {
        if (err instanceof ApiError) {
          setGeneralError(err.detail || "کاربری با این شماره موبایل یافت نشد.");
        } else if (err instanceof Error) {
          setGeneralError(err.message);
        } else {
          setGeneralError("ارسال پیامک با خطا مواجه شد. لطفاً مجدداً تلاش کنید.");
        }
      }
    });
  };

  // --- STEP 2 HANDLERS: OTP ---
  const handleOtpChange = (index: number, val: string) => {
    setOtpError("");
    setGeneralError("");
    const clean = normalizeDigits(val).slice(-1);
    const newOtp = [...otp];
    newOtp[index] = clean;
    setOtp(newOtp);

    if (clean && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    } else if (e.key === "ArrowRight" && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = normalizeDigits(e.clipboardData.getData("text")).replace(
      /\D/g,
      "",
    );
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtp(newOtp);
    const targetFocusIndex = Math.min(pasted.length, 5);
    otpInputsRef.current[targetFocusIndex]?.focus();
  };

  const handleResendOtp = () => {
    if (isTimerActive || isPending) return;
    setOtp(Array(6).fill(""));
    setOtpError("");
    setGeneralError("");

    startTransition(async () => {
      try {
        const normPhone = normalizeDigits(phone.trim());
        await authService.forgotPasswordRequest({
          identifier: normPhone,
          phone_number: normPhone,
        });
        setTimerLeft(RESEND_TIMEOUT);
        setIsTimerActive(true);
        focusFirstOtp();
      } catch (err) {
        if (err instanceof ApiError) {
          setGeneralError(err.detail || "ارسال مجدد پیامک با خطا مواجه شد.");
        } else {
          setGeneralError("ارسال مجدد با خطا مواجه شد.");
        }
      }
    });
  };

  const lastSubmittedForgotOtpRef = useRef<string>("");

  const verifyForgotOtp = useCallback((codeToVerify: string) => {
    const code = normalizeDigits(codeToVerify);
    if (code.length < 6) {
      setOtpError("کد ۶ رقمی را کامل وارد کنید.");
      return;
    }
    setOtpError("");
    setGeneralError("");
    lastSubmittedForgotOtpRef.current = code;

    startTransition(async () => {
      try {
        const normPhone = normalizeDigits(phone.trim());
        const res = await authService.forgotPasswordVerify({
          identifier: normPhone,
          code,
        });

        if (res.reset_token) {
          setResetToken(res.reset_token);
        }
        setStep(3);
      } catch (err) {
        if (err instanceof ApiError) {
          setOtpError(err.detail || "کد تأیید وارد شده نامعتبر یا منقضی شده است.");
        } else if (err instanceof Error) {
          setOtpError(err.message);
        } else {
          setOtpError("تأیید کد با خطا مواجه شد.");
        }
      }
    });
  }, [phone]);

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyForgotOtp(otp.join(""));
  };

  // Auto-submit OTP in step 2 as soon as all 6 digits are entered
  useEffect(() => {
    const fullOtp = otp.join("");
    if (
      step === 2 &&
      fullOtp.length === 6 &&
      !isPending &&
      lastSubmittedForgotOtpRef.current !== fullOtp
    ) {
      verifyForgotOtp(fullOtp);
    }
  }, [otp, step, isPending, verifyForgotOtp]);

  // --- STEP 3 HANDLER: Reset Password ---
  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setConfirmError("");
    setGeneralError("");

    if (!password) {
      setPasswordError("رمز عبور جدید را وارد کنید.");
      return;
    }
    if (password.length < 8) {
      setPasswordError("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }
    if (/^\d+$/.test(password)) {
      setPasswordError("رمز عبور نمی‌تواند فقط عدد باشد.");
      return;
    }
    if (passwordConfirm !== password) {
      setConfirmError("رمز عبور و تکرار آن یکسان نیست.");
      return;
    }

    startTransition(async () => {
      try {
        const normPhone = normalizeDigits(phone.trim());
        const code = normalizeDigits(otp.join(""));

        await authService.forgotPasswordConfirm({
          reset_token: resetToken || undefined,
          phone_number: normPhone,
          code,
          password,
          password_confirm: passwordConfirm,
        });

        setStep(4);
      } catch (err) {
        if (err instanceof ApiError) {
          setGeneralError(err.detail || "ثبت رمز جدید با خطا مواجه شد.");
        } else if (err instanceof Error) {
          setGeneralError(err.message);
        } else {
          setGeneralError("تغییر رمز عبور با خطا مواجه شد. لطفاً مجدداً تلاش کنید.");
        }
      }
    });
  };

  // Format timer into MM:SS in Persian digits
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const secStr = s < 10 ? `۰${toPersianDigits(s)}` : toPersianDigits(s);
    return `ارسال دوباره تا ${toPersianDigits(m)}:${secStr}`;
  };

  return (
    <div>
      {/* STEP COUNTER & PROGRESS BAR */}
      {step < 4 && (
        <>
          <div className="mb-2.5 text-xs font-bold text-ink-faint">
            مرحله‌ی {toPersianDigits(step)} از ۳
          </div>
          <div className="mb-6 flex items-center gap-2">
            {[1, 2, 3].map((dotIndex) => (
              <span
                key={dotIndex}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-300",
                  dotIndex <= step ? "bg-primary" : "bg-border",
                )}
              />
            ))}
          </div>
        </>
      )}

      {/* GENERAL ALERT ERROR */}
      {generalError && (
        <div className="mb-[18px] flex items-start gap-2.5 rounded-[12px] border border-red-200 bg-red-50 p-3 text-[13px] font-semibold leading-[1.85] text-red-700 animate-in fade-in duration-200">
          <AlertCircle className="mt-1 h-[17px] w-[17px] shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* STEP 1: PHONE NUMBER */}
      {step === 1 && (
        <div>
          <div className="mb-6">
            <h1 className="mb-2 text-[22px] font-extrabold text-ink">
              بازیابی رمز عبور
            </h1>
            <p className="text-sm text-ink-faint">
              شماره موبایل حساب خود را وارد کنید تا کد تأیید برایتان ارسال شود.
            </p>
          </div>

          <form onSubmit={handleStep1Submit} noValidate>
            <div className="mb-4">
              <label
                htmlFor="phone-input"
                className="mb-2 block text-[13.5px] font-semibold text-ink"
              >
                شماره موبایل
              </label>
              <div className="relative">
                <input
                  id="phone-input"
                  type="tel"
                  dir="rtl"
                  disabled={isPending}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setPhoneError("");
                    setGeneralError("");
                  }}
                  placeholder="مثلاً ۰۹۱۲۳۴۵۶۷۸۹"
                  autoComplete="tel"
                  className={cn(
                    "w-full rounded-[12px] border-[1.5px] bg-surface py-[13px] pl-3.5 pr-11 text-[14.5px] text-ink transition-all placeholder:text-ink-faint focus:border-primary focus:shadow-[0_0_0_4px_var(--tint)] focus:outline-none",
                    phoneError ? "border-rose-500 focus:shadow-[0_0_0_4px_rgba(244,63,94,0.12)]" : "border-border",
                  )}
                />
                <Smartphone className="pointer-events-none absolute right-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 stroke-ink-faint" />
              </div>
              {phoneError ? (
                <p className="mt-1.5 text-[11.5px] font-semibold text-rose-500">
                  {phoneError}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-ink-faint">
                  همان شماره موبایلی که با آن وارد پنل می‌شوید.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-[12px] btn-ink-gradient py-[14px] text-[15px] font-bold text-white transition-all duration-200 hover:shadow-emerald disabled:opacity-60 cursor-pointer"
            >
              {isPending ? (
                <>
                  <span className="h-[17px] w-[17px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>در حال ارسال…</span>
                </>
              ) : (
                <span>ارسال کد تأیید</span>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-soft">
            رمزتان را به یاد آوردید؟{" "}
            <Link
              href="/login"
              className="font-bold text-primary-dark hover:underline"
            >
              ورود به حساب
            </Link>
          </p>
        </div>
      )}

      {/* STEP 2: VERIFY OTP */}
      {step === 2 && (
        <div>
          <div className="mb-6">
            <h1 className="mb-2 text-[22px] font-extrabold text-ink">
              کد تأیید را وارد کنید
            </h1>
            <p className="text-sm text-ink-faint">
              کد ۶ رقمی ارسال‌شده را وارد کنید.
            </p>
          </div>

          <div className="mb-5 flex items-center justify-between rounded-[10px] bg-tint px-[14px] py-[11px] text-[13.5px] text-ink">
            <span>
              ارسال شد به <b>{maskedPhone(phone)}</b>
            </span>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp(Array(6).fill(""));
                setOtpError("");
                setGeneralError("");
              }}
              className="text-[12.5px] font-bold text-primary-dark hover:underline cursor-pointer"
            >
              تغییر
            </button>
          </div>

          <form onSubmit={handleStep2Submit} noValidate>
            <div
              className={cn("mb-2 flex items-center justify-center gap-1.5 sm:gap-2.5", otpError && "has-error")}
              dir="ltr"
            >
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpInputsRef.current[idx] = el;
                  }}
                  type="text"
                  disabled={isPending}
                  inputMode="numeric"
                  maxLength={1}
                  value={digit ? toPersianDigits(digit) : ""}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  onPaste={handleOtpPaste}
                  aria-label={`رقم ${idx + 1}`}
                  className={cn(
                    "h-11 w-10 sm:h-12 sm:w-11 rounded-[10px] sm:rounded-[12px] border-[1.5px] bg-surface text-center text-base sm:text-lg font-bold text-ink transition-all focus:border-primary focus:shadow-[0_0_0_4px_var(--tint)] focus:outline-none",
                    otpError ? "border-rose-500" : "border-border",
                  )}
                />
              ))}
            </div>

            {otpError && (
              <p className="mb-3 text-[11.5px] font-semibold text-rose-500 text-center">
                {otpError}
              </p>
            )}

            <div className="mb-[22px] mt-2.5 flex items-center justify-between text-xs">
              <span className="text-ink-faint">
                {isTimerActive ? formatTimer(timerLeft) : "کد را دریافت نکردید؟"}
              </span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isTimerActive || isPending}
                className={cn(
                  "font-bold transition-colors cursor-pointer",
                  isTimerActive || isPending
                    ? "cursor-default text-ink-faint"
                    : "text-primary-dark hover:underline",
                )}
              >
                ارسال دوباره
              </button>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-[12px] btn-ink-gradient py-[14px] text-[15px] font-bold text-white transition-all duration-200 hover:shadow-emerald disabled:opacity-60 cursor-pointer"
            >
              {isPending ? (
                <>
                  <span className="h-[17px] w-[17px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>در حال بررسی…</span>
                </>
              ) : (
                <span>تأیید کد</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* STEP 3: RESET PASSWORD */}
      {step === 3 && (
        <div>
          <div className="mb-6">
            <h1 className="mb-2 text-[22px] font-extrabold text-ink">
              رمز عبور تازه
            </h1>
            <p className="text-sm text-ink-faint">
              رمز جدیدی انتخاب کنید تا در پنل برای حسابتان ذخیره شود.
            </p>
          </div>

          <form onSubmit={handleStep3Submit} noValidate>
            <div className="mb-4">
              <label
                htmlFor="new-password"
                className="mb-2 block text-[13.5px] font-semibold text-ink"
              >
                رمز عبور جدید
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  disabled={isPending}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                    setGeneralError("");
                  }}
                  placeholder="حداقل ۸ کاراکتر"
                  autoComplete="new-password"
                  className={cn(
                    "w-full rounded-[12px] border-[1.5px] bg-surface py-[13px] pl-11 pr-11 text-[14.5px] text-ink transition-all placeholder:text-ink-faint focus:border-primary focus:shadow-[0_0_0_4px_var(--tint)] focus:outline-none",
                    passwordError ? "border-rose-500 focus:shadow-[0_0_0_4px_rgba(244,63,94,0.12)]" : "border-border",
                  )}
                />
                <Lock className="pointer-events-none absolute right-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 stroke-ink-faint" />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-faint hover:text-ink cursor-pointer"
                  aria-label={showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
                >
                  {showPassword ? (
                    <EyeOff className="h-[18px] w-[18px]" />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" />
                  )}
                </button>
              </div>

              {/* Password strength meter */}
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4].map((barIndex) => (
                  <span
                    key={barIndex}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors duration-200",
                      barIndex <= strengthScore
                        ? strengthScore === 1
                          ? "bg-rose-500"
                          : strengthScore === 2
                          ? "bg-amber-500"
                          : strengthScore === 3
                          ? "bg-emerald-500"
                          : "bg-primary-dark"
                        : "bg-border",
                    )}
                  />
                ))}
              </div>

              {passwordError ? (
                <p className="mt-1.5 text-[11.5px] font-semibold text-rose-500">
                  {passwordError}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-ink-faint">
                  حداقل ۸ کاراکتر، ترکیبی از حروف و عدد.
                </p>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-[13.5px] font-semibold text-ink"
              >
                تکرار رمز عبور جدید
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  disabled={isPending}
                  value={passwordConfirm}
                  onChange={(e) => {
                    setPasswordConfirm(e.target.value);
                    setConfirmError("");
                    setGeneralError("");
                  }}
                  placeholder="رمز عبور را دوباره وارد کنید"
                  autoComplete="new-password"
                  className={cn(
                    "w-full rounded-[12px] border-[1.5px] bg-surface py-[13px] pl-11 pr-11 text-[14.5px] text-ink transition-all placeholder:text-ink-faint focus:border-primary focus:shadow-[0_0_0_4px_var(--tint)] focus:outline-none",
                    confirmError ? "border-rose-500 focus:shadow-[0_0_0_4px_rgba(244,63,94,0.12)]" : "border-border",
                  )}
                />
                <Lock className="pointer-events-none absolute right-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 stroke-ink-faint" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-faint hover:text-ink cursor-pointer"
                  aria-label={
                    showConfirmPassword
                      ? "مخفی کردن رمز عبور"
                      : "نمایش رمز عبور"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-[18px] w-[18px]" />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" />
                  )}
                </button>
              </div>

              {confirmError ? (
                <p className="mt-1.5 text-[11.5px] font-semibold text-rose-500">
                  {confirmError}
                </p>
              ) : passwordConfirm ? (
                passwordConfirm === password ? (
                  <p className="mt-1.5 text-xs font-semibold text-[#D94A10]">
                    ✓ رمزها یکسان است
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs font-semibold text-rose-500">
                    رمزها یکسان نیست
                  </p>
                )
              ) : (
                <p className="mt-1.5 text-xs">&nbsp;</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-[12px] btn-ink-gradient py-[14px] text-[15px] font-bold text-white transition-all duration-200 hover:shadow-emerald disabled:opacity-60 cursor-pointer"
            >
              {isPending ? (
                <>
                  <span className="h-[17px] w-[17px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>در حال ثبت…</span>
                </>
              ) : (
                <span>ثبت رمز جدید</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* STEP 4: DONE */}
      {step === 4 && (
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-[74px] w-[74px] items-center justify-center rounded-[22px] bg-tint text-primary-dark">
            <Check className="h-9 w-9 stroke-[2.5]" />
          </div>
          <h1 className="mb-2.5 text-[22px] font-extrabold text-ink">
            رمز عبور شما با موفقیت تغییر کرد
          </h1>
          <p className="mb-6 text-sm leading-[1.9] text-ink-soft">
            رمز عبور جدید شما در سیستم ثبت شد. اکنون می‌توانید با رمز جدید وارد حساب کاربری خود شوید.
          </p>
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-[12px] btn-ink-gradient py-[14px] text-[15px] font-bold text-white transition-all duration-200 hover:shadow-emerald"
          >
            ورود به حساب کاربری
          </Link>
        </div>
      )}
    </div>
  );
}
