"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to hash on page load or after route transition
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.replace("#", "");
      const element = document.getElementById(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    }
  }, [pathname]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
  ) => {
    setMobileMenuOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", `/#${targetId}`);
      }
    } else {
      e.preventDefault();
      router.push(`/#${targetId}`);
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-[#FAFAF9]/85 backdrop-blur-md transition-all duration-300",
        isScrolled ? "border-b border-border shadow-sm" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-5 min-[640px]:px-8">
        <Logo href="/" variant="dark" className="text-xl text-[#0F172A]" />

        <nav className="hidden items-center gap-9 min-[981px]:flex">
          <a
            href="/#features"
            onClick={(e) => handleNavClick(e, "features")}
            className="text-[15px] font-medium text-ink-soft transition-colors hover:text-ink"
          >
            امکانات
          </a>
          <a
            href="/#how"
            onClick={(e) => handleNavClick(e, "how")}
            className="text-[15px] font-medium text-ink-soft transition-colors hover:text-ink"
          >
            نحوه کار
          </a>
          <a
            href="/#analytics"
            onClick={(e) => handleNavClick(e, "analytics")}
            className="text-[15px] font-medium text-ink-soft transition-colors hover:text-ink"
          >
            تحلیل داده
          </a>
          <a
            href="/#pricing"
            onClick={(e) => handleNavClick(e, "pricing")}
            className="text-[15px] font-medium text-ink-soft transition-colors hover:text-ink"
          >
            تعرفه‌ها
          </a>
          <Link
            href="/about"
            className={cn(
              "text-[15px] font-medium transition-colors hover:text-ink",
              pathname === "/about" ? "font-bold text-primary-dark" : "text-ink-soft"
            )}
          >
            درباره ما
          </Link>
        </nav>

        <div className="hidden items-center gap-3 min-[981px]:flex">
          <Link
            href="/login"
            className="px-[18px] py-[11px] text-[15px] font-semibold text-ink transition-colors hover:text-primary-dark"
          >
            ورود
          </Link>
          <Link
            href="/register-gym"
            className="rounded-[12px] bg-ink px-[24px] py-[11px] text-[15px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-emerald"
          >
            ثبت‌نام
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-lg min-[981px]:hidden"
          aria-label="منو"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 stroke-ink" />
          ) : (
            <Menu className="h-6 w-6 stroke-ink" />
          )}
        </button>
      </div>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-surface px-5 py-6 shadow-md min-[981px]:hidden">
          <nav className="flex flex-col gap-4">
            <a
              href="/#features"
              onClick={(e) => handleNavClick(e, "features")}
              className="text-[15px] font-semibold text-ink-soft hover:text-ink"
            >
              امکانات
            </a>
            <a
              href="/#how"
              onClick={(e) => handleNavClick(e, "how")}
              className="text-[15px] font-semibold text-ink-soft hover:text-ink"
            >
              نحوه کار
            </a>
            <a
              href="/#analytics"
              onClick={(e) => handleNavClick(e, "analytics")}
              className="text-[15px] font-semibold text-ink-soft hover:text-ink"
            >
              تحلیل داده
            </a>
            <a
              href="/#pricing"
              onClick={(e) => handleNavClick(e, "pricing")}
              className="text-[15px] font-semibold text-ink-soft hover:text-ink"
            >
              تعرفه‌ها
            </a>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "text-[15px] font-semibold hover:text-ink",
                pathname === "/about" ? "font-bold text-primary-dark" : "text-ink-soft"
              )}
            >
              درباره ما
            </Link>
            <hr className="my-2 border-border" />
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-[12px] border border-border py-3 text-[15px] font-semibold text-ink"
              >
                ورود
              </Link>
              <Link
                href="/register-gym"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-[12px] bg-ink py-3 text-[15px] font-semibold text-white hover:bg-primary-dark"
              >
                ثبت‌نام
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
