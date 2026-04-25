import { headers } from "next/headers";

const EXAMPLE_ID = "b3JkZXI6NjQ0NQ==";

export async function isPaymentPage(): Promise<boolean> {
  const headersList = await headers();
  const fullUrl = headersList.get("referer") || "";

  const splits = fullUrl.split("/");
  const indexOfCheckout = splits.indexOf("checkout");

  if (indexOfCheckout !== -1 && indexOfCheckout < splits.length - 1) {
    // Get the part of the URL after "checkout/"
    const partAfterCheckout = splits[indexOfCheckout + 1];
    let paymentPage = partAfterCheckout.length == 16;
    return paymentPage;
  } else {
    // console.log("Pattern 'checkout/' not found in the URL.");
  }

  const searchString = /checkout\/id \w{16}/;
  const isMatch = searchString.test(fullUrl);
  return isMatch;
}
