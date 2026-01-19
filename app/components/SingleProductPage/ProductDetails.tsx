/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import Link from "next/link";
import ProductAddToCart from "./ProductAddToCart";
import {
  Attribute,
  Brand,
  PaCapacity,
  ProductAttribute,
  ProductVariation,
  SimpleProduct,
  VariableProduct,
  VariationAttribute,
} from "@/graphql/types/graphql";
import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "@/store/store";
import { twMerge } from "tailwind-merge";
import { useImage } from "@/context/ImageChangeGrabber";
import brandColors from "@/data/brandColors";
import AttributeIcon from "@/app/components/AttributeIcon";
import ProductDescription from "./ProductDescription";
import {
  GET_PRICE_FLUCTUATION_NOTICE,
} from "@/graphql/defs/options";
import { useQuery } from '@apollo/client';
import koko from "@/public/koko.png";
import Image from "next/image";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
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

  const [lastClickedAttribute, setLastClickedAttribute] = useState<string | null>(null);

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
    setVariationId(activeVariation?.image?.databaseId);
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
      setVariationId(activeVariation?.image?.databaseId);
      setActiveVariation(activeVariation);
    }
  }, [activeVariation]);

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
          lowestPriceInStockVariation?.image?.databaseId.toString()
        );
      } else {
        const firstVariation = product?.variations?.nodes[0];
        if (firstVariation) {
          setActiveVariation(firstVariation); // Fallback to the first variation if none are in stock
          setVariationId(firstVariation?.image?.databaseId?.toString());
        }
      }
    }
  }, []);

  useEffect(() => {
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

      // Debounce update of activeVariation
      let timeoutId: NodeJS.Timeout;
      if (vProduct) {
        setActiveVariation(vProduct);
      } else {
        // Debounce setting activeVariation to null to prevent flickering
        timeoutId = setTimeout(() => {
          setActiveVariation(null);
        }, 150); // Small delay before setting to null
      }

      // Clean up timeout on unmount or re-render
      return () => clearTimeout(timeoutId);
    }
  }, [attribute, product]);


  useEffect(() => { }, [attribute]);

  const { data, loading, error } = useQuery(GET_PRICE_FLUCTUATION_NOTICE);
  const isPriceFluctuation = data?.topBarPriceFluctuationNotice || false;

  const [highestPrice, setHighestPrice] = useState<string>('');

  useEffect(() => {
    if (product.type === "VARIABLE") {
      const variations = (product as VariableProduct).variations?.nodes as unknown as ProductVariation[];

      if (variations && variations.length > 0) {
        // Convert price strings to numbers by removing currency symbol and parsing
        const prices = variations.map(v =>
          parseFloat(v.price?.replace(/[^0-9.]/g, '') || "0")
        );

        const maxPrice = Math.max(...prices);
        const variationWithMaxPrice = variations.find(v =>
          v.price && parseFloat(v.price.replace(/[^0-9.]/g, '')) === maxPrice
        );

        if (variationWithMaxPrice) {
          setHighestPrice(variationWithMaxPrice.price || "");
        }
      }
    }
  }, [product]); // Log the variations to inspect their structure

  // Compute availability message for unavailable combinations
  const availabilityMessage = useMemo(() => {
    if (
      product.type !== "VARIABLE" ||
      (activeVariation && activeVariation?.stockStatus === "IN_STOCK") ||
      !product.attributes?.nodes ||
      product.attributes.nodes.length <= 1
    ) {
      return null;
    }

    // Find available alternatives for each attribute
    const availabilityMessages: Array<{ attr: ProductAttribute; availableValues: string[] }> = [];

    product.attributes.nodes.forEach((attr: ProductAttribute) => {
      const selectedValue = activeAttr(attr)?.val;
      if (!selectedValue) return;

      // Get all variations that match the other attributes but have different values for this attribute
      const otherAttributes = attribute.filter((a) => a.name !== attr.name);
      const availableValues = new Set<string>();

      (product as VariableProduct).variations?.nodes.forEach((v: ProductVariation) => {
        // Check if this variation matches all other selected attributes
        const matchesOtherAttributes = otherAttributes.every((selectedAttr) => {
          return v.attributes?.nodes.some(
            (node: any) => node.name === selectedAttr.name && node.value === selectedAttr.val
          );
        });

        // If it matches other attributes and is in stock, get the value for this attribute
        if (matchesOtherAttributes && v.stockStatus === "IN_STOCK") {
          const attrValue = (v.attributes?.nodes as unknown as VariationAttribute[])?.find(
            (node: VariationAttribute) => node.name === attr.name
          )?.value;
          if (attrValue && attrValue !== selectedValue) {
            // Get the display name for this value
            const displayName = (product as any)[
              `allPa${attr?.label?.split(" ").join("")}`
            ]?.nodes.find((node: PaCapacity) => node.slug === attrValue)?.name;
            if (displayName) {
              availableValues.add(displayName);
            }
          }
        }
      });

      if (availableValues.size > 0) {
        availabilityMessages.push({
          attr,
          availableValues: Array.from(availableValues),
        });
      }
    });

    // Return message for the first attribute with available alternatives
    if (availabilityMessages.length > 0) {
      const { attr, availableValues } = availabilityMessages[0];
      return { attr, availableValues };
    }

    return null;
  }, [product, activeVariation, attribute, activeAttr]);

  return (
    <>
      {isPriceFluctuation && (
        <div className="p-4 mb-2 bg-red-400 text-white text-base rounded-md">
          Prices are being updated. For current pricing, please contact us on WhatsApp 0777555665 / 0777988665.
          Updated prices will be on the site soon!
        </div>
      )}
      {/* <div className="flex gap-1 text-sm text-gray-500">
        <Link
          href={`/${brand?.slug}`}
          target="_blank"
          className="bg-primaryColor rounded-xl px-2.5 py-1 text-white"
        >
          {brand?.name}
        </Link>
      </div> */}

      {/* <div className="text-2xl font-medium md:text-3xl">{product.name}</div> */}
      {product.price && (
        <div className="text-sm text-primaryColor flex items-center gap-1 mt-2">
          <BanknotesIcon className="w-4 h-4" />
          <span className="text-gray-500 font-medium">Cash Price</span>
        </div>
      )}
      {/* Commented */}
      {product.type === "VARIABLE" && activeVariation ? (
        <div>
          <div className="flex flex-wrap items-center gap-4 text-base font-bold text-black-600 md:text-2xl">
            <span
              dangerouslySetInnerHTML={{ __html: activeVariation.price }}
            />
            {!!activeVariation.salePrice &&
              activeVariation.salePrice !== activeVariation.regularPrice && (
                <span className="text-red-400 line-through md:text-xl">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: activeVariation.regularPrice,
                    }}
                  />
                </span>
              )}

            {/* {activeVariation?.stockStatus == "IN_STOCK" && activeVariation?.stockQuantity &&
              activeVariation?.stockQuantity <= 2 && (
                <div className="mb-1 w-max rounded-full bg-yellow-200 px-3 py-1.5 text-center text-xs font-medium text-gray-800">
                  Low Stock
                </div>
              )} */}

            {product.type === "VARIABLE" && activeVariation &&
              activeVariation?.stockStatus !== "IN_STOCK" && (
                <div className="mb-1 w-max rounded-full bg-red-200 px-4 py-1.5 text-center text-xs font-medium text-gray-800">
                  Sold Out
                </div>
              )}

            {product.type === "VARIABLE" && !activeVariation && (
              <div className="mb-1 w-max rounded-full bg-gray-600 px-4 py-1.5 text-center text-xs font-medium text-white">
                Not Available
              </div>
            )}

            <div className="flex flex-wrap items-center text-xs text-gray-400">
              <span>or pay in 3 x Rs</span>
              <span className="font-semibold mx-1">
                {(
                  parseFloat(
                    ((activeVariation.salePrice === "₨&nbsp;0.00" || activeVariation.salePrice === null) && (activeVariation.regularPrice === "₨&nbsp;0.00" || activeVariation.regularPrice === null)
                      ? highestPrice
                      : (activeVariation.salePrice || activeVariation.regularPrice) || "0")
                      .toString()
                      .replace(/[^\d.]/g, "")
                  ) / 88 * 100 / 3
                ).toFixed(2)}
              </span>
              <span>with</span>
              <span className="ml-1 inline-block">
                <Image src={koko} alt="KOKO" className="inline-block w-12 h-auto" />
              </span>
            </div>

          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 text-base font-bold text-gray-600 md:text-2xl">

          <div className="flex flex-col gap-2">
            {!!product.price ? (
              <span dangerouslySetInnerHTML={{ __html: product.price || "" }} />
            ) : (
              <span>Can not be purchased now</span>
            )}
          </div>

          {product.salePrice &&
            product.salePrice !== product.regularPrice && (
              <div>
                <span className="text-red-400 line-through md:text-xl">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: product.regularPrice || "",
                    }}
                  />
                </span>

              </div>
            )}


          {/* {product.stockStatus == "IN_STOCK" &&
            product?.stockQuantity &&
            product?.stockQuantity <= 2 && (
              <div className="mb-1 w-max rounded-full bg-yellow-200 px-4 py-1 text-center text-xs text-gray-800 md:text-sm">
                Low Stock
              </div>
            )} */}

          {product.type === "SIMPLE" && product.stockStatus !== "IN_STOCK" && (
            <div className="w-max rounded-full bg-red-200 px-4 py-1.5 text-center text-xs font-medium text-gray-800">
              Sold Out
            </div>
          )}

          <div className="flex flex-wrap items-center text-xs text-gray-400">
            <span>or pay in 3 x Rs</span>
            <span className="font-semibold mx-1">
              {(
                parseFloat(
                  (product.price || "0")
                    .toString()
                    .replace(/[^\d.]/g, "")
                ) / 88 * 100 / 3
              ).toFixed(2)}
            </span>
            <span>with</span>
            <span className="ml-1 inline-block">
              <Image src={koko} alt="KOKO" className="inline-block w-12 h-auto" />
            </span>
          </div>

        </div>
      )}

      {/* Commented */}

      <h1 className="text-2xl text-primaryColor font-bold md:text-3xl">{product.name}</h1>
      <div className="flex items-center gap-1 text-sm font-medium text-gray-500">
        <Link
          href={`/${brand?.slug}`}
          target="_blank"
          className="text-gray"
        >
          {brand?.name}
        </Link>


      </div>

      <div className="flex items-center gap-2">
        {/* Commented */}
        {/* {product.type === "VARIABLE" && activeVariation ? (
          <div>
            <div className="flex flex-wrap items-center gap-4 py-2 text-base font-medium text-gray-600 md:text-xl">
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
          <div className="flex flex-wrap items-center gap-2 py-2 text-base font-medium text-gray-600 md:text-xl">
            {!!product.price ? (
              <span dangerouslySetInnerHTML={{ __html: product.price || "" }} />
            ) : (
              <span>Can not be purchased now</span>
            )}
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
        )} */}

        {/* Commented */}

        {/* Sold Out Badge */}

        <div>

          {/* Commented */}
          {/* {product.type === "SIMPLE" && product.stockStatus !== "IN_STOCK" && (
            <div className="w-max rounded-full bg-red-200 px-4 py-1.5 text-center text-xs font-medium text-gray-800">
              Sold Out
            </div>
          )}

          {product.type === "VARIABLE" && activeVariation &&
            activeVariation?.stockStatus !== "IN_STOCK" && (
              <div className="mb-1 w-max rounded-full bg-red-200 px-4 py-1.5 text-center text-xs font-medium text-gray-800">
                Sold Out
              </div>
            )}

          {product.type === "VARIABLE" && !activeVariation && (
            <div className="mb-1 w-max rounded-full bg-gray-600 px-4 py-1.5 text-center text-xs font-medium text-white">
              Not Available
            </div>
          )} */}
          {/* Commented */}

          {/* In Stock Badge */}
          {/* Removed low stock and INSTOCK badge October 14 */}

          {/* {product.type === "VARIABLE" &&
            activeVariation?.stockStatus == "IN_STOCK" &&
            ((activeVariation?.stockQuantity &&
              activeVariation?.stockQuantity >= 3) ||
              (!activeVariation.stockQuantity &&
                activeVariation?.stockStatus === "IN_STOCK")) && (
              <div className="w-max rounded-full bg-green-200 px-4 py-1.5 text-center text-xs font-medium text-gray-800">
                In Stock
              </div>
            )}

          {product.type === "SIMPLE" &&
            product.stockStatus === "IN_STOCK" &&
            ((product?.stockQuantity && product?.stockQuantity >= 3) ||
              (!product.stockQuantity &&
                product.stockStatus === "IN_STOCK")) && (
              <div className="w-max rounded-full bg-green-200 px-4 py-1.5 text-center text-xs font-medium text-gray-800">
                In Stock
              </div>
            )} */}

          {/* Removed low stock and INSTOCK badge October 14 */}
          {/* Low Stock Badge */}
          {/* {product.type === "VARIABLE" &&
            activeVariation?.stockStatus == "IN_STOCK" &&
            activeVariation?.stockQuantity &&
            activeVariation?.stockQuantity <= 2 && (
              <div className="mb-1 w-max rounded-full bg-yellow-200 px-3 py-1.5 text-center text-xs font-medium text-gray-800">
                Low Stock
              </div>
            )}

          {product.type === "SIMPLE" &&
            product.stockStatus == "IN_STOCK" &&
            product?.stockQuantity &&
            product?.stockQuantity <= 2 && (
              <div className="mb-1 w-max rounded-full bg-yellow-200 px-4 py-1 text-center text-xs text-gray-800 md:text-sm">
                Low Stock
              </div>
            )} */}
        </div>
      </div>

      {/* <div className="">
        {warrantyType && warrantyPeriod && (
          <div className="items-left flex w-full flex-col flex-wrap gap-2 py-2 text-xs text-gray-500 md:text-sm">
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
      </div> */}

      {/* {product.shortDescription && <ProductDescription product={product} />} */}

      {product.type === "VARIABLE" && (
        <div id="product-attributes" className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {product.attributes?.nodes.map(
            (attr: ProductAttribute, index: number) => (
              <div key={index} className="flex flex-col w-full text-gray-500">
                <div className="flex items-center gap-1 mb-2 text-sm h-6">
                  <span className="text-primaryColor flex items-center gap-1">
                    <AttributeIcon name={attr?.name || ""} className="w-4 h-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">{attr.label}:</span>
                  </span>
                </div>

                <Listbox
                  value={activeAttr(attr)?.val || ""}
                  onChange={(value) => {
                    setAttribute(attr, value || "");
                    setLastClickedAttribute(attr.name || null);
                  }}
                >
                  <div className="relative">
                    <Listbox.Button className="relative w-full cursor-default rounded-2xl border border-gray-300 bg-white h-11 pl-4 pr-10 text-left text-sm focus:border-primaryColor focus:outline-none focus:ring-2 focus:ring-primaryColor focus:ring-opacity-50 flex items-center">
                      <span className="block truncate">
                        {(() => {
                          const selectedOption = activeAttr(attr)?.val;
                          if (!selectedOption) {
                            return `Select ${attr.label}`;
                          }
                          const displayName = (product as any)[
                            `allPa${(attr?.label as unknown as "Capacity")
                              ?.split(" ")
                              .join("")}`
                          ]?.nodes.find(
                            (node: PaCapacity) => node.slug === selectedOption
                          )?.name || "OPTION";
                          return displayName;
                        })()}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-2xl bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {attr.options
                          ?.slice()
                          .sort((a, b) => {
                            // Extract first number from each option (e.g., "12gb-256gb" -> 12)
                            const numA = a ? parseInt(a.match(/\d+/)?.[0] || "0", 10) : 0;
                            const numB = b ? parseInt(b.match(/\d+/)?.[0] || "0", 10) : 0;
                            return numA - numB; // Ascending order: 12, 16, 24
                          })
                          .map((option, optionIndex) => {
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

                            const isSelected = activeAttr(attr)?.val === option;

                            // Check if current combination is unavailable
                            const currentCombinationUnavailable = !activeVariation || activeVariation.stockStatus !== "IN_STOCK";

                            // Check if this option would be available when combined with other selected attributes
                            // Don't show "available" on the last clicked attribute
                            let isAvailable = false;
                            if (currentCombinationUnavailable && !isSelected && lastClickedAttribute !== (attr.name || null)) {
                              // Get all other selected attributes
                              const otherAttributes = attribute.filter((a) => a.name !== attr.name);

                              // Check if there's a variation that matches this option + other selected attributes and is in stock
                              const availableVariation = (product as VariableProduct).variations?.nodes.find((v: ProductVariation) => {
                                // Check if this variation has this option for current attribute
                                const hasThisOption = v.attributes?.nodes.some(
                                  (node: any) => node.name === attr.name && node.value === option
                                );

                                // Check if this variation matches all other selected attributes
                                const matchesOtherAttributes = otherAttributes.every((selectedAttr) => {
                                  return v.attributes?.nodes.some(
                                    (node: any) => node.name === selectedAttr.name && node.value === selectedAttr.val
                                  );
                                });

                                return hasThisOption && matchesOtherAttributes && v.stockStatus === "IN_STOCK";
                              });

                              isAvailable = !!availableVariation;
                            }

                            const displayName = (product as any)[
                              `allPa${(attr?.label as unknown as "Capacity")
                                ?.split(" ")
                                .join("")}`
                            ]?.nodes.find(
                              (node: PaCapacity) => node.slug === option
                            )?.name || "OPTION";

                            let optionText = displayName;
                            if (allOutOfStock) {
                              optionText += " (Out of Stock)";
                            } else if (isAvailable) {
                              optionText += " (In Stock)";
                            }

                            return (
                              <Listbox.Option
                                key={optionIndex}
                                value={option || ""}
                                disabled={allOutOfStock}
                                className={({ active, disabled }) =>
                                  twMerge(
                                    "relative cursor-default select-none py-2 pl-10 pr-4",
                                    active && !disabled && "bg-primaryColor/10 text-primaryColor",
                                    disabled && "text-gray-400 cursor-not-allowed opacity-50",
                                    isSelected && "font-medium"
                                  )
                                }
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span
                                      className={twMerge(
                                        "block truncate",
                                        selected ? "font-medium" : "font-normal",
                                        allOutOfStock && "text-gray-400"
                                      )}
                                    >
                                      {optionText}
                                    </span>
                                    {selected ? (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primaryColor">
                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Listbox.Option>
                            );
                          })}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>
            )
          )}
        </div>
      )}
      <AnimatePresence>
        {availabilityMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0, paddingTop: 0, paddingBottom: 0 }}
            animate={{ opacity: 1, y: 0, height: '2rem', paddingTop: '.65rem', paddingBottom: '.65rem' }}
            exit={{ opacity: 0, y: -10, height: 0, paddingTop: 0, paddingBottom: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ overflow: 'hidden' }}
            className="text-sm text-gray-600"
          >
            <span className="font-medium">
              Unavailable.
            </span>{" "}
            <span className="">
              In-stock
              <span className="ml-1 font-medium">{availabilityMessage.attr.label?.toLowerCase()}:
                <span className="ml-1 text-primaryColor font-medium">
                  {availabilityMessage.availableValues.join(", ")}
                </span>


              </span>
            </span>
          </motion.div >
        )}
      </AnimatePresence >

      <ProductAddToCart product={product} variation={activeVariation} />

      <ProductDescription product={product} />

      <div className="flex w-full flex-wrap items-center gap-1 pt-2 text-sm text-gray-500 md:text-base">
        <div className="py-2 text-sm">Category :</div>
        {product.productCategories?.edges.map(
          (category: any, index: number) => (
            <Link
              href={`/collections/${category.node.slug}`}
              key={index}
              className="border border-primaryColor inline-block min-w-max 
              rounded-md text-black px-3 py-1 text-xs md:text-sm bg-white"
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
