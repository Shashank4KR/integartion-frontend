import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin || request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ detail: "Cross-site login request rejected." }, { status: 403 });
  }

  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    return NextResponse.json({ detail: "Authentication service is not configured." }, { status: 500 });
  }

  try {
    const body = await request.text();
    const loginResponse = await fetch(`${backendUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...(request.headers.get("x-mfa-code") ? { "X-MFA-Code": request.headers.get("x-mfa-code")! } : {}),
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const loginData = (await loginResponse.json().catch(() => ({}))) as { access_token?: string };
    if (!loginResponse.ok || !loginData.access_token) {
      return NextResponse.json({ detail: "Invalid email or password." }, { status: loginResponse.status || 401 });
    }

    const profileResponse = await fetch(`${backendUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${loginData.access_token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const profile = (await profileResponse.json().catch(() => ({}))) as {
      role?: { role_name?: string } | null;
      role_name?: string;
    };
    const roleName = (profile.role?.role_name || profile.role_name || "").toUpperCase();
    if (!profileResponse.ok || !["SUPER_ADMIN", "SUPERADMIN"].includes(roleName)) {
      return NextResponse.json({ detail: "This account is not authorized for the superadmin console." }, { status: 403 });
    }

    const response = NextResponse.json({ authenticated: true });
    response.cookies.set("nomera_access_token", loginData.access_token, {
      httpOnly: true,
      secure: new URL(request.url).protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });
    response.cookies.set("nomera_user_role", roleName, {
      httpOnly: true,
      secure: new URL(request.url).protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });
    return response;
  } catch {
    return NextResponse.json({ detail: "Authentication service is unavailable." }, { status: 502 });
  }
}
