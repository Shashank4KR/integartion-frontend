import { NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";

async function handleProxy(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
  method: string,
) {
  if (!backendUrl) {
    return NextResponse.json(
      { detail: "Server configuration error: BACKEND_API_URL is not set." },
      { status: 500 },
    );
  }

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

    const contentType = request.headers.get("content-type");
    if (contentType) {
      headers.set("Content-Type", contentType);
    }

    let body: any = undefined;
    if (method !== "GET" && method !== "DELETE" && method !== "HEAD") {
      body = await request.arrayBuffer();
    }


    const response = await fetch(`${backendUrl}/${fullPath}${query}`, {
      method,
      headers,
      body,
    });

    const backendContentType = response.headers.get("content-type") || "application/octet-stream";

    // Binary files (PDF, images, Office docs, etc.) must be streamed as raw bytes.
    // Using response.text() on binary data corrupts it by mis-decoding bytes as UTF-8.
    const isBinary =
      backendContentType.startsWith("application/pdf") ||
      backendContentType.startsWith("image/") ||
      backendContentType.startsWith("video/") ||
      backendContentType.startsWith("audio/") ||
      backendContentType.includes("octet-stream") ||
      backendContentType.includes("vnd.openxmlformats") ||  // .docx / .xlsx / .pptx
      backendContentType.includes("msword") ||
      backendContentType.includes("vnd.ms-");

    const responseBody = isBinary
      ? await response.arrayBuffer()   // keep raw bytes intact
      : await response.text();         // safe for JSON / plain text

    return new NextResponse(responseBody || null, {
      status: response.status,
      headers: {
        "Content-Type": backendContentType,
      },
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json(
      { detail: "Backend is unreachable. Please try again later." },
      { status: 502 },
    );
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  return handleProxy(request, context, "GET");
}

export async function POST(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  return handleProxy(request, context, "POST");
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  return handleProxy(request, context, "PUT");
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  return handleProxy(request, context, "DELETE");
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  return handleProxy(request, context, "PATCH");
}
