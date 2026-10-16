import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      fullWidth = true,
      type = "button",
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center gap-2 rounded-[12px] px-0 py-3.5 text-[15px] font-bold transition-all duration-200 ease-in-out disabled:pointer-events-none disabled:opacity-60 [&_svg]:h-[18px] [&_svg]:w-[18px]",
          fullWidth && "w-full",
          variant === "primary" &&
            "btn-ink-gradient text-white hover:-translate-y-px hover:shadow-emerald active:translate-y-0 active:shadow-none",
          variant === "outline" &&
            "w-auto border-[1.5px] border-border bg-surface px-6 py-[13px] text-ink hover:border-primary hover:bg-tint active:bg-tint",
          variant === "ghost" && "bg-transparent text-ink-soft",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
