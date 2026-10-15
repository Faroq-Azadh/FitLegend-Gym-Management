"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  buildPayload,
  buildSuccess,
  FIELD_MAP,
  persianNumber,
  REGISTER_CONFIG,
  type RegisterSuccess,
} from "@/lib/api/register-gym";
import { useRegisterGym } from "@/lib/hooks/queries/use-register-gym";
import { ApiError } from "@/lib/api/errors";
import {
  gymTypeOptions,
  planOptions,
  registerGymSchema,
  type PlanId,
  type RegisterGymFormValues,
} from "@/lib/validations/register";
import { cn } from "@/lib/utils";

const PLAN_NOTES: Record<PlanId, ReactNode> = {
  free: (
    <>
      {persianNumber(REGISTER_CONFIG.freeTrialDays)} روز امکان استفاده از تمامی
      امکانات فیتلجند را دارید.
    </>
  ),
  basic:
    "پلن پایه برای باشگاه‌های تک‌شعبه‌ای تا ۲۰۰ عضو. باشگاه بلافاصله ساخته می‌شود و برای فعال‌سازی پلن به درگاه پرداخت هدایت می‌شوید.",
  pro: "پلن حرفه‌ای برای باشگاه‌های چندشعبه‌ای تا ۱۰۰۰ عضو. باشگاه بلافاصله ساخته می‌شود و برای فعال‌سازی پلن به درگاه پرداخت هدایت می‌شوید.",
  enterprise:
    "پلن سازمانی قیمت‌گذاری سفارشی دارد. باشگاه شما با پلن رایگان ساخته می‌شود و تیم فروش برای تنظیم قرارداد با شما تماس می‌گیرد.",
};

function passwordStrength(value: string): number {
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[a-zA-Z]/.test(value) && /\d/.test(value)) score++;
  if (/[^a-zA-Z0-9]/.test(value)) score++;
  return Math.min(score, 4);
}

const meterColors = ["#F43F5E", "#F59E0B", "#10B981", "var(--primary-dark)"];

interface RegisterFormProps {
  onSuccess?: (success: RegisterSuccess) => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const registerMutation = useRegisterGym();

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterGymFormValues>({
    resolver: zodResolver(registerGymSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      fullName: "",
      gymName: "",
      phone: "",
      email: "",
      city: "",
      gymType: gymTypeOptions[0].value,
      password: "",
      passwordConfirm: "",
      plan: planOptions[0].value,
      terms: false,
    },
  });

  const [alert, setAlert] = useState<string | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const password = watch("password");
  const passwordConfirm = watch("passwordConfirm");
  const plan = watch("plan") as PlanId;

  const strength = password ? passwordStrength(password) : 0;
  const matches = passwordConfirm ? passwordConfirm === password : null;

  const isLoading = isSubmitting || registerMutation.isPending;

  const submitLabel = isLoading
    ? "در حال ساخت باشگاه…"
    : plan === "enterprise"
      ? "ساخت باشگاه و ثبت درخواست فروش"
      : "ساخت باشگاه و ورود به پنل";

  const showAlert = (message: string) => setAlert(message);

  const field = (name: keyof RegisterGymFormValues) => {
    const registered = register(name);
    return {
      ...registered,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        clearErrors(name);
        return registered.onChange(event);
      },
    };
  };

  useEffect(() => {
    if (alert) {
      alertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [alert]);

  const onSubmit = async (values: RegisterGymFormValues) => {
    setAlert(null);
    const payload = buildPayload(values);

    try {
      const data = await registerMutation.mutateAsync(payload);
      onSuccess?.(buildSuccess(data, payload));
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          showAlert(
            "تعداد درخواست‌ها زیاد بوده است. چند دقیقه صبر کنید و دوباره تلاش کنید.",
          );
          return;
        }
        if (err.status >= 500) {
          showAlert(
            "خطایی در سرور رخ داد. کمی بعد دوباره تلاش کنید؛ اگر تکرار شد با پشتیبانی تماس بگیرید.",
          );
          return;
        }

        const generalMessages: string[] = [];
        let firstBad: keyof RegisterGymFormValues | null = null;

        // Map backend field errors from Django DRF to form fields
        Object.entries(err.fieldErrors).forEach(([backendKey, messages]) => {
          const message = messages.join(" ");
          if (
            backendKey === "non_field_errors" ||
            backendKey === "detail" ||
            backendKey === "message" ||
            backendKey === "__all__"
          ) {
            generalMessages.push(message);
            return;
          }

          const target = FIELD_MAP[backendKey];
          if (target) {
            setError(target, { message });
            if (!firstBad) firstBad = target;
          } else {
            generalMessages.push(message);
          }
        });

        if (
          err.detail &&
          !generalMessages.includes(err.detail) &&
          Object.keys(err.fieldErrors).length === 0
        ) {
          generalMessages.push(err.detail);
        }

        if (generalMessages.length > 0) {
          showAlert(generalMessages.join(" "));
        } else if (!firstBad) {
          showAlert(
            "ثبت‌نام انجام نشد. اطلاعات واردشده را بررسی کنید و دوباره تلاش کنید.",
          );
        }

        if (firstBad && generalMessages.length === 0) {
          setFocus(firstBad);
        }
      } else {
        showAlert(
          "ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.",
        );
      }
    }
  };

  const onInvalid = (formErrors: FieldErrors<RegisterGymFormValues>) => {
    if (formErrors.terms?.message) showAlert(String(formErrors.terms.message));
    else setAlert(null);
  };

  return (
    <>
      {alert && (
        <div
          ref={alertRef}
          role="alert"
          className="mb-[18px] flex items-start gap-2.5 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-3 text-[13px] font-semibold leading-[1.85] text-[#B91C1C]"
        >
          <AlertCircle
            className="mt-1 h-[17px] w-[17px] shrink-0"
            strokeWidth={2}
          />
          <span>{alert}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
        <div className="grid grid-cols-2 gap-4 max-[520px]:grid-cols-1">
          <Field
            id="fullName"
            label="نام و نام خانوادگی مدیر"
            required
            error={errors.fullName?.message}
          >
            <Input
              id="fullName"
              autoComplete="name"
              placeholder="مثلاً علی محمدی"
              error={!!errors.fullName}
              {...field("fullName")}
            />
          </Field>

          <Field
            id="gymName"
            label="نام باشگاه"
            required
            error={errors.gymName?.message}
          >
            <Input
              id="gymName"
              placeholder="مثلاً باشگاه فیتلجند اسپرت"
              error={!!errors.gymName}
              {...field("gymName")}
            />
          </Field>

          <Field
            id="phone"
            label="شماره موبایل"
            required
            error={errors.phone?.message}
          >
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              dir="ltr"
              className="text-right"
              error={!!errors.phone}
              {...field("phone")}
            />
          </Field>

          <Field
            id="email"
            label="ایمیل"
            required
            hint="برای ورود به پنل از همین ایمیل استفاده می‌کنید."
            error={errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              dir="ltr"
              className="text-right"
              error={!!errors.email}
              {...field("email")}
            />
          </Field>

          <Field id="city" label="شهر" required error={errors.city?.message}>
            <Input
              id="city"
              placeholder="مثلاً تهران"
              error={!!errors.city}
              {...field("city")}
            />
          </Field>

          <Field id="gymType" label="نوع مجموعه">
            <select
              id="gymType"
              className={cn(controlClass, "select-input")}
              {...register("gymType")}
            >
              {gymTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="password"
            label="رمز عبور"
            required
            hint="حداقل ۸ کاراکتر، ترکیبی از حروف و عدد."
            error={errors.password?.message}
            extra={
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((index) => (
                  <span
                    key={index}
                    className="h-1 flex-1 rounded-full bg-border transition-colors duration-[220ms] ease-in-out"
                    style={
                      index < strength
                        ? { background: meterColors[strength - 1] }
                        : undefined
                    }
                  />
                ))}
              </div>
            }
          >
            <PasswordWrap
              visible={showPassword}
              onToggle={() => setShowPassword((prev) => !prev)}
            >
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="حداقل ۸ کاراکتر"
                dir="ltr"
                className="pl-[42px] text-right"
                error={!!errors.password}
                {...field("password")}
              />
            </PasswordWrap>
          </Field>

          <Field
            id="passwordConfirm"
            label="تکرار رمز عبور"
            required
            error={errors.passwordConfirm?.message}
            hintNode={
              <span
                className="text-[11.5px]"
                style={{
                  color:
                    matches === null
                      ? undefined
                      : matches
                        ? "#0FBF87"
                        : "#F43F5E",
                }}
              >
                {matches === null
                  ? "\u00A0"
                  : matches
                    ? "✓ رمزها یکسان است"
                    : "رمزها یکسان نیست"}
              </span>
            }
          >
            <PasswordWrap
              visible={showPasswordConfirm}
              onToggle={() => setShowPasswordConfirm((prev) => !prev)}
            >
              <Input
                id="passwordConfirm"
                type={showPasswordConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="رمز عبور را دوباره وارد کنید"
                dir="ltr"
                className="pl-[42px] text-right"
                error={!!errors.passwordConfirm}
                {...field("passwordConfirm")}
              />
            </PasswordWrap>
          </Field>

          <Field
            id="plan"
            label="پلن باشگاه"
            required
            full
            error={errors.plan?.message}
          >
            <select
              id="plan"
              className={cn(controlClass, "select-input")}
              {...field("plan")}
            >
              {planOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="col-span-full flex items-start gap-2.5 rounded-[12px] border border-[#C6F1E1] bg-tint px-3.5 py-3 text-[12.5px] leading-[1.9] text-[#0B7357]">
            <Info
              className="mt-1 h-4 w-4 shrink-0 text-primary-dark"
              strokeWidth={2}
            />
            <span>{PLAN_NOTES[plan] ?? null}</span>
          </div>
        </div>

        <div className="mt-5 mb-[22px] flex items-start gap-[9px]">
          <input
            type="checkbox"
            id="terms"
            className="mt-px h-[17px] w-[17px] shrink-0 rounded accent-primary"
            {...register("terms")}
          />
          <label htmlFor="terms" className="text-[13px] leading-[1.7] text-ink-soft">
            با{" "}
            <a href="#" className="font-semibold text-primary-dark">
              قوانین استفاده
            </a>{" "}
            و{" "}
            <a href="#" className="font-semibold text-primary-dark">
              حریم خصوصی
            </a>{" "}
            فیتلجند موافقم.
          </label>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <span
              className="h-[17px] w-[17px] animate-spin rounded-full border-[2.5px] border-white/30 border-t-white"
              aria-hidden
            />
          ) : (
            <Plus className="h-[18px] w-[18px]" strokeWidth={2} />
          )}
          {submitLabel}
        </Button>
      </form>
    </>
  );
}

const controlClass =
  "w-full rounded-[12px] border-[1.5px] border-border bg-surface px-3.5 py-3 text-[13.5px] text-ink outline-none transition-all duration-200 ease-in-out placeholder:text-ink-faint focus:border-primary focus:shadow-[0_0_0_4px_var(--tint)]";

function PasswordWrap({
  visible,
  onToggle,
  children,
}: {
  visible: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const Icon = visible ? EyeOff : Eye;
  return (
    <div className="relative">
      {children}
      <button
        type="button"
        onClick={onToggle}
        aria-label={visible ? "پنهان‌کردن رمز عبور" : "نمایش رمز عبور"}
        className="absolute top-1/2 left-[7px] flex h-[30px] w-[30px] -translate-y-1/2 items-center justify-center rounded-lg text-ink-faint transition-all duration-[180ms] ease-in-out hover:bg-bg hover:text-ink-soft"
      >
        <Icon className="h-[17px] w-[17px]" strokeWidth={2} />
      </button>
    </div>
  );
}

function Field({
  id,
  label,
  required,
  full,
  hint,
  hintNode,
  extra,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  full?: boolean;
  hint?: string;
  hintNode?: ReactNode;
  extra?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-[7px]", full && "col-span-full")}>
      <label htmlFor={id} className="text-[13px] font-bold text-ink">
        {label} {required && <span className="text-[#F43F5E]">*</span>}
      </label>
      {children}
      {extra}
      {!error && hint && <p className="text-[11.5px] text-ink-faint">{hint}</p>}
      {!error && hintNode}
      {error && (
        <p className="text-[11.5px] font-semibold leading-[1.7] text-[#F43F5E]">
          {error}
        </p>
      )}
    </div>
  );
}
