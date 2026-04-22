import { LineItem } from "@/graphql/types/graphql";
import { isLineItemFree, stripHtmlMoney } from "@/lib/cartLinePricing";

export const createProductList = (orderData: any): LineItem[] | null => {
  if (!orderData) return null;
  const productArray = orderData?.order?.lineItems?.nodes?.map((item: any) => {
    const productNode = item.variation
      ? item.variation.node
      : item.product.node;
    const productName = productNode.name;

    return productName;
  });
  return productArray.join(", ");
};

interface ProductTableRowsProps {
  lineItems: LineItem[];
}

export const ProductTableRows = ({
  lineItems,
}: ProductTableRowsProps) => (
  <>
    {lineItems.map((item: LineItem, index: number) => (
      <tr key={index}>
        <td className="px-6 text-left py-4 font-medium text-gray-800 dark:text-gray-200">
          {item.variation
            ? item.variation.node?.name
            : item.product?.node?.name || "No product name found"}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center text-gray-800 dark:text-gray-200">
          {item?.quantity ?? 0}
        </td>
        <td className="px-6 py-4 text-right whitespace-nowrap text-gray-800 dark:text-gray-200">
          {isLineItemFree(item?.total, item?.subtotal) ? (
            <span className="font-semibold text-green-600">Free</span>
          ) : (
            <>Rs. {stripHtmlMoney(item?.total ?? item?.subtotal ?? 0)}</>
          )}
        </td>
      </tr>
    ))}
  </>
);
