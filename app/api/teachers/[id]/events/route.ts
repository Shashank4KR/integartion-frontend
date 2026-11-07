import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
  if (!backendUrl) {
    return NextResponse.json({ detail: "Server configuration error: BACKEND_API_URL is not set." }, { status: 500 });
  }
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");
    const baseUrl = backendUrl.replace(/\/+$/, "");
    const response = await fetch(`${baseUrl}/api/v1/teachers/${id}/events`, {
      headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
    });
    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") || "application/json" },
    });
  } catch {
    return NextResponse.json({ detail: "Backend is unreachable." }, { status: 502 });
  }
}
