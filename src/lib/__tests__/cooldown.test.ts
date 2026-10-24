import { canPost, COOLDOWN_MS } from "../cooldown";

test("allows when no last post", () => {
  expect(canPost(null).allowed).toBe(true);
});

test("blocks within cooldown", () => {
  const now = new Date("2026-01-01T00:00:00Z");
  const last = new Date(now.getTime() - 60_000);
  const res = canPost(last, now);
  expect(res.allowed).toBe(false);
  expect(res.nextAllowedAt).not.toBeNull();
});

test("allows after cooldown", () => {
  const now = new Date("2026-01-01T00:10:00Z");
  const last = new Date(now.getTime() - COOLDOWN_MS - 1000);
  expect(canPost(last, now).allowed).toBe(true);
});
