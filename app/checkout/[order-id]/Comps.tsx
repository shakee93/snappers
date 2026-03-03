interface OrderDetailsProps {
  orderData: any;
}

export const OrderDetails = ({ orderData }: OrderDetailsProps) => {
  if (!orderData) return null;
  
  // Handle both orderData.order and orderData.checkout.order structures
  const order = orderData.order || orderData.checkout?.order;
  if (!order) return null;

  const CURRENCY_SYMBOL = "₨";
  
  const date = order.date ? new Date(order.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : "-";

  // Get order ID - try orderNumber first, then databaseId, then id
  const orderId = order.orderNumber ?? order.databaseId ?? order.id ?? "Not found";

  // Helper to normalize currency strings coming from backend (e.g. "Rs." → "₨")
  const normalizeCurrencyHtml = (value: any) => {
    if (typeof value !== "string") return value;
    return value
      .replace(/Rs\.?/gi, CURRENCY_SYMBOL)
      .replace(/LKR/gi, CURRENCY_SYMBOL);
  };

  // Calculate numeric discount so that:
  // Subtotal - Discount + Delivery Fee (+ Bank fee, tax, etc.) = Order Total
  const cleanCurrency = (str: any) =>
    typeof str === "string" ? str.replace(/[^0-9.]+/g, "") : "";

  const subtotalNumeric = parseFloat(cleanCurrency(order.subtotal));
  const totalNumeric = parseFloat(cleanCurrency(order.total));
  const shippingNumeric = parseFloat(cleanCurrency(order.shippingTotal));
  const discountNumericFromField = order.discountTotal
    ? parseFloat(cleanCurrency(order.discountTotal))
    : NaN;

  // Prefer the backend discountTotal when available, fall back to derived value
  let discountNumeric: number | null = null;
  if (!isNaN(discountNumericFromField)) {
    discountNumeric = discountNumericFromField;
  } else if (!isNaN(subtotalNumeric) && !isNaN(totalNumeric)) {
    discountNumeric = subtotalNumeric - (totalNumeric - (isNaN(shippingNumeric) ? 0 : shippingNumeric));
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null || isNaN(amount)) return null;
    return `${CURRENCY_SYMBOL} ${amount.toFixed(2)}`;
  };

  const formattedDiscount = formatCurrency(discountNumeric);

  const rows = [
    { label: "Order Id", value: orderId },
    { label: "Date", value: date },
    { label: "Sub Total", value: normalizeCurrencyHtml(order.subtotal) },
    {
      label: "Discount",
      value: formattedDiscount,
      condition: !!formattedDiscount,
    },
    { label: "Delivery Fee", value: normalizeCurrencyHtml(order.shippingTotal) },
    { label: "Order Total", value: normalizeCurrencyHtml(order.total) },
  ];

  return (
    <div className="my-4 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-1 py-4">

        <div className="flex flex-col justify-center items-start">
          <h1 className="text-3xl font-regural ">We{"'"}ve got your order.Thank you for choosing us.  📦</h1>
        </div>

        <div className="flex flex-col items-center gap-3 text-center justify-between w-full py-8 md:flex-row">

          {rows.map((row, index) =>
            row.condition !== false ? (
              <div key={index} className="flex flex-col items-center md:items-start ">
                <p className="font-semibold	">{row.label}</p>
                {row.label === "Order Id" ? (
                  <p className="	text-4xl font-bold">
                    <span dangerouslySetInnerHTML={{ __html: row.value || "" }} />
                  </p>
                ) : row.label === "Discount" ? (
                  <p className="mt-1 text-emerald-600">
                    -<span dangerouslySetInnerHTML={{ __html: row.value || "" }} />
                  </p>
                ) : (
                  <p className="mt-1">
                    <span dangerouslySetInnerHTML={{ __html: row.value || "" }} />{" "}
                  </p>
                )}
              </div>
            ) : null
          )}

        </div>

        {order.couponLines?.nodes?.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-emerald-700">
            <span className="font-semibold">Coupon applied:</span>
            {order.couponLines.nodes.map((couponLine: any) => (
              <span
                key={couponLine.code}
                className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium"
              >
                <span className="uppercase">{couponLine.code}</span>
                {couponLine.discount && (
                  <span className="ml-2">
                    (<span
                      dangerouslySetInnerHTML={{ __html: couponLine.discount }}
                    />{" "}
                    off)
                  </span>
                )}
              </span>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

type ProductTableProps = {
  lineItems?: any[];
  orderData?: any;
  paymentDetails?: any;
};

const ProductTable = ({ lineItems, orderData, paymentDetails }: ProductTableProps) => {
  if (!lineItems) return null;

  // Handle both orderData.order and orderData.checkout.order structures
  const order = orderData?.order || orderData?.checkout?.order;
  const CURRENCY_SYMBOL = "₨";

  return (
    <div className="max-w-5xl mx-auto">
      <div>
        <p className="text-2xl text-left pb-4">Order Details</p>
      </div>
      <div className="w-full">
        <div className="flex flex-col overflow-hidden">
          <div className="overflow-x-auto">

            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 ">
              <thead className="text-lg bg-gray-200 py-2 texy-primaryColor ">
                <tr>
                  <th scope="col" className="px-6 py-3 text-center font-medium">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-center font-medium">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-center font-medium">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {lineItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 text-left py-4 font-medium text-gray-800 dark:text-gray-200">
                      {item?.product?.node?.name || item?.product?.name || 'Product'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200">
                      {item?.quantity}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap text-gray-800 dark:text-gray-200">
                      {CURRENCY_SYMBOL} {item?.subtotal}
                    </td>
                  </tr>
                ))}
                {(() => {
                  const cleanString = (str: any) => str?.replace(/[^0-9.]+/g, "");

                  const subtotal = order?.subtotal;
                  const total = order?.total;
                  const shippingTotal = order?.shippingTotal;
                  const discountTotal = order?.discountTotal;

                  const subtotalNumeric = parseFloat(cleanString(subtotal));
                  const totalNumeric = parseFloat(cleanString(total));
                  const shippingNumeric = parseFloat(cleanString(shippingTotal));
                  const discountNumeric = discountTotal
                    ? parseFloat(cleanString(discountTotal))
                    : 0;

                  const rows: any[] = [];

                  // Discount row (from coupons)
                  if (discountNumeric > 0) {
                    rows.push(
                      <tr key="discount">
                        <td className="px-6 text-left py-4 font-medium text-gray-800 dark:text-gray-200">
                          Discount
                        </td>
                        <td></td>
                        <td className="px-6 text-right py-4 font-medium text-emerald-600 dark:text-emerald-300">
                          -{CURRENCY_SYMBOL} {discountNumeric.toFixed(2)}
                        </td>
                      </tr>
                    );
                  }

                  // Shipping row
                  rows.push(
                    <tr key="shipping">
                      <td className="px-6 text-left py-4  font-medium text-gray-800 dark:text-gray-200">
                        Shipping
                      </td>
                      <td></td>
                      <td className="px-6 text-right py-4  font-medium text-gray-800 dark:text-gray-200">
                        <span dangerouslySetInnerHTML={{ __html: order?.shippingTotal || '₨ 0.00' }} />
                      </td>
                    </tr>
                  );

                  // Bank charge row (e.g. card fee)
                  const expectedTotal = subtotalNumeric - discountNumeric + shippingNumeric;
                  const bankCharge = totalNumeric - expectedTotal;
                  if (bankCharge > 0) {
                    rows.push(
                      <tr key="bankCharge">
                        <td className="px-6 text-left py-4 font-medium text-gray-800 dark:text-gray-200">
                          3% Bank Charge
                        </td>
                        <td></td>
                        <td className="px-6 text-right py-4 font-medium text-gray-800 dark:text-gray-200">
                          ₨ {bankCharge.toFixed(2)}
                        </td>
                      </tr>
                    );
                  }

                  return rows;
                })()}

                <tr>
                  <td className="px-6 text-left py-4  font-medium text-gray-800 dark:text-gray-200">
                    Total
                  </td>
                  <td></td>
                  <td className="px-6 text-right py-4 font-medium text-gray-800 dark:text-gray-200">
                    <span dangerouslySetInnerHTML={{ __html: order?.total || '' }} />
                  </td>
                </tr>
              </tbody>
            </table>

          </div>
        </div>
      </div>

      <div className="pt-8">
        <p className="text-2xl text-left">Billing Address</p>
        <div className="mt-8 border rounded">
          <div className="text-left p-4 break-words whitespace-pre-wrap">
            {`${paymentDetails.billingAddress1}  ${paymentDetails.billingAddress2}`}
          </div>
        </div>
      </div>


    </div>
  );
};

export default ProductTable;
