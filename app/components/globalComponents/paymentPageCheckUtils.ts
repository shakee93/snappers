import { headers } from "next/headers";

export function isPaymentPage(): boolean {
    const headersList = headers();
    const fullUrl = headersList.get("referer") || "";
    const searchString = "checkout/payment";
    return fullUrl.includes(searchString);
  }
  