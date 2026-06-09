import { NextRequest, NextResponse } from "next/server";

// Next.js sets the `x-next-cache-tags` HTTP response header from the route's
// dynamic segments. HTTP headers are restricted to printable ASCII, so any
// non-ASCII byte in the path (decoded form) crashes the response with
// `TypeError: Invalid character in header content`. Real product slugs that
// trip this include U+2011 (non-breaking hyphen), U+2502 (box-drawing pipe)
// and U+2033 (double-prime) — e.g. /product/oneplus-11r-5g-│-18gb-256gb.
//
// Short-circuit those requests with a 404 here so the route handler never
// runs and the bad header is never set. Long-term fix is to clean the
// upstream WP slugs; this is the safety net.
const ASCII_PRINTABLE = /^[\x20-\x7E]*$/;

// Paths that fall through to the dynamic `/[brand]` route, which calls
// notFound(). Vercel's CDN does not cache 404 responses by default, so every
// scanner hit becomes a billable edge request + function invocation +
// upstream GraphQL call. By returning the 404 from middleware with explicit
// cache headers, the response becomes CDN-cacheable and repeats are served
// without invoking a function.
//
// Only include paths that can NEVER be real routes on this storefront. If
// you add e.g. /home or /admin as a real page under app/, remove the
// matching entry. Real routes like /about and /contact are intentionally
// NOT listed here.
const RESERVED_404_PATHS = new Set([
  // WordPress probes
  "/wp-admin",
  "/wp-login.php",
  "/wp-content",
  "/wp-includes",
  "/wp-config.php",
  "/xmlrpc.php",
  // PHP / generic admin probes
  "/phpmyadmin",
  "/phpinfo.php",
  "/admin",
  "/administrator",
  // Secrets / VCS probes
  "/.env",
  "/.git",
  "/.git/config",
  "/.DS_Store",
  // Hot scanner target with no real route on this site
  "/home",
]);

const RESERVED_404_HEADERS = {
  "cache-control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=86400",
};

export function middleware(request: NextRequest) {
  let pathname: string;
  try {
    pathname = decodeURIComponent(request.nextUrl.pathname);
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (!ASCII_PRINTABLE.test(pathname)) {
    return new NextResponse(null, { status: 404 });
  }
  const normalized = pathname.toLowerCase().replace(/\/+$/, "") || "/";
  if (RESERVED_404_PATHS.has(normalized)) {
    return new NextResponse(null, {
      status: 404,
      headers: RESERVED_404_HEADERS,
    });
  }
  return NextResponse.next();
}

// Skip Next internals, API routes, and a fixed set of static-asset
// extensions. The earlier `.*\.[a-zA-Z0-9]+$` form was too greedy — a
// product slug like `iphone-15-1.5tb` ends in `.5tb` and would slip past
// the guard. Listing real asset extensions keeps slugs in scope.
export const config = {
  matcher: [
    "/((?!_next/|api/|.*\\.(?:html|json|xml|js|mjs|css|map|wasm|txt|png|jpg|jpeg|webp|gif|svg|ico|woff2?|ttf|otf|eot|mp4|webm)$).*)",
  ],
};
