export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";
export type PaymentMethod = "online" | "card" | "cash";

export interface PaymentItem {
  id: string;
  memberId?: string;
  txId: string;
  memberName: string;
  memberEmail: string;
  memberAvatar: string;
  avatarGradient: string;
  avatarUrl?: string | null;
  amount: number;
  amountFormatted: string;
  isNegative?: boolean;
  method: PaymentMethod;
  methodLabel: string;
  forTitle: string;
  date: string;
  status: PaymentStatus;
  statusLabel: string;
  recordedByName?: string;
}

export const INITIAL_PAYMENTS: PaymentItem[] = [
  {
    id: "pay-1",
    txId: "TXN-۸۸۴۲۱",
    memberName: "پریا احمدی",
    memberEmail: "paria@mail.com",
    memberAvatar: "پا",
    avatarGradient: "linear-gradient(135deg,#F25C1F,#0EA5E9)",
    amount: 2400000,
    amountFormatted: "۲٬۴۰۰٬۰۰۰",
    method: "online",
    methodLabel: "درگاه آنلاین",
    forTitle: "عضویت طلایی",
    date: "۱۴۰۴/۰۴/۰۸",
    status: "paid",
    statusLabel: "موفق",
  },
  {
    id: "pay-2",
    txId: "TXN-۸۸۴۲۰",
    memberName: "رضا کریمی",
    memberEmail: "reza.k@mail.com",
    memberAvatar: "رک",
    avatarGradient: "linear-gradient(135deg,#6366F1,#0EA5E9)",
    amount: 1200000,
    amountFormatted: "۱٬۲۰۰٬۰۰۰",
    method: "card",
    methodLabel: "کارت بانکی",
    forTitle: "تمدید نقره‌ای",
    date: "۱۴۰۴/۰۴/۰۸",
    status: "pending",
    statusLabel: "در انتظار",
  },
  {
    id: "pay-3",
    txId: "TXN-۸۸۴۱۹",
    memberName: "مهسا نوری",
    memberEmail: "mahsa.n@mail.com",
    memberAvatar: "من",
    avatarGradient: "linear-gradient(135deg,#F59E0B,#EF4444)",
    amount: 2400000,
    amountFormatted: "۲٬۴۰۰٬۰۰۰",
    method: "online",
    methodLabel: "درگاه آنلاین",
    forTitle: "عضویت طلایی",
    date: "۱۴۰۴/۰۴/۰۷",
    status: "paid",
    statusLabel: "موفق",
  },
  {
    id: "pay-4",
    txId: "TXN-۸۸۴۱۸",
    memberName: "آرش محمدی",
    memberEmail: "arash.m@mail.com",
    memberAvatar: "آم",
    avatarGradient: "linear-gradient(135deg,#0EA5E9,#F25C1F)",
    amount: 800000,
    amountFormatted: "۸۰۰٬۰۰۰",
    method: "card",
    methodLabel: "کارت بانکی",
    forTitle: "تمدید برنزی",
    date: "۱۴۰۴/۰۴/۰۷",
    status: "failed",
    statusLabel: "ناموفق",
  },
  {
    id: "pay-5",
    txId: "TXN-۸۸۴۱۷",
    memberName: "سارا طاهری",
    memberEmail: "sara.t@mail.com",
    memberAvatar: "سط",
    avatarGradient: "linear-gradient(135deg,#8B5CF6,#EC4899)",
    amount: 3200000,
    amountFormatted: "۳٬۲۰۰٬۰۰۰",
    method: "cash",
    methodLabel: "نقدی",
    forTitle: "عضویت طلایی + مربی",
    date: "۱۴۰۴/۰۴/۰۶",
    status: "paid",
    statusLabel: "موفق",
  },
  {
    id: "pay-6",
    txId: "TXN-۸۸۴۱۶",
    memberName: "حامد مرادی",
    memberEmail: "hamed.m@mail.com",
    memberAvatar: "حم",
    avatarGradient: "linear-gradient(135deg,#14B8A6,#6366F1)",
    amount: 1200000,
    amountFormatted: "−۱٬۲۰۰٬۰۰۰",
    isNegative: true,
    method: "online",
    methodLabel: "درگاه آنلاین",
    forTitle: "بازگشت وجه نقره‌ای",
    date: "۱۴۰۴/۰۴/۰۵",
    status: "refunded",
    statusLabel: "بازگشت‌خورده",
  },
  {
    id: "pay-7",
    txId: "TXN-۸۸۴۱۵",
    memberName: "کیان صادقی",
    memberEmail: "kian.s@mail.com",
    memberAvatar: "کص",
    avatarGradient: "linear-gradient(135deg,#0EA5E9,#8B5CF6)",
    amount: 2400000,
    amountFormatted: "۲٬۴۰۰٬۰۰۰",
    method: "online",
    methodLabel: "درگاه آنلاین",
    forTitle: "عضویت طلایی",
    date: "۱۴۰۴/۰۴/۰۵",
    status: "paid",
    statusLabel: "موفق",
  },
  {
    id: "pay-8",
    txId: "TXN-۸۸۴۱۴",
    memberName: "نازنین اکبری",
    memberEmail: "nazanin.a@mail.com",
    memberAvatar: "نا",
    avatarGradient: "linear-gradient(135deg,#F43F5E,#F59E0B)",
    amount: 800000,
    amountFormatted: "۸۰۰٬۰۰۰",
    method: "cash",
    methodLabel: "نقدی",
    forTitle: "تمدید برنزی",
    date: "۱۴۰۴/۰۴/۰۴",
    status: "pending",
    statusLabel: "در انتظار",
  },
];
