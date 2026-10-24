import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string; followerId: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id: targetId, followerId } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.id !== targetId && user.id !== followerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.follow.deleteMany({
    where: { followerId, followingId: targetId },
  });
  return NextResponse.json({ ok: true });
}
