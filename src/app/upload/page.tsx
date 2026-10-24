"use client";

import type { FormEvent } from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { csrfHeaders } from "@/lib/clientCsrf";

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!file) { setError("File required"); return; }
    setLoading(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("title", title);
    form.append("tags", tags);
    const res = await fetch("/api/posts", { method: "POST", body: form, headers: { ...csrfHeaders() } });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data?.error ? JSON.stringify(data.error) : "Upload failed");
      return;
    }
    router.push(`/posts/${data.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold">Upload</h1>
      <form onSubmit={submit} className="space-y-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required className="w-full rounded border px-3 py-2 dark:bg-zinc-900" />
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)" className="w-full rounded border px-3 py-2 dark:bg-zinc-900" />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="w-full rounded bg-black py-2 text-white dark:bg-white dark:text-black">{loading ? "Uploading..." : "Upload"}</button>
      </form>
    </div>
  );
}
