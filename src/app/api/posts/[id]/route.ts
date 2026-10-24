import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, isPrivate: true } },
      comments: { include: { user: { select: { id: true, email: true } } }, orderBy: { createdAt: "asc" } },
      _count: { select: { likes: true } },
    },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const viewer = await getCurrentUser();
  if (post.user.isPrivate && viewer?.id !== post.userId) {
    if (!viewer) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const follow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: viewer.id, followingId: post.userId } },
    });
    if (!follow) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const liked = viewer
    ? !!(await prisma.like.findUnique({ where: { userId_postId: { userId: viewer.id, postId: id } } }))
    : false;

  return NextResponse.json({
    ok: true,
    data: {
      id: post.id,
      title: post.title,
      tags: post.tags,
      imageUrl: post.imageUrl,
      thumbnailUrl: post.thumbnailUrl,
      width: post.width,
      height: post.height,
      createdAt: post.createdAt,
      user: { id: post.user.id, email: post.user.email, isPrivate: post.user.isPrivate },
      likeCount: post._count.likes,
      liked,
      comments: post.comments.map((c: any) => ({
        id: c.id,
        content: c.content,
        parentId: c.parentId,
        pinned: c.pinned,
        createdAt: c.createdAt,
        user: { id: c.user.id, email: c.user.email },
      })),
    },
  });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
