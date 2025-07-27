import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Only apply middleware to /api/messages routes
  if (!request.nextUrl.pathname.startsWith("/api/messages")) {
    return NextResponse.next();
  }

  // Simply pass through to API routes - auth will be handled there
  // since Firebase Admin SDK can't run in Edge Runtime
  return NextResponse.next();
}

export const config = {
  matcher: "/api/messages/:path*",
};
