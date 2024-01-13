"use client"
import {OrderPaymentPageProps} from "@/data/types";
import {useQuery} from "@apollo/client";
import {GET_SINGLE_ORDER} from "@/graphql/defs/order"


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
    <div className="container rounded-3xl lg:p-20 text-center mt-4">

      <div className="flex flex-col justify-center gap-4 items-start">
        <h1 className="text-3xl font-regural ">We've got your order. Thank you for choosing us.
        </h1>
      </div>

      <div className="flex flex-row justify-between w-full py-12">

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
        <p className="text-2xl text-left">Order Details</p>
      </div>


      <div className="my-2">
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
                          <tr>
                            <td className="px-6 text-left py-4  font-medium text-gray-800 dark:text-gray-200">
                              Shipping
                            </td>
                            <td className="px-6 text-left py-4  font-medium text-gray-800 dark:text-gray-200">
                              Collection from Store:
                              148/1,
                              Vihara Mawatha,
                              Kolonnawa,
                              Wellampitiya,
                              Western,
                              10600
                              dadasd
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 text-left py-4  font-medium text-gray-800 dark:text-gray-200">
                              Total
                            </td>
                            <td></td>
                            <td className="px-6 text-left py-4  font-medium text-gray-800 dark:text-gray-200">
                              රු209,700.00
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
        <p className="text-2xl text-left">Billing Address</p>
        <div className="mt-8 border rounded" >
          <div className="w-1/5 p-4 ">
            sada asdas
            zxczxc
            asdasd
            zxczxc
            10800
          </div>
        </div>
      </div>

      <div className="py-8">
        <p className="text-2xl text-left">Our Bank Details</p>
        <div className="" >
          <h1 className="text-xl py-8 text-left ">GQ Mobile</h1>

          <ul className="list-disc pl-4 ">
            <li className="mb-2 text-left "><strong className="text-gray-600">Bank:</strong> Commercial</li>
            <li className="mb-2 text-left "><strong className="text-gray-600">Account number:</strong> 34312421543545</li>
            <li className="mb-2 text-left "><strong className="text-gray-600">Sort code:</strong> fsefsa</li>
            <li className="mb-2 text-left "><strong className="text-gray-600">IBAN:</strong> asdfadsfasd</li>
            <li className="mb-2 text-left "><strong className="text-gray-600">BIC:</strong> fsadfsdfasdf</li>
          </ul>

        </div>
      </div>

    </div>
  );
};

export default ThankYouPage;
