"use client";

import { Disclosure } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import parseHtml from "html-react-parser";
import { Product } from "@/graphql/types/graphql";
import ProductSpecifications from "@/components/product/ProductSpecifications";

interface ProductPurchaseAccordionsProps {
  product: Product;
}

const panelClass =
  "px-4 pb-4 pt-1 text-sm leading-relaxed text-[#4B5563]";

const ProductPurchaseAccordions = ({ product }: ProductPurchaseAccordionsProps) => {
  const manualMeta = product?.metaData;
  const techSpecDataObject = manualMeta?.find((item) => item?.key === "tech_spec_data");
  const techValue = product.metaData?.find((meta) => meta?.key === "tech_spec")?.value;
  const techSpecs = techValue ? JSON.parse(techValue) : null;
  const parsedMetaData = techSpecDataObject?.value
    ? JSON.parse(techSpecDataObject.value)
    : null;
  const manualTechSpecs = parsedMetaData ? Object.entries(parsedMetaData) : [];

  const styleListItems = (htmlContent: string) =>
    htmlContent?.replace(/<ul/g, '<ul class="list-disc pl-5 space-y-1"');

  const descriptionHtml = product.shortDescription
    ? styleListItems(product.shortDescription)
    : product.description
      ? styleListItems(product.description.slice(0, 1200))
      : "";

  const sections = [
    {
      name: "Product Information",
      content: descriptionHtml ? (
        <div className="prose prose-sm max-w-none">{parseHtml(descriptionHtml)}</div>
      ) : (
        <p>No additional product information available.</p>
      ),
    },
    {
      name: "Delivery & Returns",
      content: (
        <div className="space-y-3">
          <p>
            Island-wide delivery available. Orders are typically dispatched within
            1–2 business days.
          </p>
          <p>
            See our{" "}
            <Link href="/delivery-details" className="font-medium text-[#38461F] underline">
              delivery details
            </Link>{" "}
            and{" "}
            <Link href="/return-policy" className="font-medium text-[#38461F] underline">
              return policy
            </Link>{" "}
            for full terms.
          </p>
        </div>
      ),
    },
  ];

  if (
    (techSpecs?.items?.length ?? 0) > 0 ||
    (manualTechSpecs?.length ?? 0) > 0
  ) {
    sections.splice(1, 0, {
      name: "Specifications",
      content: (
        <ProductSpecifications techspecs={techSpecs} manualSpecs={manualTechSpecs} />
      ),
    });
  }

  return (
    <div className="space-y-2">
      {sections.map((section) => (
        <Disclosure key={section.name} defaultOpen={section.name === "Product Information"}>
          {({ open }) => (
            <div className="overflow-hidden rounded-xl border border-[#E8E8E8] bg-white">
              <Disclosure.Button className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-semibold text-[#1A1A1A]">
                {section.name}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[#6B7280] transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className={panelClass}>{section.content}</Disclosure.Panel>
            </div>
          )}
        </Disclosure>
      ))}
    </div>
  );
};

export default ProductPurchaseAccordions;
