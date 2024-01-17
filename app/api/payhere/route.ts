import {NextApiResponse} from "next";
import {md5} from "js-md5";

export async function POST(req: Request , res: NextApiResponse) {
  const { merchant_id, order_id, amount, currency } = await req.json();
  const merchant_secret =
    "MTc5ODQyNDU0NjI3ODU3NTY4NjA5ODE3MTEyMzQxNDg5NjEzOTI1";

  if (!merchant_id || !order_id || !amount || !currency) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const hash = generateHash(
    merchant_id,
    order_id,
    amount,
    currency,
    merchant_secret
  );

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
