import { getOrderShippingRowLabel } from "@/components/account/accountOrderUtils";
import { isLineItemFree, parseWooMoneyAmount } from "@/lib/cartLinePricing";
import { currencySymbol, formatPrice, toDisplayCurrency } from "@/lib/formatPrice";

type PaymentAddressDetails = {
  first_name?: string | null;
  last_name?: string | null;
  billingAddress1?: string | null;
  billingAddress2?: string | null;
  billingaddress1?: string | null;
  billingaddress2?: string | null;
  city?: string | null;
  country?: string | null;
};

const SECTION_TITLE_CLASS =
  "font-albra text-xl font-semibold uppercase text-header-green sm:text-2xl";

const SUMMARY_CARD_CLASS =
  "rounded-2xl border border-[#E8E8E8] bg-white p-5";

const TABLE_WRAPPER_CLASS =
  "overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white";

function isPlaceholderAddressPart(value: string | undefined | null): boolean {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return normalized === "" || normalized.startsWith("no_") || normalized === "n/a";
}

function formatPaymentAddress(
  details?: PaymentAddressDetails | null,
): string {
  if (!details) return "-";

  const billingLine1 = details.billingAddress1 ?? details.billingaddress1;
  const billingLine2 = details.billingAddress2 ?? details.billingaddress2;

  const lines = [
    [details.first_name, details.last_name]
      .filter((part) => part && !isPlaceholderAddressPart(part))
      .join(" ")
      .trim(),
    billingLine1,
    billingLine2,
    details.city,
    details.country,
  ].filter((part) => part && !isPlaceholderAddressPart(part));

  return lines.length > 0 ? lines.join("\n") : "-";
}

function formatMoneyValue(value: string | number | null | undefined): string {
  if (value == null || value === "") return `${currencySymbol} 0.00`;
  if (typeof value === "number") return formatPrice(value);
  return toDisplayCurrency(value) || `${currencySymbol} 0.00`;
}

interface OrderDetailsProps {
  orderData?: {
    order: {
      date?: string | null;
      orderNumber?: string | number | null;
      databaseId?: number | null;
      id?: string | null;
      total?: string | null;
      subtotal?: string | null;
      shippingTotal?: string | null;
      customerNote?: string | null;
      deliveryType?: string | null;
      shippingMethodLabel?: string | null;
      metaData?: Array<{ key?: string | null; value?: string | null } | null> | null;
      shippingLines?: {
        nodes?: Array<{
          methodTitle?: string | null;
          shippingMethod?: { id?: string | null; title?: string | null } | null;
        } | null> | null;
      } | null;
      lineItems?: {
        nodes?: LineItem[] | null;
      } | null;
    };
  } | null;
}

type LineItem = {
  product: { node: { name?: string | null } };
  quantity?: number | null;
  total?: string | null;
  subtotal?: string | null;
};

export const OrderDetails = ({ orderData }: OrderDetailsProps) => {
  if (!orderData) return null;

  const date = orderData.order.date
    ? new Date(orderData.order.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  const orderNumber =
    orderData.order.orderNumber ??
    orderData.order.databaseId ??
    orderData.order.id ??
    "-";

  const rows = [
    { label: "Order Id", value: String(orderNumber), isOrderId: true },
    { label: "Date", value: date },
    { label: "Order Total", value: formatMoneyValue(orderData.order.total) },
    { label: "Delivery Fee", value: formatMoneyValue(orderData.order.shippingTotal) },
    { label: "Sub Total", value: formatMoneyValue(orderData.order.subtotal) },
  ];

  return (
    <div>
      <p className="text-sm font-semibold text-header-green">Order confirmed</p>
      <h1 className="mt-2 font-albra text-2xl font-semibold uppercase leading-tight text-[#092412] sm:text-3xl">
        We&apos;ve got your order. Thank you for choosing us. 📦
      </h1>

      <div className={`mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 ${SUMMARY_CARD_CLASS}`}>
        {rows.map((row) => (
          <div key={row.label} className="min-w-0 text-left">
            <p className="text-sm font-semibold text-slate-600">{row.label}</p>
            {row.isOrderId ? (
              <p className="mt-1 text-3xl font-bold text-[#092412]">{row.value}</p>
            ) : (
              <p
                className="mt-1 text-sm font-medium text-[#092412] sm:text-base [&_*]:inline"
                dangerouslySetInnerHTML={{ __html: row.value }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

type ProductTableProps = {
  lineItems?: LineItem[];
  orderData?: OrderDetailsProps["orderData"];
  paymentDetails?: PaymentAddressDetails | null;
};

const ProductTable = ({
  lineItems,
  orderData,
  paymentDetails,
}: ProductTableProps) => {
  if (!lineItems) return null;

  const subtotalNumeric = parseWooMoneyAmount(orderData?.order?.subtotal);
  const totalNumeric = parseWooMoneyAmount(orderData?.order?.total);
  const shippingNumeric = parseWooMoneyAmount(orderData?.order?.shippingTotal);
  const bankCharge =
    (Number.isFinite(totalNumeric) ? totalNumeric : 0) -
    (Number.isFinite(subtotalNumeric) ? subtotalNumeric : 0) -
    (Number.isFinite(shippingNumeric) ? shippingNumeric : 0);
  const shippingRowLabel = orderData?.order
    ? getOrderShippingRowLabel(orderData.order)
    : "Shipping";

  return (
    <div className="mt-10 space-y-8">
      <div>
        <h2 className={SECTION_TITLE_CLASS}>Order Details</h2>
        <div className={`mt-4 ${TABLE_WRAPPER_CLASS}`}>
          <div className="max-sm:overflow-x-auto">
            <table className="w-full divide-y divide-[#E8E8E8] max-sm:table-fixed">
              <colgroup className="sm:hidden">
                <col />
                <col className="w-12" />
                <col className="w-28" />
              </colgroup>
              <thead className="bg-header-cream text-sm font-semibold text-header-green sm:text-base">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left font-semibold sm:px-6 sm:py-3">
                    Product
                  </th>
                  <th scope="col" className="w-16 px-2 py-3 text-center font-semibold sm:w-28 sm:px-4">
                    <span className="sm:hidden">Qty</span>
                    <span className="hidden sm:inline">Quantity</span>
                  </th>
                  <th scope="col" className="w-32 px-3 py-3 text-right font-semibold sm:w-40 sm:px-6">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E8] text-slate-800">
                {lineItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-3 py-3 text-left align-top break-words text-sm font-medium leading-snug sm:px-6 sm:py-4 sm:text-base">
                      {item?.product.node.name}
                    </td>
                    <td className="px-2 py-3 text-center align-top text-sm whitespace-nowrap sm:px-4 sm:py-4 sm:text-base">
                      {item?.quantity}
                    </td>
                    <td className="px-3 py-3 text-right align-top text-sm whitespace-nowrap font-medium sm:px-6 sm:py-4 sm:text-base">
                      {isLineItemFree(item?.total, item?.subtotal) ? (
                        <span className="font-semibold text-header-green">Free</span>
                      ) : (
                        formatPrice(
                          parseWooMoneyAmount(item?.total ?? item?.subtotal) || 0,
                        )
                      )}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="px-3 py-3 font-medium sm:px-6 sm:py-4">
                    {shippingRowLabel}
                  </td>
                  <td />
                  <td className="px-3 py-3 text-right text-sm whitespace-nowrap font-medium [&_*]:inline sm:px-6 sm:py-4 sm:text-base">
                    <span
                      dangerouslySetInnerHTML={{
                        __html:
                          formatMoneyValue(orderData?.order?.shippingTotal) ||
                          `${currencySymbol} 0.00`,
                      }}
                    />
                  </td>
                </tr>

                {bankCharge > 0 && (
                  <tr>
                    <td className="px-3 py-3 font-medium sm:px-6 sm:py-4">3% Bank Charge</td>
                    <td />
                    <td className="px-3 py-3 text-right whitespace-nowrap font-medium sm:px-6 sm:py-4">
                      {formatPrice(bankCharge)}
                    </td>
                  </tr>
                )}

                <tr className="bg-[#FAFAF8]/60">
                  <td className="px-3 py-3 font-semibold text-[#092412] sm:px-6 sm:py-4">Total</td>
                  <td />
                  <td className="px-3 py-3 text-right text-sm font-semibold whitespace-nowrap text-[#092412] [&_*]:inline sm:px-6 sm:py-4 sm:text-base">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: formatMoneyValue(orderData?.order?.total),
                      }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <h2 className={SECTION_TITLE_CLASS}>Billing Address</h2>
        <div className={`mt-4 whitespace-pre-line ${SUMMARY_CARD_CLASS} text-slate-700`}>
          {formatPaymentAddress(paymentDetails)}
        </div>
      </div>
    </div>
  );
};

export default ProductTable;
