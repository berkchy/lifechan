"use client";

import type { FormEvent } from "react";

import { useState } from "react";
import { csrfHeaders } from "@/lib/clientCsrf";

type Comment = {
  id: string;
  content: string;
  parentId: string | null;
  pinned: boolean;
  createdAt: string;
  user: { id: string; email: string };
};

export default function CommentSection({ postId, initialComments, canPin }: { postId: string; initialComments: Comment[]; canPin: boolean }) {
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const res = await fetch(`/api/posts/${postId}/comments`);
    const data = await res.json();
    if (res.ok) setComments(data.data);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      body: JSON.stringify({ content, parentId: null }),
    });
    setContent("");
    await refresh();
    setLoading(false);
  }

  async function submitReply(parentId: string) {
    setLoading(true);
    await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      body: JSON.stringify({ content: replyContent, parentId }),
    });
    setReplyContent("");
    setReplyTo(null);
    await refresh();
    setLoading(false);
  }

  async function pin(id: string) {
    await fetch(`/api/comments/${id}/pin`, { method: "POST", headers: { ...csrfHeaders() } });
    await refresh();
  }

  const topLevel = comments.filter((c) => !c.parentId);
  const repliesOf = (id: string) => comments.filter((c) => c.parentId === id);

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-lg font-semibold">Comments</h2>
      <form onSubmit={submit} className="mb-6 flex gap-2">
        <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Add comment" required className="flex-1 rounded border px-3 py-2 dark:bg-zinc-900" />
        <button disabled={loading} className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black">Post</button>
      </form>
      <div className="space-y-4">
        {topLevel.map((c) => (
          <div key={c.id} className="rounded border p-3 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{c.user.email}</span>
              <span className="text-xs text-zinc-500">{new Date(c.createdAt).toLocaleString()}</span>
            </div>
            {c.pinned && <span className="text-xs text-amber-600">Pinned</span>}
            <p className="mt-1 text-sm">{c.content}</p>
            <div className="mt-2 flex gap-3 text-xs">
              <button onClick={() => setReplyTo(c.id)} className="text-blue-600">Reply</button>
              {canPin && <button onClick={() => pin(c.id)} className="text-amber-600">{c.pinned ? "Unpin" : "Pin"}</button>}
            </div>
            {replyTo === c.id && (
              <div className="mt-2 flex gap-2">
                <input value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Reply" className="flex-1 rounded border px-3 py-2 text-sm dark:bg-zinc-900" />
                <button onClick={() => submitReply(c.id)} className="rounded bg-black px-3 py-2 text-xs text-white dark:bg-white dark:text-black">Send</button>
              </div>
            )}
            <div className="ml-4 mt-3 space-y-2">
              {repliesOf(c.id).map((r) => (
                <div key={r.id} className="rounded bg-zinc-50 p-2 dark:bg-zinc-900">
                  <div className="text-xs font-medium">{r.user.email}</div>
                  <p className="text-sm">{r.content}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
