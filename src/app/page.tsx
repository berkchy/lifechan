import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";


export default async function Home({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page || "1"));
  const limit = 20;
  const viewer = await getCurrentUser();
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    include: { user: { select: { id: true, email: true, isPrivate: true } } },
  });

  const visible = [];
  for (const p of posts) {
    if (!p.user.isPrivate) { visible.push(p); continue; }
    if (viewer && viewer.id === p.userId) { visible.push(p); continue; }
    if (viewer) {
      const f = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: viewer.id, followingId: p.userId } },
      });
      if (f) visible.push(p);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Latest posts</h1>
      {visible.length === 0 ? (
        <p className="text-zinc-500">No posts yet.</p>
      ) : (
        <>
          <div className="columns-2 gap-4 sm:columns-3 md:columns-4">
            {visible.map((p: any) => (
              <Link key={p.id} href={`/posts/${p.id}`} className="mb-4 block break-inside-avoid overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumbnailUrl || p.imageUrl} alt={p.title} className="w-full object-cover transition group-hover:opacity-90" />
                <div className="p-2">
                  <div className="truncate text-sm font-medium">{p.title}</div>
                  <div className="truncate text-xs text-zinc-500">{p.user.email}</div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 flex justify-center gap-4">
            {page > 1 && <Link href={`/?page=${page - 1}`} className="rounded border px-3 py-1 text-sm">Prev</Link>}
            {visible.length === limit && <Link href={`/?page=${page + 1}`} className="rounded border px-3 py-1 text-sm">Next</Link>}
          </div>
        </>
      )}
    </div>
  );
}
