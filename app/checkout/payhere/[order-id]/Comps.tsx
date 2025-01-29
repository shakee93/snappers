import { PayhereStatus, PaymentDetailsWithoutUrls } from "@/data/types";
import { usePayhere } from "@/app/components/Payment/Payhere";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import React, { useState } from "react";

import { toast } from "sonner";
import Link from "next/link";

interface OrderDetailsProps {
  orderData: any;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ orderData }) => {
  if (!orderData) return null;

  const formatCurrency = (value: string) => {
    return value.replace("&nbsp;", " ");
  };

  const rows = [
    { label: "Order Id", value: orderData?.order_id ?? "Not found" },
    { label: "Date", value: new Date().toLocaleDateString() },
    { label: "Order Total", value: formatCurrency(orderData?.amount ?? "N/A") },
    {
      label: "Shipping Fee",
      value: formatCurrency(orderData?.shippingTotal ?? "N/A"),
    },
    { label: "Sub Total", value: formatCurrency(orderData?.subtotal ?? "N/A") },
  ];

  return (
    <div className="my-4">
      <div className="grid grid-cols-1 lg:grid-cols-1 py-4">
        <div className="flex flex-col justify-center items-start">
          <h1 className="text-3xl font-regural">
            We{"'"}ve got your order. Proceed with Payment.
          </h1>
        </div>

        <div className="flex flex-col items-center gap-3 text-center justify-between w-full py-8 md:flex-row">
          {rows.map((row, index) => (
            <div
              key={index}
              className="flex flex-col items-center md:items-start"
            >
              <p className="font-semibold">{row.label}</p>
              {row.label === "Order Id" ? (
                <p className="text-4xl font-bold">{row.value}</p>
              ) : (
                <p
                  className="mt-1"
                  dangerouslySetInnerHTML={{ __html: row.value }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

type ProductTableProps = {
  lineItems?: any;
  orderData?: any;
  paymentDetails?: any;
};

const ProductTable: React.FC<ProductTableProps> = ({
  lineItems,
  orderData,
}) => {
  if (!lineItems || !orderData) return null;

  const formatAddress = (type: "shipping" | "billing") => {
    const address1 =
      type === "shipping"
        ? orderData.shippingAddress1
        : orderData.billingAddress1;
    const address2 =
      type === "shipping"
        ? orderData.shippingAddress2
        : orderData.billingAddress2;

    return `${orderData.first_name} ${orderData.last_name}
            ${address1}
            ${address2 ? address2 : ""}
            ${orderData.city}
            ${orderData.country}`.trim();
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
                {lineItems.map((item: any, index: any) => (
                  <tr key={index}>
                    <td className="px-6 text-left py-4 font-medium text-gray-800 dark:text-gray-200">
                      {item?.product?.node?.name ??
                        "Product name not available"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-800 dark:text-gray-200">
                      {item?.quantity ?? 0}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap text-gray-800 dark:text-gray-200">
                      Rs. {item?.subtotal ?? 0}
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
                        __html: orderData.shippingTotal,
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
                      dangerouslySetInnerHTML={{ __html: orderData.total }}
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
          <div className="text-left p-4">{formatAddress("billing")}</div>
        </div>
      </div>

      <div className="pt-8">
        <p className="text-2xl text-left">Shipping Address</p>
        <div className="mt-8 border rounded">
          <div className="text-left p-4">{formatAddress("shipping")}</div>
        </div>
      </div>
    </>
  );
};

export const PaymentSection = ({ orderData }: any) => {
  const [payhereStatus, setPayhereStatus] = useState<PayhereStatus>("idle");
  const initiatePayment = usePayhere();

  const handlePayherePayment = async () => {
    try {
      const rawAmount = orderData.total.replace(/[^0-9.]/g, "");
      console.log("order data in payhere", orderData);
      const paymentDetails: PaymentDetailsWithoutUrls = {
        order_id: orderData.order_id,
        items: orderData.items,
        amount: rawAmount,
        first_name: orderData.first_name,
        last_name: orderData.last_name,
        email: orderData.email,
        phone: orderData.phone || "0771234567",
        address:
          orderData.billingAddress1 ||
          orderData.billingAddress2 ||
          orderData.shippingAddress1 ||
          orderData.shippingAddress2 ||
          "No Address Provided",

        city: orderData.city,
      };
      console.log("paymentDetails", paymentDetails);
      return;

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
          Payment successful!
        </p>
        <Link href="/" passHref>
          <ButtonPrimary className="mt-4">Return to Home</ButtonPrimary>
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex justify-center">
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
