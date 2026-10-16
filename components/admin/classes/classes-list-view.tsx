"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/persian-digits";
import { ClassSession } from "./types";
import { Search, Edit2, Trash2 } from "lucide-react";

interface ClassesListViewProps {
  classes: ClassSession[];
  onSelectClass: (cls: ClassSession) => void;
  onEditClass: (cls: ClassSession) => void;
  onDeleteClass: (id: string) => void;
}

export function ClassesListView({
  classes,
  onSelectClass,
  onEditClass,
  onDeleteClass,
}: ClassesListViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDay, setFilterDay] = useState("all");

  const filtered = classes.filter((cls) => {
    const matchSearch =
      cls.name.includes(searchTerm) ||
      cls.coach.includes(searchTerm) ||
      cls.room.includes(searchTerm);

    const matchCategory =
      filterCategory === "all" || cls.category === filterCategory;

    const matchDay = filterDay === "all" || cls.day === filterDay;

    return matchSearch && matchCategory && matchDay;
  });

  return (
    <div className="rounded-[16px] border border-border bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      {/* List Header & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-[16px] border-b border-border p-[18px_22px]">
        <div>
          <h3 className="text-[16px] font-extrabold text-ink">لیست تمامی کلاس‌ها</h3>
          <div className="mt-[2px] text-[12.5px] text-ink-faint">
            مجموع {toPersianDigits(classes.length)} شیفت کلاسی در هفته
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-[10px]">
          {/* Search */}
          <div className="flex items-center gap-[8px] rounded-[10px] border border-border bg-bg px-[12px] py-[7px] text-[13px] focus-within:border-primary">
            <Search className="h-[15px] w-[15px] text-ink-faint shrink-0" />
            <input
              type="text"
              placeholder="جستجوی کلاس یا مربی…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-none bg-transparent text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-[10px] border border-border bg-bg px-[12px] py-[8px] text-[13px] font-bold text-ink focus:border-primary focus:outline-none"
          >
            <option value="all">همه رشته‌ها</option>
            <option value="بدنسازی">بدنسازی</option>
            <option value="یوگا">یوگا</option>
            <option value="فیتنس">فیتنس</option>
            <option value="کراس‌فیت">کراس‌فیت</option>
            <option value="TRX">TRX</option>
          </select>

          {/* Day Filter */}
          <select
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
            className="rounded-[10px] border border-border bg-bg px-[12px] py-[8px] text-[13px] font-bold text-ink focus:border-primary focus:outline-none"
          >
            <option value="all">همه روزها</option>
            <option value="شنبه">شنبه</option>
            <option value="یکشنبه">یکشنبه</option>
            <option value="دوشنبه">دوشنبه</option>
            <option value="سه‌شنبه">سه‌شنبه</option>
            <option value="چهارشنبه">چهارشنبه</option>
            <option value="پنجشنبه">پنجشنبه</option>
            <option value="جمعه">جمعه</option>
          </select>
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="font-bold">
            <tr className="border-b border-border text-[13.5px] font-bold text-ink-faint">
              <th className="p-[14px_22px] font-bold">نام کلاس</th>
              <th className="p-[14px_16px] font-bold">روز و ساعت</th>
              <th className="p-[14px_16px] font-bold">مربی</th>
              <th className="p-[14px_16px] font-bold">سالن برگزاری</th>
              <th className="p-[14px_16px] font-bold">ظرفیت و پر بودن</th>
              <th className="p-[14px_22px] font-bold text-left">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-[40px] text-center text-ink-faint">
                  هیچ کلاسی با مشخصات وارد شده پیدا نشد.
                </td>
              </tr>
            ) : (
              filtered.map((cls) => {
                const percent = Math.round((cls.enrolled / cls.capacity) * 100);
                const isFull = cls.enrolled >= cls.capacity;

                return (
                  <tr
                    key={cls.id}
                    className="border-b border-border/60 transition-colors hover:bg-bg/60"
                  >
                    <td className="p-[16px_22px]">
                      <div className="flex items-center gap-[10px]">
                        <span
                          className={cn(
                            "flex h-[10px] w-[10px] shrink-0 rounded-full",
                            cls.theme === "amber"
                              ? "bg-[#F59E0B]"
                              : cls.theme === "cyan"
                                ? "bg-[#0EA5E9]"
                                : "bg-primary-dark",
                          )}
                        />
                        <div>
                          <div className="text-[14px] font-extrabold text-ink">
                            {cls.name}
                          </div>
                          <div className="text-[11.5px] text-ink-faint">
                            سطح: {cls.level}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-[16px_16px]">
                      <div className="text-[13px] font-bold text-ink">
                        {cls.day}
                      </div>
                      <div className="text-[11.5px] text-ink-faint">
                        ساعت {toPersianDigits(cls.time)}
                      </div>
                    </td>

                    <td className="p-[16px_16px]">
                      <div className="text-[13px] font-bold text-ink">
                        {cls.coach}
                      </div>
                    </td>

                    <td className="p-[16px_16px]">
                      <div className="text-[12.5px] text-ink-soft">
                        {cls.room}
                      </div>
                    </td>

                    <td className="p-[16px_16px]">
                      <div className="w-[120px]">
                        <div className="flex items-center justify-between text-[11.5px] font-bold">
                          <span
                            className={
                              isFull
                                ? "text-[#DC2626]"
                                : percent >= 80
                                  ? "text-[#D97706]"
                                  : "text-primary-dark"
                            }
                          >
                            {toPersianDigits(cls.enrolled)} / {toPersianDigits(cls.capacity)}
                          </span>
                          <span className="text-ink-faint">٪{toPersianDigits(percent)}</span>
                        </div>
                        <div className="mt-[4px] h-[5px] w-full overflow-hidden rounded-full bg-border">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
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
                    </td>

                    <td className="p-[16px_22px] text-left">
                      <div className="flex items-center justify-end gap-[8px]">
                        <button
                          type="button"
                          onClick={() => onSelectClass(cls)}
                          className="rounded-[8px] border border-border bg-surface px-[10px] py-[5px] text-[12px] font-bold text-ink-soft transition-colors hover:border-primary hover:text-primary-dark"
                        >
                          مشاهده
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditClass(cls)}
                          className="rounded-[8px] p-[6px] text-ink-faint transition-colors hover:bg-bg hover:text-ink"
                          title="ویرایش"
                        >
                          <Edit2 className="h-[15px] w-[15px]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`آیا از حذف کلاس "${cls.name}" اطمینان دارید؟`)) {
                              onDeleteClass(cls.id);
                            }
                          }}
                          className="rounded-[8px] p-[6px] text-ink-faint transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                          title="حذف"
                        >
                          <Trash2 className="h-[15px] w-[15px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
