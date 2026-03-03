import { Product } from "@/graphql/types/graphql";
import { Accordion, AccordionItem } from "@nextui-org/react";
import React from "react";

import {
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

interface ProductDescriptionProps {
  product: Product;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({ product }) => {
  const applyListStyleDisc = (htmlContent: string) => {
    return htmlContent.replace(/<ul>/g, '<ul class="list-disc pb-4 sm">');
  };

  const isProductWarranty = (product?.allPaWarranty?.nodes?.length ?? 0) > 0;
  const insideTheBoxMeta = product?.metaData?.find(meta => meta?.key === 'inside_the_box');
  const insideTheBoxValue = insideTheBoxMeta?.value || '';

  const manualMeta = product?.metaData;

  const warrantyType = manualMeta?.find(
    (item) => item?.key === "warranty_type"
  )?.value;
  const warrantyPeriod = manualMeta?.find(
    (item) => item?.key === "warranty_period"
  )?.value;

  // Format warranty period: map WordPress option keys to display names
  const formatWarrantyPeriod = (period: string | null | undefined): string => {
    if (!period || period === null || period === "null" || period.trim() === "") {
      return "Not Applicable";
    }

    const periodTrimmed = period.trim();

    // Mapping of WordPress option keys to display names
    const warrantyPeriodMap: Record<string, string> = {
      "0 Month": "N/A",
      "1 Month": "1 month",
      "3 Months": "3 months",
      "6 Months": "6 months",
      "12 Months": "12 months",
      "18 Months": "18 months",
      "24 Months": "24 months",
      "3 Years": "3 years",
      "4 Years": "4 years",
      "5 Years": "5 years",
      "Life Time": "Life Time",
      "12M Software Includes 06M hardware": "12M Software Includes 6M hardware",
    };

    // Check if the period matches a key in our map (exact match)
    if (warrantyPeriodMap[periodTrimmed]) {
      return warrantyPeriodMap[periodTrimmed];
    }

    // Handle case-insensitive matching for "Life Time"
    const periodLower = periodTrimmed.toLowerCase();
    if (periodLower === "life time" || periodLower === "lifetime") {
      return "Life Time";
    }

    // If already formatted correctly (contains "months" or "years" in lowercase), return as is
    if (periodTrimmed.match(/\d+\s+(month|months|year|years)/i)) {
      // Normalize to lowercase for consistency
      return periodTrimmed.toLowerCase();
    }

    // Try to parse as number and format
    const numericMatch = periodTrimmed.match(/^(\d+)$/);
    if (numericMatch) {
      const months = parseInt(numericMatch[1], 10);
      if (months === 0) {
        return "N/A";
      }
      if (months >= 12 && months % 12 === 0) {
        const years = months / 12;
        return `${years} ${years === 1 ? "year" : "years"}`;
      }
      return `${months} ${months === 1 ? "month" : "months"}`;
    }

    // Fallback: return as is (might already be formatted)
    return periodTrimmed;
  };

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
          {!warrantyType && <hr className="mt-2 border-gray-300" />}
        </div>
      )}

      {(warrantyType || warrantyPeriod) && (
        <div>
          
          {product.shortDescription && <hr className="mt-2 border-gray-300" />}
          <Accordion>
            <AccordionItem key="1" aria-label="Warranty" title="Warranty">
              {!isProductWarranty && <div className="flex flex-row items-center space-x-2 pb-1 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1b40af" className="size-6">
                  <path fill-rule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" />
                </svg>
                <span className="">Warranty Type :</span>{" "}
                <span>{warrantyType === "Not Applicable" ? "Not Applicable" : `${warrantyType} Warranty`}</span>
              </div>}
              {warrantyPeriod && (
                <div className="flex flex-row items-center space-x-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1b40af" className="size-6">
                    <path fill-rule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" />
                  </svg>
                  <span>Warranty period :</span>{" "}
                  <span>
                    {formatWarrantyPeriod(warrantyPeriod)}
                  </span>
                </div>
              )}
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
