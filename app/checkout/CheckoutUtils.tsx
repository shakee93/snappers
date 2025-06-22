import { LineItem } from "@/graphql/types/graphql";

export const createProductList = (orderData: any): LineItem[] | null => {
  if (!orderData) return null;
  console.log("orderData in createProductList", orderData);
  const productArray = orderData?.order?.lineItems?.nodes?.map((item: any) => {
    const productNode = item.variation
      ? item.variation.node
      : item.product.node;
    const productName = productNode.name;

    return productName;
  });

  // Convert array into a comma-separated string
  return productArray.join(", ");
};

interface ProductTableRowsProps {
  lineItems: LineItem[];
}

export const ProductTableRows: React.FC<ProductTableRowsProps> = ({
  lineItems,
}) => (
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
          Rs. {item?.subtotal ?? 0}
        </td>
      </tr>
    ))}
  </>
);
