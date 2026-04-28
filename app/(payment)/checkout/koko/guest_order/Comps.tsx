import { PayhereStatus, PaymentDetailsWithoutUrls } from "@/data/types";
import { usePayhere } from "@/app/components/Payment/Payhere";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { createProductList } from "../../CheckoutUtils";
import { isLineItemFree, stripHtmlMoney } from "@/lib/cartLinePricing";

interface OrderDetailsProps {
  orderData: any;
}

export const OrderDetails = ({ orderData }: OrderDetailsProps) => {
  if (!orderData) return null;

  const date = orderData?.order?.date
    ? new Date(orderData.order.date).toLocaleDateString()
    : "N/A";

  const rows = [
    { label: "Order Id", value: orderData?.order?.databaseId ?? "Not found" },
    { label: "Date", value: date },
    { label: "Order Total", value: orderData?.order?.total ?? "N/A" },
    {
      label: "Shipping Fee",
      value: orderData?.order?.shippingTotal ?? "N/A",
    },
    { label: "Sub Total", value: orderData?.order?.subtotal ?? "N/A" },
  ];

  return (
    <div className="my-4">
      <div className="grid grid-cols-1 lg:grid-cols-1 py-4">
        <div className="flex flex-col justify-center items-start">
          <h1 className="text-3xl font-regural">Your Order Review</h1>
        </div>

        <div className="flex flex-col items-center gap-3 text-center justify-between w-full py-8 md:flex-row">
          {rows.map((row, index) => (
            <div
              key={index}
              className="flex flex-col items-center md:items-start"
            >
              <p className="font-semibold">{row.label}</p>
              {row.label === "Order Id" ? (
                <p className="text-4xl font-bold">
                  {typeof row.value === "string" ? (
                    <span dangerouslySetInnerHTML={{ __html: row.value }} />
                  ) : (
                    row.value
                  )}
                </p>
              ) : (
                <p className="mt-1">
                  {typeof row.value === "string" ? (
                    <span dangerouslySetInnerHTML={{ __html: row.value }} />
                  ) : (
                    row.value
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

type ProductTableProps = {
  lineItems?: any[];
  orderData?: any;
  paymentDetails?: any;
};

const ProductTable = ({ lineItems, orderData }: ProductTableProps) => {
  if (!lineItems || !orderData) return null;

  const customer = orderData?.customer;
  const shippingAddress = customer?.shipping;
  const billingAddress = customer?.billing;

  const formatAddress = (address: any) => {
    if (!address) return "Address not available";
    return `${address.firstName} ${address.lastName}
            ${address.address1}
            ${address.address2 ? address.address2 : ""}
            ${address.city}
            ${address.country}`.trim();
  };

  return (
    <>
      <div>
        <p className="text-2xl text-left pb-4">Order Details</p>
      </div>
      <div className="w-full">
        <div className="flex flex-col overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="text-lg bg-gray-200 py-2 texy-primaryColor">
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
                      {item?.product?.node?.name ??
                        "Product name not available"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-800 dark:text-gray-200">
                      {item?.quantity ?? 0}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap text-gray-800 dark:text-gray-200">
                      {isLineItemFree(item?.total, item?.subtotal) ? (
                        <span className="font-semibold text-green-600">
                          Free
                        </span>
                      ) : (
                        <>Rs. {stripHtmlMoney(item?.total ?? item?.subtotal ?? 0)}</>
                      )}
                    </td>
                  </tr>
                ))}

                <tr>
                  <td className="px-6 text-left py-4 font-medium text-gray-800 dark:text-gray-200">
                    Shipping
                  </td>
                  <td></td>
                  <td className="px-6 text-right py-4 font-medium text-gray-800 dark:text-gray-200">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: orderData.order?.shippingTotal || "N/A",
                      }}
                    />
                  </td>
                </tr>

                <tr>
                  <td className="px-6 text-left py-4 font-medium text-gray-800 dark:text-gray-200">
                    Total
                  </td>
                  <td></td>
                  <td className="px-6 text-right py-4 font-medium text-gray-800 dark:text-gray-200">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: orderData.order?.total || "N/A",
                      }}
                    />
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
          <div className="text-left p-4">{formatAddress(billingAddress)}</div>
        </div>
      </div>

      <div className="pt-8">
        <p className="text-2xl text-left">Shipping Address</p>
        <div className="mt-8 border rounded">
          <div className="text-left p-4">{formatAddress(shippingAddress)}</div>
        </div>
      </div>
    </>
  );
};

export const PaymentSection = ({ orderData, email }: any) => {
  const [payhereStatus, setPayhereStatus] = useState<PayhereStatus>("idle");
  const initiatePayment = usePayhere();

  const handlePayherePayment = async () => {
    try {
      const rawAmount = orderData.order.total.replace(/[^0-9.]/g, "");

      const paymentDetails: PaymentDetailsWithoutUrls = {
        order_id: orderData.order.databaseId.toString(),
        items: createProductList(orderData) || [],
        amount: rawAmount,
        first_name:
          orderData.customer.billing.firstName ||
          orderData.customer.shipping.firstName,
        last_name:
          orderData.customer.billing.lastName ||
          orderData.customer.shipping.lastName,
        email: orderData.customer.billing.email,
        phone: orderData.customer.billing.phone || "0771234567",
        address: `${orderData.customer.billing.address1} ${
          orderData.customer.billing.address2 || ""
        }`.trim(),
        city: orderData.customer.billing.city,
      };

      await initiatePayment(paymentDetails, setPayhereStatus);
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error("Failed to initiate payment");
    }
  };

  if (payhereStatus === "loading") {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-lg font-medium">Processing payment...</p>
      </div>
    );
  }

  if (payhereStatus === "error") {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center">
        <p className="text-lg font-medium text-red-800">Payment failed</p>
        <ButtonPrimary onClick={handlePayherePayment} className="mt-4">
          Try Again
        </ButtonPrimary>
      </div>
    );
  }

  if (payhereStatus === "finished") {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-center">
        <p className="text-lg font-medium text-green-800">
          Payment successful!. Our team will Review this and proceed order
        </p>
        <Link href="/">
          <ButtonPrimary className="mt-4">Return to Home</ButtonPrimary>
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">
          Secure Payment Powered By
        </h3>
        <p className="text-sm my-2 text-gray-600 text-center">
          Your order details have been sent to your email address: {email}
        </p>
        <div className="flex justify-center">
          <img
            src="https://www.payhere.lk/downloads/images/payhere_square_banner_dark.png"
            alt="PayHere"
            className="h-auto w-[200px]"
          />
        </div>
        <p className="mt-4 text-sm text-gray-600 text-center">
          We accept Visa, Mastercard, and local payment methods through PayHere
        </p>
      </div>
      <div className="flex justify-center mt-4">
        <ButtonPrimary
          onClick={handlePayherePayment}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Complete Payment with Payhere
        </ButtonPrimary>
      </div>
    </div>
  );
};

export default ProductTable;
