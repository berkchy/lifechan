export const COOLDOWN_MS = 5 * 60 * 1000;

export function canPost(lastPostAt: Date | null, now: Date = new Date()): { allowed: boolean; nextAllowedAt: Date | null } {
  if (!lastPostAt) return { allowed: true, nextAllowedAt: null };
  const diff = now.getTime() - lastPostAt.getTime();
  if (diff >= COOLDOWN_MS) return { allowed: true, nextAllowedAt: null };
  return { allowed: false, nextAllowedAt: new Date(lastPostAt.getTime() + COOLDOWN_MS) };
}
