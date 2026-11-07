import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ segments: string[] }> };

async function proxyRequest(request: Request, context: RouteContext) {
  const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";

  try {
    const { segments } = await context.params;
    const path = segments.map((segment) => encodeURIComponent(segment)).join("/");
    const incomingUrl = new URL(request.url);
    const authHeader = request.headers.get("authorization");
    const contentType = request.headers.get("content-type");
    const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.text();

    const targetPath = path.startsWith("api/v1/")
      ? path
      : path.startsWith("v1/")
        ? `api/${path}`
        : `api/v1/marks-converter/${path}`;

    const response = await fetch(`${backendUrl.replace(/\/$/, "")}/${targetPath}${incomingUrl.search}`, {
      method: request.method,
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(contentType ? { "Content-Type": contentType } : {}),
      },
      body,
      signal: AbortSignal.timeout(15_000),
    });
    const responseBody = await response.text();
    return new Response(responseBody || null, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") || "application/json" },
    });
  } catch {
    return NextResponse.json({ detail: "Backend is unreachable. Please try again later." }, { status: 502 });
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
