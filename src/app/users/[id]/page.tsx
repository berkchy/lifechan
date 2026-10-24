import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import FollowButton from "@/components/FollowButton";
import RemoveFollowerButton from "@/components/RemoveFollowerButton";


export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, isPrivate: true, createdAt: true },
  });
  if (!user) return <div className="p-8">Not found</div>;

  const viewer = await getCurrentUser();
  const isOwner = viewer?.id === id;
  let isFollowing = false;
  if (viewer && !isOwner) {
    const f = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: viewer.id, followingId: id } },
    });
    isFollowing = !!f;
  }

  const counts = {
    posts: await prisma.post.count({ where: { userId: id } }),
    followers: await prisma.follow.count({ where: { followingId: id } }),
    following: await prisma.follow.count({ where: { followerId: id } }),
  };

  const canView = !user.isPrivate || isOwner || isFollowing;

  const posts = canView
    ? await prisma.post.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, take: 40 })
    : [];

  const followers = isOwner
    ? await prisma.follow.findMany({ where: { followingId: id }, include: { follower: { select: { id: true, email: true } } } })
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{user.email}</h1>
          <p className="text-sm text-zinc-500">{user.isPrivate ? "Private account" : "Public account"}</p>
          <div className="mt-2 flex gap-4 text-sm">
            <span>{counts.posts} posts</span>
            <span>{counts.followers} followers</span>
            <span>{counts.following} following</span>
          </div>
        </div>
        <div className="flex gap-2">
          {isOwner ? (
            <Link href="/settings" className="rounded border px-3 py-1 text-sm">Settings</Link>
          ) : viewer ? (
            <FollowButton userId={user.id} initialFollowing={isFollowing} />
          ) : null}
        </div>
      </div>

      {!canView ? (
        <p className="text-zinc-500">This account is private.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {posts.map((p: any) => (
            <Link key={p.id} href={`/posts/${p.id}`} className="block overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.thumbnailUrl || p.imageUrl} alt={p.title} className="aspect-square w-full object-cover" />
            </Link>
          ))}
        </div>
      )}

      {isOwner && followers.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-2 text-lg font-semibold">Followers</h2>
          <ul className="space-y-2">
            {followers.map((f: any) => (
              <li key={f.id} className="flex items-center justify-between rounded border p-2 dark:border-zinc-800">
                <Link href={`/users/${f.follower.id}`} className="text-sm">{f.follower.email}</Link>
                <RemoveFollowerButton userId={id} followerId={f.follower.id} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
