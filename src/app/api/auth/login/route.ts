import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken, sessionCookieOptions } from "@/lib/auth";
import { loginSchema } from "@/lib/schemas";
import { rateLimit, clientKey } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "login"), 10, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  if (!user.emailVerified) return NextResponse.json({ error: "Email not verified" }, { status: 403 });

  const token = createSessionToken({ userId: user.id, email: user.email });
  const res = NextResponse.json({ ok: true, userId: user.id });
  res.cookies.set({ ...sessionCookieOptions(), value: token });
  return res;
}
