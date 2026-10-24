import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";


export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, isPrivate: true } },
      comments: { include: { user: { select: { id: true, email: true } } }, orderBy: { createdAt: "asc" } },
      _count: { select: { likes: true } },
    },
  });
  if (!post) return <div className="p-8">Not found</div>;

  const viewer = await getCurrentUser();
  const liked = viewer ? !!(await prisma.like.findUnique({ where: { userId_postId: { userId: viewer.id, postId: id } } })) : false;
  const canPin = !!viewer && viewer.id === post.userId;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={post.imageUrl} alt={post.title} className="w-full rounded-lg" />
      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{post.title}</h1>
          <p className="text-sm text-zinc-500">
            by <Link href={`/users/${post.user.id}`} className="underline">{post.user.email}</Link> · {new Date(post.createdAt).toLocaleString()}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {post.tags.map((t: string) => (
              <Link key={t} href={`/search?tag=${encodeURIComponent(t)}`} className="rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">#{t}</Link>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <LikeButton postId={post.id} initialLiked={liked} initialCount={post._count.likes} />
          <a href={post.imageUrl} download className="rounded border px-3 py-1 text-sm">Download</a>
        </div>
      </div>
      <CommentSection
        postId={post.id}
        initialComments={post.comments.map((c: any) => ({
          id: c.id,
          content: c.content,
          parentId: c.parentId,
          pinned: c.pinned,
          createdAt: c.createdAt.toISOString(),
          user: { id: c.user.id, email: c.user.email },
        }))}
        canPin={canPin}
      />
    </div>
  );
}
