import { md5 } from "js-md5";
import { siteConfig } from "@/site.config";

export async function POST(req: Request) {
  const { merchant_id, order_id, amount, currency } = await req.json();

  const host = req.headers.get("host") as string;

  // Live keys only when served from the tenant's production host; preview/
  // local hosts fall back to the sandbox key.
  const liveHost = new URL(siteConfig.url.base).hostname;
  let live = false;
  if (host.includes(liveHost)) {
    live = true;
  }

  const localKey = process.env.PAYHERE_MERCHANT_KEY;
  const liveKey = process.env.GQ_PAYHERE_MERCHANT_SECRET_KEY;

  const merchant_secret = live ? liveKey : localKey;

  if (merchant_secret === "") {
    return Response.json(
      { error: "Merchant Secret Key not found" },
      { status: 400 }
    );
  }
  
  if (!merchant_id || !order_id || !amount || !currency) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!merchant_secret) {
    return Response.json(
      { error: "Merchant Secret Key not found" },
      { status: 400 }
    );
  }

  // let hashCreatedObj = {
  //   merchant_id,
  //   order_id,
  //   amount,
  //   currency,
  //   merchant_secret,
  // };

  const hash = generateHash(
    merchant_id,
    order_id,
    amount,
    currency,
    merchant_secret
  );

  // Use this for debug the payhere hash
  
  // let data = {
  //   merchant_id,
  //   order_id,
  //   amount,
  //   currency,
  //   hash,
  //   live,
  //   liveKey,
  //   localKey,
  //   host
  // };

  return Response.json({ hash }, { status: 200 });
}

export async function GET() {
  let hash = "Pay here page!";

  return Response.json({ hash });
}

const to_upper_case = (str: string) => str.toUpperCase();
const createmd5 = (str: string) => md5.create().update(str).hex();
function generateHash(
  merchant_id: string,
  order_id: string,
  amount: string,
  currency: string,
  merchant_secret: string
): string {
  let newHash = to_upper_case(
    createmd5(
      merchant_id +
        order_id +
        amount +
        currency +
        to_upper_case(createmd5(merchant_secret))
    )
  );

  return newHash;
}
