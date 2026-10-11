"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/input";
import { useOtpInput } from "@/lib/hooks/use-otp-input";
import { useOtpTimer } from "@/lib/hooks/use-otp-timer";
import {
  loginOtpRequestSchema,
  loginOtpVerifySchema,
  type LoginOtpRequestFormValues,
} from "@/lib/validations/login";
import { normalizeDigits, toPersianDigits } from "@/lib/persian-digits";
import { useAuth } from "@/lib/auth-context";
import { tokenStorage } from "@/lib/api/token";
import { ApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

interface OtpFormProps {
  onVerify?: (otp: string) => void;
  onSuccess?: () => void;
}

export function OtpForm({ onVerify, onSuccess }: OtpFormProps) {
  const router = useRouter();
  const { requestOtp, verifyOtp } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [target, setTarget] = useState("۰۹۱۲۳۴۵۶۷۸۹");
  const [rawPhone, setRawPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { timerLabel, canResend, startTimer, resetTimer } = useOtpTimer();
  const {
    values,
    otpValue,
    setRef,
    handleChange,
    handleKeyDown,
    handlePaste,
    reset,
    focusInput,
  } = useOtpInput(6);
  const [otpError, setOtpError] = useState<string | null>(null);

  const requestForm = useForm<LoginOtpRequestFormValues>({
    resolver: zodResolver(loginOtpRequestSchema),
    defaultValues: { phone: "" },
  });

  const { ref: phoneRef, onBlur: onPhoneBlur } = requestForm.register("phone");
  const phone = requestForm.watch("phone");

  useEffect(() => {
    if (step === 2) {
      focusInput(0);
    }
  }, [step, focusInput]);

  const handleRequestOtp = async (values: LoginOtpRequestFormValues) => {
    const normalized = normalizeDigits(values.phone.trim());
    setRawPhone(normalized);
    setApiError(null);
    setIsLoading(true);

    try {
      await requestOtp({ identifier: normalized });
      setTarget(toPersianDigits(normalized));
      setStep(2);
      setOtpError(null);
      reset();
      startTimer();
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.detail || "ارسال پیامک با خطا مواجه شد.");
      } else if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError("ارسال کد تایید با خطا مواجه شد. لطفاً مجدداً تلاش کنید.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setOtpError(null);
    setApiError(null);
    reset();
  };

  const lastSubmittedOtpRef = useRef<string>("");

  const handleVerify = useCallback(async (codeToVerify?: string) => {
    const code = codeToVerify || otpValue;
    const result = loginOtpVerifySchema.safeParse({ otp: code });
    if (!result.success) {
      setOtpError(result.error.issues[0].message);
      focusInput(code.length);
      return;
    }
    setOtpError(null);
    setApiError(null);
    lastSubmittedOtpRef.current = code;

    if (onVerify) {
      onVerify(code);
      return;
    }

    try {
      setIsLoading(true);
      const res = await verifyOtp({
        identifier: rawPhone,
        code: normalizeDigits(code),
      });

      if (onSuccess) {
        onSuccess();
      } else {
        const user = "user" in res ? res.user : null;
        if (user || tokenStorage.hasValidSession()) {
          if (user?.role === "COACH") {
            router.push("/coach");
          } else if (user?.role === "MEMBER") {
            router.push("/athlete");
          } else {
            router.push("/admin");
          }
        } else {
          setOtpError("کد تأیید شد اما بارگذاری اطلاعات حساب با مشکل مواجه شد. لطفاً دوباره امتحان کنید.");
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setOtpError(err.detail || "کد وارد شده نامعتبر یا منقضی شده است.");
      } else if (err instanceof Error) {
        setOtpError(err.message);
      } else {
        setOtpError("تأیید کد با خطا مواجه شد.");
      }
      focusInput(0);
    } finally {
      setIsLoading(false);
    }
  }, [focusInput, loginOtpVerifySchema, onVerify, onSuccess, rawPhone, router, verifyOtp, otpValue]);

  // Auto-submit as soon as all 6 digits are entered
  useEffect(() => {
    if (
      step === 2 &&
      otpValue.length === 6 &&
      !isLoading &&
      lastSubmittedOtpRef.current !== otpValue
    ) {
      handleVerify(otpValue);
    }
  }, [otpValue, step, isLoading, handleVerify]);

  const handleResend = async () => {
    if (!canResend || !rawPhone || isLoading) return;
    setOtpError(null);
    setApiError(null);
    setIsLoading(true);

    try {
      await requestOtp({ identifier: rawPhone });
      reset();
      resetTimer();
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.detail || "ارسال مجدد کد با خطا مواجه شد.");
      } else {
        setApiError("ارسال مجدد با خطا مواجه شد.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 1) {
    return (
      <form onSubmit={requestForm.handleSubmit(handleRequestOtp)} noValidate>
        {apiError && (
          <div className="mb-4 flex items-center gap-2.5 rounded-[10px] border border-rose-200 bg-rose-50/90 p-3 text-[13px] text-rose-700 animate-in fade-in duration-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{apiError}</span>
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="login-otp-id"
            className="mb-2 block text-[13.5px] font-semibold text-ink"
          >
            شماره موبایل
          </label>
          <FormInput
            id="login-otp-id"
            type="tel"
            inputMode="numeric"
            dir="ltr"
            maxLength={11}
            disabled={isLoading}
            className="text-right"
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            autoComplete="tel"
            name="phone"
            ref={phoneRef}
            value={phone}
            onBlur={onPhoneBlur}
            onChange={(event) =>
              requestForm.setValue(
                "phone",
                normalizeDigits(event.target.value).slice(0, 11),
                { shouldValidate: !!requestForm.formState.errors.phone },
              )
            }
            error={!!requestForm.formState.errors.phone}
            icon={<Phone strokeWidth={2} />}
          />
          {requestForm.formState.errors.phone && (
            <p className="mt-1.5 text-xs text-rose-500">
              {requestForm.formState.errors.phone.message}
            </p>
          )}
          <p className="mt-1.5 text-xs text-ink-faint">
            یک کد ۶ رقمی برای شما ارسال می‌شود
          </p>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              در حال ارسال کد...
            </span>
          ) : (
            "ارسال کد تایید"
          )}
        </Button>
      </form>
    );
  }

  return (
    <div>
      {apiError && (
        <div className="mb-4 flex items-center gap-2.5 rounded-[10px] border border-rose-200 bg-rose-50/90 p-3 text-[13px] text-rose-700 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{apiError}</span>
        </div>
      )}

      <div className="mb-5 flex items-center justify-between rounded-[10px] bg-tint px-3.5 py-[11px] text-[13.5px] text-ink">
        <span>
          کد ارسال شد به <b className="font-bold">{target}</b>
        </span>
        <button
          type="button"
          className="text-[12.5px] font-bold text-primary-dark hover:underline cursor-pointer"
          onClick={handleBackToStep1}
        >
          تغییر شماره
        </button>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-[13.5px] font-semibold text-ink">
          کد تایید را وارد کنید
        </label>
        <div className="mb-2 flex items-center justify-center gap-1.5 sm:gap-2.5" dir="ltr">
          {values.map((value, index) => (
            <input
              key={index}
              ref={setRef(index)}
              type="text"
              disabled={isLoading}
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={value}
              aria-label={`رقم ${index + 1} کد تایید`}
              aria-invalid={!!otpError}
              className={cn(
                "h-11 w-10 sm:h-12 sm:w-11 rounded-[10px] sm:rounded-[12px] border-[1.5px] border-border bg-surface text-center text-base sm:text-lg font-bold text-ink outline-none transition-all duration-200 ease-in-out focus:border-primary focus:shadow-[0_0_0_4px_var(--tint)]",
                otpError && "border-rose-500",
              )}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event.key)}
              onPaste={(event) => {
                event.preventDefault();
                handlePaste(index, event.clipboardData.getData("text"));
              }}
            />
          ))}
        </div>
        {otpError && <p className="mt-1.5 text-xs text-rose-500 text-center">{otpError}</p>}
      </div>

      <div className="mb-[22px] mt-2.5 flex items-center justify-between">
        <span className="text-[13px] text-ink-faint">{timerLabel}</span>
        <button
          type="button"
          className={cn(
            "text-[13px] font-bold text-primary-dark transition-colors",
            (!canResend || isLoading) && "cursor-default text-ink-faint",
          )}
          onClick={handleResend}
          disabled={!canResend || isLoading}
        >
          ارسال مجدد کد
        </button>
      </div>

      <Button type="button" onClick={() => handleVerify()} disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            در حال اعتبارسنجی...
          </span>
        ) : (
          "تایید و ورود"
        )}
      </Button>
    </div>
  );
}
