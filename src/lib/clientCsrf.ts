export function csrfHeaders(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf="))
    ?.split("=")[1];
  return token ? { "X-CSRF-Token": token } : {};
}
