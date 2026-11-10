import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const backendUrl = process.env.BACKEND_API_URL;
  const authorization = request.headers.get("authorization");
  if (!backendUrl || !authorization) {
    return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
  }

  try {
    const response = await fetch(`${backendUrl}/auth/me`, {
      headers: { Authorization: authorization },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const data = (await response.json().catch(() => ({}))) as {
      role?: { role_name?: string } | null;
      role_name?: string;
    };
    const roleName = (data.role?.role_name || data.role_name || "").toUpperCase();
    if (!response.ok || !["SUPER_ADMIN", "SUPERADMIN"].includes(roleName)) {
      const denied = NextResponse.json({ detail: "Superadmin access required." }, { status: 403 });
      denied.cookies.set("nomera_access_token", "", { httpOnly: true, secure: new URL(request.url).protocol === "https:", sameSite: "lax", path: "/", maxAge: 0 });
      denied.cookies.set("nomera_user_role", "", { httpOnly: true, secure: new URL(request.url).protocol === "https:", sameSite: "lax", path: "/", maxAge: 0 });
      return denied;
    }
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ detail: "Authentication service is unavailable." }, { status: 502 });
  }
}
