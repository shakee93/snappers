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


  const insideTheBoxMeta = product?.metaData?.find(meta => meta?.key === 'inside_the_box');
  const insideTheBoxValue = insideTheBoxMeta?.value || ''; // Default to an empty string if undefined

  const manualMeta = product?.metaData;

  const warrantyType = manualMeta?.find(
    (item) => item?.key === "warranty_type"
  )?.value;
  const warrantyPeriod = manualMeta?.find(
    (item) => item?.key === "warranty_period"
  )?.value;

  // Step 2: Format the value as a list
  const formatInsideTheBox = (value: string): string => {
    if (!value) return '';

    // Split by '\r\n', remove empty items, and capitalize the first letter of each word
    const items = value.split(/\r?\n/).map(item => item.trim()).filter(Boolean);

    // Create an unordered list using Tailwind for styling and capitalize the first letter of each word
    return `<ul class="list-disc pl-5 text-gray-600">${items
      .map(item => `<li class="mb-1 capitalize">${item}</li>`)
      .join('')}</ul>`;
  };

  return (
    <>
      {product.shortDescription && (
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
      )}

      {warrantyType && warrantyPeriod && (
        <div>
          {!product.shortDescription && <hr className="mt-2 border-gray-300" />}
          <Accordion>
            <AccordionItem key="1" aria-label="Warranty" title="Warranty">
              <div className="pb-1">
                <span className="font-medium">Warranty Type :</span>{" "}
                {warrantyType}
              </div>
              <div className="">
                <span className="font-medium">Warranty period :</span>{" "}
                {warrantyPeriod} Months
              </div>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {insideTheBoxValue && (
        <div>
          <hr className="border-gray-300" />
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
