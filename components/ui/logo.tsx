import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
  href?: string;
}

export function LogoMark({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const box =
    size === "sm"
      ? "h-8 w-8 rounded-[9px] p-1"
      : size === "lg"
        ? "h-10 w-10 rounded-[12px] p-1.5"
        : "h-[34px] w-[34px] rounded-[10px] p-1";

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center bg-[#0B132B] shadow-sm ring-1 ring-white/10",
        box,
        className,
      )}
    >
      <Image
        src="/images/fitlegend-icon.png"
        alt="FitLegend"
        width={36}
        height={36}
        className="h-full w-full object-contain"
        priority
      />
    </span>
  );
}

export function Logo({
  variant = "light",
  className,
  href,
  size,
}: LogoProps & { size?: "sm" | "md" }) {
  const content = (
    <>
      <LogoMark size={size ?? (variant === "dark" && className?.includes("hidden") ? "sm" : "md")} />
      <span>فیتلجند</span>
    </>
  );

  const classes = cn(
    "flex items-center gap-2.5 font-extrabold tracking-tight",
    variant === "light" && "text-xl text-white",
    variant === "dark" && "text-[20px] text-[#0F172A]",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-label="فیتلجند — صفحه اصلی">
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}

export function MobileLogo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Logo
      variant="dark"
      href={href}
      className={cn("mb-8 hidden max-[980px]:flex", className)}
    />
  );
}

