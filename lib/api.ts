import { siteConfig } from "@/site.config";

/**
 * Build an absolute URL against the tenant's WordPress/WooCommerce REST host.
 * Centralizes `siteConfig.url.api` so REST endpoints aren't hardcoded per call.
 * Accepts a path with or without a leading slash.
 */
export function apiUrl(path: string): string {
  const base = siteConfig.url.api.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}
