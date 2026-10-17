"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/input";
import {
  loginPasswordSchema,
  type LoginPasswordFormValues,
} from "@/lib/validations/login";
import { normalizeDigits } from "@/lib/persian-digits";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  onSubmit?: (values: LoginPasswordFormValues) => void;
  onSuccess?: () => void;
}

export function LoginForm({ onSubmit, onSuccess }: LoginFormProps) {
  const router = useRouter();
  const { loginWithPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginPasswordFormValues>({
    resolver: zodResolver(loginPasswordSchema),
    defaultValues: {
      identifier: "",
      password: "",
      remember: false,
    },
  });

  // Preload saved credentials if "Remember Me" was previously selected
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const isRemembered = localStorage.getItem("fitlegend_remember_me") === "true";
        if (isRemembered) {
          const savedId = localStorage.getItem("fitlegend_saved_identifier") || "";
          const savedPass = localStorage.getItem("fitlegend_saved_password") || "";
          if (savedId) setValue("identifier", savedId);
          if (savedPass) setValue("password", savedPass);
          setValue("remember", true);
        }
      } catch {
        // Ignore localStorage access restrictions
      }
    }
  }, [setValue]);

  const handleFormSubmit = async (values: LoginPasswordFormValues) => {
    if (onSubmit) {
      onSubmit(values);
      return;
    }

    try {
      setIsLoading(true);
      setApiError(null);

      const normalizedIdentifier = normalizeDigits(values.identifier.trim());

      const res = await loginWithPassword({
        identifier: normalizedIdentifier,
        password: values.password,
      });

      // Always cache current active session password for profile security tab
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("fitlegend_user_password", values.password);
          localStorage.setItem("fitlegend_saved_password", values.password);
          sessionStorage.setItem("fitlegend_active_password", values.password);
        } catch {}
      }

      // Handle Remember Me persistence
      if (typeof window !== "undefined") {
        try {
          if (values.remember) {
            localStorage.setItem("fitlegend_remember_me", "true");
            localStorage.setItem("fitlegend_saved_identifier", normalizedIdentifier);
            localStorage.setItem("fitlegend_saved_password", values.password);
          } else {
            localStorage.removeItem("fitlegend_remember_me");
            localStorage.removeItem("fitlegend_saved_identifier");
            localStorage.removeItem("fitlegend_saved_password");
          }
        } catch {
          // Ignore storage errors
        }
      }

      if (onSuccess) {
        onSuccess();
      } else {
        // Direct users based on their role
        const role = res?.user?.role ? String(res.user.role).trim().toUpperCase() : "";
        if (role === "COACH") {
          router.push("/coach");
        } else if (role === "MEMBER") {
          router.push("/athlete");
        } else if (role === "OWNER") {
          router.push("/admin");
        } else {
          router.push("/athlete"); // fallback for athlete/members
        }
      }
    } catch (err) {
      if (err instanceof ApiError && err.isNetworkError) {
        setApiError("سرور در دسترس نیست؛ برای ورود به پنل، می‌توانید از گزینه‌های ورود سریع زیر استفاده کنید.");
      } else if (err instanceof ApiError) {
        setApiError(err.detail || "نام کاربری یا رمز عبور اشتباه است.");
      } else if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError("خطایی در ورود رخ داد. لطفاً مجدداً تلاش کنید.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: "OWNER" | "COACH" | "MEMBER") => {
    const demoUser = {
      id: "demo-" + role.toLowerCase(),
      email: role === "OWNER" ? "admin@fitlegend.ir" : role === "COACH" ? "coach@fitlegend.ir" : "athlete@fitlegend.ir",
      phone_number: "09123456789",
      is_phone_verified: true,
      full_name: role === "OWNER" ? "علی حسینی" : role === "COACH" ? "آرش رستمی" : "سارا محمدی",
      avatar: null,
      role,
      date_joined: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("fitlegend_user", JSON.stringify(demoUser));
        localStorage.setItem("fitlegend_session_refreshable", "true");
        localStorage.setItem("fitlegend_access_token", "demo-token");
      } catch {}
    }
    if (role === "OWNER") {
      router.push("/admin");
    } else if (role === "COACH") {
      router.push("/coach");
    } else {
      router.push("/athlete");
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      {apiError && (
        <div className="mb-4 flex items-center gap-2.5 rounded-[10px] border border-rose-200 bg-rose-50/90 p-3 text-[13px] text-rose-700 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{apiError}</span>
        </div>
      )}

      <div className="mb-4">
        <label
          htmlFor="login-id"
          className="mb-2 block text-[13.5px] font-semibold text-ink"
        >
          شماره موبایل یا ایمیل
        </label>
        <FormInput
          id="login-id"
          type="text"
          placeholder="مثلاً ۰۹۱۲۳۴۵۶۷۸۹ یا name@email.com"
          autoComplete="username"
          error={!!errors.identifier}
          icon={<Mail strokeWidth={2} />}
          disabled={isLoading}
          {...register("identifier")}
        />
        {errors.identifier && (
          <p className="mt-1.5 text-xs text-rose-500">{errors.identifier.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="login-pass"
          className="mb-2 block text-[13.5px] font-semibold text-ink"
        >
          رمز عبور
        </label>
        <FormInput
          id="login-pass"
          type={showPassword ? "text" : "password"}
          placeholder="رمز عبور خود را وارد کنید"
          autoComplete="current-password"
          disabled={isLoading}
          error={!!errors.password}
          icon={<Lock strokeWidth={2} />}
          toggle={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff strokeWidth={2} />
              ) : (
                <Eye strokeWidth={2} />
              )}
            </button>
          }
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1.5 text-xs text-rose-500">{errors.password.message}</p>
        )}
      </div>

      <div className="mb-[22px] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            disabled={isLoading}
            className="h-[17px] w-[17px] rounded accent-primary cursor-pointer"
            {...register("remember")}
          />
          <label htmlFor="remember" className="text-[13.5px] text-ink-soft cursor-pointer">
            مرا به خاطر بسپار
          </label>
        </div>
        <Link
          href="/forgot-password"
          className={cn(
            "text-[13.5px] font-semibold text-primary-dark hover:underline",
          )}
        >
          فراموشی رمز عبور؟
        </Link>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            در حال ورود...
          </span>
        ) : (
          "ورود به پنل"
        )}
      </Button>

      <div className="mt-5 border-t border-border pt-4">
        <p className="mb-2.5 text-center text-[12px] font-semibold text-ink-faint">
          ورود سریع به پنل‌ها (نسخه آزمایشی / دمو):
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemoLogin("OWNER")}
            className="flex items-center justify-center rounded-[8px] border border-border bg-surface px-2 py-2 text-[12.5px] font-bold text-ink transition-all hover:border-primary hover:bg-tint hover:text-primary-dark"
          >
            پنل مدیر
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin("COACH")}
            className="flex items-center justify-center rounded-[8px] border border-border bg-surface px-2 py-2 text-[12.5px] font-bold text-ink transition-all hover:border-primary hover:bg-tint hover:text-primary-dark"
          >
            پنل مربی
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin("MEMBER")}
            className="flex items-center justify-center rounded-[8px] border border-border bg-surface px-2 py-2 text-[12.5px] font-bold text-ink transition-all hover:border-primary hover:bg-tint hover:text-primary-dark"
          >
            ورزشکار
          </button>
        </div>
      </div>
    </form>
  );
}
