import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    return NextResponse.json({ detail: "Server configuration error: BACKEND_API_URL is not set." }, { status: 500 });
  }
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");
    const response = await fetch(`${backendUrl}/teachers/${id}/performance`, {
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