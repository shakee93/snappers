"use client";
import { OrderPaymentPageProps } from "@/data/types";
import { useQuery } from "@apollo/client";
import {
  GET_SINGLE_ORDER
} from "@/graphql/defs/order"

export default function OrderPaymentPage({ params }: OrderPaymentPageProps) {
  const orderId = params['order-id'];

  const { loading, error, data, refetch } = useQuery(GET_SINGLE_ORDER, {
    variables: {
      orderID: orderId,
    }
  });

  console.log('order Details', data)

  return (
    <div className="px-12">

      <div className="w-full py-4 text-3xl">
        <h1>Thank You. Your order has been received</h1>
      </div>

      <div className="w-full flex flex-row py-4">
        <div className="w-1/5">
          <div className="font-bold">Order Number:</div>
          <div>{data?.order.orderNumber}</div>
        </div>

        <div className="w-1/5">
          <div className="font-bold">Date:</div>
          <div>{data?.order.date}</div>
        </div>

        <div className="w-1/5">
          <div className="font-bold">Total:</div>
          <div>{data?.order.total}</div>
        </div>

        <div className="w-1/5">
          <div className="font-bold">Email:</div>
          <div></div>
        </div>

        <div className="w-1/5">
          <div className="font-bold">Payment Method:</div>
          <div>{data?.order.paymentMethod}</div>
        </div>

      </div>

      <div className="w-full py-4">
        <p className="pt-2 pb-6 text-2xl">Order Details</p>
        <div className="">
          <table className="w-full ">
            <thead className="text-left pb-6">
              <tr>
                <th className="py-4">Products</th>
                <th className="py-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {/* Loop through the products array */}
              {data?.order.lineItems?.nodes?.map((item: string, index: any) => (
                <tr className="mb-4" key={index}>
                  {/* <td>{item?.product.node.name}</td>
                  <td>{item?.subtotal}</td> */}
                </tr>
              ))}
              <tr className="h-4">
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td className="py-4">Shipping</td>
                <td>{data?.order.shippingTax}</td>
              </tr>
              <tr className="py-4	">
                <td  className="py-2">Total</td>
                <td>{data?.order.total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

}
