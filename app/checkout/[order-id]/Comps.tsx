import React from "react";

interface OrderDetailsProps {
  orderData: any;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ orderData }) => {
  if (!orderData) return null;
  
  const date = orderData.order.date ? orderData.order.date.substring(0, 10) : "2024/01/01";

  const rows = [
    { label: "Order Id", value: orderData.order.orderNumber ?? "Not found" },
    { label: "Date", value: date },
    { label: "Order Total", value: orderData.order.total },
    {
      label: "Discount",
      value: orderData.order.total - orderData.order.subtotal,
      condition: orderData.order.total - orderData.order.subtotal > 0,
    },
    { label: "Delivery Fee", value: orderData.order.shippingTotal },
    { label: "Sub Total", value: orderData.order.subtotal },
  ];

  return (
    <div className="my-4">
      <div className="grid grid-cols-1 lg:grid-cols-1 py-4">

        <div className="flex flex-col justify-center items-start">
          <h1 className="text-3xl font-regural ">We{"'"}ve got your order.Thank you for choosing us.  📦</h1>
        </div>

        <div className="flex flex-col items-center gap-3 text-center justify-between w-full py-8 md:flex-row">

          {rows.map((row, index) =>
            row.condition !== false ? (
              <div key={index} className="flex flex-col items-center md:items-start ">
                <p className="font-semibold	">{row.label}</p>
                {row.label == "Order Id" ? <p className="	text-4xl font-bold"><span dangerouslySetInnerHTML={{ __html: row.value || '' }} /></p> : <p className="mt-1"><span dangerouslySetInnerHTML={{ __html: row.value || '' }} /> </p>}
              </div>
            ) : null
          )}

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

const ProductTable: React.FC<ProductTableProps> = ({ lineItems, orderData, paymentDetails }) => {
  if (!lineItems) return null;

  // console.log('orderData', orderData);

  return (
    <>
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
                      {item?.product.node.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200">
                      {item?.quantity}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap text-gray-800 dark:text-gray-200">
                      Rs. {item?.subtotal}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="px-6 text-left py-4  font-medium text-gray-800 dark:text-gray-200">
                    Shipping
                  </td>
                  <td></td>
                  <td className="px-6 text-right py-4  font-medium text-gray-800 dark:text-gray-200">
                    {`${paymentDetails.shippingAddress1}  ${paymentDetails.shippingAddress2}`}
                  </td>
                </tr>

                {orderData?.order?.customerNote !== null ? (
                  <tr>
                    <td className="px-6 text-left py-4 font-medium text-gray-800 dark:text-gray-200">
                      {orderData?.order?.shippingTotal === "₨&nbsp;500.00" ? 'Delivery Fee' : '3% Bank Charge'}
                    </td>
                    <td></td>
                    <td className="px-6 text-right py-4 font-medium text-gray-800 dark:text-gray-200">
                      {(() => {
                        const cleanString = (str: any) => str?.replace(/[^0-9.]+/g, "");

                        const subtotal = orderData?.order?.subtotal
                        const total = orderData?.order?.total

                        const subtotalNumeric = parseFloat(cleanString(subtotal));
                        const totalNumeric = parseFloat(cleanString(total));

                        const difference = totalNumeric - subtotalNumeric;

                        return `₨ ${difference.toFixed(2)}`;
                      })()}
                    </td>
                  </tr>
                ) : null}

                <tr>
                  <td className="px-6 text-left py-4  font-medium text-gray-800 dark:text-gray-200">
                    Total
                  </td>
                  <td></td>
                  <td className="px-6 text-right py-4 font-medium text-gray-800 dark:text-gray-200">
                    <span dangerouslySetInnerHTML={{ __html: orderData.order?.total || '' }} />
                  </td>
                </tr>
              </tbody>
            </table>

          </div>
        </div>
      </div>

      <div className="pt-8">
        <p className="text-2xl text-left">Billing Address</p>
        <div className="mt-8 border rounded" >
          <div className="text-left p-4 ">
            {`${paymentDetails.billingAddress1}  ${paymentDetails.billingAddress2}`}
          </div>
        </div>
      </div>


    </>
  );
};

export default ProductTable;
