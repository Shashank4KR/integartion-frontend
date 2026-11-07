import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
  try {
    const { id } = await params;
    let authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader.includes("cookie-session")) {
      const cookieStore = await cookies();
      const token = cookieStore.get("nomera_access_token")?.value;
      if (token) {
        authHeader = `Bearer ${token}`;
      }
    }
    const baseUrl = backendUrl.replace(/\/+$/, "");

    const response = await fetch(
      `${baseUrl}/api/v1/events/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
      },
    );

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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
  try {
    const { id } = await params;
    const body = await request.text();
    const contentType =
      request.headers.get("content-type") || "application/json";
    let authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader.includes("cookie-session")) {
      const cookieStore = await cookies();
      const token = cookieStore.get("nomera_access_token")?.value;
      if (token) {
        authHeader = `Bearer ${token}`;
      }
    }
    const baseUrl = backendUrl.replace(/\/+$/, "");

    const response = await fetch(
      `${baseUrl}/api/v1/events/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body,
      },
    );

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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
  try {
    const { id } = await params;
    let authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader.includes("cookie-session")) {
      const cookieStore = await cookies();
      const token = cookieStore.get("nomera_access_token")?.value;
      if (token) {
        authHeader = `Bearer ${token}`;
      }
    }
    const baseUrl = backendUrl.replace(/\/+$/, "");

    const response = await fetch(
      `${baseUrl}/api/v1/events/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
      },
    );

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
