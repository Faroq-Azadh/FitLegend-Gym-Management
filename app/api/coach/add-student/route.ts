import { NextResponse } from "next/server";

const TARGET_BACKEND = (
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://ashkandev.ir"
).replace(/\/+$/, "");

// Owner credentials for updating member properties in Django backend
const OWNER_EMAIL = process.env.GYM_OWNER_EMAIL || "faroghazadeh2019@gmail.com";
const OWNER_PASSWORD = process.env.GYM_OWNER_PASSWORD || "Aa@123456";

// Default coach ID if not supplied
const DEFAULT_COACH_ID = "6bc9512f-8860-4d30-b724-7137f19eba75";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      first_name,
      lastName,
      last_name,
      phone,
      phone_number,
      email,
      gender,
      goal,
      level,
      notes,
      coach_notes,
      instantActive,
      is_active,
      coachId,
      coach_id,
      startDate,
      start_date,
    } = body || {};

    const resolvedFirstName = (firstName || first_name || "").trim();
    const resolvedLastName = (lastName || last_name || "").trim();
    const resolvedPhone = (phone || phone_number || "").trim();
    const resolvedNotes = (notes || coach_notes || "").trim();
    const resolvedActive =
      instantActive !== undefined
        ? instantActive
        : is_active !== undefined
        ? is_active
        : true;
    const todayIso =
      startDate || start_date || new Date().toISOString().slice(0, 10);

    if (!resolvedFirstName || !resolvedLastName || !resolvedPhone) {
      return NextResponse.json(
        { detail: "نام، نام خانوادگی و شماره تماس الزامی هستند." },
        { status: 400 }
      );
    }

    // Determine targetCoachId: from body, or from coach token via /coaches/me/, or fallback to default
    let targetCoachId = coachId || coach_id;
    if (!targetCoachId) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader) {
        try {
          const meRes = await fetch(`${TARGET_BACKEND}/coaches/me/`, {
            headers: { Authorization: authHeader },
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            if (meData?.id) {
              targetCoachId = meData.id;
            }
          }
        } catch (e) {
          console.warn("Could not fetch /coaches/me/ with coach token:", e);
        }
      }
    }
    if (!targetCoachId) {
      targetCoachId = DEFAULT_COACH_ID;
    }

    // 1. Log in as owner to obtain management token
    const loginRes = await fetch(`${TARGET_BACKEND}/users/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: OWNER_EMAIL,
        password: OWNER_PASSWORD,
      }),
    });

    if (!loginRes.ok) {
      console.error("Failed to authenticate as owner for student creation:", loginRes.status);
      return NextResponse.json(
        { detail: "خطا در احراز هویت برای ایجاد شاگرد." },
        { status: 502 }
      );
    }

    const loginData = await loginRes.json();
    const token = loginData.access;
    const genderMapped = gender === "زن" || gender === "FEMALE" ? "FEMALE" : "MALE";
    const levelMapped =
      level === "مبتدی" || level === "BEGINNER"
        ? "BEGINNER"
        : level === "پیشرفته" || level === "ADVANCED"
        ? "ADVANCED"
        : "INTERMEDIATE";

    // 2. Create member via POST /members/
    const createRes = await fetch(`${TARGET_BACKEND}/members/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        first_name: resolvedFirstName,
        last_name: resolvedLastName,
        phone_number: resolvedPhone,
        email: email?.trim() || "",
        gender: genderMapped,
        goal: goal?.trim() || "",
        level: levelMapped,
        coach_notes: resolvedNotes,
        start_date: todayIso,
        is_active: resolvedActive,
      }),
    });

    if (!createRes.ok) {
      const errData = await createRes.json().catch(() => ({}));
      console.error("Failed to create member in Django:", createRes.status, errData);
      return NextResponse.json(
        { detail: errData.detail || "خطا در ایجاد شاگرد در پنل جنگو." },
        { status: createRes.status }
      );
    }

    const createdData = await createRes.json();
    const member = createdData.member || createdData;
    const memberId = member.id;

    // 3. Ensure assigned_coach is set in Django via PATCH /members/{id}/
    if (memberId && targetCoachId) {
      const patchRes = await fetch(`${TARGET_BACKEND}/members/${memberId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assigned_coach: targetCoachId,
        }),
      });

      if (patchRes.ok) {
        const updatedMember = await patchRes.json();
        return NextResponse.json({
          success: true,
          message: "شاگرد با موفقیت در پنل جنگو ثبت و به مربی اختصاص یافت.",
          member: updatedMember,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "شاگرد با موفقیت ثبت شد.",
      member,
    });
  } catch (error: any) {
    console.error("Unexpected error in add-student route:", error);
    return NextResponse.json(
      { detail: error.message || "خطای ناشناخته سرور رخ داد." },
      { status: 500 }
    );
  }
}
