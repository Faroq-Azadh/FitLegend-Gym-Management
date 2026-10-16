import { useRef } from "react";
import { ProfileUserData } from "./types";
import { toPersianDigits } from "@/lib/persian-digits";
import { LogOut } from "lucide-react";
import { compressAvatarImage } from "@/lib/manager-avatar";

interface ProfileSummaryCardProps {
  user: ProfileUserData;
  onUpdateUser?: (updated: Partial<ProfileUserData>) => void;
  onLogoutClick?: () => void;
}

export function ProfileSummaryCard({ user, onUpdateUser, onLogoutClick }: ProfileSummaryCardProps) {
  const fullName = `${user.firstName} ${user.lastName}`;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("لطفاً یک فایل تصویری معتبر انتخاب کنید.");
      return;
    }

    try {
      const compressed = await compressAvatarImage(file);
      if (compressed) {
        onUpdateUser?.({ avatarUrl: compressed });
      }
    } catch (err) {
      console.warn("Failed to process avatar image:", err);
    }
  };

  return (
    <div className="overflow-hidden rounded-[16px] border border-border bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      {/* Hidden File Input for Avatar Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Gradient Cover */}
      <div className="relative h-[96px] bg-gradient-to-br from-primary to-cyan">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_120%,rgba(255,255,255,0.25),transparent_60%)]" />
      </div>

      {/* Profile Body */}
      <div className="px-[22px] pb-[22px] text-center">
        {/* Big Avatar */}
        <div className="relative -mt-[46px] mx-auto mb-[14px] flex h-[92px] w-[92px] items-center justify-center rounded-[24px] border-[4px] border-surface bg-gradient-to-br from-primary to-cyan text-[32px] font-extrabold text-ink shadow-[0_4px_16px_rgba(15,23,42,0.08)]">
          {user.avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={user.avatarUrl}
              alt={fullName}
              className="h-full w-full rounded-[20px] object-cover"
            />
          ) : (
            <span>آو</span>
          )}
          {/* Camera upload button */}
          <button
            type="button"
            onClick={handleCameraClick}
            className="absolute -bottom-[4px] -left-[4px] flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[10px] border-[3px] border-surface btn-ink-gradient text-white transition-all hover:scale-105"
            title="انتخاب تصویر جدید برای پروفایل"
            aria-label="تغییر تصویر پروفایل"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[14px] w-[14px]"
            >
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </button>
        </div>

        {/* User Name */}
        <h2 className="text-[19px] font-extrabold text-ink">{fullName}</h2>

        {/* Role Badge */}
        <div className="mt-[8px] inline-flex items-center gap-[6px] rounded-full bg-tint px-[12px] py-[5px] text-[12px] font-bold text-primary-dark">
          <span className="h-[6px] w-[6px] rounded-full bg-primary" />
          <span>{user.role}</span>
        </div>

        {/* Info List */}
        <div className="mt-[20px] flex flex-col text-right">
          {/* Email */}
          <div className="flex items-center gap-[12px] border-b border-border py-[11px]">
            <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-bg text-ink-soft">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[16px] w-[16px]"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-10 5L2 7" />
              </svg>
            </span>
            <div className="min-w-0">
              <div className="text-[11.5px] font-medium text-ink-faint">ایمیل</div>
              <div className="truncate text-[13.5px] font-bold text-ink dir-ltr text-right">
                {user.email}
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div className="flex items-center gap-[12px] border-b border-border py-[11px]">
            <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-bg text-ink-soft">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[16px] w-[16px]"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
            <div className="min-w-0">
              <div className="text-[11.5px] font-medium text-ink-faint">
                شماره تماس
              </div>
              <div className="text-[13.5px] font-bold text-ink">
                {toPersianDigits(user.phone)}
              </div>
            </div>
          </div>

          {/* Branch */}
          <div className="flex items-center gap-[12px] border-b border-border py-[11px]">
            <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-bg text-ink-soft">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[16px] w-[16px]"
              >
                <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
                <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
              </svg>
            </span>
            <div className="min-w-0">
              <div className="text-[11.5px] font-medium text-ink-faint">شعبه</div>
              <div className="text-[13.5px] font-bold text-ink">
                {user.branch}
              </div>
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-center gap-[12px] py-[11px]">
            <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-bg text-ink-soft">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[16px] w-[16px]"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </span>
            <div className="min-w-0">
              <div className="text-[11.5px] font-medium text-ink-faint">
                عضو از
              </div>
              <div className="text-[13.5px] font-bold text-ink">
                {user.memberSince}
              </div>
            </div>
          </div>
        </div>

        {/* Logout Action Button */}
        {onLogoutClick && (
          <div className="mt-[20px] pt-[16px] border-t border-border">
            <button
              type="button"
              onClick={onLogoutClick}
              className="flex w-full items-center justify-center gap-[8px] rounded-[12px] border border-[#FCA5A5] bg-[#FEF2F2] p-[10px_16px] text-[13px] font-bold text-[#DC2626] transition-all hover:bg-[#FEE2E2] hover:shadow-xs active:scale-[0.98]"
            >
              <LogOut className="h-[16px] w-[16px]" />
              <span>خروج از پنل مدیریت</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
