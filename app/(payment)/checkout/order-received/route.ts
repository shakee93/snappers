import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// WebXPay's Return URL (set in its merchant portal) points here. The customer's
// browser POSTs the signed payment result (`payment` + `signature`); it is the
// only notification WebXPay sends, so relay it to WordPress, where the WebXPay
// plugin verifies the signature and updates the order. On a verified result the
// plugin redirects to the order-received URL, which the headless-frontend-urls
// mu-plugin rewrites to /checkout/{id}?order_id=…&key=… - pass that on. Anything
// else (bad signature, backend error) means the order wasn't updated.
export async function POST(request: NextRequest) {
  try {
    const response = await fetch(apiUrl("/checkout/order-received/"), {
      method: "POST",
      headers: {
        "Content-Type":
          request.headers.get("content-type") ??
          "application/x-www-form-urlencoded",
      },
      body: await request.text(),
      redirect: "manual",
      cache: "no-store",
    });

    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      const target = new URL(location, apiUrl("/"));
      if (target.pathname.startsWith("/checkout/")) {
        // Keep the customer on this origin whatever host WordPress used.
        return NextResponse.redirect(
          new URL(`${target.pathname}${target.search}`, request.url),
          303,
        );
      }
    }
  } catch {
    // Fall through to the failure redirect.
  }

  return NextResponse.redirect(new URL("/cart?success=false", request.url), 303);
}

export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/", request.url));
}
