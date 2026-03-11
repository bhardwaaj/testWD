import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createAdminSessionToken,
  getAdminCookieName,
  validateAdminCredentials,
} from "@/lib/adminAuth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "");
  const password = String(body?.password ?? "");

  if (!validateAdminCredentials(email, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = createAdminSessionToken();
  const cookieName = getAdminCookieName();

  const cookieStore = await cookies();
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return NextResponse.json({ ok: true });
}

