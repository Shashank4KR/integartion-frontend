import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";

  try {
    const cookieToken = request.headers.get("cookie")?.match(/(?:^|;\s*)nomera_access_token=([^;]+)/)?.[1];
    const suppliedAuth = request.headers.get("authorization");
    const authHeader = suppliedAuth && suppliedAuth !== "Bearer cookie-session"
      ? suppliedAuth
      : (cookieToken ? `Bearer ${decodeURIComponent(cookieToken)}` : suppliedAuth);
    const body = await request.text();
    const contentType =
      request.headers.get("content-type") || "application/json";

    const response = await fetch(`${backendUrl}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body,
      cache: "no-store",
    });

    const responseBody = await response.text();

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { detail: "Backend is unreachable. Please try again later." },
      { status: 502 },
    );
  }
}
