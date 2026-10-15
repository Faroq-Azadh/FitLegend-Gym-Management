"use client";

import Link from "next/link";
import { LogoMark } from "@/components/ui/logo";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface AthleteSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AthleteSidebar({ isOpen, onClose }: AthleteSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const athleteName = user?.full_name?.trim() || "سارا محمدی";
  const athleteRole = "ورزشکار";

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] || "") + (parts[1][0] || "");
    }
    return name.slice(0, 2);
  };

  const isLinkActive = (itemHref: string, exact?: boolean) => {
    if (exact) return pathname === itemHref;
    return pathname === itemHref || pathname.startsWith(itemHref + "/");
  };

  return (
    <>
      {/* ===== SIDEBAR (athlete) ===== */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`} id="sidebar">
        <div className="sidebar-head">
          <Link href="/athlete" className="logo">
            <LogoMark size="sm" />
            فیتلجند
          </Link>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">ورزشکار</div>
          <Link
            href="/athlete"
            className={`nav-item ${isLinkActive("/athlete", true) ? "active" : ""}`}
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth <= 980) onClose();
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="9" rx="1.5" />
              <rect x="14" y="3" width="7" height="5" rx="1.5" />
              <rect x="14" y="12" width="7" height="9" rx="1.5" />
              <rect x="3" y="16" width="7" height="5" rx="1.5" />
            </svg>
            داشبورد
          </Link>

          <Link
            href="/athlete/program"
            className={`nav-item ${isLinkActive("/athlete/program") ? "active" : ""}`}
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth <= 980) onClose();
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 2h6a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2V3a1 1 0 0 1 1-1Z" />
              <path d="M9 12h6M9 16h4" />
            </svg>
            برنامه‌ی تمرین من
          </Link>

          <Link
            href="/athlete/classes"
            className={`nav-item ${isLinkActive("/athlete/classes") ? "active" : ""}`}
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth <= 980) onClose();
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            کلاس‌ها و رزرو
          </Link>

          <Link
            href="/athlete/progress"
            className={`nav-item ${isLinkActive("/athlete/progress") ? "active" : ""}`}
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth <= 980) onClose();
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            پیشرفت من
          </Link>

          <Link
            href="/athlete/membership"
            className={`nav-item ${isLinkActive("/athlete/membership") ? "active" : ""}`}
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth <= 980) onClose();
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
            عضویت و پرداخت
          </Link>

          <div className="nav-section-label">ارتباط</div>
          <Link
            href="/athlete/messages"
            className={`nav-item ${isLinkActive("/athlete/messages") ? "active" : ""}`}
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth <= 980) onClose();
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            پیام با مربی
            <span className="badge">۱</span>
          </Link>

          <Link
            href="/athlete/settings"
            className={`nav-item ${isLinkActive("/athlete/settings") ? "active" : ""}`}
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth <= 980) onClose();
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
            </svg>
            تنظیمات
          </Link>
        </nav>

        <div className="sidebar-foot">
          <Link href="/athlete/profile" className="user-chip">
            <span className="avatar">{getInitials(athleteName)}</span>
            <span className="meta">
              <span className="name">{athleteName}</span>
              <span className="role">{athleteRole}</span>
            </span>
            <svg className="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </Link>
        </div>
      </aside>

      {/* Scrim backdrop */}
      <div
        className={`scrim ${isOpen ? "show" : ""}`}
        id="scrim"
        onClick={onClose}
        aria-hidden="true"
      />
    </>
  );
}
