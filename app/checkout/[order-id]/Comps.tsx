import React from "react";

interface OrderDetailsProps {
  orderData: any;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ orderData }) => {
  if (!orderData) return null;

  console.log(orderData);

  const subtotalValue = parseFloat(orderData.order.subtotal.replace(/[^0-9.-]+/g, ''));
  const totalValue = parseFloat(orderData.order.total.replace(/[^0-9.-]+/g, ''));

  const shippingCharges = totalValue - subtotalValue;

  const rows = [
    { label: 'Order Id', value: orderData.order.orderNumber ?? 'Not found' },
    { label: 'Order Total', value: orderData.order.subtotal },
    { label: 'Discount', value: orderData.order.total - orderData.order.subtotal, condition: orderData.order.total - orderData.order.subtotal > 0 },
    { label: 'Delivery Fee', value: shippingCharges ?  "රු" + shippingCharges : "රු" + 0  },
    { label: 'Sub Total', value: orderData.order.total }
  ];

  return (
    <div className="my-4">
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-20 py-4">
        <div className="flex flex-col justify-start">
          <span className="text-center text-primaryColor bg-gray-200 py-2 text-lg font-semibold">
            Order details
          </span>
          <table className="text-base divide-y divide-gray-200">
            {rows.map((row, index) =>
              row.condition !== false ? (
                <tr key={index} className="border-1 border-gray-200">
                  <td className="px-6 py-2 text-left whitespace-nowrap font-medium text-gray-800 dark:text-gray-200">
                    {row.label}
                  </td>
                  <td className="px-6 py-2 text-right whitespace-nowrap font-medium text-gray-800 dark:text-gray-200">
                    {row.value}
                  </td>
                </tr>
              ) : null
            )}
          </table>
        </div>
      </div>
    </div>
  );
};


type ProductTableProps = {
  lineItems: any[];
};

const ProductTable: React.FC<ProductTableProps> = ({ lineItems }) => {
  if (!lineItems) return null;

  return (
    <div className="w-full py-10">
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductTable;
