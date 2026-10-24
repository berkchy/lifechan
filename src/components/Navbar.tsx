import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const user = await getCurrentUser();
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold">Lifechan</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/">Feed</Link>
          <Link href="/search">Search</Link>
          {user ? (
            <>
              <Link href="/upload">Upload</Link>
              <Link href={`/users/${user.id}`}>Profile</Link>
              <Link href="/settings">Settings</Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
