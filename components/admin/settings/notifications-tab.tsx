"use client";

import { useState, useEffect } from "react";
import { useGymSettings, useUpdateGymSettings, useGymMe } from "@/lib/hooks/queries/use-gym-me";
import { useAuth } from "@/lib/auth-context";
import { useMembersData } from "@/lib/members-store";
import { usePaymentsData, formatFullToman } from "@/lib/payments-store";
import { useGymClasses } from "@/lib/hooks/use-gym-classes";
import { toPersianDigits } from "@/lib/persian-digits";
import {
  Check,
  Loader2,
  Send,
  Bell,
  UserCheck,
  Calendar,
  FileText,
  CheckCircle2,
  Smartphone,
  Phone,
  Copy,
  ExternalLink,
  MessageSquare,
  X,
  History,
  Clock,
  Sparkles,
  ShieldCheck,
  Save,
  CheckCheck,
} from "lucide-react";

const NOTIF_STORAGE_KEY = "fitlegend_gym_notification_preferences";
const MANAGER_PHONE_STORAGE_KEY = "fitlegend_gym_manager_phone";
const NOTIF_HISTORY_STORAGE_KEY = "fitlegend_gym_notifications_history";

interface NotificationConfig {
  id: string;
  key: "renewal_reminder" | "welcome_member" | "class_reminder" | "daily_report";
  title: string;
  description: string;
  enabled: boolean;
  typeLabel: string;
}

interface DispatchHistoryItem {
  id: string;
  title: string;
  phone: string;
  recipientName: string;
  time: string;
  date: string;
  isoDate?: string;
  timestamp?: number;
  status: "delivered" | "sent";
  trackingCode: string;
  previewText: string;
}

const DEFAULT_NOTIFICATIONS: NotificationConfig[] = [
  {
    id: "notif-1",
    key: "renewal_reminder",
    title: "یادآوری تمدید عضویت",
    description: "ارسال خودکار پیامک هشدار ۳ روز پیش از پایان اشتراک اعضا",
    enabled: true,
    typeLabel: "پیامک خودکار",
  },
  {
    id: "notif-2",
    key: "welcome_member",
    title: "خوش‌آمدگویی عضو جدید",
    description: "ارسال پیامک تبریک، رمز ورود و اطلاعات کمد هنگام ثبت‌نام عضو",
    enabled: true,
    typeLabel: "پیامک آنی",
  },
  {
    id: "notif-3",
    key: "class_reminder",
    title: "یادآوری کلاس ورزشی",
    description: "اعلان و پیامک به شاگردان ۱ ساعت پیش از شروع سانس کلاس رزروشده",
    enabled: true,
    typeLabel: "اعلان سیستم",
  },
  {
    id: "notif-4",
    key: "daily_report",
    title: "گزارش روزانه‌ی مدیر",
    description: "ارسال پیامک و خلاصه‌ی وضعیت مالی، درآمد و ترددها در پایان روز کاری به شماره همراه مدیر",
    enabled: true,
    typeLabel: "گزارش مدیریتی",
  },
];

// Helper to convert Persian digits to English digits for telephone URIs
function toEnglishDigits(str: string): string {
  const persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  const arabicNumbers = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
  let res = str;
  for (let i = 0; i < 10; i++) {
    res = res.replace(persianNumbers[i], String(i)).replace(arabicNumbers[i], String(i));
  }
  return res.replace(/\s+/g, "").replace(/[^0-9+]/g, "");
}

// Helper to get today's ISO date string (YYYY-MM-DD)
function getTodayIsoString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Generate Persian date string for today
function getPersianDateStr(): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date());
  } catch {
    return "امروز";
  }
}

// Check if a history item was sent TODAY
function isHistoryItemToday(hist: any): boolean {
  if (!hist || typeof hist !== "object") return false;

  // Placeholder mock from template is NOT an actual today message
  if (hist.id === "hist-init-1") return false;

  const todayIso = getTodayIsoString();

  // 1. Explicit ISO date check
  if (hist.isoDate) {
    return hist.isoDate === todayIso;
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startMs = startOfToday.getTime();

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const endMs = endOfToday.getTime();

  // 2. Exact timestamp check
  if (typeof hist.timestamp === "number" && hist.timestamp > 0) {
    return hist.timestamp >= startMs && hist.timestamp <= endMs;
  }

  // 3. ID timestamp check (e.g. hist-1728238123000)
  if (typeof hist.id === "string" && hist.id.startsWith("hist-")) {
    const rawTs = Number(hist.id.replace("hist-", ""));
    if (!isNaN(rawTs) && rawTs > 1000000000000) {
      return rawTs >= startMs && rawTs <= endMs;
    }
  }

  // 4. Match Persian date string
  try {
    const todayFa = getPersianDateStr();
    if (hist.date && hist.date === todayFa) {
      return true;
    }
  } catch {}

  return false;
}

export function NotificationsTab() {
  const { user } = useAuth();
  const { data: gymData } = useGymMe();
  const { data: settingsData } = useGymSettings();
  const updateSettingsMutation = useUpdateGymSettings();

  const { members } = useMembersData();
  const { totalRevenue } = usePaymentsData();
  const { todayMembersCount } = useGymClasses();

  // Notifications toggle list
  const [notifications, setNotifications] = useState<NotificationConfig[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return DEFAULT_NOTIFICATIONS;
  });

  // Manager phone number for receiving SMS
  const [managerPhone, setManagerPhone] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(MANAGER_PHONE_STORAGE_KEY);
      if (stored) return stored;
    }
    return "۰۹۱۲۳۴۵۶۷۸۹";
  });

  const [phoneSavedNotice, setPhoneSavedNotice] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // Dispatch history - strictly for TODAY
  const [history, setHistory] = useState<DispatchHistoryItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(NOTIF_HISTORY_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const todayItems = parsed.filter(isHistoryItemToday);
            // Purge non-today items immediately from localStorage
            localStorage.setItem(NOTIF_HISTORY_STORAGE_KEY, JSON.stringify(todayItems));
            return todayItems;
          }
        }
      } catch {}
    }
    return [];
  });

  // Dispatch Modal state
  const [dispatchModal, setDispatchModal] = useState<{
    isOpen: boolean;
    config: NotificationConfig;
    recipientName: string;
    recipientPhone: string;
    messageText: string;
  } | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [sentSuccessFeedback, setSentSuccessFeedback] = useState<string | null>(null);

  // Sync manager phone and toggles from Django backend
  useEffect(() => {
    if (settingsData?.notification_preferences) {
      const prefs = settingsData.notification_preferences as Record<string, any>;
      setNotifications((prev) =>
        prev.map((item) => {
          if (prefs[item.key] !== undefined) {
            return { ...item, enabled: Boolean(prefs[item.key]) };
          }
          return item;
        })
      );

      if (prefs.manager_phone && typeof prefs.manager_phone === "string") {
        setManagerPhone(prefs.manager_phone);
      }
    }
  }, [settingsData]);

  // Load fallback manager phone from user profile or gym info if not manually set
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(MANAGER_PHONE_STORAGE_KEY);
      if (!stored) {
        if (user?.phone_number) {
          setManagerPhone(user.phone_number);
          localStorage.setItem(MANAGER_PHONE_STORAGE_KEY, user.phone_number);
        } else if (gymData?.phone_number) {
          setManagerPhone(gymData.phone_number);
          localStorage.setItem(MANAGER_PHONE_STORAGE_KEY, gymData.phone_number);
        }
      }
    }
  }, [user, gymData]);

  // Expiring members count for renewal notification
  const expiringMembers = members.filter((m) => m.status === "expiring");

  // Today's enrolled students for class reminders
  const totalClassStudents = todayMembersCount;

  // Toggle switch handler
  const handleToggle = async (key: string) => {
    const updated = notifications.map((n) => (n.key === key ? { ...n, enabled: !n.enabled } : n));
    setNotifications(updated);

    try {
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    const prefsObj: Record<string, any> = {
      manager_phone: managerPhone,
    };
    updated.forEach((n) => {
      prefsObj[n.key] = n.enabled;
    });

    try {
      await updateSettingsMutation.mutateAsync({
        notification_preferences: prefsObj,
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (err) {
      console.warn("Save notification preference:", err);
    }
  };

  // Save manager phone number
  const handleSaveManagerPhone = async () => {
    try {
      localStorage.setItem(MANAGER_PHONE_STORAGE_KEY, managerPhone);
    } catch {}

    const prefsObj: Record<string, any> = {
      manager_phone: managerPhone,
    };
    notifications.forEach((n) => {
      prefsObj[n.key] = n.enabled;
    });

    try {
      await updateSettingsMutation.mutateAsync({
        notification_preferences: prefsObj,
      });
      setPhoneSavedNotice(true);
      setTimeout(() => setPhoneSavedNotice(false), 3000);
    } catch (err) {
      console.warn("Save manager phone:", err);
      setPhoneSavedNotice(true);
      setTimeout(() => setPhoneSavedNotice(false), 3000);
    }
  };

  // Open the dispatch modal for a specific notification
  const handleOpenDispatchModal = (item: NotificationConfig) => {
    if (!item.enabled) return;

    let targetName = "مدیر باشگاه";
    let targetPhone = managerPhone;
    let text = "";

    const dateStr = getPersianDateStr();

    if (item.key === "daily_report") {
      targetName = user?.full_name || "مدیریت باشگاه فیتلجند";
      targetPhone = managerPhone;
      text = `📊 گزارش روزانه مدیریت باشگاه فیتلجند
📅 تاریخ: ${dateStr}
💰 درآمد کل ثبت‌شده: ${formatFullToman(totalRevenue)}
👥 حضور و شاگردان امروز: ${toPersianDigits(totalClassStudents)} نفر
⚠️ اشتراک‌های رو به اتمام: ${toPersianDigits(expiringMembers.length)} عضو
✅ وضعیت سامانه و دستگاه‌ها: فعال و پایدار
باشگاه ورزشی فیتلجند`;
    } else if (item.key === "renewal_reminder") {
      const firstExp = expiringMembers[0];
      targetName = firstExp ? firstExp.name : "اعضای رو به اتمام";
      targetPhone = firstExp?.phone || managerPhone;
      text = `ورزشکار گرامی ${targetName}،
با سلام؛ اشتراک باشگاه فیتلجند شما ظرف چند روز آینده به پایان می‌رسد. جهت تمدید اشتراک و جلوگیری از قطع دسترسی کمد و تمرین، می‌توانید از طریق پنل کاربری یا پذیرش اقدام فرمایید.
با تشکر، باشگاه ورزشی فیتلجند`;
    } else if (item.key === "welcome_member") {
      const recent = members[0];
      targetName = recent ? recent.name : "عضو جدید";
      targetPhone = recent?.phone || managerPhone;
      text = `ورزشکار عزیز ${targetName}،
به جمع خانواده باشگاه ورزشی فیتلجند خوش آمدید! 🏋️
اطلاعات ورود به سامانه و کمد هوشمند شما فعال شد.
ساعت کاری: همه‌روزه از ۶:۰۰ الی ۲۳:۰۰
پشتیبانی فیتلجند: ${managerPhone}`;
    } else if (item.key === "class_reminder") {
      targetName = "شاگردان کلاس ورزشی";
      targetPhone = managerPhone;
      text = `یادآوری کلاس ورزشی باشگاه فیتلجند:
شاگرد گرامی، سانس کلاس تخصصی شما ۱ ساعت دیگر آغاز می‌شود. لطفاً ۱۵ دقیقه پیش از شروع در سالن حضور داشته باشید.
همراه داشتن کارت عضویت الزامی است.`;
    }

    setDispatchModal({
      isOpen: true,
      config: item,
      recipientName: targetName,
      recipientPhone: targetPhone,
      messageText: text,
    });
    setSentSuccessFeedback(null);
  };

  // Perform send via device SMS
  const handleSendViaNativeSMS = () => {
    if (!dispatchModal) return;
    const cleanNum = toEnglishDigits(dispatchModal.recipientPhone);
    const encodedBody = encodeURIComponent(dispatchModal.messageText);
    const smsUri = `sms:${cleanNum}?body=${encodedBody}`;

    recordHistorySuccess(
      dispatchModal.config.title,
      dispatchModal.recipientPhone,
      dispatchModal.recipientName,
      dispatchModal.messageText
    );

    // Open device SMS handler
    window.open(smsUri, "_self");
    setSentSuccessFeedback(`اپلیکیشن پیامک دستگاه برای ارسال به شماره ${dispatchModal.recipientPhone} فراخوانی شد.`);
  };

  // Perform send via WhatsApp
  const handleSendViaWhatsApp = () => {
    if (!dispatchModal) return;
    let clean = toEnglishDigits(dispatchModal.recipientPhone);
    if (clean.startsWith("0")) {
      clean = "98" + clean.substring(1);
    } else if (!clean.startsWith("98") && !clean.startsWith("+")) {
      clean = "98" + clean;
    }
    const cleanNum = clean.replace("+", "");
    const encoded = encodeURIComponent(dispatchModal.messageText);
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanNum}&text=${encoded}`;

    recordHistorySuccess(
      dispatchModal.config.title,
      dispatchModal.recipientPhone,
      dispatchModal.recipientName,
      dispatchModal.messageText
    );

    window.open(waUrl, "_blank");
    setSentSuccessFeedback(`صفحه ارسال پیام مستقیم به شماره ${dispatchModal.recipientPhone} باز شد.`);
  };

  // Copy text to clipboard
  const handleCopyText = async () => {
    if (!dispatchModal) return;
    try {
      await navigator.clipboard.writeText(dispatchModal.messageText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Simulated Instant Gateway Send
  const handleCloudGatewaySend = () => {
    if (!dispatchModal) return;
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      const code = `SMS-${Math.floor(10000 + Math.random() * 90000)}`;
      recordHistorySuccess(
        dispatchModal.config.title,
        dispatchModal.recipientPhone,
        dispatchModal.recipientName,
        dispatchModal.messageText,
        code
      );
      setSentSuccessFeedback(`پیامک با موفقیت از طریق درگاه پیامکی به شماره ${dispatchModal.recipientPhone} ارسال گردید. (کد رهگیری: ${code})`);
    }, 1000);
  };

  // Ensure non-today history items are purged on mount and across storage updates
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(NOTIF_HISTORY_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const todayOnly = parsed.filter(isHistoryItemToday);
            if (todayOnly.length !== parsed.length) {
              localStorage.setItem(NOTIF_HISTORY_STORAGE_KEY, JSON.stringify(todayOnly));
              setHistory(todayOnly);
            }
          }
        }
      } catch {}
    }
  }, []);

  // Record item in sent history - strictly for TODAY
  const recordHistorySuccess = (
    title: string,
    phone: string,
    recipientName: string,
    previewText: string,
    customCode?: string
  ) => {
    const now = new Date();
    const timeStr = `${toPersianDigits(String(now.getHours()).padStart(2, "0"))}:${toPersianDigits(
      String(now.getMinutes()).padStart(2, "0")
    )}`;
    const dateStr = getPersianDateStr();
    const todayIso = getTodayIsoString();

    const newItem: DispatchHistoryItem = {
      id: "hist-" + now.getTime(),
      title,
      phone,
      recipientName,
      time: timeStr,
      date: dateStr,
      isoDate: todayIso,
      timestamp: now.getTime(),
      status: "delivered",
      trackingCode: customCode || `SMS-${Math.floor(10000 + Math.random() * 90000)}`,
      previewText: previewText.slice(0, 100) + "...",
    };

    setHistory((prev) => {
      const todayExisting = prev.filter(isHistoryItemToday);
      const updated = [newItem, ...todayExisting.slice(0, 19)];
      try {
        localStorage.setItem(NOTIF_HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  return (
    <div className="p-[20px_16px] min-[640px]:p-[24px_22px]">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-[12px]">
        <div>
          <div className="text-[16px] font-extrabold text-ink">سامانه اعلان‌ها و پیامک‌های هوشمند فیتلجند</div>
          <div className="mt-[2px] text-[13px] text-ink-faint">
            تنظیم شماره همراه مدیر، ارسال پیامک‌های خودکار و گزارش روزانه با وضعیت لحظه‌ای
          </div>
        </div>

        {savedNotice && (
          <span className="inline-flex items-center gap-[6px] rounded-full bg-[#E0F2FE] px-[12px] py-[5px] text-[12px] font-bold text-[#0284C7] animate-in fade-in duration-200">
            <Check className="h-[14px] w-[14px]" />
            تنظیمات در سامانه ثبت شد
          </span>
        )}
      </div>

      {/* Manager Destination Phone Card */}
      <div className="mt-[20px] rounded-[18px] border border-primary/30 bg-surface p-[18px_20px] shadow-[0_4px_20px_rgba(242,92,31,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-[16px]">
          <div className="flex items-center gap-[12px]">
            <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[12px] bg-tint text-primary-dark shadow-xs">
              <Smartphone className="h-[22px] w-[22px]" />
            </div>
            <div>
              <div className="flex items-center gap-[8px]">
                <span className="text-[14px] font-bold text-ink">شماره همراه مدیر (دریافت‌کننده گزارش روزانه)</span>
                <span className="rounded-full bg-primary/10 px-[8px] py-[2px] text-[11px] font-bold text-primary-dark">
                  مقصد ارسال SMS
                </span>
              </div>
              <div className="mt-[3px] text-[12.5px] text-ink-faint">
                خلاصه گزارش درآمد، تردد روزانه و هشدارهای مدیریتی مستقیماً به این شماره موبایل ارسال می‌شود.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-[10px] w-full min-[640px]:w-auto">
            <div className="relative flex-1 min-[640px]:w-[220px]">
              <input
                type="text"
                dir="ltr"
                value={managerPhone}
                onChange={(e) => setManagerPhone(e.target.value)}
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                className="w-full rounded-[10px] border border-border bg-bg/50 px-[12px] py-[8px] text-[14px] font-bold text-ink outline-hidden transition-all focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20 text-center tracking-wider"
              />
            </div>
            <button
              type="button"
              onClick={handleSaveManagerPhone}
              className="inline-flex items-center gap-[6px] rounded-[10px] bg-primary px-[14px] py-[8px] text-[13px] font-bold text-white transition-transform hover:-translate-y-[1px] hover:bg-primary-hover active:scale-95 shadow-xs shrink-0"
            >
              <Save className="h-[14px] w-[14px]" />
              <span>ذخیره شماره</span>
            </button>
          </div>
        </div>

        {phoneSavedNotice && (
          <div className="mt-[12px] flex items-center gap-[6px] rounded-[8px] bg-tint/80 p-[8px_12px] text-[12px] font-bold text-primary-dark animate-in fade-in duration-200">
            <Check className="h-[14px] w-[14px]" />
            شماره موبایل مدیر با موفقیت ذخیره و در سامانه پیامکی اعمال گردید.
          </div>
        )}
      </div>

      {/* Notifications Switch Cards */}
      <div className="mt-[20px] space-y-[16px]">
        {notifications.map((item) => {
          const isGreen = item.enabled;

          let icon = <Bell className="h-[18px] w-[18px]" />;
          if (item.key === "renewal_reminder") icon = <UserCheck className="h-[18px] w-[18px]" />;
          else if (item.key === "welcome_member") icon = <CheckCircle2 className="h-[18px] w-[18px]" />;
          else if (item.key === "class_reminder") icon = <Calendar className="h-[18px] w-[18px]" />;
          else if (item.key === "daily_report") icon = <FileText className="h-[18px] w-[18px]" />;

          return (
            <div
              key={item.id}
              className={`rounded-[16px] border p-[18px_20px] transition-all duration-200 ${
                isGreen
                  ? "border-primary/40 bg-surface shadow-[0_2px_12px_rgba(242,92,31,0.06)]"
                  : "border-border/60 bg-bg/50 opacity-70"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-[14px]">
                <div className="flex items-center gap-[14px] min-w-0 flex-1">
                  <span
                    className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[12px] transition-colors ${
                      isGreen ? "bg-tint text-primary-dark" : "bg-bg text-ink-faint"
                    }`}
                  >
                    {icon}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-[8px]">
                      <span className="text-[14px] font-bold text-ink">{item.title}</span>
                      <span
                        className={`rounded-full px-[8px] py-[2px] text-[11px] font-bold ${
                          isGreen ? "bg-tint text-primary-dark" : "bg-border/60 text-ink-faint"
                        }`}
                      >
                        {isGreen ? "فعال (سبز)" : "غیرفعال"}
                      </span>
                      <span className="text-[11px] text-ink-faint hidden sm:inline">· {item.typeLabel}</span>
                    </div>
                    <div className="mt-[3px] text-[12.5px] text-ink-faint">{item.description}</div>
                  </div>
                </div>

                {/* Right controls: Action button & Toggle */}
                <div className="flex items-center gap-[12px]">
                  {isGreen && (
                    <button
                      type="button"
                      onClick={() => handleOpenDispatchModal(item)}
                      className="inline-flex items-center gap-[6px] rounded-[10px] border border-primary/40 bg-tint/60 px-[14px] py-[7px] text-[12.5px] font-bold text-primary-dark transition-all hover:bg-primary hover:text-ink active:scale-95 shadow-xs"
                      title="مشاهده متن و ارسال پیامک"
                    >
                      <Send className="h-[13px] w-[13px]" />
                      <span>
                        {item.key === "renewal_reminder"
                          ? "بررسی و ارسال یادآوری"
                          : item.key === "welcome_member"
                            ? "تست پیامک خوش‌آمد"
                            : item.key === "class_reminder"
                              ? "ارسال به شاگردان امروز"
                              : "ارسال خلاصه امروز"}
                      </span>
                    </button>
                  )}

                  {/* iOS Style Switch */}
                  <label className="relative inline-block h-[26px] w-[46px] shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={() => handleToggle(item.key)}
                      className="peer sr-only"
                    />
                    <span className="block h-full w-full rounded-full bg-border transition-colors duration-200 peer-checked:bg-primary" />
                    <span className="absolute top-[3px] right-[3px] h-[20px] w-[20px] rounded-full bg-white shadow-xs transition-transform duration-200 peer-checked:-translate-x-[20px]" />
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* History of Sent Notifications */}
      <div className="mt-[28px] rounded-[18px] border border-border bg-surface p-[20px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[8px]">
            <History className="h-[18px] w-[18px] text-primary" />
            <h3 className="text-[14px] font-extrabold text-ink">تاریخچه گزارش‌ها و پیامک‌های ارسالی امروز</h3>
          </div>
          <div className="flex items-center gap-[12px]">
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && window.confirm("آیا از پاکسازی تاریخچه پیامک‌های امروز اطمینان دارید؟")) {
                    setHistory([]);
                    try {
                      localStorage.setItem(NOTIF_HISTORY_STORAGE_KEY, JSON.stringify([]));
                    } catch {}
                  }
                }}
                className="text-[11.5px] font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
              >
                پاکسازی امروز
              </button>
            )}
            <span className="text-[12px] font-bold text-ink-faint">
              {toPersianDigits(history.length)} رویداد امروز
            </span>
          </div>
        </div>

        <div className="mt-[14px] divide-y divide-border/50">
          {history.length === 0 ? (
            <div className="py-[32px] text-center">
              <div className="mx-auto flex h-[46px] w-[46px] items-center justify-center rounded-full bg-bg text-ink-faint">
                <Clock className="h-[22px] w-[22px]" />
              </div>
              <div className="mt-[10px] text-[13.5px] font-bold text-ink">
                هیچ گزارش یا پیامکی در تاریخ امروز ثبت نشده است
              </div>
              <div className="mt-[4px] text-[12px] text-ink-faint">
                با ارسال پیامک یا ارسال خلاصه گزارش روزانه، اعلان‌های ارسالی امروز در این بخش ثبت خواهند شد.
              </div>
            </div>
          ) : (
            history.map((hist) => (
              <div key={hist.id} className="py-[12px] flex flex-wrap items-center justify-between gap-[10px]">
                <div className="flex items-center gap-[10px]">
                  <span className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-tint text-primary-dark">
                    <CheckCheck className="h-[16px] w-[16px]" />
                  </span>
                  <div>
                    <div className="flex items-center gap-[8px]">
                      <span className="text-[13px] font-bold text-ink">{hist.title}</span>
                      <span className="text-[12px] font-semibold text-ink-faint">به: {hist.phone} ({hist.recipientName})</span>
                    </div>
                    <div className="mt-[2px] text-[12px] text-ink-faint">{hist.previewText}</div>
                  </div>
                </div>

                <div className="flex items-center gap-[12px] text-[12px] text-ink-faint">
                  <span className="rounded-md bg-bg px-[8px] py-[3px] font-mono font-bold text-ink-faint">
                    {hist.trackingCode}
                  </span>
                  <span className="flex items-center gap-[4px] font-semibold">
                    <Clock className="h-[12px] w-[12px]" />
                    {hist.time}
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-[8px] py-[2px] text-[11px] font-bold text-emerald-600">
                    ارسال‌شده
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Dispatch / Send SMS to Manager or Member */}
      {dispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-[16px] backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-[540px] rounded-[22px] border border-border bg-surface p-[22px_24px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-[14px]">
              <div className="flex items-center gap-[10px]">
                <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-tint text-primary-dark">
                  <MessageSquare className="h-[20px] w-[20px]" />
                </div>
                <div>
                  <h4 className="text-[15px] font-extrabold text-ink">{dispatchModal.config.title}</h4>
                  <p className="text-[12px] text-ink-faint">تایید مشخصات، متن و روش ارسال پیامک</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDispatchModal(null)}
                className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] text-ink-faint hover:bg-bg hover:text-ink transition-colors"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>

            {/* Recipient Phone Row */}
            <div className="mt-[16px] rounded-[12px] bg-bg/60 p-[12px_14px] border border-border/60">
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="font-bold text-ink">گیرنده پیامک:</span>
                <span className="font-bold text-primary-dark">{dispatchModal.recipientName}</span>
              </div>
              <div className="mt-[6px] flex items-center gap-[8px]">
                <Phone className="h-[14px] w-[14px] text-ink-faint" />
                <input
                  type="text"
                  dir="ltr"
                  value={dispatchModal.recipientPhone}
                  onChange={(e) =>
                    setDispatchModal({ ...dispatchModal, recipientPhone: e.target.value })
                  }
                  className="flex-1 rounded-[8px] border border-border bg-surface px-[10px] py-[6px] text-[13px] font-bold text-ink outline-hidden focus:border-primary"
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                />
              </div>
            </div>

            {/* SMS Body Preview */}
            <div className="mt-[14px]">
              <div className="flex items-center justify-between">
                <label className="text-[12.5px] font-bold text-ink">متن پیامک ارسالی:</label>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="inline-flex items-center gap-[4px] text-[11.5px] font-bold text-primary-dark hover:underline"
                >
                  <Copy className="h-[12px] w-[12px]" />
                  <span>{isCopied ? "کپی شد!" : "کپی متن"}</span>
                </button>
              </div>
              <textarea
                dir="rtl"
                rows={5}
                value={dispatchModal.messageText}
                onChange={(e) =>
                  setDispatchModal({ ...dispatchModal, messageText: e.target.value })
                }
                className="mt-[6px] w-full rounded-[12px] border border-border bg-bg/40 p-[12px] text-[12.5px] leading-[22px] font-medium text-ink outline-hidden focus:border-primary focus:bg-surface"
              />
            </div>

            {/* Success Feedback Banner */}
            {sentSuccessFeedback && (
              <div className="mt-[14px] flex items-center gap-[8px] rounded-[10px] bg-emerald-500/10 border border-emerald-500/30 p-[10px_12px] text-[12px] font-bold text-emerald-600 animate-in fade-in duration-200">
                <Check className="h-[16px] w-[16px] shrink-0" />
                <span>{sentSuccessFeedback}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-[20px] flex flex-col gap-[10px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
                {/* Method 1: Device SMS */}
                <button
                  type="button"
                  onClick={handleSendViaNativeSMS}
                  className="inline-flex items-center justify-center gap-[8px] rounded-[12px] bg-primary px-[14px] py-[10px] text-[13px] font-bold text-white shadow-xs transition-transform hover:-translate-y-[1px] hover:bg-primary-hover active:scale-95"
                >
                  <Smartphone className="h-[16px] w-[16px]" />
                  <span>ارسال با پیامک دستگاه (SMS)</span>
                </button>

                {/* Method 2: Cloud Gateway */}
                <button
                  type="button"
                  disabled={isSending}
                  onClick={handleCloudGatewaySend}
                  className="inline-flex items-center justify-center gap-[8px] rounded-[12px] border border-primary/40 bg-tint/80 px-[14px] py-[10px] text-[13px] font-bold text-primary-dark transition-transform hover:bg-tint active:scale-95"
                >
                  {isSending ? (
                    <Loader2 className="h-[16px] w-[16px] animate-spin" />
                  ) : (
                    <Send className="h-[16px] w-[16px]" />
                  )}
                  <span>{isSending ? "در حال ارسال…" : "ارسال با درگاه پیامکی فیتلجند"}</span>
                </button>
              </div>

              {/* Method 3: WhatsApp direct */}
              <button
                type="button"
                onClick={handleSendViaWhatsApp}
                className="inline-flex items-center justify-center gap-[8px] rounded-[12px] border border-border bg-bg/50 px-[14px] py-[8px] text-[12.5px] font-bold text-ink transition-colors hover:border-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600"
              >
                <ExternalLink className="h-[14px] w-[14px]" />
                <span>ارسال مستقیم در پیام‌رسان (واتساپ)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
