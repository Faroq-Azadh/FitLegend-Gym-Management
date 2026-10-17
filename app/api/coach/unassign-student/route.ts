import { NextResponse } from "next/server";

const TARGET_BACKEND = (
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://ashkandev.ir"
).replace(/\/+$/, "");

// Owner credentials for updating member properties in Django backend
const OWNER_EMAIL = process.env.GYM_OWNER_EMAIL || "faroghazadeh2019@gmail.com";
const OWNER_PASSWORD = process.env.GYM_OWNER_PASSWORD || "Aa@123456";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const studentId = body?.studentId;

    if (!studentId || typeof studentId !== "string") {
      return NextResponse.json(
        { detail: "شناسه شاگرد نامعتبر است." },
        { status: 400 }
      );
    }

    // 1. Log in as owner to obtain token with permission to edit members
    const loginRes = await fetch(`${TARGET_BACKEND}/users/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: OWNER_EMAIL,
        password: OWNER_PASSWORD,
      }),
    });

    if (!loginRes.ok) {
      console.error("Failed to authenticate as owner for student unassignment:", loginRes.status);
      return NextResponse.json(
        { detail: "خطا در احراز هویت برای لغو تخصیص شاگرد." },
        { status: 502 }
      );
    }

    const loginData = await loginRes.json();
    const token = loginData.access;

    // 2. Send PATCH to Django /members/{studentId}/ with assigned_coach: null
    const patchRes = await fetch(`${TARGET_BACKEND}/members/${studentId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        assigned_coach: null,
      }),
    });

    if (!patchRes.ok) {
      const errData = await patchRes.json().catch(() => ({}));
      console.error("Failed to unassign coach in Django:", patchRes.status, errData);
      return NextResponse.json(
        { detail: errData.detail || "خطا در به‌روزرسانی مربی در پنل جنگو." },
        { status: patchRes.status }
      );
    }

    const updatedMember = await patchRes.json();
    return NextResponse.json({
      success: true,
      message: "مربی شاگرد با موفقیت در پنل جنگو به حالت بدون مربی تغییر یافت.",
      member: updatedMember,
    });
  } catch (error: any) {
    console.error("Unexpected error in unassign-student route:", error);
    return NextResponse.json(
      { detail: error.message || "خطای ناشناخته سرور رخ داد." },
      { status: 500 }
    );
  }
}
