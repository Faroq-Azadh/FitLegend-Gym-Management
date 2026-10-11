"use client";

import { useState } from "react";
import Link from "next/link";
import { AthleteNotificationsModal } from "@/components/athlete/athlete-notifications-modal";
import { AthleteMessagesModal } from "@/components/athlete/athlete-messages-modal";

interface AthleteTopbarProps {
  onToggleSidebar: () => void;
  searchPlaceholder?: string;
  onSearchChange?: (val: string) => void;
  onBookClassClick?: () => void;
  customAction?: React.ReactNode;
}

export function AthleteTopbar({
  onToggleSidebar,
  searchPlaceholder = "جستجوی کلاس، حرکت یا برنامه…",
  onSearchChange,
  customAction,
}: AthleteTopbarProps) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);

  return (
    <>
      <header className="topbar">
        <button
          className="hamburger"
          id="hamburger"
          aria-label="منو"
          type="button"
          onClick={onToggleSidebar}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>

        <div className="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>

        <div className="topbar-actions">
          <button
            className="icon-btn"
            aria-label="اعلان‌ها"
            title="اعلان‌ها"
            type="button"
            onClick={() => setIsNotifOpen(true)}
          >
            <span className="notif-dot" />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </button>

          {customAction ? (
            customAction
          ) : (
            <button
              type="button"
              className="icon-btn"
              aria-label="پیام با مربی"
              title="پیام با مربی"
              onClick={() => setIsMessagesOpen(true)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Notifications Modal */}
      <AthleteNotificationsModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />

      {/* Messages Modal */}
      <AthleteMessagesModal
        isOpen={isMessagesOpen}
        onClose={() => setIsMessagesOpen(false)}
      />
    </>
  );
}
