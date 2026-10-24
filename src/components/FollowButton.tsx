"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { csrfHeaders } from "@/lib/clientCsrf";

export default function FollowButton({ userId, initialFollowing }: { userId: string; initialFollowing: boolean }) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch(`/api/users/${userId}/follow`, { method: "POST", headers: { ...csrfHeaders() } });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) {
      setFollowing(data.following);
      router.refresh();
    }
  }

  return (
    <button onClick={toggle} disabled={loading} className="rounded border px-3 py-1 text-sm">
      {loading ? "..." : following ? "Unfollow" : "Follow"}
    </button>
  );
}
