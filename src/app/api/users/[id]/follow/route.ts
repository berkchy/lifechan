import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const { id: targetId } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.id === targetId) return NextResponse.json({ error: "Cannot follow self" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: user.id, followingId: targetId } },
  });
  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true, following: false });
  }
  await prisma.follow.create({ data: { followerId: user.id, followingId: targetId } });
  return NextResponse.json({ ok: true, following: true });
}
