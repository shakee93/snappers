"use client"
import { BadgeCheck } from "lucide-react";
import { OrderPaymentPageProps } from "@/data/types";
import { useQuery } from "@apollo/client";
import {
  GET_SINGLE_ORDER
} from "@/graphql/defs/order"


const ThankYouPage = ({ params }: OrderPaymentPageProps) => {
  const dummyProducts = [
    { name: "Product A", quantity: 2, price: 20 },
    { name: "Product B", quantity: 1, price: 15 },
    { name: "Product C", quantity: 3, price: 25 },
  ];

  // const orderId = params['order-id'];
  const orderId = "b3JkZXI6NjQzOA==";

  const { loading, error, data, refetch } = useQuery(GET_SINGLE_ORDER, {
    variables: {
      orderID: orderId,
    }
  });


  return (
    <div className="container rounded-3xl lg:p-20 text-center mt-10">
      <div className="flex flex-col justify-center gap-4 items-center text-green-600">
        <BadgeCheck size={80} className="" />
        <h1 className="text-3xl font-regural ">Thank You for Your Purchase!</h1>
        <p className="text-lg mb-2">Your order has been successfully placed.</p>
      </div>

      <div className="my-4 ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 py-4">
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

          {/* customer details */}

          <div className="flex flex-col justify-start">
            <span className="text-center text-primaryColor bg-gray-200 py-2 text-lg font-semibold">
              Customer details:
            </span>
            <table className="text-base divide-y divide-gray-200">
              <tr className="border-1 border-gray-400">
                <td className="border-1 border-gray-400 px-6 py-2 text-left whitespace-nowrap  font-medium text-gray-800 dark:text-gray-200">
                  Customer Name
                </td>
                <td className="px-6 py-2 text-right whitespace-nowrap  font-medium text-gray-800 dark:text-gray-200">
                  John Vijay
                </td>
              </tr>
              <tr className="border-1 border-gray-400">
                <td className="px-6 py-2 text-left whitespace-nowrap  font-medium text-gray-800 dark:text-gray-200">
                  Contact Number
                </td>
                <td className="px-6 py-2  text-right whitespace-nowrap font-medium text-gray-800 dark:text-gray-200">
                  0761234567
                </td>
              </tr>
              <tr className="border-1 border-gray-400">
                <td className="px-6 py-2 text-left whitespace-nowrap  font-medium text-gray-800 dark:text-gray-200">
                  Email Address
                </td>
                <td className="px-6 py-2  text-right whitespace font-medium text-gray-800 dark:text-gray-200">
                  vijay@gmail.com
                </td>
              </tr>
              <tr className="border-1 border-gray-400">
                <td className="px-6 py-2 text-left whitespace-nowrap  font-medium text-gray-800 dark:text-gray-200">
                  Address
                </td>
                <td className="px-6 py-2  text-right whitespace font-medium text-gray-800 dark:text-gray-200">
                  250, vihara mawatha, kolonnawa
                </td>
              </tr>
              <tr className="border-1 border-gray-400">
                <td className="px-6 py-2 text-left whitespace-nowrap  font-medium text-gray-800 dark:text-gray-200">
                  City
                </td>
                <td className="px-6 py-2  text-right whitespace-nowrap font-medium text-gray-800 dark:text-gray-200">
                  Kolonnawa
                </td>
              </tr>
              
            </table>
          </div>
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
                          {data?.order.lineItems?.nodes?.map((item : any, index: any) => (
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
          <div></div>
        </div>
      </div>
      <p className="text-center text-primaryColor text-xl font-semibold mb-5">Thank you for shopping with us!</p>
    </div>
  );
};

export default ThankYouPage;
