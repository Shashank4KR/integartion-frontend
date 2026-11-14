import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
  try {
    const response = await fetch(`${backendUrl}/auth/reset-password`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: await request.text(), cache: "no-store",
    });
    return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": response.headers.get("content-type") || "application/json" } });
  } catch {
    return NextResponse.json({ detail: "Password reset service is unavailable. Please try again." }, { status: 502 });
  }
}
