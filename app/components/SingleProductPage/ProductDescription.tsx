import { Product } from "@/graphql/types/graphql";
import { Accordion, AccordionItem } from "@nextui-org/react";
import React from "react";

interface ProductDescriptionProps {
  product: Product;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({ product }) => {
  const applyListStyleDisc = (htmlContent: string) => {
    return htmlContent.replace(/<ul>/g, '<ul class="list-disc pb-4 sm">');
  };

  console.log({ product });

  const insideTheBoxMeta = product?.metaData?.find(meta => meta?.key === 'inside_the_box');
  const insideTheBoxValue = insideTheBoxMeta?.value || ''; // Default to an empty string if undefined


  // Step 2: Format the value as a list
  const formatInsideTheBox = (value: string): string => {
    if (!value) return '';
    const items = value.split(',').map((item) => item.trim());
    return `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
  };

  return (
    <>
      <div>
        <hr className="mt-2 border-gray-300" />
        <Accordion defaultExpandedKeys={["1"]}>
          <AccordionItem key="1" aria-label="Description" title="Description">
            <div
              className="p-0 text-gray-600 md:text-sm"
              dangerouslySetInnerHTML={{
                __html: applyListStyleDisc(product.shortDescription || ""),
              }}
            />
          </AccordionItem>
        </Accordion>
        <hr className="border-gray-300" />
      </div>

      {insideTheBoxValue && (
        <div>
          <Accordion>
            <AccordionItem key="1" aria-label="What's In the Box" title="In the Box">
              <div
                className="p-0 text-gray-600 md:text-sm"
                dangerouslySetInnerHTML={{
                  __html: formatInsideTheBox(insideTheBoxValue),
                }}
              />
            </AccordionItem>
          </Accordion>
          <hr className="border-gray-300" />
        </div>
      )}

    </>
  );
};

export default ProductDescription;
