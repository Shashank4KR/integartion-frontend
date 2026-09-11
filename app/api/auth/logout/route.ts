import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    return NextResponse.json({ message: "Logged out locally" }, { status: 200 });
  }

  try {
    const authHeader = request.headers.get("authorization") || "";
    const response = await fetch(`${backendUrl}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json({ message: "Logged out" }, { status: 200 });
  }
}
