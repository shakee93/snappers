/** Client-side JWT helpers - avoid sending expired/invalid Bearer tokens (WP returns ISE on addToCart). */

type JwtPayload = {
  exp?: number;
};

export function parseJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    if (typeof atob !== "function") return null;
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

export function isAuthTokenExpired(token: string, skewMs = 30_000): boolean {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 <= Date.now() + skewMs;
}

/** Returns a Bearer token safe to send, or null after clearing bad storage. */
export function readUsableAuthToken(storageKey: string): string | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem(storageKey);
  if (!token) return null;

  const payload = parseJwtPayload(token);
  if (!payload || isAuthTokenExpired(token)) {
    localStorage.removeItem(storageKey);
    return null;
  }

  return token;
}
