"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { toPersianDigits, normalizeDigits } from "@/lib/persian-digits";
import { ClassSession, ClassMember } from "./types";
import { getClassRoster, saveClassRoster } from "./roster-store";
import { useMembersData, normalizePersianName } from "@/lib/members-store";
import { useCreateMember } from "@/lib/hooks/queries/use-members";
import { logActivity } from "@/lib/activities-store";
import {
  X,
  Clock,
  MapPin,
  User,
  Users,
  Calendar,
  Trash2,
  Edit2,
  Plus,
  Search,
  UserCheck,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface ClassDetailModalProps {
  cls: ClassSession | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (cls: ClassSession) => void;
  onDelete: (id: string) => void;
  onUpdateMembers?: (classId: string, updatedMembers: ClassMember[]) => void;
}

function getInitials(name: string): string {
  if (!name) return "ع";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}‌${parts[1][0]}`;
  }
  return name.slice(0, 2);
}

function getTodayJalaliString(): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return "۱۴۰۳/۰۷/۱۲";
  }
}

export function ClassDetailModal({
  cls,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onUpdateMembers,
}: ClassDetailModalProps) {
  const { members: allGymMembers, isLoading: isLoadingGymMembers } = useMembersData();
  const createMemberMutation = useCreateMember();

  const [members, setMembers] = useState<ClassMember[]>([]);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [addMode, setAddMode] = useState<"existing" | "new">("existing");
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedGymMemberId, setSelectedGymMemberId] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [saveToGymDatabase, setSaveToGymDatabase] = useState(true);
  const [actionNotice, setActionNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync members roster whenever cls changes, modal opens, or gym members list updates
  useEffect(() => {
    if (cls && isOpen) {
      const roster = getClassRoster(cls.id, cls.members || [], allGymMembers);
      setMembers(roster);
      saveClassRoster(cls.id, roster, allGymMembers);
      setIsAddingMember(false);
      setActionNotice(null);
      setMemberSearch("");
      setSelectedGymMemberId("");
      setNewMemberName("");
      setNewMemberPhone("");
    }
  }, [cls, isOpen, allGymMembers]);

  // Filter gym members for selection dropdown
  const filteredGymMembers = useMemo(() => {
    if (!allGymMembers) return [];
    const enrolledIds = new Set(members.map((m) => m.id));
    const enrolledPhones = new Set(members.map((m) => normalizeDigits(m.phone)));

    const q = memberSearch.trim();
    return allGymMembers
      .map((m) => ({
        ...m,
        isAlreadyEnrolled: enrolledIds.has(m.id) || enrolledPhones.has(normalizeDigits(m.phone)),
      }))
      .filter((m) => {
        if (!q) return true;
        const nameMatch = (m.fullName || m.name || "").includes(q);
        const phoneMatch = normalizeDigits(m.phone || "").includes(normalizeDigits(q));
        return nameMatch || phoneMatch;
      });
  }, [allGymMembers, members, memberSearch]);

  if (!isOpen || !cls) return null;

  const enrolledCount = members.length;
  const percent = cls.capacity > 0 ? Math.min(100, Math.round((enrolledCount / cls.capacity) * 100)) : 0;
  const isFull = enrolledCount >= cls.capacity;

  const updateRoster = (newRoster: ClassMember[]) => {
    setMembers(newRoster);
    saveClassRoster(cls.id, newRoster, allGymMembers);
    if (onUpdateMembers) {
      onUpdateMembers(cls.id, newRoster);
    }
  };

  const handleAddExistingMember = (gymMember: any) => {
    if (!gymMember) return;
    if (gymMember.isAlreadyEnrolled) {
      setActionNotice({ type: "error", text: "این عضو پیش‌تر در این کلاس ثبت‌نام کرده است." });
      return;
    }

    if (isFull) {
      setActionNotice({ type: "error", text: "ظرفیت کلاس تکمیل است و امکان افزودن عضو جدید وجود ندارد." });
      return;
    }

    const newClassMember: ClassMember = {
      id: gymMember.id || `m_${Date.now()}`,
      name: gymMember.fullName || gymMember.name || "ورزشکار",
      avatar: gymMember.avatar || getInitials(gymMember.fullName || gymMember.name || "ور"),
      phone: gymMember.phone || "—",
      joinedDate: getTodayJalaliString(),
      status: "active",
    };

    const updated = [newClassMember, ...members];
    updateRoster(updated);

    logActivity({
      type: "CLASS",
      text: `ثبت‌نام «${newClassMember.name}» در کلاس «${cls.name}»`,
    });
    if (updated.length >= cls.capacity) {
      logActivity({
        type: "FULL",
        text: `تکمیل ظرفیت کلاس «${cls.name}» (${toPersianDigits(cls.capacity)} نفر)`,
      });
    }

    setActionNotice({
      type: "success",
      text: `عضو «${newClassMember.name}» با موفقیت به کلاس اضافه شد.`,
    });
    setIsAddingMember(false);
    setMemberSearch("");
    setSelectedGymMemberId("");
  };

  const handleAddNewMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) {
      setActionNotice({ type: "error", text: "لطفاً نام و نام‌خانوادگی عضو را وارد نمایید." });
      return;
    }

    if (isFull) {
      setActionNotice({ type: "error", text: "ظرفیت کلاس تکمیل است." });
      return;
    }

    setIsSubmitting(true);
    setActionNotice(null);

    try {
      let createdMemberId = `m_${Date.now()}`;

      // Check if this member is already registered in the gym:
      const cleanPhone = normalizeDigits(newMemberPhone).trim();
      const existingGymMember = allGymMembers.find(
        (m) =>
          normalizePersianName(m.fullName || m.name) === normalizePersianName(newMemberName) ||
          (cleanPhone && cleanPhone.length >= 7 && normalizeDigits(m.phone || "").endsWith(cleanPhone))
      );

      if (existingGymMember) {
        createdMemberId = String(existingGymMember.id);
      } else {
        const parts = newMemberName.trim().split(/\s+/);
        const firstName = parts[0] || "عضو";
        const lastName = parts.slice(1).join(" ") || "جدید";
        const todayIso = new Date().toISOString().slice(0, 10);

        try {
          const res = await createMemberMutation.mutateAsync({
            first_name: firstName,
            last_name: lastName,
            phone_number: cleanPhone || undefined,
            start_date: todayIso,
          });
          if (res?.id) {
            createdMemberId = String(res.id);
          }
        } catch (err: any) {
          console.warn("Could not register member in backend, continuing with local member ID:", err);
        }
      }

      const newClassMember: ClassMember = {
        id: createdMemberId,
        name: newMemberName.trim(),
        avatar: getInitials(newMemberName),
        phone: newMemberPhone.trim() || (existingGymMember ? existingGymMember.phone : "—"),
        joinedDate: getTodayJalaliString(),
        status: "active",
      };

      const updated = [newClassMember, ...members];
      updateRoster(updated);

      logActivity({
        type: "CLASS",
        text: `ثبت‌نام «${newClassMember.name}» در کلاس «${cls.name}»`,
      });
      if (updated.length >= cls.capacity) {
        logActivity({
          type: "FULL",
          text: `تکمیل ظرفیت کلاس «${cls.name}» (${toPersianDigits(cls.capacity)} نفر)`,
        });
      }

      setActionNotice({
        type: "success",
        text: `عضو جدید «${newClassMember.name}» با موفقیت به کلاس اضافه شد.`,
      });
      setNewMemberName("");
      setNewMemberPhone("");
      setIsAddingMember(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (confirm(`آیا از حذف «${memberName}» از این کلاس اطمینان دارید؟`)) {
      const updated = members.filter((m) => m.id !== memberId);
      updateRoster(updated);

      logActivity({
        type: "ALERT",
        text: `حذف «${memberName}» از کلاس «${cls.name}»`,
      });

      setActionNotice({
        type: "success",
        text: `«${memberName}» از لیست کلاس حذف شد.`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-[16px]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-[580px] overflow-hidden rounded-[20px] border border-border bg-surface shadow-[0_20px_60px_rgba(15,23,42,0.15)] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-bg/60 p-[20px_24px]">
          <div className="flex items-center gap-[10px]">
            <span
              className={cn(
                "rounded-[8px] px-[10px] py-[4px] text-[12px] font-black",
                cls.theme === "amber"
                  ? "bg-[#FFFBEB] text-[#B45309]"
                  : cls.theme === "cyan"
                    ? "bg-[rgba(14,165,233,0.15)] text-[#0369A1]"
                    : "bg-tint text-primary-dark",
              )}
            >
              {cls.category}
            </span>
            <h3 className="text-[18px] font-black text-ink">{cls.name}</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] text-ink-faint transition-colors hover:bg-surface hover:text-ink"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[75vh] overflow-y-auto p-[24px]">
          {/* Action Notice Alert */}
          {actionNotice && (
            <div
              className={cn(
                "mb-[16px] flex items-center gap-[10px] rounded-[12px] p-[12px_16px] text-[13px] font-bold",
                actionNotice.type === "success"
                  ? "border border-primary/30 bg-tint text-primary-dark"
                  : "border border-[#FCA5A5] bg-[#FEF2F2] text-[#DC2626]",
              )}
            >
              {actionNotice.type === "success" ? (
                <CheckCircle2 className="h-[18px] w-[18px] shrink-0" />
              ) : (
                <AlertCircle className="h-[18px] w-[18px] shrink-0" />
              )}
              <span>{actionNotice.text}</span>
            </div>
          )}

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-[12px] min-[480px]:grid-cols-3">
            <div className="rounded-[12px] bg-bg p-[12px]">
              <div className="flex items-center gap-[6px] text-[11px] font-bold text-ink-faint">
                <Calendar className="h-[14px] w-[14px]" />
                <span>روز برگزاری</span>
              </div>
              <div className="mt-[4px] text-[13.5px] font-extrabold text-ink">
                {cls.day}
              </div>
            </div>

            <div className="rounded-[12px] bg-bg p-[12px]">
              <div className="flex items-center gap-[6px] text-[11px] font-bold text-ink-faint">
                <Clock className="h-[14px] w-[14px]" />
                <span>ساعت جلسه</span>
              </div>
              <div className="mt-[4px] text-[13.5px] font-extrabold text-ink">
                {toPersianDigits(cls.time)} {cls.endTime ? `تا ${toPersianDigits(cls.endTime)}` : ""}
              </div>
            </div>

            <div className="rounded-[12px] bg-bg p-[12px] min-[480px]:col-span-1 col-span-2">
              <div className="flex items-center gap-[6px] text-[11px] font-bold text-ink-faint">
                <User className="h-[14px] w-[14px]" />
                <span>مربی مسئول</span>
              </div>
              <div className="mt-[4px] text-[13.5px] font-extrabold text-ink">
                {cls.coach}
              </div>
            </div>
          </div>

          {/* Location & Level */}
          <div className="mt-[16px] flex flex-wrap items-center justify-between gap-[12px] rounded-[12px] border border-border p-[14px]">
            <div className="flex items-center gap-[8px] text-[13px] text-ink-soft">
              <MapPin className="h-[16px] w-[16px] text-primary-dark shrink-0" />
              <span>
                محل برگزاری: <strong className="text-ink">{cls.room}</strong>
              </span>
            </div>
            <div className="text-[12px] font-bold text-ink-faint">
              سطح دوره: <span className="text-ink">{cls.level}</span>
            </div>
          </div>

          {/* Description */}
          {cls.description && (
            <div className="mt-[16px]">
              <div className="text-[12px] font-bold text-ink-faint">توضیحات کلاس:</div>
              <p className="mt-[4px] text-[13px] leading-[1.7] text-ink-soft">
                {cls.description}
              </p>
            </div>
          )}

          {/* Capacity Section */}
          <div className="mt-[20px] rounded-[14px] bg-bg p-[16px]">
            <div className="flex items-center justify-between text-[13px] font-bold">
              <span className="text-ink">وضعیت ظرفیت سالن:</span>
              <span
                className={
                  isFull
                    ? "text-[#DC2626]"
                    : percent >= 80
                      ? "text-[#D97706]"
                      : "text-primary-dark"
                }
              >
                {toPersianDigits(enrolledCount)} از {toPersianDigits(cls.capacity)} نفر ({toPersianDigits(percent)}٪ تکمیل)
              </span>
            </div>
            <div className="mt-[8px] h-[8px] overflow-hidden rounded-full bg-border">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  isFull
                    ? "bg-[#DC2626]"
                    : percent >= 80
                      ? "bg-[#F59E0B]"
                      : "bg-primary-dark",
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Enrolled Members Section */}
          <div className="mt-[24px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[8px]">
                <Users className="h-[16px] w-[16px] text-primary-dark" />
                <h4 className="text-[14px] font-extrabold text-ink">
                  اعضای ثبت‌نام شده ({toPersianDigits(enrolledCount)} نفر)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddingMember(!isAddingMember);
                  setActionNotice(null);
                }}
                className="inline-flex items-center gap-[6px] rounded-[8px] border border-primary/30 bg-tint/60 px-[10px] py-[5px] text-[12px] font-bold text-primary-dark transition-all hover:bg-tint"
              >
                <Plus className="h-[14px] w-[14px]" />
                <span>{isAddingMember ? "بستن پنل افزودن" : "افزودن عضو"}</span>
              </button>
            </div>

            {/* Add Member Panel */}
            {isAddingMember && (
              <div className="mt-[14px] rounded-[14px] border border-primary/40 bg-tint/20 p-[16px] animate-in fade-in zoom-in-95 duration-150">
                {/* Mode Selector Tabs */}
                <div className="mb-[14px] flex items-center gap-[8px] border-b border-border/80 pb-[10px]">
                  <button
                    type="button"
                    onClick={() => setAddMode("existing")}
                    className={cn(
                      "inline-flex items-center gap-[6px] rounded-[8px] px-[12px] py-[6px] text-[12.5px] font-bold transition-all",
                      addMode === "existing"
                        ? "btn-ink-gradient text-white shadow-xs"
                        : "bg-surface text-ink-soft hover:bg-bg hover:text-ink",
                    )}
                  >
                    <UserCheck className="h-[14px] w-[14px]" />
                    <span>انتخاب از اعضای باشگاه</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddMode("new")}
                    className={cn(
                      "inline-flex items-center gap-[6px] rounded-[8px] px-[12px] py-[6px] text-[12.5px] font-bold transition-all",
                      addMode === "new"
                        ? "btn-ink-gradient text-white shadow-xs"
                        : "bg-surface text-ink-soft hover:bg-bg hover:text-ink",
                    )}
                  >
                    <UserPlus className="h-[14px] w-[14px]" />
                    <span>ثبت عضو جدید</span>
                  </button>
                </div>

                {/* Mode 1: Select from Existing Gym Members */}
                {addMode === "existing" && (
                  <div className="space-y-[12px]">
                    <div className="relative">
                      <Search className="absolute right-[12px] top-[10px] h-[15px] w-[15px] text-ink-faint" />
                      <input
                        type="text"
                        placeholder="جستجوی نام یا شماره تماس عضو باشگاه..."
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        className="w-full rounded-[10px] border border-border bg-surface py-[8px] pr-[36px] pl-[12px] text-[12.5px] text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
                      />
                    </div>

                    {isLoadingGymMembers ? (
                      <div className="flex items-center justify-center gap-[8px] py-[20px] text-[12px] text-ink-faint">
                        <Loader2 className="h-[16px] w-[16px] animate-spin text-primary-dark" />
                        <span>در حال بارگذاری اعضای باشگاه...</span>
                      </div>
                    ) : filteredGymMembers.length === 0 ? (
                      <div className="rounded-[10px] border border-dashed border-border p-[14px] text-center text-[12px] text-ink-faint">
                        عضوی با این مشخصات در باشگاه یافت نشد. می‌توانید از تب «ثبت عضو جدید» استفاده کنید.
                      </div>
                    ) : (
                      <div className="max-h-[190px] space-y-[6px] overflow-y-auto pr-[2px]">
                        {filteredGymMembers.slice(0, 15).map((m) => (
                          <div
                            key={m.id}
                            className={cn(
                              "flex items-center justify-between rounded-[10px] border p-[8px_12px] transition-all",
                              m.isAlreadyEnrolled
                                ? "border-border/60 bg-bg/50 opacity-60"
                                : "border-border bg-surface hover:border-primary/50 hover:bg-tint/30",
                            )}
                          >
                            <div className="flex items-center gap-[10px]">
                              <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-tint text-[11px] font-bold text-primary-dark">
                                {getInitials(m.fullName || m.name || "")}
                              </span>
                              <div>
                                <div className="text-[12.5px] font-bold text-ink">
                                  {m.fullName || m.name}
                                </div>
                                <div className="text-[11px] text-ink-faint">
                                  {toPersianDigits(m.phone || "بدون شماره")} • پلن: {m.plan || "عادی"}
                                </div>
                              </div>
                            </div>

                            {m.isAlreadyEnrolled ? (
                              <span className="text-[11px] font-bold text-ink-faint">
                                قبلاً اضافه شده
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddExistingMember(m)}
                                disabled={isFull}
                                className="rounded-[7px] bg-primary-dark px-[10px] py-[5px] text-[11px] font-bold text-white transition-colors hover:bg-ink disabled:opacity-50"
                              >
                                افزودن به کلاس
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Mode 2: Add Brand New Member */}
                {addMode === "new" && (
                  <form onSubmit={handleAddNewMember} className="space-y-[12px]">
                    <div className="grid grid-cols-1 gap-[10px] min-[420px]:grid-cols-2">
                      <div>
                        <label className="mb-[4px] block text-[11.5px] font-bold text-ink">
                          نام و نام‌خانوادگی <span className="text-[#DC2626]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: سهراب کریمی"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          className="w-full rounded-[10px] border border-border bg-surface px-[10px] py-[8px] text-[12.5px] text-ink focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-[4px] block text-[11.5px] font-bold text-ink">
                          شماره تماس
                        </label>
                        <input
                          type="text"
                          placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                          value={newMemberPhone}
                          onChange={(e) => setNewMemberPhone(e.target.value)}
                          className="w-full rounded-[10px] border border-border bg-surface px-[10px] py-[8px] text-[12.5px] text-ink focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-[8px] text-[12px] font-bold text-ink-soft cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveToGymDatabase}
                        onChange={(e) => setSaveToGymDatabase(e.target.checked)}
                        className="rounded-[4px] text-primary-dark focus:ring-primary"
                      />
                      <span>همزمان در فهرست کلی اعضای باشگاه نیز ثبت شود</span>
                    </label>

                    <div className="flex justify-end gap-[8px] pt-[4px]">
                      <button
                        type="button"
                        onClick={() => setIsAddingMember(false)}
                        className="rounded-[8px] border border-border bg-surface px-[12px] py-[6px] text-[12px] font-bold text-ink-soft hover:bg-bg"
                      >
                        انصراف
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || isFull}
                        className="inline-flex items-center gap-[6px] rounded-[8px] bg-primary-dark px-[14px] py-[6px] text-[12px] font-bold text-white shadow-xs transition-colors hover:bg-ink disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-[14px] w-[14px] animate-spin" />
                            <span>در حال ثبت...</span>
                          </>
                        ) : (
                          <span>تأیید و افزودن به کلاس</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Enrolled Members List */}
            <div className="mt-[14px] divide-y divide-border rounded-[14px] border border-border bg-surface overflow-hidden">
              {members.length === 0 ? (
                <div className="p-[24px] text-center text-[13px] text-ink-faint">
                  هنوز عضوی برای این جلسه کلاس ثبت‌نام نکرده است. برای افزودن، دکمه «افزودن عضو» را لمس کنید.
                </div>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-[10px_16px] transition-colors hover:bg-bg/40"
                  >
                    <div className="flex items-center gap-[10px]">
                      {member.avatar && member.avatar.startsWith("data:") ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="h-[34px] w-[34px] rounded-full object-cover border border-border"
                        />
                      ) : (
                        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-tint text-[11.5px] font-extrabold text-primary-dark">
                          {member.avatar || getInitials(member.name)}
                        </span>
                      )}
                      <div>
                        <div className="text-[13px] font-bold text-ink">
                          {member.name}
                        </div>
                        <div className="text-[11px] text-ink-faint">
                          {member.phone ? toPersianDigits(member.phone) : "—"} {member.joinedDate ? `• ثبت‌نام: ${toPersianDigits(member.joinedDate)}` : ""}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-[10px]">
                      <span className="rounded-full bg-tint px-[8px] py-[2px] text-[11px] font-bold text-primary-dark">
                        فعال
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id, member.name)}
                        title="حذف از این کلاس"
                        className="flex h-[28px] w-[28px] items-center justify-center rounded-[8px] text-ink-faint transition-colors hover:bg-red-50 hover:text-[#DC2626]"
                      >
                        <Trash2 className="h-[14px] w-[14px]" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border bg-bg/50 p-[16px_24px]">
          <button
            type="button"
            onClick={() => {
              if (confirm(`آیا از حذف کلاس "${cls.name}" مطمئن هستید؟`)) {
                onDelete(cls.id);
                onClose();
              }
            }}
            className="inline-flex items-center gap-[6px] rounded-[10px] px-[12px] py-[8px] text-[12.5px] font-bold text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
          >
            <Trash2 className="h-[14px] w-[14px]" />
            حذف کلاس
          </button>

          <div className="flex items-center gap-[8px]">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(cls);
              }}
              className="inline-flex items-center gap-[6px] rounded-[10px] border border-border bg-surface px-[14px] py-[8px] text-[13px] font-bold text-ink transition-colors hover:border-primary hover:bg-tint"
            >
              <Edit2 className="h-[14px] w-[14px]" />
              ویرایش
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-[10px] btn-ink-gradient px-[16px] py-[8px] text-[13px] font-bold text-white transition-colors"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
