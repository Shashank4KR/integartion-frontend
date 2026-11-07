import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
  try {
    let authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader.includes("cookie-session")) {
      const cookieStore = await cookies();
      const token = cookieStore.get("nomera_access_token")?.value;
      if (token) {
        authHeader = `Bearer ${token}`;
      }
    }
    const baseUrl = backendUrl.replace(/\/+$/, "");

    const response = await fetch(`${baseUrl}/api/v1/events/upcoming`, {
      method: "GET",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
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
