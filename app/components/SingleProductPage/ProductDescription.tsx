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

  return (
    <div>
      <hr className="mt-2 border-gray-300" />
      <Accordion>
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
  );
};

export default ProductDescription;
