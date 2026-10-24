import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { commentSchema } from "@/lib/schemas";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const comments = await prisma.comment.findMany({
    where: { postId: id },
    include: { user: { select: { id: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({
    ok: true,
    data: comments.map((c: any) => ({
      id: c.id,
      content: c.content,
      parentId: c.parentId,
      pinned: c.pinned,
      createdAt: c.createdAt,
      user: { id: c.user.id, email: c.user.email },
    })),
  });
}

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  if (parsed.data.parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parsed.data.parentId } });
    if (!parent || parent.postId !== id) {
      return NextResponse.json({ error: "Invalid parent" }, { status: 400 });
    }
  }

  const comment = await prisma.comment.create({
    data: {
      postId: id,
      userId: user.id,
      content: parsed.data.content,
      parentId: parsed.data.parentId ?? null,
    },
  });
  return NextResponse.json({ ok: true, id: comment.id });
}
