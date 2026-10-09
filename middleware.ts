import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_DASHBOARDS: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
  PARENT: "/dashboard/parent",
  ACCOUNTANT: "/dashboard/accountant",
  LIBRARIAN: "/dashboard/librarian",
};

function hasUnexpiredToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const payload = token.split(".")[1];
    if (!payload) return false;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(normalized)) as { exp?: unknown };
    return typeof claims.exp === "number" && claims.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function clearSessionCookies(response: NextResponse): NextResponse {
  response.cookies.set("edtech_access_token", "", { path: "/", maxAge: 0 });
  response.cookies.set("edtech_user_role", "", { path: "/", maxAge: 0 });
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("edtech_access_token")?.value;

  if (pathname.startsWith("/api/")) {
    const isUnsafeMethod = !["GET", "HEAD", "OPTIONS"].includes(request.method);
    const origin = request.headers.get("origin");
    const fetchSite = request.headers.get("sec-fetch-site");
    if (token && isUnsafeMethod && ((origin && origin !== request.nextUrl.origin) || fetchSite === "cross-site")) {
      return NextResponse.json({ detail: "Cross-site request rejected" }, { status: 403 });
    }
    const headers = new Headers(request.headers);
    if (token) headers.set("authorization", `Bearer ${token}`);
    const response = NextResponse.next({ request: { headers } });
    if (token && pathname !== "/api/auth/login") {
      // Reissue legacy client-written session cookies as HttpOnly cookies during migration.
      response.cookies.set("edtech_access_token", token, {
        httpOnly: true,
        secure: request.nextUrl.protocol === "https:",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,
      });
    }
    return response;
  }

  const tokenIsValid = hasUnexpiredToken(token);
  const rawRole = request.cookies.get("edtech_user_role")?.value;
  let userRole: string | null = null;
  try {
    userRole = rawRole ? decodeURIComponent(rawRole).trim().toUpperCase() : null;
  } catch {
    userRole = null;
  }

  // Keep login reachable even when a browser has a stale or server-rejected
  // token cookie. The API is the authority for token validity.
  if (pathname === "/login") {
    const response = NextResponse.next();
    return tokenIsValid ? response : token ? clearSessionCookies(response) : response;
  }

  // 2. Protect all /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!tokenIsValid) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return clearSessionCookies(NextResponse.redirect(loginUrl));
    }

    // Direct /dashboard index access -> redirect to proper role dashboard
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      const targetDashboard = (userRole && ROLE_DASHBOARDS[userRole]) || "/dashboard/admin";
      return NextResponse.redirect(new URL(targetDashboard, request.url));
    }

    // Role-based route guard enforcement
    // ADMIN has full superuser access across all modules
    if (userRole === "ADMIN") {
      return NextResponse.next();
    }

    // Check specific role subtrees
    const routePrefixes: Array<{ prefix: string; allowedRoles: string[] }> = [
      { prefix: "/dashboard/admin", allowedRoles: ["ADMIN"] },
      { prefix: "/dashboard/teacher", allowedRoles: ["TEACHER", "ADMIN"] },
      { prefix: "/dashboard/student", allowedRoles: ["STUDENT", "ADMIN"] },
      { prefix: "/dashboard/parent", allowedRoles: ["PARENT", "ADMIN"] },
      { prefix: "/dashboard/accountant", allowedRoles: ["ACCOUNTANT", "ADMIN"] },
      { prefix: "/dashboard/librarian", allowedRoles: ["LIBRARIAN", "ADMIN"] },
    ];

    for (const { prefix, allowedRoles } of routePrefixes) {
      if (pathname.startsWith(prefix)) {
        if (!userRole || !allowedRoles.includes(userRole)) {
          const userHome = (userRole && ROLE_DASHBOARDS[userRole]) || "/login";
          return NextResponse.redirect(new URL(userHome, request.url));
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/api/:path*"],
};
