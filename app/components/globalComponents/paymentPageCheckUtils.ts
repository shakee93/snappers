import { headers } from "next/headers";

const EXAMPLE_ID = "b3JkZXI6NjQ0NQ==";

export function isPaymentPage(): boolean {
  const headersList = headers();
  const fullUrl = headersList.get("referer") || "";
  // const EXAMPLE_ID = "b3JkZXI6NjQ0NQ==";
  // const url = "http://localhost:3000/checkout/b3JkZXI6NjQ0NQ==";

  const splits = fullUrl.split("/");
  const indexOfCheckout = splits.indexOf("checkout");

  if (indexOfCheckout !== -1 && indexOfCheckout < splits.length - 1) {
    // Get the part of the URL after "checkout/"``
    const partAfterCheckout = splits[indexOfCheckout + 1];
    let paymentPage = partAfterCheckout.length == 16;
    return paymentPage;
  } else {
    console.log("Pattern 'checkout/' not found in the URL.");
  }

  // const headersList = headers();
  // const fullUrl = headersList.get("referer") || "";
  console.log('fullUrl', fullUrl);
  // const searchString = "checkout/";


  const searchString = /checkout\/id \w{16}/;
  const isMatch = searchString.test(fullUrl);
  // return fullUrl.includes(searchString);
  return isMatch;
}
