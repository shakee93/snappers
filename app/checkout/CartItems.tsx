import React from "react";
import Image from "next/image";
import Link from "next/link";
import NcInputNumber from "components/NcInputNumber";
import Prices from "components/Prices";
import { Fragment } from "react";
import AttributeIcon from "@/app/components/AttributeIcon";
import { VariableProduct, PaCapacity } from "@/graphql/types/graphql";

export interface CartItem {
  extraData?: null | any;
  key: string;
  product: CartItemProduct;
  quantity: number;
  subtotal: string;
  subtotalTax: string;
  total: string;
  variation: null | any;
  type: null | any;
}

export interface CartItemProduct {
  node: CartItemProductNode;
}

export interface CartItemProductNode {
  id: number;
  name: string;
  price: number;
  slug: string;
  type: string;
  image: {
    sourceUrl: string;
  };
  terms: string[];
  brands: {
    nodes: any;
  };
}

interface CartItemsProps {
  item: CartItem;
  index: number;
  onQuantityChange: (key: string, quantity: number) => void;
  onRemove: (keys: string[]) => void;
}

const cartItems: React.FC<CartItemsProps> = ({
  item,
  index,
  onQuantityChange,
  onRemove,
}) => {
  const { product, quantity, key, subtotal, total, variation } = item;
  const { node } = product || {};
  const { name, price, image, terms, brands, type } = node || {};
  const brandSlug = brands?.nodes[0]?.slug;

  return (
    <div key={index} className="relative flex py-7 first:pt-0 last:pb-0">
      <div className="relative h-36 w-24 sm:w-28 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
        <Image
          fill
          style={{ objectFit: "cover" }}
          src={image?.sourceUrl}
          alt={name}
          className="h-full w-full object-contain object-center"
        />
        <Link
          href={`/${brandSlug}/${product.node.slug}`}
          className="absolute inset-0"
        ></Link>
      </div>

      <div className="ml-3 sm:ml-6 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between ">
            <div className="flex-[1.5] ">
              <h3 className="text-base font-semibold">
                <Link href={`/${brandSlug}/${product.node.slug}`}>{name}</Link>
              </h3>

              {type === "VARIABLE" && (
                <div className="mt-1.5 sm:mt-2.5 flex text-sm text-slate-600 dark:text-slate-300">
                  {type === "VARIABLE" && (
                    <div className="my-1 text-sm text-slate-500 dark:text-slate-400">
                      {variation?.attributes?.map(
                        (attr: any, index: number) => (
                          <Fragment key={index}>
                            <div className="flex items-center gap-1">
                              <AttributeIcon
                                name={attr?.name || ""}
                                className="w-4"
                              />{" "}
                              <span key={attr?.value}>
                                {" "}
                                {
                                  (product.node as unknown as VariableProduct)[
                                    `allPa${attr?.label as unknown as "Capacity"
                                    }`
                                  ]?.nodes.find(
                                    (node: PaCapacity) =>
                                      node.slug === attr?.value
                                  )?.name
                                }
                              </span>
                            </div>
                          </Fragment>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-3 flex justify-between w-full sm:hidden relative">
                <select
                  name="qty"
                  id="qty"
                  className="form-select text-sm rounded-md py-1 border-slate-200 dark:border-slate-700 relative z-10 dark:bg-slate-800 "
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                </select>
                <Prices
                  contentClass="py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium h-full"
                  price={price}
                />
              </div>
            </div>

            <div className="hidden flex-1 sm:flex justify-end">
              <Prices
                price={type === 'VARIABLE' ? variation?.node.price : price}
                className="mt-0.5" />
            </div>
          </div>
        </div>

        <div className="flex mt-auto pt-4 items-end justify-between text-sm">
          <div className="hidden sm:block text-center relative">
            {/* <NcInputNumber className="relative z-10" /> */}
            <NcInputNumber
              onChange={async (quantity) => {
                await onQuantityChange(key, quantity);
              }}
              defaultValue={quantity || 1}
              className="relative z-10"
            />
          </div>
          <span
            className="cursor-pointer relative z-10 flex items-center mt-3 font-medium text-primary-6000 hover:text-primary-500 text-sm"
            onClick={async () => {
              await onRemove([key]);
            }}
          >
            Remove
          </span>
        </div>
      </div>
    </div>
  );
};

export default cartItems;
