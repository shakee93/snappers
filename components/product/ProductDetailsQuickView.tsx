"use client";
import Link from "next/link";
import ProductAddToCart from "./ProductAddToCart";
import {
  Brand,
  PaCapacity,
  Attribute,
  ProductAttribute,
  ProductVariation,
  SimpleProduct,
  VariableProduct,
  VariationAttribute,
} from "@/graphql/types/graphql";
import { useCallback, useEffect, useState } from "react";
import { useStore } from "@/store/store";
import { twMerge } from "tailwind-merge";
import { useImage } from "@/context/ImageChangeGrabber";
import AttributeIcon from "@/components/global/primitives/AttributeIcon";

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
  } = useStore();

  const { setVariationId } = useImage();

  const [activeVariation, setActiveVariation] = useState<any>(
    product?.variations?.nodes[0]
  );
  const [activeOption, setActiveOption] = useState(
    !!product?.variations?.nodes?.length
      ? product?.variations?.nodes[0].attributes?.nodes[0].value
      : null
  );

  // Change only in Quick View

  useEffect(() => {
    if (activeVariation == null) {
      setActiveVariation(product?.variations?.nodes[0]);
      // setActiveOption(product?.variations?.nodes[0].attributes?.nodes[0].value)
    } else {
      // console.log("active variation is on");
    }

    let stockStatus = activeVariation?.stockStatus !== "IN_STOCK";
    // console.log("stock status: ", stockStatus);
  }, [activeVariation]);

  //

  useEffect(() => {
    if (product?.type === "VARIABLE") {
      const defAttributes = product?.defaultAttributes?.nodes;
      product?.attributes?.nodes.map((attr: ProductAttribute) => {
        setAttribute(attr, (attr?.options && attr?.options[0]) || "");
      });
      defAttributes?.forEach((defAttr: VariationAttribute) => {
        setAttribute(defAttr, defAttr.value || "");
      });
    }
  }, []);

  const activeAttr = useCallback(
    (attr: ProductAttribute) => {
      return attribute.find((a) => a.name === attr.name);
    },
    [attribute]
  );

  useEffect(() => {
    if (
      product?.type === "VARIABLE" &&
      product?.variations?.nodes?.length !== undefined &&
      product?.variations.nodes.length > 0
    ) {
      setActiveVariation(product?.variations?.nodes[0]);
    } else if (product?.type === "SIMPLE") {
      // Handle simple product case
      setActiveVariation(product);
    }
  }, [product]);

  useEffect(() => {
    if (product?.type === "VARIABLE") {
      let variation = (product as VariableProduct).variations
        ?.nodes as unknown as ProductVariation[];
      let vProduct = variation.find((v) => {
        let nodes = v.attributes?.nodes as unknown as VariationAttribute[];
        let attrKey = attribute.map((a) => `${a.name}:${a.val}`).join("+");
        let variationKey = nodes?.map((a) => `${a.name}:${a.value}`).join("+");
        return attrKey === variationKey;
      });

      if (vProduct) {
        setActiveVariation(vProduct);
      }
      //   else {
      //     setActiveVariation(null);
      //   }
    }
  }, [attribute]);

  useEffect(() => {
    const lowestPriceInStockVariation: any | undefined =
      product.variations?.nodes
        .filter((v: ProductVariation) => v.stockStatus === "IN_STOCK")
        .reduce((lowest: any, v: any | undefined) => {
          const currentPrice = parseFloat(v?.rawPrice || "0");
          const lowestPrice = parseFloat(lowest?.rawPrice || "Infinity");
          return currentPrice < lowestPrice ? v : lowest;
        }, undefined as ProductVariation | undefined);
    // if (lowestPriceInStockVariation) {
    //   console.log(
    //     `Lowest price in-stock variation: ${lowestPriceInStockVariation.name} at ${lowestPriceInStockVariation.rawPrice}`,
    //   );
    // } else {
    //   console.log("No in-stock variations available.");
    // }

    if (lowestPriceInStockVariation) {
      lowestPriceInStockVariation.attributes?.nodes.forEach(
        (attr: Attribute) => {
          const option = attr.value;
          setAttribute(attr, option || "");
        }
      );
      if (lowestPriceInStockVariation?.image) {
        setActiveVariation(lowestPriceInStockVariation);
        setVariationId(
          lowestPriceInStockVariation?.image.databaseId.toString()
        );
      } else {
        const firstVariation = product?.variations?.nodes[0];
        if (firstVariation) {
          setActiveVariation(firstVariation); // Fallback to the first variation if none are in stock
          setVariationId(firstVariation?.image?.databaseId.toString());
        }
      }
    }
  }, []);

  return (
    <div className="space-y-0">
      <div className="flex gap-1  text-sm text-gray-500">
        Brand : <span className="">{brand?.name}</span>
      </div>

      <div className="text-base md:text-lg font-medium py-4">
        {product?.name} - {product?.databaseId}
      </div>

      {/* {product.shortDescription && (
                <div className="text-xs md:text-sm text-gray-600">
                    {parseHtml(product.shortDescription || "")}
                </div>
            )} */}

      {product?.type === "VARIABLE" && (
        <>


          {product.attributes?.nodes.map(
            (attr: ProductAttribute, index: number) => (
              <div key={index} className="py-2 text-gray-500">
                <div className="flex items-center gap-1 py-2 text-sm">
                  <span className="text-primary-500 flex items-center gap-1">
                    <AttributeIcon name={attr?.name || ""} className="w-4" />
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

                <ul className="flex flex-wrap items-center gap-2 text-sm">
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
                        onClick={() => {
                          // Set the first in-stock variation as the active variation

                          //   "attirbute is clicked",
                          //   firstInStockVariation?.attributes,
                          //   firstInStockVariation?.attributes?.nodes[0].name
                          // );

                          // option = firstInStockVariation?.attributes?.nodes[1].value || ""

                          setAttribute(attr, option || "");
                        }}
                        className={twMerge(
                          "relative inline-block cursor-pointer rounded border bg-gray-200/80 px-3.5 py-2 text-xs text-black md:text-sm",
                          activeAttr(attr)?.val === option &&
                          "border-primary-500 text-primary-500 bg-white shadow-md",
                          allOutOfStock && "diag-line bg-gray-100 text-gray-500"
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

      {product?.type === "VARIABLE" && activeVariation ? (
        <div>
          <div className="flex gap-4 text-base py-2 flex-wrap md:text-lg font-medium text-gray-600">
            {/* <span>{activeVariation.price}</span> */}
            <span dangerouslySetInnerHTML={{ __html: activeVariation.price }} />

            {!!activeVariation.salePrice &&
              activeVariation.salePrice !== activeVariation.regularPrice && (
                <span className="text-red-400">
                  {/*  {activeVariation.regularPrice} */}
                  <s dangerouslySetInnerHTML={{ __html: activeVariation?.regularPrice }} />
                </span>
              )}
          </div>
        </div>
      ) : (
        <div className="flex gap-2 text-base py-2 flex-wrap md:text-lg font-medium text-gray-600">
          {/* <span>{product?.price}</span> */}
          <span dangerouslySetInnerHTML={{ __html: product?.price || '' }} />

          {!!product?.salePrice &&
            product?.salePrice !== product?.regularPrice && (
              <span className="text-red-400">
                {/*  {product?.regularPrice} */}
                <s dangerouslySetInnerHTML={{ __html: product?.regularPrice || '' }} />
              </span>
            )}
        </div>
      )}

      {product?.type === "SIMPLE" && product?.stockStatus !== "IN_STOCK" && (
        <div className="w-max px-4 bg-red-200  text-center rounded-full  text-gray-800 text-xs md:text-sm py-1">
          Sold Out
        </div>
      )}

      {product?.type === "VARIABLE" &&
        activeVariation?.stockStatus !== "IN_STOCK" && (
          <div className="w-max px-4 bg-red-200  text-center rounded-full  text-gray-800 text-xs md:text-sm py-1">
            Sold Out
          </div>
        )}

      <ProductAddToCart product={product} variation={activeVariation} />
      <div className="flex gap-1 items-center text-sm md:text-base text-gray-500">
        <div className="text-sm py-2">Category:</div>
        {product?.productCategories?.edges
          ? product?.productCategories?.edges.map(
            (category: any, index: number) => (
              <Link
                href={`/collections/${category.node.slug}`}
                key={index}
                className="bg-primary-100 inline-block py-1 px-2  text-xs md:text-sm rounded-3xl"
              >
                {category.node.name}
              </Link>
            )
          )
          : product?.productCategories?.nodes.map(
            (category: any, index: number) => (
              <Link
                href={`/collections/${category.slug}`}
                key={index}
                className="bg-primary-100 inline-block py-1 px-2  text-xs md:text-sm rounded-3xl"
              >
                {category.name}
              </Link>
            )
          )}
      </div>
    </div>
  );
};

export default ProductDetails;
