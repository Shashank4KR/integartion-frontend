import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const backendUrl = process.env.BACKEND_API_URL;

  if (!backendUrl) {
    return NextResponse.json(
      { detail: "Server configuration error: BACKEND_API_URL is not set." },
      { status: 500 },
    );
  }

  try {
    const body = await request.text();
    const contentType =
      request.headers.get("content-type") || "application/x-www-form-urlencoded";

    const response = await fetch(`${backendUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
      },
      body,
    });

    const responseBody = await response.json();
    const accessToken = typeof responseBody.access_token === "string" ? responseBody.access_token : null;
    if (!response.ok || !accessToken) {
      return NextResponse.json(responseBody, { status: response.status });
    }

    const { access_token: _accessToken, ...publicBody } = responseBody;
    const nextResponse = NextResponse.json(publicBody, { status: response.status });
    nextResponse.cookies.set("edtech_access_token", accessToken, {
      httpOnly: true,
      secure: new URL(request.url).protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });
    return nextResponse;
  } catch {
    return NextResponse.json(
      { detail: "Backend is unreachable. Please try again later." },
      { status: 502 },
    );
  }
}
