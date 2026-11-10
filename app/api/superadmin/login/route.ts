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
    const loginData = (await loginResponse.json().catch(() => ({}))) as {
      access_token?: string;
      detail?: string;
      message?: string;
    };
    if (!loginResponse.ok) {
      const backendDetail = loginData.detail || loginData.message || "";
      let detail = "Sign-in failed. Check the account status and try again.";
      if (backendDetail === "Incorrect email or password") {
        detail = "Invalid email or password. The old demo account was never provisioned in the backend; use an active account assigned the SUPER_ADMIN role.";
      } else if (backendDetail.toLowerCase().includes("mfa code required")) {
        detail = "This account requires an authenticator code. Enter the current 6-digit code and try again.";
      } else if (backendDetail === "Invalid MFA code") {
        detail = "The authenticator code is invalid or expired.";
      } else if (loginResponse.status === 423) {
        detail = "This account is temporarily locked after failed sign-in attempts. Try again later.";
      } else if (backendDetail === "Inactive user") {
        detail = "This account is inactive. Contact your platform administrator.";
      }
      return NextResponse.json({ detail }, { status: loginResponse.status || 401 });
    }
    if (!loginData.access_token) {
      return NextResponse.json({ detail: "Authentication service returned an incomplete response." }, { status: 502 });
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
