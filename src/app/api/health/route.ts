import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const required = ["DATABASE_URL", "NEXTAUTH_SECRET"];

export async function GET() {
  const missing = required.filter((k) => !process.env[k]);
  let db = "unknown";
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = "ok";
  } catch (e) {
    db = "error";
  }
  return NextResponse.json({
    ok: missing.length === 0 && db === "ok",
    missing,
    db,
    cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
    resend: !!process.env.RESEND_API_KEY,
  });
}
