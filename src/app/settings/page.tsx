"use client";

import { useEffect, useState } from "react";
import { csrfHeaders } from "@/lib/clientCsrf";

export default function SettingsPage() {
  const [isPrivate, setIsPrivate] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setUserId(d.user.id);
          setIsPrivate(!!d.user.isPrivate);
        }
        setLoading(false);
      });
  }, []);

  async function save() {
    if (!userId) return;
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      body: JSON.stringify({ isPrivate }),
    });
    setSaving(false);
    setMessage(res.ok ? "Saved" : "Failed");
  }

  if (loading) return <div className="p-8">Loading...</div>;
  if (!userId) return <div className="p-8">Please login.</div>;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold">Settings</h1>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
        Private account
      </label>
      <button onClick={save} disabled={saving} className="mt-4 rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black">
        {saving ? "Saving..." : "Save"}
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
