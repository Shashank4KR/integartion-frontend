import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const backendUrl = process.env.BACKEND_API_URL;

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

    const headers: Record<string, string> = {};
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const response = await fetch(`${backendUrl}/alumni${query}`, {
      method: "GET",
      headers,
    });

    if (response.status === 404) {
      return NextResponse.json([]);
    }

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
      request.headers.get("content-type") || "application/json";
    const authHeader = request.headers.get("authorization");

    const headers: Record<string, string> = {
      "Content-Type": contentType,
    };
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const response = await fetch(`${backendUrl}/alumni`, {
      method: "POST",
      headers,
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