"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CoachSidebar } from "@/components/coach/coach-sidebar";
import { CoachTopbar } from "@/components/coach/coach-topbar";
import { toPersianDigits } from "@/lib/persian-digits";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  UserCheck,
  UserX,
  AlertCircle,
  Search,
  Plus,
  ArrowRight,
  Filter,
  X,
} from "lucide-react";

interface CheckinItem {
  id: string;
  name: string;
  classId?: number;
  className: string;
  time: string;
  status: "attended" | "pending" | "absent";
  type: string;
}

const INITIAL_CHECKINS: CheckinItem[] = [
  { id: "1", name: "سارا محمدی", classId: 1, className: "بدنسازی صبحگاهی", time: "۰۸:۱۵", status: "attended", type: "کلاس گروهی" },
  { id: "2", name: "امیر صادقی", classId: 1, className: "بدنسازی صبحگاهی", time: "۰۸:۲۰", status: "attended", type: "کلاس گروهی" },
  { id: "3", name: "کیان راد", classId: 1, className: "بدنسازی صبحگاهی", time: "۰۸:۴۵", status: "pending", type: "کلاس گروهی" },
  { id: "4", name: "رضا کاظمی", classId: 2, className: "قدرتی پیشرفته", time: "۱۰:۰۵", status: "attended", type: "نیمه‌خصوصی" },
  { id: "5", name: "مینا تهرانی", classId: 2, className: "قدرتی پیشرفته", time: "۱۰:۱۰", status: "attended", type: "نیمه‌خصوصی" },
  { id: "6", name: "الهام ف.", classId: 2, className: "قدرتی پیشرفته", time: "۱۰:۳۰", status: "absent", type: "نیمه‌خصوصی" },
  { id: "7", name: "نیلوفر ع.", classId: 3, className: "TRX", time: "۱۷:۰۵", status: "attended", type: "کلاس گروهی" },
  { id: "8", name: "دانیال ک.", classId: 3, className: "TRX", time: "۱۷:۱۵", status: "pending", type: "کلاس گروهی" },
  { id: "9", name: "پارسا ن.", classId: 4, className: "بدنسازی شبانه", time: "۱۹:۳۵", status: "attended", type: "کلاس گروهی" },
  { id: "10", name: "علی ز.", classId: 4, className: "بدنسازی شبانه", time: "۱۹:۴۰", status: "attended", type: "کلاس گروهی" },
  { id: "11", name: "بهار ح.", classId: 5, className: "کراس‌فیت مبتدی", time: "۰۹:۱۰", status: "attended", type: "کلاس گروهی" },
  { id: "12", name: "سحر م.", classId: 5, className: "کراس‌فیت مبتدی", time: "۰۹:۳۰", status: "absent", type: "کلاس گروهی" },
];

const CLASS_NAMES: Record<number, string> = {
  1: "بدنسازی صبحگاهی",
  2: "قدرتی پیشرفته",
  3: "TRX",
  4: "بدنسازی شبانه",
  5: "کراس‌فیت مبتدی",
  6: "تمرین خصوصی گروه کوچک",
};

function AttendanceContent() {
  const searchParams = useSearchParams();
  const classParam = searchParams.get("class");
  const selectedClassId = classParam ? parseInt(classParam, 10) : null;

  const [checkins, setCheckins] = useState<CheckinItem[]>(INITIAL_CHECKINS);
  const [statusFilter, setStatusFilter] = useState<"all" | "attended" | "pending" | "absent">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New quick check-in modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("کلاس گروهی");
  const [newStatus, setNewStatus] = useState<"attended" | "pending">("attended");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleCheckinStatus = (id: string) => {
    setCheckins((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus: "attended" | "pending" | "absent" =
            c.status === "attended" ? "absent" : c.status === "absent" ? "pending" : "attended";
          const statusText =
            nextStatus === "attended" ? "حاضر" : nextStatus === "absent" ? "غایب" : "در انتظار";
          showToast(`وضعیت ${c.name} به «${statusText}» تغییر کرد`);
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  const handleAddCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const item: CheckinItem = {
      id: String(Date.now()),
      name: newName.trim(),
      className: selectedClassId ? (CLASS_NAMES[selectedClassId] || "کلاس عمومی") : "تمرین آزاد",
      classId: selectedClassId || undefined,
      time: toPersianDigits(timeStr),
      status: newStatus,
      type: newType,
    };

    setCheckins((prev) => [item, ...prev]);
    setIsModalOpen(false);
    setNewName("");
    showToast(`ورود «${item.name}» ثبت شد`);
  };

  const filteredCheckins = useMemo(() => {
    return checkins.filter((item) => {
      const matchClass = selectedClassId ? item.classId === selectedClassId : true;
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      const matchQuery =
        !searchQuery.trim() ||
        item.name.includes(searchQuery.trim()) ||
        item.className.includes(searchQuery.trim());
      return matchClass && matchStatus && matchQuery;
    });
  }, [checkins, selectedClassId, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const list = selectedClassId ? checkins.filter((c) => c.classId === selectedClassId) : checkins;
    const attended = list.filter((c) => c.status === "attended").length;
    const pending = list.filter((c) => c.status === "pending").length;
    const absent = list.filter((c) => c.status === "absent").length;
    const rate = list.length ? Math.round((attended / list.length) * 100) : 0;
    return { attended, pending, absent, rate, total: list.length };
  }, [checkins, selectedClassId]);

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-80 bg-ink text-white px-4 py-2.5 rounded-[12px] shadow-lg text-[13.5px] font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-head flex flex-wrap items-end justify-between gap-[16px] mb-[24px]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[22px] min-[640px]:text-[26px] font-extrabold text-ink tracking-tight">
              حضور و غیاب
            </h1>
            {selectedClassId && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-tint text-primary-dark rounded-full text-[12px] font-bold border border-primary/20">
                <span>کلاس: {CLASS_NAMES[selectedClassId] || `کد ${selectedClassId}`}</span>
                <Link href="/coach/attendance" title="نمایش همه کلاس‌ها" className="hover:opacity-75">
                  <X className="h-3.5 w-3.5" />
                </Link>
              </span>
            )}
          </div>
          <div className="sub text-[14px] text-ink-faint mt-[5px]">
            ثبت و پیگیری ورود و خروج شاگردان به تفکیک کلاس‌ها و جلسات
          </div>
        </div>

        <div className="page-head-actions flex items-center gap-[10px]">
          <Link href="/coach/classes" className="btn btn-outline btn-sm">
            <ArrowRight className="h-4 w-4" />
            <span>برگشت به کلاس‌ها</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary btn-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>ثبت حضور جدید</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[16px] mb-[24px]">
        <div className="card bg-surface border border-border rounded-[16px] p-4.5 shadow-sm">
          <div className="flex items-center justify-between text-ink-faint mb-2">
            <span className="text-[12.5px] font-bold">حاضرین امروز</span>
            <span className="w-8 h-8 rounded-[10px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="text-[22px] font-extrabold text-ink">{toPersianDigits(stats.attended)} نفر</div>
        </div>

        <div className="card bg-surface border border-border rounded-[16px] p-4.5 shadow-sm">
          <div className="flex items-center justify-between text-ink-faint mb-2">
            <span className="text-[12.5px] font-bold">در انتظار ثبت</span>
            <span className="w-8 h-8 rounded-[10px] bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <div className="text-[22px] font-extrabold text-ink">{toPersianDigits(stats.pending)} نفر</div>
        </div>

        <div className="card bg-surface border border-border rounded-[16px] p-4.5 shadow-sm">
          <div className="flex items-center justify-between text-ink-faint mb-2">
            <span className="text-[12.5px] font-bold">غایبین</span>
            <span className="w-8 h-8 rounded-[10px] bg-rose-50 text-rose-600 flex items-center justify-center">
              <UserX className="h-4 w-4" />
            </span>
          </div>
          <div className="text-[22px] font-extrabold text-ink">{toPersianDigits(stats.absent)} نفر</div>
        </div>

        <div className="card bg-surface border border-border rounded-[16px] p-4.5 shadow-sm">
          <div className="flex items-center justify-between text-ink-faint mb-2">
            <span className="text-[12.5px] font-bold">درصد حضور</span>
            <span className="w-8 h-8 rounded-[10px] bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div className="text-[22px] font-extrabold text-ink">٪{toPersianDigits(stats.rate)}</div>
        </div>
      </div>

      {/* Main Attendance Table Card */}
      <div className="card bg-surface border border-border rounded-[18px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        {/* Controls: Search and Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border mb-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-bg p-1 rounded-[10px]">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={cn(
                "px-3 py-1.5 text-[12.5px] font-bold rounded-[8px] transition-all cursor-pointer",
                statusFilter === "all" ? "bg-surface text-ink shadow-sm" : "text-ink-faint hover:text-ink"
              )}
            >
              همه ({toPersianDigits(stats.total)})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("attended")}
              className={cn(
                "px-3 py-1.5 text-[12.5px] font-bold rounded-[8px] transition-all cursor-pointer",
                statusFilter === "attended" ? "bg-surface text-emerald-700 shadow-sm" : "text-ink-faint hover:text-ink"
              )}
            >
              حاضر ({toPersianDigits(stats.attended)})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("pending")}
              className={cn(
                "px-3 py-1.5 text-[12.5px] font-bold rounded-[8px] transition-all cursor-pointer",
                statusFilter === "pending" ? "bg-surface text-amber-700 shadow-sm" : "text-ink-faint hover:text-ink"
              )}
            >
              در انتظار ({toPersianDigits(stats.pending)})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("absent")}
              className={cn(
                "px-3 py-1.5 text-[12.5px] font-bold rounded-[8px] transition-all cursor-pointer",
                statusFilter === "absent" ? "bg-surface text-rose-700 shadow-sm" : "text-ink-faint hover:text-ink"
              )}
            >
              غایب ({toPersianDigits(stats.absent)})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[220px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint pointer-events-none" />
            <input
              type="text"
              placeholder="جستجوی شاگرد یا کلاس..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bg border border-border rounded-[10px] pr-9 pl-3 py-2 text-[12.5px] outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Checkins List */}
        {filteredCheckins.length > 0 ? (
          <div className="flex flex-col divide-y divide-border">
            {filteredCheckins.map((item) => {
              const isAttended = item.status === "attended";
              const isPending = item.status === "pending";
              return (
                <div key={item.id} className="flex items-center justify-between py-3.5 hover:bg-bg/40 px-2 rounded-[10px] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-tint text-primary-dark font-extrabold text-[13.5px]">
                      {item.name.slice(0, 2)}
                    </span>
                    <div>
                      <div className="text-[14px] font-bold text-ink">{item.name}</div>
                      <div className="text-[12px] text-ink-faint mt-0.5">
                        {item.className} · {item.type}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[13px] font-semibold text-ink-soft inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-ink-faint" />
                      <span>{toPersianDigits(item.time)}</span>
                    </span>

                    {/* Interactive Status Badge: Click to toggle */}
                    <button
                      type="button"
                      onClick={() => toggleCheckinStatus(item.id)}
                      title="کلیک برای تغییر وضعیت (حاضر / غایب / در انتظار)"
                      className={cn(
                        "status-badge px-3 py-1 rounded-full text-[12px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 select-none",
                        isAttended
                          ? "bg-tint text-primary-dark hover:bg-emerald-100"
                          : isPending
                          ? "bg-[#FFFBEB] text-[#B45309] hover:bg-amber-100"
                          : "bg-[#FFF1F2] text-[#E11D48] hover:bg-rose-100"
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          isAttended ? "bg-primary" : isPending ? "bg-[#F59E0B]" : "bg-[#E11D48]"
                        )}
                      />
                      <span>{isAttended ? "حاضر" : isPending ? "در انتظار" : "غایب"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-[14px] bg-bg flex items-center justify-center text-ink-faint mx-auto mb-3">
              <Filter className="h-6 w-6" />
            </div>
            <div className="text-[14.5px] font-bold text-ink">موردی برای نمایش یافت نشد</div>
            <div className="text-[12.5px] text-ink-faint mt-1">
              فیلتر یا عبارت جستجو را تغییر دهید یا حضور جدیدی ثبت کنید.
            </div>
          </div>
        )}
      </div>

      {/* Modal: ثبت حضور جدید */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-[3px] animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-[440px] bg-surface rounded-[20px] border border-border shadow-2xl p-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <h3 className="text-[16px] font-extrabold text-ink">ثبت حضور جدید شاگرد</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-ink-faint hover:text-ink p-1 rounded-[8px]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddCheckin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12.5px] font-bold text-ink">نام و نام خانوادگی شاگرد</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثلاً علی رضایی"
                  className="input p-[9px_12px] text-[13px] border border-border rounded-[10px] bg-bg outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12.5px] font-bold text-ink">نوع جلسه</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="input p-[9px_12px] text-[13px] border border-border rounded-[10px] bg-bg outline-none focus:border-primary"
                >
                  <option value="کلاس گروهی">کلاس گروهی</option>
                  <option value="نیمه‌خصوصی">نیمه‌خصوصی</option>
                  <option value="جلسه خصوصی">جلسه خصوصی</option>
                  <option value="تمرین آزاد">تمرین آزاد</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12.5px] font-bold text-ink">وضعیت اولیه</label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-1.5 text-[12.5px] text-ink font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="initStatus"
                      checked={newStatus === "attended"}
                      onChange={() => setNewStatus("attended")}
                      className="accent-primary"
                    />
                    <span>حاضر در باشگاه</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-[12.5px] text-ink-soft cursor-pointer">
                    <input
                      type="radio"
                      name="initStatus"
                      checked={newStatus === "pending"}
                      onChange={() => setNewStatus("pending")}
                      className="accent-primary"
                    />
                    <span>در انتظار ورود</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline btn-sm cursor-pointer"
                >
                  انصراف
                </button>
                <button type="submit" className="btn btn-primary btn-sm cursor-pointer">
                  ثبت ورود
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default function CoachAttendancePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app flex min-h-screen">
      <CoachSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main flex flex-1 flex-col min-w-0">
        <CoachTopbar onToggleSidebar={() => setSidebarOpen((p) => !p)} />
        <main className="content flex-1 p-[18px] min-[640px]:p-[28px]">
          <Suspense fallback={<div className="p-8 text-center text-ink-faint">در حال بارگذاری اطلاعات حضور و غیاب...</div>}>
            <AttendanceContent />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
