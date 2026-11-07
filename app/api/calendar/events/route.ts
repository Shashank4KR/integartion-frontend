import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";

  if (!backendUrl) {
    return NextResponse.json(
      { detail: "Server configuration error: BACKEND_API_URL is not set." },
      { status: 500 },
    );
  }

  try {
    const authHeader = request.headers.get("authorization");
    const url = new URL(request.url);
    const query = url.search;
    const baseUrl = backendUrl.replace(/\/+$/, "");

    const response = await fetch(`${baseUrl}/api/v1/events${query}`, {
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

export async function POST(request: Request) {
  const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";

  if (!backendUrl) {
    return NextResponse.json(
      { detail: "Server configuration error: BACKEND_API_URL is not set." },
      { status: 500 },
    );
  }

  try {
    const body = await request.text();
    const contentType =
      request.headers.get("content-type") || "application/json";
    const authHeader = request.headers.get("authorization");
    const baseUrl = backendUrl.replace(/\/+$/, "");

    const response = await fetch(`${baseUrl}/api/v1/events`, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body,
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
