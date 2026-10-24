import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const comment = await prisma.comment.findUnique({ where: { id }, include: { post: true } });
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (comment.post.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const nextPinned = !comment.pinned;
  await prisma.$transaction([
    prisma.comment.updateMany({ where: { postId: comment.postId }, data: { pinned: false } }),
    prisma.comment.update({ where: { id }, data: { pinned: nextPinned } }),
  ]);
  return NextResponse.json({ ok: true, pinned: nextPinned });
}
