import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  // Add request ID to headers for tracing
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Add response headers for observability
  response.headers.set("x-request-id", requestId);
  response.headers.set("x-response-time", `${Date.now() - startTime}ms`);

  return response;
}

export const config = {
  matcher: [
    // Match all API routes except auth
    "/api/((?!auth).*)",
    // Match dashboard routes
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
