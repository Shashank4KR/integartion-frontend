import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function handleLogout(request: Request) {
  const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
  try {
    const authHeader = request.headers.get("authorization") || "";
    const response = await fetch(`${backendUrl}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json({ message: "Logged out" }, { status: 200 });
  }
}

export async function POST(request: Request) {
  return handleLogout(request);
}

export async function GET(request: Request) {
  return handleLogout(request);
}

