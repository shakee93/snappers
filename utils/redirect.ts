/**
 * Only same-origin, path-relative redirects are honoured - `//evil.com` is a
 * protocol-relative URL, not a local path.
 */
export function getSafeRedirectPath(redirect: string | null): string {
  if (!redirect?.startsWith("/") || redirect.startsWith("//")) {
    return "/";
  }
  return redirect;
}
