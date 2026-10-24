"use client";

import { useState } from "react";
import { csrfHeaders } from "@/lib/clientCsrf";

export default function LikeButton({ postId, initialLiked, initialCount }: { postId: string; initialLiked: boolean; initialCount: number }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch(`/api/posts/${postId}/like`, { method: "POST", headers: { ...csrfHeaders() } });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) {
      setLiked(data.liked);
      setCount((c) => (data.liked ? c + 1 : c - 1));
    }
  }

  return (
    <button onClick={toggle} disabled={loading} className="rounded border px-3 py-1 text-sm">
      {liked ? "Unlike" : "Like"} ({count})
    </button>
  );
}
