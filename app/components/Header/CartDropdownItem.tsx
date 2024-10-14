import {
  CartItem,
  PaCapacity,
  SimpleProduct,
  VariableProduct,
} from "@/graphql/types/graphql";
import useProductLink from "@/hooks/useProductLink";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useState } from "react";
import AttributeIcon from "@/app/components/AttributeIcon";
import Prices from "@/app/components/Prices";
import { useCart } from "@/context/CartProvider";

interface CartDropdownItemProps {
  item: CartItem;
  close: () => void;
}

const CartDropdownItem = ({ item, close }: CartDropdownItemProps) => {
  const { removeFromCart } = useCart();

  const { product, variation, quantity, key } = item;

  // State to manage the loading indicator
  const [isLoading, setIsLoading] = useState(false);

  // @ts-ignore
  const {
    name,
    image,
    price,
    slug,
    salePrice,
    type,
    stockQuantity,
    variations,
    regularPrice,
    brands,
  }: SimpleProduct & VariableProduct = product?.node;

  const link = useProductLink(product?.node);

  if (!product?.node) {
    return null;
  }

  const handleRemoveFromCart = async () => {
    setIsLoading(true); // Start loading
    await removeFromCart([key]);
    setIsLoading(false); // End loading
  };

  return (
    <div className="flex py-5 last:pb-0">
      <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
        <Image
          fill
          style={{ objectFit: "cover" }}
          layout="fill"
          src={image?.sourceUrl || ""}
          alt={name || ""}
          className="h-full w-full object-contain object-center"
        />
        <Link onClick={close} className="absolute inset-0" href={link} />
      </div>

      <div className="ml-3 sm:ml-6 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between">
            <div className="flex-[1.5] ">
              <h3 className="text-base font-semibold">
                <Link href={link}>{name}</Link>
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
                                {attr?.value}{" "}
                                {
                                  (product.node as unknown as VariableProduct)[
                                    `allPa${
                                      attr?.label as unknown as "Capacity"
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
            </div>

            <div className="hidden flex-1 sm:flex justify-end">
              <div className="grid">
                <Prices
                  price={type === "VARIABLE" ? variation?.node.price : price}
                  className="mt-0.5"
                />
                <div className="flex mt-auto pt-4 items-end justify-end text-sm">
                  {isLoading ? (
                    <span className="relative z-10 flex items-center mt-3 font-medium text-gray-500 text-sm">
                      Removing...
                    </span>
                  ) : (
                    <span
                      className="cursor-pointer relative z-10 flex items-center mt-3 font-medium text-red-600 hover:text-text-800 text-sm"
                      onClick={handleRemoveFromCart}
                    >
                      Remove
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDropdownItem;
