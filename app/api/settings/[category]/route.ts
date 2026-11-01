import { NextResponse } from "next/server";

const SETTINGS_CATEGORIES = new Set([
  "security",
  "notifications",
  "appearance",
  "organization",
  "academics",
  "attendance",
  "examination",
  "library",
  "hostel",
  "transport",
  "finance",
  "communication",
  "roles",
  "reports",
  "integrations",
  "system",
]);

type RouteContext = { params: Promise<{ category: string }> };

async function forwardCategoryRequest(request: Request, context: RouteContext, method: "GET" | "PUT") {
  const { category } = await context.params;
  if (!SETTINGS_CATEGORIES.has(category)) {
    return NextResponse.json({ detail: "Unknown settings category." }, { status: 404 });
  }

  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    return NextResponse.json(
      { detail: "Server configuration error: BACKEND_API_URL is not set." },
      { status: 500 },
    );
  }

  try {
    const authHeader = request.headers.get("authorization");
    const contentType = request.headers.get("content-type") || "application/json";
    const response = await fetch(`${backendUrl}/settings/${category}`, {
      method,
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(method === "PUT" ? { "Content-Type": contentType } : {}),
      },
      ...(method === "PUT" ? { body: await request.text() } : {}),
    });
    const responseBody = await response.text();
    return new NextResponse(responseBody, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") || "application/json" },
    });
  } catch {
    return NextResponse.json(
      { detail: "Backend is unreachable. Please try again later." },
      { status: 502 },
    );
  }
}

export function GET(request: Request, context: RouteContext) {
  return forwardCategoryRequest(request, context, "GET");
}

export function PUT(request: Request, context: RouteContext) {
  return forwardCategoryRequest(request, context, "PUT");
}
