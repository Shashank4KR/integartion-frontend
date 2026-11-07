import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
const MAX_NOTE_REQUEST_SIZE = 11 * 1024 * 1024;

async function handleProxy(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
  method: string,
) {
  const reqId = request.headers.get("x-request-id") || "";

  if (!backendUrl) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          message: "Server configuration error: BACKEND_API_URL is not set.",
          code: 500,
          details: [],
        },
        detail: "Server configuration error: BACKEND_API_URL is not set.",
        meta: {
          timestamp: new Date().toISOString(),
          requestId: reqId,
        },
      },
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
    if (reqId) {
      headers.set("X-Request-ID", reqId);
    }

    const idempotencyKey =
      request.headers.get("idempotency-key") ||
      request.headers.get("x-idempotency-key");
    if (idempotencyKey) {
      headers.set("Idempotency-Key", idempotencyKey);
    }

    const contentType = request.headers.get("content-type");
    if (contentType) {
      headers.set("Content-Type", contentType);
    }

    let body: any = undefined;
    if (method !== "GET" && method !== "DELETE" && method !== "HEAD") {
      if (method === "POST" && fullPath === "chapter-notes/upload") {
        const contentLength = request.headers.get("content-length");
        if (contentLength && (!/^\d+$/.test(contentLength) || Number(contentLength) > MAX_NOTE_REQUEST_SIZE)) {
          return NextResponse.json(
            {
              success: false,
              data: null,
              error: {
                message: "Upload request exceeds the 11 MB limit",
                code: 413,
                details: [],
              },
              detail: "Upload request exceeds the 11 MB limit",
              meta: {
                timestamp: new Date().toISOString(),
                requestId: reqId,
              },
            },
            { status: 413 },
          );
        }
        body = request.body;
      } else {
        body = await request.arrayBuffer();
      }
    }

    // Route to versioned /api/v1 backend endpoints
    const targetPath = fullPath.startsWith("api/v1/")
      ? fullPath
      : fullPath.startsWith("v1/")
        ? `api/${fullPath}`
        : fullPath === "health" || fullPath === "ready"
          ? fullPath
          : `api/v1/${fullPath}`;
    const baseUrl = backendUrl.replace(/\/+$/, "");
    let response: Response;
    for (let attempt = 0; ; attempt += 1) {
      try {
        const fetchOptions: RequestInit & { duplex?: "half" } = {
          method,
          headers,
          body,
          cache: "no-store",
        };
        if (method === "POST" && fullPath === "chapter-notes/upload" && body) {
          fetchOptions.duplex = "half";
        }
        response = await fetch(`${baseUrl}/${targetPath}${query}`, fetchOptions);
        break;
      } catch (error) {
        // Retry only idempotent reads after a brief backend restart/network
        // hiccup; never replay writes that may have reached the server.
        if (method !== "GET" || attempt >= 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }

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

    const safeHeaders = new Headers({ "Content-Type": backendContentType });
    for (const headerName of [
      "content-disposition",
      "x-content-type-options",
      "content-security-policy",
      "cache-control",
      "x-request-id",
      "x-cache",
      "idempotent-replayed",
    ]) {
      const value = response.headers.get(headerName);
      if (value) safeHeaders.set(headerName, value);
    }

    return new NextResponse(responseBody || null, {
      status: response.status,
      headers: safeHeaders,
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          message: "Backend is unreachable. Please try again later.",
          code: 502,
          details: [],
        },
        detail: "Backend is unreachable. Please try again later.",
        meta: {
          timestamp: new Date().toISOString(),
          requestId: reqId,
        },
      },
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
