"use client";
import Link from "next/link";
import ProductAddToCart from "./ProductAddToCart";
import {
  Brand,
  PaCapacity,
  ProductAttribute,
  ProductVariation,
  SimpleProduct,
  VariableProduct,
  VariationAttribute,
} from "@/graphql/types/graphql";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "@/store/store";
import { twMerge } from "tailwind-merge";
import parseHtml from "html-react-parser";
import { useImage } from "@/context/ImageChangeGrabber";
import brandColors from "@/data/brandColors";
import AttributeIcon from "@/app/components/AttributeIcon";

const ProductDetails = ({
  product,
  brand,
}: {
  product: VariableProduct & SimpleProduct;
  brand: Brand;
}) => {
  const {
    product: { attribute },
    setAttribute,
    clearAttributes,
  } = useStore();

  const [activeVariation, setActiveVariation] = useState<any>(
    product?.variations?.nodes[0]
  );
  const [activeOption, setActiveOption] = useState(
    !!product?.variations?.nodes?.length
      ? product?.variations?.nodes[0].attributes?.nodes[0].value
      : null
  );

  const manualMeta = product?.metaData;
  const warrantyType = manualMeta?.find(
    (item) => item?.key === "warranty_type"
  )?.value;
  const warrantyPeriod = manualMeta?.find(
    (item) => item?.key === "warranty_period"
  )?.value;

  const { setVariationId } = useImage();

  useEffect(() => {
    clearAttributes();

    if (product.type === "VARIABLE") {
      const defAttributes = product?.defaultAttributes?.nodes;
      product?.attributes?.nodes.map((attr: ProductAttribute) => {
        setAttribute(attr, (attr?.options && attr?.options[0]) || "");
      });
      defAttributes?.forEach((defAttr: VariationAttribute) => {
        setAttribute(defAttr, defAttr.value || "");
      });
    }
  }, []);

  useEffect(() => {
    setVariationId(activeVariation?.image.databaseId);
    setActiveVariation(activeVariation);
  }, [activeVariation]);

  const activeAttr = useCallback(
    (attr: ProductAttribute) => {
      return attribute.find((a) => a.name === attr.name);
    },
    [attribute]
  );

  useEffect(() => {
    if (
      product.type === "VARIABLE" &&
      product?.variations?.nodes?.length !== undefined &&
      product.variations.nodes.length > 0
    ) {
      setActiveVariation(product?.variations?.nodes[0]);
    } else if (product.type === "SIMPLE") {
      // Handle simple product case
      setActiveVariation(product);
    }
  }, [product]);

  useEffect(() => {
    if (product.type === "VARIABLE" && activeVariation) {
      setVariationId(activeVariation?.image.databaseId);
      setActiveVariation(activeVariation);
    }
  }, [activeVariation]);

  useEffect(() => {
    // This function determines which is the variation for selected attributes
    if (product.type === "VARIABLE") {
      let variation = (product as VariableProduct).variations
        ?.nodes as unknown as ProductVariation[];

      let vProduct = variation.find((v) => {
        let nodes = v.attributes?.nodes as unknown as VariationAttribute[];
        let attrKey = attribute
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((a) => `${a.name}:${a.val}`)
          .join("+");
        let variationKey = (nodes || [])
          .sort((a, b) => a?.name?.localeCompare(b?.name || "") || 0)
          ?.map((a) => `${a.name}:${a.value}`)
          .join("+");

        return attrKey === variationKey;
      });

      if (vProduct) {
        setActiveVariation(vProduct);
      } else {
        setActiveVariation(null);
      }
    }
  }, [attribute, product]);

  const applyListStyleDisc = (htmlContent: any) => {
    return htmlContent.replace(/<ul>/g, '<ul class="list-disc">');
  };

  useEffect(() => {
    // console.log(attribute, product.variations?.nodes.map((v) => v.attributes.nodes));
  }, [attribute]);

  const productAttributes = useMemo(() => {
    return [];
  }, [product.attributes]);

  const brandColorClass = brand?.name && brandColors[brand?.name.toLowerCase()];
  console.log("product", product);

  return (
    <>
      <div className="flex gap-1 text-sm text-gray-500">
        <Link
          href={`/${brand?.slug}`}
          target="_blank"
          className="bg-primaryColor text-white px-2.5 py-1 rounded-xl"
        >
          {brand?.name}
        </Link>
      </div>

      <div className="text-2xl md:text-3xl font-medium ">{product.name}</div>

      <div className="flex gap-2 items-center">
        {product.type === "VARIABLE" && activeVariation ? (
          <div>
            <div className="flex items-center gap-4 text-base py-2 flex-wrap md:text-xl font-medium text-gray-600">
              <span
                dangerouslySetInnerHTML={{ __html: activeVariation.price }}
              />

              {!!activeVariation.salePrice &&
                activeVariation.salePrice !== activeVariation.regularPrice && (
                  <span className="text-red-400 line-through md:text-sm">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: activeVariation.regularPrice,
                      }}
                    />
                  </span>
                )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-base py-2 flex-wrap md:text-xl font-medium text-gray-600">
            <span dangerouslySetInnerHTML={{ __html: product.price || "" }} />

            {product.salePrice &&
              product.salePrice !== product.price &&
              activeVariation === null && (
                <span className="text-red-400 line-through md:text-sm">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: product.regularPrice || "",
                    }}
                  />
                </span>
              )}
          </div>
        )}

        {/* Sold Out Badge */}

        <div>
          {product.type === "SIMPLE" && product.stockStatus !== "IN_STOCK" && (
            <div className="w-max px-4 bg-red-200 text-center rounded-full text-gray-800 text-xs py-1.5 font-medium">
              Sold Out
            </div>
          )}

          {product.type === "VARIABLE" &&
            activeVariation?.stockStatus !== "IN_STOCK" && (
              <div className="w-max px-4 bg-red-200 text-center rounded-full text-gray-800 text-xs py-1.5 font-medium mb-1">
                Sold Out
              </div>
            )}

          {/* In Stock Badge */}

          {product.type === "VARIABLE" &&
            activeVariation?.stockStatus == "IN_STOCK" &&
            ((activeVariation?.stockQuantity &&
              activeVariation?.stockQuantity >= 3) ||
              (!activeVariation.stockQuantity &&
                activeVariation?.stockStatus === "IN_STOCK")) && (
              <div className="w-max px-4 bg-green-200 text-center rounded-full text-gray-800 text-xs py-1.5 font-medium">
                In Stock
              </div>
            )}

          {product.type === "SIMPLE" &&
            product.stockStatus === "IN_STOCK" &&
            ((product?.stockQuantity && product?.stockQuantity >= 3) ||
              (!product.stockQuantity &&
                product.stockStatus === "IN_STOCK")) && (
              <div className="w-max px-4 bg-green-200 text-center rounded-full text-gray-800 text-xs py-1.5 font-medium">
                In Stock
              </div>
            )}

          {/* Low Stock Badge */}
          {product.type === "VARIABLE" &&
            activeVariation?.stockStatus == "IN_STOCK" &&
            activeVariation?.stockQuantity &&
            activeVariation?.stockQuantity <= 2 && (
              <div className="w-max px-3 bg-yellow-200 text-center rounded-full text-gray-800 text-xs py-1.5 font-medium mb-1">
                Low Stock
              </div>
            )}

          {product.type === "SIMPLE" &&
            product.stockStatus == "IN_STOCK" &&
            product?.stockQuantity &&
            product?.stockQuantity <= 2 && (
              <div className="w-max px-4 bg-yellow-200 text-center rounded-full text-gray-800 text-xs md:text-sm py-1 mb-1">
                Low Stock
              </div>
            )}

          {warrantyType && warrantyPeriod && (
            <div className="flex flex-col gap-2 w-full items-left flex-wrap text-xs md:text-sm text-gray-500 py-2">
              <div className="">
                <span className="font-medium">Warranty Type :</span>{" "}
                {warrantyType}
              </div>
              <div className="">
                <span className="font-medium">Warranty period :</span>{" "}
                {warrantyPeriod} Months
              </div>
            </div>
          )}
        </div>
      </div>

      {product.shortDescription && (
        <div
          className="text-xs md:text-sm text-gray-600 px-6"
          dangerouslySetInnerHTML={{
            __html: applyListStyleDisc(product.shortDescription),
          }}
        />
      )}

      {product.type === "VARIABLE" && (
        <>
          {product.attributes?.nodes.map(
            (attr: ProductAttribute, index: number) => (
              <div key={index} className="py-2 text-gray-500">
                <div className="flex items-center gap-1 text-sm py-2">
                  <span className="flex gap-1 items-center text-primaryColor">
                    <AttributeIcon name={attr?.name || ""} className="w-4 " />
                    {attr.label}:
                  </span>
                  <span className="font-medium text-gray-700">
                    {
                      (product as unknown as Record<string, any>)[
                        `allPa${attr?.label as unknown as "Capacity"}`
                      ]?.nodes.find(
                        (node: PaCapacity) =>
                          node.slug === activeAttr(attr)?.val
                      )?.name
                    }
                  </span>{" "}
                </div>

                <ul className="flex gap-2 flex-wrap text-sm items-center">
                  {attr.options?.map((option, optionIndex) => {
                    // Find the variations that match the current attribute option
                    const matchingVariations = (
                      product as VariableProduct
                    ).variations?.nodes.filter((v: ProductVariation) => {
                      return v.attributes?.nodes.some(
                        (node: any) =>
                          node.name === attr.name && node.value === option
                      );
                    });

                    const allOutOfStock = matchingVariations?.every(
                      (v) => v.stockStatus !== "IN_STOCK"
                    );

                    return (
                      <li
                        key={optionIndex}
                        onClick={(e) => {
                          console.log("e");
                          setAttribute(attr, option || "");
                        }}
                        className={twMerge(
                          "border bg-gray-200/80  cursor-pointer text-black inline-block py-2 px-3.5 text-xs md:text-sm rounded relative",
                          activeAttr(attr)?.val === option &&
                            "border-primaryColor text-primaryColor bg-white shadow-md",
                          allOutOfStock &&
                            "bg-gray-100 text-gray-500 diag-line "
                        )}
                        style={{ opacity: allOutOfStock ? 0.9 : 1 }}
                        title={allOutOfStock ? "Out of stock" : ""}
                      >
                        {(product as any)[
                          `allPa${(attr?.label as unknown as "Capacity")
                            ?.split(" ")
                            .join("")}`
                        ]?.nodes.find((node: PaCapacity) => {
                          return node.slug === option;
                        })?.name || "OPTION"}
                        {/* {allOutOfStock && (
                          <span
                            className="absolute inset-0 flex items-center justify-center"
                            aria-hidden="true"
                          >
                            <span className="w-full h-0.5 bg-gray-400 transform rotate-45"></span>
                          </span>
                        )} */}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )
          )}
        </>
      )}

      <ProductAddToCart product={product} variation={activeVariation} />
      <div className="flex gap-1 w-full items-center flex-wrap text-sm md:text-base text-gray-500">
        <div className="text-sm py-2">Category:</div>
        {product.productCategories?.edges.map(
          (category: any, index: number) => (
            <Link
              href={`/collections/${category.node.slug}`}
              key={index}
              className="bg-primary-100 inline-block py-1 px-2 min-w-max text-xs md:text-sm rounded-3xl"
            >
              {category.node.name}
            </Link>
          )
        )}
      </div>
    </>
  );
};

export default ProductDetails;
