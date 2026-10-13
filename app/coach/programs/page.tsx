"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CoachSidebar } from "@/components/coach/coach-sidebar";
import { CoachTopbar } from "@/components/coach/coach-topbar";
import { toPersianDigits } from "@/lib/persian-digits";
import { cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Eye,
  X,
  Dumbbell,
  User as UserIcon,
  Calendar,
  Layers,
  Sparkles,
  Printer,
  Check,
  FolderKanban,
  Search,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  BookOpen,
} from "lucide-react";

export interface ExerciseItem {
  id: string;
  exercise: string;
  sets: string;
  reps: string;
  rest: string;
}

export interface DayProgram {
  id: string;
  dayIndex: number;
  title: string;
  exercises: ExerciseItem[];
}

export interface StudentProgramRecord {
  id: string;
  studentName: string;
  studentAvatarColor: string;
  programTitle: string;
  goal: string;
  level: string;
  durationWeeks: number;
  currentWeek?: number;
  trainingDays: string[];
  totalExercises: number;
  status: "active" | "in_progress" | "expired";
  statusLabel: string;
  assignedDate: string;
  daysWorkout: DayProgram[];
}

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

const STUDENTS_LIST = [
  "سارا محمدی",
  "امیر صادقی",
  "رضا کاظمی",
  "مینا تهرانی",
  "کیان مرادی",
  "هانیه رضایی",
  "بهراد یوسفی",
  "علی پوراحمد",
  "فاطمه حسینی",
  "مهدی احمدی",
  "زهرا موسوی",
  "حسین باقری",
  "مریم کریمی",
  "سینا جعفری",
  "نگار ابراهیمی",
  "محمد رحیمی",
  "پویا طاهری",
  "الهام زارعی",
  "دانیال عباسی",
  "سامان خسروی",
  "رویا معتمدی",
];

const ALL_WEEK_DAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];

const INITIAL_DAYS_DATA: DayProgram[] = [
  {
    id: "day-1",
    dayIndex: 0,
    title: "روز ۱",
    exercises: [
      { id: "e1", exercise: "پرس سینه هالتر", sets: "۴", reps: "۸", rest: "۹۰" },
      { id: "e2", exercise: "زیر بغل سیم‌کش", sets: "۴", reps: "۱۰", rest: "۶۰" },
      { id: "e3", exercise: "جلو بازو دمبل", sets: "۳", reps: "۱۲", rest: "۴۵" },
    ],
  },
  {
    id: "day-2",
    dayIndex: 1,
    title: "روز ۲",
    exercises: [
      { id: "e4", exercise: "اسکوات", sets: "۵", reps: "۶", rest: "۱۲۰" },
      { id: "e5", exercise: "پرس پا", sets: "۴", reps: "۱۰", rest: "۹۰" },
      { id: "e6", exercise: "پلانک", sets: "۳", reps: "۴۵ث", rest: "۳۰" },
    ],
  },
  {
    id: "day-3",
    dayIndex: 2,
    title: "روز ۳",
    exercises: [
      { id: "e7", exercise: "پرس سرشانه", sets: "۴", reps: "۸", rest: "۹۰" },
      { id: "e8", exercise: "ددلیفت", sets: "۴", reps: "۶", rest: "۱۲۰" },
    ],
  },
];

const INITIAL_STUDENTS_PROGRAMS: StudentProgramRecord[] = [
  {
    id: "sp-1",
    studentName: "سارا محمدی",
    studentAvatarColor: "#16E0A0",
    programTitle: "برنامه‌ی حجم پیشرفته (Hypertrophy 4-Day)",
    goal: "افزایش حجم",
    level: "پیشرفته",
    durationWeeks: 8,
    currentWeek: 3,
    trainingDays: ["شنبه", "یکشنبه", "سه‌شنبه", "چهارشنبه"],
    totalExercises: 8,
    status: "active",
    statusLabel: "فعال — هفته ۳",
    assignedDate: "۱۴۰۴/۰۴/۱۵",
    daysWorkout: [
      {
        id: "d1",
        dayIndex: 0,
        title: "روز ۱ (سینه و زیربغل)",
        exercises: [
          { id: "e1", exercise: "پرس سینه هالتر", sets: "۴", reps: "۸", rest: "۹۰" },
          { id: "e2", exercise: "زیر بغل سیم‌کش", sets: "۴", reps: "۱۰", rest: "۶۰" },
          { id: "e3", exercise: "جلو بازو دمبل", sets: "۳", reps: "۱۲", rest: "۴۵" },
        ],
      },
      {
        id: "d2",
        dayIndex: 1,
        title: "روز ۲ (پا و شکم)",
        exercises: [
          { id: "e4", exercise: "اسکوات", sets: "۵", reps: "۶", rest: "۱۲۰" },
          { id: "e5", exercise: "پرس پا", sets: "۴", reps: "۱۰", rest: "۹۰" },
          { id: "e6", exercise: "پلانک", sets: "۳", reps: "۴۵ث", rest: "۳۰" },
        ],
      },
      {
        id: "d3",
        dayIndex: 2,
        title: "روز ۳ (سرشانه و دست)",
        exercises: [
          { id: "e7", exercise: "پرس سرشانه", sets: "۴", reps: "۸", rest: "۹۰" },
          { id: "e8", exercise: "ددلیفت", sets: "۴", reps: "۶", rest: "۱۲۰" },
        ],
      },
    ],
  },
  {
    id: "sp-2",
    studentName: "امیر صادقی",
    studentAvatarColor: "#22D3EE",
    programTitle: "قدرت و توان انفجاری (5x5 Power)",
    goal: "افزایش قدرت",
    level: "حرفه‌ای",
    durationWeeks: 6,
    currentWeek: 5,
    trainingDays: ["شنبه", "دوشنبه", "چهارشنبه"],
    totalExercises: 7,
    status: "active",
    statusLabel: "فعال — هفته ۵",
    assignedDate: "۱۴۰۴/۰۳/۲۰",
    daysWorkout: [
      {
        id: "d1",
        dayIndex: 0,
        title: "روز ۱ (اسکوات و سینه)",
        exercises: [
          { id: "e1", exercise: "اسکوات", sets: "۵", reps: "۵", rest: "۱۵۰" },
          { id: "e2", exercise: "پرس سینه هالتر", sets: "۵", reps: "۵", rest: "۱۲۰" },
        ],
      },
      {
        id: "d2",
        dayIndex: 1,
        title: "روز ۲ (ددلیفت و سرشانه)",
        exercises: [
          { id: "e3", exercise: "ددلیفت", sets: "۵", reps: "۳", rest: "۱۸۰" },
          { id: "e4", exercise: "پرس سرشانه هالتر", sets: "۵", reps: "۵", rest: "۱۲۰" },
        ],
      },
      {
        id: "d3",
        dayIndex: 2,
        title: "روز ۳ (فول‌بادی تکمیلی)",
        exercises: [
          { id: "e5", exercise: "پرس پا سنگین", sets: "۴", reps: "۸", rest: "۱۲۰" },
          { id: "e6", exercise: "لت سیم‌کش دست باز", sets: "۴", reps: "۸", rest: "۹۰" },
          { id: "e7", exercise: "شنا سوئدی با وزنه", sets: "۳", reps: "۱۰", rest: "۶۰" },
        ],
      },
    ],
  },
  {
    id: "sp-3",
    studentName: "رضا کاظمی",
    studentAvatarColor: "#6366F1",
    programTitle: "چربی‌سوزی و کات شدید (HIIT + Circuit)",
    goal: "چربی‌سوزی",
    level: "متوسط",
    durationWeeks: 4,
    currentWeek: 4,
    trainingDays: ["شنبه", "یکشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه"],
    totalExercises: 8,
    status: "in_progress",
    statusLabel: "رو به اتمام — هفته ۴",
    assignedDate: "۱۴۰۴/۰۴/۰۱",
    daysWorkout: [
      {
        id: "d1",
        dayIndex: 0,
        title: "روز ۱ (دایره‌ای بالاتنه)",
        exercises: [
          { id: "e1", exercise: "شنا سوئدی", sets: "۴", reps: "۱۵", rest: "۳۰" },
          { id: "e2", exercise: "زیر بغل سیم‌کش", sets: "۴", reps: "۱۲", rest: "۴۵" },
          { id: "e3", exercise: "کرانچ شکم", sets: "۴", reps: "۲۰", rest: "۳۰" },
        ],
      },
      {
        id: "d2",
        dayIndex: 1,
        title: "روز ۲ (پایین‌تنه متابولیک)",
        exercises: [
          { id: "e4", exercise: "اسکوات با کش", sets: "۴", reps: "۲۰", rest: "۳۰" },
          { id: "e5", exercise: "لانج دمبل", sets: "۴", reps: "۱۲", rest: "۴۵" },
          { id: "e6", exercise: "پلانک پویا", sets: "۳", reps: "۶۰ث", rest: "۳۰" },
        ],
      },
      {
        id: "d3",
        dayIndex: 2,
        title: "روز ۳ (انفجاری)",
        exercises: [
          { id: "e7", exercise: "برپی و شنا", sets: "۴", reps: "۱۲", rest: "۴۵" },
          { id: "e8", exercise: "جلو بازو دمبل", sets: "۳", reps: "۱۵", rest: "۴۵" },
        ],
      },
    ],
  },
  {
    id: "sp-4",
    studentName: "مینا تهرانی",
    studentAvatarColor: "#F59E0B",
    programTitle: "تناسب اندام و فرم‌دهی بانوان",
    goal: "تناسب اندام عمومی",
    level: "مقدماتی",
    durationWeeks: 12,
    currentWeek: 2,
    trainingDays: ["شنبه", "دوشنبه", "چهارشنبه"],
    totalExercises: 6,
    status: "active",
    statusLabel: "فعال — هفته ۲",
    assignedDate: "۱۴۰۴/۰۴/۱۸",
    daysWorkout: [
      {
        id: "d1",
        dayIndex: 0,
        title: "روز ۱ (فرم‌دهی باسن و پا)",
        exercises: [
          { id: "e1", exercise: "هیپ تراست دمبل", sets: "۴", reps: "۱۲", rest: "۶۰" },
          { id: "e2", exercise: "اسکوات گابلت", sets: "۳", reps: "۱۵", rest: "۶۰" },
          { id: "e3", exercise: "پشت پا دستگاه", sets: "۳", reps: "۱۵", rest: "۴۵" },
        ],
      },
      {
        id: "d2",
        dayIndex: 1,
        title: "روز ۲ (پشت، سینه و شکم)",
        exercises: [
          { id: "e4", exercise: "لت سیم‌کش دست باز", sets: "۳", reps: "۱۲", rest: "۶۰" },
          { id: "e5", exercise: "پرس سینه دمبل", sets: "۳", reps: "۱۲", rest: "۶۰" },
          { id: "e6", exercise: "پلانک", sets: "۳", reps: "۴۰ث", rest: "۳۰" },
        ],
      },
    ],
  },
  {
    id: "sp-5",
    studentName: "کیان مرادی",
    studentAvatarColor: "#0EA5E9",
    programTitle: "برنامه شروع و پایه‌ی بدنسازی",
    goal: "آمادگی جسمانی",
    level: "مبتدی",
    durationWeeks: 4,
    currentWeek: 1,
    trainingDays: ["شنبه", "دوشنبه", "چهارشنبه"],
    totalExercises: 5,
    status: "active",
    statusLabel: "فعال — هفته ۱",
    assignedDate: "۱۴۰۴/۰۴/۲۲",
    daysWorkout: [
      {
        id: "d1",
        dayIndex: 0,
        title: "روز ۱",
        exercises: [
          { id: "e1", exercise: "پرس سینه دستگاه", sets: "۳", reps: "۱۲", rest: "۶۰" },
          { id: "e2", exercise: "جلو ران دستگاه", sets: "۳", reps: "۱۵", rest: "۶۰" },
        ],
      },
      {
        id: "d2",
        dayIndex: 1,
        title: "روز ۲",
        exercises: [
          { id: "e3", exercise: "زیر بغل سیم‌کش", sets: "۳", reps: "۱۲", rest: "۶۰" },
          { id: "e4", exercise: "سرشانه دمبل", sets: "۳", reps: "۱۲", rest: "۶۰" },
          { id: "e5", exercise: "کرانچ", sets: "۳", reps: "۲۰", rest: "۳۰" },
        ],
      },
    ],
  },
  {
    id: "sp-6",
    studentName: "هانیه رضایی",
    studentAvatarColor: "#10B981",
    programTitle: "چربی‌سوزی اینتروال + شکم و پهلو",
    goal: "چربی‌سوزی",
    level: "متوسط",
    durationWeeks: 6,
    currentWeek: 6,
    trainingDays: ["شنبه", "یکشنبه", "سه‌شنبه", "چهارشنبه"],
    totalExercises: 5,
    status: "in_progress",
    statusLabel: "رو به اتمام — هفته ۶",
    assignedDate: "۱۴۰۴/۰۳/۱۵",
    daysWorkout: [
      {
        id: "d1",
        dayIndex: 0,
        title: "روز ۱",
        exercises: [
          { id: "e1", exercise: "اسکوات با کش", sets: "۴", reps: "۱۵", rest: "۴۵" },
          { id: "e2", exercise: "پلانک پهلو", sets: "۳", reps: "۳۰ث", rest: "۳۰" },
          { id: "e3", exercise: "شنا سوئدی", sets: "۳", reps: "۱۰", rest: "۴۵" },
        ],
      },
      {
        id: "d2",
        dayIndex: 1,
        title: "روز ۲",
        exercises: [
          { id: "e4", exercise: "لانج راه رفتنی", sets: "۳", reps: "۱۲", rest: "۴۵" },
          { id: "e5", exercise: "کرانچ شکم", sets: "۴", reps: "۲۵", rest: "۳۰" },
        ],
      },
    ],
  },
  {
    id: "sp-7",
    studentName: "نیما اکبری",
    studentAvatarColor: "#EC4899",
    programTitle: "حجم عضلانی فاز ۱",
    goal: "افزایش حجم",
    level: "متوسط",
    durationWeeks: 8,
    currentWeek: 8,
    trainingDays: ["شنبه", "دوشنبه", "چهارشنبه"],
    totalExercises: 6,
    status: "expired",
    statusLabel: "منقضی — پایان دوره",
    assignedDate: "۱۴۰۴/۰۲/۲۵",
    daysWorkout: [
      {
        id: "d1",
        dayIndex: 0,
        title: "روز ۱",
        exercises: [
          { id: "e1", exercise: "پرس سینه هالتر", sets: "۴", reps: "۱۰", rest: "۹۰" },
          { id: "e2", exercise: "زیر بغل سیم‌کش", sets: "۴", reps: "۱۰", rest: "۶۰" },
        ],
      },
      {
        id: "d2",
        dayIndex: 1,
        title: "روز ۲",
        exercises: [
          { id: "e3", exercise: "اسکوات", sets: "۴", reps: "۸", rest: "۱۲۰" },
          { id: "e4", exercise: "پرس پا", sets: "۴", reps: "۱۰", rest: "۹۰" },
        ],
      },
      {
        id: "d3",
        dayIndex: 2,
        title: "روز ۳",
        exercises: [
          { id: "e5", exercise: "پرس سرشانه", sets: "۴", reps: "۸", rest: "۹۰" },
          { id: "e6", exercise: "ددلیفت", sets: "۴", reps: "۶", rest: "۱۲۰" },
        ],
      },
    ],
  },
  {
    id: "sp-8",
    studentName: "بهراد یوسفی",
    studentAvatarColor: "#8B5CF6",
    programTitle: "قدرت و توان بدنی سنگین",
    goal: "افزایش قدرت",
    level: "پیشرفته",
    durationWeeks: 10,
    currentWeek: 2,
    trainingDays: ["شنبه", "یکشنبه", "سه‌شنبه", "چهارشنبه"],
    totalExercises: 7,
    status: "active",
    statusLabel: "فعال — هفته ۲",
    assignedDate: "۱۴۰۴/۰۴/۱۰",
    daysWorkout: [
      {
        id: "d1",
        dayIndex: 0,
        title: "روز ۱",
        exercises: [
          { id: "e1", exercise: "اسکوات از پشت سنگین", sets: "۴", reps: "۵", rest: "۱۵۰" },
          { id: "e2", exercise: "پرس پا دستگاه", sets: "۴", reps: "۸", rest: "۱۲۰" },
        ],
      },
      {
        id: "d2",
        dayIndex: 1,
        title: "روز ۲",
        exercises: [
          { id: "e3", exercise: "پرس سینه هالتر", sets: "۴", reps: "۶", rest: "۱۲۰" },
          { id: "e4", exercise: "دیپ پارالل با وزنه", sets: "۳", reps: "۸", rest: "۹۰" },
        ],
      },
      {
        id: "d3",
        dayIndex: 2,
        title: "روز ۳",
        exercises: [
          { id: "e5", exercise: "ددلیفت سومو", sets: "۴", reps: "۵", rest: "۱۸۰" },
          { id: "e6", exercise: "لت سیم‌کش دست باز", sets: "۴", reps: "۸", rest: "۹۰" },
          { id: "e7", exercise: "فیله کمر با وزنه", sets: "۳", reps: "۱۲", rest: "۶۰" },
        ],
      },
    ],
  },
];

export default function CoachProgramsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form State
  const [programName, setProgramName] = useState("برنامه‌ی حجم پیشرفته");
  const [athlete, setAthlete] = useState("سارا محمدی");
  const [goal, setGoal] = useState("افزایش حجم");
  const [weeks, setWeeks] = useState(8);
  const [level, setLevel] = useState("متوسط");
  const [trainingDays, setTrainingDays] = useState<string[]>([
    "شنبه",
    "دوشنبه",
    "چهارشنبه",
  ]);

  // Exercise builder state per day
  const [days, setDays] = useState<DayProgram[]>(INITIAL_DAYS_DATA);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  // All Students Programs List State (second requirement)
  const [studentsPrograms, setStudentsPrograms] = useState<StudentProgramRecord[]>(
    INITIAL_STUDENTS_PROGRAMS
  );
  const [isProgramsListModalOpen, setIsProgramsListModalOpen] = useState(false);
  const [programsSearch, setProgramsSearch] = useState("");
  const [programsFilter, setProgramsFilter] = useState<
    "all" | "active" | "in_progress" | "expired"
  >("all");
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>("sp-1");

  // Modal & Notification states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Toggle week day chip
  const toggleDayChip = (day: string) => {
    if (trainingDays.includes(day)) {
      setTrainingDays(trainingDays.filter((d) => d !== day));
    } else {
      setTrainingDays([...trainingDays, day]);
    }
  };

  // Active day exercises
  const currentDay = days[currentDayIndex] || days[0];

  // Add exercise to current day
  const handleAddExercise = () => {
    const newEx: ExerciseItem = {
      id: "ex-" + Date.now(),
      exercise: EXERCISE_LIBRARY[0],
      sets: "۳",
      reps: "۱۰",
      rest: "۶۰",
    };
    setDays((prev) =>
      prev.map((d, idx) =>
        idx === currentDayIndex
          ? { ...d, exercises: [...d.exercises, newEx] }
          : d
      )
    );
  };

  // Delete exercise
  const handleDeleteExercise = (exId: string) => {
    setDays((prev) =>
      prev.map((d, idx) =>
        idx === currentDayIndex
          ? { ...d, exercises: d.exercises.filter((e) => e.id !== exId) }
          : d
      )
    );
  };

  // Update exercise field
  const handleUpdateExercise = (
    exId: string,
    field: keyof ExerciseItem,
    value: string
  ) => {
    setDays((prev) =>
      prev.map((d, idx) =>
        idx === currentDayIndex
          ? {
            ...d,
            exercises: d.exercises.map((e) =>
              e.id === exId ? { ...e, [field]: value } : e
            ),
          }
          : d
      )
    );
  };

  // Add a new day tab
  const handleAddNewDay = () => {
    const nextIndex = days.length;
    const newDay: DayProgram = {
      id: "day-" + (nextIndex + 1),
      dayIndex: nextIndex,
      title: `روز ${toPersianDigits(nextIndex + 1)}`,
      exercises: [],
    };
    setDays([...days, newDay]);
    setCurrentDayIndex(nextIndex);
  };

  // Total exercises across all days
  const totalExercisesCount = useMemo(() => {
    return days.reduce((acc, d) => acc + d.exercises.length, 0);
  }, [days]);

  // Reset form / New program
  const handleNewProgram = () => {
    setProgramName("");
    setAthlete("");
    setGoal("افزایش حجم");
    setWeeks(8);
    setLevel("متوسط");
    setTrainingDays(["شنبه", "دوشنبه", "چهارشنبه"]);
    setDays([
      {
        id: "day-1",
        dayIndex: 0,
        title: "روز ۱",
        exercises: [],
      },
      {
        id: "day-2",
        dayIndex: 1,
        title: "روز ۲",
        exercises: [],
      },
      {
        id: "day-3",
        dayIndex: 2,
        title: "روز ۳",
        exercises: [],
      },
    ]);
    setCurrentDayIndex(0);
    showToast("فرم برنامه‌ی جدید آماده شد");
  };

  // Assign to athlete
  const handleAssignToAthlete = () => {
    if (!programName.trim()) {
      showToast("لطفاً نام برنامه را وارد کنید");
      return;
    }
    if (!athlete.trim()) {
      showToast("لطفاً یک شاگرد را برای تخصیص انتخاب کنید");
      return;
    }

    // Add or update program in studentsPrograms list
    const newRecord: StudentProgramRecord = {
      id: "sp-" + Date.now(),
      studentName: athlete.trim(),
      studentAvatarColor: "#16E0A0",
      programTitle: programName.trim(),
      goal,
      level,
      durationWeeks: weeks,
      currentWeek: 1,
      trainingDays: [...trainingDays],
      totalExercises: totalExercisesCount,
      status: "active",
      statusLabel: "فعال — هفته ۱",
      assignedDate: "امروز",
      daysWorkout: JSON.parse(JSON.stringify(days)),
    };

    setStudentsPrograms((prev) => [newRecord, ...prev]);
    setIsSuccessModalOpen(true);
  };

  // Save Draft
  const handleSaveDraft = () => {
    showToast("پیش‌نویس برنامه با موفقیت ذخیره شد");
  };

  // Load an existing student program into the builder
  const handleLoadProgramToBuilder = (record: StudentProgramRecord) => {
    setProgramName(record.programTitle);
    setAthlete(record.studentName);
    setGoal(record.goal);
    setWeeks(record.durationWeeks);
    setLevel(record.level);
    setTrainingDays(record.trainingDays);
    if (record.daysWorkout && record.daysWorkout.length > 0) {
      setDays(JSON.parse(JSON.stringify(record.daysWorkout)));
    }
    setCurrentDayIndex(0);
    setIsProgramsListModalOpen(false);
    showToast(`برنامه‌ی «${record.programTitle}» در برنامه‌ساز بارگذاری شد`);
  };

  // Filtered student programs for the modal window
  const filteredStudentsPrograms = useMemo(() => {
    return studentsPrograms.filter((item) => {
      const matchFilter =
        programsFilter === "all" || item.status === programsFilter;
      const matchSearch =
        programsSearch.trim() === "" ||
        item.studentName.includes(programsSearch) ||
        item.programTitle.includes(programsSearch) ||
        item.goal.includes(programsSearch);
      return matchFilter && matchSearch;
    });
  }, [studentsPrograms, programsFilter, programsSearch]);

  return (
    <div className="app flex min-h-screen">
      {/* Sidebar Navigation */}
      <CoachSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Container */}
      <div className="main flex flex-1 flex-col min-w-0">
        {/* Topbar: Exactly like dashboard part */}
        <CoachTopbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          searchPlaceholder="جستجو…"
        />

        {/* Content Area */}
        <main className="content flex-1 p-[18px] min-[640px]:p-[28px]">
          {/* Page Head */}
          <div className="page-head flex flex-wrap items-end justify-between gap-[16px] mb-[24px]">
            <div>
              <h1 className="text-[22px] min-[640px]:text-[26px] font-extrabold text-ink tracking-[-0.01em]">
                برنامه‌ساز
              </h1>
              <div className="sub text-[14px] text-ink-faint mt-[5px]">
                یک برنامه‌ی تمرینی بساز و به شاگرد تخصیص بده
              </div>
            </div>

            {/* Actions: Button to open all Coach's programs next to preview button */}
            <div className="page-head-actions flex items-center gap-[10px]">
              <button
                type="button"
                onClick={() => setIsProgramsListModalOpen(true)}
                className="btn btn-outline btn-sm cursor-pointer border-primary/30 hover:border-primary text-ink bg-surface shadow-sm"
                title="مشاهده تمام برنامه‌های مربی برای هر شاگرد"
              >
                <FolderKanban className="h-4 w-4 text-primary-dark" />
                <span>برنامه‌های شاگردان</span>
                <span className="badge mr-1 bg-tint text-primary-dark text-[11px] px-1.5 py-0.5 rounded-full font-bold">
                  {toPersianDigits(studentsPrograms.length)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="btn btn-outline btn-sm cursor-pointer"
              >
                <Eye className="h-4 w-4" />
                <span>پیش‌نمایش</span>
              </button>

              <button
                type="button"
                onClick={handleNewProgram}
                className="btn btn-primary btn-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>برنامه‌ی جدید</span>
              </button>
            </div>
          </div>

          {/* Builder Layout: 1.6fr builder, 1fr summary */}
          <div className="grid-2 grid grid-cols-1 min-[1101px]:grid-cols-[1.6fr_1fr] gap-[18px] mb-[18px]">
            {/* Builder Column (Left) */}
            <div className="flex flex-col gap-[18px]">
              {/* Card 1: مشخصات برنامه */}
              <div className="card bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                <div className="card-head flex items-center justify-between p-[20px_22px] border-b border-border">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-ink">
                      مشخصات برنامه
                    </h3>
                    <div className="hint text-[12.5px] text-ink-faint mt-[3px]">
                      اطلاعات کلی و هدف برنامه
                    </div>
                  </div>
                </div>
                <div className="card-body p-[22px]">
                  <div className="form-grid grid grid-cols-1 min-[640px]:grid-cols-2 gap-4">
                    {/* نام برنامه */}
                    <div className="field full min-[640px]:col-span-2">
                      <label className="text-[13px] font-bold text-ink mb-1.5 block">
                        نام برنامه <span className="req text-[#F43F5E]">*</span>
                      </label>
                      <input
                        className="input"
                        id="pName"
                        value={programName}
                        onChange={(e) => setProgramName(e.target.value)}
                        placeholder="مثلاً: برنامه‌ی حجم پیشرفته"
                      />
                    </div>

                    {/* تخصیص به شاگرد */}
                    <div className="field">
                      <label className="text-[13px] font-bold text-ink mb-1.5 block">
                        تخصیص به شاگرد <span className="req text-[#F43F5E]">*</span>
                      </label>
                      <select
                        className="input"
                        id="pAthlete"
                        value={athlete}
                        onChange={(e) => setAthlete(e.target.value)}
                      >
                        <option value="">انتخاب شاگرد…</option>
                        {STUDENTS_LIST.map((stu) => (
                          <option key={stu} value={stu}>
                            {stu}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* هدف */}
                    <div className="field">
                      <label className="text-[13px] font-bold text-ink mb-1.5 block">
                        هدف
                      </label>
                      <select
                        className="input"
                        id="pGoal"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                      >
                        <option value="افزایش حجم">افزایش حجم</option>
                        <option value="چربی‌سوزی">چربی‌سوزی</option>
                        <option value="افزایش قدرت">افزایش قدرت</option>
                        <option value="تناسب اندام عمومی">تناسب اندام عمومی</option>
                      </select>
                    </div>

                    {/* مدت برنامه (هفته) */}
                    <div className="field">
                      <label className="text-[13px] font-bold text-ink mb-1.5 block">
                        مدت برنامه (هفته)
                      </label>
                      <input
                        className="input"
                        id="pWeeks"
                        type="number"
                        min={1}
                        max={52}
                        value={weeks}
                        onChange={(e) =>
                          setWeeks(Math.max(1, parseInt(e.target.value) || 1))
                        }
                      />
                    </div>

                    {/* سطح */}
                    <div className="field">
                      <label className="text-[13px] font-bold text-ink mb-1.5 block">
                        سطح
                      </label>
                      <select
                        className="input"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                      >
                        <option value="مبتدی">مبتدی</option>
                        <option value="متوسط">متوسط</option>
                        <option value="پیشرفته">پیشرفته</option>
                      </select>
                    </div>

                    {/* روزهای تمرین در هفته */}
                    <div className="field full min-[640px]:col-span-2">
                      <label className="text-[13px] font-bold text-ink mb-2 block">
                        روزهای تمرین در هفته
                      </label>
                      <div className="chip-pick flex flex-wrap gap-2" id="dayPick">
                        {ALL_WEEK_DAYS.map((day) => {
                          const isSelected = trainingDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDayChip(day)}
                              className={cn("cp", isSelected && "on")}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: حرکات تمرین */}
              <div className="card bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                <div className="card-head flex items-center justify-between p-[20px_22px] border-b border-border flex-wrap gap-3">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-ink">
                      حرکات تمرین
                    </h3>
                    <div className="hint text-[12.5px] text-ink-faint mt-[3px]">
                      برای هر روز حرکت‌ها را اضافه کن
                    </div>
                  </div>
                  {/* Day tabs segmented control */}
                  <div className="seg flex gap-1 bg-bg p-1 rounded-[10px]" id="dayTabs">
                    {days.map((d, index) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setCurrentDayIndex(index)}
                        className={cn(
                          "px-3 py-1.5 text-[12.5px] font-bold rounded-[8px] transition-all duration-150 cursor-pointer",
                          currentDayIndex === index
                            ? "bg-surface text-ink shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
                            : "text-ink-faint hover:text-ink"
                        )}
                      >
                        {d.title}
                      </button>
                    ))}
                    {days.length < 7 && (
                      <button
                        type="button"
                        onClick={handleAddNewDay}
                        title="افزودن روز تمرینی جدید"
                        className="px-2 py-1.5 text-[12px] font-bold rounded-[8px] text-primary-dark hover:bg-tint transition-all duration-150 cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>روز جدید</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="card-body p-[22px]">
                  <div className="table-wrap overflow-x-auto">
                    <table className="w-full table-fixed border-collapse">
                      <thead>
                        <tr className="border-b border-border text-[13.5px] font-extrabold text-ink-faint">
                          <th className="text-right pt-4 pb-3 px-2 w-[46%] font-extrabold whitespace-nowrap">
                            حرکت (انتخاب از لیست یا نام دلخواه)
                          </th>
                          <th className="text-center pt-4 pb-3 px-2 w-[16%] font-extrabold whitespace-nowrap">
                            ست
                          </th>
                          <th className="text-center pt-4 pb-3 px-2 w-[16%] font-extrabold whitespace-nowrap">
                            تکرار
                          </th>
                          <th className="text-center pt-4 pb-3 px-2 w-[16%] font-extrabold whitespace-nowrap">
                            استراحت (ثانیه)
                          </th>
                          <th className="w-[6%] pt-4 pb-3 px-1"></th>
                        </tr>
                      </thead>
                      <tbody id="exList">
                        {currentDay && currentDay.exercises.length > 0 ? (
                          currentDay.exercises.map((row) => (
                            <tr
                              key={row.id}
                              className="border-b border-border last:border-b-0 hover:bg-bg/40 transition-colors"
                            >
                              {/* Column 1: Dropdown of moves BESIDE Customize Move input */}
                              <td className="py-2.5 px-2">
                                <div className="flex items-center gap-2">
                                  {/* Dropdown for quick move selection */}
                                  <select
                                    className="input p-[8px_10px] text-[12.5px] w-1/2 min-w-[110px]"
                                    value={
                                      EXERCISE_LIBRARY.includes(row.exercise)
                                        ? row.exercise
                                        : ""
                                    }
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        handleUpdateExercise(
                                          row.id,
                                          "exercise",
                                          e.target.value
                                        );
                                      }
                                    }}
                                    title="انتخاب از بانک حرکات"
                                  >
                                    <option value="">انتخاب از لیست حرکات…</option>
                                    {EXERCISE_LIBRARY.map((item) => (
                                      <option key={item} value={item}>
                                        {item}
                                      </option>
                                    ))}
                                  </select>

                                  {/* Custom text input beside dropdown to write customize move */}
                                  <input
                                    className="input p-[8px_12px] text-[12.5px] w-1/2 min-w-[110px]"
                                    value={row.exercise}
                                    onChange={(e) =>
                                      handleUpdateExercise(
                                        row.id,
                                        "exercise",
                                        e.target.value
                                      )
                                    }
                                    placeholder="یا نام حرکت دلخواه…"
                                    title="نوشتن نام حرکت سفارشی یا ویرایش"
                                  />
                                </div>
                              </td>

                              <td className="py-2.5 px-2 text-center">
                                <input
                                  className="input p-[9px_12px] text-[13px] text-center w-full"
                                  value={row.sets}
                                  onChange={(e) =>
                                    handleUpdateExercise(row.id, "sets", e.target.value)
                                  }
                                  placeholder="ست"
                                />
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <input
                                  className="input p-[9px_12px] text-[13px] text-center w-full"
                                  value={row.reps}
                                  onChange={(e) =>
                                    handleUpdateExercise(row.id, "reps", e.target.value)
                                  }
                                  placeholder="تکرار"
                                />
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <input
                                  className="input p-[9px_12px] text-[13px] text-center w-full"
                                  value={row.rest}
                                  onChange={(e) =>
                                    handleUpdateExercise(row.id, "rest", e.target.value)
                                  }
                                  placeholder="ثانیه"
                                />
                              </td>
                              <td className="py-2.5 px-1 text-center">
                                <div className="ex-del-wrap flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteExercise(row.id)}
                                    className="row-action text-ink-faint w-[32px] h-[32px] rounded-[8px] inline-flex items-center justify-center transition-all duration-150 hover:bg-[#FFF1F2] hover:text-[#E11D48] cursor-pointer"
                                    aria-label="حذف حرکت"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-[13px] text-ink-faint">
                              حرکتی برای {currentDay?.title || "این روز"} اضافه نشده — از
                              دکمه‌ی پایین استفاده کن
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Exercise button */}
                  <button
                    type="button"
                    onClick={handleAddExercise}
                    className="add-ex inline-flex items-center gap-1.5 text-[13px] font-bold text-primary-dark pt-3 pb-1 cursor-pointer hover:opacity-85 transition-opacity"
                    id="addEx"
                  >
                    <Plus className="h-4 w-4" />
                    <span>افزودن حرکت</span>
                  </button>

                  {/* Sticky save bar */}
                  <div className="save-bar sticky bottom-0 bg-white/95 backdrop-blur-[8px] border-t border-border flex items-center justify-between gap-3 pt-3.5 mt-2 flex-wrap">
                    <div className="form-note text-[12.5px] text-ink-faint">
                      <span id="totalEx" className="font-bold text-ink">
                        {toPersianDigits(currentDay?.exercises.length || 0)}
                      </span>{" "}
                      حرکت در این روز
                    </div>
                    <div className="form-actions flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleSaveDraft}
                        className="btn btn-outline btn-sm cursor-pointer"
                        id="saveDraft"
                      >
                        ذخیره‌ی پیش‌نویس
                      </button>
                      <button
                        type="button"
                        onClick={handleAssignToAthlete}
                        className="btn btn-primary btn-sm cursor-pointer"
                        id="assignBtn"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>تخصیص به شاگرد</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Column (Right) */}
            <div>
              <div className="card bg-surface border border-border rounded-[16px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] sticky top-[92px]">
                <div className="card-head flex items-center justify-between p-[20px_22px] border-b border-border">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-ink">
                      خلاصه‌ی برنامه
                    </h3>
                    <div className="hint text-[12.5px] text-ink-faint mt-[3px]">
                      پیش‌نمایش زنده
                    </div>
                  </div>
                </div>
                <div className="card-body p-[22px]">
                  {/* Row 1: Program Name & Goal */}
                  <div className="sum-row flex items-center gap-3 py-3.5 border-b border-border">
                    <span className="sum-ico w-[38px] h-[38px] rounded-[11px] bg-tint text-primary-dark flex items-center justify-center shrink-0">
                      <Dumbbell className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="t text-[13.5px] font-bold text-ink truncate" id="sName">
                        {programName.trim() || "— بدون نام —"}
                      </div>
                      <div className="d text-[12px] text-ink-faint mt-0.5" id="sGoal">
                        {goal}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Athlete */}
                  <div className="sum-row flex items-center gap-3 py-3.5 border-b border-border">
                    <span className="sum-ico w-[38px] h-[38px] rounded-[11px] bg-tint text-primary-dark flex items-center justify-center shrink-0">
                      <UserIcon className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="t text-[13.5px] font-bold text-ink">شاگرد</div>
                      <div className="d text-[12px] text-ink-faint mt-0.5" id="sAthlete">
                        {athlete.trim() || "انتخاب نشده"}
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Training Days & Duration */}
                  <div className="sum-row flex items-center gap-3 py-3.5 border-b border-border">
                    <span className="sum-ico w-[38px] h-[38px] rounded-[11px] bg-tint text-primary-dark flex items-center justify-center shrink-0">
                      <Calendar className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="t text-[13.5px] font-bold text-ink">روزهای هفته</div>
                      <div className="d text-[12px] text-ink-faint mt-0.5" id="sDays">
                        {toPersianDigits(trainingDays.length)} روز
                      </div>
                    </div>
                    <span className="val text-[13px] font-extrabold text-ink mr-auto" id="sWeeks">
                      {toPersianDigits(weeks)} هفته
                    </span>
                  </div>

                  {/* Row 4: Total Exercises */}
                  <div className="sum-row flex items-center gap-3 py-3.5 border-b border-border">
                    <span className="sum-ico w-[38px] h-[38px] rounded-[11px] bg-tint text-primary-dark flex items-center justify-center shrink-0">
                      <Layers className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="t text-[13.5px] font-bold text-ink">
                        مجموع حرکت‌ها
                      </div>
                      <div className="d text-[12px] text-ink-faint mt-0.5">
                        در همه‌ی روزها
                      </div>
                    </div>
                    <span className="val text-[13px] font-extrabold text-ink mr-auto" id="sTotal">
                      {toPersianDigits(totalExercisesCount)}
                    </span>
                  </div>

                  {/* Status tag */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="tag inline-flex items-center text-[12px] font-bold text-primary-dark bg-tint px-3 py-1 rounded-full">
                      آماده‌ی تخصیص
                    </span>
                    <span className="text-[12px] text-ink-faint font-semibold">
                      سطح {level}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-80 flex items-center gap-2.5 rounded-[12px] bg-ink px-4 py-3 text-[13.5px] font-bold text-white shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Assignment Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-[4px] transition-opacity"
            onClick={() => setIsSuccessModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-[420px] rounded-[22px] border border-border bg-surface p-6 shadow-xl text-center animate-in zoom-in-95 duration-200">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-tint text-primary-dark shadow-[0_8px_24px_rgba(22,224,160,0.3)]">
              <Check className="h-7 w-7 stroke-[3]" />
            </span>
            <h3 className="text-[18px] font-extrabold text-ink">
              برنامه با موفقیت تخصیص یافت
            </h3>
            <p className="mt-2 text-[13.5px] text-ink-faint leading-relaxed">
              برنامه‌ی «<span className="text-ink font-bold">{programName}</span>» با موفقیت برای شاگرد «
              <span className="text-ink font-bold">{athlete}</span>» ثبت شد و در فهرست برنامه‌های شاگردان قرار گرفت.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setIsProgramsListModalOpen(true);
                }}
                className="btn btn-outline btn-sm cursor-pointer"
              >
                مشاهده در لیست برنامه‌ها
              </button>
              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className="btn btn-primary btn-sm px-5 cursor-pointer"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Program Preview Sheet Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-3 min-[640px]:p-5">
          <div
            className="fixed inset-0 bg-ink/50 backdrop-blur-[4px] transition-opacity"
            onClick={() => setIsPreviewOpen(false)}
          />
          <div className="relative z-10 flex flex-col w-full max-w-[760px] max-h-[90vh] bg-surface rounded-[22px] border border-border shadow-[0_20px_60px_rgba(15,23,42,0.18)] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface/95 px-6 py-4.5 backdrop-blur-[10px]">
              <div>
                <h3 className="text-[18px] font-extrabold text-ink">
                  پیش‌نمایش برنامه تمرینی
                </h3>
                <div className="text-[12.5px] text-ink-faint mt-0.5">
                  نمای نهایی برنامه جهت چاپ یا تحویل به شاگرد
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn btn-outline btn-sm cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>چاپ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-[10px] text-ink-faint hover:bg-bg hover:text-ink cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
              {/* Info Banner */}
              <div className="bg-bg rounded-[16px] p-5 border border-border flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-[18px] font-extrabold text-ink">
                    {programName || "برنامه تمرینی"}
                  </div>
                  <div className="text-[13px] text-ink-faint mt-1 flex items-center gap-3">
                    <span>شاگرد: <b className="text-ink">{athlete || "—"}</b></span>
                    <span>•</span>
                    <span>هدف: <b className="text-ink">{goal}</b></span>
                    <span>•</span>
                    <span>طول دوره: <b className="text-ink">{toPersianDigits(weeks)} هفته</b></span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="tag text-[12px] font-bold text-primary-dark bg-tint px-3 py-1 rounded-full">
                    سطح: {level}
                  </span>
                  <span className="tag text-[12px] font-bold text-ink-soft bg-surface border border-border px-3 py-1 rounded-full">
                    {toPersianDigits(trainingDays.length)} روز در هفته
                  </span>
                </div>
              </div>

              {/* Day-by-Day Exercises */}
              <div className="flex flex-col gap-4">
                {days.map((d) => (
                  <div
                    key={d.id}
                    className="border border-border rounded-[14px] overflow-hidden"
                  >
                    <div className="bg-bg px-4 py-2.5 border-b border-border flex items-center justify-between font-extrabold text-[14px] text-ink">
                      <span>{d.title}</span>
                      <span className="text-[12px] font-normal text-ink-faint">
                        {toPersianDigits(d.exercises.length)} حرکت
                      </span>
                    </div>
                    {d.exercises.length > 0 ? (
                      <table className="w-full text-[13px] text-ink-soft border-collapse">
                        <thead>
                          <tr className="border-b border-border text-[13px] font-extrabold text-ink-faint">
                            <th className="text-right pt-4 pb-3 px-3">حرکت</th>
                            <th className="text-center pt-4 pb-3 px-3">ست</th>
                            <th className="text-center pt-4 pb-3 px-3">تکرار</th>
                            <th className="text-center pt-4 pb-3 px-3">استراحت</th>
                          </tr>
                        </thead>
                        <tbody>
                          {d.exercises.map((ex, i) => (
                            <tr
                              key={ex.id}
                              className="border-b border-border last:border-b-0 hover:bg-bg/50"
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
                    ) : (
                      <div className="p-4 text-center text-[12.5px] text-ink-faint">
                        حرکتی برای این روز ثبت نشده است.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 z-20 flex items-center justify-end gap-2.5 border-t border-border bg-surface/95 px-6 py-4 backdrop-blur-[10px]">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="btn btn-outline btn-sm cursor-pointer"
              >
                بستن
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPreviewOpen(false);
                  handleAssignToAthlete();
                }}
                className="btn btn-primary btn-sm cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>تخصیص به شاگرد</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Window showing all Coach's programs for each student (Second Requirement) */}
      {isProgramsListModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-3 min-[640px]:p-5">
          <div
            className="fixed inset-0 bg-ink/50 backdrop-blur-[4px] transition-opacity"
            onClick={() => setIsProgramsListModalOpen(false)}
          />
          <div className="relative z-10 flex flex-col w-full max-w-[880px] max-h-[92vh] bg-surface rounded-[24px] border border-border shadow-[0_20px_60px_rgba(15,23,42,0.20)] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface/95 px-6 py-4.5 backdrop-blur-[10px]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-tint text-primary-dark">
                  <FolderKanban className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[19px] font-extrabold text-ink">
                      برنامه‌های تمرینی شاگردان
                    </h3>
                    <span className="badge bg-tint text-primary-dark text-[11.5px] px-2 py-0.5 rounded-full font-bold">
                      {toPersianDigits(studentsPrograms.length)} برنامه
                    </span>
                  </div>
                  <div className="text-[12.5px] text-ink-faint mt-0.5">
                    فهرست کلیه برنامه‌های اختصاص‌یافته به شاگردان شما
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProgramsListModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-[10px] text-ink-faint hover:bg-bg hover:text-ink cursor-pointer transition-colors"
                aria-label="بستن"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="px-6 py-3.5 bg-bg/60 border-b border-border flex flex-wrap items-center justify-between gap-3">
              {/* Status Tabs */}
              <div className="tabs-inline flex gap-1 bg-surface p-1 rounded-[10px] border border-border">
                <button
                  type="button"
                  onClick={() => setProgramsFilter("all")}
                  className={cn(
                    "px-3 py-1.5 text-[12px] font-bold rounded-[7px] transition-all cursor-pointer",
                    programsFilter === "all"
                      ? "bg-ink text-white shadow-sm"
                      : "text-ink-soft hover:text-ink"
                  )}
                >
                  همه شاگردان ({toPersianDigits(studentsPrograms.length)})
                </button>
                <button
                  type="button"
                  onClick={() => setProgramsFilter("active")}
                  className={cn(
                    "px-3 py-1.5 text-[12px] font-bold rounded-[7px] transition-all cursor-pointer",
                    programsFilter === "active"
                      ? "bg-tint text-primary-dark shadow-sm"
                      : "text-ink-soft hover:text-ink"
                  )}
                >
                  فعال
                </button>
                <button
                  type="button"
                  onClick={() => setProgramsFilter("in_progress")}
                  className={cn(
                    "px-3 py-1.5 text-[12px] font-bold rounded-[7px] transition-all cursor-pointer",
                    programsFilter === "in_progress"
                      ? "bg-[#FFFBEB] text-[#B45309] shadow-sm"
                      : "text-ink-soft hover:text-ink"
                  )}
                >
                  رو به اتمام
                </button>
                <button
                  type="button"
                  onClick={() => setProgramsFilter("expired")}
                  className={cn(
                    "px-3 py-1.5 text-[12px] font-bold rounded-[7px] transition-all cursor-pointer",
                    programsFilter === "expired"
                      ? "bg-[#FFF1F2] text-[#E11D48] shadow-sm"
                      : "text-ink-soft hover:text-ink"
                  )}
                >
                  منقضی
                </button>
              </div>

              {/* Search Box */}
              <div className="relative min-w-[220px] flex-1 max-w-[340px]">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
                <input
                  type="text"
                  value={programsSearch}
                  onChange={(e) => setProgramsSearch(e.target.value)}
                  placeholder="جستجوی شاگرد یا برنامه…"
                  className="w-full rounded-[10px] border border-border bg-surface pr-9 pl-8 py-2 text-[12.5px] text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
                />
                {programsSearch && (
                  <button
                    type="button"
                    onClick={() => setProgramsSearch("")}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink text-[12px]"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body: Program Cards */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {filteredStudentsPrograms.length > 0 ? (
                filteredStudentsPrograms.map((record) => {
                  const isExpanded = expandedProgramId === record.id;
                  return (
                    <div
                      key={record.id}
                      className="card bg-surface border border-border rounded-[18px] p-5 shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.06)] transition-all duration-200"
                    >
                      {/* Top Header of the Card */}
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3.5">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-11 h-11 rounded-[13px] flex items-center justify-center text-white font-extrabold text-[15px] shrink-0 shadow-sm"
                            style={{ background: record.studentAvatarColor }}
                          >
                            {record.studentName.slice(0, 2)}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-[16px] font-extrabold text-ink">
                                {record.studentName}
                              </h4>
                              <span
                                className={cn(
                                  "status text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5",
                                  record.status === "active" &&
                                  "bg-tint text-primary-dark",
                                  record.status === "in_progress" &&
                                  "bg-[#FFFBEB] text-[#B45309]",
                                  record.status === "expired" &&
                                  "bg-[#FFF1F2] text-[#E11D48]"
                                )}
                              >
                                <span
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    record.status === "active" && "bg-primary",
                                    record.status === "in_progress" && "bg-[#F59E0B]",
                                    record.status === "expired" && "bg-[#E11D48]"
                                  )}
                                />
                                {record.statusLabel}
                              </span>
                            </div>
                            <div className="text-[13.5px] font-bold text-ink-soft mt-1">
                              {record.programTitle}
                            </div>
                          </div>
                        </div>

                        {/* Top Right Badges */}
                        <div className="flex items-center gap-2">
                          <span className="tag text-[11.5px] font-bold text-primary-dark bg-tint px-2.5 py-1 rounded-full">
                            {record.goal}
                          </span>
                          <span className="text-[12px] font-semibold text-ink-faint">
                            سطح {record.level}
                          </span>
                        </div>
                      </div>

                      {/* Meta Information Grid */}
                      <div className="grid grid-cols-2 min-[640px]:grid-cols-4 gap-2.5 py-3 px-3.5 bg-bg/70 rounded-[12px] border border-border/80 text-[12px]">
                        <div>
                          <span className="text-ink-faint block mb-0.5">طول دوره:</span>
                          <span className="font-extrabold text-ink">
                            {toPersianDigits(record.durationWeeks)} هفته
                          </span>
                        </div>
                        <div>
                          <span className="text-ink-faint block mb-0.5">روزهای تمرین:</span>
                          <span className="font-extrabold text-ink">
                            {toPersianDigits(record.trainingDays.length)} روز در هفته
                          </span>
                        </div>
                        <div>
                          <span className="text-ink-faint block mb-0.5">تعداد حرکات:</span>
                          <span className="font-extrabold text-ink">
                            {toPersianDigits(record.totalExercises)} حرکت
                          </span>
                        </div>
                        <div>
                          <span className="text-ink-faint block mb-0.5">تاریخ ثبت:</span>
                          <span className="font-extrabold text-ink">
                            {record.assignedDate}
                          </span>
                        </div>
                      </div>

                      {/* Training days pills */}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11.5px] text-ink-faint ml-1">
                          روزها:
                        </span>
                        {record.trainingDays.map((d) => (
                          <span
                            key={d}
                            className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface border border-border text-ink-soft"
                          >
                            {d}
                          </span>
                        ))}
                      </div>

                      {/* Expandable Exercise Details Accordion */}
                      {isExpanded && record.daysWorkout && (
                        <div className="mt-4 pt-3.5 border-t border-border flex flex-col gap-3 animate-in fade-in duration-200">
                          <div className="text-[12.5px] font-extrabold text-ink flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5 text-primary-dark" />
                            <span>ریز حرکات برنامه‌ی تمرینی:</span>
                          </div>
                          <div className="grid grid-cols-1 min-[640px]:grid-cols-2 gap-2.5">
                            {record.daysWorkout.map((dw) => (
                              <div
                                key={dw.id}
                                className="bg-bg/60 rounded-[11px] p-3 border border-border"
                              >
                                <div className="text-[12.5px] font-bold text-ink mb-2 border-b border-border pb-1 flex justify-between">
                                  <span>{dw.title}</span>
                                  <span className="text-[11px] text-ink-faint">
                                    {toPersianDigits(dw.exercises.length)} حرکت
                                  </span>
                                </div>
                                <ul className="flex flex-col gap-1.5 text-[11.5px] text-ink-soft">
                                  {dw.exercises.map((ex, exIdx) => (
                                    <li
                                      key={ex.id}
                                      className="flex items-center justify-between"
                                    >
                                      <span>
                                        {toPersianDigits(exIdx + 1)}. {ex.exercise}
                                      </span>
                                      <span className="text-ink-faint font-semibold">
                                        {toPersianDigits(ex.sets)}×{toPersianDigits(ex.reps)}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bottom Actions for each Program */}
                      <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2.5">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedProgramId(isExpanded ? null : record.id)
                          }
                          className="text-[12px] font-bold text-ink-soft hover:text-primary-dark flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              <span>بستن ریز حرکات</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              <span>مشاهده ریز حرکات ({toPersianDigits(record.totalExercises)})</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleLoadProgramToBuilder(record)}
                            className="btn btn-outline btn-sm text-[12px] py-1.5 px-3 flex items-center gap-1.5 cursor-pointer hover:border-primary hover:bg-tint"
                            title="انتقال این برنامه به صفحه‌ی برنامه‌ساز جهت ویرایش"
                          >
                            <RotateCcw className="h-3.5 w-3.5 text-primary-dark" />
                            <span>بارگذاری در برنامه‌ساز</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-ink-faint text-[14px]">
                  برنامه‌ای با این فیلتر یا نام شاگرد یافت نشد.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 z-20 flex items-center justify-between border-t border-border bg-surface/95 px-6 py-4 backdrop-blur-[10px]">
              <div className="text-[12.5px] text-ink-faint">
                نمایش {toPersianDigits(filteredStudentsPrograms.length)} از{" "}
                {toPersianDigits(studentsPrograms.length)} برنامه برای شاگردان
              </div>
              <button
                type="button"
                onClick={() => setIsProgramsListModalOpen(false)}
                className="btn btn-primary btn-sm px-6 cursor-pointer"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
