import {
  getOrderFeeAmount,
  getOrderShippingRowLabel,
  ORDER_SERVICE_CHARGE_LABEL,
} from "@/components/account/accountOrderUtils";
import { isLineItemFree, parseWooMoneyAmount } from "@/lib/cartLinePricing";
import { currencySymbol, formatPrice, toDisplayCurrency } from "@/lib/formatPrice";
import { pageSectionTitleClass, pageTitleClass } from "@/lib/sectionTypography";
import { cn } from "@/lib/utils";

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

const SECTION_TITLE_CLASS = `${pageSectionTitleClass} uppercase sm:text-2xl`;

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

  const feeAmount = getOrderFeeAmount(orderData.order);

  // Listed in the order they add up to the total.
  const breakdown = [
    { label: "Subtotal", value: formatMoneyValue(orderData.order.subtotal) },
    { label: "Delivery fee", value: formatMoneyValue(orderData.order.shippingTotal) },
    ...(feeAmount > 0
      ? [{ label: ORDER_SERVICE_CHARGE_LABEL, value: formatPrice(feeAmount) }]
      : []),
  ];

  return (
    <div>
      <p className="text-sm font-semibold text-header-green">Order confirmed</p>
      <h1 className={cn(pageTitleClass, "mt-2 text-2xl uppercase sm:text-3xl")}>
        We&apos;ve got your order. Thank you for choosing us. 📦
      </h1>

      <div
        className={cn(
          SUMMARY_CARD_CLASS,
          "mt-8 flex flex-col gap-6 sm:p-6 md:flex-row md:items-stretch md:gap-0",
        )}
      >
        <dl className="flex flex-wrap gap-x-10 gap-y-4 md:w-2/5 md:flex-col md:justify-center md:border-r md:border-[#E8E8E8] md:pr-8">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Order number
            </dt>
            <dd className="mt-1 text-3xl font-bold text-[#092412]">#{String(orderNumber)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Date
            </dt>
            <dd className="mt-1 text-sm font-medium text-[#092412] sm:text-base">{date}</dd>
          </div>
        </dl>

        <dl className="flex-1 border-t border-[#E8E8E8] pt-5 text-sm sm:text-base md:border-t-0 md:pl-8 md:pt-0">
          {breakdown.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-4 py-1.5">
              <dt className="text-slate-600">{row.label}</dt>
              <dd
                className="whitespace-nowrap font-medium text-[#092412] [&_*]:inline"
                dangerouslySetInnerHTML={{ __html: row.value }}
              />
            </div>
          ))}
          <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-dashed border-[#D9D9D9] pt-3">
            <dt className="font-semibold text-[#092412]">Order total</dt>
            <dd
              className="whitespace-nowrap text-xl font-bold text-header-green sm:text-2xl [&_*]:inline"
              dangerouslySetInnerHTML={{ __html: formatMoneyValue(orderData.order.total) }}
            />
          </div>
        </dl>
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

  const feeAmount = orderData?.order ? getOrderFeeAmount(orderData.order) : 0;
  const shippingRowLabel = orderData?.order
    ? getOrderShippingRowLabel(orderData.order)
    : "Shipping";

  const itemCount = lineItems.reduce((sum, item) => sum + (item?.quantity ?? 0), 0);

  // Same order as the summary card above, so the two read alike.
  const breakdown = [
    { label: "Subtotal", value: formatMoneyValue(orderData?.order?.subtotal) },
    {
      label: "Delivery",
      hint: shippingRowLabel,
      value: formatMoneyValue(orderData?.order?.shippingTotal),
    },
    ...(feeAmount > 0
      ? [{ label: ORDER_SERVICE_CHARGE_LABEL, value: formatPrice(feeAmount) }]
      : []),
  ];

  return (
    <div className="mt-10 space-y-8">
      <div>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className={SECTION_TITLE_CLASS}>Order Details</h2>
          <span className="text-sm font-medium text-slate-500">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </div>

        <div className={`mt-4 ${TABLE_WRAPPER_CLASS}`}>
          <ul className="divide-y divide-[#E8E8E8]">
            {lineItems.map((item, index) => (
              <li
                key={index}
                className="flex items-start justify-between gap-4 px-4 py-4 sm:px-6"
              >
                <div className="min-w-0">
                  <p className="break-words text-sm font-medium leading-snug text-[#092412] sm:text-base">
                    {item?.product.node.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    Qty {item?.quantity ?? 0}
                  </p>
                </div>
                <p className="shrink-0 whitespace-nowrap text-sm font-semibold text-[#092412] sm:text-base">
                  {isLineItemFree(item?.total, item?.subtotal) ? (
                    <span className="text-header-green">Free</span>
                  ) : (
                    formatPrice(
                      parseWooMoneyAmount(item?.total ?? item?.subtotal) || 0,
                    )
                  )}
                </p>
              </li>
            ))}
          </ul>

          <dl className="border-t border-[#E8E8E8] bg-[#FAFAF8] px-4 py-4 text-sm sm:px-6 sm:text-base">
            {breakdown.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 py-1.5">
                <dt className="text-slate-600">
                  {row.label}
                  {row.hint && row.hint !== row.label && (
                    <span className="ml-1.5 text-xs text-slate-400 sm:text-sm">
                      ({row.hint})
                    </span>
                  )}
                </dt>
                <dd
                  className="whitespace-nowrap font-medium text-[#092412] [&_*]:inline"
                  dangerouslySetInnerHTML={{ __html: row.value }}
                />
              </div>
            ))}
            <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-dashed border-[#D9D9D9] pt-3">
              <dt className="font-semibold text-[#092412]">Total</dt>
              <dd
                className="whitespace-nowrap text-lg font-bold text-header-green sm:text-xl [&_*]:inline"
                dangerouslySetInnerHTML={{ __html: formatMoneyValue(orderData?.order?.total) }}
              />
            </div>
          </dl>
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
