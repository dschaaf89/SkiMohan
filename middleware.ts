// middleware.ts
import { NextResponse, NextRequest, NextFetchEvent } from "next/server";
import { authMiddleware } from "@clerk/nextjs";

const cors = (request: NextRequest) => {
  const origin = request.headers.get("origin");
  const allowedOrigins = ["http://localhost:3001","http://localhost:3000", "https://ski-mohan-admin.vercel.app/"];
  
  // Handle preflight requests
  if (request.method === 'OPTIONS' && origin && allowedOrigins.includes(origin)) {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Allow-Credentials", "true");
    return response;
  }

  return null;
};

// Middleware to apply CORS and Clerk authentication
export function middleware(request: NextRequest, event: NextFetchEvent) {
  const corsResponse = cors(request);
  if (corsResponse) return corsResponse;  // Return CORS preflight response directly

  // Proceed with Clerk auth middleware for other requests
  return authMiddleware({
    publicRoutes: ["/api/:path*"]
  })(request, event);
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
