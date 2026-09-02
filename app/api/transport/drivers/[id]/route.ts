import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const backendUrl = process.env.BACKEND_API_URL;

  if (!backendUrl) {
    return NextResponse.json(
      { detail: "Server configuration error: BACKEND_API_URL is not set." },
      { status: 500 },
    );
  }

  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");

    const response = await fetch(
      `${backendUrl}/transport/drivers/${encodeURIComponent(id)}`,
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
  const backendUrl = process.env.BACKEND_API_URL;

  if (!backendUrl) {
    return NextResponse.json(
      { detail: "Server configuration error: BACKEND_API_URL is not set." },
      { status: 500 },
    );
  }

  try {
    const { id } = await params;
    const body = await request.text();
    const contentType =
      request.headers.get("content-type") || "application/json";
    const authHeader = request.headers.get("authorization");

    const response = await fetch(
      `${backendUrl}/transport/drivers/${encodeURIComponent(id)}`,
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
  const backendUrl = process.env.BACKEND_API_URL;

  if (!backendUrl) {
    return NextResponse.json(
      { detail: "Server configuration error: BACKEND_API_URL is not set." },
      { status: 500 },
    );
  }

  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");

    const response = await fetch(
      `${backendUrl}/transport/drivers/${encodeURIComponent(id)}`,
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
