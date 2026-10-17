"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CoachSidebar } from "@/components/coach/coach-sidebar";
import { CoachTopbar } from "@/components/coach/coach-topbar";
import { useAuth } from "@/lib/auth-context";
import { useCoachMe } from "@/lib/hooks/queries/use-coaches";
import { toPersianDigits } from "@/lib/persian-digits";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Dumbbell,
  Zap,
  Search,
  Plus,
  Pencil,
  X,
  FileText,
  AlertCircle,
  Trash2,
  Tag,
  Eye,
  Layers,
  Sparkles,
} from "lucide-react";

export interface CoachClassItem {
  id: number;
  name: string;
  cat: "strength" | "functional";
  kind: "گروهی" | "نیمه‌خصوصی";
  days: number[]; // 0=Sat, 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu
  time: string;
  dur: number;
  cap: number;
  enrolled: number;
  status: "active" | "off";
}

export interface ExerciseMove {
  id: string;
  exercise: string;
  sets: string;
  reps: string;
  rest: string;
}

export interface WorkoutDay {
  id: string;
  title: string;
  exercises: ExerciseMove[];
}

export interface CoachProgramItem {
  id: string;
  name: string;
  goal: string;
  level: string;
  weeks: number;
  price: string;
  students: string[];
  upd: string;
  st: "active" | "draft";
  daysWorkout?: WorkoutDay[];
}

const DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه"];
const AVATAR_COLORS = [
  "#0F172A",
  "#D94A10",
  "#0369A1",
  "#D97706",
  "#E11D48",
  "#6366F1",
];

const EXERCISE_LIBRARY = [
  "پرس سینه هالتر",
  "اسکوات",
  "ددلیفت",
  "جلو بازو دمبل",
  "زیر بغل سیم‌کش",
  "پرس سرشانه",
  "پشت پا دستگاه",
  "پلانک",
  "کرانچ",
  "شنا سوئدی",
  "پرس پا",
  "جلو ران دستگاه",
  "لت سیم‌کش دست باز",
  "سرشانه نشر جانب",
  "پشت بازو سیم‌کش طنابی",
  "فیله کمر",
  "بارفیکس",
  "دیپ پارالل",
];

const INITIAL_CLASSES: CoachClassItem[] = [
  {
    id: 1,
    name: "بدنسازی صبحگاهی",
    cat: "strength",
    kind: "گروهی",
    days: [0, 2, 4],
    time: "08:00",
    dur: 60,
    cap: 20,
    enrolled: 12,
    status: "active",
  },
  {
    id: 2,
    name: "قدرتی پیشرفته",
    cat: "strength",
    kind: "نیمه‌خصوصی",
    days: [0, 3],
    time: "10:00",
    dur: 45,
    cap: 10,
    enrolled: 10,
    status: "active",
  },
  {
    id: 3,
    name: "TRX",
    cat: "functional",
    kind: "گروهی",
    days: [2, 5],
    time: "17:00",
    dur: 50,
    cap: 12,
    enrolled: 8,
    status: "active",
  },
  {
    id: 4,
    name: "بدنسازی شبانه",
    cat: "strength",
    kind: "گروهی",
    days: [1, 3],
    time: "19:30",
    dur: 75,
    cap: 20,
    enrolled: 14,
    status: "active",
  },
  {
    id: 5,
    name: "کراس‌فیت مبتدی",
    cat: "functional",
    kind: "گروهی",
    days: [5],
    time: "09:00",
    dur: 60,
    cap: 16,
    enrolled: 11,
    status: "active",
  },
  {
    id: 6,
    name: "تمرین خصوصی گروه کوچک",
    cat: "strength",
    kind: "نیمه‌خصوصی",
    days: [1],
    time: "16:00",
    dur: 60,
    cap: 4,
    enrolled: 0,
    status: "off",
  },
];

const INITIAL_PROGRAMS: CoachProgramItem[] = [
  {
    id: "p1",
    name: "افزایش حجم ۱۲ هفته‌ای",
    goal: "عضله‌سازی",
    level: "متوسط",
    weeks: 12,
    price: "۱,۵۰۰,۰۰۰",
    students: ["سارا محمدی", "امیر صادقی", "کیان راد", "نیلوفر ع."],
    upd: "۳ روز پیش",
    st: "active",
    daysWorkout: [
      {
        id: "d1",
        title: "روز ۱: سینه و جلو بازو",
        exercises: [
          { id: "e1", exercise: "پرس سینه هالتر", sets: "۴", reps: "۱۰", rest: "۶۰" },
          { id: "e2", exercise: "جلو بازو دمبل", sets: "۳", reps: "۱۲", rest: "۴۵" },
        ],
      },
      {
        id: "d2",
        title: "روز ۲: پا و شکم",
        exercises: [
          { id: "e3", exercise: "اسکوات", sets: "۴", reps: "۸", rest: "۹۰" },
          { id: "e4", exercise: "کرانچ", sets: "۳", reps: "۲۰", rest: "۳۰" },
        ],
      },
    ],
  },
  {
    id: "p2",
    name: "کاهش چربی و تناسب",
    goal: "چربی‌سوزی",
    level: "مبتدی",
    weeks: 8,
    price: "۱,۲۰۰,۰۰۰",
    students: ["رضا کاظمی", "مینا تهرانی", "الهام ف."],
    upd: "هفته‌ی پیش",
    st: "active",
    daysWorkout: [
      {
        id: "d2-1",
        title: "روز ۱: بالاتنه و هوازی",
        exercises: [
          { id: "e2-1", exercise: "شنا سوئدی", sets: "۳", reps: "۱۵", rest: "۴۵" },
          { id: "e2-2", exercise: "زیر بغل سیم‌کش", sets: "۳", reps: "۱۲", rest: "۴۵" },
          { id: "e2-3", exercise: "پلانک", sets: "۳", reps: "۴۵", rest: "۳۰" },
        ],
      },
      {
        id: "d2-2",
        title: "روز ۲: پایین‌تنه و کرانچ",
        exercises: [
          { id: "e2-4", exercise: "پرس پا", sets: "۳", reps: "۱۵", rest: "۶۰" },
          { id: "e2-5", exercise: "کرانچ", sets: "۳", reps: "۲۰", rest: "۳۰" },
        ],
      },
    ],
  },
  {
    id: "p3",
    name: "قدرتی پایه ۵×۵",
    goal: "قدرت",
    level: "متوسط",
    weeks: 10,
    price: "۹۵۰,۰۰۰",
    students: ["امیر صادقی", "پارسا ن."],
    upd: "۲ هفته پیش",
    st: "active",
    daysWorkout: [
      {
        id: "d3-1",
        title: "روز ۱: اسکوات و بالاتنه",
        exercises: [
          { id: "e3-1", exercise: "اسکوات", sets: "۵", reps: "۵", rest: "۱۲۰" },
          { id: "e3-2", exercise: "پرس سینه هالتر", sets: "۵", reps: "۵", rest: "۱۲۰" },
        ],
      },
      {
        id: "d3-2",
        title: "روز ۲: ددلیفت و سرشانه",
        exercises: [
          { id: "e3-3", exercise: "ددلیفت", sets: "۱", reps: "۵", rest: "۱۸۰" },
          { id: "e3-4", exercise: "پرس سرشانه", sets: "۵", reps: "۵", rest: "۱۲۰" },
          { id: "e3-5", exercise: "بارفیکس", sets: "۳", reps: "۸", rest: "۹۰" },
        ],
      },
    ],
  },
  {
    id: "p4",
    name: "بدن کامل مبتدی",
    goal: "آمادگی عمومی",
    level: "مبتدی",
    weeks: 6,
    price: "۸۰۰,۰۰۰",
    students: ["مینا تهرانی", "دانیال ک.", "سحر م.", "بهار ح.", "علی ز."],
    upd: "۱ ماه پیش",
    st: "active",
    daysWorkout: [
      {
        id: "d4-1",
        title: "روز ۱: فول بادی A",
        exercises: [
          { id: "e4-1", exercise: "پرس سینه هالتر", sets: "۳", reps: "۱۰", rest: "۶۰" },
          { id: "e4-2", exercise: "جلو بازو دمبل", sets: "۳", reps: "۱۲", rest: "۴۵" },
          { id: "e4-3", exercise: "شنا سوئدی", sets: "۳", reps: "۱۰", rest: "۴۵" },
        ],
      },
      {
        id: "d4-2",
        title: "روز ۲: فول بادی B",
        exercises: [
          { id: "e4-4", exercise: "پرس پا", sets: "۳", reps: "۱۲", rest: "۶۰" },
          { id: "e4-5", exercise: "فیله کمر", sets: "۳", reps: "۱۵", rest: "۴۵" },
        ],
      },
    ],
  },
  {
    id: "p5",
    name: "بازتوانی و تحرک",
    goal: "سلامت مفاصل",
    level: "مبتدی",
    weeks: 4,
    price: "۶۵۰,۰۰۰",
    students: [],
    upd: "۲ ماه پیش",
    st: "draft",
    daysWorkout: [
      {
        id: "d5-1",
        title: "روز ۱: ثبات و مفاصل",
        exercises: [
          { id: "e5-1", exercise: "پلانک", sets: "۳", reps: "۳۰", rest: "۳۰" },
          { id: "e5-2", exercise: "فیله کمر", sets: "۳", reps: "۱۲", rest: "۴۵" },
        ],
      },
    ],
  },
];

export default function CoachClassesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [classes, setClasses] = useState<CoachClassItem[]>(INITIAL_CLASSES);
  const [programs, setPrograms] = useState<CoachProgramItem[]>(INITIAL_PROGRAMS);

  const { user } = useAuth();
  const { data: coachMe } = useCoachMe();
  const coachFullName = user?.full_name?.trim() || coachMe?.full_name?.trim();
  const firstName = coachFullName ? coachFullName.split(" ")[0] : "مربی";

  // Tab: 'classes' | 'week' | 'programs'
  const [currentView, setCurrentView] = useState<"classes" | "week" | "programs">("classes");
  // Category: 'all' | 'strength' | 'functional'
  const [categoryFilter, setCategoryFilter] = useState<"all" | "strength" | "functional">("all");
  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // Modal 1: Class Modal state (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Class Form fields
  const [formName, setFormName] = useState("");
  const [formCat, setFormCat] = useState<"strength" | "functional">("strength");
  const [formKind, setFormKind] = useState<"گروهی" | "نیمه‌خصوصی">("گروهی");
  const [formTime, setFormTime] = useState("08:00");
  const [formDur, setFormDur] = useState(60);
  const [formCap, setFormCap] = useState(15);
  const [formStatus, setFormStatus] = useState<"active" | "off">("active");
  const [formDays, setFormDays] = useState<number[]>([]);
  const [formErrors, setFormErrors] = useState<{ name?: string; days?: string }>({});

  // Modal 2: Program Modal state (Create / Edit)
  const [isNewProgramModalOpen, setIsNewProgramModalOpen] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [progName, setProgName] = useState("");
  const [progGoal, setProgGoal] = useState("عضله‌سازی");
  const [progLevel, setProgLevel] = useState("متوسط");
  const [progWeeks, setProgWeeks] = useState(8);
  const [progPrice, setProgPrice] = useState("۱,۲۰۰,۰۰۰");
  const [progStatus, setProgStatus] = useState<"active" | "draft">("active");
  const [progDays, setProgDays] = useState<WorkoutDay[]>([
    {
      id: "day-1",
      title: "روز ۱: بالاتنه و سینه",
      exercises: [
        { id: "e-1", exercise: "پرس سینه هالتر", sets: "۴", reps: "۱۰", rest: "۶۰" },
        { id: "e-2", exercise: "زیر بغل سیم‌کش", sets: "۴", reps: "۱۲", rest: "۶۰" },
        { id: "e-3", exercise: "جلو بازو دمبل", sets: "۳", reps: "۱۲", rest: "۴۵" },
      ],
    },
  ]);
  const [currentDayTabIdx, setCurrentDayTabIdx] = useState(0);
  const [progErrors, setProgErrors] = useState<{ name?: string }>({});

  // Modal 3: Program Details Preview Modal
  const [previewProgram, setPreviewProgram] = useState<CoachProgramItem | null>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"ok" | "err">("ok");

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Toggle class status (active <-> off) directly on card click
  const handleToggleClassStatus = (classId: number) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === classId) {
          const nextStatus = c.status === "active" ? "off" : "active";
          showToast(
            `وضعیت کلاس «${c.name}» به ${nextStatus === "active" ? "فعال" : "غیرفعال"} تغییر یافت`
          );
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  // Compute Persian date string
  const currentDatePersian = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("fa-IR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date());
    } catch {
      return "امروز";
    }
  }, []);

  // Today's day index in Saturday=0 system
  const todayIndex = useMemo(() => {
    return (new Date().getDay() + 1) % 7;
  }, []);

  // Calculate end time
  const getEndTime = (timeStr: string, durMin: number) => {
    const [h, m] = timeStr.split(":").map(Number);
    const totalMinutes = h * 60 + m + durMin;
    const endH = String(Math.floor(totalMinutes / 60) % 24).padStart(2, "0");
    const endM = String(totalMinutes % 60).padStart(2, "0");
    return `${endH}:${endM}`;
  };

  // Filtered classes list
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const matchCat = categoryFilter === "all" || c.cat === categoryFilter;
      const matchQuery =
        !searchQuery.trim() ||
        c.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
      return matchCat && matchQuery;
    });
  }, [classes, categoryFilter, searchQuery]);

  // KPIs
  const activeClasses = useMemo(() => classes.filter((c) => c.status === "active"), [classes]);
  const totalSessionsPerWeek = useMemo(
    () => activeClasses.reduce((sum, c) => sum + c.days.length, 0),
    [activeClasses]
  );
  const totalEnrolled = useMemo(
    () => activeClasses.reduce((sum, c) => sum + c.enrolled, 0),
    [activeClasses]
  );
  const totalCapacity = useMemo(
    () => activeClasses.reduce((sum, c) => sum + c.cap, 0),
    [activeClasses]
  );
  const fillPercentage = totalCapacity
    ? Math.round((totalEnrolled / totalCapacity) * 100)
    : 0;

  // Timetable distinct times (only active matching current filters)
  const timetableTimes = useMemo(() => {
    const act = filteredClasses.filter((c) => c.status === "active");
    return Array.from(new Set(act.map((c) => c.time))).sort();
  }, [filteredClasses]);

  // Open modal for creating or editing class
  const handleOpenModal = (item?: CoachClassItem) => {
    if (item) {
      setEditingId(item.id);
      setFormName(item.name);
      setFormCat(item.cat);
      setFormKind(item.kind);
      setFormTime(item.time);
      setFormDur(item.dur);
      setFormCap(item.cap);
      setFormStatus(item.status);
      setFormDays(item.days);
    } else {
      setEditingId(null);
      setFormName("");
      setFormCat("strength");
      setFormKind("گروهی");
      setFormTime("08:00");
      setFormDur(60);
      setFormCap(15);
      setFormStatus("active");
      setFormDays([]);
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const toggleDayPick = (dayIdx: number) => {
    setFormDays((prev) =>
      prev.includes(dayIdx) ? prev.filter((d) => d !== dayIdx) : [...prev, dayIdx].sort()
    );
    setFormErrors((prev) => ({ ...prev, days: undefined }));
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; days?: string } = {};

    if (!formName.trim() || formName.trim().length < 3) {
      errors.name = "نام کلاس باید حداقل ۳ حرف باشد";
    }
    if (formDays.length === 0) {
      errors.days = "حداقل یک روز را انتخاب کن";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const cap = Math.max(1, formCap || 1);
    const dur = Math.max(15, formDur || 60);

    if (editingId) {
      const existing = classes.find((c) => c.id === editingId);
      if (existing && existing.enrolled > cap) {
        showToast(
          `ظرفیت نمی‌تواند کمتر از تعداد ثبت‌نام‌شده‌ها (${toPersianDigits(existing.enrolled)}) باشد`,
          "err"
        );
        return;
      }
      setClasses((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? {
                ...c,
                name: formName.trim(),
                cat: formCat,
                kind: formKind,
                time: formTime || "08:00",
                dur,
                cap,
                status: formStatus,
                days: formDays,
              }
            : c
        )
      );
      showToast("تغییرات کلاس ذخیره شد");
    } else {
      const newClass: CoachClassItem = {
        id: Date.now(),
        name: formName.trim(),
        cat: formCat,
        kind: formKind,
        time: formTime || "08:00",
        dur,
        cap,
        enrolled: 0,
        status: formStatus,
        days: formDays,
      };
      setClasses((prev) => [newClass, ...prev]);
      showToast("کلاس جدید ساخته شد");
    }

    setIsModalOpen(false);
  };

  // Open New Program Modal
  const handleOpenNewProgramModal = () => {
    setEditingProgramId(null);
    setProgName("");
    setProgGoal("عضله‌سازی");
    setProgLevel("متوسط");
    setProgWeeks(8);
    setProgPrice("۱,۲۰۰,۰۰۰");
    setProgStatus("active");
    setProgDays([
      {
        id: `day-${Date.now()}-1`,
        title: "روز ۱: بالاتنه و سینه",
        exercises: [
          { id: `ex-1`, exercise: "پرس سینه هالتر", sets: "۴", reps: "۱۰", rest: "۶۰" },
          { id: `ex-2`, exercise: "زیر بغل سیم‌کش", sets: "۴", reps: "۱۲", rest: "۶۰" },
          { id: `ex-3`, exercise: "جلو بازو دمبل", sets: "۳", reps: "۱۲", rest: "۴۵" },
        ],
      },
    ]);
    setCurrentDayTabIdx(0);
    setProgErrors({});
    setIsNewProgramModalOpen(true);
  };

  // Open Edit Program Modal (Edit moves, reps, sets, rest, price, status, etc.)
  const handleOpenEditProgramModal = (prog: CoachProgramItem) => {
    setEditingProgramId(prog.id);
    setProgName(prog.name);
    setProgGoal(prog.goal);
    setProgLevel(prog.level);
    setProgWeeks(prog.weeks);
    setProgPrice(prog.price);
    setProgStatus(prog.st);

    if (prog.daysWorkout && prog.daysWorkout.length > 0) {
      setProgDays(JSON.parse(JSON.stringify(prog.daysWorkout)));
    } else {
      setProgDays([
        {
          id: `day-${Date.now()}-1`,
          title: "روز ۱: تمرین اصلی",
          exercises: [
            { id: `ex-1`, exercise: "پرس سینه هالتر", sets: "۴", reps: "۱۰", rest: "۶۰" },
            { id: `ex-2`, exercise: "زیر بغل سیم‌کش", sets: "۴", reps: "۱۲", rest: "۶۰" },
            { id: `ex-3`, exercise: "جلو بازو دمبل", sets: "۳", reps: "۱۲", rest: "۴۵" },
          ],
        },
      ]);
    }
    setCurrentDayTabIdx(0);
    setProgErrors({});
    setIsNewProgramModalOpen(true);
  };

  const handleCloseProgramModal = () => {
    setIsNewProgramModalOpen(false);
    setEditingProgramId(null);
    setProgErrors({});
  };

  // Direct toggle for program status in table (active <-> draft)
  const handleToggleProgramStatus = (progId: string) => {
    setPrograms((prev) =>
      prev.map((p) => {
        if (p.id === progId) {
          const nextSt: "active" | "draft" = p.st === "active" ? "draft" : "active";
          showToast(
            `وضعیت برنامه‌ی «${p.name}» به ${nextSt === "active" ? "فعال" : "پیش‌نویس"} تغییر یافت`
          );
          return { ...p, st: nextSt, upd: "لحظاتی پیش" };
        }
        return p;
      })
    );
  };

  // Delete program from table
  const handleDeleteProgram = (progId: string, progName: string) => {
    setPrograms((prev) => prev.filter((p) => p.id !== progId));
    showToast(`برنامه‌ی تمرینی «${progName}» با موفقیت حذف شد`);
  };

  const handleAddNewWorkoutDay = () => {
    const nextIdx = progDays.length + 1;
    const newDay: WorkoutDay = {
      id: `day-${Date.now()}-${nextIdx}`,
      title: `روز ${toPersianDigits(nextIdx)}: تمرین تخصصی`,
      exercises: [
        { id: `ex-${Date.now()}-1`, exercise: "اسکوات", sets: "۴", reps: "۱۰", rest: "۶۰" },
      ],
    };
    setProgDays((prev) => [...prev, newDay]);
    setCurrentDayTabIdx(progDays.length);
  };

  const handleRemoveWorkoutDay = (dayIndex: number) => {
    if (progDays.length <= 1) {
      showToast("برنامه باید حداقل یک روز تمرینی داشته باشد", "err");
      return;
    }
    setProgDays((prev) => prev.filter((_, idx) => idx !== dayIndex));
    setCurrentDayTabIdx((prev) => Math.max(0, prev - 1));
  };

  const handleAddExerciseToCurrentDay = () => {
    setProgDays((prev) =>
      prev.map((d, idx) =>
        idx === currentDayTabIdx
          ? {
              ...d,
              exercises: [
                ...d.exercises,
                {
                  id: `ex-${Date.now()}`,
                  exercise: "پرس سرشانه",
                  sets: "۳",
                  reps: "۱۲",
                  rest: "۶۰",
                },
              ],
            }
          : d
      )
    );
  };

  const handleUpdateExerciseField = (
    exId: string,
    field: keyof ExerciseMove,
    val: string
  ) => {
    setProgDays((prev) =>
      prev.map((d, idx) =>
        idx === currentDayTabIdx
          ? {
              ...d,
              exercises: d.exercises.map((e) => (e.id === exId ? { ...e, [field]: val } : e)),
            }
          : d
      )
    );
  };

  const handleDeleteExercise = (exId: string) => {
    setProgDays((prev) =>
      prev.map((d, idx) =>
        idx === currentDayTabIdx
          ? {
              ...d,
              exercises: d.exercises.filter((e) => e.id !== exId),
            }
          : d
      )
    );
  };

  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!progName.trim() || progName.trim().length < 3) {
      setProgErrors({ name: "نام برنامه باید حداقل ۳ حرف باشد" });
      return;
    }

    if (editingProgramId) {
      setPrograms((prev) =>
        prev.map((p) =>
          p.id === editingProgramId
            ? {
                ...p,
                name: progName.trim(),
                goal: progGoal,
                level: progLevel,
                weeks: Math.max(1, progWeeks || 1),
                price: progPrice.trim() || "رایگان",
                st: progStatus,
                daysWorkout: progDays,
                upd: "لحظاتی پیش",
              }
            : p
        )
      );
      showToast(`تغییرات برنامه‌ی «${progName.trim()}» با موفقیت ذخیره شد`);
    } else {
      const newProg: CoachProgramItem = {
        id: `p-${Date.now()}`,
        name: progName.trim(),
        goal: progGoal,
        level: progLevel,
        weeks: Math.max(1, progWeeks || 1),
        price: progPrice.trim() || "رایگان",
        students: [],
        upd: "لحظاتی پیش",
        st: progStatus,
        daysWorkout: progDays,
      };

      setPrograms((prev) => [newProg, ...prev]);
      showToast(`برنامه‌ی تمرینی «${newProg.name}» با موفقیت ایجاد شد`);
    }

    setIsNewProgramModalOpen(false);
    setEditingProgramId(null);
  };

  return (
    <div className="app flex min-h-screen">
      <CoachSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main flex flex-1 flex-col min-w-0">
        <CoachTopbar onToggleSidebar={() => setSidebarOpen((p) => !p)} />

        <main className="content flex-1 p-[18px] min-[640px]:p-[28px]">
          {/* Page Head */}
          <div className="page-head flex flex-wrap items-end justify-between gap-[16px] mb-[24px]">
            <div>
              <h1 className="text-[22px] min-[640px]:text-[26px] font-extrabold text-ink tracking-tight">
                برنامه و کلاس‌ها
              </h1>
              <div className="sub text-[14px] text-ink-faint mt-[5px]">
                سلام {firstName}، {currentDatePersian} · کلاس‌های گروهی و برنامه‌های تمرینی تو
              </div>
            </div>

            <div className="page-head-actions flex items-center gap-[10px]">
              <Link href="/coach/attendance" className="btn btn-outline btn-sm">
                <CheckCircle2 className="h-4 w-4 text-primary-dark" />
                <span>حضور و غیاب</span>
              </Link>
              <button
                type="button"
                onClick={() => handleOpenModal()}
                className="btn btn-primary btn-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>کلاس جدید</span>
              </button>
            </div>
          </div>

          {/* KPI Grid (4 Cards) */}
          <div className="kpi-grid grid grid-cols-1 sm:grid-cols-2 min-[1101px]:grid-cols-4 gap-[18px] mb-[18px]">
            {/* KPI 1: کلاس فعال */}
            <div className="card kpi bg-surface border border-border rounded-[16px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-md transition-all">
              <div className="kpi-top flex items-center justify-between">
                <span className="kpi-ico w-[44px] h-[44px] rounded-[12px] flex items-center justify-center bg-tint text-primary-dark kpi-c-orange">
                  <Calendar className="h-[22px] w-[22px]" />
                </span>
              </div>
              <div className="v text-[28px] font-extrabold text-ink line-clamp-1">
                {toPersianDigits(activeClasses.length)}
              </div>
              <div className="l text-[13.5px] font-medium text-ink-soft">کلاس فعال</div>
            </div>

            {/* KPI 2: جلسه در هفته */}
            <div className="card kpi bg-surface border border-border rounded-[16px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-md transition-all">
              <div className="kpi-top flex items-center justify-between">
                <span className="kpi-ico w-[44px] h-[44px] rounded-[12px] flex items-center justify-center bg-tint text-primary-dark kpi-c-sky">
                  <Clock className="h-[22px] w-[22px]" />
                </span>
              </div>
              <div className="v text-[28px] font-extrabold text-ink line-clamp-1">
                {toPersianDigits(totalSessionsPerWeek)}
              </div>
              <div className="l text-[13.5px] font-medium text-ink-soft">جلسه در هفته</div>
            </div>

            {/* KPI 3: ثبت‌نام‌شده در کلاس‌ها */}
            <div className="card kpi bg-surface border border-border rounded-[16px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-md transition-all">
              <div className="kpi-top flex items-center justify-between">
                <span className="kpi-ico w-[44px] h-[44px] rounded-[12px] flex items-center justify-center bg-tint text-primary-dark kpi-c-violet">
                  <Users className="h-[22px] w-[22px]" />
                </span>
              </div>
              <div className="v text-[28px] font-extrabold text-ink line-clamp-1">
                {toPersianDigits(totalEnrolled)}
              </div>
              <div className="l text-[13.5px] font-medium text-ink-soft">ثبت‌نام‌شده در کلاس‌ها</div>
            </div>

            {/* KPI 4: میانگین پُری ظرفیت */}
            <div className="card kpi bg-surface border border-border rounded-[16px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-md transition-all">
              <div className="kpi-top flex items-center justify-between">
                <span
                  className="kpi-ico w-[44px] h-[44px] rounded-[12px] flex items-center justify-center kpi-c-amber"
                  style={{ background: "#FFFBEB", color: "#D97706" }}
                >
                  <CheckCircle2 className="h-[22px] w-[22px]" />
                </span>
              </div>
              <div className="v text-[28px] font-extrabold text-ink line-clamp-1">
                ٪{toPersianDigits(fillPercentage)}
              </div>
              <div className="l text-[13.5px] font-medium text-ink-soft">میانگین پُری ظرفیت</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar flex items-center gap-[12px] mb-[18px] flex-wrap">
            {/* View Tabs */}
            <div className="tabs-inline flex gap-1 bg-bg p-1 rounded-[10px] flex-wrap">
              <button
                type="button"
                onClick={() => setCurrentView("classes")}
                className={cn(
                  "tab flex items-center gap-2 px-3.5 py-2 rounded-[8px] text-[13px] font-bold transition-all cursor-pointer",
                  currentView === "classes"
                    ? "bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                    : "text-ink-faint hover:text-ink"
                )}
              >
                <Calendar className="h-4 w-4" />
                <span>کلاس‌ها</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView("week")}
                className={cn(
                  "tab flex items-center gap-2 px-3.5 py-2 rounded-[8px] text-[13px] font-bold transition-all cursor-pointer",
                  currentView === "week"
                    ? "bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                    : "text-ink-faint hover:text-ink"
                )}
              >
                <Clock className="h-4 w-4" />
                <span>برنامه‌ی هفتگی</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView("programs")}
                className={cn(
                  "tab flex items-center gap-2 px-3.5 py-2 rounded-[8px] text-[13px] font-bold transition-all cursor-pointer",
                  currentView === "programs"
                    ? "bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                    : "text-ink-faint hover:text-ink"
                )}
              >
                <FileText className="h-4 w-4" />
                <span>برنامه‌های تمرینی</span>
              </button>
            </div>

            {/* Search and Category filters (shown for classes and week views) */}
            {currentView !== "programs" && (
              <>
                <label className="filter-search flex items-center gap-[10px] bg-surface border border-border rounded-[12px] px-[14px] py-[9px] min-w-[240px] flex-1 max-w-[360px] focus-within:border-primary transition-colors">
                  <Search className="h-[17px] w-[17px] text-ink-faint shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجوی کلاس…"
                    className="w-full bg-transparent border-none outline-none text-[14px] text-ink placeholder:text-ink-faint"
                  />
                </label>

                <div className="seg flex gap-1 bg-bg p-1 rounded-[10px]">
                  <button
                    type="button"
                    onClick={() => setCategoryFilter("all")}
                    className={cn(
                      "px-3 py-1.5 rounded-[8px] text-[12.5px] font-bold transition-all cursor-pointer",
                      categoryFilter === "all"
                        ? "bg-surface text-ink shadow-sm"
                        : "text-ink-faint hover:text-ink"
                    )}
                  >
                    همه
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter("strength")}
                    className={cn(
                      "px-3 py-1.5 rounded-[8px] text-[12.5px] font-bold transition-all cursor-pointer",
                      categoryFilter === "strength"
                        ? "bg-surface text-ink shadow-sm"
                        : "text-ink-faint hover:text-ink"
                    )}
                  >
                    قدرتی
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter("functional")}
                    className={cn(
                      "px-3 py-1.5 rounded-[8px] text-[12.5px] font-bold transition-all cursor-pointer",
                      categoryFilter === "functional"
                        ? "bg-surface text-ink shadow-sm"
                        : "text-ink-faint hover:text-ink"
                    )}
                  >
                    عملکردی
                  </button>
                </div>
              </>
            )}
          </div>

          {/* VIEW 1: کلاس‌ها (Classes Grid) */}
          {currentView === "classes" && (
            <section className="view active">
              {filteredClasses.length > 0 ? (
                <div className="cls-grid grid grid-cols-1 md:grid-cols-2 min-[1280px]:grid-cols-3 gap-[18px]">
                  {filteredClasses.map((c) => {
                    const pct = c.cap ? Math.round((c.enrolled / c.cap) * 100) : 0;
                    const isFull = c.enrolled >= c.cap;

                    return (
                      <article
                        key={c.id}
                        className="card cls-card bg-surface border border-border rounded-[16px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      >
                        {/* Top row */}
                        <div className="cls-top flex items-start gap-3">
                          <span
                            className={cn(
                              "cls-ico w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0",
                              c.cat === "functional"
                                ? "bg-[rgba(14,165,233,0.12)] text-[#0369A1]"
                                : "bg-tint text-primary-dark"
                            )}
                          >
                            {c.cat === "functional" ? (
                              <Zap className="h-[22px] w-[22px]" />
                            ) : (
                              <Dumbbell className="h-[22px] w-[22px]" />
                            )}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="nm text-[15.5px] font-extrabold text-ink truncate">
                              {c.name}
                            </div>
                            <div className="sub text-[12.5px] text-ink-faint mt-0.5">
                              {c.cat === "functional" ? "عملکردی" : "قدرتی"} · {c.kind}
                            </div>
                          </div>

                          {/* Status Badge: Clickable to toggle status (Requirement 1) */}
                          <div className="cls-top-status shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleClassStatus(c.id);
                              }}
                              title={`وضعیت: ${c.status === "active" ? "فعال" : "غیرفعال"} (برای تغییر کلیک کنید)`}
                              className={cn(
                                "status text-[12px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 transition-all duration-150 cursor-pointer hover:opacity-85 hover:scale-105 select-none",
                                c.status === "off"
                                  ? "bg-[#F1F5F9] text-[#64748B] hover:bg-slate-200"
                                  : isFull
                                  ? "bg-[#FFFBEB] text-[#B45309] hover:bg-amber-100"
                                  : "bg-[#E0F2FE] text-[#0284C7] hover:bg-[#BAE6FD]"
                              )}
                            >
                              <span
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  c.status === "off"
                                    ? "bg-[#94A3B8]"
                                    : isFull
                                    ? "bg-[#F59E0B]"
                                    : "bg-[#0EA5E9]"
                                )}
                              />
                              <span>
                                {c.status === "off" ? "غیرفعال" : isFull ? "پُر" : "فعال"}
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Days Chips */}
                        <div className="day-chips flex gap-1.5 flex-wrap">
                          {DAYS.map((d, i) => {
                            const isOn = c.days.includes(i);
                            return (
                              <span
                                key={d}
                                className={cn(
                                  "day-chip text-[11px] font-bold px-2 py-0.5 rounded-[8px]",
                                  isOn
                                    ? "bg-tint text-primary-dark"
                                    : "bg-bg text-ink-faint"
                                )}
                              >
                                {d}
                              </span>
                            );
                          })}
                        </div>

                        {/* Meta: time and duration */}
                        <div className="cls-meta flex items-center gap-4 text-[13px] font-semibold text-ink-soft flex-wrap">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-ink-faint" />
                            <span>
                              {toPersianDigits(c.time)} تا{" "}
                              {toPersianDigits(getEndTime(c.time, c.dur))}
                            </span>
                          </span>
                          <span>{toPersianDigits(c.dur)} دقیقه</span>
                        </div>

                        {/* Capacity progress bar */}
                        <div className="cap mt-1">
                          <div className="cap-bar h-[6px] rounded-full bg-bg overflow-hidden">
                            <div
                              className={cn(
                                "cap-fill h-full rounded-full transition-all duration-300",
                                isFull
                                  ? "bg-gradient-to-r from-[#F59E0B] to-[#EF4444]"
                                  : "bg-gradient-to-r from-primary to-cyan"
                              )}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <div className="cap-txt text-[11.5px] font-semibold text-ink-faint mt-1.5 flex justify-between">
                            <span>
                              {toPersianDigits(c.enrolled)} از {toPersianDigits(c.cap)} نفر
                            </span>
                            <span>
                              {isFull
                                ? "ظرفیت تکمیل"
                                : `${toPersianDigits(c.cap - c.enrolled)} جای خالی`}
                            </span>
                          </div>
                        </div>

                        {/* Card footer actions */}
                        <div className="cls-foot flex items-center gap-2 mt-auto pt-3 border-t border-border">
                          <Link
                            href={`/coach/attendance?class=${c.id}`}
                            className="btn btn-outline btn-sm flex-1 text-center justify-center cursor-pointer"
                          >
                            حضور و غیاب
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenModal(c)}
                            aria-label={`ویرایش ${c.name}`}
                            className="btn btn-outline btn-sm px-3 cursor-pointer text-ink-faint hover:text-ink"
                            title="ویرایش کلاس"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="card bg-surface border border-border rounded-[16px] p-10 text-center">
                  <div className="empty flex flex-col items-center justify-center">
                    <div className="eico w-14 h-14 rounded-[16px] bg-tint text-primary-dark flex items-center justify-center mb-3.5">
                      <Dumbbell className="h-7 w-7" />
                    </div>
                    <b className="block text-[15px] font-extrabold text-ink mb-1">
                      کلاسی پیدا نشد
                    </b>
                    <span className="text-[13.5px] text-ink-faint">
                      فیلتر یا عبارت جستجو را تغییر بده، یا یک کلاس جدید بساز.
                    </span>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* VIEW 2: برنامه‌ی هفتگی (Timetable View) */}
          {currentView === "week" && (
            <section className="view active">
              <div className="card bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] overflow-hidden">
                <div className="card-head flex items-center justify-between p-[20px_22px] border-b border-border">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-ink">برنامه‌ی هفتگی من</h3>
                    <div className="hint text-[12.5px] text-ink-faint mt-[3px]">
                      شنبه تا پنجشنبه · فقط کلاس‌های فعال
                    </div>
                  </div>
                  <span className="pill text-[11.5px] font-bold text-primary-dark bg-tint px-3 py-1 rounded-full">
                    هفته‌ی جاری
                  </span>
                </div>

                <div className="card-body p-[22px]">
                  {timetableTimes.length > 0 ? (
                    <div className="tt-wrap overflow-x-auto">
                      <div className="timetable grid grid-cols-[64px_repeat(6,1fr)] gap-2 min-w-[720px]">
                        {/* Header Row */}
                        <div className="tt-time-head" />
                        {DAYS.map((d, i) => (
                          <div
                            key={d}
                            className={cn(
                              "tt-head text-[12px] font-extrabold text-center py-2",
                              i === todayIndex ? "text-primary-dark font-black" : "text-ink"
                            )}
                          >
                            {d}
                            {i === todayIndex && (
                              <span className="block text-[10px] text-primary-dark font-bold mt-0.5">
                                (امروز)
                              </span>
                            )}
                          </div>
                        ))}

                        {/* Rows per time slot */}
                        {timetableTimes.map((t) => (
                          <div key={t} className="contents">
                            {/* Time label */}
                            <div className="tt-time text-[11.5px] font-bold text-ink-faint flex items-center justify-center">
                              {toPersianDigits(t)}
                            </div>

                            {/* 6 Day Cells */}
                            {DAYS.map((_, dayIdx) => {
                              const matchingClass = filteredClasses
                                .filter((c) => c.status === "active")
                                .find((c) => c.time === t && c.days.includes(dayIdx));

                              return (
                                <div
                                  key={dayIdx}
                                  className="tt-cell min-h-[58px] bg-bg rounded-[10px] p-1.5 flex flex-col justify-center"
                                >
                                  {matchingClass && (
                                    <div
                                      onClick={() => handleOpenModal(matchingClass)}
                                      className={cn(
                                        "tt-class rounded-[9px] p-2 h-full cursor-pointer transition-all hover:scale-[1.02] border",
                                        matchingClass.cat === "functional"
                                          ? "bg-[rgba(14,165,233,0.12)] border-[#0EA5E9] text-[#0369A1]"
                                          : "bg-tint border-primary text-primary-dark"
                                      )}
                                      title="مشاهده و ویرایش جزئیات کلاس"
                                    >
                                      <div className="nm text-[11.5px] font-extrabold line-clamp-1">
                                        {matchingClass.name}
                                      </div>
                                      <div className="mt text-[10.5px] text-ink-soft font-semibold mt-0.5">
                                        {toPersianDigits(matchingClass.enrolled)}/
                                        {toPersianDigits(matchingClass.cap)} نفر
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="empty text-center py-10">
                      <div className="eico w-14 h-14 rounded-[16px] bg-tint text-primary-dark flex items-center justify-center mx-auto mb-3.5">
                        <Calendar className="h-7 w-7" />
                      </div>
                      <b className="block text-[15px] font-extrabold text-ink mb-1">
                        جلسه‌ای در برنامه نیست
                      </b>
                      <span className="text-[13.5px] text-ink-faint">
                        کلاس فعالی با این فیلتر وجود ندارد.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* VIEW 3: برنامه‌های تمرینی (Programs Table View) */}
          {currentView === "programs" && (
            <section className="view active">
              <div className="card bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] overflow-hidden">
                <div className="card-head flex items-center justify-between p-[20px_22px] border-b border-border">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-ink">برنامه‌های تمرینی</h3>
                    <div className="hint text-[12.5px] text-ink-faint mt-[3px]">
                      قالب‌هایی که به شاگردان اختصاص داده‌ای
                    </div>
                  </div>
                  {/* Button opens New Program Modal (Requirement 2) */}
                  <button
                    type="button"
                    onClick={handleOpenNewProgramModal}
                    className="btn btn-primary btn-sm inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>برنامه‌ی جدید</span>
                  </button>
                </div>

                <div className="table-wrap overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border text-[13.5px] font-extrabold text-ink-faint">
                        <th className="text-right pt-4 pb-3 px-[22px]">برنامه</th>
                        <th className="text-right pt-4 pb-3 px-[22px]">سطح</th>
                        <th className="text-right pt-4 pb-3 px-[22px]">مدت</th>
                        <th className="text-right pt-4 pb-3 px-[22px]">قیمت</th>
                        <th className="text-right pt-4 pb-3 px-[22px]">شاگردان</th>
                        <th className="text-right pt-4 pb-3 px-[22px]">آخرین ویرایش</th>
                        <th className="text-right pt-4 pb-3 px-[22px]">وضعیت</th>
                        <th className="text-right pt-4 pb-3 px-[22px]" />
                      </tr>
                    </thead>
                    <tbody id="progBody">
                      {programs.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b border-border last:border-b-0 hover:bg-bg/50 transition-colors"
                        >
                          {/* برنامه */}
                          <td className="p-[16px_22px]">
                            <button
                              type="button"
                              onClick={() => handleOpenEditProgramModal(p)}
                              className="prog-name flex flex-col gap-0.5 text-right cursor-pointer group select-none"
                              title={`کلیک برای ویرایش مشخصات و حرکات ${p.name}`}
                            >
                              <span className="nm text-[14px] font-bold text-ink group-hover:text-primary-dark transition-colors">
                                {p.name}
                              </span>
                              <span className="em text-[12px] text-ink-faint">
                                {p.goal}
                              </span>
                            </button>
                          </td>

                          {/* سطح */}
                          <td className="p-[16px_22px] text-[13.5px] font-medium text-ink-soft">
                            {p.level}
                          </td>

                          {/* مدت */}
                          <td className="p-[16px_22px] text-[13.5px] font-bold text-ink">
                            {toPersianDigits(p.weeks)} هفته
                          </td>

                          {/* قیمت (قابل ویرایش) */}
                          <td className="p-[16px_22px]">
                            <button
                              type="button"
                              onClick={() => handleOpenEditProgramModal(p)}
                              className="text-[13px] font-bold text-primary-dark bg-tint px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer hover:bg-orange-100 transition-colors select-none"
                              title="کلیک برای تغییر قیمت برنامه"
                            >
                              {toPersianDigits(p.price)} تومان
                            </button>
                          </td>

                          {/* شاگردان: Stacked avatars */}
                          <td className="p-[16px_22px]">
                            {p.students.length > 0 ? (
                              <div className="stack-av flex items-center">
                                {p.students.slice(0, 3).map((stu, sIdx) => (
                                  <span
                                    key={sIdx}
                                    style={{
                                      background:
                                        AVATAR_COLORS[sIdx % AVATAR_COLORS.length],
                                    }}
                                    className="w-[26px] h-[26px] rounded-[8px] border-2 border-surface text-white text-[10.5px] font-bold flex items-center justify-center shrink-0 -mr-2 first:mr-0"
                                    title={stu}
                                  >
                                    {stu.trim()[0]}
                                  </span>
                                ))}
                                {p.students.length > 3 && (
                                  <span className="w-[26px] h-[26px] rounded-[8px] border-2 border-surface bg-bg text-ink-soft text-[10px] font-bold flex items-center justify-center shrink-0 -mr-2">
                                    +{toPersianDigits(p.students.length - 3)}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[12px] text-ink-faint font-medium">
                                بدون شاگرد
                              </span>
                            )}
                          </td>

                          {/* آخرین ویرایش */}
                          <td className="p-[16px_22px] text-[13px] text-ink-soft">
                            {p.upd}
                          </td>

                          {/* وضعیت (کلیک برای تغییر مستقیم بین فعال و پیش‌نویس) */}
                          <td className="p-[16px_22px]">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleProgramStatus(p.id);
                              }}
                              title={`وضعیت: ${p.st === "active" ? "فعال" : "پیش‌نویس"} (کلیک برای تغییر وضعیت)`}
                              className={cn(
                                "status text-[11.5px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 select-none",
                                p.st === "active"
                                  ? "bg-[#E0F2FE] text-[#0284C7] hover:bg-[#BAE6FD]"
                                  : "bg-bg text-ink-faint hover:bg-slate-200"
                              )}
                            >
                              <span
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  p.st === "active" ? "bg-[#0EA5E9]" : "bg-[#94A3B8]"
                                )}
                              />
                              <span>{p.st === "active" ? "فعال" : "پیش‌نویس"}</span>
                            </button>
                          </td>

                          {/* Action (دکمه ویرایش حرکات، ست‌ها، تکرارها و قیمت) */}
                          <td className="p-[16px_22px] text-left">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* ویرایش کامل برنامه */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditProgramModal(p)}
                                className="row-action text-ink-faint hover:text-primary-dark hover:bg-tint w-8 h-8 rounded-[8px] inline-flex items-center justify-center transition-colors cursor-pointer"
                                title={`ویرایش حرکات، ست‌ها، قیمت و مشخصات ${p.name}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              {p.daysWorkout && p.daysWorkout.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewProgram(p)}
                                  className="row-action text-ink-faint hover:text-primary-dark hover:bg-tint w-8 h-8 rounded-[8px] inline-flex items-center justify-center transition-colors cursor-pointer"
                                  title={`مشاهده ریز حرکات ${p.name}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              )}
                              {/* حذف برنامه */}
                              <button
                                type="button"
                                onClick={() => handleDeleteProgram(p.id, p.name)}
                                className="row-action text-ink-faint hover:text-[#E11D48] hover:bg-[#FFF1F2] w-8 h-8 rounded-[8px] inline-flex items-center justify-center transition-colors cursor-pointer"
                                title={`حذف برنامه‌ی ${p.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* MODAL 1: ایجاد / ویرایش کلاس */}
          {isModalOpen && (
            <div
              className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-[3px] animate-in fade-in duration-200"
              onClick={handleCloseModal}
              role="dialog"
              aria-modal="true"
            >
              <div
                className="modal relative z-10 w-full max-w-[580px] max-h-[92vh] bg-surface rounded-[20px] shadow-[0_20px_60px_rgba(15,23,42,0.15)] border border-border overflow-y-auto animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Head */}
                <div className="modal-head flex items-center justify-between p-[20px_24px] border-b border-border sticky top-0 bg-surface/95 backdrop-blur-[8px] z-10">
                  <h3 className="text-[17px] font-extrabold text-ink">
                    {editingId ? "ویرایش کلاس" : "کلاس جدید"}
                  </h3>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="icon-btn w-9 h-9 rounded-[10px] flex items-center justify-center text-ink-faint hover:text-ink hover:bg-bg cursor-pointer"
                    aria-label="بستن"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Body Form */}
                <form onSubmit={handleSaveClass} noValidate>
                  <div className="modal-body p-[22px_24px] flex flex-col gap-4">
                    <div className="form-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* نام کلاس */}
                      <div className="field full sm:col-span-2 flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-ink">
                          نام کلاس <span className="text-[#F43F5E]">*</span>
                        </label>
                        <input
                          className={cn(
                            "input p-[11px_14px] text-[13.5px] border rounded-[12px] outline-none transition-all",
                            formErrors.name
                              ? "border-[#F43F5E] bg-[#FFF1F2]"
                              : "border-border bg-surface focus:border-primary focus:bg-tint"
                          )}
                          value={formName}
                          onChange={(e) => {
                            setFormName(e.target.value);
                            setFormErrors((prev) => ({ ...prev, name: undefined }));
                          }}
                          placeholder="مثلاً بدنسازی صبحگاهی"
                          maxLength={60}
                        />
                        {formErrors.name && (
                          <span className="text-[11.5px] text-[#E11D48] font-semibold flex items-center gap-1 mt-0.5">
                            <AlertCircle className="h-3 w-3" />
                            {formErrors.name}
                          </span>
                        )}
                      </div>

                      {/* دسته‌بندی */}
                      <div className="field flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-ink">
                          دسته‌بندی
                        </label>
                        <select
                          className="input p-[11px_14px] text-[13.5px] border border-border rounded-[12px] bg-surface outline-none focus:border-primary focus:bg-tint"
                          value={formCat}
                          onChange={(e) =>
                            setFormCat(e.target.value as "strength" | "functional")
                          }
                        >
                          <option value="strength">قدرتی</option>
                          <option value="functional">عملکردی</option>
                        </select>
                      </div>

                      {/* نوع */}
                      <div className="field flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-ink">نوع</label>
                        <select
                          className="input p-[11px_14px] text-[13.5px] border border-border rounded-[12px] bg-surface outline-none focus:border-primary focus:bg-tint"
                          value={formKind}
                          onChange={(e) =>
                            setFormKind(e.target.value as "گروهی" | "نیمه‌خصوصی")
                          }
                        >
                          <option value="گروهی">گروهی</option>
                          <option value="نیمه‌خصوصی">نیمه‌خصوصی</option>
                        </select>
                      </div>

                      {/* ساعت شروع */}
                      <div className="field flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-ink">
                          ساعت شروع <span className="text-[#F43F5E]">*</span>
                        </label>
                        <input
                          type="time"
                          dir="ltr"
                          className="input p-[11px_14px] text-[13.5px] text-right border border-border rounded-[12px] bg-surface outline-none focus:border-primary focus:bg-tint"
                          value={formTime}
                          onChange={(e) => setFormTime(e.target.value)}
                        />
                      </div>

                      {/* مدت (دقیقه) */}
                      <div className="field flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-ink">
                          مدت (دقیقه)
                        </label>
                        <input
                          type="number"
                          min={15}
                          max={180}
                          step={5}
                          dir="ltr"
                          className="input p-[11px_14px] text-[13.5px] text-right border border-border rounded-[12px] bg-surface outline-none focus:border-primary focus:bg-tint"
                          value={formDur}
                          onChange={(e) => setFormDur(parseInt(e.target.value, 10) || 60)}
                        />
                      </div>

                      {/* ظرفیت */}
                      <div className="field flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-ink">ظرفیت</label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          dir="ltr"
                          className="input p-[11px_14px] text-[13.5px] text-right border border-border rounded-[12px] bg-surface outline-none focus:border-primary focus:bg-tint"
                          value={formCap}
                          onChange={(e) => setFormCap(parseInt(e.target.value, 10) || 15)}
                        />
                      </div>

                      {/* وضعیت */}
                      <div className="field flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-ink">وضعیت</label>
                        <select
                          className="input p-[11px_14px] text-[13.5px] border border-border rounded-[12px] bg-surface outline-none focus:border-primary focus:bg-tint"
                          value={formStatus}
                          onChange={(e) =>
                            setFormStatus(e.target.value as "active" | "off")
                          }
                        >
                          <option value="active">فعال</option>
                          <option value="off">غیرفعال</option>
                        </select>
                      </div>

                      {/* روزهای برگزاری */}
                      <div className="field full sm:col-span-2 flex flex-col gap-2 mt-1">
                        <label className="text-[13px] font-bold text-ink">
                          روزهای برگزاری <span className="text-[#F43F5E]">*</span>
                        </label>
                        <div className="chip-pick flex flex-wrap gap-2">
                          {DAYS.map((d, i) => {
                            const isPicked = formDays.includes(i);
                            return (
                              <button
                                key={d}
                                type="button"
                                onClick={() => toggleDayPick(i)}
                                className={cn(
                                  "cp px-3.5 py-2 rounded-full text-[13px] font-bold border transition-all cursor-pointer",
                                  isPicked
                                    ? "bg-tint border-primary text-primary-dark"
                                    : "bg-surface border-border text-ink-soft hover:border-primary hover:bg-tint"
                                )}
                              >
                                {d}
                              </button>
                            );
                          })}
                        </div>
                        {formErrors.days && (
                          <span className="text-[11.5px] text-[#E11D48] font-semibold flex items-center gap-1 mt-0.5">
                            <AlertCircle className="h-3 w-3" />
                            {formErrors.days}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Modal Foot */}
                  <div className="modal-foot flex items-center justify-end gap-2.5 p-[16px_24px] border-t border-border sticky bottom-0 bg-surface/95 backdrop-blur-[8px]">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="btn btn-outline btn-sm cursor-pointer"
                    >
                      انصراف
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm cursor-pointer">
                      {editingId ? "ذخیره‌ی تغییرات" : "ذخیره‌ی کلاس"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL 2: ایجاد یا ویرایش برنامه‌ی تمرینی */}
          {isNewProgramModalOpen && (
            <div
              className="fixed inset-0 z-70 flex items-center justify-center p-3 min-[640px]:p-5 bg-ink/50 backdrop-blur-[4px] animate-in fade-in duration-200"
              onClick={handleCloseProgramModal}
              role="dialog"
              aria-modal="true"
            >
              <div
                className="relative z-10 flex flex-col w-full max-w-[760px] max-h-[92vh] bg-surface rounded-[22px] border border-border shadow-[0_20px_60px_rgba(15,23,42,0.18)] overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-4.5 sticky top-0 z-20">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-tint text-primary-dark">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-[17px] font-extrabold text-ink">
                        {editingProgramId ? "ویرایش برنامه‌ی تمرینی" : "ایجاد برنامه‌ی تمرینی جدید"}
                      </h3>
                      <div className="text-[12.5px] text-ink-faint mt-0.5">
                        {editingProgramId
                          ? "ویرایش حرکات، ست‌ها، تکرارها، روزهای تمرین، قیمت و وضعیت برنامه"
                          : "تعیین مشخصات، روزهای تمرین، حرکات، ست و تکرار و قیمت دوره"}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseProgramModal}
                    className="icon-btn w-9 h-9 rounded-[10px] flex items-center justify-center text-ink-faint hover:text-ink hover:bg-bg cursor-pointer"
                    aria-label="بستن"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Body Form */}
                <form
                  onSubmit={handleSaveProgram}
                  className="flex flex-col flex-1 overflow-y-auto p-6 gap-6"
                >
                  {/* بخش ۱: مشخصات کلی و قیمت */}
                  <div className="flex flex-col gap-4 bg-bg/50 p-4.5 rounded-[16px] border border-border/80">
                    <div className="text-[13.5px] font-extrabold text-ink flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary-dark" />
                      <span>مشخصات کلی و قیمت برنامه</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      {/* نام برنامه */}
                      <div className="sm:col-span-2 flex flex-col gap-1.5">
                        <label className="text-[12.5px] font-bold text-ink">
                          نام برنامه <span className="text-[#F43F5E]">*</span>
                        </label>
                        <input
                          className={cn(
                            "input p-[9px_13px] text-[13px] border rounded-[10px] outline-none transition-all",
                            progErrors.name
                              ? "border-[#F43F5E] bg-[#FFF1F2]"
                              : "border-border bg-surface focus:border-primary"
                          )}
                          value={progName}
                          onChange={(e) => {
                            setProgName(e.target.value);
                            setProgErrors({});
                          }}
                          placeholder="مثلاً هایپرتروفی پیشرفته ۴ روزه"
                          maxLength={70}
                        />
                        {progErrors.name && (
                          <span className="text-[11px] text-[#E11D48] font-semibold">
                            {progErrors.name}
                          </span>
                        )}
                      </div>

                      {/* قیمت برنامه */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[12.5px] font-bold text-ink">
                          قیمت برنامه (تومان) <span className="text-[#F43F5E]">*</span>
                        </label>
                        <input
                          className="input p-[9px_13px] text-[13px] border border-border rounded-[10px] bg-surface outline-none focus:border-primary text-left dir-ltr font-bold"
                          value={progPrice}
                          onChange={(e) => setProgPrice(e.target.value)}
                          placeholder="۱,۲۰۰,۰۰۰"
                        />
                      </div>

                      {/* هدف */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[12.5px] font-bold text-ink">هدف برنامه</label>
                        <select
                          className="input p-[9px_13px] text-[13px] border border-border rounded-[10px] bg-surface outline-none focus:border-primary"
                          value={progGoal}
                          onChange={(e) => setProgGoal(e.target.value)}
                        >
                          <option value="عضله‌سازی">عضله‌سازی</option>
                          <option value="چربی‌سوزی">چربی‌سوزی</option>
                          <option value="افزایش قدرت">افزایش قدرت</option>
                          <option value="تناسب اندام عمومی">تناسب اندام عمومی</option>
                          <option value="سلامت مفاصل">سلامت مفاصل</option>
                        </select>
                      </div>

                      {/* سطح */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[12.5px] font-bold text-ink">سطح</label>
                        <select
                          className="input p-[9px_13px] text-[13px] border border-border rounded-[10px] bg-surface outline-none focus:border-primary"
                          value={progLevel}
                          onChange={(e) => setProgLevel(e.target.value)}
                        >
                          <option value="مبتدی">مبتدی</option>
                          <option value="متوسط">متوسط</option>
                          <option value="پیشرفته">پیشرفته</option>
                        </select>
                      </div>

                      {/* طول دوره (هفته) */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[12.5px] font-bold text-ink">
                          طول دوره (هفته)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={52}
                          className="input p-[9px_13px] text-[13px] border border-border rounded-[10px] bg-surface outline-none focus:border-primary text-center font-bold"
                          value={progWeeks}
                          onChange={(e) => setProgWeeks(parseInt(e.target.value, 10) || 8)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* بخش ۲: روزهای تمرین و حرکات (Workout Days & Moves) */}
                  <div className="flex flex-col gap-3.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="text-[13.5px] font-extrabold text-ink flex items-center gap-2">
                        <Layers className="h-4 w-4 text-primary-dark" />
                        <span>برنامه‌ریزی روزها و حرکات تمرین</span>
                      </div>

                      {/* Day Tabs Segments */}
                      <div className="flex items-center gap-1.5 bg-bg p-1 rounded-[10px]">
                        {progDays.map((d, index) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setCurrentDayTabIdx(index)}
                            className={cn(
                              "px-3 py-1.5 text-[12px] font-bold rounded-[8px] transition-all cursor-pointer",
                              currentDayTabIdx === index
                                ? "bg-surface text-ink shadow-sm"
                                : "text-ink-faint hover:text-ink"
                            )}
                          >
                            روز {toPersianDigits(index + 1)}
                          </button>
                        ))}
                        {progDays.length < 6 && (
                          <button
                            type="button"
                            onClick={handleAddNewWorkoutDay}
                            className="px-2 py-1.5 text-[11.5px] font-bold rounded-[8px] text-primary-dark hover:bg-tint transition-all cursor-pointer flex items-center gap-1"
                            title="افزودن روز تمرینی جدید"
                          >
                            <Plus className="h-3 w-3" />
                            <span>روز جدید</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Current Day Details Card */}
                    {progDays[currentDayTabIdx] && (
                      <div className="border border-border rounded-[14px] bg-surface p-4 flex flex-col gap-3.5">
                        <div className="flex items-center justify-between gap-3 flex-wrap border-b border-border pb-3">
                          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                            <span className="text-[12.5px] font-bold text-ink shrink-0">
                              عنوان روز:
                            </span>
                            <input
                              className="input p-[6px_12px] text-[12.5px] border border-border rounded-[8px] bg-bg flex-1 outline-none focus:border-primary"
                              value={progDays[currentDayTabIdx].title}
                              onChange={(e) => {
                                const newTitle = e.target.value;
                                setProgDays((prev) =>
                                  prev.map((d, idx) =>
                                    idx === currentDayTabIdx ? { ...d, title: newTitle } : d
                                  )
                                );
                              }}
                              placeholder="مثلاً روز ۱: عضلات سینه و پشت بازو"
                            />
                          </div>

                          {progDays.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveWorkoutDay(currentDayTabIdx)}
                              className="text-[11.5px] text-[#E11D48] hover:bg-[#FFF1F2] px-2.5 py-1 rounded-[6px] font-bold cursor-pointer transition-colors"
                            >
                              حذف این روز
                            </button>
                          )}
                        </div>

                        {/* Exercises Table for this Day */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-right text-[12.5px] border-collapse">
                            <thead>
                              <tr className="border-b border-border text-[12px] font-extrabold text-ink-faint">
                                <th className="pt-2 pb-2 px-2 w-[45%]">حرکت</th>
                                <th className="text-center pt-2 pb-2 px-2 w-[17%]">ست</th>
                                <th className="text-center pt-2 pb-2 px-2 w-[17%]">تکرار</th>
                                <th className="text-center pt-2 pb-2 px-2 w-[17%]">استراحت (ثانیه)</th>
                                <th className="w-[4%]" />
                              </tr>
                            </thead>
                            <tbody>
                              {progDays[currentDayTabIdx].exercises.map((ex) => (
                                <tr
                                  key={ex.id}
                                  className="border-b border-border last:border-b-0 hover:bg-bg/40 transition-colors"
                                >
                                  {/* حرکت: Select + Text Input */}
                                  <td className="py-2 px-2">
                                    <div className="flex items-center gap-1.5">
                                      <select
                                        className="input p-[6px_8px] text-[12px] border border-border rounded-[8px] bg-bg w-1/2 min-w-[100px] outline-none"
                                        value={
                                          EXERCISE_LIBRARY.includes(ex.exercise)
                                            ? ex.exercise
                                            : ""
                                        }
                                        onChange={(e) => {
                                          if (e.target.value) {
                                            handleUpdateExerciseField(
                                              ex.id,
                                              "exercise",
                                              e.target.value
                                            );
                                          }
                                        }}
                                      >
                                        <option value="">انتخاب حرکت…</option>
                                        {EXERCISE_LIBRARY.map((item) => (
                                          <option key={item} value={item}>
                                            {item}
                                          </option>
                                        ))}
                                      </select>
                                      <input
                                        className="input p-[6px_10px] text-[12px] border border-border rounded-[8px] bg-bg w-1/2 min-w-[100px] outline-none focus:border-primary"
                                        value={ex.exercise}
                                        onChange={(e) =>
                                          handleUpdateExerciseField(
                                            ex.id,
                                            "exercise",
                                            e.target.value
                                          )
                                        }
                                        placeholder="یا حرکت سفارشی…"
                                      />
                                    </div>
                                  </td>

                                  {/* ست */}
                                  <td className="py-2 px-2 text-center">
                                    <input
                                      className="input p-[6px_8px] text-[12.5px] border border-border rounded-[8px] bg-bg w-full text-center outline-none focus:border-primary"
                                      value={ex.sets}
                                      onChange={(e) =>
                                        handleUpdateExerciseField(ex.id, "sets", e.target.value)
                                      }
                                      placeholder="۴"
                                    />
                                  </td>

                                  {/* تکرار */}
                                  <td className="py-2 px-2 text-center">
                                    <input
                                      className="input p-[6px_8px] text-[12.5px] border border-border rounded-[8px] bg-bg w-full text-center outline-none focus:border-primary"
                                      value={ex.reps}
                                      onChange={(e) =>
                                        handleUpdateExerciseField(ex.id, "reps", e.target.value)
                                      }
                                      placeholder="۱۰"
                                    />
                                  </td>

                                  {/* استراحت */}
                                  <td className="py-2 px-2 text-center">
                                    <input
                                      className="input p-[6px_8px] text-[12.5px] border border-border rounded-[8px] bg-bg w-full text-center outline-none focus:border-primary"
                                      value={ex.rest}
                                      onChange={(e) =>
                                        handleUpdateExerciseField(ex.id, "rest", e.target.value)
                                      }
                                      placeholder="۶۰"
                                    />
                                  </td>

                                  {/* حذف حرکت */}
                                  <td className="py-2 px-1 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteExercise(ex.id)}
                                      className="text-ink-faint hover:text-[#E11D48] hover:bg-[#FFF1F2] p-1.5 rounded-[6px] transition-colors cursor-pointer"
                                      title="حذف حرکت"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* دکمه افزودن حرکت */}
                        <button
                          type="button"
                          onClick={handleAddExerciseToCurrentDay}
                          className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-primary-dark hover:opacity-85 cursor-pointer pt-1"
                        >
                          <Plus className="h-4 w-4" />
                          <span>افزودن حرکت به این روز</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* وضعیت برنامه */}
                  <div className="flex items-center gap-3">
                    <span className="text-[12.5px] font-bold text-ink">وضعیت انتشار:</span>
                    <label className="flex items-center gap-1.5 text-[12.5px] text-ink-soft cursor-pointer">
                      <input
                        type="radio"
                        name="progStatus"
                        checked={progStatus === "active"}
                        onChange={() => setProgStatus("active")}
                        className="accent-primary"
                      />
                      <span>فعال و آماده تخصیص</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-[12.5px] text-ink-soft cursor-pointer">
                      <input
                        type="radio"
                        name="progStatus"
                        checked={progStatus === "draft"}
                        onChange={() => setProgStatus("draft")}
                        className="accent-primary"
                      />
                      <span>پیش‌نویس</span>
                    </label>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-border mt-auto">
                    <div className="text-[12px] text-ink-faint">
                      {toPersianDigits(progDays.length)} روز تمرینی ·{" "}
                      {toPersianDigits(
                        progDays.reduce((acc, d) => acc + d.exercises.length, 0)
                      )}{" "}
                      حرکت در مجموع
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCloseProgramModal}
                        className="btn btn-outline btn-sm cursor-pointer"
                      >
                        انصراف
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{editingProgramId ? "ذخیره تغییرات برنامه" : "ایجاد و ثبت برنامه"}</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL 3: مشاهده ریز حرکات برنامه */}
          {previewProgram && (
            <div
              className="fixed inset-0 z-70 flex items-center justify-center p-3 min-[640px]:p-5 bg-ink/50 backdrop-blur-[4px] animate-in fade-in duration-200"
              onClick={() => setPreviewProgram(null)}
              role="dialog"
              aria-modal="true"
            >
              <div
                className="relative z-10 flex flex-col w-full max-w-[680px] max-h-[90vh] bg-surface rounded-[22px] border border-border shadow-[0_20px_60px_rgba(15,23,42,0.18)] overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-4.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-tint text-primary-dark">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-[17px] font-extrabold text-ink">
                        {previewProgram.name}
                      </h3>
                      <div className="text-[12.5px] text-ink-faint mt-0.5">
                        {previewProgram.goal} · سطح {previewProgram.level} · {toPersianDigits(previewProgram.weeks)} هفته · قیمت: {toPersianDigits(previewProgram.price)} تومان
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewProgram(null)}
                    className="icon-btn w-9 h-9 rounded-[10px] flex items-center justify-center text-ink-faint hover:text-ink hover:bg-bg cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto flex flex-col gap-4">
                  {previewProgram.daysWorkout && previewProgram.daysWorkout.length > 0 ? (
                    previewProgram.daysWorkout.map((d) => (
                      <div
                        key={d.id}
                        className="border border-border rounded-[14px] overflow-hidden"
                      >
                        <div className="bg-bg px-4 py-2.5 border-b border-border font-extrabold text-[13.5px] text-ink flex justify-between">
                          <span>{d.title}</span>
                          <span className="text-[11.5px] font-normal text-ink-faint">
                            {toPersianDigits(d.exercises.length)} حرکت
                          </span>
                        </div>
                        <table className="w-full text-[12.5px] text-ink-soft border-collapse">
                          <thead>
                            <tr className="border-b border-border text-ink-faint font-bold">
                              <th className="text-right p-3">حرکت</th>
                              <th className="text-center p-3">ست</th>
                              <th className="text-center p-3">تکرار</th>
                              <th className="text-center p-3">استراحت</th>
                            </tr>
                          </thead>
                          <tbody>
                            {d.exercises.map((ex, i) => (
                              <tr
                                key={ex.id}
                                className="border-b border-border last:border-b-0 hover:bg-bg/40"
                              >
                                <td className="p-3 font-semibold text-ink">
                                  {toPersianDigits(i + 1)}. {ex.exercise}
                                </td>
                                <td className="p-3 text-center">{toPersianDigits(ex.sets)}</td>
                                <td className="p-3 text-center">{toPersianDigits(ex.reps)}</td>
                                <td className="p-3 text-center">
                                  {toPersianDigits(ex.rest)} ثانیه
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-ink-faint text-[13px]">
                      ریز حرکات برای این برنامه ثبت نشده است.
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-border flex justify-end bg-surface">
                  <button
                    type="button"
                    onClick={() => setPreviewProgram(null)}
                    className="btn btn-outline btn-sm cursor-pointer"
                  >
                    بستن
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toast Notification */}
          {toastMessage && (
            <div className="toast-wrap fixed bottom-6 left-6 z-200 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div
                className={cn(
                  "toast flex items-center gap-2.5 px-4 py-3 rounded-[12px] bg-ink text-white text-[13.5px] font-semibold shadow-lg",
                  toastType === "err" && "border border-[#FB7185]"
                )}
              >
                {toastType === "err" ? (
                  <AlertCircle className="h-4 w-4 text-[#FB7185] shrink-0" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-[#0EA5E9] shrink-0" />
                )}
                <span>{toastMessage}</span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
