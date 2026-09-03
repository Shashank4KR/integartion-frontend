import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_DASHBOARDS: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
  PARENT: "/dashboard/parent",
  ACCOUNTANT: "/dashboard/accountant",
  LIBRARIAN: "/dashboard/librarian",
  WARDEN: "/dashboard/warden",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("edtech_access_token")?.value;
  const rawRole = request.cookies.get("edtech_user_role")?.value;
  const userRole = rawRole ? decodeURIComponent(rawRole).trim().toUpperCase() : null;

  // 1. If user is on /login and is already authenticated, redirect to their role dashboard
  if (pathname === "/login") {
    if (token) {
      const targetDashboard = (userRole && ROLE_DASHBOARDS[userRole]) || "/dashboard/admin";
      return NextResponse.redirect(new URL(targetDashboard, request.url));
    }
    return NextResponse.next();
  }

  // 2. Protect all /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
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
      { prefix: "/dashboard/warden", allowedRoles: ["WARDEN", "ADMIN"] },
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
  matcher: ["/dashboard/:path*", "/login"],
};
