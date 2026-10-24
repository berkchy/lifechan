import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken, sessionCookieOptions } from "@/lib/auth";
import { registerSchema } from "@/lib/schemas";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { isDeviceTaken } from "@/lib/deviceGuard";
import { sendVerificationEmail } from "@/lib/cloudinary";

export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "register"), 5, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { email, password, deviceFingerprint } = parsed.data;

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

  const existingDevice = await prisma.user.findUnique({ where: { deviceFingerprint } });
  if (isDeviceTaken(existingDevice?.deviceFingerprint ?? null, deviceFingerprint)) {
    return NextResponse.json({ error: "Device already registered" }, { status: 409 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, deviceFingerprint, ipHash },
  });

  const token = crypto.randomUUID();
  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
  await sendVerificationEmail(email, token);

  const sessionToken = createSessionToken({ userId: user.id, email: user.email });
  const res = NextResponse.json({ ok: true, userId: user.id });
  res.cookies.set({ ...sessionCookieOptions(), value: sessionToken });
  return res;
}
