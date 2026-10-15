import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Instagram, Linkedin, Send } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-border pt-[70px] pb-9">
      <div className="mx-auto max-w-[1240px] px-5 min-[640px]:px-8">
        <div className="mb-[50px] grid grid-cols-1 gap-8 min-[640px]:grid-cols-3 min-[981px]:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="mb-4">
              <Logo variant="dark" />
            </div>
            <p className="max-w-[280px] text-[14px] leading-[1.8] text-ink-faint">
              سیستم مدیریت باشگاه برای باشگاه‌داران و مربیانی که می‌خواهند با داده
              تصمیم بگیرند، نه با حدس.
            </p>
          </div>

          <div>
            <h4 className="mb-[18px] text-[14px] font-bold text-ink">شرکت</h4>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/about"
                  className="text-[14px] text-ink-soft transition-colors hover:text-primary-dark"
                >
                  درباره ما
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[14px] text-ink-soft transition-colors hover:text-primary-dark"
                >
                  وبلاگ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[14px] text-ink-soft transition-colors hover:text-primary-dark"
                >
                  فرصت‌های شغلی
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[14px] text-ink-soft transition-colors hover:text-primary-dark"
                >
                  تماس با ما
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-[18px] text-[14px] font-bold text-ink">پشتیبانی</h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="#"
                  className="text-[14px] text-ink-soft transition-colors hover:text-primary-dark"
                >
                  مرکز راهنما
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[14px] text-ink-soft transition-colors hover:text-primary-dark"
                >
                  وضعیت سیستم
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[14px] text-ink-soft transition-colors hover:text-primary-dark"
                >
                  حریم خصوصی
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[14px] text-ink-soft transition-colors hover:text-primary-dark"
                >
                  قوانین استفاده
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-border pt-[30px] min-[640px]:flex-row min-[640px]:items-center">
          <p className="text-[13px] text-ink-faint">
            © ۱۴۰۵ فیتلجند. تمامی حقوق محفوظ است.
          </p>
          <div className="flex items-center gap-3.5">
            <a
              href="#"
              aria-label="اینستاگرام"
              className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-bg transition-colors hover:bg-tint"
            >
              <Instagram className="h-4 w-4 stroke-ink-soft" />
            </a>
            <a
              href="#"
              aria-label="لینکدین"
              className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-bg transition-colors hover:bg-tint"
            >
              <Linkedin className="h-4 w-4 stroke-ink-soft" />
            </a>
            <a
              href="#"
              aria-label="تلگرام"
              className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-bg transition-colors hover:bg-tint"
            >
              <Send className="h-4 w-4 stroke-ink-soft" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
