import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { postSchema } from "@/lib/schemas";
import { canPost } from "@/lib/cooldown";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { rateLimit, clientKey } from "@/lib/rateLimit";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") || "20")));
  const tag = url.searchParams.get("tag");
  const userId = url.searchParams.get("userId");
  const viewer = await getCurrentUser();

  const where: Record<string, unknown> = {};
  if (tag) where.tags = { has: tag };
  if (userId) where.userId = userId;

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    include: { user: { select: { id: true, email: true, isPrivate: true } } },
  });

  const result = [];
  for (const p of posts) {
    if (!p.user.isPrivate) { result.push(p); continue; }
    if (viewer && viewer.id === p.userId) { result.push(p); continue; }
    if (viewer) {
      const follow = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: viewer.id, followingId: p.userId } },
      });
      if (follow) result.push(p);
    }
  }

  const total = await prisma.post.count({ where });
  return NextResponse.json({
    ok: true,
    data: result.map((p: any) => ({
      id: p.id,
      title: p.title,
      tags: p.tags,
      imageUrl: p.imageUrl,
      thumbnailUrl: p.thumbnailUrl,
      width: p.width,
      height: p.height,
      createdAt: p.createdAt,
      user: { id: p.user.id, email: p.user.email, isPrivate: p.user.isPrivate },
    })),
    meta: { page, limit, total, count: result.length },
  });
}

export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "post"), 20, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cd = canPost(user.lastPostAt);
  if (!cd.allowed) {
    return NextResponse.json({ error: "Cooldown active", nextAllowedAt: cd.nextAllowedAt }, { status: 429 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const title = String(form.get("title") || "");
  const tagsRaw = form.get("tags");
  const tags = tagsRaw ? String(tagsRaw).split(",").map((t) => t.trim()).filter(Boolean) : [];

  const parsed = postSchema.safeParse({ title, tags });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: "File required" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const upload = await uploadToCloudinary(buffer, file.name || "image.jpg");

  const post = await prisma.post.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      tags: parsed.data.tags,
      imageUrl: upload.url,
      thumbnailUrl: upload.thumbnailUrl,
      width: upload.width,
      height: upload.height,
    },
  });

  await prisma.user.update({ where: { id: user.id }, data: { lastPostAt: new Date() } });

  return NextResponse.json({ ok: true, id: post.id });
}
