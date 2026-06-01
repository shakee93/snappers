"use client";
import { OrderPaymentPageProps } from "@/data/types";
import { isLineItemFree, stripHtmlMoney } from "@/lib/cartLinePricing";
import { siteConfig } from "@/site.config";
import { useOrderById } from "@/hooks/useOrderById";

const ThankYouPage = ({ params }: OrderPaymentPageProps) => {
  // const dummyProducts = [
  //   { name: "Product A", quantity: 2, price: 20 },
  //   { name: "Product B", quantity: 1, price: 15 },
  //   { name: "Product C", quantity: 3, price: 25 },
  // ];

  // const orderId = params['order-id'];
  const orderId = "b3JkZXI6NjQzOA==";

  const { loading, error, data, refetch } = useOrderById(orderId);

  return (
    <div className="container mt-4 rounded-3xl text-center lg:p-20">
      <div className="flex flex-col items-start justify-center gap-4">
        <h1 className="font-regural text-3xl ">
          We{"'"}ve got your order. Thank you for choosing us.
        </h1>
      </div>

      <div className="flex w-full flex-row justify-between py-12">
        <div className="flex flex-col items-start">
          <p className="font-semibold	">Order Number:</p>
          <p className="mt-1">6485</p>
        </div>

        <div className="flex flex-col items-start">
          <p className="font-semibold	">Date</p>
          <p className="mt-1">2024/10/11</p>
        </div>

        <div className="flex flex-col items-start">
          <p className="font-semibold	">Total:</p>
          <p className="mt-1">රු209,700.00</p>
        </div>

        <div className="flex flex-col items-start">
          <p className="font-semibold	">Email: </p>
          <p className="mt-1">azeezs2012@gmail.com</p>
        </div>

        <div className="flex flex-col items-start">
          <p className="font-semibold	">Payment method:</p>
          <p className="mt-1">Direct bank transfer</p>
        </div>
      </div>

      <div>
        <p className="text-left text-2xl">Order Details</p>
      </div>

      <div className="my-2">
        <div>
          <div className="w-full py-10">
            <div className="flex flex-col">
              <div className="flex flex-col">
                <div className="-m-1.5 overflow-x-auto">
                  <div className="inline-block min-w-full p-1.5 align-middle">
                    <div className="overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="texy-primaryColor bg-gray-200 py-2 text-lg ">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-center font-medium"
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
                          {data?.order.lineItems?.nodes?.map(
                            (item: any, index: any) => (
                              <tr key={index}>
                                <td className="px-6 py-4 text-left  font-medium text-gray-800 dark:text-gray-200">
                                  {item?.product.node.name}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4  text-gray-800 dark:text-gray-200">
                                  {item?.product.node.quantity}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right  text-gray-800 dark:text-gray-200">
                                  {isLineItemFree(item?.total, item?.subtotal) ? (
                                    <span className="font-semibold text-green-600">
                                      Free
                                    </span>
                                  ) : (
                                    <>${stripHtmlMoney(item?.total ?? item?.subtotal)}</>
                                  )}
                                </td>
                              </tr>
                            ),
                          )}
                          <tr>
                            <td className="px-6 py-4 text-left  font-medium text-gray-800 dark:text-gray-200">
                              Shipping
                            </td>
                            <td className="px-6 py-4 text-left  font-medium text-gray-800 dark:text-gray-200">
                              Collection from Store: 148/1, Vihara Mawatha,
                              Kolonnawa, Wellampitiya, Western, 10600 dadasd
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 text-left  font-medium text-gray-800 dark:text-gray-200">
                              Total
                            </td>
                            <td></td>
                            <td className="px-6 py-4 text-left  font-medium text-gray-800 dark:text-gray-200">
                              Rs.209,700.00
                            </td>
                          </tr>
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

      <div>
        <p className="text-left text-2xl">Billing Address</p>
        <div className="mt-8 rounded border">
          <div className="w-full p-4 break-words whitespace-pre-wrap">
            sada asdas zxczxc asdasd zxczxc 10800
          </div>
        </div>
      </div>

      <div className="py-8">
        <p className="text-left text-2xl">Our Bank Details</p>
        <div className="">
          <h1 className="py-8 text-left text-xl ">{siteConfig.brand.name}</h1>

          <ul className="list-disc pl-4 ">
            <li className="mb-2 text-left ">
              <strong className="text-gray-600">Bank:</strong> Commercial
            </li>
            <li className="mb-2 text-left ">
              <strong className="text-gray-600">Account number:</strong>{" "}
              34312421543545
            </li>
            <li className="mb-2 text-left ">
              <strong className="text-gray-600">Sort code:</strong> -
            </li>
            <li className="mb-2 text-left ">
              <strong className="text-gray-600">IBAN:</strong> -
            </li>
            <li className="mb-2 text-left ">
              <strong className="text-gray-600">BIC:</strong> -
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
