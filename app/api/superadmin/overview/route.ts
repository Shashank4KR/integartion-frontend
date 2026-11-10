import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const backendUrl = process.env.BACKEND_API_URL;
  const authorization = request.headers.get("authorization");
  if (!backendUrl || !authorization) {
    return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
  }

  try {
    const response = await fetch(`${backendUrl}/superadmin/overview`, {
      headers: { Authorization: authorization },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ detail: "Platform data service is unavailable." }, { status: 502 });
  }
}
