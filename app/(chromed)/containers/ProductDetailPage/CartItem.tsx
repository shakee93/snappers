import {
  CartItem,
  SimpleProduct,
  VariableProduct,
} from "@/graphql/types/graphql";
import Image from "next/image";
import Link from "next/link";
import LineOrCartPriceLabel from "@/app/components/LineOrCartPriceLabel";
import NcInputNumber from "@/components/NcInputNumber";
import { useCart } from "@/context/CartProvider";
import useProductLink from "@/hooks/useProductLink";
import { Fragment } from "react";
import AttributeIcon from "@/app/components/AttributeIcon";
import { isLineItemFree } from "@/lib/cartLinePricing";
import { getCartLineStockCap } from "@/lib/cartLineStockCap";

const CartItemProduct = ({
  cartItem,
  index,
}: {
  cartItem: CartItem;
  index: number;
}) => {
  const { product, quantity, variation, key, total, subtotal } = cartItem;
  const lineIsFree = isLineItemFree(total, subtotal);

  const { removeFromCart, updateCart } = useCart();
  const link = useProductLink(product?.node);

  if (!product?.node) {
    return <p>No product found. {JSON.stringify(cartItem)} </p>;
  }

  const {
    name,
    image,
    price,
    slug,
    salePrice,
    type,
    regularPrice,
  }: SimpleProduct & VariableProduct = product.node;

  const { maxQty } = getCartLineStockCap(cartItem);
  const maxQtyProp = maxQty ?? undefined;


  return (
    <div className="relative flex py-8 first:pt-0 last:pb-0 sm:py-10 xl:py-12">
      <div className="relative h-36 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:w-32">
        <Image
          width={100}
          height={100}
          style={{ objectFit: "contain" }}
          src={product.node.type === "VARIABLE"
            ? variation?.node.image?.sourceUrl || ""
            : product.node.image?.sourceUrl || product.node.image?.mediaItemUrl || ""}
          alt={name || ""}
          className="h-full w-full object-contain object-center"
        />
        <Link href={`${link}`} className="absolute inset-0"></Link>
      </div>

      <div className="ml-3 flex flex-1 flex-col sm:ml-6">
        <div>
          <div className="flex justify-between">
            <div className="flex-[1.5]">
              <h3 className="text-base font-semibold">
                <Link href={`${link}`}>{name}</Link>
              </h3>

              {type === "VARIABLE" && (
                <div className="mt-1.5 flex text-sm text-slate-600 sm:mt-2.5 dark:text-slate-300">
                  {type === "VARIABLE" && (
                    <div className="my-1 text-sm text-slate-500 dark:text-slate-400">
                      {variation?.attributes?.map((attr: any, index: number) => (
                        <Fragment key={index}>
                          <div className="flex items-center gap-1">
                            <AttributeIcon
                              name={attr?.name || ""}
                              className="w-4"
                            />{" "}
                            <span key={attr?.value}>
                              {attr?.displayValue || attr?.value}
                            </span>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="relative mt-3 flex w-full justify-between sm:hidden">
                <select
                  name="qty"
                  id="qty"
                  className="form-select relative z-10 rounded-md border-slate-200 py-1 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                </select>
                <LineOrCartPriceLabel
                  lineTotal={total}
                  lineSubtotal={subtotal}
                  contentClass="py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium h-full"
                  catalogPrice={
                    type === "VARIABLE" ? variation?.node.price : price
                  }
                  catalogSalePrice={
                    type === "VARIABLE"
                      ? variation?.node.regularPrice
                      : salePrice
                  }
                />
              </div>
            </div>

            <div className="relative hidden text-center sm:block">
              <NcInputNumber
                onChange={async (q) => {
                  await updateCart(key, q);
                }}
                defaultValue={quantity || 1}
                max={maxQtyProp}
                className="relative z-10"
                disabled={lineIsFree}
              />
            </div>

            <div className="hidden flex-1 justify-end sm:flex">
              <LineOrCartPriceLabel
                lineTotal={total}
                lineSubtotal={subtotal}
                catalogPrice={
                  type === "VARIABLE" ? variation?.node.price : price
                }
                catalogSalePrice={
                  type === "VARIABLE"
                    ? variation?.node.regularPrice
                    : regularPrice
                }
                className="mt-0.5 lg:flex-col"
              />
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between pt-4 text-sm">
          {/*{stockQuantity && stockQuantity > 0*/}
          {/*  ? renderStatusInstock()*/}
          {/*  : renderStatusSoldout()*/}
          {/*}*/}

          <div></div>

          <button
            onClick={(e) => removeFromCart([key])}
            className="text-primary-6000 hover:text-primary-500 relative z-10 mt-3 flex items-center text-sm font-medium"
          >
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItemProduct;
