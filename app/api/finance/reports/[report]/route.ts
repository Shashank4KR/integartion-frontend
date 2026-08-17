import { NextResponse } from "next/server";

const ALLOWED_REPORTS = new Set([
  "daily-collection",
  "monthly-collection",
  "yearly-collection",
  "outstanding-fees",
  "student-ledger",
  "income-report",
  "expense-report",
  "profit-loss",
  "payment-mode",
  "class-wise-collection",
  "section-wise-collection",
  "transport-fee",
  "hostel-fee",
  "library-fine",
]);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ report: string }> },
) {
  const backendUrl = process.env.BACKEND_API_URL;

  if (!backendUrl) {
    return NextResponse.json(
      { detail: "Server configuration error: BACKEND_API_URL is not set." },
      { status: 500 },
    );
  }

  const { report } = await params;
  if (!ALLOWED_REPORTS.has(report)) {
    return NextResponse.json({ detail: "Unknown finance report." }, { status: 404 });
  }

  try {
    const authHeader = request.headers.get("authorization");
    const url = new URL(request.url);
    const query = url.search;

    const response = await fetch(`${backendUrl}/finance/reports/${report}${query}`, {
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
