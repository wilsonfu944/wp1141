import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // For now, allow all requests to pass through
  // NextAuth will handle authentication at the API level
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/(main)/:path*",
    "/api/posts/:path*",
    "/api/users/:path*",
    "/api/drafts/:path*",
  ],
};




