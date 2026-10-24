import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { profileSchema } from "@/lib/schemas";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      isPrivate: true,
      createdAt: true,
      _count: { select: { posts: true, followers: true, following: true } },
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const viewer = await getCurrentUser();
  const isOwner = viewer?.id === id;
  let isFollowing = false;
  if (viewer && !isOwner) {
    const f = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: viewer.id, followingId: id } },
    });
    isFollowing = !!f;
  }

  if (user.isPrivate && !isOwner && !isFollowing) {
    return NextResponse.json({
      ok: true,
      data: { id: user.id, email: user.email, isPrivate: true, hidden: true, counts: user._count },
    });
  }

  const posts = await prisma.post.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json({
    ok: true,
    data: {
      id: user.id,
      email: user.email,
      isPrivate: user.isPrivate,
      createdAt: user.createdAt,
      counts: user._count,
      isFollowing,
      isOwner,
      posts,
    },
  });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user || user.id !== id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id },
    data: { isPrivate: parsed.data.isPrivate ?? user.isPrivate },
    select: { id: true, email: true, isPrivate: true },
  });
  return NextResponse.json({ ok: true, data: updated });
}
