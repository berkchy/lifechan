import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const isApi = req.nextUrl.pathname.startsWith("/api");
  const mutating = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
  if (!isApi || !mutating) {
    const res = NextResponse.next();
    if (!req.cookies.get("csrf")) {
      res.cookies.set("csrf", crypto.randomUUID(), { path: "/", sameSite: "lax", httpOnly: false });
    }
    return res;
  }

  const cookie = req.cookies.get("csrf")?.value;
  const header = req.headers.get("x-csrf-token");
  if (cookie && cookie !== header) {
    return NextResponse.json({ error: "CSRF token mismatch" }, { status: 403 });
  }

  const res = NextResponse.next();
  if (!cookie) {
    res.cookies.set("csrf", crypto.randomUUID(), { path: "/", sameSite: "lax", httpOnly: false });
  }
  return res;
}

export const config = {
  matcher: ["/api/:path*"],
};
