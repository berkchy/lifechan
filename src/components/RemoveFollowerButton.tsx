"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { csrfHeaders } from "@/lib/clientCsrf";

export default function RemoveFollowerButton({ userId, followerId }: { userId: string; followerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function remove() {
    setLoading(true);
    await fetch(`/api/users/${userId}/followers/${followerId}`, { method: "DELETE", headers: { ...csrfHeaders() } });
    setLoading(false);
    router.refresh();
  }
  return (
    <button onClick={remove} disabled={loading} className="text-xs text-red-600">
      {loading ? "..." : "Remove"}
    </button>
  );
}
