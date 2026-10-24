"use client";

import { useState } from "react";
import { csrfHeaders } from "@/lib/clientCsrf";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST", headers: { ...csrfHeaders() } });
    router.push("/login");
    router.refresh();
  }
  return (
    <button onClick={logout} disabled={loading} className="text-sm text-zinc-600 hover:text-black dark:text-zinc-300">
      {loading ? "..." : "Logout"}
    </button>
  );
}
