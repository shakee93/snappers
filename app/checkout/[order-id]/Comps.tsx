import React from "react";

interface OrderDetailsProps {
  orderData: any;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ orderData }) => {
  if (!orderData) return null;

  const rows = [
    { label: "Order Id", value: orderData.order.orderNumber ?? "Not found" },
    { label: "Date", value: orderData.orderDate ?? "2024/1/1" },
    { label: "Order Total", value: orderData.order.total },
    {
      label: "Discount",
      value: orderData.order.total - orderData.order.subtotal,
      condition: orderData.order.total - orderData.order.subtotal > 0,
    },
    { label: "Delivery Fee", value: orderData.order.shippingTax },
    { label: "Sub Total", value: orderData.order.subtotal },
  ];

  return (
    <div className="my-4">
      <div className="grid grid-cols-1 lg:grid-cols-1 py-4">

        <div className="flex flex-col justify-center items-start">
          <h1 className="text-3xl font-regural ">We{"'"}ve got your order.  Thank you for choosing us.  📦</h1>
        </div>

        <div className="flex flex-row justify-between w-full py-8">

          {rows.map((row, index) =>
            row.condition !== false ? (
              <div key={index} className="flex flex-col items-start">
                <p className="font-semibold	">{row.label}</p>
                <p className="mt-1">{row.value}</p>
              </div>
            ) : null
          )}

        </div>

      </div>
    </div>
  );
};

type ProductTableProps = {
  lineItems: any[];
  orderData: any;
  paymentDetails: any;
};

const ProductTable: React.FC<ProductTableProps> = ({ lineItems, orderData, paymentDetails }) => {
  if (!lineItems) return null;

  return (
    <>
      <div>
        <p className="text-2xl text-left pb-4">Order Details</p>
      </div>
      <div className="w-full">
        <div className="flex flex-col">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
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
                      {item?.subtotal}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="px-6 text-left py-4  font-medium text-gray-800 dark:text-gray-200">
                    Shipping
                  </td>
                  <td></td>
                  <td className="px-6 text-right py-4  font-medium text-gray-800 dark:text-gray-200">
                    {paymentDetails.address}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 text-left py-4  font-medium text-gray-800 dark:text-gray-200">
                    Total
                  </td>
                  <td></td>
                  <td className="px-6 text-right py-4 font-medium text-gray-800 dark:text-gray-200">
                    {orderData.order?.total}
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
            <p>{paymentDetails.billingAddress2}</p>
            <p>{paymentDetails.billingAddress}</p>
          </div>
        </div>
      </div>


    </>
  );
};

export default ProductTable;
