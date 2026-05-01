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
