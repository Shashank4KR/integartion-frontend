import { NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await params;
    const authHeader = request.headers.get("authorization");
    const url = new URL(request.url);
    const query = url.search;

    const fullPath = path.join("/");
    const headers = new Headers();
    if (authHeader) {
      headers.set("Authorization", authHeader);
    }

    const response = await fetch(`${backendUrl}/dashboard/${fullPath}${query}`, {
      method: "GET",
      headers,
    });

    const body = await response.text();
    return new NextResponse(body || null, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (err) {
    console.error("Dashboard proxy error:", err);
    return NextResponse.json(
      { detail: "Backend is unreachable." },
      { status: 502 },
    );
  }
}
