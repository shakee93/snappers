import Image from "next/image";
import Prices from "@/components/global/ui/Prices";
import Link from "next/link";
import React, { Fragment } from "react";
import {
  ProductVariation,
  SimpleProduct,
  VariableProduct,
  VariationAttribute,
} from "@/graphql/types/graphql";
import AttributeIcon from "@/components/global/primitives/AttributeIcon";
import { getCategoryPath } from "@/lib/productUrl";

const AddedToCart = ({
  quantity,
  product,
  variation,
}: {
  product: SimpleProduct & VariableProduct;
  variation?: ProductVariation;
  quantity: number;
}) => {
  return (
    <div className="flex">
      <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white">
        <Image
          style={{ objectFit: "contain" }}
          src={
            product.type === "VARIABLE"
              ? variation?.image?.sourceUrl || ""
              : product.image?.sourceUrl || product.image?.mediaItemUrl || ""
          }
          alt={product.name || ""}
          width={305}
          height={305}
          className="h-full w-full object-cover object-center"
        />

        {/* <Image
                style={{ objectFit: 'cover' }}
                src={product.image?.sourceUrl || product.image?.mediaItemUrl || ''}
                alt={product.name || ''}
                width={280}
                height={305}
                className="h-full w-full object-cover object-center"
            /> */}
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="grid justify-start ">
            <div className=" min-w-0">
              <h3 className="text-base font-medium ">{product.name}</h3>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {/* Check if product.productCategories exists */}

                {product.type === "VARIABLE" && (
                  <div className="my-1 text-sm text-slate-500 dark:text-slate-400">
                    {variation?.attributes?.nodes.map(
                      (attr: VariationAttribute, index) => (
                        <Fragment key={index}>
                          <div className="flex items-center gap-1">
                            <AttributeIcon
                              name={attr?.name || ""}
                              className="w-4"
                            />{" "}
                            <span key={attr?.value}>
                              {" "}
                              {attr?.value}
                            </span>
                          </div>
                        </Fragment>
                      )
                    )}
                  </div>
                )}

                {/* {product.productCategories && (
                                product.productCategories.edges ? (
                                    product.productCategories.edges.map((category: any, index: number) => (
                                        <Link
                                            href={getCategoryPath(category.node.slug ?? "")}
                                            key={index}
                                            className="bg-primary-100 inline-block py-1 px-2 text-xs rounded-3xl"
                                        >
                                            {category.node.name}
                                        </Link>
                                    ))
                                ) : (
                                    product.productCategories.nodes &&
                                    product.productCategories.nodes.map((category: any, index: number) => (
                                        <Link
                                            href={getCategoryPath(category.slug ?? "")}
                                            key={index}
                                            className="bg-primary-100 inline-block py-1 px-2 text-xs rounded-3xl"
                                        >
                                            {category.name}
                                        </Link>
                                    ))
                                )
                            )} */}
              </div>
            </div>
            <div className="flex mt-2">
              <Prices
                salePrice={
                  product.type === "VARIABLE"
                    ? variation?.regularPrice
                    : product.regularPrice
                }
                price={
                  product.type === "VARIABLE" ? variation?.price : product.price
                }
                className="mt-0.5 flex justify-start"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-1 items-end justify-between text-sm">
          <p className="text-gray-500 dark:text-slate-400 ml-2 mt-2 font-medium">
            Qty: {quantity}
          </p>
          <div className="flex">
            <Link
              href={"/cart"}
              className="font-medium text-primary-600 dark:text-primary-500 "
            >
              View cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddedToCart;
