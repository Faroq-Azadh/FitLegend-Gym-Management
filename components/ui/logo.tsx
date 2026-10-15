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
      ? "h-9 w-9 rounded-[10px] p-0.5"
      : size === "lg"
        ? "h-[50px] w-[50px] rounded-[14px] p-1.5"
        : "h-[42px] w-[42px] rounded-[12px] p-1";

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center bg-[#0B132B] shadow-sm ring-1 ring-white/10 overflow-hidden",
        box,
        className,
      )}
    >
      <Image
        src="/images/fitlegend-icon.png"
        alt="فیتلجند"
        width={48}
        height={48}
        className="h-full w-full object-contain scale-110"
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
      <span className="font-extrabold tracking-tight">فیت لجند</span>
    </>
  );

  const classes = cn(
    "flex items-center gap-3 font-extrabold tracking-tight",
    variant === "light" && "text-xl text-white",
    variant === "dark" && "text-[21px] text-[#0F172A]",
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

