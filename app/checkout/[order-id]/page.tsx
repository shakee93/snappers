"use client";
import { OrderPaymentPageProps } from "@/data/types";
import { useQuery } from "@apollo/client";
import { GET_SINGLE_ORDER } from "@/graphql/defs/order";
import PayhereBase from "@/app/components/Payhere/Base";

export default function OrderPaymentPage({ params }: OrderPaymentPageProps) {
  const orderId = params["order-id"];

  const { loading, error, data, refetch } = useQuery(GET_SINGLE_ORDER, {
    variables: {
      orderID: orderId,
    },
  });

  console.log({ data });

  return (
    <div className="container rounded-3xl lg:p-20 text-center mt-10">
      <div className="my-4 ">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-20 py-4">
          <div className="flex flex-col justify-start">
            <span className="text-center text-primaryColor bg-gray-200 py-2 text-lg font-semibold">
              Order details:
            </span>
            <table className="text-base divide-y divide-gray-200">
              <tr className="border-1 border-gray-400">
                <td className="border-1 border-gray-400 px-6 py-2 text-left whitespace-nowrap  font-medium text-gray-800 dark:text-gray-200">
                  Order Id
                </td>
                <td className="px-6 py-2 text-right whitespace-nowrap  font-medium text-gray-800 dark:text-gray-200">
                  {data?.order.orderNumber}
                </td>
              </tr>
              <tr className="border-1 border-gray-400">
                <td className="px-6 py-2 text-left whitespace-nowrap  font-medium text-gray-800 dark:text-gray-200">
                  Order Total
                </td>
                <td className="px-6 py-2  text-right whitespace-nowrap font-medium text-gray-800 dark:text-gray-200">
                  {data?.order.total}
                </td>
              </tr>
              <tr className="border-1 border-gray-400">
                <td className="px-6 py-2 text-left whitespace-nowrap  font-medium text-gray-800 dark:text-gray-200">
                  Discount
                </td>
                <td className="px-6 py-2  text-right whitespace-nowrap font-medium text-gray-800 dark:text-gray-200">
                  $30
                </td>
              </tr>
              <tr className="border-1 border-gray-400">
                <td className="px-6 py-2 text-left whitespace-nowrap  font-medium text-gray-800 dark:text-gray-200">
                  Delivery Fee
                </td>
                <td className="px-6 py-2  text-right whitespace-nowrap font-medium text-gray-800 dark:text-gray-200">
                  {data?.order.shippingTax}
                </td>
              </tr>
              <tr className="border-1 border-gray-400">
                <td className="px-6 py-2 text-left whitespace-nowrap  font-medium text-gray-800 dark:text-gray-200">
                  Sub Total
                </td>
                <td className="px-6 py-2  text-right whitespace-nowrap font-medium text-gray-800 dark:text-gray-200">
                  {data?.order.subtotal}
                </td>
              </tr>
            </table>
          </div>
        </div>

        <div className="pt-6">
          <button className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">
            {data?.order.paymentMethod === "payhere" ? "Continue with PayHere" : "Continue with Bank Transfer"}
          </button>
        </div>

        <div>
          <div className="w-full py-10">
            <div className="flex flex-col">
              <div className="flex flex-col">
                <div className="-m-1.5 overflow-x-auto">
                  <div className="p-1.5 min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="text-lg bg-gray-200 py-2 texy-primaryColor ">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-center  font-medium"
                            >
                              Product
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-center  font-medium"
                            >
                              Quantity
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-center  font-medium "
                            >
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {data?.order.lineItems?.nodes?.map((item: any, index: any) => (
                            <tr key={index}>
                              <td className="px-6 text-left py-4  font-medium text-gray-800 dark:text-gray-200">
                                {item?.product.node.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap  text-gray-800 dark:text-gray-200">
                                {item?.product.node.quantity}
                              </td>
                              <td className="px-6 py-4 text-right whitespace-nowrap  text-gray-800 dark:text-gray-200">
                                ${item?.subtotal}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
